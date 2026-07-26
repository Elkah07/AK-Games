AK'Games V1.0 — Correction pour rejoindre une room

À remplacer à la racine :
- database.rules.json
- firebase.js
- service-worker.js

Cause :
Avant d'entrer dans le salon, l'application vérifie la liste des joueurs pour
contrôler la limite et les prénoms déjà utilisés. Les règles autorisaient cette
lecture uniquement aux personnes déjà membres, ce qui provoquait :
permission_denied at /rooms/.../players

Correction :
- la liste des joueurs est lisible par une personne authentifiée uniquement
  pendant que le salon est encore dans le lobby et non expiré ;
- une fois la partie lancée, seuls les membres du salon peuvent toujours la lire ;
- le message technique brut est remplacé par un message compréhensible ;
- cache PWA passé à akgames-v1.0-rc6-join-room-fix.

Installation :
1. Remplace les trois fichiers.
2. Clique sur « Valider et envoyer (push) ».
3. Attends impérativement la coche verte GitHub Actions.
4. Ferme complètement AK'Games sur les téléphones.
5. Rouvre l'application et réessaie de rejoindre la room.
