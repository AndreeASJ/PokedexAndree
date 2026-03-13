/**
 * Build script: Pre-fetches all 1,025 Pokemon from PokeAPI
 * and writes a lightweight JSON file for the grid.
 *
 * Run: npx tsx scripts/build-pokemon-data.ts
 */

const BASE_URL = 'https://pokeapi.co/api/v2';
const TOTAL_POKEMON = 1025;
const CONCURRENCY = 40;

const ULTRA_BEASTS = new Set([793, 794, 795, 796, 797, 798, 799, 803, 804, 805, 806]);
const PSEUDO_LEGENDARIES = new Set([149, 248, 373, 376, 445, 635, 706, 784, 887, 998]);

const GENERATIONS: [number, number][] = [
  [1, 151], [152, 251], [252, 386], [387, 493],
  [494, 649], [650, 721], [722, 809], [810, 905], [906, 1025],
];

function classifyFormCategory(name: string): string | null {
  if (name.includes('-mega')) return 'mega';
  if (name.includes('-primal')) return 'primal';
  if (name.includes('-origin')) return 'origin';
  if (name.endsWith('-crowned') || name.endsWith('-hero')) return 'crowned';
  return null;
}

function formatFormName(name: string): string {
  const parts = name.split('-');
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (name.includes('-mega-')) {
    return `Mega ${cap(parts[0])} ${parts.slice(2).map(p => p.toUpperCase()).join(' ')}`.trim();
  }
  if (name.includes('-mega')) return `Mega ${cap(parts[0])}`;
  if (name.includes('-primal')) return `Primal ${cap(parts[0])}`;
  if (name.includes('-origin')) return `Origin ${cap(parts[0])}`;
  if (name.endsWith('-crowned')) return `${cap(parts[0])} Crowned`;
  if (name.endsWith('-hero')) return `${cap(parts[0])} Hero`;
  return parts.map(cap).join(' ');
}

function getGeneration(id: number): number {
  const idx = GENERATIONS.findIndex(([min, max]) => id >= min && id <= max);
  return idx + 1;
}

interface PokemonListItem {
  id: number;
  name: string;
  types: string[];
  spriteUrl: string;
  generation: number;
  isLegendary: boolean;
  isMythical: boolean;
  isUltraBeast: boolean;
  isPseudo: boolean;
  classification: string;
}

async function fetchJson<T>(url: string, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return (await res.json()) as T;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error('unreachable');
}

async function batchProcess<T>(
  items: number[],
  processor: (id: number) => Promise<T>,
  concurrency: number,
  label: string
): Promise<T[]> {
  const results: T[] = [];
  let completed = 0;

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    completed += batch.length;
    process.stdout.write(`\r  ${label}: ${completed}/${items.length}`);
  }
  console.log();
  return results;
}

