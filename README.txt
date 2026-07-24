AK'GAMES V0.5 — 3 JEUX MULTIJOUEURS
====================================

Ce ZIP contient uniquement les fichiers modifiés.

NOUVEAUTÉS
----------
- « Qui ment le mieux ? » est maintenant jouable chacun sur son téléphone.
  • chaque joueur écrit son mensonge sur son écran
  • les réponses sont mélangées
  • chacun vote sans pouvoir choisir sa propre réponse
  • résultats et classement synchronisés

- « Le premier qui rit a perdu » est maintenant synchronisé sur plusieurs téléphones.
  • l'hôte choisit les deux adversaires
  • le joueur qui raconte choisit une blague de l'app ou sa propre blague
  • la blague de l'app s'affiche uniquement dans son interface
  • vies, tours et résultat sont synchronisés pour tous les joueurs
  • les autres joueurs suivent le duel comme spectateurs

- Retour automatique au salon après la fin de ces deux jeux.
- Mise à jour du cache PWA vers AK'Games V0.5.
- L'accueil indique désormais que 3 jeux sont disponibles sur un ou plusieurs téléphones.

INSTALLATION DANS LE CODESPACE
------------------------------
Remplace les 6 fichiers présents à la racine du projet par ceux du ZIP :

1. app.js
2. firebase.js
3. multiplayer.js
4. styles.css
5. database.rules.json
6. service-worker.js

Aucun autre fichier ne doit être supprimé.

DÉPLOIEMENT
-----------
Dans le terminal du Codespace, exécute les commandes une par une :

firebase deploy --only database
firebase deploy --only hosting

git add .
git commit -m "Ajout de deux jeux multijoueurs V0.5"
git push

TEST CONSEILLÉ
--------------
1. Ouvrir AK'Games sur trois appareils ou trois navigateurs.
2. Créer un salon et faire rejoindre les autres joueurs.
3. Tester « Qui ment le mieux ? » avec au moins 3 joueurs.
4. Tester « Le premier qui rit a perdu » avec au moins 2 joueurs.
5. Vérifier le retour automatique au salon après chaque partie.
