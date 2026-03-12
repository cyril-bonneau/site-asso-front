/**
 * Page tableau de bord — accueil de l'espace connecté.
 *
 * Affiche un message de bienvenue personnalisé et des cartes de résumé
 * pour les principales sections de l'application.
 *
 * Les compteurs sont à 0 pour l'instant ; ils seront branchés
 * sur de vraies données via React Query dans les prochaines étapes.
 */

import { useAuth } from "@/contexts/AuthContext";

/**
 * Page principale affichée après connexion.
 * Point d'entrée de l'espace connecté.
 */
export function DashboardPage() {
  const { user } = useAuth();

  // Préférence d'affichage : prénom si disponible, sinon userId comme identifiant de secours
  const displayName = user?.firstName ?? user?.userId ?? "utilisateur";

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête de la page */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tableau de bord</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Bienvenue, <span className="font-medium text-slate-700 dark:text-slate-200">{displayName}</span> !
        </p>
      </div>

      {/* Grille de cartes de résumé */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Mes associations"
          count={0}
          description="Associations dont vous êtes membre ou responsable"
        />
        <DashboardCard
          title="Événements à venir"
          count={0}
          description="Événements planifiés dans les 30 prochains jours"
        />
        <DashboardCard
          title="Notifications"
          count={0}
          description="Messages et alertes en attente de lecture"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composant interne : DashboardCard
// ---------------------------------------------------------------------------

type DashboardCardProps = {
  /** Titre de la carte (ex: "Mes associations") */
  title: string;
  /** Valeur numérique affichée en grand (compteur) */
  count: number;
  /** Texte descriptif sous le compteur */
  description: string;
};

/**
 * Carte de résumé du tableau de bord.
 * Affiche un titre, un compteur et une description.
 *
 * Composant interne, non exporté (utilisé uniquement dans DashboardPage).
 */
function DashboardCard({ title, count, description }: DashboardCardProps) {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 transition-colors duration-200">
      <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h2>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{count}</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{description}</p>
    </div>
  );
}
