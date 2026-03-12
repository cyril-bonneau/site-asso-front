/**
 * Service de gestion des associations.
 *
 * Ce module regroupe toutes les fonctions qui communiquent avec
 * les endpoints d'association du backend AWS.
 *
 * Le workflow de création d'association avec logo est :
 * 1. Appeler requestUploadUrl() pour obtenir une URL présignée S3
 * 2. Uploader le fichier directement sur S3 via uploadFileToS3()
 * 3. Appeler createAssociation() avec la clé S3 retournée à l'étape 1
 */

import { httpClient } from "@/services/httpClient";
import type { Association, CreateAssociationPayload, UploadUrlResponse } from "@/types";

/**
 * Crée une nouvelle association.
 *
 * @param payload     - Nom, description et clé S3 du logo (optionnels sauf nom)
 * @param accessToken - JWT de l'utilisateur connecté (requis)
 * @returns L'association créée avec son identifiant généré par le backend
 */
export async function createAssociation(
  payload: CreateAssociationPayload,
  accessToken: string
): Promise<Association> {
  return httpClient.put<Association>("/addasso", payload, accessToken);
}

/**
 * Demande au backend une URL présignée AWS S3 pour uploader un logo.
 *
 * Cette URL est temporaire (quelques minutes) et permet au navigateur
 * d'uploader directement sur S3 sans passer par le backend pour le binaire,
 * ce qui réduit la charge et les coûts Lambda.
 *
 * @param accessToken - JWT de l'utilisateur connecté (requis)
 * @returns L'URL présignée et la clé S3 à conserver pour createAssociation()
 */
export async function requestUploadUrl(accessToken: string): Promise<UploadUrlResponse> {
  return httpClient.put<UploadUrlResponse>("/requesturl", {}, accessToken);
}

/**
 * Types MIME autorisés pour les logos d'association.
 *
 * SÉCURITÉ : whitelist stricte — tout type non listé est refusé avant même
 * l'appel réseau. Cela empêche l'upload de fichiers exécutables ou malveillants
 * déguisés en images (le navigateur ne peut pas garantir la fiabilité de file.type).
 *
 * Note : la validation finale reste côté backend (Lambda + S3), cette
 * vérification côté client est une première barrière de défense en profondeur.
 */
const ALLOWED_LOGO_MIME_TYPES: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

/** Taille maximale autorisée pour un logo (2 Mo) */
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

/**
 * Upload un fichier directement sur AWS S3 via l'URL présignée.
 *
 * Cette requête va directement vers S3 (pas via notre API Gateway),
 * donc on utilise fetch natif sans passer par httpClient
 * (pas besoin du header Authorization ni de credentials: "include").
 *
 * @param uploadUrl - URL présignée obtenue via requestUploadUrl()
 * @param file      - Fichier image à uploader (sélectionné par l'utilisateur)
 * @throws Error si le type ou la taille du fichier n'est pas autorisé
 * @throws Error si le PUT sur S3 échoue
 */
export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  // --- Validation du type MIME (défense en profondeur côté client) ---
  // file.type est fourni par le navigateur et peut être truqué, mais
  // filtrer ici réduit la surface d'attaque et améliore l'UX (erreur immédiate).
  if (!ALLOWED_LOGO_MIME_TYPES.has(file.type)) {
    throw new Error(
      `Format de fichier non autorisé : "${file.type}". ` +
        "Formats acceptés : JPEG, PNG, WebP, SVG."
    );
  }

  // --- Validation de la taille du fichier ---
  if (file.size > MAX_LOGO_SIZE_BYTES) {
    const maxMb = MAX_LOGO_SIZE_BYTES / (1024 * 1024);
    throw new Error(
      `Le fichier dépasse la taille maximale autorisée (${maxMb} Mo).`
    );
  }

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      // Le Content-Type doit correspondre exactement au type défini
      // lors de la génération de l'URL présignée côté backend.
      // La validation ci-dessus garantit qu'on n'envoie que des types autorisés.
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Échec de l'upload S3 (status ${response.status})`);
  }
}
