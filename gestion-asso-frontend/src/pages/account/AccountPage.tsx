/**
 * Page de gestion du compte utilisateur.
 *
 * Page placeholder — sera complétée avec les formulaires de :
 * - Modification du profil (prénom, nom, email)
 * - Changement de mot de passe
 * - Suppression du compte
 */

/**
 * Composant de la page "Mon compte".
 * Permet à l'utilisateur de gérer ses informations personnelles.
 */
export function AccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mon compte</h1>
        <p className="mt-1 text-slate-500">
          Gérez vos informations personnelles et votre mot de passe.
        </p>
      </div>

      {/* Contenu à venir : formulaires de gestion du compte */}
      <p className="text-sm text-slate-400">Paramètres du compte à venir.</p>
    </div>
  );
}
