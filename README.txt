AK'Games — V0.3
=================

Cette mise à jour ajoute deux nouveaux jeux complets et conserve « Qui de nous ? ».

JEUX JOUABLES SUR UN SEUL TÉLÉPHONE
------------------------------------
1. Qui de nous ?
2. Le premier qui rit a perdu
3. Qui ment le mieux ?

LE PREMIER QUI RIT A PERDU
---------------------------
- Duel face à face entre 2 joueurs choisis dans le groupe
- Deux règles :
  - Mort subite
  - 3 vies
- À chaque tour :
  - « Donne-moi une blague »
  - « J’en ai une »
- Pour une blague de l’app :
  - affichage de la question
  - bouton pour révéler la chute
- Résultats possibles :
  - l’adversaire a ri
  - le joueur a ri à sa propre blague
  - personne n’a ri
- 100 blagues classiques
- 30 blagues adultes optionnelles
- Mode alcool compatible
- Revanche immédiate

QUI MENT LE MIEUX ?
--------------------
- Minimum 3 joueurs
- 3, 5, 10 manches ou nombre personnalisé
- 5 catégories classiques :
  - Excuses
  - Improbable
  - Quotidien
  - Dossiers
  - Chaos
- Catégorie adulte optionnelle
- Chaque joueur écrit secrètement son mensonge
- Les réponses sont mélangées et affichées anonymement
- Chaque joueur vote secrètement
- Impossible de voter pour sa propre réponse
- Révélation des auteurs et des votes
- Score cumulé sur toute la partie
- Classement final
- Titre « Mytho suprême »
- Mode alcool compatible
- 100 situations classiques
- 30 situations adultes

QUI DE NOUS ?
--------------
Les fichiers de questions de la V0.2 sont inclus dans le pack :
- 200 questions classiques
- 100 questions adultes

FICHIERS À METTRE À JOUR
-------------------------
À remplacer :
- app.js
- styles.css

À ajouter / remplacer :
- dossier data/

Le dossier data contient :
- qui-de-nous.json
- qui-de-nous-adulte.json
- blagues.json
- blagues-adulte.json
- qui-ment-prompts.json
- qui-ment-prompts-adulte.json

DÉPLOIEMENT
------------
Après avoir remplacé les fichiers dans ton Codespace :

git add .
git commit -m "Ajout des jeux rire et mensonge"
git push
firebase deploy --only hosting

VÉRIFICATIONS EFFECTUÉES
-------------------------
- Syntaxe JavaScript validée avec Node
- Les 6 bases JSON sont valides
- Aucun doublon d’identifiant dans les bases JSON
- Les trois mécaniques de jeu sont bien présentes dans app.js

Le mode multijoueur chacun sur son téléphone reste à connecter à Firebase dans une prochaine étape.
