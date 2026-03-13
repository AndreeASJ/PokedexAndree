export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatPokemonId(id: number): string {
  return `#${id.toString().padStart(4, '0')}`;
}

export function formatStatName(name: string): string {
  const statMap: Record<string, string> = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'SPA',
    'special-defense': 'SPD',
    speed: 'SPE',
  };
  return statMap[name] || name.toUpperCase();
}

export function formatHeight(decimeters: number): string {
  const meters = decimeters / 10;
  const feet = Math.floor(meters * 3.28084);
  const inches = Math.round((meters * 3.28084 - feet) * 12);
  return `${meters.toFixed(1)}m (${feet}'${inches}")`;
}

export function formatWeight(hectograms: number): string {
  const kg = hectograms / 10;
  const lbs = (kg * 2.20462).toFixed(1);
  return `${kg.toFixed(1)}kg (${lbs}lbs)`;
}

export function cleanFlavorText(text: string): string {
  return text.replace(/[\n\f\r]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function formatMoveName(name: string): string {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
