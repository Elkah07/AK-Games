AK'Games V1.0 — Passer une question sur tous les jeux

Fichiers à remplacer à la racine :
- app.js
- multiplayer.js
- firebase.js
- styles.css
- service-worker.js

Fonctionnement en mode un téléphone :
- bouton « Déjà vue ? Changer de carte » sur tous les jeux utilisant une question, une carte, un sujet, une identité, une blague ou une catégorie ;
- confirmation avant le changement ;
- les réponses déjà saisies pour cette manche sont effacées ;
- aucun point et aucune pénalité ;
- les chronomètres sont arrêtés puis réinitialisés sur la carte suivante.

Fonctionnement en multijoueur :
- chaque joueur peut appuyer sur « Déjà vue ? Signaler à l'hôte » ;
- l'hôte voit immédiatement le ou les prénoms des personnes ayant signalé la carte ;
- seul l'hôte peut confirmer le changement ;
- la nouvelle carte apparaît sur tous les téléphones ;
- les réponses, votes et actions de la manche passée sont supprimés ;
- aucun score n'est modifié ;
- les signalements sont privés et liés uniquement à la manche en cours.

Jeux couverts :
- Qui de nous ?
- Le premier qui rit a perdu
- Qui ment le mieux ?
- Action ou Vérité
- Je n'ai jamais
- Tu préfères
- Même cerveau
- Minorité
- Qui a répondu ça ?
- L'Imposteur sait presque tout
- Le Faux Expert
- Qui suis-je ?
- Roulette de défis
- Mime
- Imitation
- La Bombe
- tous les quiz
- Plaide ta cause
- Fake ou Réel ?
- Alerte Rouge
- Tu me connais ou pas ?
- Le Classement secret
- Devinettes
- Questions osées
- Défis adultes
- Jeux à boire

Installation :
1. Remplace les cinq fichiers à la racine du dépôt.
2. Clique sur « Valider et envoyer (push) ».
3. Attends la coche verte GitHub Actions.
4. Ferme complètement AK'Games sur tous les téléphones.
5. Rouvre l'application.

Aucune modification de database.rules.json n'est nécessaire.

Cache PWA :
akgames-v1.0-rc13-skip-all-games
