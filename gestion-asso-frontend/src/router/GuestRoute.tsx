/**
 * Guard de route pour les pages réservées aux visiteurs non connectés.
 *
 * Ce composant est l'inverse de ProtectedRoute :
 * il empêche un utilisateur déjà connecté d'accéder aux pages de login/register
 * en le redirigeant automatiquement vers le tableau de bord.
 *
 * Comportement selon l'état d'authentification :
 * - "idle" ou "loading"  → affiche un spinner (le refresh silencieux est en cours)
 * - "authenticated"      → redirige vers /dashboard
 * - "unauthenticated"    → rend le contenu de la route (<Outlet />)
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Composant guard qui réserve les routes aux utilisateurs non connectés.
 *
 * Utilise <Outlet /> de react-router-dom pour rendre les routes enfants
 * définies dans le router lorsque l'utilisateur n'est pas authentifié.
 */
export function GuestRoute() {
  const { status } = useAuth();

  // L'état "idle" ou "loading" signifie que le refresh silencieux est encore en cours.
  // On affiche un indicateur de chargement pour éviter un flash de redirection.
  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          {/* Spinner animé */}
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
        </div>
      </div>
    );
  }

  // Déjà connecté : redirection vers le tableau de bord
  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  // Visiteur non connecté : on rend le contenu de la route enfant
  return <Outlet />;
}
