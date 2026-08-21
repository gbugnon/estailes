import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Noms d'icônes disponibles. Toute valeur ajoutée ici doit aussi être ajoutée
 * dans src/components/Icon.astro et dans public/admin/config.yml.
 */
const iconName = z.enum([
  'coeur',
  'temps',
  'presence',
  'liens',
  'respect',
  'nature',
  'douceur',
  'pieds',
  'tete',
  'energie',
  'famille',
]);

/**
 * Point focal d'une photo — quelle partie garder visible quand elle est
 * recadrée dans un cercle ou un arc. Correspond aux options du CMS et aux
 * valeurs object-position gérées dans src/components/Photo.astro.
 */
const positionPhoto = z.enum([
  'centre',
  'haut',
  'bas',
  'gauche',
  'droite',
  'haut-gauche',
  'haut-droite',
  'bas-gauche',
  'bas-droite',
]);

const prestations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/prestations' }),
  schema: z.object({
    titre: z.string(),
    sous_titre: z.string().optional(),
    icone: iconName,
    extrait: z.string(),
    image: z.string(),
    image_alt: z.string(),
    image_position: positionPhoto.optional(),
    duree: z.string().optional(),
    prix: z.string().optional(),
    ordre: z.number(),
    meta_description: z.string(),
  }),
});

const valeurs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/valeurs' }),
  schema: z.object({
    titre: z.string(),
    description: z.string(),
    icone: iconName,
    ordre: z.number(),
  }),
});

const ligneTarif = z.object({
  prestation: z.string(),
  duree: z.string().optional(),
  prix: z.string(),
  note: z.string().optional(),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    titre: z.string(),
    meta_description: z.string(),

    // En-tête de page (toutes les pages)
    hero_titre: z.string(),
    hero_script: z.string().optional(),
    hero_intro: z.string().optional(),
    hero_image: z.string().optional(),
    hero_image_alt: z.string().optional(),
    hero_image_position: positionPhoto.optional(),
    hero_cta_texte: z.string().optional(),
    hero_cta_lien: z.string().optional(),

    // Accueil uniquement
    valeurs_titre: z.string().optional(),
    valeurs_intro: z.string().optional(),
    prestations_titre: z.string().optional(),
    prestations_intro: z.string().optional(),
    apropos_surtitre: z.string().optional(),
    apropos_titre: z.string().optional(),
    apropos_script: z.string().optional(),
    apropos_texte: z.string().optional(),
    apropos_cta_texte: z.string().optional(),
    apropos_cta_lien: z.string().optional(),
    apropos_image: z.string().optional(),
    apropos_image_alt: z.string().optional(),
    apropos_image_position: positionPhoto.optional(),

    // Tarifs uniquement
    tarifs: z.array(ligneTarif).optional(),
    tarifs_note: z.string().optional(),

    // Rendez-vous uniquement — l'emplacement réservé au module de réservation.
    // Coller ici le code d'intégration (Cal.com, Calendly, Acuity) le jour venu :
    // rien d'autre ne doit changer.
    reservation_embed: z.string().optional(),

    // Ateliers uniquement
    ateliers: z
      .array(
        z.object({
          titre: z.string(),
          public: z.string().optional(),
          duree: z.string().optional(),
          description: z.string(),
        }),
      )
      .optional(),
  }),
});

// Les paramètres du site (téléphone, adresse, réseaux…) sont chargés depuis
// src/lib/parametres.ts — voir le commentaire dans ce fichier.
export const collections = { prestations, valeurs, pages };
