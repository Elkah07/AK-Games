AK'Games — V0.4.1 PWA / MOBILE
=================================

Cette mise à jour se pose APRÈS la V0.4 multijoueur.

IMPORTANT
---------
Installe d'abord :
1. La V0.3 avec les trois jeux
2. La V0.4 multijoueur
3. Puis cette V0.4.1 mobile

FICHIERS À REMPLACER
--------------------
- index.html
- firebase.json

FICHIERS À AJOUTER
------------------
- manifest.webmanifest
- service-worker.js
- pwa.js
- le dossier icons/

STYLE À AJOUTER
---------------
Le fichier `styles-pwa.css` contient uniquement les nouveaux styles.

Copie tout son contenu et colle-le À LA FIN de ton `styles.css` actuel.
Ne remplace pas ton styles.css complet par styles-pwa.css.

CE QUI EST AJOUTÉ
-----------------
- Logo noir et violet intégré comme icône officielle provisoire
- Icônes 192, 512, maskable, Apple Touch et favicons
- Installation Android / Chrome comme application
- Lancement en mode standalone, sans barre de navigateur
- Écran de démarrage AK'Games
- Service worker et cache de l'interface
- Interface et jeux solo disponibles même si la connexion devient instable
- Conservation de la room multijoueur via la V0.4
- Gestion du bouton Retour Android
- Retour vers l'écran précédent quand un écran interne est ouvert
- Protection contre la fermeture brutale pendant une partie ou dans un salon
- À l'accueil seulement : double pression rapide pour quitter
- Raccourcis « Créer une partie » et « Rejoindre » depuis l'icône Android

BOUTON RETOUR DU TÉLÉPHONE
--------------------------
- Sur un écran interne : revient dans AK'Games
- Pendant une partie ou dans une room : ne quitte pas brutalement l'application
- À l'accueil : un premier retour affiche un avertissement
- Un second retour rapproché permet de quitter

INSTALLATION
------------
Après avoir copié les fichiers :

firebase deploy --only hosting

Puis sauvegarde sur GitHub :

git add .
git commit -m "Ajout de la PWA mobile AKGames"
git push

INSTALLER SUR ANDROID
---------------------
1. Ouvre https://ak-games-4a2cd.web.app dans Chrome
2. Attends quelques secondes
3. Appuie sur « Installer » dans la bannière AK'Games

Si la bannière n'apparaît pas :
- ouvre le menu ⋮ de Chrome
- choisis « Installer l'application » ou « Ajouter à l'écran d'accueil »

MISE À JOUR D'UNE ANCIENNE INSTALLATION
---------------------------------------
Si une ancienne icône ou une ancienne version reste affichée :
1. Désinstalle AK'Games du téléphone
2. Recharge le site dans Chrome
3. Réinstalle l'application
