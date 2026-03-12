/**
 * Page de liste des associations.
 *
 * Page placeholder — sera complétée avec la liste des associations
 * de l'utilisateur connecté, chargée via React Query.
 */

/**
 * Composant de la page "Mes associations".
 * Affiche la liste des associations dont l'utilisateur est membre ou responsable.
 */
export function AssociationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mes associations</h1>
        <p className="mt-1 text-slate-500">
          Liste de toutes les associations auxquelles vous appartenez.
        </p>
      </div>

      {/* Contenu à venir : liste des associations */}
      <p className="text-sm text-slate-400">Aucune association pour l'instant.</p>
    </div>
  );
}
