# ARXYLVE — Sculptures miroir

Projet local : accueil, catalogue sans sous-catégories, fiches des sculptures, sur mesure, à propos et panier.

## Démarrer

`npm run dev` — aperçu local. `npm run build` — compilation. `npm start` — production.

## Mettre à jour les œuvres

Utilisez `/admin` → Œuvres et médias pour modifier les œuvres, leurs photos, vidéos, prix et éditions. Le contenu enregistré se trouve dans `.arxylve-private/cms/content.json` ; les fichiers de `data/` ne servent que de contenu initial. Préservez les données privées et les médias lors du déploiement. L’accès administrateur et les invitations sont décrits dans `ADMINISTRATION.md`.

Les huit états sont conservés : available, returning-soon, made-to-order, unavailable, production-ended, edition-complete, sold, exhibited. Les types d’édition sont également conservés. Seul l’état available avec prix et numéro disponible permet un ajout au panier. Les autres états proposent un contact avec l’atelier. Changer `status` ne nécessite aucun changement de mise en page.

## Acquisition

Le panier permet de choisir les exemplaires et d’envoyer une demande d’acquisition via le service SMTP existant. Il ne débite aucune somme et ne réserve aucun stock. Le serveur vérifie la disponibilité déclarée et reconstitue les prix depuis le catalogue ; les modalités finales sont confirmées par l’artiste. Un paiement immédiat nécessiterait un prestataire de paiement et une gestion transactionnelle du stock, non configurés ici.

Le panier des sculptures utilise une nouvelle clé de stockage local ; les anciens articles de démonstration ne sont pas réintroduits. L’ancienne clé n’est pas effacée.

## Direction visuelle

Liquid glass sombre en relief, avec cinq taches animées dans la palette burgundy, pourpre, vert forêt et bleu marine. La typographie du site est Grand Cru. Les images conservent leurs proportions ; les icônes sociales partagent un contour clair au survol, au focus clavier et à l’appui tactile.

La configuration de messagerie du projet sur le Bureau est préservée. Ne pas partager `.env.local`. Aucun e-mail réel n’est envoyé pendant les tests.


## Galerie et maquettes

Accueil ordinateur : image agrandie, photos secondaires et informations au survol. Sur iPad : image principale et panneau d’informations de même hauteur, avec les photos secondaires en dessous. Sur smartphone : balayage entre les œuvres et appui pour ouvrir la fiche. Les fiches réunissent photos et vidéos dans une galerie sélectionnable ; jusqu’à 24 photos supplémentaires et 12 vidéos par œuvre. Les 6 premières photos secondaires apparaissent à l’accueil.

La collection défile dans sa propre fenêtre. Les cartes sont rangées en mosaïque, en séparant d’abord les états disponibles / sur commande des autres états. Les huit maquettes de formats sont uniquement destinées à la démonstration : elles réutilisent le visuel provisoire, sont signalées et n’entrent jamais dans le panier. Le bouton Masquer les maquettes permet de retrouver les deux œuvres réelles.

## Coordonnées et limite de contact

Validation : format de l’e-mail et confirmation de saisie, domaine capable de recevoir des e-mails, et numéros de téléphone conformes aux plans de numérotation via libphonenumber-js. Les numéros français peuvent être saisis au format national, les autres avec leur indicatif international. Cela NE prouve PAS la possession de la boîte mail ni du téléphone, ni que la ligne est effectivement attribuée. Une confirmation par code e-mail/SMS reste nécessaire pour cela ; aucun prestataire SMS ni synchronisation des réponses n’est configuré.

Chaque adresse e-mail ou téléphone normalisé est limité à deux demandes en attente. Le contrôle est fait côté serveur et persiste dans .arxylve-private/contacts.json. Les identifiants y sont hachés avec un secret local ; les corps de messages et coordonnées en clair ne sont pas enregistrés dans ce fichier. Les doublons simultanés sont protégés par un verrou local. Un échec d’envoi libère la réservation de quota ; une interruption du processus peut conserver une réservation par prudence.

Après avoir répondu à une personne, ouvrir Reponse-envoyee.cmd dans le dossier du site, saisir son e-mail et confirmer pour débloquer ses demandes. Il n’existe pas de route publique de déblocage. Ce déblocage est MANUEL et ne détecte pas automatiquement les réponses de la boîte mail.

Ce stockage convient à un serveur Node unique avec disque persistant. Pour un hébergement sans disque persistant ou plusieurs serveurs, il faut un stockage partagé transactionnel. CONTACT_STATE_DIR peut définir un dossier privé persistant. Si le processus s’interrompt pendant une écriture et laisse contact.lock, arrêter les instances du serveur avant de supprimer ce dossier de verrou vide ; ne pas supprimer contacts.json.

Sources techniques : https://github.com/catamphetamine/libphonenumber-js et https://www.twilio.com/docs/verify/api (service de confirmation par code à connecter si souhaité).
