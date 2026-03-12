/**
 * Composant racine de l'application.
 *
 * Imbrique les providers dans le bon ordre :
 * 1. ThemeProvider   — applique la classe "dark" sur <html> et expose le toggle
 * 2. QueryProvider   — fournit le cache React Query à toute l'app
 * 3. AuthProvider    — fournit l'état de session et les actions auth
 * 4. RouterProvider  — gère la navigation entre les pages
 *
 * ThemeProvider est le plus externe car le thème doit s'appliquer
 * à l'ensemble de l'arborescence, y compris les spinners des guards.
 */

import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "@/contexts/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { router } from "@/router/router";

/**
 * Composant App — point d'entrée de l'arborescence React.
 */
export default function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
