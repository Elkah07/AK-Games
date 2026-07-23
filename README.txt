AK'Games — V0.4 MULTIJOUEUR
================================

Cette mise à jour se pose PAR-DESSUS la V0.3.

FICHIERS À REMPLACER
--------------------
- index.html
- firebase.json

FICHIERS À AJOUTER
------------------
- firebase.js
- multiplayer.js
- database.rules.json

STYLE À AJOUTER
---------------
Le fichier `styles-multiplayer.css` contient uniquement les nouveaux styles.

Copie tout son contenu et colle-le À LA FIN de ton `styles.css` actuel.
Ne remplace pas ton `styles.css` V0.3 par ce petit fichier.

CE QUI EST MAINTENANT FONCTIONNEL
---------------------------------
- Authentification Firebase anonyme automatique
- Création d'un vrai salon
- Code de salon de type AK-7F3K
- Rejoindre un salon depuis un autre téléphone
- Lobby synchronisé en temps réel
- Liste des joueurs synchronisée
- Indicateur connecté / déconnecté
- Les options Adulte et Alcool sont transmises aux invités
- Le salon reste actif entre les jeux
- Reconnexion automatique au salon après actualisation de la page
- L'hôte peut fermer le salon
- Un invité peut quitter le salon

QUI DE NOUS ? EN MULTIJOUEUR
-----------------------------
- L'hôte configure et lance le jeu
- La question apparaît sur tous les téléphones
- Chaque joueur vote secrètement sur son propre téléphone
- Le compteur de votes se synchronise en direct
- L'hôte peut révéler les résultats quand tout le monde a voté
- L'hôte peut aussi révéler avant si quelqu'un bloque la partie
- Les résultats apparaissent simultanément sur tous les téléphones
- Unanimité, égalité et auto-dénonciation
- Mode alcool conservé
- Bilan final synchronisé
- Retour au même lobby après la partie

LES AUTRES JEUX
---------------
- `Le premier qui rit a perdu` reste jouable sur un seul téléphone.
- `Qui ment le mieux ?` reste jouable sur un seul téléphone.
- Leur adaptation chacun sur son téléphone viendra ensuite.

INSTALLATION
------------
1. Assure-toi d'avoir déjà installé la V0.3.

2. Remplace :
   - index.html
   - firebase.json

3. Ajoute :
   - firebase.js
   - multiplayer.js
   - database.rules.json

4. Ouvre `styles-multiplayer.css`, copie tout et colle-le à la fin de ton `styles.css`.

5. Dans le terminal :

firebase deploy --only database
firebase deploy --only hosting

6. Puis sauvegarde sur GitHub :

git add .
git commit -m "Ajout du multijoueur Firebase"
git push

TEST RECOMMANDÉ
---------------
Téléphone 1 :
- Créer une partie
- Choisir prénom + personnage
- Noter le code AK-XXXX

Téléphone 2 :
- Ouvrir https://ak-games-4a2cd.web.app
- Rejoindre une partie
- Entrer le code
- Choisir prénom + personnage

Sur le téléphone de l'hôte :
- Choisir les jeux
- Jeux d'ambiance
- Qui de nous ?
- Lancer la partie

Les deux téléphones doivent recevoir la même question et voter séparément.
