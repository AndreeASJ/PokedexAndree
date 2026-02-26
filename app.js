/**
 * Pokédex – fetches Pokémon list from PokeAPI, displays cards with multiple sprites,
 * and shows full details (generation, number, attacks, abilities) in a modal.
 * Search filters by name (client-side).
 */

const POKE_API = 'https://pokeapi.co/api/v2';
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

const CRY_BTN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';

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
  searchDebounceId: null,
};

const SEARCH_DEBOUNCE_MS = 180;

const el = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  grid: document.getElementById('grid'),
  empty: document.getElementById('empty'),
  emptyQuery: document.getElementById('empty-query'),
  count: document.getElementById('count'),
  search: document.getElementById('search'),
  dictateBtn: document.getElementById('dictate-btn'),
  modal: document.getElementById('modal'),
  modalContent: document.getElementById('modal-content'),
  modalClose: document.getElementById('modal-close'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
};

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

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

function renderCard(p, index) {
  const id = p.id;
  const mainSprite = spriteUrl(id);
  const officialSprite = spriteUrl(id, 'official');

  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card card-enter';
  card.dataset.id = id;
  card.style.setProperty('--i', String(index));
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

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      card.classList.remove('card-enter');
    });
  });
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
  filtered.forEach((p, index) => {
    el.grid.appendChild(renderCard(p, index));
  });

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
    } catch (_) {
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
  const cryUrl = data.cries?.latest || data.cries?.legacy || '';
  const cryBtn = cryUrl
    ? `<button type="button" class="modal-cry-btn" data-cry-url="${escapeHtml(cryUrl)}" aria-label="Play Pokémon cry" title="Play cry">${CRY_BTN_SVG}</button>`
    : '';

  el.modalContent.innerHTML = `
    <div class="modal-title-row">
      <div class="modal-sprites">
        ${spriteMarkup}
      </div>
      <div class="modal-info">
        <div class="modal-title-line">
          <h2 id="modal-title">${escapeHtml(data.name)}</h2>
          ${cryBtn}
        </div>
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

el.modalContent.addEventListener('click', (e) => {
  const btn = e.target.closest('.modal-cry-btn');
  if (!btn || btn.disabled) return;
  const url = btn.getAttribute('data-cry-url');
  if (!url) return;
  btn.disabled = true;
  const audio = new Audio(url);
  audio.play().catch(() => {}).finally(() => { btn.disabled = false; });
});

el.search.addEventListener('input', () => {
  state.searchQuery = el.search.value;
  if (state.searchDebounceId) clearTimeout(state.searchDebounceId);
  state.searchDebounceId = setTimeout(() => {
    state.searchDebounceId = null;
    renderGrid();
  }, SEARCH_DEBOUNCE_MS);
});

el.search.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    el.search.value = '';
    state.searchQuery = '';
    renderGrid();
    el.search.focus();
  }
});

function initDictate() {
  if (!SpeechRecognitionAPI || !el.dictateBtn) return;
  el.dictateBtn.classList.add('supported');
  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  el.dictateBtn.addEventListener('click', () => {
    if (el.dictateBtn.classList.contains('listening')) {
      recognition.abort();
      return;
    }
    recognition.start();
    el.dictateBtn.classList.add('listening');
    el.dictateBtn.setAttribute('aria-label', 'Stop voice search');
  });

  recognition.onresult = (e) => {
    const transcript = (e.results[0] && e.results[0][0]) ? e.results[0][0].transcript.trim() : '';
    if (transcript) {
      el.search.value = transcript;
      state.searchQuery = transcript;
      renderGrid();
    }
  };

  recognition.onend = () => {
    el.dictateBtn.classList.remove('listening');
    el.dictateBtn.setAttribute('aria-label', 'Search by voice');
  };

  recognition.onerror = () => {
    el.dictateBtn.classList.remove('listening');
    el.dictateBtn.setAttribute('aria-label', 'Search by voice');
  };
}

async function init() {
  try {
    hideError();
    el.loading.classList.remove('hidden');
    const { list, next } = await fetchFirstBatch();
    state.list = list;
    el.loading.classList.add('hidden');
    renderGrid();
    initDictate();
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
