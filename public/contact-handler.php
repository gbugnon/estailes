<?php
/**
 * Traitement du formulaire de contact — Les sens d'Estelle
 * =============================================================================
 * Reçoit le formulaire de /contact et /rendez-vous, puis envoie le message par
 * e-mail. Aucune base de données, aucun service tiers : le message part du
 * serveur Infomaniak vers la boîte professionnelle, et rien n'est stocké.
 *
 * Volontairement minimal (voir le cahier des charges : les demandes sont
 * proches de la santé, on garde le traitement simple et lisible).
 *
 * À VÉRIFIER avant la mise en production :
 *   1. DESTINATAIRE ci-dessous pointe bien vers la bonne adresse.
 *   2. EXPEDITEUR utilise un domaine hébergé chez Infomaniak (sinon les
 *      messages risquent d'être refusés par SPF/DKIM). Ne pas mettre l'adresse
 *      du visiteur ici : elle va dans « Reply-To ».
 * =============================================================================
 */

const DESTINATAIRE = 'contact@lessensdestelle.ch';
const EXPEDITEUR   = 'site@lessensdestelle.ch';
const PAGE_MERCI   = '/merci';
const PAGE_CONTACT = '/contact';

// --- Le formulaire n'accepte que la méthode POST ----------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . PAGE_CONTACT, true, 303);
    exit;
}

/** Redirige puis coupe l'exécution. */
function rediriger(string $chemin): void
{
    header('Location: ' . $chemin, true, 303);
    exit;
}

/** Récupère un champ POST, nettoyé des espaces superflus. */
function champ(string $nom): string
{
    return isset($_POST[$nom]) ? trim((string) $_POST[$nom]) : '';
}

// --- Piège à robots : un humain laisse ce champ vide ------------------------
if (champ('site') !== '') {
    // On fait comme si tout s'était bien passé, sans envoyer d'e-mail.
    rediriger(PAGE_MERCI);
}

// --- Validation -------------------------------------------------------------
$nom          = champ('nom');
$email        = champ('email');
$telephone    = champ('telephone');
$sujet        = champ('sujet');
$message      = champ('message');
$consentement = champ('consentement');

$erreurs = [];
if ($nom === '')                                     $erreurs[] = 'nom';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))      $erreurs[] = 'email';
if ($message === '')                                 $erreurs[] = 'message';
if ($consentement === '')                            $erreurs[] = 'consentement';

if ($erreurs) {
    // Échec de validation : on renvoie vers le formulaire avec un indicateur.
    rediriger(PAGE_CONTACT . '?erreur=1');
}

// --- Protection contre l'injection d'en-têtes -------------------------------
// Une adresse ou un nom contenant un saut de ligne pourrait ajouter des
// en-têtes malveillants. On refuse tout retour à la ligne dans ces champs.
foreach ([$nom, $email, $sujet] as $valeur) {
    if (preg_match('/[\r\n]/', $valeur)) {
        rediriger(PAGE_CONTACT . '?erreur=1');
    }
}

// --- Construction et envoi de l'e-mail --------------------------------------
$objet = 'Nouveau message du site' . ($sujet !== '' ? ' — ' . $sujet : '');

$corps = "Nouveau message depuis lessensdestelle.ch\n"
    . "-----------------------------------\n\n"
    . 'Nom       : ' . $nom . "\n"
    . 'E-mail    : ' . $email . "\n"
    . 'Téléphone : ' . ($telephone !== '' ? $telephone : '(non renseigné)') . "\n"
    . 'Demande   : ' . ($sujet !== '' ? $sujet : '(non précisée)') . "\n\n"
    . "Message :\n" . $message . "\n";

// mb_encode pour un objet correct même avec des accents.
$objetEncode = '=?UTF-8?B?' . base64_encode($objet) . '?=';

$entetes = [
    'From: Est\'ailes <' . EXPEDITEUR . '>',
    'Reply-To: ' . $nom . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$envoye = mail(DESTINATAIRE, $objetEncode, $corps, implode("\r\n", $entetes));

rediriger($envoye ? PAGE_MERCI : PAGE_CONTACT . '?erreur=1');
