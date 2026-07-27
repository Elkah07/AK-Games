# AK'Games

Projet PWA de mini-jeux de soirée, jouable sur un téléphone ou en multijoueur.

## Mascottes

Les 17 mascottes sont rangées sous :

```text
assets/characters/<personnage>/<pose>/<variante>.webp
```

Poses : `idle`, `talk`, `hype`, `win`, `lose`.

Variantes : `full`, `bust`, `avatar-circle`, `icon`.

Les fichiers de référence sont :

- `data/characters-poses.json`
- `character-poses.js`
- `data/akgames-characters.json`
- `character-voice-engine.js`
- `characters.js`

## Audit

Le rapport complet se trouve dans `docs/audit/FULL_AUDIT_REPORT.md`.

Le multijoueur Firebase doit être vérifié sur deux appareils réels après déploiement.
