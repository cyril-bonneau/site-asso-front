/**
 * Layout principal pour les pages authentifiées.
 *
 * Ce composant fournit la structure commune de l'application connectée :
 * - Un header sticky en haut avec le nom de l'app, les infos utilisateur et la déconnexion
 * - Un bouton de bascule clair/sombre dans le header
 * - Une sidebar à gauche visible à partir de md (tablette)
 * - Une zone de contenu principale qui rend la page active via <Outlet />
 *
 * Sur mobile, la sidebar est masquée et le contenu occupe toute la largeur.
 */

import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Layout complet pour les utilisateurs authentifiés.
 * Contient le header, la sidebar et la zone de contenu.
 */
export function MainLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  /**
   * Déconnecte l'utilisateur et redirige vers /login.
   * Le token est effacé de la mémoire par logout().
   */
  function handleLogout() {
    logout();
    void navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* ------------------------------------------------------------------ */}
      {/* Header sticky */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 shadow-sm transition-colors duration-200">
        {/* Logo / Nom de l'application */}
        <Link
          to="/dashboard"
          className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Gestion Asso
        </Link>

        {/* Informations utilisateur + toggle thème + bouton déconnexion */}
        <div className="flex items-center gap-3">
          {/*
           * Affichage du nom de l'utilisateur dans l'ordre de priorité :
           * 1. Prénom + Nom si les deux sont disponibles
           * 2. Email seul sinon
           * 3. userId en dernier recours
           */}
          <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:block">
            {user?.firstName !== undefined && user?.lastName !== undefined
              ? `${user.firstName} ${user.lastName}`
              : (user?.email ?? user?.userId ?? "Utilisateur")}
          </span>

          {/* Bouton bascule clair/sombre */}
          <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
            className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Corps : sidebar + contenu */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-1">
        {/* Sidebar : masquée sur mobile, visible à partir de md */}
        <aside className="hidden w-56 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 md:block transition-colors duration-200">
          <nav className="flex flex-col gap-1 p-3">
            <NavItem to="/dashboard" label="Tableau de bord" />
            <NavItem to="/associations" label="Associations" />
            <NavItem to="/associations/new" label="Nouvelle association" />
            <NavItem to="/account" label="Mon compte" />
          </nav>
        </aside>

        {/* Zone de contenu principale */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composant interne : NavItem
// ---------------------------------------------------------------------------

type NavItemProps = {
  /** Chemin vers lequel le lien navigue */
  to: string;
  /** Libellé affiché dans la sidebar */
  label: string;
};

/**
 * Élément de navigation de la sidebar.
 *
 * Utilise NavLink de react-router-dom pour appliquer automatiquement
 * une classe "active" quand le lien correspond à la route courante.
 *
 * Composant interne, non exporté (utilisé uniquement dans MainLayout).
 */
function NavItem({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

// ---------------------------------------------------------------------------
// Icônes inline : soleil et lune
// ---------------------------------------------------------------------------

/** Icône soleil — affiché en mode sombre pour revenir au mode clair */
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

/** Icône lune — affiché en mode clair pour passer au mode sombre */
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
