/**
 * Layout partagé pour les pages d'authentification (login, register).
 *
 * Ce composant fournit une mise en page centrée avec :
 * - Un fond gris clair (slate-50) sur toute la hauteur d'écran
 * - Un bouton de bascule clair/sombre en haut à droite
 * - Une carte blanche centrée contenant le titre de l'application
 *   et le formulaire (rendu via <Outlet />)
 *
 * Le titre "Gestion Asso" sert de point d'ancrage visuel et de branding.
 */

import { Outlet } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Layout centré pour les pages d'authentification.
 * Utilisé par LoginPage et RegisterPage via le router.
 */
export function AuthLayout() {
  const { isDark, toggle } = useTheme();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 transition-colors duration-200">
      {/* Bouton bascule clair/sombre — coin supérieur droit */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
          className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 transition-colors duration-200">
        {/* Titre de l'application */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gestion Asso</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gérez vos associations simplement
          </p>
        </div>

        {/* Contenu de la page (formulaire login ou register) */}
        <Outlet />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icônes inline : soleil et lune
// ---------------------------------------------------------------------------

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
