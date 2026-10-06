# CheeseQuest — A Matter of Taste

[Play on GitHub Pages](https://cheddah01.github.io/CheeseQuest/)

An original pixel-art adventure in a world that worships cheese. Chapter I takes place in the Unclaimed Marches, a neglected borderland between the Cheddar Crown and the Mozza Gang.

You wake in a woodland shrine, meet Brie, investigate a missing shipment, and discover a village caught between conflicting loyalties. Recover the food from an old tollhouse, then decide how two rival nations can share the truth—and a table.

## In this release

- A full-screen pixel interface with character portraits, hand-drawn item icons, framed menus, and responsive layouts.
- A complete opening chapter and playable follow-up interlude, **The Eighth Place**, with fourteen story milestones.
- Two diplomatic resolutions, a consequential response to Brie, and a personal promise that carries into the farewell.
- Seven named characters with progress-aware dialogue and nineteen optional conversation topics.
- A connected region with a shrine, campsite, village, landing, checkpoint, tollhouse, and road to Wheybridge.
- Three original favors, **A Letter Without a Flag**, and **The Fourth Wheel** investigation.
- A shared-supper scene with multiple speakers, a gathered cast, and callbacks to favors, evidence, and choices.
- An Evidence journal that records discoveries as you find them.
- Hidden courier boots and a heart upgrade.
- A tollhouse cellar with a three-valve puzzle, ordinary enemies, and the Tithe Collector boss.
- Sword combat, a stamina-based dodge, sprinting, telegraphed charges, and a second boss phase.
- Gathering, cooking, healing, free rest, and regrowing ingredients.
- A regional map with selectable compass destinations, quest journal, satchel, and seven-nation atlas.
- Browser-local saves, safe recovery from invalid saved data, and protection against older tabs overwriting newer progress.

The playable story now includes the Marches chapter and its interlude. Continue after the first chapter ending to investigate the fourth shipment, confront a familiar face, share supper, and receive a second invitation. Wheybridge and the other nations remain future playable chapters.

Existing saves continue normally. If you already completed Chapter I, the quest tracker points to the new dispatch ledger in the tollhouse cellar. No restart is needed.

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

Progress saves automatically to `cheesequest-chapter1-v2` on the current device and browser origin. The original demo's `cheesequest-v1` save is preserved separately. Updates preserve Chapter I progress and add missing story fields automatically.

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
node --check chronicle.js
node --check game.js
node --check ui.js
node tests/game.test.cjs
```

The 23-check simulation suite covers reachability, both original endings, all eight interlude choice combinations, the letter quest, physical evidence, multi-speaker dialogue, conditional supper scenes, legacy saves, puzzle gating, combat, equipment, recovery, and storage conflicts. Browser checks cover the opening, map, dialogue choices, village, cellar, boss rendering, and narrow layouts.

The deployment workflow runs these checks before publishing to GitHub Pages. Pushes to `main` publish automatically; Pages is configured to use GitHub Actions.

## Structure

- `world.js`: geography, actors, objects, encounters, and nation descriptions.
- `story.js`: opening chapter dialogue and objectives.
- `chronicle.js`: character topics, interlude scenes, favors, and evidence.
- `ui.js`: original pixel icons and character portraits.
- `game.js`: simulation, rendering, input, menus, audio, and saves.
- `index.html` and `style.css`: responsive interface and overlays.
- `tests/game.test.cjs`: dependency-free simulation tests.

## Story direction

The broader campaign follows the Guest's attempt to reunite seven cheese nations after the Great Cheese disappears. The Marches introduces its central themes through a local dispute: food marked for destruction, a village in need, and the difficult work of cooperation. The interlude follows the missing shipment into a larger mystery, brings the cast together, and gives the Guest a reason to question the High Pasteur in person.
