/**
 * Page d'inscription.
 *
 * Formulaire contrôlé permettant de créer un nouveau compte utilisateur.
 * Inclut une validation côté client (mots de passe identiques, longueur minimum)
 * avant d'envoyer la requête au backend.
 *
 * Après inscription réussie, le contexte Auth est mis en "authenticated"
 * et GuestRoute redirige automatiquement vers /dashboard.
 */

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HttpError } from "@/services";
import type { ApiErrorCode } from "@/types";

/** Longueur minimum requise pour le mot de passe */
const PASSWORD_MIN_LENGTH = 8;

/**
 * Filtre et assainit un tableau de "reasons" renvoyé par le backend.
 *
 * SÉCURITÉ : les "reasons" proviennent du backend et ne doivent pas être
 * affichées brutes. Même si React échappe le contenu texte (pas de XSS direct),
 * un backend compromis pourrait injecter des messages trompeurs ou de l'Unicode
 * malveillant. On filtre donc avec une regex et on limite le nombre affiché.
 *
 * @param reasons - Tableau brut de raisons envoyées par le backend
 * @returns Tableau filtré contenant uniquement des messages sûrs
 */
function sanitizeReasons(reasons: string[] | undefined): string[] {
  if (reasons === undefined || reasons.length === 0) {
    return [];
  }

  return (
    reasons
      // Ne garder que les chaînes contenant des caractères "normaux" (lettres, chiffres, ponctuation courante)
      .filter((reason) => /^[\w\s\-\.,àâäéèêëîïôùûüçÀÂÄÉÈÊËÎÏÔÙÛÜÇ']+$/u.test(reason))
      // Tronquer les messages trop longs pour éviter l'affichage de texte excessif
      .map((reason) => (reason.length > 100 ? reason.slice(0, 100) + "…" : reason))
      // Limiter à 3 raisons maximum affichées à l'utilisateur
      .slice(0, 3)
  );
}

/**
 * Mappe un code d'erreur backend vers un message lisible en français.
 * Les "reasons" du backend sont sanitizées avant affichage.
 *
 * @param code    - Code d'erreur retourné par le backend, ou undefined
 * @param reasons - Détails optionnels des règles non respectées (filtrés avant affichage)
 * @returns Message d'erreur à afficher à l'utilisateur
 */
function getErrorMessage(code: ApiErrorCode | undefined, reasons?: string[]): string {
  const safeReasons = sanitizeReasons(reasons);

  switch (code) {
    case "EMAIL_ALREADY_EXISTS":
      return "Cette adresse email est déjà utilisée. Essayez de vous connecter.";
    case "WEAK_PASSWORD":
      return safeReasons.length > 0
        ? `Mot de passe trop faible : ${safeReasons.join(", ")}.`
        : "Le mot de passe ne respecte pas les critères de sécurité.";
    case "RATE_LIMIT_EXCEEDED":
      return "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
    case "VALIDATION_ERROR":
      return safeReasons.length > 0
        ? `Données invalides : ${safeReasons.join(", ")}.`
        : "Les données saisies sont invalides.";
    default:
      return "Une erreur est survenue lors de la création du compte. Veuillez réessayer.";
  }
}

/**
 * Composant de la page d'inscription.
 *
 * Formulaire avec 5 champs (prénom, nom, email, mot de passe, confirmation).
 * Prénom et nom sont affichés côte à côte sur 2 colonnes sur les grands écrans.
 */
export function RegisterPage() {
  const { register } = useAuth();

  // Valeurs des champs du formulaire
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // État de la soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Gère la soumission du formulaire.
   * Valide les données côté client avant d'appeler register() du contexte.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    // --- Validation côté client ---

    if (password.length < PASSWORD_MIN_LENGTH) {
      setErrorMessage(
        `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    // --- Appel au backend ---

    setIsSubmitting(true);

    try {
      await register({ firstName, lastName, email, password });
      // La redirection est gérée automatiquement par GuestRoute
    } catch (error) {
      if (error instanceof HttpError) {
        const errorCode = error.body?.code;
        const reasons = error.body?.reasons;
        setErrorMessage(getErrorMessage(errorCode, reasons));
      } else {
        setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-slate-800">Créer un compte</h2>

      <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-4">
        {/* Prénom et nom sur 2 colonnes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="firstName" className="text-sm font-medium text-slate-700">
              Prénom
            </label>
            <input
              id="firstName"
              type="text"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Marie"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
              Nom
            </label>
            <input
              id="lastName"
              type="text"
              required
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Dupont"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>

        {/* Email */}
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

        {/* Mot de passe */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Confirmation du mot de passe */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Répétez le mot de passe"
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
          {isSubmitting ? "Création en cours…" : "Créer mon compte"}
        </button>
      </form>

      {/* Lien vers la connexion */}
      <p className="mt-6 text-center text-sm text-slate-500">
        Déjà un compte ?{" "}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
