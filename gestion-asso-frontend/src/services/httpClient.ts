/**
 * Client HTTP typé basé sur fetch natif.
 *
 * Ce module encapsule toute la logique de communication avec le backend :
 * - Préfixage automatique des URLs avec l'URL de base de l'API
 * - Injection du header Authorization si un access token est fourni
 * - Envoi des cookies httpOnly via credentials: "include"
 * - Parsing JSON et levée d'erreurs typées en cas de réponse non-OK
 *
 * On utilise fetch natif (pas Axios) pour minimiser les dépendances
 * et rester proche des standards web modernes.
 *
 * -------------------------------------------------------------------------
 * SÉCURITÉ — CSRF avec SameSite=None
 * -------------------------------------------------------------------------
 * Le cookie de refresh token est configuré avec SameSite=None; Secure côté
 * backend. C'est obligatoire parce que le frontend (CloudFront) et l'API
 * (API Gateway) sont sur des domaines différents — sans SameSite=None, le
 * navigateur ne transmettrait pas le cookie sur les requêtes cross-origin.
 *
 * En contrepartie, SameSite=None ne protège PAS contre le CSRF :
 * le cookie est envoyé depuis n'importe quel domaine. Deux défenses
 * compensatoires sont donc mises en place :
 *
 * 1. Header "X-Requested-With: XMLHttpRequest" (côté frontend — ce fichier)
 *    Les formulaires HTML natifs et les balises <img>/<script> ne peuvent pas
 *    envoyer de headers custom. Seul fetch / XMLHttpRequest le peut.
 *    Le backend DOIT vérifier la présence de ce header pour rejeter les
 *    requêtes provenant de pages malveillantes qui utilisent des formulaires.
 *
 * 2. Vérification de l'header "Origin" (côté backend — AWS Lambda)
 *    Le backend doit s'assurer que Origin correspond au domaine frontend
 *    autorisé (configuré dans CORS). C'est la défense principale.
 */

import { API_BASE_URL } from "@/config";
import type { ApiErrorResponse } from "@/types";

// ---------------------------------------------------------------------------
// Classe d'erreur HTTP
// ---------------------------------------------------------------------------

/**
 * Erreur levée lorsque le serveur répond avec un status HTTP >= 400.
 *
 * Étend Error pour être compatible avec les blocs try/catch classiques.
 * Le champ "body" contient la réponse JSON du backend si elle a pu être
 * parsée, ce qui permet d'accéder au code d'erreur métier.
 */
export class HttpError extends Error {
  /** Status HTTP de la réponse (ex: 401, 404, 500) */
  public readonly status: number;

  /** Corps de la réponse d'erreur parsé, ou null si le parsing a échoué */
  public readonly body: ApiErrorResponse | null;

