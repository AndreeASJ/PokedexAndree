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

// Region names (Gen I = Kanto, etc.) – reserved for future filter use
const _REGION_NAMES = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'];

// Legendary (box legendaries; mythicals excluded), Mythical, and Pseudolegendary by National Dex ID
const LEGENDARY_IDS = new Set([144,145,146,150,243,244,245,249,250,377,378,379,380,381,382,383,384,480,481,482,483,484,485,486,487,488,638,639,640,641,642,643,644,645,646,647,649,716,717,718,789,790,791,792,793,794,795,796,797,798,799,800,803,804,805,806,888,889,890,891,892,893,894,895,896,897,898,905,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017]);
const MYTHICAL_IDS = new Set([151,251,385,386,489,490,491,492,493,494,648,649,719,720,721,801,802,807,808,809,893,1025]);
const PSEUDO_LEGENDARY_IDS = new Set([147,148,149,246,247,248,371,372,373,374,375,376,443,444,445,633,634,635,704,705,706,782,783,784,885,886,887]);

const CHECKLIST_STORAGE_KEY = 'pokedex_checklist';

const state = {
  list: [],
  details: new Map(),
  moveDetails: new Map(),
  searchQuery: '',
  searchMode: 'name', // 'name' | 'number' — only for text search
  sortBy: 'number',
  searchDebounceId: null,
  checklist: {},
  filterCategories: { legendary: false, mythical: false, pseudolegendary: false },
  filterAllGen: true,
  filterGenerations: [false, false, false, false, false, false, false, false, false],
  filterCaughtStatus: { caught: false, notCaught: false }, // both false = show all; one true = filter to that
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
  searchIcon: document.getElementById('search-icon'),
  dictateBtn: document.getElementById('dictate-btn'),
  modal: document.getElementById('modal'),
  modalContent: document.getElementById('modal-content'),
  modalClose: document.getElementById('modal-close'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  pokedexMain: document.getElementById('pokedex-main'),
  pageTitle: document.getElementById('page-title'),
  pageTagline: document.getElementById('page-tagline'),
  pokedexSearchWrap: document.getElementById('pokedex-search-wrap'),
  searchModeSelect: document.getElementById('search-mode'),
  sortBySelect: document.getElementById('sort-by'),
  advancedFilter: document.getElementById('advanced-filter'),
  headerStats: document.getElementById('header-stats'),
  header: document.querySelector('.header'),
  lightbox: document.getElementById('lightbox'),
  lightboxImg: document.getElementById('lightbox-img'),
  lightboxClose: document.getElementById('lightbox-close'),
};

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

function getGeneration(id) {
  const n = Number(id);
  const gen = GENERATIONS.find(g => n >= g.min && n <= g.max);
  return gen ? `Gen ${gen.name}` : '—';
}

/** Returns storage key for generation, e.g. "gen1" for Gen I (1–151). */
function getGenKey(id) {
  const n = Number(id);
  const idx = GENERATIONS.findIndex(g => n >= g.min && n <= g.max);
  return idx >= 0 ? `gen${idx + 1}` : null;
}

function loadChecklist() {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return;
    for (const [genKey, val] of Object.entries(parsed)) {
      if (typeof val !== 'object' || val === null) continue;
      state.checklist[genKey] = {
        seen: new Set(Array.isArray(val.seen) ? val.seen.map(Number) : []),
        caught: new Set(Array.isArray(val.caught) ? val.caught.map(Number) : []),
      };
    }
  } catch {
    // ignore invalid stored data
  }
}

function saveChecklist() {
  const out = {};
  for (const [genKey, val] of Object.entries(state.checklist)) {
    out[genKey] = {
      seen: [...val.seen],
      caught: [...val.caught],
    };
  }
  try {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(out));
  } catch {
    // ignore quota or other errors
  }
}

function ensureChecklistGen(genKey) {
  if (!state.checklist[genKey]) {
    state.checklist[genKey] = { seen: new Set(), caught: new Set() };
  }
  return state.checklist[genKey];
}

