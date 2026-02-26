/**
 * Build data/gap-pokemon.json: Pokémon in National Dex (1–1025) that are missing from PokeAPI.
 * Uses data/full-national-dex.json as reference (created from API on first run if missing).
 * Run: node scripts/build-gap-pokemon.js
 */

const fs = require('fs');
const path = require('path');

const POKE_API = 'https://pokeapi.co/api/v2';
const NATIONAL_DEX_MAX = 1025;
const DATA_DIR = path.join(__dirname, '..', 'data');
const FULL_LIST_PATH = path.join(DATA_DIR, 'full-national-dex.json');
const GAP_LIST_PATH = path.join(DATA_DIR, 'gap-pokemon.json');

// Mirrors app.js: Legendary, Mythical, Pseudolegendary by National Dex ID
const LEGENDARY_IDS = new Set([144,145,146,150,243,244,245,249,250,377,378,379,380,381,382,383,384,480,481,482,483,484,485,486,487,488,638,639,640,641,642,643,644,645,646,647,649,716,717,718,789,790,791,792,793,794,795,796,797,798,799,800,803,804,805,806,888,889,890,891,892,893,894,895,896,897,898,905,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017]);
const MYTHICAL_IDS = new Set([151,251,385,386,489,490,491,492,493,494,648,649,719,720,721,801,802,807,808,809,893,1025]);
const PSEUDO_LEGENDARY_IDS = new Set([147,148,149,246,247,248,371,372,373,374,375,376,443,444,445,633,634,635,704,705,706,782,783,784,885,886,887]);

function getIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? match[1] : null;
}

async function fetchApiList() {
  const url = `${POKE_API}/pokemon?limit=2000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`);
  const data = await res.json();
  const out = [];
  for (const p of data.results || []) {
    const id = getIdFromUrl(p.url);
    if (!id) continue;
    const n = parseInt(id, 10);
    if (n >= 1 && n <= NATIONAL_DEX_MAX) out.push({ id: n, name: p.name });
  }
  return out;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadFullNationalDex() {
  if (!fs.existsSync(FULL_LIST_PATH)) return null;
  try {
    const raw = fs.readFileSync(FULL_LIST_PATH, 'utf8');
    const json = JSON.parse(raw);
    return Array.isArray(json) ? json : null;
  } catch {
    return null;
  }
}

function saveFullNationalDex(list) {
  ensureDataDir();
  const byId = list
    .filter((e) => e.id >= 1 && e.id <= NATIONAL_DEX_MAX)
    .sort((a, b) => a.id - b.id);
  fs.writeFileSync(FULL_LIST_PATH, JSON.stringify(byId, null, 2), 'utf8');
  console.log(`Wrote ${FULL_LIST_PATH} (${byId.length} entries).`);
}

function buildGapEntries(apiIdsSet, fullList) {
  const gap = [];
  for (const entry of fullList) {
    const id = entry.id;
    if (id < 1 || id > NATIONAL_DEX_MAX) continue;
    if (apiIdsSet.has(id)) continue;
    gap.push({
      id,
      name: entry.name || 'Unknown',
      legendary: LEGENDARY_IDS.has(id),
      mythical: MYTHICAL_IDS.has(id),
      pseudolegendary: PSEUDO_LEGENDARY_IDS.has(id),
    });
  }
  return gap.sort((a, b) => a.id - b.id);
}

async function main() {
  console.log('Fetching PokeAPI list...');
  const apiList = await fetchApiList();
  const apiIdsSet = new Set(apiList.map((e) => e.id));
  console.log(`API has ${apiList.length} National Dex entries (1–${NATIONAL_DEX_MAX}).`);

  let fullList = loadFullNationalDex();
  if (!fullList || fullList.length === 0) {
    console.log('No full-national-dex.json found; creating from API response.');
    fullList = apiList.map((e) => ({ id: e.id, name: e.name }));
    saveFullNationalDex(fullList);
    const gap = buildGapEntries(apiIdsSet, fullList);
    ensureDataDir();
    fs.writeFileSync(GAP_LIST_PATH, JSON.stringify(gap, null, 2), 'utf8');
    console.log(`Wrote ${GAP_LIST_PATH} (${gap.length} gap entries).`);
    return;
  }

  const gap = buildGapEntries(apiIdsSet, fullList);
  ensureDataDir();
  fs.writeFileSync(GAP_LIST_PATH, JSON.stringify(gap, null, 2), 'utf8');
  console.log(`Wrote ${GAP_LIST_PATH} (${gap.length} gap entries).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
