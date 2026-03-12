/**
 * Contexte de thème (mode clair / sombre).
 *
 * Encapsule le hook useDarkMode et expose isDark + toggle
 * à toute l'arborescence. Doit être placé au-dessus de RouterProvider
 * dans App.tsx pour que le toggle soit disponible dans tous les layouts.
 */

import { createContext, useContext, type ReactNode } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";

type ThemeContextValue = {
  /** true si le mode sombre est actif */
  isDark: boolean;
  /** Bascule entre mode clair et sombre */
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
};

/**
 * Fournit le thème (clair/sombre) et le toggle à toute l'arborescence enfant.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { isDark, toggle } = useDarkMode();
  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook pour accéder au thème courant et au toggle depuis n'importe quel composant.
 *
 * @throws Error si appelé en dehors d'un ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error(
      "useTheme() doit être utilisé à l'intérieur d'un composant <ThemeProvider>."
    );
  }
  return ctx;
}
