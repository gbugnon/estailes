/** Échappe le HTML : le contenu vient du CMS, on ne lui fait pas confiance. */
const echapper = (t: string) =>
  t.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

/**
 * Convertit `**mot**` en surlignage jaune.
 *
 * Le seul balisage autorisé dans les champs texte du CMS : elle tape des
 * doubles astérisques autour du mot à mettre en avant, sans rien connaître au
 * HTML. Tout le reste est échappé, donc rien d'autre ne peut être injecté.
 */
export const surligner = (texte: string) =>
  echapper(texte).replace(
    /\*\*(.+?)\*\*/g,
    '<mark class="surlignage">$1</mark>',
  );
