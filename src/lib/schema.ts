/**
 * Fabriques de données structurées. Un seul nœud d'entreprise existe sur le site,
 * déclaré par le layout ; tout le reste s'y rattache par `@id` au lieu de le
 * redéclarer, pour que les moteurs voient une entité et non quatorze.
 */

/** Identifiant stable du cabinet, ancré sur l'accueil. */
export const idEntreprise = (site: URL | undefined) => new URL('/#entreprise', site).href;

/** « CHF 90.– » → « 90 ». undefined si le champ ne contient aucun nombre. */
const montant = (prix?: string) => prix?.match(/\d+(?:\.\d+)?/)?.[0];

interface Prestation {
  titre: string;
  extrait: string;
  prix?: string;
}

/**
 * Une prestation, rattachée au cabinet. La durée reste hors schéma : schema.org
 * n'a pas de champ propre pour la longueur d'une séance, et la détourner
 * produirait une donnée fausse. Elle est lisible dans le texte de la page.
 */
export function serviceSchema(c: Prestation, url: string, site: URL | undefined) {
  const prix = montant(c.prix);
  return {
    '@type': 'Service',
    '@id': `${url}#prestation`,
    name: c.titre,
    description: c.extrait,
    serviceType: c.titre,
    provider: { '@id': idEntreprise(site) },
    areaServed: [
      { '@type': 'City', name: 'Lentigny' },
      { '@type': 'AdministrativeArea', name: 'Canton de Fribourg' },
    ],
    ...(prix && {
      offers: {
        '@type': 'Offer',
        price: prix,
        priceCurrency: 'CHF',
        availability: 'https://schema.org/InStock',
        url,
      },
    }),
  };
}

/**
 * Catalogue des prestations, alimenté par la grille tarifaire de /tarifs.
 *
 * Elle propose plus de séances que le site n'a de fiches — réflexologie enfant,
 * soin à distance, soin personnalisé n'ont pas de page à elles. Ce catalogue les
 * déclare quand même aux moteurs, à partir de la seule liste qu'elle tient déjà
 * à jour dans le CMS. Ajouter une ligne à la grille suffit à l'y faire entrer.
 */
export function catalogueSchema(
  lignes: { prestation: string; duree?: string; prix: string }[] | undefined,
  site: URL | undefined,
) {
  const offres = (lignes ?? []).flatMap((l) => {
    const prix = montant(l.prix);
    return prix
      ? [
          {
            '@type': 'Offer',
            price: prix,
            priceCurrency: 'CHF',
            availability: 'https://schema.org/InStock',
            itemOffered: {
              '@type': 'Service',
              name: l.prestation,
              serviceType: l.prestation,
              provider: { '@id': idEntreprise(site) },
            },
          },
        ]
      : [];
  });

  return offres.length
    ? { '@type': 'OfferCatalog', name: 'Prestations', itemListElement: offres }
    : undefined;
}

/** Fil d'Ariane : chaque étape est { nom, url } ; la dernière est la page courante. */
export function filAriane(etapes: { nom: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: etapes.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: e.nom,
      item: e.url,
    })),
  };
}
