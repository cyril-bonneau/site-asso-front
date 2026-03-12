/**
 * Service d'authentification.
 *
 * Ce module regroupe toutes les fonctions qui communiquent avec
 * les endpoints d'authentification du backend AWS.
 *
 * Chaque fonction est responsable d'une seule opération,
 * et retourne directement les données typées de la réponse.
 *
 * -------------------------------------------------------------------------
 * SÉCURITÉ — Déduplication du refresh token (prévention race condition)
 * -------------------------------------------------------------------------
 * Si plusieurs requêtes API échouent avec 401 simultanément (ex: token expiré
 * pendant que plusieurs appels sont en vol), elles déclencheraient toutes
 * un appel à /refresh en même temps.
 *
 * Problème avec la rotation des refresh tokens :
 * - Le 1er appel réussit et le backend émet un NOUVEAU refresh token
 * - Le backend invalide l'ancien refresh token
 * - Les appels suivants reçoivent 401 → logout involontaire de l'utilisateur
 *
 * Solution : la variable "ongoingRefreshPromise" agit comme un verrou.
 * Si un refresh est déjà en cours, tout appelant supplémentaire reçoit
 * la MÊME promesse plutôt qu'une nouvelle requête réseau.
 */

import { httpClient } from "@/services/httpClient";
import type {
  AuthSuccessResponse,
  LoginPayload,
  RefreshTokenResponse,
  RegisterPayload,
  UpdatePasswordPayload,
  UpdateUserPayload,
} from "@/types";

/**
 * Connecte un utilisateur existant.
 *
 * Le backend vérifie les identifiants et retourne un access token JWT
 * dans le body + pose un refresh token en cookie httpOnly.
 *
 * SÉCURITÉ : email et password transitent dans le body JSON (POST),
 * jamais dans l'URL ou les query params qui apparaissent dans les logs.
 *
 * @param payload - Email et mot de passe de l'utilisateur
 * @returns La réponse du backend avec l'access token et l'userId
 */
export async function login(payload: LoginPayload): Promise<AuthSuccessResponse> {
  return httpClient.post<AuthSuccessResponse>("/login", payload);
}

/**
 * Crée un nouveau compte utilisateur.
 *
 * @param payload - Email, mot de passe, prénom et nom du nouvel utilisateur
 * @returns La réponse du backend avec l'access token et l'userId du compte créé
 */
export async function register(payload: RegisterPayload): Promise<AuthSuccessResponse> {
  return httpClient.put<AuthSuccessResponse>("/registerUser", payload);
}

/**
 * Promesse de refresh en cours d'exécution.
 *
 * null  = aucun refresh en cours, le prochain appel déclenchera une requête réseau.
 * non-null = un refresh est déjà en vol, les appelants supplémentaires
 *            doivent attendre cette promesse plutôt d'en créer une nouvelle.
 *
 * Ce verrou est réinitialisé à null dès que la promesse se termine
 * (succès ou échec), dans le bloc "finally".
 */
let ongoingRefreshPromise: Promise<RefreshTokenResponse> | null = null;

/**
 * Rafraîchit l'access token grâce au refresh token httpOnly.
 *
 * Le navigateur envoie automatiquement le cookie de refresh token
 * grâce à credentials: "include" configuré dans httpClient.
 *
 * SÉCURITÉ — Déduplication : si cette fonction est appelée plusieurs fois
 * simultanément (ex: plusieurs requêtes reçoivent 401 en même temps),
 * une seule requête réseau est effectuée. Tous les appelants reçoivent
 * le résultat de cette unique requête, ce qui évite d'invalider le refresh
 * token par rotation concurrente.
 *
 * @returns Un nouvel access token et le profil utilisateur associé
 * @throws HttpError avec status 401 si le refresh token est absent, invalide ou expiré
 */
export async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  // Si un refresh est déjà en cours, retourner la promesse existante
  // plutôt que de déclencher une seconde requête réseau
  if (ongoingRefreshPromise !== null) {
    return ongoingRefreshPromise;
  }

  // Aucun refresh en cours : lancer la requête et enregistrer la promesse
  ongoingRefreshPromise = httpClient.post<RefreshTokenResponse>("/refresh");

  try {
    return await ongoingRefreshPromise;
  } finally {
    // Réinitialiser le verrou que la requête ait réussi ou échoué,
    // pour permettre un prochain refresh si nécessaire
    ongoingRefreshPromise = null;
  }
}

/**
 * Met à jour le profil de l'utilisateur connecté.
 *
 * @param payload     - Champs à modifier (tous optionnels)
 * @param accessToken - JWT de l'utilisateur connecté (requis par le backend)
 */
export async function updateUser(
  payload: UpdateUserPayload,
  accessToken: string
): Promise<void> {
  await httpClient.patch<void>("/updateUser", payload, accessToken);
}

/**
 * Change le mot de passe de l'utilisateur connecté.
 *
 * @param payload     - Mot de passe actuel et nouveau mot de passe
 * @param accessToken - JWT de l'utilisateur connecté (requis par le backend)
 */
export async function updatePassword(
  payload: UpdatePasswordPayload,
  accessToken: string
): Promise<void> {
  await httpClient.patch<void>("/updatePassword", payload, accessToken);
}

/**
 * Supprime définitivement le compte de l'utilisateur connecté.
 *
 * @param accessToken - JWT de l'utilisateur connecté (requis par le backend)
 */
export async function deleteAccount(accessToken: string): Promise<void> {
  await httpClient.delete<void>("/removeAuthUser", accessToken);
}
