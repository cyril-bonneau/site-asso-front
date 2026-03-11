/**
 * Types liés aux associations gérées dans l'application.
 *
 * Une association est l'entité centrale du domaine métier :
 * elle peut avoir un logo, des membres, des événements, etc.
 */

// ---------------------------------------------------------------------------
// Modèle association
// ---------------------------------------------------------------------------

/**
 * Représentation complète d'une association telle que renvoyée par le backend.
 * Les champs optionnels peuvent être absents si l'association
 * vient d'être créée et n'est pas encore complètement renseignée.
 */
export type Association = {
  assoId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  createdAt?: string;
  ownerId?: string;
};

// ---------------------------------------------------------------------------
// Payloads des requêtes
// ---------------------------------------------------------------------------

/**
 * Corps de la requête PUT /addasso pour créer une nouvelle association.
 * Le champ "logoKey" est la clé S3 obtenue après un upload via /requesturl.
 */
export type CreateAssociationPayload = {
  name: string;
  description?: string;
  logoKey?: string;
};

// ---------------------------------------------------------------------------
// Réponses spécifiques
// ---------------------------------------------------------------------------

/**
 * Réponse de l'endpoint PUT /requesturl.
 * Contient l'URL présignée S3 pour uploader un fichier directement
 * depuis le navigateur (sans passer par le backend pour le binaire).
 */
export type UploadUrlResponse = {
  /** URL présignée AWS S3 valide pour un PUT HTTP direct */
  uploadUrl: string;
  /** Clé S3 du fichier, à réutiliser lors de la création de l'association */
  key: string;
};
