import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { parametres as p } from '../lib/parametres';

/**
 * /llms.txt — résumé du site pour les moteurs génératifs (ChatGPT, Claude,
 * Perplexity). Convention en cours d'adoption : un Markdown court à la racine,
 * pour qu'un modèle n'ait pas à reconstituer la structure depuis le HTML.
 *
 * Généré depuis le contenu plutôt qu'écrit à la main : elle modifie une
 * prestation ou un tarif dans le CMS, le fichier suit tout seul.
 */
export const GET: APIRoute = async ({ site }) => {
  const url = (chemin: string) => new URL(chemin, site).href;
  const prestations = (await getCollection('prestations')).sort(
    (a, b) => a.data.ordre - b.data.ordre,
  );

  const lignes = [
    `# ${p.nom_site}`,
    '',
    `> ${p.accroche}. Cabinet de réflexologie plantaire, massage crânien, soins`,
    `> énergétiques et ateliers parent-enfant à ${p.adresse_ligne2}, canton de Fribourg,`,
    '> Suisse. Séances sur rendez-vous, en français.',
    '',
    '## Prestations',
    '',
    ...prestations.map((s) => {
      const d = s.data;
      const detail = [d.duree, d.prix].filter(Boolean).join(', ');
      return `- [${d.titre}](${url(`/prestations/${s.id}/`)}) — ${d.extrait}${detail ? ` (${detail})` : ''}`;
    }),
    '',
    '## Informations pratiques',
    '',
    `- Adresse : ${p.adresse_ligne1}, ${p.adresse_ligne2}, Suisse`,
    `- Téléphone : ${p.telephone}`,
    `- E-mail : ${p.email}`,
    ...(p.horaires ? [`- Disponibilité : ${p.horaires}`] : []),
    '- Paiement : espèces ou TWINT en fin de séance, facture sur demande',
    // Le remboursement n'est mentionné que si elle est effectivement agréée.
    // Sinon on n'ouvre pas le sujet : la facture sur demande suffit à indiquer
    // que la séance est à sa charge.
    ...(p.asca_rme_actif && p.asca_rme_texte ? [`- Remboursement : ${p.asca_rme_texte}`] : []),
    '',
    '## Pages',
    '',
    `- [Prestations](${url('/prestations/')}) — les quatre soins en détail`,
    `- [Tarifs](${url('/tarifs/')}) — grille complète et conditions d’annulation`,
    `- [Ateliers](${url('/ateliers/')}) — ateliers parent-enfant`,
    `- [À propos](${url('/a-propos/')}) — parcours et façon de travailler`,
    `- [Contact](${url('/contact/')}) — coordonnées et accès`,
    `- [Prendre rendez-vous](${url('/rendez-vous/')})`,
    '',
  ];

  return new Response(lignes.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
