import React, { createContext, useContext, ReactNode } from 'react';
import { theme } from '@/constants/theme';

// Create a context with the theme
const ThemeContext = createContext(theme);

// Create a provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// Create a hook to use the theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}