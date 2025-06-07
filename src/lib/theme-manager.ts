import themes from './themes.json';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface Theme {
  name: string;
  type: 'light' | 'dark';
  colors: ThemeColors;
}

export interface ThemeConfig {
  themes: Record<string, Theme>;
}

const themeConfig: ThemeConfig = themes;

// Get all available themes
export function getAvailableThemes(): Record<string, Theme> {
  return themeConfig.themes;
}

// Get a specific theme by key
export function getTheme(themeKey: string): Theme | null {
  return themeConfig.themes[themeKey] || null;
}

// Get theme keys by type
export function getThemesByType(type: 'light' | 'dark'): string[] {
  return Object.keys(themeConfig.themes).filter(
    key => themeConfig.themes[key].type === type
  );
}

// Apply theme to document root
export function applyTheme(themeKey: string): void {
  const theme = getTheme(themeKey);
  if (!theme) {
    console.warn(`Theme "${themeKey}" not found`);
    return;
  }

  const root = document.documentElement;
  
  // Apply CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case and add -- prefix
    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    // Use hex values directly for better compatibility
    root.style.setProperty(cssVarName, value);
  });

  // Update the theme type class
  if (theme.type === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}

// Get default theme for type
export function getDefaultTheme(type: 'light' | 'dark'): string {
  const themes = getThemesByType(type);
  
  if (type === 'dark') {
    // Prefer kanagawa for dark, fallback to default-dark
    return themes.includes('kanagawa') ? 'kanagawa' : 'default-dark';
  } else {
    // Use default-light for light theme
    return 'default-light';
  }
}

// Get theme type (light/dark) from theme key
export function getThemeType(themeKey: string): 'light' | 'dark' | null {
  const theme = getTheme(themeKey);
  return theme?.type || null;
}