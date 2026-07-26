AK'Games V1.0 — Correction création de room / permission_denied

À remplacer à la racine :
- firebase.js
- database.rules.json
- service-worker.js

Cause du bug :
La création utilise une transaction Firebase sur le futur salon.
Or les règles interdisaient la lecture de ce chemin tant que l'utilisateur
n'était pas déjà membre du salon, ce qui est impossible avant sa création.

Correction :
- lecture autorisée uniquement lorsque le chemin du salon n'existe pas encore ;
- les salons existants restent privés ;
- une éventuelle collision de code tente automatiquement un nouveau code ;
- cache PWA passé à akgames-v1.0-rc5-room-fix.

Installation :
1. Remplace les trois fichiers.
2. Clique sur « Valider et envoyer (push) ».
3. Attends impérativement la coche verte GitHub Actions.
4. Ferme complètement AK'Games.
5. Rouvre l'application et réessaie de créer une room.
