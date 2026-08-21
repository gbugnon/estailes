# Les sens d'Estelle

Site vitrine d'une praticienne en techniques complémentaires à Lentigny
(canton de Fribourg) : réflexologie plantaire, massage crânien, soin
énergétique, ateliers parent-enfant.

Site **statique**, en français (fr-CH), construit avec **Astro**. Le contenu
s'édite depuis une interface web (**Sveltia CMS**), sans toucher au code. Rien
côté serveur : pas de base de données, pas de framework JavaScript.

---

## Répartition des rôles

- **Estelle (la propriétaire)** modifie les textes et les photos depuis
  `/admin`. Elle n'ouvre jamais ce dépôt.
- **Le développeur** s'occupe du reste (code, déploiement, maintenance).

Tout est pensé pour que : elle puisse changer le contenu seule, et que le site
tienne sans intervention pendant des mois.

---

## Démarrer en local

Prérequis : **Node.js 20** (voir `.nvmrc`).

```bash
npm install
npm run dev
```

Le site tourne sur http://localhost:4321.

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Génère le site dans `dist/` |
| `npm run preview` | Prévisualise le `dist/` construit |
| `npm run check` | Vérifie les types et le contenu |

---

## Structure

```
src/
  content/            ← TOUT le contenu éditable
    prestations/      ← 4 fiches (.md)
    valeurs/          ← 7 valeurs (.md)
    pages/            ← contenu par page (.md)
    parametres/       ← coordonnées, réseaux (site.json)
  components/         ← composants Astro (.astro)
  layouts/            ← gabarit commun (Base.astro)
  pages/              ← routes du site
  styles/global.css   ← jetons de design + styles de base
public/
  admin/             ← interface d'édition Sveltia (config.yml)
  images/            ← photos et illustrations
```

Le modèle de contenu est défini et validé dans
[`src/content.config.ts`](src/content.config.ts) (et
[`src/lib/parametres.ts`](src/lib/parametres.ts) pour les réglages). Toute
modification de la structure doit être répercutée dans
[`public/admin/config.yml`](public/admin/config.yml), sinon le CMS et le site
divergent.

---

## Édition du contenu (pour Estelle)

1. Aller sur **https://lessensdestelle.ch/admin**
2. Se connecter avec le compte **GitHub** autorisé
3. Modifier textes et photos, puis **Publier**

Chaque publication crée un enregistrement sur GitHub. **Le site en ligne, lui,
ne bouge pas encore** : il faut ensuite reconstruire et téléverser (voir
« Déploiement »). C'est la contrepartie de l'hébergement Starter.

---

## Déploiement

**Le déploiement est manuel, et c'est un choix contraint.** Le site est hébergé
sur l'offre **Starter** d'Infomaniak, celle fournie avec le nom de domaine. Son
serveur FTP n'accepte **aucun chiffrement** : il refuse `AUTH TLS`, et les ports
22 (SFTP) et 990 (FTPS implicite) sont fermés. Automatiser depuis GitHub
Actions impliquerait donc d'envoyer le mot de passe FTP en clair sur Internet à
chaque publication. Le workflow a existé, il a été retiré pour cette raison.

Publier une nouvelle version :

```bash
npm run build
```

Puis, dans le **gestionnaire de fichiers Infomaniak** (dans le navigateur, en
HTTPS), envoyer **tout le contenu de `dist/`** dans le dossier web du site.
C'est tout. Le site est entièrement statique : aucune base de données, aucun
service à redémarrer.

> Un client FTP classique fonctionnerait aussi, mais il enverrait lui aussi le
> mot de passe en clair. Le gestionnaire de fichiers du navigateur est le seul
> chemin chiffré vers ce serveur.

**Conséquence à connaître :** quand Estelle modifie un texte depuis `/admin`,
son changement part sur GitHub mais **pas** en ligne. Il faut reconstruire et
téléverser. Tant que le contenu bouge peu, c'est tenable ; le jour où ça devient
pénible, la vraie réponse est de passer à un hébergement Web Apache/PHP, qui
donne le FTPES et le SSH — et permet de rétablir le déploiement automatique.

---

## Contact

**Le site n'a pas de formulaire.** L'offre Starter n'exécute pas PHP, donc rien
ne peut traiter un envoi côté serveur. Les pages `/contact` et `/rendez-vous`
affichent à la place les moyens de la joindre — téléphone, e-mail, Instagram —
rendus par [`src/components/Coordonnees.astro`](src/components/Coordonnees.astro)
à partir des valeurs saisies dans le CMS.

C'est aussi le choix le plus sobre pour des demandes qui touchent à la santé :
aucune donnée ne transite par ce site, et la politique de confidentialité peut
le dire sans réserve.

---

## Remplacer les photos

Depuis le CMS, ouvrir la page concernée, cliquer sur le champ **Photo**,
téléverser l'image, puis **Publier**. Rien d'autre à faire.

Deux choses se passent automatiquement :

1. **Optimisation.** La photo atterrit dans `src/assets/photos/`. Au build,
   Astro la redimensionne, la convertit en **WebP** et génère un `srcset`
   responsive — un mobile télécharge une petite version, pas l'originale de
   plusieurs mégaoctets. Inutile donc de préparer les images avant de les
   envoyer : la photo sortie de l'appareil convient.
2. **Cadrage.** Plusieurs emplacements recadrent la photo dans un cercle ou un
   arc. Le champ **Cadrage de la photo** indique quelle partie garder visible
   (*Vers le haut* pour ne pas couper un visage, par exemple). Par défaut :
   centrée.

Les illustrations provisoires (SVG dans `public/images/`) restent affichées tant
qu'aucune vraie photo ne les remplace, et ne sont pas rastérisées inutilement.

Tout passe par [`src/components/Photo.astro`](src/components/Photo.astro) —
le seul fichier qui sait afficher une photo du site.

## Prise de rendez-vous en ligne (plus tard)

La page `/rendez-vous` est prête à accueillir un agenda en ligne sans
retouche de code. Le jour venu, coller le code d'intégration (Cal.com,
Calendly, Acuity…) dans le champ **« Agenda en ligne »** de la page depuis le
CMS : la page bascule seule des coordonnées vers l'agenda.

---

## Design

La maquette client validée n'est pas dans ce dépôt public : elle vit dans
`design/mockup.jpg` sur la machine du développeur. Les jetons de couleur et de
typographie qui en sont issus sont en tête de
[`src/styles/global.css`](src/styles/global.css).

Trois familles de caractères : **Fraunces** (titres, serif), **Parisienne**
(accroches manuscrites), **Karla** (texte courant). Elles sont servies depuis
le site (aucune connexion à Google Fonts).

---

## Points à confirmer avec la cliente

Ces éléments contiennent des valeurs provisoires, à valider avant la mise en
ligne :

- **Agrément ASCA / RME** — le bandeau de remboursement est **désactivé** par
  défaut (`asca_rme_actif: false` dans `site.json`). Ne l'activer qu'une fois
  l'agrément réellement obtenu.
- **Coordonnées** — téléphone, e-mail, adresse et lien Instagram dans
  `site.json` sont ceux de la cliente. Le lien Instagram pointe sur un compte
  encore nommé `dela_reflexologie` : il casse si elle le renomme.
- **Mentions légales / confidentialité** — les champs `[À COMPLÉTER]` restants
  (nom complet, IDE) doivent être renseignés. L'adresse est en place.
- **Photos** — les images de `public/images/` sont des illustrations
  provisoires. Voir « Remplacer les photos » ci-dessous : il n'y a rien à
  modifier dans le code.
