/**
 * Contexte d'authentification de l'application.
 *
 * Ce fichier est le cœur de la gestion de session :
 * - Il maintient l'état de l'utilisateur connecté (ou non)
 * - Il expose les actions login, register, logout, getToken
 * - Au montage, il tente silencieusement de renouveler la session
 *   via le refresh token httpOnly (invisible à JavaScript)
 *
 * L'access token JWT est stocké exclusivement en mémoire via tokenStore —
 * JAMAIS dans localStorage ou sessionStorage (protection XSS).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MAX_SILENT_REFRESH_RETRIES } from "@/config";
import { authService, HttpError } from "@/services";
import type { AuthStatus, AuthUser, LoginPayload, RegisterPayload } from "@/types";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/utils/tokenStore";

// ---------------------------------------------------------------------------
// Forme du contexte exposé aux composants enfants
// ---------------------------------------------------------------------------

type AuthContextValue = {
  /** Utilisateur actuellement connecté, ou null si non authentifié */
  user: AuthUser | null;

  /** État du cycle de vie de la session (idle → loading → authenticated/unauthenticated) */
  status: AuthStatus;

  /**
   * Connecte l'utilisateur : appelle le backend, stocke le token en mémoire
   * et met à jour l'état du contexte.
   */
  login: (payload: LoginPayload) => Promise<void>;

  /**
   * Crée un compte et connecte l'utilisateur immédiatement après.
   */
  register: (payload: RegisterPayload) => Promise<void>;

  /**
   * Déconnecte l'utilisateur : efface le token en mémoire et réinitialise l'état.
   * Note : le cookie httpOnly de refresh token sera invalidé au prochain appel backend.
   */
  logout: () => void;

  /**
   * Retourne l'access token actuellement en mémoire.
   * À utiliser dans les appels API protégés.
   */
  getToken: () => string | null;
};

// ---------------------------------------------------------------------------
// Création du contexte
// ---------------------------------------------------------------------------

/**
 * Contexte React pour l'authentification.
 * Initialisé à null — le hook useAuth() vérifie que la valeur est non-null.
 */
const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

type AuthProviderProps = {
  children: ReactNode;
};

/**
 * Fournit l'état d'authentification et les actions à toute l'arborescence enfant.
 *
 * Au montage, tente un refresh silencieux de la session via le cookie httpOnly.
 * Si le refresh réussit → l'utilisateur est considéré authentifié.
 * Si le refresh échoue (401) → l'utilisateur est redirigé vers /login par les guards.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");

  // Ref pour éviter les mises à jour d'état sur un composant démonté
  // (ex: si l'utilisateur navigue vite avant que le refresh se termine)
  const isCancelledRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Refresh silencieux au montage
  // ---------------------------------------------------------------------------

  useEffect(() => {
    isCancelledRef.current = false;
    setStatus("loading");

    /**
     * Tente de renouveler la session avec retry.
     * Le navigateur envoie automatiquement le cookie de refresh token.
     */
    async function attemptSilentRefresh(retriesLeft: number): Promise<void> {
      try {
        const response = await authService.refreshAccessToken();

        // Si le composant a été démonté entre-temps, on abandonne
        if (isCancelledRef.current) return;

        // Succès : on stocke le token et on marque l'utilisateur comme authentifié
        setAccessToken(response.accessToken);
        setUser({ userId: response.userId });
        setStatus("authenticated");
      } catch (error) {
        if (isCancelledRef.current) return;

        const isUnauthorized = error instanceof HttpError && error.status === 401;

        if (isUnauthorized || retriesLeft <= 0) {
          // Pas de session valide : on passe en mode non-authentifié
          clearAccessToken();
          setUser(null);
          setStatus("unauthenticated");
        } else {
          // Erreur réseau temporaire : on réessaie
          await attemptSilentRefresh(retriesLeft - 1);
        }
      }
    }

    void attemptSilentRefresh(MAX_SILENT_REFRESH_RETRIES);

    // Cleanup : marque le composant comme démonté pour éviter les setState tardifs
    return () => {
      isCancelledRef.current = true;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Actions exposées aux composants
  // ---------------------------------------------------------------------------

  /**
   * Connecte l'utilisateur en appelant le backend, puis stocke le token.
   * Lève une HttpError en cas d'identifiants incorrects (à gérer dans le formulaire).
   */
  const login = useCallback(async (payload: LoginPayload): Promise<void> => {
    const response = await authService.login(payload);
    setAccessToken(response.accessToken);
    setUser({ userId: response.userId });
    setStatus("authenticated");
  }, []);

  /**
   * Crée un compte puis connecte immédiatement l'utilisateur.
   * Lève une HttpError en cas d'email déjà utilisé ou mot de passe trop faible.
   */
  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    const response = await authService.register(payload);
    setAccessToken(response.accessToken);
    setUser({ userId: response.userId });
    setStatus("authenticated");
  }, []);

  /**
   * Déconnecte l'utilisateur côté frontend.
   * L'expiration du cookie httpOnly sera gérée côté serveur.
   */
  const logout = useCallback((): void => {
    clearAccessToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  /**
   * Retourne le token JWT en mémoire pour les appels API protégés.
   */
  const getToken = useCallback((): string | null => {
    return getAccessToken();
  }, []);

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------

  const contextValue: AuthContextValue = {
    user,
    status,
    login,
    register,
    logout,
    getToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook d'accès au contexte
// ---------------------------------------------------------------------------

/**
 * Hook pour accéder au contexte d'authentification depuis n'importe quel composant.
 *
 * @throws Error si appelé en dehors d'un AuthProvider (détecte les oublis de wrapping)
 *
 * @example
 * const { user, login, logout, status } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth() doit être utilisé à l'intérieur d'un composant <AuthProvider>. " +
        "Vérifiez que AuthProvider entoure bien votre arborescence de composants dans App.tsx."
    );
  }

  return context;
}