async function main() {
  console.log(`\nBuilding Pokemon data for ${TOTAL_POKEMON} Pokemon...\n`);
  const startTime = Date.now();

  const ids = Array.from({ length: TOTAL_POKEMON }, (_, i) => i + 1);

  // Fetch Pokemon data
  console.log('Fetching /pokemon endpoints...');
  const pokemonData = await batchProcess(
    ids,
    async (id) => {
      const data = await fetchJson<{
        id: number;
        name: string;
        types: { type: { name: string } }[];
        sprites: { other: { 'official-artwork': { front_default: string | null } } };
      }>(`${BASE_URL}/pokemon/${id}`);
      return {
        id: data.id,
        name: data.name,
        types: data.types.map(t => t.type.name),
        spriteUrl: data.sprites.other['official-artwork'].front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      };
    },
    CONCURRENCY,
    'Pokemon'
  );

  // Fetch Species data (for legendary/mythical flags + varieties)
  console.log('Fetching /pokemon-species endpoints...');
  const speciesData = await batchProcess(
    ids,
    async (id) => {
      const data = await fetchJson<{
        id: number;
        is_legendary: boolean;
        is_mythical: boolean;
        varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
      }>(`${BASE_URL}/pokemon-species/${id}`);
      return {
        id: data.id,
        isLegendary: data.is_legendary,
        isMythical: data.is_mythical,
        varieties: data.varieties,
      };
    },
    CONCURRENCY,
    'Species'
  );

  // Merge data
  const speciesMap = new Map(speciesData.map(s => [s.id, s]));

  const pokemonList: PokemonListItem[] = pokemonData.map(p => {
    const species = speciesMap.get(p.id)!;
    const isUltraBeast = ULTRA_BEASTS.has(p.id);
    const isPseudo = PSEUDO_LEGENDARIES.has(p.id);

    let classification = 'regular';
    if (species.isMythical) classification = 'mythical';
    else if (species.isLegendary) classification = 'legendary';
    else if (isUltraBeast) classification = 'ultra-beast';
    else if (isPseudo) classification = 'pseudo-legendary';

    return {
      id: p.id,
      name: p.name,
      types: p.types,
      spriteUrl: p.spriteUrl,
      generation: getGeneration(p.id),
      isLegendary: species.isLegendary,
      isMythical: species.isMythical,
      isUltraBeast,
      isPseudo,
      classification,
    };
  });

  // Sort by ID
  pokemonList.sort((a, b) => a.id - b.id);

  // Collect alternate forms (mega, primal, origin, crowned)
  console.log('Discovering alternate forms...');
  interface FormEntry {
    speciesId: number;
    pokemonName: string;
  }
  const formEntries: FormEntry[] = [];

  for (const species of speciesData) {
    const nonDefault = species.varieties.filter(v => !v.is_default);
    for (const variety of nonDefault) {
      const name = variety.pokemon.name;
      const category = classifyFormCategory(name);
      if (category) {
        formEntries.push({ speciesId: species.id, pokemonName: name });
      }
    }
  }

  console.log(`  Found ${formEntries.length} notable forms to fetch`);

  // Fetch form Pokemon data
  const formsMap: Record<string, { id: number; name: string; displayName: string; category: string; types: string[]; spriteUrl: string }[]> = {};

  if (formEntries.length > 0) {
    console.log('Fetching form Pokemon data...');
    let formsDone = 0;
    for (let i = 0; i < formEntries.length; i += CONCURRENCY) {
      const batch = formEntries.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        batch.map(async (entry) => {
          try {
            const data = await fetchJson<{
              id: number;
              name: string;
              types: { type: { name: string } }[];
              sprites: { other: { 'official-artwork': { front_default: string | null } } };
            }>(`${BASE_URL}/pokemon/${entry.pokemonName}`);
            return {
              speciesId: entry.speciesId,
              id: data.id,
              name: data.name,
              types: data.types.map(t => t.type.name),
              spriteUrl: data.sprites.other['official-artwork'].front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
            };
          } catch {
            console.warn(`  Warning: Failed to fetch form ${entry.pokemonName}`);
            return null;
          }
        })
      );
      for (const result of results) {
        if (!result) continue;
        const category = classifyFormCategory(result.name)!;
        const key = String(result.speciesId);
        if (!formsMap[key]) formsMap[key] = [];
        formsMap[key].push({
          id: result.id,
          name: result.name,
          displayName: formatFormName(result.name),
          category,
          types: result.types,
          spriteUrl: result.spriteUrl,
        });
      }
      formsDone += batch.length;
      process.stdout.write(`\r  Forms: ${formsDone}/${formEntries.length}`);
    }
    console.log();
  }

  // Write output
  const fs = await import('fs');
  const path = await import('path');
  const outDir = path.join(process.cwd(), 'public', 'data');
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, 'pokemon-list.json');
  fs.writeFileSync(outPath, JSON.stringify(pokemonList));

  const formsPath = path.join(outDir, 'pokemon-forms.json');
  fs.writeFileSync(formsPath, JSON.stringify(formsMap));

  const fileSizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  const formsSizeKB = (fs.statSync(formsPath).size / 1024).toFixed(1);
  const totalForms = Object.values(formsMap).reduce((sum, arr) => sum + arr.length, 0);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\nDone in ${elapsed}s`);
  console.log(`Output: ${outPath} (${fileSizeKB}KB)`);
  console.log(`Forms: ${formsPath} (${formsSizeKB}KB)`);
  console.log(`Pokemon: ${pokemonList.length}`);
  console.log(`Alternate forms: ${totalForms} across ${Object.keys(formsMap).length} species`);
  console.log(`Legendary: ${pokemonList.filter(p => p.isLegendary).length}`);
  console.log(`Mythical: ${pokemonList.filter(p => p.isMythical).length}`);
  console.log(`Ultra Beasts: ${pokemonList.filter(p => p.isUltraBeast).length}`);
  console.log(`Pseudo-Legendary: ${pokemonList.filter(p => p.isPseudo).length}`);
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
