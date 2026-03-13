/**
 * Service de données utilisateur.
 *
 * Ce module gère les appels à l'endpoint /user du backend.
 * Il est intentionnellement séparé de authService :
 * les données personnelles (prénom, nom, email) ne transitent PAS
 * dans les flux d'authentification — elles sont récupérées ici,
 * à la demande, par les composants qui en ont besoin.
 *
 * Principe RGPD de minimisation : chaque endpoint ne retourne
 * que les données strictement nécessaires à sa fonction.
 */

import { httpClient } from "@/services/httpClient";
import type { UserProfileResponse } from "@/types";

/**
 * Récupère le profil personnel de l'utilisateur connecté.
 *
 * Appelle GET /user avec le Bearer token de l'utilisateur.
 * Retourne email, prénom, nom et date de dernière mise à jour.
 *
 * @param accessToken - JWT de l'utilisateur (rôle USER requis par le backend)
 * @returns Profil utilisateur encapsulé dans UserProfileResponse
 * @throws HttpError avec status 401 si le token est absent, invalide ou expiré
 * @throws HttpError avec status 403 si le rôle USER est insuffisant
 */
export async function getUserProfile(accessToken: string): Promise<UserProfileResponse> {
  return httpClient.get<UserProfileResponse>("/user", accessToken);
}
