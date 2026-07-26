# AK'Games — personnages et répliques V2

## Contenu

- **17 personnages**
- **12 moments de prise de parole**
- **8 phrases par moment et par personnage**
- **96 phrases par personnage**
- **1632 phrases au total**

## Événements

- `selected` : Juste après que le joueur confirme son personnage.
- `lobby_ready` : Dans le lobby lorsque le joueur est prêt ou lorsque tous les joueurs sont réunis.
- `game_start` : Au lancement effectif d'un mini-jeu, avant la première manche.
- `turn_start` : Quand ce joueur devient la personne active de la manche.
- `phone_pass` : Sur l'écran demandant de passer le téléphone à ce joueur ou au joueur suivant.
- `waiting_others` : Après validation d'une réponse, pendant l'attente des autres joueurs en multijoueur.
- `round_win` : Quand le joueur gagne la manche, marque des points ou réussit son défi.
- `round_miss` : Quand le joueur rate, passe, ne marque pas ou manque le temps, uniquement si le jeu accepte ce ton.
- `pause` : Au moment où l'hôte met la partie en pause.
- `resume` : Au moment où l'hôte reprend la partie.
- `final_win` : À l'écran final si le joueur termine premier ou premier ex æquo.
- `final_lose` : À l'écran final si le joueur ne termine pas premier.

## Éviter les répétitions

Ne choisissez pas une phrase avec `Math.random()` à chaque affichage. Utilisez `character-voice-engine.js` : il mélange les 8 phrases d’un événement, les distribue une par une, puis remélange seulement lorsque le sac est vide. Une phrase ne peut donc pas revenir immédiatement.

```js
import characterData from './akgames-characters.json' with {{ type: 'json' }};
import {{ CharacterVoiceEngine }} from './character-voice-engine.js';

const voices = new CharacterVoiceEngine(characterData);
const line = voices.getLine('spike', 'turn_start');
```

## Recadrages d’images prévus

Chaque personnage possède les clés suivantes dans le JSON :

- `full` : personnage entier, victoire et classement ;
- `bust` : tête et épaules, dialogues et lobby ;
- `avatar-circle` : recadrage circulaire pour le choix du personnage ;
- `icon` : mini-format pour scores et listes.

Les chemins sont déjà normalisés dans le JSON. Les fichiers visuels correspondants devront être générés et placés dans `assets/characters/<id>/` lors de l’intégration.

## Fréquence d’affichage recommandée

Le JSON contient `recommendedDisplayRate` pour éviter que les mascottes parlent à chaque micro-action. Les moments importants (`selected`, `game_start`, `pause`, `resume`, fins de partie) sont à 100 %, tandis que les moments très fréquents (`waiting_others`, `phone_pass`) sont plus espacés.
