/**
 * Configuration centrale de l'application.
 *
 * Ce fichier regroupe toutes les constantes partagées à travers l'app.
 * Modifier ici plutôt que de répéter les valeurs dans chaque service.
 */

// ---------------------------------------------------------------------------
// Validation de l'URL de l'API (fail-fast)
// ---------------------------------------------------------------------------

/**
 * Valide que l'URL de base de l'API est présente et bien formée.
 *
 * SÉCURITÉ : une URL manquante ou malformée pourrait rediriger silencieusement
 * les requêtes (et les tokens JWT) vers un hôte non prévu. On échoue donc
 * immédiatement au démarrage de l'app avec un message explicite plutôt que
 * de découvrir le problème tardivement à l'exécution.
 *
 * @param rawUrl - Valeur brute de la variable d'environnement
 * @throws Error si l'URL est absente ou syntaxiquement invalide
 */
function validateApiBaseUrl(rawUrl: string): void {
  if (rawUrl.trim() === "") {
    throw new Error(
      "Configuration manquante : VITE_API_BASE_URL n'est pas définie. " +
        "Ajoutez-la dans votre fichier .env.development ou .env.production."
    );
  }

  try {
    // Le constructeur URL lève une exception si la syntaxe est invalide
    new URL(rawUrl);
  } catch {
    throw new Error(
      `Configuration invalide : VITE_API_BASE_URL="${rawUrl}" n'est pas une URL valide. ` +
        "Exemple attendu : https://xxxxxxxxxx.execute-api.eu-west-3.amazonaws.com"
    );
  }
}

// ---------------------------------------------------------------------------
// Constantes exportées
// ---------------------------------------------------------------------------

/**
 * URL de base de l'API backend (AWS API Gateway).
 * Lue depuis la variable d'environnement Vite et validée au démarrage.
 * Le replace() supprime un éventuel slash final pour éviter les doubles slashes
 * lors de la construction des URLs (ex: API_BASE_URL + "/login").
 */
export const API_BASE_URL = (() => {
  const rawUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  validateApiBaseUrl(rawUrl);
  return rawUrl.replace(/\/$/, "");
})();

/**
 * Marge avant expiration de l'access token à partir de laquelle
 * on déclenche un refresh proactif (5 minutes en millisecondes).
 */
export const ACCESS_TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

/**
 * Nombre maximum de tentatives de refresh silencieux du token
 * avant de considérer la session comme expirée.
 */
export const MAX_SILENT_REFRESH_RETRIES = 2;
