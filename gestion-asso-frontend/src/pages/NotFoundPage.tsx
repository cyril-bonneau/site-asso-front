/**
 * Page 404 — URL non reconnue.
 *
 * Affichée lorsque l'utilisateur tente d'accéder à une route
 * qui n'existe pas dans le router de l'application.
 * Propose un lien de retour vers /dashboard.
 */

import { Link } from "react-router-dom";

/**
 * Page d'erreur 404 simple et lisible.
 * Centré verticalement et horizontalement sur la hauteur de l'écran.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      {/* Code d'erreur */}
      <p className="text-8xl font-black text-slate-200">404</p>

      {/* Message principal */}
      <h1 className="text-2xl font-bold text-slate-800">Page introuvable</h1>

      {/* Description */}
      <p className="max-w-sm text-slate-500">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>

      {/* Lien de retour */}
      <Link
        to="/dashboard"
        className="mt-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
