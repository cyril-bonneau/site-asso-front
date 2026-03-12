/**
 * Guard de route pour les pages nécessitant une authentification.
 *
 * Ce composant protège les routes privées en vérifiant l'état de la session.
 * Il doit entourer toutes les routes accessibles uniquement aux utilisateurs connectés.
 *
 * Comportement selon l'état d'authentification :
 * - "idle" ou "loading"  → affiche un spinner (le refresh silencieux est en cours)
 * - "unauthenticated"    → redirige vers /login
 * - "authenticated"      → rend le contenu de la route (<Outlet />)
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Composant guard qui protège les routes nécessitant une session active.
 *
 * Utilise <Outlet /> de react-router-dom pour rendre les routes enfants
 * définies dans le router lorsque l'utilisateur est authentifié.
 */
export function ProtectedRoute() {
  const { status } = useAuth();

  // L'état "idle" ou "loading" signifie que le refresh silencieux est encore en cours.
  // On affiche un indicateur de chargement pour éviter un flash de redirection.
  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          {/* Spinner animé */}
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  // Pas de session valide : redirection vers la page de connexion
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  // Utilisateur authentifié : on rend le contenu de la route enfant
  return <Outlet />;
}
