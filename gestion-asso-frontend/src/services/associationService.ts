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
 * Upload un fichier directement sur AWS S3 via l'URL présignée.
 *
 * Cette requête va directement vers S3 (pas via notre API Gateway),
 * donc on utilise fetch natif sans passer par httpClient
 * (pas besoin du header Authorization ni de credentials: "include").
 *
 * @param uploadUrl - URL présignée obtenue via requestUploadUrl()
 * @param file      - Fichier à uploader (sélectionné par l'utilisateur)
 * @throws Error si le PUT sur S3 échoue
 */
export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      // Le Content-Type doit correspondre exactement au type défini
      // lors de la génération de l'URL présignée côté backend
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Échec de l'upload S3 (status ${response.status})`);
  }
}
