# Invitation privée

## Depuis un navigateur déjà connecté au site publié

Administration → Appareils autorisés → Autoriser un autre appareil. Copiez le lien affiché, puis ouvrez-le dans le navigateur à autoriser et saisissez votre mot de passe actuel. Ce lien est valable 10 minutes et utilisable une seule fois. Il n’est pas nécessaire de vous envoyer un e-mail.

## Premier accès après déploiement, ou perte du navigateur autorisé

Dans le terminal privé du serveur qui exécute le site (Render pour le service actuel), depuis le dossier du projet effectivement exécuté par le serveur :

```sh
npm run admin:invite -- https://arxylve.com
```

Ouvrez le fichier `.arxylve-private/cms/admin-invitation.txt` indiqué par la commande, avec votre accès privé au serveur. Copiez le lien et ouvrez-le dans votre navigateur habituel sous 15 minutes. Gardez ce lien privé : ne le mettez ni dans les fichiers publics du site, ni dans une capture d’écran publique.

Si le compte existe déjà, votre mot de passe actuel est requis. Sinon, le lien permet de choisir le premier mot de passe (12 caractères minimum). L’invitation est à usage unique ; relancer la commande remplace la précédente invitation créée par le serveur. La commande ne réinitialise pas le mot de passe. Les tentatives de mot de passe sont limitées à cinq par période de quinze minutes, séparément pour chaque appareil autorisé ou invitation valide. Un navigateur inconnu ne peut pas bloquer les appareils autorisés ; l’ancien blocage global de 24 heures est supprimé.

L’autorisation de localhost ne se transfère pas au domaine publié. Générer une invitation sur le PC local ne configure pas le serveur publié : la commande doit être exécutée sur le serveur, dans le même dossier de données privé que le site. Ce dossier doit être conservé entre les déploiements, avec accès réservé au serveur et à son propriétaire.

Ensuite, connectez-vous sur `https://arxylve.com/admin` avec votre mot de passe depuis le navigateur autorisé. Aucun droit ne dépend de l’ordre d’arrivée des visiteurs. Les visiteurs ne peuvent pas générer une invitation depuis la page publique.
