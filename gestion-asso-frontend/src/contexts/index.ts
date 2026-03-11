/**
 * Barrel export du dossier contexts/.
 *
 * Permet d'importer providers et hooks depuis "@/contexts"
 * sans connaître le fichier exact.
 *
 * Exemple : import { useAuth, AuthProvider } from "@/contexts/AuthContext";
 * Exemple : import { QueryProvider, queryClient } from "@/contexts/QueryProvider";
 */

export { AuthProvider, useAuth } from "./AuthContext";
export { QueryProvider, queryClient } from "./QueryProvider";
