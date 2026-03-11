/**
 * Configuration centrale de l'application.
 *
 * Ce fichier regroupe toutes les constantes partagées à travers l'app.
 * Modifier ici plutôt que de répéter les valeurs dans chaque service.
 */

/**
 * URL de base de l'API backend (AWS API Gateway).
 * Lue depuis la variable d'environnement Vite.
 * Le replace() supprime un éventuel slash final pour éviter les doubles slashes
 * lors de la construction des URLs (ex: API_BASE_URL + "/login").
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

/**
 * Marge avant expiration de l'access token à partir de laquelle
 * on déclenche un refresh silencieux (5 minutes en millisecondes).
 */
export const ACCESS_TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

/**
 * Nombre maximum de tentatives de refresh silencieux du token
 * avant de considérer la session comme expirée.
 */
export const MAX_SILENT_REFRESH_RETRIES = 2;
