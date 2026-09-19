# Langues du site

36 langues : les 24 langues officielles de l’Union européenne, le norvégien bokmål, l’islandais, l’ukrainien, le russe, le turc, l’albanais, le serbe (alphabet latin), le bosnien, le macédonien, le monténégrin (alphabet latin), le chinois simplifié et le japonais.

Les textes sont enregistrés dans `data/translations.ts` et `data/europe-translations.json`. Le navigateur ne contacte aucun service de traduction. La langue est choisie à partir des préférences du navigateur, puis le choix du visiteur est conservé pendant un an. L’administration reste en français.

Les nouvelles versions sont des premières traductions assistées, corrigées pour le contexte du catalogue et des formulaires. Une relecture par des locuteurs natifs reste à prévoir avant une communication commerciale dans chacune de ces langues. Elles ne constituent pas une traduction professionnelle certifiée.

Les identifiants d’édition restent inchangés. Les noms des œuvres restent inchangés sauf traduction personnalisée. Un texte français entièrement nouveau ajouté dans l’administration n’est pas traduit automatiquement.

Dans Administration → Éditeur du site, choisissez la page (et l’œuvre pour une fiche), puis ouvrez « Traductions de cette page ». Choisissez la langue et le champ, puis collez la traduction sous le français de référence. Les descriptions, titres, matières, dimensions, éditions, textes de Sur mesure/À propos, phrases animées et champs des formulaires sont disponibles. Cliquez sur ARXYLVE pour enregistrer et quitter, comme pour les autres modifications. Les phrases animées se saisissent à raison d’une phrase par ligne.

Les traductions personnalisées sont conservées avec le contenu du site et ses sauvegardes. Lorsqu’un texte français change, sa traduction précédente est signalée comme à revoir et n’est plus utilisée publiquement tant qu’elle n’a pas été corrigée ou validée. Le site utilise alors sa traduction intégrée si elle existe, sinon le français. Il est possible de rétablir la traduction initiale pour chaque champ et langue.

Les drapeaux proviennent de `country-flag-icons` 1.6.20 (licence MIT conservée dans `public/flags/LICENSE.txt`). Un drapeau représente un repère visuel pour une langue, sans limiter cette langue aux visiteurs de ce pays.

Les premières traductions supplémentaires ont été préparées hors du site avec Argos Translate/CTranslate2 et revues dans leur contexte. Les modèles de traduction et leurs dépendances ne font pas partie du site livré.

# Aperçu dans VS Code

L’onglet `http://localhost:3000/apercu` propose Ordinateur, iPad, Smartphone et Pivoter. Il affiche les pages locales en direct. Le bouton de langue et la navigation restent interactifs ; les envois des formulaires sont bloqués dans cet aperçu.

Dans VS Code, F5 lance la configuration « ARXYLVE — Aperçu des appareils ». Elle réutilise le serveur local s’il fonctionne déjà. Cet outil est réservé au développement : la route renvoie 404 en production.
