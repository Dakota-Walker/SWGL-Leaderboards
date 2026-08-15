export const THEME = {
  dark: {
    background: '#16171f',
    card: '#1e202b',
    accent: '#e3a83b',
    text: '#f2ede2',
    muted: '#807d76',
    border: '#2c2e3a',
    error: '#ff7a6b',
  },
  light: {
    background: '#faf6ec',
    card: '#ffffff',
    accent: '#c9862a',
    text: '#242018',
    muted: '#8a8578',
    border: '#e7e0cf',
    error: '#b00020',
  },
};

export type ThemeName = keyof typeof THEME;
export type Theme = (typeof THEME)[ThemeName];
