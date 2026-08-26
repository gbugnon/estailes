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

Chaque publication crée un enregistrement sur GitHub et **relance le
déploiement tout seul**. Le site est à jour en quelques minutes.

---

## Déploiement

### Automatique

À chaque `push` sur `main`, GitHub Actions construit le site et envoie `dist/`
vers Infomaniak en **FTPES** — port 21 avec chiffrement TLS. Voir
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

**Secrets à créer** dans le dépôt (Settings → Secrets and variables → Actions),
**jamais dans le YAML** :

| Secret | Valeur |
|---|---|
| `FTP_SERVER` | l'hôte lu dans le manager, de la forme `xxxx.ftp.infomaniak.com` |
| `FTP_USERNAME` | l'identifiant FTP, de la forme `xxxx_yyyy` |
| `FTP_PASSWORD` | le mot de passe du compte FTP |
| `FTP_ROOT` | le dossier web **vérifié**, slash final obligatoire (ex. `/web/`) |

> **Vérifier le dossier web AVANT d'automatiser.** Ouvrir le gestionnaire de
> fichiers Infomaniak et confirmer le chemin réel de la racine du site.
> Déployer dans le mauvais dossier est la première erreur classique.

Pour cette vérification, lancer le workflow à la main depuis l'onglet Actions
en laissant **Simulation** cochée : il se connecte, compare, affiche ce qu'il
enverrait, et n'écrit rien. Une fois la liste des fichiers conforme, décocher
la case (ou pousser sur `main`) pour déployer réellement.

> Le FTPES exige un **hébergement Web Apache/PHP**. Sur l'offre Starter, le
> serveur refuse `AUTH TLS` et ce workflow échoue à la connexion — c'est pour
> cette raison qu'il avait été retiré pendant un temps. Si l'hébergement
> redevient un Starter un jour, il faut le retirer à nouveau plutôt que de
> passer en FTP non chiffré.

### Manuel (secours — à garder opérationnel)

Si le pipeline casse, le site doit rester publiable à la main :

```bash
npm run build
```

Puis, dans le **gestionnaire de fichiers Infomaniak**, envoyer **tout le
contenu de `dist/`** dans le dossier web. C'est tout. Le site est entièrement
statique : aucune base de données, aucun service à redémarrer.

---

## Contact

**Le site n'a pas de formulaire, par choix.** Les pages `/contact` et
`/rendez-vous` affichent les moyens de la joindre — téléphone, e-mail,
Instagram — rendus par
[`src/components/Coordonnees.astro`](src/components/Coordonnees.astro) à partir
des valeurs saisies dans le CMS.

C'est le choix le plus sobre pour des demandes qui touchent à la santé : aucune
donnée ne transite par ce site, et la politique de confidentialité peut le dire
sans réserve.

L'hébergement actuel exécute PHP, donc un formulaire redeviendrait techniquement
possible. Le remettre demanderait de rétablir le composant et son traitement
côté serveur, et de réécrire la section correspondante de la politique de
confidentialité.

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
- **Mentions légales / confidentialité** — complétées : nom, adresse, téléphone
  et e-mail sont en place. La cliente n'a pas de numéro IDE, la ligne a été
  retirée ; à rétablir si elle en obtient un.
- **Photos** — les images de `public/images/` sont des illustrations
  provisoires. Voir « Remplacer les photos » ci-dessous : il n'y a rien à
  modifier dans le code.
