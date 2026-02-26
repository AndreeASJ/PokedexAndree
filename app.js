/**
 * Pokédex – fetches Pokémon list from PokeAPI, displays cards with multiple sprites,
 * and shows full details (generation, number, attacks, abilities) in a modal.
 * Search filters by name (client-side).
 */

const POKE_API = 'https://pokeapi.co/api/v2';
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// Generation bounds by National Dex number (inclusive)
const GENERATIONS = [
  { name: 'I', min: 1, max: 151 },
  { name: 'II', min: 152, max: 251 },
  { name: 'III', min: 252, max: 386 },
  { name: 'IV', min: 387, max: 493 },
  { name: 'V', min: 494, max: 649 },
  { name: 'VI', min: 650, max: 721 },
  { name: 'VII', min: 722, max: 809 },
  { name: 'VIII', min: 810, max: 905 },
  { name: 'IX', min: 906, max: 9999 },
];

const state = {
  list: [],      // { name, url, id }[]
  details: new Map(), // id -> full API response
  searchQuery: '',
};

const el = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  grid: document.getElementById('grid'),
  empty: document.getElementById('empty'),
  emptyQuery: document.getElementById('empty-query'),
  count: document.getElementById('count'),
  search: document.getElementById('search'),
  modal: document.getElementById('modal'),
  modalContent: document.getElementById('modal-content'),
  modalClose: document.getElementById('modal-close'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
};

function getGeneration(id) {
  const n = Number(id);
  const gen = GENERATIONS.find(g => n >= g.min && n <= g.max);
  return gen ? `Gen ${gen.name}` : '—';
}

function getIdFromUrl(url) {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? match[1] : null;
}

function spriteUrl(id, variant = '') {
  if (variant === 'official') {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
  return `${SPRITE_BASE}/${variant ? variant + '/' : ''}${id}.png`;
}

function showError(message) {
  const msgEl = document.getElementById('error-message');
  const retryBtn = document.getElementById('retry-btn');
  if (msgEl) msgEl.textContent = message;
  if (retryBtn) {
    retryBtn.classList.remove('hidden');
    retryBtn.onclick = retryInit;
  }
  el.error.classList.remove('hidden');
  el.loading.classList.add('hidden');
}

function hideError() {
  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) retryBtn.classList.add('hidden');
  el.error.classList.add('hidden');
}

const FIRST_PAGE_SIZE = 300;
const FETCH_TIMEOUT_MS = 12000;

function parsePageResults(data) {
  const out = [];
  for (const p of data.results || []) {
    const id = getIdFromUrl(p.url);
    if (id) out.push({ name: p.name, url: p.url, id });
  }
  return { list: out, next: data.next };
}

