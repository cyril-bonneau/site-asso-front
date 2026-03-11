/**
 * Composant racine de l'application.
 *
 * Imbrique les providers dans le bon ordre :
 * 1. QueryProvider   — fournit le cache React Query à toute l'app
 * 2. AuthProvider    — fournit l'état de session et les actions auth
 * 3. RouterProvider  — gère la navigation entre les pages
 *
 * L'ordre est important : AuthProvider utilise potentiellement React Query
 * (pour invalider le cache lors d'un logout), donc il doit être à l'intérieur
 * de QueryProvider.
 */

import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "@/contexts/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { router } from "@/router/router";

/**
 * Composant App — point d'entrée de l'arborescence React.
 */
export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>
  );
}
