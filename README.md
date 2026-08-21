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
  contact-handler.php← traitement du formulaire (exécuté sur Infomaniak)
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

### Automatique (une fois configuré)

À chaque `push` sur `main`, GitHub Actions construit le site et envoie `dist/`
vers Infomaniak par FTPS. Voir
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

### Manuel (secours — à garder opérationnel)

Si le pipeline casse, le site doit rester publiable à la main :

```bash
npm run build
```

Puis, dans le **gestionnaire de fichiers Infomaniak**, envoyer **tout le
contenu de `dist/`** dans le dossier web. C'est tout.

---

## Formulaire de contact

Le formulaire (`/contact` et `/rendez-vous`) est traité par
[`public/contact-handler.php`](public/contact-handler.php), exécuté sur
Infomaniak. Il envoie simplement un e-mail : aucune donnée n'est stockée.

Avant la mise en production, vérifier dans ce fichier les constantes
`DESTINATAIRE` et `EXPEDITEUR` (l'expéditeur doit être une adresse du domaine
hébergé chez Infomaniak, pour ne pas être filtré comme spam).

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
CMS : la page bascule seule du formulaire vers l'agenda.

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
- **Coordonnées** — téléphone, e-mail et adresse dans `site.json` sont des
  valeurs de démonstration.
- **Mentions légales / confidentialité** — les champs `[À COMPLÉTER]` (nom
  complet, adresse exacte, IDE) doivent être renseignés.
- **Photos** — les images de `public/images/` sont des illustrations
  provisoires. Voir « Remplacer les photos » ci-dessous : il n'y a rien à
  modifier dans le code.
