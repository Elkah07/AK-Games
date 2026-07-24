AK'GAMES V0.9 — IMPOSTEURS & DÉDUCTION

FICHIERS À REMPLACER À LA RACINE
- app.js
- multiplayer.js
- styles.css
- service-worker.js

NOUVEAUX FICHIERS À AJOUTER DANS data/
- imposteur.json
- imposteur-adulte.json
- faux-expert.json
- faux-expert-adulte.json
- qui-suis-je.json
- qui-suis-je-adulte.json

NOUVEAUX JEUX

1. L’Imposteur sait presque tout
- Chaque joueur découvre son rôle en privé.
- Tout le monde connaît le mot, sauf l’imposteur qui reçoit uniquement un indice.
- Discussion chronométrée puis vote secret.
- Les bons détectives gagnent 1 point.
- L’imposteur gagne 2 points s’il échappe au vote.
- S’il est démasqué, il peut encore gagner 1 point en retrouvant le mot parmi quatre propositions.

2. Le Faux Expert
- Un orateur reçoit soit les vraies informations, soit un brief de bluff.
- Présentation et questions pendant un chronomètre synchronisé.
- Les autres votent secrètement « vrai expert » ou « faux expert ».
- Bon verdict : +1 point.
- L’orateur gagne jusqu’à 3 points selon le nombre de personnes trompées.

3. Qui suis-je ?
- Une identité est visible par tout le groupe sauf par la personne qui devine.
- Catégories : classique, culture pop ou mélange complet.
- Questions orales avec réponses oui, non ou presque.
- Chronomètre synchronisé sur tous les téléphones.
- Identité trouvée : +2 points pour la personne qui devine et +1 pour chaque aide.

MODES DISPONIBLES
- Un seul téléphone, avec écrans privés et passage du téléphone.
- Multijoueur synchronisé, chacun sur son téléphone.
- Salon persistant, score général, historique, replay et jeu aléatoire.
- Options adulte et alcool indépendantes.

CONTENU AJOUTÉ
- L’Imposteur sait presque tout : 75 cartes classiques + 25 adultes.
- Le Faux Expert : 65 sujets classiques + 20 adultes.
- Qui suis-je ? : 88 identités classiques/culture pop + 25 adultes.
- Total V0.9 : 298 nouvelles cartes et identités.
- AK'Games passe à 12 jeux complets.

DESIGN
- Trois univers visuels distincts pour les nouveaux jeux.
- Cartes de rôles privées, anneaux de chronomètre, écrans de révélation et votes modernisés.
- Accueil actualisé avec le pack Imposteurs & Déduction.
- Cache PWA passé en V0.9.

INSTALLATION
1. Extraire le ZIP.
2. Remplacer app.js, multiplayer.js, styles.css et service-worker.js.
3. Ajouter les six JSON dans le dossier data.
4. Dans VS Code, cliquer sur « Valider et envoyer (push) ».
5. Attendre la coche verte dans GitHub Actions.
6. Fermer complètement la PWA sur téléphone, puis la rouvrir.

Aucune commande Firebase n’est nécessaire grâce au déploiement automatique.
Aucune règle Database n’a été modifiée.
Les personnages officiels restent en pause jusqu’au mot-clé prévu.
