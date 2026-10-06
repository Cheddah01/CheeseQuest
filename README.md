# CheeseQuest

A tiny, original pixel-art woodland adventure about the hunt for the Great Cheese.

Explore Fernwood Glade, meet Brie the camp fox, gather ingredients, cook healing stew, and recover three golden rind fragments from moss slimes. Bring the rinds to the northeastern shrine to claim the legendary wheel. You can keep exploring after the ending.

## Play

- **WASD / arrow keys:** move
- **Shift:** sprint
- **Space / J / click:** swing your sword
- **E:** gather, talk, cook, or inspect the shrine
- **Q:** eat stew to restore three hearts
- **M:** field notes
- **Escape:** pause or close a panel

Touch controls appear on touch devices. Progress saves automatically in the current browser on the current device. The pause menu offers a confirmed fresh start. Losing all hearts returns you to camp without losing collected rinds or ingredients. Resting at the fire without cooking ingredients restores your hearts.

## Run locally

No installation or build step is required. From this directory:

```sh
python3 -m http.server 4173
```

Visit http://localhost:4173. All game graphics and optional sound effects are generated locally. The page uses optional Google Fonts with system font fallbacks.

## Publish on GitHub Pages

The included workflow publishes the repository root when `main` changes. In the repository's **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. Run the **Publish CheeseQuest** workflow if needed.

Expected site address after a successful deployment: https://cheddah01.github.io/CheeseQuest/

All asset paths are relative, so repository subpath hosting works without configuration.

## Validate

With Node.js installed:

```sh
node --check game.js
node tests/game.test.cjs
```

The dependency-free simulation test checks reachability of every objective, pond and bridge collisions, movement and pause, gathering/cooking/healing, combat, the shrine ending, save/reload, invalid saved data, and return to camp after defeat. Browser checks cover the rendered interface and actual keyboard interactions.

## Files

- `index.html`: page, interface, and accessible controls
- `style.css`: responsive layout and presentation
- `game.js`: world, original pixel graphics, gameplay, synthesized audio, and local saves
- `.github/workflows/pages.yml`: GitHub Pages deployment
- `tests/game.test.cjs`: game simulation checks

This is a small first playable prototype: one region, three enemies, and one complete quest. No accounts, backend, or multiplayer.
