# Typographie et composition

Le fichier `app/type-scale.css`, chargé après les styles des composants, définit trois tailles pour chaque format. Le rapport entre deux niveaux vaut environ 1,618034 (nombre d’or). Ce sont des tailles calculées par ratio, pas des termes entiers imposés de la suite de Fibonacci.

| Format | Texte courant | Titres secondaires | Titres principaux |
| --- | --- | --- | --- |
| Ordinateur | 18 px | 29,1246 px | 47,1246 px |
| iPad / tablette | 17 px | 27,5066 px | 44,5066 px |
| Smartphone | 16 px | 25,8885 px | 41,8885 px |

Le texte courant comprend les menus, formulaires, légendes et informations de disponibilité. Les titres secondaires servent aussi aux prix mis en avant et à la signature ARXYLVE. Les textes des icônes ne sont pas réduits pour compenser un manque de place.

Les espacements suivent les repères 16 / 26 / 42 px. Sur grand écran, À propos et Sur mesure utilisent une répartition proche de 38/62. Sur tablette, le couple image / informations de l’accueil approche 62/38, avec une largeur minimale préservée pour les informations. Les autres compositions privilégient la place nécessaire aux contrôles et aux œuvres : toutes les zones ne sont pas forcées dans un rectangle d’or.

Sous 360 px de largeur, le menu passe en deux colonnes. Les formulaires et panneaux défilent si nécessaire, les textes longs reviennent à la ligne, et les proportions originales des médias ainsi que les bordures régulières restent conservées.

Les placements libres restent spécifiques à chaque appareil. Lorsqu’on modifie fortement les textes ou leurs positions, vérifier aussi les traductions dans l’aperçu : un placement manuel peut nécessiter un nouvel ajustement.
