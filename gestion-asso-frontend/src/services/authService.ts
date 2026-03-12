/**
 * Service d'authentification.
 *
 * Ce module regroupe toutes les fonctions qui communiquent avec
 * les endpoints d'authentification du backend AWS.
 *
 * Chaque fonction est responsable d'une seule opération,
 * et retourne directement les données typées de la réponse.
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
 * Rafraîchit l'access token grâce au refresh token httpOnly.
 *
 * Le navigateur envoie automatiquement le cookie de refresh token
 * grâce à credentials: "include" configuré dans httpClient.
 *
 * @returns Un nouvel access token et l'userId associé
 * @throws HttpError avec status 401 si le refresh token est absent, invalide ou expiré
 */
export async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  return httpClient.post<RefreshTokenResponse>("/refresh");
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