  constructor(status: number, body: ApiErrorResponse | null, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

// ---------------------------------------------------------------------------
// Options internes de la fonction request
// ---------------------------------------------------------------------------

/**
 * Options acceptées par la fonction interne request().
 */
type RequestOptions = {
  /** Corps de la requête (sera sérialisé en JSON) */
  body?: unknown;

  /**
   * Access token JWT à injecter dans le header Authorization.
   * Si absent, le header n'est pas envoyé (route publique).
   */
  accessToken?: string;
};

// ---------------------------------------------------------------------------
// Fonction de requête centrale
// ---------------------------------------------------------------------------

/**
 * Effectue une requête HTTP vers le backend et retourne la réponse parsée.
 *
 * @param method      - Méthode HTTP (GET, POST, PUT, PATCH, DELETE)
 * @param path        - Chemin de la route, avec slash initial (ex: "/login")
 * @param options     - Corps de la requête et access token optionnels
 * @returns           - La réponse JSON du backend typée en TResponse
 * @throws HttpError  - Si le serveur répond avec un status >= 400
 * @throws Error      - Si la réponse n'est pas du JSON valide
 */
async function request<TResponse>(
  method: string,
  path: string,
  options: RequestOptions = {}
): Promise<TResponse> {
  const { body, accessToken } = options;

  // Construction des headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",

    // SÉCURITÉ — Mitigation CSRF pour SameSite=None
    // Les formulaires HTML natifs ne peuvent pas envoyer ce header custom.
    // Seul du code JavaScript (fetch / XMLHttpRequest) peut l'ajouter.
    // Le backend doit valider sa présence pour distinguer les requêtes légitimes
    // des attaques CSRF envoyées depuis un formulaire sur un site malveillant.
    "X-Requested-With": "XMLHttpRequest",
  };

  // Injection du token Bearer uniquement si fourni
  if (accessToken !== undefined && accessToken !== "") {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Exécution de la requête fetch
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    // credentials: "include" est indispensable pour que le navigateur
    // envoie et reçoive automatiquement les cookies httpOnly (refresh token)
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Parsing de la réponse JSON
  // On tente le parsing même en cas d'erreur pour récupérer le code métier
  let parsedBody: unknown;
  try {
    parsedBody = await response.json();
  } catch {
    // Si le parsing échoue (réponse vide ou non-JSON), on crée un objet minimal
    parsedBody = null;
  }

  // Si la réponse HTTP indique une erreur, on lève HttpError
  if (!response.ok) {
    const errorBody = parsedBody as ApiErrorResponse | null;
    throw new HttpError(
      response.status,
      errorBody,
      errorBody?.message ?? `Erreur HTTP ${response.status}`
    );
  }

  return parsedBody as TResponse;
}

// ---------------------------------------------------------------------------
// Interface publique du client HTTP
// ---------------------------------------------------------------------------

/**
 * Client HTTP exposant les méthodes correspondant aux verbes HTTP courants.
 * Chaque méthode retourne une Promise typée avec la forme de la réponse attendue.
 */
export const httpClient = {
  /**
   * Effectue une requête GET.
   *
   * @param path        - Chemin de la route (ex: "/refreshToken")
   * @param accessToken - Token JWT optionnel pour les routes protégées
   */
  get<TResponse>(path: string, accessToken?: string): Promise<TResponse> {
    return request<TResponse>("GET", path, { accessToken });
  },

  /**
   * Effectue une requête POST avec un corps JSON.
   *
   * @param path        - Chemin de la route (ex: "/login")
   * @param body        - Données à envoyer dans le corps
   * @param accessToken - Token JWT optionnel pour les routes protégées
   */
  post<TResponse>(path: string, body?: unknown, accessToken?: string): Promise<TResponse> {
    return request<TResponse>("POST", path, { body, accessToken });
  },

  /**
   * Effectue une requête PUT avec un corps JSON.
   *
   * @param path        - Chemin de la route (ex: "/registerUser")
   * @param body        - Données à envoyer dans le corps
   * @param accessToken - Token JWT optionnel pour les routes protégées
   */
  put<TResponse>(path: string, body?: unknown, accessToken?: string): Promise<TResponse> {
    return request<TResponse>("PUT", path, { body, accessToken });
  },

  /**
   * Effectue une requête PATCH avec un corps JSON.
   *
   * @param path        - Chemin de la route (ex: "/updateUser")
   * @param body        - Données à envoyer dans le corps
   * @param accessToken - Token JWT requis (route protégée)
   */
  patch<TResponse>(path: string, body?: unknown, accessToken?: string): Promise<TResponse> {
    return request<TResponse>("PATCH", path, { body, accessToken });
  },

  /**
   * Effectue une requête DELETE.
   *
   * @param path        - Chemin de la route (ex: "/removeAuthUser")
   * @param accessToken - Token JWT requis (route protégée)
   */
  delete<TResponse>(path: string, accessToken?: string): Promise<TResponse> {
    return request<TResponse>("DELETE", path, { accessToken });
  },
};
