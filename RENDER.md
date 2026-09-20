# Publication ARXYLVE sur Render

Le service existant est https://arxylve-web.onrender.com et son dépôt source est https://github.com/ALEXY-FR/arxylve-web (branche main). Ne pas créer de second service ni utiliser le dépôt arxylve vide.

## Configuration de production à terminer

Le service gratuit est un aperçu : son stockage disparaît après redémarrage et les ports SMTP sont bloqués. Avant de gérer les vraies œuvres et demandes :

1. Choisir une instance payante pour le service existant (Starter pour commencer ; ajuster la mémoire si nécessaire).
2. Ajouter un disque persistant, par exemple 5 Go, monté exactement sur `/opt/render/project/src/.arxylve-private`. Ce chemin suppose la configuration actuelle : service Node, Root Directory vide. Il conserve le CMS, les médias importés, les accès admin et le registre des demandes. Ne pas rediriger CONTACT_STATE_DIR hors de ce disque.
3. Si du contenu a déjà été saisi sur le service gratuit, le récupérer avant toute migration ou redéploiement. Le disque neuf ne copie pas les données temporaires existantes.
4. Conserver les variables de messagerie existantes, sans les publier dans Git. Build : `npm ci && npm run build`. Démarrage : `npm start`.
5. Après activation du disque et déploiement, créer l’invitation admin depuis le Shell Render : `npm run admin:invite -- https://arxylve-web.onrender.com`. Ouvrir en privé le fichier indiqué par le programme. Ne pas copier son contenu dans une conversation ou dans GitHub. Une nouvelle invitation sera nécessaire pour autoriser le navigateur sur arxylve.com, car les cookies dépendent du domaine.
6. Vérifier la connexion admin, l’import d’un média, sa conservation après un redéploiement et la réception d’une demande test.
7. Ajouter arxylve.com dans Custom Domains et appliquer uniquement les enregistrements DNS indiqués par Render chez OVH. Préserver les enregistrements de messagerie. Vérifier HTTPS avant de créer l’invitation du domaine définitif.

Les modifications du code passent par GitHub. Les œuvres et médias enregistrés dans l’admin restent sur le disque et ne sont pas copiés dans GitHub. Le contenu CMS et les médias privés de l’ordinateur doivent être transférés séparément si l’on souhaite conserver exactement les réglages locaux : les fichiers d’accès admin et les anciennes demandes ne doivent pas être inclus dans un dépôt.

Documentation : https://render.com/docs/disks et https://render.com/docs/free
