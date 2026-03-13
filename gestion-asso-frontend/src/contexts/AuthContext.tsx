/**
 * Contexte d'authentification de l'application.
 *
 * Ce fichier est le cœur de la gestion de session :
 * - Il maintient l'état de l'utilisateur connecté (ou non)
 * - Il expose les actions login, register, logout, getToken
 * - Au montage, il tente silencieusement de renouveler la session
 *   via le refresh token httpOnly (invisible à JavaScript)
 * - Il planifie un refresh proactif avant l'expiration de l'access token
 *   pour éviter un logout brutal en milieu d'action
 *
 * RGPD — Séparation des responsabilités :
 * Ce contexte ne gère QUE la session (userId + privilege extraits du JWT).
 * Les données personnelles (prénom, nom, email) sont récupérées séparément
 * via useUserProfile() → GET /user, uniquement par les composants qui en ont besoin.
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
import { ACCESS_TOKEN_REFRESH_MARGIN_MS, MAX_SILENT_REFRESH_RETRIES } from "@/config";
import { authService, HttpError } from "@/services";
import type { AuthStatus, AuthUser, LoginPayload, RegisterPayload } from "@/types";
import {
  clearAccessToken,
  decodeAccessTokenPayload,
  getAccessToken,
  getTokenExpirationMs,
  setAccessToken,
} from "@/utils/tokenStore";

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
 * Si le refresh réussit → l'utilisateur est considéré authentifié et un timer
 * de refresh proactif est planifié avant l'expiration du token.
 * Si le refresh échoue (401) → l'utilisateur est redirigé vers /login par les guards.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");

  // Ref pour éviter les mises à jour d'état sur un composant démonté
  // (ex: si l'utilisateur navigue vite avant que le refresh se termine)
  const isCancelledRef = useRef(false);

  // ID du setTimeout de refresh proactif, pour pouvoir l'annuler (logout, démontage)
  const refreshTimerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref vers la dernière version de scheduleProactiveRefresh.
  // Les useCallback avec deps [] capturent une closure — utiliser cette ref
  // dans les callbacks garantit qu'ils appellent toujours la version courante.
  const scheduleProactiveRefreshRef = useRef<((token: string) => void) | null>(null);

  // ---------------------------------------------------------------------------
  // Refresh proactif avant expiration
  // ---------------------------------------------------------------------------

  /**
   * Annule le timer de refresh proactif en cours, s'il existe.
   * À appeler avant de programmer un nouveau timer ou lors de la déconnexion.
   */
  function cancelProactiveRefreshTimer(): void {
    if (refreshTimerIdRef.current !== null) {
      clearTimeout(refreshTimerIdRef.current);
      refreshTimerIdRef.current = null;
    }
  }

  /**
   * Planifie un appel à /refresh avant l'expiration de l'access token.
   *
   * Lit le claim "exp" du JWT pour calculer le délai exact, puis déclenche
   * un refresh ACCESS_TOKEN_REFRESH_MARGIN_MS avant l'expiration. Le nouveau
   * token obtenu replanifie automatiquement le timer suivant (chaîne continue).
   *
   * Si le refresh proactif échoue, l'utilisateur est déconnecté silencieusement
   * plutôt que de le laisser rencontrer une erreur 401 en pleine action.
   *
   * @param accessToken - JWT access token dont on lit le claim "exp"
   */
  function scheduleProactiveRefresh(accessToken: string): void {
    // Annuler tout timer précédent avant d'en programmer un nouveau
    cancelProactiveRefreshTimer();

    const expirationMs = getTokenExpirationMs(accessToken);
    if (expirationMs === null) {
      // Token sans claim "exp" lisible : impossible de planifier automatiquement
      return;
    }

    // Calculer le délai : on veut refresher ACCESS_TOKEN_REFRESH_MARGIN_MS avant expiration
    const delayMs = expirationMs - ACCESS_TOKEN_REFRESH_MARGIN_MS - Date.now();

    if (delayMs <= 0) {
      // Le token expire dans moins que la marge — pas besoin de timer,
      // la prochaine requête protégée déclenchera un refresh via 401
      return;
    }

    refreshTimerIdRef.current = setTimeout(() => {
      if (isCancelledRef.current) return;

      void authService
        .refreshAccessToken()
        .then((response) => {
          if (isCancelledRef.current) return;

          setAccessToken(response.accessToken);

          // Extraire userId et privilege du payload JWT
          const decoded = decodeAccessTokenPayload(response.accessToken);
          setUser({
            userId: decoded?.userId ?? response.userId,
            privilege: decoded?.privilege ?? [],
          });

          // Replanifier un refresh pour le nouveau token
          // On utilise la ref pour éviter les problèmes de closure périmée
          scheduleProactiveRefreshRef.current?.(response.accessToken);
        })
        .catch(() => {
          if (isCancelledRef.current) return;

          // Le refresh proactif a échoué (session expirée côté serveur) :
          // déconnexion silencieuse plutôt qu'une erreur surprise plus tard
          cancelProactiveRefreshTimer();
          clearAccessToken();
          setUser(null);
          setStatus("unauthenticated");
        });
    }, delayMs);
  }

  // Mettre à jour la ref à chaque rendu pour qu'elle pointe toujours
  // vers la version courante de scheduleProactiveRefresh
  scheduleProactiveRefreshRef.current = scheduleProactiveRefresh;

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

        // Succès : stocker le token, extraire les claims du JWT, planifier le prochain refresh
        setAccessToken(response.accessToken);

        const decoded = decodeAccessTokenPayload(response.accessToken);
        setUser({
          userId: decoded?.userId ?? response.userId,
          privilege: decoded?.privilege ?? [],
        });

        setStatus("authenticated");
        scheduleProactiveRefresh(response.accessToken);
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

    // Cleanup : marquer le composant comme démonté + annuler le timer proactif
    return () => {
      isCancelledRef.current = true;
      cancelProactiveRefreshTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Stockage du token en mémoire (jamais en localStorage)
    setAccessToken(response.accessToken);

    // Extraction des claims de session depuis le payload JWT
    const decoded = decodeAccessTokenPayload(response.accessToken);
    setUser({
      userId: decoded?.userId ?? response.userId,
      privilege: decoded?.privilege ?? [],
    });

    setStatus("authenticated");

    // Planifier le refresh proactif via la ref pour éviter la closure périmée
    scheduleProactiveRefreshRef.current?.(response.accessToken);
  }, []);

  /**
   * Crée un compte puis connecte immédiatement l'utilisateur.
   * Lève une HttpError en cas d'email déjà utilisé ou mot de passe trop faible.
   */
  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    const response = await authService.register(payload);

    // Stockage du token en mémoire (jamais en localStorage)
    setAccessToken(response.accessToken);

    // Extraction des claims de session depuis le payload JWT
    const decoded = decodeAccessTokenPayload(response.accessToken);
    setUser({
      userId: decoded?.userId ?? response.userId,
      privilege: decoded?.privilege ?? [],
    });

    setStatus("authenticated");

    // Planifier le refresh proactif via la ref pour éviter la closure périmée
    scheduleProactiveRefreshRef.current?.(response.accessToken);
  }, []);

  /**
   * Déconnecte l'utilisateur côté frontend.
   * Annule le timer de refresh proactif avant de vider la session.
   * L'expiration du cookie httpOnly sera gérée côté serveur.
   */
  const logout = useCallback((): void => {
    // Annuler le timer proactif en premier : évite un refresh fantôme après logout
    cancelProactiveRefreshTimer();
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
