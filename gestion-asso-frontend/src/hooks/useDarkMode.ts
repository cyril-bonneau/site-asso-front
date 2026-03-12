/**
 * Hook de gestion du mode sombre.
 *
 * - Lit la préférence initiale depuis localStorage (clé "color-scheme"),
 *   avec repli sur la préférence système (prefers-color-scheme).
 * - Applique ou retire la classe "dark" sur <html> à chaque changement.
 * - Persiste le choix dans localStorage.
 *
 * La classe est appliquée dès l'initialisation du state (dans le lazy initializer)
 * pour éviter un flash de thème incorrect au premier rendu.
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "color-scheme";

/**
 * Lit la préférence de thème et applique immédiatement la classe sur <html>.
 * Appelé une seule fois comme lazy initializer de useState.
 */
function readAndApplyInitialTheme(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  let isDark: boolean;

  if (stored === "dark") {
    isDark = true;
  } else if (stored === "light") {
    isDark = false;
  } else {
    // Aucune préférence enregistrée : on suit le système
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // Application immédiate pour éviter le flash de thème
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  return isDark;
}

/**
 * Gère le basculement entre mode clair et sombre.
 *
 * @returns isDark — true si le mode sombre est actif
 * @returns toggle — fonction pour basculer entre les deux modes
 */
export function useDarkMode(): { isDark: boolean; toggle: () => void } {
  const [isDark, setIsDark] = useState(readAndApplyInitialTheme);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  function toggle(): void {
    setIsDark((prev) => !prev);
  }

  return { isDark, toggle };
}
