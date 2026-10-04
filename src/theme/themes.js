/**
 * Theme registry. Colors live in themes.css (one `[data-theme]` block per id below);
 * this file only lists ids, display names, and which tokens the menu swatches show.
 * Keep THEME_IDS in sync with the inline no-flash script in index.html.
 */
export const THEMES = [
  {
    id: 'porcelain',
    name: 'Porcelain',
    note: 'Light · neutral with Sui blue',
    swatches: ['--bg', '--soft', '--primary'],
  },
  {
    id: 'studio-sage',
    name: 'Studio Sage',
    note: 'Light · warm sage',
    swatches: ['--bg', '--soft', '--primary'],
  },
  {
    id: 'midnight-sui',
    name: 'Midnight Sui',
    note: 'Dark · charcoal, blue and teal',
    swatches: ['--surface', '--deco-2', '--primary'],
  },
];

export const DEFAULT_THEME = 'porcelain';
export const THEME_STORAGE_KEY = 'tyr-theme';
export const MOTION_STORAGE_KEY = 'tyr-motion';
