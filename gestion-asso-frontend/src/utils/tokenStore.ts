/**
 * Stockage sécurisé de l'access token JWT en mémoire JavaScript.
 *
 * SÉCURITÉ : le token n'est JAMAIS persisté dans localStorage, sessionStorage
 * ou un cookie accessible en JavaScript. Le stocker dans ces emplacements
 * exposerait l'application aux attaques XSS (Cross-Site Scripting).
 *
 * En mémoire, le token disparaît à chaque rechargement de page —
 * c'est intentionnel : le refresh token (httpOnly cookie) permet
 * de renouveler l'access token de façon transparente via /refresh.
 *
 * Pattern singleton : la variable privée est encapsulée dans ce module,
 * inaccessible depuis l'extérieur sauf via les fonctions exportées.
 */

/**
 * Valeur en mémoire de l'access token. null = pas de session active.
 *
 * SÉCURITÉ — NE JAMAIS logger cette variable ni la valeur de getAccessToken().
 * Un token JWT dans les DevTools ou une capture d'écran partagée expose
 * immédiatement la session de l'utilisateur.
 *
 * Si vous devez déboguer, loggez uniquement les premiers caractères :
 *   console.debug("Token présent:", currentAccessToken !== null);
 *   console.debug("Token début:", currentAccessToken?.slice(0, 10) + "...");
 */
let currentAccessToken: string | null = null;

/**
 * Stocke l'access token reçu du backend en mémoire JavaScript.
 *
 * @param token - Le JWT access token retourné par /login ou /refresh
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

// ---------------------------------------------------------------------------
// Décodage du payload JWT (lecture côté client, sans vérification de signature)
// ---------------------------------------------------------------------------

/**
 * Payload décodé d'un access token JWT.
 * Contient les informations de session encodées par le backend.
 */
export type DecodedTokenPayload = {
  /** Identifiant unique de l'utilisateur */
  userId: string;
  /** Liste des rôles de l'utilisateur (ex: ["USER"] ou ["USER", "ADMIN"]) */
  privilege: string[];
};

/**
 * Décode le payload base64url d'un JWT sans vérifier sa signature.
 *
 * Fonction interne partagée entre les fonctions exportées de ce module.
 * La vérification cryptographique de la signature est effectuée exclusivement
 * côté backend — ce décodage côté frontend sert uniquement à lire les claims.
 *
 * @param token - JWT (format "header.payload.signature")
 * @returns Objet JSON du payload, ou null si le token est malformé
 */
function decodePayloadBase64url(token: string): Record<string, unknown> | null {
  try {
    // Un JWT est composé de 3 parties séparées par "."
    const parts = token.split(".");
    if (parts.length !== 3 || parts[1] === undefined) return null;

    // Décodage base64url → base64 standard → JSON
    // base64url remplace "+" par "-" et "/" par "_"
    const base64Standard = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = atob(base64Standard);
    const payload: unknown = JSON.parse(payloadJson);

    if (typeof payload !== "object" || payload === null) return null;

    return payload as Record<string, unknown>;
  } catch {
    // Token malformé ou payload non-JSON
    return null;
  }
}

/**
 * Extrait les claims de session (userId, privilege) du payload JWT.
 *
 * SÉCURITÉ : ne vérifie PAS la signature — utilisé uniquement pour lire
 * les claims côté frontend (affichage du rôle, planification du refresh).
 * Le backend re-vérifie la signature à chaque appel protégé.
 *
 * @param token - JWT access token
 * @returns { userId, privilege } ou null si le payload est illisible ou incomplet
 */
export function decodeAccessTokenPayload(token: string): DecodedTokenPayload | null {
  const payload = decodePayloadBase64url(token);
  if (payload === null) return null;

  // Extraction du claim "userId" (identifiant de l'utilisateur)
  const userId = typeof payload["userId"] === "string" ? payload["userId"] : null;
  if (userId === null) return null;

  // Extraction du claim "privilege" (liste des rôles) — tableau vide par défaut
  const privilege = Array.isArray(payload["privilege"])
    ? (payload["privilege"] as string[])
    : [];

  return { userId, privilege };
}

/**
 * Extrait le timestamp d'expiration (claim "exp") d'un JWT access token.
 *
 * Cette fonction ne vérifie PAS la signature du token — elle se contente
 * de lire le payload base64url pour planifier un refresh avant expiration.
 * La vérification cryptographique de la signature est effectuée côté backend.
 *
 * @param token - JWT access token (format "header.payload.signature")
 * @returns Timestamp d'expiration en millisecondes depuis epoch, ou null si non lisible
 */
export function getTokenExpirationMs(token: string): number | null {
  const payload = decodePayloadBase64url(token);
  if (payload === null) return null;

  // Extraction du claim "exp" (secondes depuis epoch) → conversion en ms
  if ("exp" in payload && typeof payload["exp"] === "number") {
    return payload["exp"] * 1000;
  }

  return null;
}
