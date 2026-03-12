/**
 * Page de création d'une nouvelle association.
 *
 * Page placeholder — sera complétée avec le formulaire de création
 * (nom, description, upload de logo via URL présignée S3).
 */

/**
 * Composant de la page "Nouvelle association".
 * Permet à l'utilisateur de créer une nouvelle association.
 */
export function CreateAssociationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle association</h1>
        <p className="mt-1 text-slate-500">
          Créez une nouvelle association et configurez ses informations.
        </p>
      </div>

      {/* Contenu à venir : formulaire de création */}
      <p className="text-sm text-slate-400">Formulaire de création à venir.</p>
    </div>
  );
}
