/**
 * Stockage sécurisé de l'access token JWT en mémoire JavaScript.
 *
 * SÉCURITÉ : le token n'est JAMAIS persisté dans localStorage, sessionStorage
 * ou un cookie accessible en JavaScript. Le stocker dans ces emplacements
 * exposerait l'application aux attaques XSS (Cross-Site Scripting).
 *
 * En mémoire, le token disparaît à chaque rechargement de page —
 * c'est intentionnel : le refresh token (httpOnly cookie) permet
 * de renouveler l'access token de façon transparente via /refreshToken.
 *
 * Pattern singleton : la variable privée est encapsulée dans ce module,
 * inaccessible depuis l'extérieur sauf via les fonctions exportées.
 */

/** Valeur en mémoire de l'access token. null = pas de session active. */
let currentAccessToken: string | null = null;

/**
 * Stocke l'access token reçu du backend en mémoire JavaScript.
 *
 * @param token - Le JWT access token retourné par /login ou /refreshToken
 */
export function setAccessToken(token: string): void {
  currentAccessToken = token;
}

/**
 * Retourne l'access token actuellement en mémoire.
 *
 * @returns Le token JWT, ou null si aucune session n'est active
 */
export function getAccessToken(): string | null {
  return currentAccessToken;
}

/**
 * Efface le token de la mémoire.
 * À appeler lors de la déconnexion de l'utilisateur.
 */
export function clearAccessToken(): void {
  currentAccessToken = null;
}