function isSeen(id) {
  const genKey = getGenKey(id);
  return genKey ? ensureChecklistGen(genKey).seen.has(Number(id)) : false;
}

function isCaught(id) {
  const genKey = getGenKey(id);
  return genKey ? ensureChecklistGen(genKey).caught.has(Number(id)) : false;
}

function setSeen(id, value) {
  const genKey = getGenKey(id);
  if (!genKey) return;
  const gen = ensureChecklistGen(genKey);
  const numId = Number(id);
  if (value) gen.seen.add(numId); else gen.seen.delete(numId);
  saveChecklist();
}

function setCaught(id, value) {
  const genKey = getGenKey(id);
  if (!genKey) return;
  const gen = ensureChecklistGen(genKey);
  const numId = Number(id);
  if (value) gen.caught.add(numId); else gen.caught.delete(numId);
  saveChecklist();
}

function getCaughtButtonHtml(id) {
  const caught = isCaught(id);
  return caught
    ? `<button type="button" class="card-checklist-btn card-caught" data-id="${id}" title="Caught (click to unmark)" aria-label="Unmark as caught">✓</button>`
    : `<button type="button" class="card-checklist-btn card-catch" data-id="${id}" title="Mark as caught" aria-label="Mark as caught">○</button>`;
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

/** Load first page only. */
async function fetchFirstBatch() {
  const url = `${POKE_API}/pokemon?limit=${FIRST_PAGE_SIZE}`;
  const data = await fetchOnePage(url);
  return parsePageResults(data);
}

/** Fetch all remaining pages; append to state.list. Resolves when done or on error. */
async function fetchAllRemaining(nextUrl) {
  let url = nextUrl;
  while (url) {
    try {
      const data = await fetchOnePage(url);
      const { list, next } = parsePageResults(data);
      state.list.push(...list);
      url = next;
    } catch {
      break;
    }
  }
}

function getFilteredList() {
  let list = state.list;

  // Advanced filter: category (any selected = union)
  const cat = state.filterCategories;
  const anyCategory = cat.legendary || cat.mythical || cat.pseudolegendary;
  if (anyCategory) {
    list = list.filter(p => {
      const id = Number(p.id);
      return (cat.legendary && LEGENDARY_IDS.has(id)) || (cat.mythical && MYTHICAL_IDS.has(id)) || (cat.pseudolegendary && PSEUDO_LEGENDARY_IDS.has(id));
    });
  }

  // Advanced filter: generation (any selected = union; skip if All Gen is on)
  const gens = state.filterGenerations;
  const anyGen = !state.filterAllGen && gens.some(Boolean);
  if (anyGen) {
    list = list.filter(p => {
      const n = Number(p.id);
      return gens.some((checked, i) => checked && GENERATIONS[i] && n >= GENERATIONS[i].min && n <= GENERATIONS[i].max);
    });
  }

  // Advanced filter: caught status (only if exactly one option selected)
  const cs = state.filterCaughtStatus;
  if (cs.caught && !cs.notCaught) list = list.filter(p => isCaught(p.id));
  else if (!cs.caught && cs.notCaught) list = list.filter(p => !isCaught(p.id));

  // Text search (name or number) on top of advanced filter
  const q = state.searchQuery.trim();
  if (q) {
    if (state.searchMode === 'name') {
      const qLower = q.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(qLower));
    } else {
      const num = Number(q);
      if (!Number.isNaN(num) && String(num) === q.trim()) {
        list = list.filter(p => Number(p.id) === num);
      } else {
        const rangeMatch = q.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
        if (rangeMatch) {
          const low = Math.max(1, parseInt(rangeMatch[1], 10));
          const high = parseInt(rangeMatch[2], 10);
          if (!Number.isNaN(low) && !Number.isNaN(high) && low <= high) {
            list = list.filter(p => { const n = Number(p.id); return n >= low && n <= high; });
          }
        }
      }
    }
  }

  return list;
}

function sortFilteredList(list) {
  const order = state.sortBy;
  if (order === 'number') return list;
  const copy = list.slice();
  if (order === 'name-asc') copy.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  else if (order === 'name-desc') copy.sort((a, b) => b.name.localeCompare(a.name, 'en'));
  return copy;
}

