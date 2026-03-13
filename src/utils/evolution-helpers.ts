import type { PokeAPIEvolutionNode, PokeAPIEvolutionDetail } from '@/lib/api/types';
import type { EvolutionStage } from '@/types/pokemon';
import { getOfficialArtwork } from './sprite-urls';
import { formatPokemonName } from './formatters';

function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, '').split('/');
  return parseInt(parts[parts.length - 1], 10);
}

function formatTrigger(detail: PokeAPIEvolutionDetail): string {
  const parts: string[] = [];

  if (detail.trigger.name === 'level-up') {
    if (detail.min_level) {
      parts.push(`Level ${detail.min_level}`);
    } else {
      parts.push('Level up');
    }
  } else if (detail.trigger.name === 'trade') {
    parts.push('Trade');
  } else if (detail.trigger.name === 'use-item') {
    parts.push('Use item');
  } else if (detail.trigger.name === 'shed') {
    parts.push('Shed');
  } else {
    parts.push(formatPokemonName(detail.trigger.name));
  }

  if (detail.item) parts.push(formatPokemonName(detail.item.name));
  if (detail.held_item) parts.push(`holding ${formatPokemonName(detail.held_item.name)}`);
  if (detail.known_move) parts.push(`knowing ${formatPokemonName(detail.known_move.name)}`);
  if (detail.min_happiness) parts.push(`Happiness ${detail.min_happiness}+`);
  if (detail.min_affection) parts.push(`Affection ${detail.min_affection}+`);
  if (detail.time_of_day) parts.push(`(${detail.time_of_day})`);
  if (detail.location) parts.push(`at ${formatPokemonName(detail.location.name)}`);
  if (detail.needs_overworld_rain) parts.push('(rain)');
  if (detail.turn_upside_down) parts.push('(upside down)');
  if (detail.gender !== null) parts.push(detail.gender === 1 ? '(female)' : '(male)');
  if (detail.trade_species) parts.push(`for ${formatPokemonName(detail.trade_species.name)}`);

  return parts.join(' ');
}

export function flattenEvolutionChain(node: PokeAPIEvolutionNode): EvolutionStage {
  const id = extractIdFromUrl(node.species.url);

  const triggerDetail = node.evolution_details.length > 0
    ? node.evolution_details.map(formatTrigger).join(' / ')
    : '';

  const trigger = node.evolution_details.length > 0
    ? node.evolution_details[0].trigger.name
    : null;

  return {
    id,
    name: node.species.name,
    spriteUrl: getOfficialArtwork(id),
    trigger,
    triggerDetail,
    children: node.evolves_to.map(child => flattenEvolutionChain(child)),
  };
}

export function isLinearChain(stage: EvolutionStage): boolean {
  if (stage.children.length > 1) return false;
  if (stage.children.length === 0) return true;
  return isLinearChain(stage.children[0]);
}

export function getChainLength(stage: EvolutionStage): number {
  if (stage.children.length === 0) return 1;
  return 1 + Math.max(...stage.children.map(getChainLength));
}
