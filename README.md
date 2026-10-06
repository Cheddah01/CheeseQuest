# CheeseQuest — A Matter of Taste

[Play on GitHub Pages](https://cheddah01.github.io/CheeseQuest/)

An original pixel-art adventure in a world that worships cheese. Chapter I takes place in the Unclaimed Marches, a neglected borderland between the Cheddar Crown and the Mozza Gang.

You wake in a woodland shrine, meet Brie, investigate a missing shipment, and discover a village caught between conflicting loyalties. Recover the food from an old tollhouse, then decide how two rival nations can share the truth—and a table.

## In this release

- A complete opening chapter with nine main-story milestones and two diplomatic resolutions.
- Seven named characters with dialogue that responds to your progress.
- A connected region with a shrine, campsite, village, landing, checkpoint, tollhouse, and road to Wheybridge.
- Three optional favors whose rewards improve your character and whose outcomes appear in the ending.
- Hidden courier boots and a heart upgrade.
- A tollhouse cellar with a three-valve puzzle, ordinary enemies, and the Tithe Collector boss.
- Sword combat, a stamina-based dodge, sprinting, telegraphed charges, and a second boss phase.
- Gathering, cooking, healing, free rest, and regrowing ingredients.
- A regional map with selectable compass destinations, quest journal, satchel, and seven-nation atlas.
- Browser-local saves, safe recovery from invalid saved data, and protection against older tabs overwriting newer progress.

The wider seven-nation campaign is introduced through the story and atlas. This release contains the complete Marches chapter; the other nations and Wheybridge are future chapters.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | Move |
| Shift | Sprint |
| Space / J / click | Swing the cheese knife |
| R | Dodge; costs 28 stamina |
| E | Talk, gather, inspect, or continue a conversation |
| Q | Eat stew; restores 3 hearts |
| M | Open the map |
| I | Open the satchel |
| L | Open field notes |
| Escape | Close a panel or pause |

Use the visible buttons for branching conversation choices. Touch controls appear on touch devices. Sound is optional and starts muted.

## Progress and recovery

Progress saves automatically to `cheesequest-chapter1-v2` on the current device and browser origin. The original demo's `cheesequest-v1` save is preserved separately. This chapter begins a new story.

Losing all hearts returns you to Brie's camp without losing discoveries or quest supplies. Resting restores all hearts and regrows ingredients. The pause menu offers a confirmed chapter restart. Clearing browser storage removes local progress; saves do not sync across devices.

## Run locally

No dependency installation or build step is required:

```sh
python3 -m http.server 4173
```

Visit http://localhost:4173. The game generates all pixel art and optional sound locally. Page typography uses optional Google Fonts with system fallbacks.

## Validate

```sh
node --check world.js
node --check story.js
node --check game.js
node tests/game.test.cjs
```

The simulation suite checks reachability, both chapter endings, puzzle gating, boss vulnerability, cooking, side quests, equipment rewards, save restoration, invalid data, multi-tab saves, and defeat recovery. Browser checks cover the opening, map, dialogue choices, village, cellar, boss rendering, and narrow layouts.

The deployment workflow runs these checks before publishing to GitHub Pages. Pushes to `main` publish automatically; Pages is configured to use GitHub Actions.

## Structure

- `world.js`: geography, actors, objects, encounters, and nation descriptions.
- `story.js`: dialogue, choices, and main quest objectives.
- `game.js`: simulation, rendering, input, menus, audio, and saves.
- `index.html` and `style.css`: responsive interface and overlays.
- `tests/game.test.cjs`: dependency-free simulation tests.

## Story direction

The broader campaign follows the Guest's attempt to reunite seven cheese nations after the Great Cheese disappears. The Marches introduces its central themes through a local dispute: food marked for destruction, a village in need, and the difficult work of cooperation. The High Pasteur's invitation closes the chapter and opens the road to the capital.
