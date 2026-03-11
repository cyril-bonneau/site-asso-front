/**
 * Barrel export du dossier services/.
 *
 * Permet d'importer n'importe quel service depuis "@/services"
 * sans avoir à connaître le fichier exact.
 *
 * Exemple : import { httpClient, HttpError } from "@/services";
 * Exemple : import * as authService from "@/services/authService";
 */

export { httpClient, HttpError } from "./httpClient";
export * as authService from "./authService";
export * as associationService from "./associationService";
