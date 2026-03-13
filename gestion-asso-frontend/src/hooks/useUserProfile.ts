/**
 * Hook pour récupérer le profil personnel de l'utilisateur connecté.
 *
 * Utilise React Query pour appeler GET /user et mettre en cache
 * les données personnelles (prénom, nom, email) séparément de la session.
 *
 * Ce hook ne se déclenche que lorsque l'utilisateur est authentifié,
 * évitant tout appel inutile pendant le chargement ou en mode déconnecté.
 *
 * Séparation des responsabilités (RGPD) :
 * - useAuth()        → données de session (userId, privilege, status)
 * - useUserProfile() → données personnelles (firstName, lastName, email)
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services";
import type { UserProfileResponse } from "@/types";

/**
 * Données de profil personnel retournées par le hook.
 * Correspond au champ "data" de UserProfileResponse.
 */
export type UserProfile = UserProfileResponse["data"];

/**
 * Récupère et met en cache le profil utilisateur via GET /user.
 *
 * - Déclenché uniquement quand status === "authenticated"
 * - Données considérées fraîches pendant 5 minutes (staleTime)
 * - En cas d'erreur, profile est undefined et error contient le détail
 *
 * @returns { profile, isLoading, error }
 *
 * @example
 * const { profile, isLoading } = useUserProfile();
 * if (isLoading) return <Spinner />;
 * return <p>{profile?.firstName} {profile?.lastName}</p>;
 */
export function useUserProfile(): {
  profile: UserProfile | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const { status, getToken } = useAuth();

  const { data, isLoading, error } = useQuery<UserProfileResponse, Error, UserProfile>({
    queryKey: ["userProfile"],

    /**
     * Appelle GET /user avec le Bearer token en mémoire.
     * La query est désactivée si l'utilisateur n'est pas authentifié,
     * donc getToken() ne devrait jamais retourner null ici.
     */
    queryFn: async (): Promise<UserProfileResponse> => {
      const token = getToken();
      if (token === null) throw new Error("Aucun access token disponible");
      return userService.getUserProfile(token);
    },

    // N'exécuter la requête que si l'utilisateur est authentifié et le token disponible
    enabled: status === "authenticated" && getToken() !== null,

    // Les données personnelles changent rarement — 5 minutes de cache sans re-fetch
    staleTime: 5 * 60 * 1000,

    // Extraire directement le champ "data" pour simplifier la consommation dans les composants
    select: (response: UserProfileResponse): UserProfile => response.data,
  });

  return {
    profile: data,
    isLoading,
    error,
  };
}
