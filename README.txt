AK'Games — Qui de nous ? V0.2

CONTENU DU ZIP

À REMPLACER :
- app.js
- styles.css

À AJOUTER :
- le dossier data/
  - data/qui-de-nous.json
  - data/qui-de-nous-adulte.json

CE QUI EST AJOUTÉ

- Le premier jeu réellement jouable : « Qui de nous ? »
- Mode un seul téléphone avec votes secrets en passant le téléphone
- 200 questions classiques :
  - Drôle : 40
  - Chaos : 35
  - Dossiers : 35
  - Amitié : 30
  - Soirée : 30
  - Relations & crush : 30
- 100 questions adultes séparées
- Choix du nombre de questions : 5, 10, 20 ou personnalisé
- Sélection des catégories
- Option questions osées si le contenu adulte est activé
- Mode alcool avec trois intensités : léger, normal, chaotique
- Résultats en pourcentages
- Événements spéciaux : unanimité, égalité, auto-dénonciation
- Bilan de fin de partie avec plusieurs titres
- Les 17 personnages actuels sont présents sous forme d’emojis temporaires
- Blind Test reste grisé
- Le multijoueur chacun sur son téléphone reste volontairement à connecter plus tard

MISE À JOUR SUR GITHUB / FIREBASE

Après avoir remplacé et ajouté les fichiers :

git add .
git commit -m "Ajout du jeu Qui de nous"
git push
firebase deploy --only hosting