function renderCard(p, index) {
  const id = p.id;
  const normalSprite = spriteUrl(id);
  const shinySprite = spriteUrl(id, 'shiny');
  const caughtBtn = getCaughtButtonHtml(id);

  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card card-enter';
  card.dataset.id = id;
  card.style.setProperty('--i', String(index));
  card.innerHTML = `
    <span class="card-num">#${id.padStart(3, '0')}</span>
    <div class="card-checklist-wrap">${caughtBtn}</div>
    <div class="card-sprites" id="card-sprites-${id}">
      <div class="card-sprite-pair">
        <img class="card-sprite-img" src="${normalSprite}" alt="" loading="lazy" onerror="this.style.display='none'" />
        <span class="card-sprite-label">Normal</span>
      </div>
      <div class="card-sprite-pair">
        <img class="card-sprite-img" src="${shinySprite}" alt="" loading="lazy" onerror="this.style.display='none'" />
        <span class="card-sprite-label">Shiny</span>
      </div>
    </div>
    <span class="card-name">${escapeHtml(p.name)}</span>
    <div class="card-types" id="types-${id}"></div>
  `;
  card.addEventListener('click', (e) => {
    if (e.target.closest('.card-checklist-btn')) return;
    openDetail(id);
  });

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
  const sorted = sortFilteredList(filtered);
  const isFiltered = filtered.length !== state.list.length;
  el.count.textContent = isFiltered ? `${sorted.length} of ${state.list.length}` : String(state.list.length);
  el.empty.classList.add('hidden');
  el.emptyQuery.textContent = '';

  if (filtered.length === 0) {
    el.grid.innerHTML = '';
    const hasFilter = state.searchQuery.trim() || (state.filterCategories.legendary || state.filterCategories.mythical || state.filterCategories.pseudolegendary || state.filterGenerations.some(Boolean)) || (state.filterCaughtStatus.caught && !state.filterCaughtStatus.notCaught) || (!state.filterCaughtStatus.caught && state.filterCaughtStatus.notCaught);
    const emptyLabel = hasFilter ? 'your filters' : '';
    if (emptyLabel) {
      el.emptyQuery.textContent = emptyLabel;
      el.empty.classList.remove('hidden');
    }
    return;
  }

  el.grid.innerHTML = '';
  sorted.forEach((p, index) => {
    el.grid.appendChild(renderCard(p, index));
  });

  // Optional: lazy-load types for visible cards (batch from API or from cache)
  loadTypesForVisibleCards(sorted.slice(0, 50));
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
    } catch {
      // ignore per-card errors
    }
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

/** Extract English short effect from move API response. */
function getEnglishEffect(data) {
  const entries = data.effect_entries || [];
  const en = entries.find((e) => e.language?.name === 'en');
  if (en) return en.short_effect || en.effect || '';
  return '';
}

/** Fetch full move details from PokeAPI; caches by URL. Returns { name, type, power, accuracy, pp, effect }. */
async function fetchMoveDetails(moveUrl) {
  const cached = state.moveDetails.get(moveUrl);
  if (cached) return cached;
  try {
    const data = await fetchJson(moveUrl);
    const type = data.type?.name;
    const result = {
      name: data.name || '',
      type: typeof type === 'string' ? type : 'unknown',
      power: data.power != null ? data.power : null,
      accuracy: data.accuracy != null ? data.accuracy : null,
      pp: data.pp != null ? data.pp : null,
      effect: getEnglishEffect(data),
    };
    state.moveDetails.set(moveUrl, result);
    return result;
  } catch {
    return { name: '', type: 'unknown', power: null, accuracy: null, pp: null, effect: '' };
  }
}

/** Resolve full details for the first N moves (name, type, power, accuracy, pp, effect). */
async function getMoveDetails(movesWithUrl, limit = 24) {
  const slice = (movesWithUrl || []).slice(0, limit);
  return Promise.all(slice.map((m) => fetchMoveDetails(m.url)));
}

