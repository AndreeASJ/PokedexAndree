export type FormCategory = 'mega' | 'primal' | 'origin' | 'crowned';

export const FORM_CATEGORY_LABELS: Record<FormCategory, string> = {
  mega: 'Mega Evolution',
  primal: 'Primal Reversion',
  origin: 'Origin Forme',
  crowned: 'Crowned Form',
};

export const FORM_CATEGORY_COLORS: Record<FormCategory, string> = {
  mega: '#E040A0',
  primal: '#DC3545',
  origin: '#6F42C1',
  crowned: '#FFD700',
};

export function classifyForm(pokemonName: string): FormCategory | null {
  if (pokemonName.includes('-mega')) return 'mega';
  if (pokemonName.includes('-primal')) return 'primal';
  if (pokemonName.includes('-origin')) return 'origin';
  if (pokemonName.endsWith('-crowned') || pokemonName.endsWith('-hero')) return 'crowned';
  return null;
}

export function formatFormDisplayName(pokemonName: string): string {
  const parts = pokemonName.split('-');
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (pokemonName.includes('-mega-')) {
    // charizard-mega-x -> Mega Charizard X
    const base = capitalize(parts[0]);
    const suffix = parts.slice(2).map(p => p.toUpperCase()).join(' ');
    return `Mega ${base} ${suffix}`.trim();
  }
  if (pokemonName.includes('-mega')) {
    // venusaur-mega -> Mega Venusaur
    return `Mega ${capitalize(parts[0])}`;
  }
  if (pokemonName.includes('-primal')) {
    return `Primal ${capitalize(parts[0])}`;
  }
  if (pokemonName.includes('-origin')) {
    return `Origin ${capitalize(parts[0])}`;
  }
  if (pokemonName.endsWith('-crowned')) {
    return `${capitalize(parts[0])} Crowned`;
  }
  if (pokemonName.endsWith('-hero')) {
    return `${capitalize(parts[0])} Hero`;
  }

  return parts.map(capitalize).join(' ');
}