async function fetchOnePage(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/** Load first page only – so we can show Pokémon quickly even on slow/failing API. */
async function fetchFirstBatch() {
  const url = `${POKE_API}/pokemon?limit=${FIRST_PAGE_SIZE}`;
  const data = await fetchOnePage(url);
  return parsePageResults(data);
}

/** Load remaining pages in background; append to state.list and re-render. */
async function fetchRemainingInBackground(nextUrl) {
  let url = nextUrl;
  while (url) {
    try {
      const data = await fetchOnePage(url);
      const { list, next } = parsePageResults(data);
      state.list.push(...list);
      url = next;
      renderGrid();
    } catch (_) {
      break;
    }
  }
}

function getFilteredList() {
  const q = state.searchQuery.trim().toLowerCase();
  if (!q) return state.list;
  return state.list.filter(p => p.name.toLowerCase().includes(q));
}

function renderCard(p) {
  const id = p.id;
  const mainSprite = spriteUrl(id);
  const officialSprite = spriteUrl(id, 'official');
  const types = []; // will be filled when we have details; for list we can leave empty or fetch later

  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card';
  card.dataset.id = id;
  card.innerHTML = `
    <span class="card-num">#${id.padStart(3, '0')}</span>
    <div class="card-sprites" id="card-sprites-${id}">
      <img class="main-sprite" src="${mainSprite}" alt="" loading="lazy" onerror="this.style.display='none'" />
      <img src="${officialSprite}" alt="" loading="lazy" onerror="this.style.display='none'" />
    </div>
    <span class="card-name">${escapeHtml(p.name)}</span>
    <div class="card-types" id="types-${id}"></div>
  `;
  card.addEventListener('click', () => openDetail(id));
  return card;
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderGrid() {
  const filtered = getFilteredList();
  el.count.textContent = state.searchQuery.trim()
    ? `${filtered.length} of ${state.list.length}`
    : state.list.length;
  el.empty.classList.add('hidden');
  el.emptyQuery.textContent = '';

  if (filtered.length === 0) {
    el.grid.innerHTML = '';
    if (state.searchQuery.trim()) {
      el.emptyQuery.textContent = state.searchQuery.trim();
      el.empty.classList.remove('hidden');
    }
    return;
  }

  el.grid.innerHTML = '';
  for (const p of filtered) {
    el.grid.appendChild(renderCard(p));
  }

  // Optional: lazy-load types for visible cards (batch from API or from cache)
  loadTypesForVisibleCards(filtered.slice(0, 50));
}

async function loadTypesForVisibleCards(visible) {
  for (const p of visible) {
    const typesEl = document.getElementById(`types-${p.id}`);
    const spritesEl = document.getElementById(`card-sprites-${p.id}`);
    if (!typesEl || typesEl.children.length) continue;
    try {
      const data = await fetchJson(`${POKE_API}/pokemon/${p.id}`);
      const types = (data.types || []).map(t => t.type?.name).filter(Boolean);
      typesEl.innerHTML = types.map(t => `<span class="type-pill type-${t}">${t}</span>`).join('');
      const homeFront = data.sprites?.other?.home?.front_default;
      if (homeFront && spritesEl && !spritesEl.querySelector('.sprite-3d')) {
        const img = document.createElement('img');
        img.src = homeFront;
        img.alt = '';
        img.loading = 'lazy';
        img.className = 'sprite-3d';
        img.onerror = () => { img.style.display = 'none'; };
        spritesEl.appendChild(img);
      }
    } catch (_) {
      // ignore per-card errors
    }
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

async function openDetail(id) {
  let data = state.details.get(id);
  if (!data) {
    try {
      data = await fetchJson(`${POKE_API}/pokemon/${id}`);
      state.details.set(id, data);
    } catch (e) {
      showError('Could not load Pokémon details.');
      return;
    }
  }

  const sprites = data.sprites || {};
  const home = sprites.other?.home;
  const spriteEntries = [
    [sprites.front_default, false],
    [sprites.back_default, false],
    [sprites.front_shiny, false],
    [sprites.other?.['official-artwork']?.front_default, false],
    [home?.front_default, true],
    [home?.front_shiny, true],
  ].filter(([src]) => src);
  const spriteMarkup = spriteEntries
    .map(([src, is3d]) => `<img src="${src}" alt="" class="${is3d ? 'sprite-3d' : ''}" />`)
    .join('');

  const abilities = (data.abilities || []).map(a => a.ability?.name).filter(Boolean);
  const moves = (data.moves || []).slice(0, 24).map(m => m.move?.name).filter(Boolean);
  const types = (data.types || []).map(t => t.type?.name).filter(Boolean);

  el.modalContent.innerHTML = `
    <div class="modal-title-row">
      <div class="modal-sprites">
        ${spriteMarkup}
      </div>
      <div class="modal-info">
        <h2 id="modal-title">${escapeHtml(data.name)}</h2>
        <p class="modal-meta">
          #${String(data.id).padStart(3, '0')} · ${getGeneration(data.id)} · ${(data.height || 0) / 10} m · ${(data.weight || 0) / 10} kg
        </p>
        <div class="card-types">${types.map(t => `<span class="type-pill type-${t}">${t}</span>`).join('')}</div>
      </div>
    </div>
    <div class="modal-section">
      <h3>Abilities</h3>
      <div class="modal-abilities">${abilities.map(a => `<span>${escapeHtml(a)}</span>`).join('')}</div>
    </div>
    <div class="modal-section">
      <h3>Moves (sample)</h3>
      <div class="modal-moves">${moves.map(m => `<span>${escapeHtml(m)}</span>`).join('')}</div>
    </div>
    <div class="modal-section">
      <h3>Stats</h3>
      <div class="modal-stats">
        <div><strong>Base XP</strong>${data.base_experience ?? '—'}</div>
        <div><strong>Height</strong>${(data.height || 0) / 10} m</div>
        <div><strong>Weight</strong>${(data.weight || 0) / 10} kg</div>
      </div>
    </div>
  `;

  el.modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  el.modalCloseBtn.focus();
}

function closeModal() {
  el.modal.classList.add('hidden');
  document.body.style.overflow = '';
}

el.modalClose.addEventListener('click', closeModal);
el.modalCloseBtn.addEventListener('click', closeModal);
el.modal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

el.search.addEventListener('input', () => {
  state.searchQuery = el.search.value;
  renderGrid();
});

el.search.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    el.search.value = '';
    state.searchQuery = '';
    renderGrid();
    el.search.focus();
  }
});

async function init() {
  try {
    hideError();
    el.loading.classList.remove('hidden');
    const { list, next } = await fetchFirstBatch();
    state.list = list;
    el.loading.classList.add('hidden');
    renderGrid();
    if (next) fetchRemainingInBackground(next);
  } catch (e) {
    const msg = e.name === 'AbortError'
      ? 'Request timed out. Check your connection and try again.'
      : (e.message || 'Failed to load Pokémon. Check your connection.');
    showError(msg);
    el.count.textContent = '0';
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) retryBtn.onclick = retryInit;
  }
}

function retryInit() {
  state.list = [];
  state.searchQuery = '';
  if (el.search) el.search.value = '';
  init();
}

init();
