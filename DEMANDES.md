# Suivi des demandes

Dans Administration → Demandes, les nouvelles demandes d’acquisition et sur mesure apparaissent avec leur date, leurs coordonnées, leur message et leur sélection. Les anciens e-mails ne sont pas importés : leur contenu n’était pas conservé par le site.

Les états sont enregistrés immédiatement. Après avoir répondu dans votre messagerie, choisissez Répondue. En cours et Terminée indiquent également qu’un échange a commencé et libèrent le quota. Aucun changement d’état n’envoie un e-mail. Le lien Écrire ouvre votre application de messagerie.

La libération du quota concerne les demandes liées à la même adresse ou au même téléphone. Repasser à Reçue ne remet pas rétroactivement un blocage. Les essais effectués depuis un navigateur autorisé restent identifiés et ne comptent pas dans le quota visiteur.

Si l’envoi SMTP échoue, la réservation est retirée. Si le serveur s’arrête pendant l’envoi, une demande peut rester avec un envoi non confirmé : vérifier la boîte mail. Le site n’envoie pas à nouveau automatiquement, pour éviter les doublons.

Le registre privé est dans CONTACT_STATE_DIR, ou .arxylve-private par défaut. Les API de lecture et modification exigent une session admin et un appareil autorisé ; les modifications vérifient aussi l’origine. Le registre n’est pas inclus dans le contenu public du site.

# Avant la publication

- L’offre OVH Starter n’exécute pas le serveur Node.js de ce projet. Conserver le domaine et le mail, et choisir un hébergement Node.js avec disque persistant avant le déploiement.
- Prévoir une sauvegarde externe quotidienne du contenu CMS, des médias, du registre des demandes et de la configuration privée, avec accès restreint. Tester une restauration dans un dossier isolé. Aucune sauvegarde automatique sur serveur n’a encore été installée.
- Les sauvegardes doivent couvrir les chemins personnalisés si CONTACT_STATE_DIR est utilisé. Les fichiers privés ne doivent jamais être déposés dans un répertoire web public.
- Compléter les informations légales et la notice de confidentialité avec les informations réelles de l’activité et les modalités de conservation des demandes. Les coordonnées légales ne sont pas inventées dans le projet.
- Le sitemap dynamique https://arxylve.com/sitemap.xml suit le catalogue enregistré. Après publication, ajouter le domaine dans Google Search Console et y soumettre le sitemap. Les exclusions robots.txt ne remplacent pas la protection des API admin.
- Vérifier sur le domaine définitif : HTTPS, invitation privée, connexion admin, envoi et réception des formulaires, sauvegarde/restauration. Aucun de ces contrôles distants n’est encore effectué.
