/**
 * Configuration du router de l'application.
 *
 * Ce fichier définit toutes les routes de l'application et leur hiérarchie.
 *
 * Architecture des routes :
 * ├── /                  → redirigé vers /login (GuestRoute)
 * ├── GuestRoute         → accessible uniquement aux visiteurs non connectés
 * │   └── AuthLayout
 * │       ├── /login     → LoginPage
 * │       └── /register  → RegisterPage
 * ├── ProtectedRoute     → accessible uniquement aux utilisateurs connectés
 * │   └── MainLayout
 * │       └── /dashboard → DashboardPage
 * └── *                  → NotFoundPage (404)
 */

import { createBrowserRouter } from "react-router-dom";
import { GuestRoute } from "@/router/GuestRoute";
import { ProtectedRoute } from "@/router/ProtectedRoute";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

/**
 * Instance du router créée avec createBrowserRouter (API React Router v7).
 *
 * L'imbrication des routes reflète l'imbrication des layouts :
 * - Les routes "guest" partagent AuthLayout (page centrée avec carte)
 * - Les routes "protected" partagent MainLayout (header + sidebar + contenu)
 */
export const router = createBrowserRouter([
  // ---------------------------------------------------------------------------
  // Routes publiques (visiteurs non connectés)
  // ---------------------------------------------------------------------------
  {
    // GuestRoute vérifie que l'utilisateur n'est PAS connecté
    // et redirige vers /dashboard si c'est le cas
    element: <GuestRoute />,
    children: [
      {
        // AuthLayout : fond centré avec la carte de connexion/inscription
        element: <AuthLayout />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
          {
            path: "/register",
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Routes protégées (utilisateurs connectés uniquement)
  // ---------------------------------------------------------------------------
  {
    // ProtectedRoute vérifie que l'utilisateur EST connecté
    // et redirige vers /login si ce n'est pas le cas
    element: <ProtectedRoute />,
    children: [
      {
        // MainLayout : header sticky + sidebar + zone de contenu
        element: <MainLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Route racine : redirige vers /login (prise en charge par GuestRoute)
  // ---------------------------------------------------------------------------
  {
    path: "/",
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <LoginPage />,
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Route 404 : toute URL non reconnue affiche NotFoundPage
  // ---------------------------------------------------------------------------
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
