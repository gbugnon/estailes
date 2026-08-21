import { z } from 'astro:content';
import donnees from '../content/parametres/site.json';

/**
 * Les paramètres du site vivent dans un fichier JSON unique plutôt que dans une
 * collection de contenu : Sveltia écrit un objet JSON simple, ce que le loader
 * `file()` d'Astro ne sait pas lire tel quel. On le charge donc directement, en
 * validant le contenu au build pour que le site casse ici — de façon lisible —
 * plutôt qu'à l'affichage.
 */
const schema = z.object({
  nom_site: z.string(),
  accroche: z.string(),
  telephone: z.string(),
  telephone_lien: z.string(),
  email: z.string().email(),
  adresse_ligne1: z.string(),
  adresse_ligne2: z.string(),
  horaires: z.string().optional(),
  citation: z.string().optional(),
  citation_auteur: z.string().optional(),
  cta_titre: z.string(),
  cta_script: z.string().optional(),
  cta_texte: z.string(),
  cta_bouton: z.string(),
  asca_rme_actif: z.boolean(),
  asca_rme_texte: z.string().optional(),
  reseaux: z.array(
    z.object({
      nom: z.enum(['facebook', 'instagram', 'linkedin']),
      url: z.string().url(),
    }),
  ),
});

export const parametres = schema.parse(donnees);

export type Parametres = typeof parametres;
