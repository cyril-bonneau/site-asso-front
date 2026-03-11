/**
 * Layout partagé pour les pages d'authentification (login, register).
 *
 * Ce composant fournit une mise en page centrée avec :
 * - Un fond gris clair (slate-50) sur toute la hauteur d'écran
 * - Une carte blanche centrée contenant le titre de l'application
 *   et le formulaire (rendu via <Outlet />)
 *
 * Le titre "Gestion Asso" sert de point d'ancrage visuel et de branding.
 */

import { Outlet } from "react-router-dom";

/**
 * Layout centré pour les pages d'authentification.
 * Utilisé par LoginPage et RegisterPage via le router.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        {/* Titre de l'application */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Gestion Asso</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gérez vos associations simplement
          </p>
        </div>

        {/* Contenu de la page (formulaire login ou register) */}
        <Outlet />
      </div>
    </div>
  );
}
