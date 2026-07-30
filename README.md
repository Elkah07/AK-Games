# AK'Games

Projet PWA de mini-jeux de soirée, jouable sur un téléphone ou en multijoueur.

## Organisation

```text
assets/       Images des mascottes et sons
data/         Contenus et configurations JSON utilisés par les jeux
docs/         Guides, audits et historique de travail (non déployés)
icons/        Icônes de la PWA
scripts/      Code JavaScript de l'application
styles/       Feuilles de style
```

La racine contient uniquement les pages web, les fichiers PWA, la configuration
Firebase et ce README. Le service worker reste volontairement à la racine afin
de couvrir toute l'application.

## Mascottes

Les 17 mascottes sont rangées sous :

```text
assets/characters/<personnage>/<pose>/<variante>.webp
```

Poses : `idle`, `talk`, `hype`, `win`, `lose`.

Variantes : `full`, `bust`, `avatar-circle`, `icon`.

Les fichiers de référence sont :

- `data/characters-poses.json`
- `scripts/character-poses.js`
- `data/akgames-characters.json`
- `scripts/character-voice-engine.js`
- `scripts/characters.js`

## Audit

Le rapport complet se trouve dans `docs/audit/FULL_AUDIT_REPORT.md`.

Les anciens contrôles éditoriaux sont archivés sous
`docs/archive/editorial-history/`. Ils ne sont pas déployés avec l'application.

Le multijoueur Firebase doit être vérifié sur deux appareils réels après déploiement.
