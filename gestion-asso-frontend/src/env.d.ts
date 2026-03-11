/**
 * Déclaration des types pour les variables d'environnement Vite.
 *
 * Vite expose les variables préfixées "VITE_" via import.meta.env.
 * Ce fichier permet à TypeScript de les connaître et de les typer correctement.
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL de base de l'API AWS API Gateway (sans slash final) */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