/** Capitalize a single word (e.g. "red" -> "Red"). */
function capitalize(s) {
  if (!s || typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Format location_area name (e.g. "kanto-route-1-area" -> "Kanto Route 1 Area"). */
function formatLocationAreaName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .split('-')
    .map((part) => capitalize(part))
    .join(' ');
}

/** Flatten evolution chain into ordered array of species names. */
function flattenEvolutionChain(chain) {
  const out = [];
  function walk(node) {
    if (!node?.species?.name) return;
    out.push(node.species.name);
    (node.evolves_to || []).forEach(walk);
  }
  walk(chain);
  return out;
}

async function openDetail(id) {
  let data = state.details.get(id);
  if (!data) {
    try {
      data = await fetchJson(`${POKE_API}/pokemon/${id}`);
      state.details.set(id, data);
    } catch {
      showError('Could not load Pokémon details.');
      return;
    }
  }

  const sprites = data.sprites || {};
  const home = sprites.other?.home;
  const defaultEntries = [
    [sprites.front_default, false],
    [sprites.back_default, false],
    [sprites.front_shiny, false],
    [sprites.other?.['official-artwork']?.front_default, false],
    [home?.front_default, true],
    [home?.front_shiny, true],
  ].filter(([src]) => src);
  const femaleEntries = [
    [sprites.front_female, false],
    [sprites.back_female, false],
    [sprites.front_shiny_female, false],
    [sprites.back_shiny_female, false],
    [home?.front_female, true],
    [home?.front_shiny_female, true],
  ].filter(([src]) => src);
  const imgClass = (is3d) => `sprite-zoomable ${is3d ? 'sprite-3d' : ''}`;
  const defaultMarkup = defaultEntries
    .map(([src, is3d]) => `<img src="${src}" alt="" class="${imgClass(is3d)}" />`)
    .join('');
  const femaleMarkup = femaleEntries.length
    ? `<div class="modal-sprites-row modal-sprites-row-female"><span class="modal-sprites-label">Female</span>${femaleEntries.map(([src, is3d]) => `<img src="${src}" alt="" class="${imgClass(is3d)}" />`).join('')}</div>`
    : '';
  const spriteMarkup = `<div class="modal-sprites-row">${defaultMarkup}</div>${femaleMarkup}`;

  const abilities = (data.abilities || []).map(a => a.ability?.name).filter(Boolean);
  const movesWithUrl = (data.moves || [])
    .slice(0, 24)
    .map((m) => ({ name: m.move?.name, url: m.move?.url }))
    .filter((m) => m.name && m.url);
  const moveDetailsList = await getMoveDetails(movesWithUrl, 24);
  const types = (data.types || []).map(t => t.type?.name).filter(Boolean);
  const cryUrl = data.cries?.latest || data.cries?.legacy || '';
  const cryBtn = cryUrl
    ? `<button type="button" class="modal-cry-btn" data-cry-url="${escapeHtml(cryUrl)}" aria-label="Play Pokémon cry" title="Play cry">${CRY_BTN_SVG}</button>`
    : '';

  const movesMarkup = moveDetailsList
    .map((m) => {
      const power = m.power != null ? String(m.power) : '';
      const accuracy = m.accuracy != null ? String(m.accuracy) : '';
      const pp = m.pp != null ? String(m.pp) : '';
      const effectAttr = (m.effect || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<span class="move-type-${m.type} move-chip" tabindex="0" data-move-name="${escapeHtml(m.name)}" data-power="${escapeHtml(power)}" data-accuracy="${escapeHtml(accuracy)}" data-pp="${escapeHtml(pp)}" data-effect="${effectAttr}">${escapeHtml(m.name)}</span>`;
    })
    .join('');

  const gameIndices = (data.game_indices || []).map((gi) => gi.version?.name).filter(Boolean);
  const gameNames = [...new Set(gameIndices)].map((name) => capitalize(name));
  const gamesMarkup = gameNames.length
    ? gameNames.map((g) => `<span class="game-chip">${escapeHtml(g)}</span>`).join('')
    : '<span class="modal-empty-text">—</span>';

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
      <h3>Games</h3>
      <div class="modal-games">${gamesMarkup}</div>
    </div>
    <div class="modal-section">
      <h3>Where to find</h3>
      <div id="modal-locations" class="modal-locations">Loading…</div>
    </div>
    <div class="modal-section">
      <h3>Evolution</h3>
      <div id="modal-evolution" class="modal-evolution-wrap">Loading…</div>
    </div>
    <div class="modal-section">
      <h3>Abilities</h3>
      <div class="modal-abilities">${abilities.map(a => `<span>${escapeHtml(a)}</span>`).join('')}</div>
    </div>
    <div class="modal-section">
      <h3>Moves (sample)</h3>
      <div class="modal-moves">${movesMarkup}</div>
    </div>
    <div class="modal-section">
      <h3>Stats</h3>
      <div class="modal-stats">
        <div><strong>Base XP</strong>${data.base_experience ?? '—'}</div>
        <div><strong>Height</strong>${(data.height || 0) / 10} m</div>
        <div><strong>Weight</strong>${(data.weight || 0) / 10} kg</div>
      </div>
    </div>
    <div class="modal-section modal-checklist-section" data-detail-id="${escapeHtml(String(data.id))}">
      <h3>Checklist (${getGeneration(data.id)})</h3>
      <div class="modal-checklist">
        <label class="modal-checklist-item">
          <input type="checkbox" class="checklist-seen" ${isSeen(data.id) ? 'checked' : ''} aria-label="Seen" />
          <span>Seen</span>
        </label>
        <label class="modal-checklist-item">
          <input type="checkbox" class="checklist-caught" ${isCaught(data.id) ? 'checked' : ''} aria-label="Caught" />
          <span>Caught</span>
        </label>
      </div>
    </div>
  `;

  el.modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  el.modalCloseBtn.focus();

  state.detailModalId = id;
  loadLocationsAndEvolution(id, data.species?.url);
  setupMoveTooltips();
}

/** Load locations (encounters) and evolution chain for the detail modal; updates DOM only if modal still shows this id. */
async function loadLocationsAndEvolution(pokemonId, speciesUrl) {
  const locationsEl = () => document.getElementById('modal-locations');
  const evolutionEl = () => document.getElementById('modal-evolution');
  const currentId = () => state.detailModalId;

  async function setLocations() {
    if (currentId() !== pokemonId || !locationsEl()) return;
    try {
      const res = await fetch(`${POKE_API}/pokemon/${pokemonId}/encounters`);
      if (!res.ok) throw new Error(res.status);
      const encounters = await res.json();
      if (currentId() !== pokemonId || !locationsEl()) return;
      const names = (encounters || []).map((e) => e.location_area?.name).filter(Boolean);
      const unique = [...new Set(names)];
      const elLoc = locationsEl();
      if (!elLoc || currentId() !== pokemonId) return;
      if (unique.length === 0) {
        elLoc.textContent = 'No location data for this Pokémon.';
        elLoc.classList.add('modal-empty-text');
      } else {
        elLoc.classList.remove('modal-empty-text');
        elLoc.innerHTML = unique
          .map((name) => `<span class="location-chip">${escapeHtml(formatLocationAreaName(name))}</span>`)
          .join('');
      }
    } catch {
      const elLoc = locationsEl();
      if (currentId() !== pokemonId || !elLoc) return;
      elLoc.textContent = 'Could not load locations.';
      elLoc.classList.add('modal-empty-text');
    }
  }

  async function setEvolution() {
    if (currentId() !== pokemonId || !evolutionEl()) return;
    if (!speciesUrl) {
      const elEv = evolutionEl();
      if (elEv && currentId() === pokemonId) {
        elEv.textContent = 'No evolution data.';
        elEv.classList.add('modal-empty-text');
      }
      return;
    }
    try {
      const speciesData = await fetchJson(speciesUrl);
      const chainUrl = speciesData.evolution_chain?.url;
      if (currentId() !== pokemonId || !evolutionEl()) return;
      if (!chainUrl) {
        const elEv = evolutionEl();
        if (elEv && currentId() === pokemonId) {
          elEv.textContent = 'No evolution chain.';
          elEv.classList.add('modal-empty-text');
        }
        return;
      }
      const chainData = await fetchJson(chainUrl);
      const speciesNames = flattenEvolutionChain(chainData.chain);
      if (currentId() !== pokemonId || !evolutionEl()) return;
      if (speciesNames.length === 0) {
        const elEv = evolutionEl();
        if (elEv && currentId() === pokemonId) {
          elEv.textContent = 'No evolution stages.';
          elEv.classList.add('modal-empty-text');
        }
        return;
      }
      const placeholderSprite = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23252f3d" width="96" height="96"/%3E%3Ctext x="50%25" y="50%25" fill="%238b9eb5" text-anchor="middle" dy=".3em" font-size="24"%3E?%3C/text%3E%3C/svg%3E';
      const evolutionStages = await Promise.all(
        speciesNames.map(async (name) => {
          try {
            const p = await fetchJson(`${POKE_API}/pokemon/${name}`);
            const sprite = p.sprites?.front_default || p.sprites?.other?.['official-artwork']?.front_default || spriteUrl(p.id);
            return { name: p.name, id: String(p.id), sprite };
          } catch {
            return { name, id: name, sprite: placeholderSprite };
          }
        })
      );
      const elEv = evolutionEl();
      if (currentId() !== pokemonId || !elEv) return;
      elEv.classList.remove('modal-empty-text');
      elEv.innerHTML = `
        <div class="evolution-carousel" role="list">
          ${evolutionStages
            .map(
              (s) =>
                `<div class="evolution-card" role="listitem">
                  <img src="${escapeHtml(s.sprite)}" alt="" loading="lazy" />
                  <span class="evolution-name">${escapeHtml(s.name)}</span>
                </div>`
            )
            .join('')}
        </div>`;
    } catch {
      const elEv = evolutionEl();
      if (elEv && currentId() === pokemonId) {
        elEv.textContent = 'Could not load evolution chain.';
        elEv.classList.add('modal-empty-text');
      }
    }
  }

  setLocations();
  setEvolution();
}

let moveTooltipHideTimeout = null;

function setupMoveTooltips() {
  let tooltipEl = document.getElementById('move-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'move-tooltip';
    tooltipEl.setAttribute('role', 'tooltip');
    tooltipEl.className = 'move-tooltip';
    tooltipEl.setAttribute('aria-hidden', 'true');
    el.modal.appendChild(tooltipEl);
  }

  const chips = el.modalContent.querySelectorAll('.move-chip');
  if (!chips.length) return;

  function showTooltip(span) {
    if (moveTooltipHideTimeout) {
      clearTimeout(moveTooltipHideTimeout);
      moveTooltipHideTimeout = null;
    }
    const name = span.getAttribute('data-move-name') || span.textContent || '';
    const power = span.getAttribute('data-power') || '';
    const accuracy = span.getAttribute('data-accuracy') || '';
    const pp = span.getAttribute('data-pp') || '';
    const effect = span.getAttribute('data-effect') || '';
    const parts = [escapeHtml(name)];
    if (power !== '') parts.push(`Power: ${escapeHtml(power)}`);
    if (accuracy !== '') parts.push(`Accuracy: ${escapeHtml(accuracy)}%`);
    if (pp !== '') parts.push(`PP: ${escapeHtml(pp)}`);
    if (effect) parts.push(escapeHtml(effect));
    tooltipEl.innerHTML = parts.join('<br>');
    tooltipEl.classList.add('visible');
    const rect = span.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const padding = 8;
    let top = rect.bottom + padding;
    let left = rect.left;
    if (top + tooltipRect.height > window.innerHeight - padding) top = rect.top - tooltipRect.height - padding;
    if (left + tooltipRect.width > window.innerWidth - padding) left = window.innerWidth - tooltipRect.width - padding;
    if (left < padding) left = padding;
    tooltipEl.style.top = `${Math.round(top)}px`;
    tooltipEl.style.left = `${Math.round(left)}px`;
    tooltipEl.setAttribute('aria-hidden', 'false');
    span.setAttribute('aria-describedby', 'move-tooltip');
  }

  function hideTooltip(_span) {
    moveTooltipHideTimeout = setTimeout(() => {
      tooltipEl.classList.remove('visible');
      tooltipEl.setAttribute('aria-hidden', 'true');
      chips.forEach((c) => c.removeAttribute('aria-describedby'));
      moveTooltipHideTimeout = null;
    }, 0);
  }

  chips.forEach((span) => {
    span.addEventListener('mouseenter', () => showTooltip(span));
    span.addEventListener('mouseleave', () => hideTooltip(span));
    span.addEventListener('focus', () => showTooltip(span));
    span.addEventListener('blur', () => hideTooltip(span));
  });
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

function openLightbox(src) {
  if (!el.lightboxImg || !el.lightbox) return;
  el.lightboxImg.src = src;
  el.lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (el.lightbox) el.lightbox.classList.add('hidden');
  document.body.style.overflow = el.modal.classList.contains('hidden') ? '' : 'hidden';
  if (el.lightboxImg) el.lightboxImg.removeAttribute('src');
}

el.modalContent.addEventListener('click', (e) => {
  const img = e.target.closest('.modal-sprites img.sprite-zoomable');
  if (img && img.src) {
    e.preventDefault();
    openLightbox(img.src);
  }
});

el.modalContent.addEventListener('change', (e) => {
  const section = e.target.closest('.modal-checklist-section');
  if (!section) return;
  const id = section.getAttribute('data-detail-id');
  if (!id) return;
  if (e.target.classList.contains('checklist-seen')) {
    setSeen(id, e.target.checked);
    renderGrid();
  } else if (e.target.classList.contains('checklist-caught')) {
    setCaught(id, e.target.checked);
    renderGrid();
  }
});

if (el.lightboxClose) el.lightboxClose.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && el.lightbox && !el.lightbox.classList.contains('hidden')) {
    closeLightbox();
    e.stopPropagation();
  }
});

function initSearchMode() {
  if (el.searchModeSelect) {
    el.searchModeSelect.addEventListener('change', () => {
      state.searchMode = el.searchModeSelect.value;
      updateSearchPlaceholder();
      toggleSearchInputs();
      renderGrid();
    });
  }
  if (el.sortBySelect) {
    el.sortBySelect.addEventListener('change', () => {
      state.sortBy = el.sortBySelect.value;
      renderGrid();
    });
  }
  // Advanced filter: category checkboxes
  document.querySelectorAll('.filter-checkbox[data-category]').forEach(cb => {
    cb.checked = state.filterCategories[cb.dataset.category];
    cb.addEventListener('change', () => {
      state.filterCategories[cb.dataset.category] = cb.checked;
      renderGrid();
    });
  });
  // Advanced filter: All Gen checkbox
  const allGenEl = document.getElementById('filter-all-gen');
  if (allGenEl) {
    allGenEl.checked = state.filterAllGen;
    allGenEl.addEventListener('change', () => {
      state.filterAllGen = allGenEl.checked;
      if (state.filterAllGen) {
        state.filterGenerations = [false, false, false, false, false, false, false, false, false];
        document.querySelectorAll('.filter-checkbox.filter-gen').forEach(cb => { cb.checked = false; });
      }
      renderGrid();
    });
  }
  // Advanced filter: generation checkboxes
  document.querySelectorAll('.filter-checkbox.filter-gen').forEach(cb => {
    const i = parseInt(cb.dataset.gen, 10);
    cb.checked = state.filterGenerations[i];
    cb.addEventListener('change', () => {
      state.filterGenerations[i] = cb.checked;
      if (cb.checked) {
        state.filterAllGen = false;
        if (allGenEl) allGenEl.checked = false;
      }
      renderGrid();
    });
  });
  // Advanced filter: caught status checkboxes
  document.querySelectorAll('.filter-checkbox.filter-caught').forEach(cb => {
    const key = cb.dataset.caught === 'caught' ? 'caught' : 'notCaught';
    cb.checked = state.filterCaughtStatus[key];
    cb.addEventListener('change', () => {
      state.filterCaughtStatus[key] = cb.checked;
      renderGrid();
    });
  });
  updateSearchPlaceholder();
  toggleSearchInputs();
}

function updateSearchPlaceholder() {
  if (!el.search) return;
  if (state.searchMode === 'number') {
    el.search.placeholder = 'e.g. 1 or 1-50';
    el.search.setAttribute('aria-label', 'Search by Pokédex number or range');
  } else {
    el.search.placeholder = 'Search by name…';
    el.search.setAttribute('aria-label', 'Search Pokémon by name');
  }
}

function toggleSearchInputs() {
  const showDictateBtn = state.searchMode === 'name';
  if (el.searchIcon) el.searchIcon.classList.remove('hidden');
  if (el.dictateBtn) el.dictateBtn.classList.toggle('hidden', !showDictateBtn);
}

el.search.addEventListener('input', () => {
  state.searchQuery = state.searchMode === 'number' ? el.search.value.trim() : el.search.value;
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
    loadChecklist();
    el.loading.classList.remove('hidden');
    const { list, next } = await fetchFirstBatch();
    state.list = list;
    if (next) await fetchAllRemaining(next);
    el.loading.classList.add('hidden');
    renderGrid();
    initSearchMode();
    initDictate();
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

function initHeaderScroll() {
  const header = el.header;
  if (!header) return;
  const SCROLL_THRESHOLD = 80;
  const SCROLL_UP_DELTA = 30;
  let lastScrollY = window.scrollY;
  let ticking = false;

  const HEADER_OFFSET_BUFFER = 48;
  const HEADER_OFFSET_MIN = 420;
  const main = el.pokedexMain;

  function updateHeaderOffset() {
    const height = header.offsetHeight;
    const paddingTopPx = Math.max(height + HEADER_OFFSET_BUFFER, HEADER_OFFSET_MIN);
    document.documentElement.style.setProperty('--header-offset', String(paddingTopPx));
    if (main) main.style.paddingTop = paddingTopPx + 'px';
  }
  updateHeaderOffset();
  window.addEventListener('load', () => {
    updateHeaderOffset();
    requestAnimationFrame(() => {
      updateHeaderOffset();
      if (main) requestAnimationFrame(updateHeaderOffset);
    });
    setTimeout(updateHeaderOffset, 200);
    setTimeout(updateHeaderOffset, 600);
  });
  const resizeObserver = new window.ResizeObserver(updateHeaderOffset);
  resizeObserver.observe(header);
  window.addEventListener('resize', updateHeaderOffset);

  function onScroll() {
    const scrollY = window.scrollY;
    if (scrollY <= SCROLL_THRESHOLD) {
      header.classList.remove('header-hidden');
    } else if (scrollY < lastScrollY - SCROLL_UP_DELTA) {
      header.classList.remove('header-hidden');
    } else if (scrollY > lastScrollY) {
      header.classList.add('header-hidden');
    }
    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
}

function retryInit() {
  state.list = [];
  state.searchQuery = '';
  if (el.search) el.search.value = '';
  init();
}

// Advanced filter: smooth expand/collapse (class-driven so CSS transition runs)
const detailsEl = document.getElementById('advanced-filter');
if (detailsEl) {
  const summaryEl = detailsEl.querySelector('.advanced-filter-summary');
  if (summaryEl) {
    summaryEl.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = detailsEl.classList.toggle('advanced-filter--open');
      detailsEl.open = isOpen;
    });
    if (detailsEl.open) detailsEl.classList.add('advanced-filter--open');
  }
}

// Quick caught button: click on card toggles caught without opening modal
if (el.grid) {
  el.grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-checklist-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.dataset.id;
    if (!id) return;
    const nextCaught = !isCaught(id);
    setCaught(id, nextCaught);
    if (nextCaught) setSeen(id, true);
    const wrap = btn.closest('.card-checklist-wrap');
    if (wrap) wrap.innerHTML = getCaughtButtonHtml(id);
  });
}

initHeaderScroll();
init();
