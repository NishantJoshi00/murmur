'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { applyTheme, getAvailableThemes, getDefaultTheme, getThemeType } from '@/lib/theme-manager';

interface ThemeContextType {
  currentTheme: string;
  setTheme: (theme: string) => void;
  availableThemes: Record<string, any>;
  isDark: boolean;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useCustomTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'kanagawa',
  storageKey = 'murmur-theme',
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [mounted, setMounted] = useState(false);
  const availableThemes = getAvailableThemes();

  // Initialize theme from storage or default
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    const initialTheme = stored && availableThemes[stored] ? stored : defaultTheme;
    setCurrentTheme(initialTheme);
    setMounted(true);
  }, [defaultTheme, storageKey, availableThemes]);

  // Apply theme when it changes
  useEffect(() => {
    if (mounted) {
      applyTheme(currentTheme);
      localStorage.setItem(storageKey, currentTheme);
    }
  }, [currentTheme, mounted, storageKey]);

  const setTheme = (theme: string) => {
    if (availableThemes[theme]) {
      setCurrentTheme(theme);
    }
  };

  const isDark = getThemeType(currentTheme) === 'dark';

  const toggleMode = () => {
    const currentType = getThemeType(currentTheme);
    const newType = currentType === 'dark' ? 'light' : 'dark';
    const newTheme = getDefaultTheme(newType);
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes,
    isDark,
    toggleMode,
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        <ThemeContext.Provider value={{
          currentTheme: defaultTheme,
          setTheme: () => {},
          availableThemes,
          isDark: true,
          toggleMode: () => {},
        }}>
          {children}
        </ThemeContext.Provider>
      </NextThemesProvider>
    );
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={isDark ? 'dark' : 'light'}
      enableSystem={false}
      disableTransitionOnChange={false}
      value={{
        light: 'light',
        dark: 'dark',
      }}
      forcedTheme={isDark ? 'dark' : 'light'}
    >
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}