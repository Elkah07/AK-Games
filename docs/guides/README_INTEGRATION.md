# AK’Games — Pack d’intégration mascottes et poses V3

## Ce que contient réellement ce ZIP

- Les **17 visuels validés** dans la pose `idle`.
- Pour chaque pose `idle`, les formats `full`, `bust`, `avatar-circle` et `icon` en PNG et WEBP.
- Les **1 632 phrases** et leur moteur anti-répétition.
- Le moteur `character-poses.js`, prêt à choisir la bonne image selon le personnage, la pose et le cadrage.
- Des animations de secours différentes pour `talk`, `hype`, `win` et `lose`.
- La Bible officielle des poses.

## Transparence importante

Les 68 nouvelles illustrations `talk`, `hype`, `win` et `lose` ne sont pas encore dessinées et validées. Elles ne sont pas remplacées par de faux visuels dans ce pack. Tant qu’un fichier manque, le moteur affiche automatiquement la pose `idle` avec une animation adaptée.

## Installation

Copier à la racine du projet :

- `assets/`
- `data/`
- `character-poses.js`
- `character-poses.css`
- `character-voice-engine.js`

Puis charger les fichiers :

```html
<link rel="stylesheet" href="styles/character-poses.css">
<script src="scripts/character-poses.js" defer></script>
<script src="scripts/character-voice-engine.js" defer></script>
```

## Exemples

```js
const winner = AKCharacterPoses.createImage("frog", {
  pose: "win",
  format: "full",
  alt: "Croâ célèbre la victoire"
});
container.append(winner);
```

```js
avatarContainer.innerHTML = AKCharacterPoses.pictureMarkup("bonnie", {
  pose: "idle",
  format: "avatar-circle",
  alt: "Bonnie"
});
```

```js
AKCharacterPoses.setPose(existingImage, "talk");
```

## Quand les nouvelles poses seront validées

Déposer simplement les fichiers dans :

```text
assets/characters/<personnage>/<pose>/
  master.png
  full.png
  full.webp
  bust.png
  bust.webp
  avatar-circle.png
  avatar-circle.webp
  icon.png
  icon.webp
```

Puis passer `available` à `true` dans `data/characters-poses.json` et ajouter la pose au tableau `AVAILABLE_POSES` de `character-poses.js`.
