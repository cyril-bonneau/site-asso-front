/**
 * Page de connexion.
 *
 * Formulaire contrôlé permettant à un utilisateur existant de se connecter.
 * Après connexion réussie, le router redirige automatiquement vers /dashboard
 * (géré par GuestRoute qui détecte le changement de status à "authenticated").
 *
 * Gestion des erreurs : les codes d'erreur backend sont mappés
 * vers des messages explicites en français pour l'utilisateur.
 */

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HttpError } from "@/services";
import type { ApiErrorCode } from "@/types";

/**
 * Mappe un code d'erreur backend vers un message lisible en français.
 *
 * @param code - Code d'erreur retourné par le backend, ou undefined
 * @returns Message d'erreur à afficher à l'utilisateur
 */
function getErrorMessage(code: ApiErrorCode | undefined): string {
  switch (code) {
    case "WRONG_CREDENTIALS":
      return "Email ou mot de passe incorrect.";
    case "AUTH_NOT_FOUND":
      return "Aucun compte trouvé avec cet email.";
    case "RATE_LIMIT_EXCEEDED":
      return "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
    default:
      return "Une erreur est survenue. Veuillez réessayer.";
  }
}

/**
 * Composant de la page de connexion.
 *
 * Formulaire avec deux champs (email, mot de passe) et gestion d'erreur.
 * Désactive le bouton pendant la soumission pour éviter les double-clics.
 */
export function LoginPage() {
  const { login } = useAuth();

  // Valeurs des champs du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // État de la soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Gère la soumission du formulaire.
   * Appelle login() du contexte Auth et gère les erreurs backend.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login({ email, password });
      // La redirection est gérée automatiquement par GuestRoute
      // qui observe le changement de status à "authenticated"
    } catch (error) {
      if (error instanceof HttpError) {
        const errorCode = error.body?.code;
        setErrorMessage(getErrorMessage(errorCode));
      } else {
        // Erreur réseau : le serveur n'a pas répondu
        setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-slate-800">Connexion</h2>

      <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-4">
        {/* Champ email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.fr"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Champ mot de passe */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Message d'erreur */}
        {errorMessage !== null && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Connexion en cours…" : "Se connecter"}
        </button>
      </form>

      {/* Lien vers l'inscription */}
      <p className="mt-6 text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
          S'inscrire
        </Link>
      </p>
    </div>
  );
}
