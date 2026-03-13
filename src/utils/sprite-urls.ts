const SPRITES_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const CRIES_BASE = 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon';

export function getSpriteUrls(id: number) {
  return {
    official: `${SPRITES_BASE}/other/official-artwork/${id}.png`,
    officialShiny: `${SPRITES_BASE}/other/official-artwork/shiny/${id}.png`,
    home: `${SPRITES_BASE}/other/home/${id}.png`,
    homeShiny: `${SPRITES_BASE}/other/home/shiny/${id}.png`,
    showdown: `${SPRITES_BASE}/other/showdown/${id}.gif`,
    showdownShiny: `${SPRITES_BASE}/other/showdown/shiny/${id}.gif`,
    frontDefault: `${SPRITES_BASE}/${id}.png`,
    frontShiny: `${SPRITES_BASE}/shiny/${id}.png`,
  };
}

export function getCryUrl(id: number) {
  return `${CRIES_BASE}/latest/${id}.ogg`;
}

export function getOfficialArtwork(id: number) {
  return `${SPRITES_BASE}/other/official-artwork/${id}.png`;
}
