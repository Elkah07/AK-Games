AK'Games V1.0 — Correction définitive du grand espace de l'accueil

À remplacer à la racine :
- index.html
- styles.css
- service-worker.js

Pourquoi la correction précédente ne se voyait pas :
l'écran principal pouvait encore s'étirer sur toute la hauteur disponible.
Sur les grands téléphones, le navigateur gardait donc le bloc des trois choix
beaucoup trop bas. En plus, une ancienne feuille styles.css pouvait rester en cache.

Cette version :
- empêche l'écran d'accueil de s'étirer verticalement ;
- place le texte et les trois cartes juste sous l'en-tête ;
- ajoute un garde-fou directement dans index.html ;
- force le chargement de styles.css?v=rc4-home ;
- passe le cache PWA à akgames-v1.0-rc4-home.

Installation :
1. Remplace les 3 fichiers.
2. « Valider et envoyer (push) ».
3. Attends la coche verte.
4. Ferme complètement AK'Games.
5. Rouvre l'application.
