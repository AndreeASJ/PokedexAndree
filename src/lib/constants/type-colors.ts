export const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  normal:   { bg: '#A8A77A', text: '#fff', border: '#8C8B5E', glow: 'rgba(168,167,122,0.4)' },
  fire:     { bg: '#EE8130', text: '#fff', border: '#D4682A', glow: 'rgba(238,129,48,0.4)' },
  water:    { bg: '#6390F0', text: '#fff', border: '#4A75D6', glow: 'rgba(99,144,240,0.4)' },
  electric: { bg: '#F7D02C', text: '#333', border: '#D9B520', glow: 'rgba(247,208,44,0.4)' },
  grass:    { bg: '#7AC74C', text: '#fff', border: '#5FA83A', glow: 'rgba(122,199,76,0.4)' },
  ice:      { bg: '#96D9D6', text: '#333', border: '#7BBFBC', glow: 'rgba(150,217,214,0.4)' },
  fighting: { bg: '#C22E28', text: '#fff', border: '#A62520', glow: 'rgba(194,46,40,0.4)' },
  poison:   { bg: '#A33EA1', text: '#fff', border: '#8A3488', glow: 'rgba(163,62,161,0.4)' },
  ground:   { bg: '#E2BF65', text: '#333', border: '#C8A852', glow: 'rgba(226,191,101,0.4)' },
  flying:   { bg: '#A98FF3', text: '#fff', border: '#8F75D9', glow: 'rgba(169,143,243,0.4)' },
  psychic:  { bg: '#F95587', text: '#fff', border: '#E04070', glow: 'rgba(249,85,135,0.4)' },
  bug:      { bg: '#A6B91A', text: '#fff', border: '#8C9E14', glow: 'rgba(166,185,26,0.4)' },
  rock:     { bg: '#B6A136', text: '#fff', border: '#9C892E', glow: 'rgba(182,161,54,0.4)' },
  ghost:    { bg: '#735797', text: '#fff', border: '#5E4780', glow: 'rgba(115,87,151,0.4)' },
  dragon:   { bg: '#6F35FC', text: '#fff', border: '#5A2AD4', glow: 'rgba(111,53,252,0.4)' },
  dark:     { bg: '#705746', text: '#fff', border: '#5C473A', glow: 'rgba(112,87,70,0.4)' },
  steel:    { bg: '#B7B7CE', text: '#333', border: '#9D9DB4', glow: 'rgba(183,183,206,0.4)' },
  fairy:    { bg: '#D685AD', text: '#fff', border: '#BC6E95', glow: 'rgba(214,133,173,0.4)' },
};

export const TYPE_COLOR_LIST = Object.keys(TYPE_COLORS);
