/**
 * Types liés à l'authentification et à l'utilisateur connecté.
 *
 * Ces types décrivent l'état de la session côté frontend
 * (indépendamment des payloads d'API définis dans api.types.ts).
 */

// ---------------------------------------------------------------------------
// Privilèges utilisateur
// ---------------------------------------------------------------------------

/**
 * Niveau de privilège d'un utilisateur dans l'application.
 * - "USER" : membre standard d'une association
 * - "ADMIN" : administrateur avec accès étendu
 */
export type UserPrivilege = "USER" | "ADMIN";

// ---------------------------------------------------------------------------
// Modèle utilisateur côté frontend
// ---------------------------------------------------------------------------

/**
 * Représentation d'un utilisateur authentifié dans le contexte React.
 *
 * Contient uniquement les données de session extraites du JWT :
 * - userId : identifiant de l'utilisateur
 * - privilege : liste des rôles (pour le contrôle d'accès)
 *
 * Les données personnelles (email, prénom, nom) sont volontairement absentes
 * — principe de minimisation RGPD. Elles sont récupérées à la demande
 * via useUserProfile() qui appelle GET /user.
 */
export type AuthUser = {
  /** Identifiant unique de l'utilisateur */
  userId: string;
  /**
   * Liste des rôles de l'utilisateur tels qu'encodés dans le JWT.
   * Exemple : ["USER"] ou ["USER", "ADMIN"]
   * Utiliser UserPrivilege pour valider un rôle spécifique.
   */
  privilege: string[];
};

// ---------------------------------------------------------------------------
// État du processus d'authentification
// ---------------------------------------------------------------------------

/**
 * État du cycle de vie de l'authentification dans l'AuthContext.
 *
 * - "idle"            : état initial avant la vérification au montage
 * - "loading"         : vérification en cours (refresh silencieux au démarrage)
 * - "authenticated"   : utilisateur connecté, token en mémoire
 * - "unauthenticated" : pas de session valide, redirection vers /login
 */
export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";
