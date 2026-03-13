/**
 * Types liés aux échanges avec l'API backend.
 *
 * Ce fichier centralise la forme des requêtes et réponses HTTP
 * pour garantir la cohérence entre les services et le backend AWS.
 */

// ---------------------------------------------------------------------------
// Réponses génériques
// ---------------------------------------------------------------------------

/**
 * Enveloppe générique pour toutes les réponses de l'API.
 * Le champ "data" est optionnel car certains endpoints ne retournent
 * qu'un message de confirmation sans données.
 */
export type ApiResponse<TData> = {
  ok: boolean;
  message: string;
  data?: TData;
};

/**
 * Réponse renvoyée par les endpoints /login et /registerUser.
 *
 * Ne contient que les données de session nécessaires à l'authentification :
 * l'access token JWT (qui encode userId et privilege dans son payload)
 * et l'userId en clair pour les cas où le décodage JWT échouerait.
 *
 * Les données personnelles (prénom, nom, email) sont volontairement absentes
 * de ce flux — principe de minimisation RGPD. Elles sont récupérées
 * séparément via GET /user par les composants qui en ont besoin.
 */
export type AuthSuccessResponse = {
  ok: true;
  userId: string;
  message: string;
  accessToken: string;
};

/**
 * Réponse renvoyée par l'endpoint POST /refresh.
 *
 * Même principe que AuthSuccessResponse : seules les données de session
 * sont retournées, pas les données personnelles.
 */
export type RefreshTokenResponse = {
  ok: true;
  userId: string;
  message: string;
  accessToken: string;
};

/**
 * Réponse renvoyée par GET /user (endpoint protégé, rôle USER requis).
 *
 * Contient les données personnelles de l'utilisateur connecté.
 * C'est le seul endpoint qui retourne ces données — toute autre réponse
 * (login, refresh) ne les inclut pas.
 */
export type UserProfileResponse = {
  ok: true;
  data: {
    email: string;
    firstName: string;
    lastName: string;
    updatedAt: string;
  };
};

// ---------------------------------------------------------------------------
// Codes d'erreur backend connus
// ---------------------------------------------------------------------------

/**
 * Union de tous les codes d'erreur métier retournés par le backend.
 * Permet de mapper chaque code vers un message utilisateur en français.
 */
export type ApiErrorCode =
  | "WRONG_CREDENTIALS"
  | "EMAIL_ALREADY_EXISTS"
  | "WEAK_PASSWORD"
  | "AUTH_NOT_FOUND"
  | "REFRESH_TOKEN_NOT_FOUND"
  | "REFRESH_TOKEN_INVALID"
  | "REFRESH_TOKEN_EXPIRED"
  | "USER_NOT_FOUND"
  | "INTERNAL_ERROR"
  | "RATE_LIMIT_EXCEEDED"
  | "VALIDATION_ERROR";

/**
 * Structure d'une réponse d'erreur de l'API.
 * Le champ "reasons" est présent pour WEAK_PASSWORD et VALIDATION_ERROR
 * afin de détailler les règles non respectées.
 */
export type ApiErrorResponse = {
  ok: false;
  message: string;
  code?: ApiErrorCode;
  reasons?: string[];
};

// ---------------------------------------------------------------------------
// Payloads des requêtes (corps envoyés au serveur)
// ---------------------------------------------------------------------------

/**
 * Corps de la requête PUT /registerUser.
 */
export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/**
 * Corps de la requête POST /login.
 * Les identifiants transitent dans le body JSON, jamais dans l'URL ni les headers,
 * pour éviter qu'ils apparaissent dans les logs de l'API Gateway.
 */
export type LoginPayload = {
  email: string;
  password: string;
};

/**
 * Corps de la requête PATCH /updateUser.
 * Tous les champs sont optionnels : on envoie uniquement ce qui change.
 */
export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

/**
 * Corps de la requête PATCH /updatePassword.
 */
export type UpdatePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
