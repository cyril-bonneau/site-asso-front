/**
 * Provider TanStack Query (React Query).
 *
 * Ce composant configure et expose le QueryClient à toute l'application.
 * Il centralise les paramètres globaux de cache et de gestion des requêtes :
 * - staleTime  : durée pendant laquelle les données sont considérées fraîches
 * - retry      : nombre de tentatives automatiques en cas d'échec
 * - refetchOnWindowFocus : désactivé pour éviter les rechargements intempestifs
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * Instance unique du QueryClient partagée dans toute l'application.
 *
 * Exportée séparément pour permettre des opérations impératives
 * (ex: invalidation de cache depuis le contexte Auth après login).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Les données sont considérées fraîches pendant 5 minutes.
      // Passé ce délai, elles seront re-fetchées au prochain rendu du composant.
      staleTime: 5 * 60 * 1000,

      // Une seule tentative automatique en cas d'échec réseau
      // (la première requête + 1 retry = 2 tentatives au total)
      retry: 1,

      // Désactivé : évite les appels réseau superflus quand l'utilisateur
      // revient sur l'onglet depuis une autre application
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Aucune tentative automatique pour les mutations :
      // une erreur d'écriture doit être traitée immédiatement par l'UI
      retry: 0,
    },
  },
});

// ---------------------------------------------------------------------------
// Composant QueryProvider
// ---------------------------------------------------------------------------

type QueryProviderProps = {
  children: ReactNode;
};

/**
 * Composant wrapper qui fournit le QueryClient à toute l'arborescence enfant.
 *
 * Doit être placé le plus haut possible dans l'arbre de composants,
 * avant AuthProvider et RouterProvider.
 *
 * @param children - Composants enfants qui auront accès aux hooks React Query
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
