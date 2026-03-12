/**
 * Layout principal pour les pages authentifiées.
 *
 * Ce composant fournit la structure commune de l'application connectée :
 * - Un header sticky en haut avec le nom de l'app, les infos utilisateur et la déconnexion
 * - Une sidebar à gauche visible à partir de md (tablette)
 * - Une zone de contenu principale qui rend la page active via <Outlet />
 *
 * Sur mobile, la sidebar est masquée et le contenu occupe toute la largeur.
 */

import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Layout complet pour les utilisateurs authentifiés.
 * Contient le header, la sidebar et la zone de contenu.
 */
export function MainLayout() {
  const { user, logout } = useAuth();
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
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* ------------------------------------------------------------------ */}
      {/* Header sticky */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
        {/* Logo / Nom de l'application */}
        <Link
          to="/dashboard"
          className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors"
        >
          Gestion Asso
        </Link>

        {/* Informations utilisateur + bouton déconnexion */}
        <div className="flex items-center gap-4">
          {/*
           * Affichage du nom de l'utilisateur dans l'ordre de priorité :
           * 1. Prénom + Nom si les deux sont disponibles
           * 2. Email seul sinon
           * 3. userId en dernier recours
           */}
          <span className="hidden text-sm text-slate-600 sm:block">
            {user?.firstName !== undefined && user?.lastName !== undefined
              ? `${user.firstName} ${user.lastName}`
              : (user?.email ?? user?.userId ?? "Utilisateur")}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
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
        <aside className="hidden w-56 flex-shrink-0 border-r border-slate-200 bg-white md:block">
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
            ? "bg-blue-50 text-blue-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}
