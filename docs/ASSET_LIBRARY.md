The continental and ecology extensions retain the original collection and add biome and zone-specific designs: **881 catalog entries / 15 palettes / 48 assembled outfits**, including 637 exported equipment SVG icons. All original art is retained. See [CONTINENT.md](CONTINENT.md) for templates and runtime integration.

# Emberwild expansion asset library

The expanded Volume 1 provides **881 catalog entries** (792 curated designs and 89 live equipment appearances) and 15 regional palettes (**13,215 design/palette combinations**). Included files contain 881 curated models, 48 assembled armor-set models and 929 transparent previews. The workshop exports selected variants or worn previews on demand. Regional variants share their base design.

Open `/asset-library.html` on the game server for the interactive workshop, or `/assets/catalog.html` for a printable collection sheet. `/assets/collection.tar.gz` contains the curated models, previews, manifest, collection sheet, README and MIT license. These assets are staged for future content; they do not add enemies, loot, race choices or clutter to the existing starter zone.

## Collection

| Category | Designs |
| --- | --- |
| Creatures (208) | 20 original/continental designs plus 188 ecology designs; 32 body shapes with physical adaptations. See [zone rosters](CREATURE_ECOLOGY.md). |
| Races (5) | Original playable human, plus four prototypes: Sylvren: bark/leaf folk; Cairnkin: broad mineral folk; Brinefolk: amphibious fin-eared folk; Emberkin: horned ash folk |
| Equipment (637) | 384 pieces across 48 armor sets; 110 new level-band weapons/offhands; original equipment studies and signature pieces; 89 live game appearances. |
| World props (31) | Broadleaf tree, pine, willow, dead tree, stone arch, runestone, crystal cluster, ore seam, herb patch, mushrooms, reeds, log stack, crates, barrel, cart, market stall, lantern post, signpost, bench, well, rope bridge, open-front tent, plus nine continental props including the flight skiff |

The 15 regional palettes include woodland, coast, highlands, ash, grassland, marsh, rainforest, crystal, desert, orchid, coral, storm and astral/abyssal habitats. Each defines body/light/dark, foliage, wood, stone, metal, trim, cloth and glow colors. Small region-specific geometry accents include snow on pines and selected creatures, and ember minerals on volcanic creatures. Distinct model silhouettes stay recognizable across palettes.

## Style and conventions

- One unit is one meter, +Y points up, and characters/creatures face +Z. The root has a grounded pivot; `modelOffsetY` preserves the shift from authoring coordinates.
- Use rounded, smooth-shaded low-polygon masses, readable silhouettes, subdued natural materials and small emissive accents. Equipment follows the existing split-part character rig. No textures or external art downloads are required.
- Every creature and race has looping **Idle**, **Walk** and **Attack** node-animation clips. Articulated wings, pincers, heads and tails use local transforms. Wind/sway clips accompany relevant vegetation and lanterns. Static props/items remain static.
- Material and primitive geometry caches are shared. Use the provided disposer rather than disposing shared primitive/equipment buffers individually. The gallery renders only the selected asset; catalog thumbnails are cached PNGs.
- All art recipes, original models and preview images use the project's MIT license. The Three.js runtime/exporter remains its separately licensed dependency.

## Using source assets in the renderer

The curated registry is `shared/asset-library.js`; `shared/complete-assets.js` adds every non-template live equipment appearance for the workshop, catalog and export builders. Runtime factories are under `client/asset-library/`.

```js
import {
  createExpansionAsset, animateExpansionAsset, disposeExpansionAsset
} from './asset-library/library.js';

const fox = createExpansionAsset('brushfox', {region: 'frostfell'});
fox.position.set(x, groundY, z);
scene.add(fox);

// Each render frame; time is seconds. Use 'idle', 'walk', or 'attack'.
animateExpansionAsset(fox, 'walk', time % 1);

// On removal:
disposeExpansionAsset(fox);
```

The controller resets joint transforms to their bind pose before each update. State switches and repeated timestamps do not accumulate rotation or position drift. Creature motion is an art presentation layer; authoritative movement, combat timing and AI must drive the selected state when a creature joins gameplay. Export clips bake the local transforms into ordinary glTF node tracks, without requiring the procedural controller in another tool.

`expansionRig(root)` returns a race's existing humanoid rig and its named equipment sockets. The human uses the original game face, cropped hair, proportions, starter coat and blade. The other race prototypes include a removable regional coat/trousers/boots outfit; `dressExpansionRace(root, false)` reveals their base body. Their body proportions and traits are art prototypes, so final locomotion retargeting, character-creation options, racial rules and helmet accommodations should be completed when adding a race to play. Horns, fins and crowns intentionally remain visible in the prototype outfits.

## Armor, class intent and special rewards

Each of cloth, leather, mail and plate has a practical field set and a more elaborate boss set. All eight sets include **head, shoulders, chest, hands, waist, legs, feet and back**. Cloth has split robe panels, wraps and hoods; leather has layered jerkins, straps and pouches; mail uses overlapping metal scales; plate has breastplates, articulated guards and heavy footwear.

| Material | Field set | Boss set | Class preference |
| --- | --- | --- | --- |
| Cloth | Wayfarer Weave | Starfall Vestments | Arcanist |
| Leather | Trailhide | Briarcrown | Pathfinder |
| Mail | Rivetguard | Tide Sovereign | Stormcaller; field mail also suits Dawnwarden |
| Plate | Bastion | Dawn-Crowned | Dawnwarden |

Boss variants add raised collars, larger shoulders, special head silhouettes, inset gems and signature light. Reward weapons include Dawnward Oathblade, Cometspire, Briarstring, Tempest Piercer, Hollowguard, Glacier Maul, Nightglass, Drowned Mariner's Axe, Eclipse Edge and Oracle's Tideglass. Bow, dagger, oversized split-tip greatsword and off-hand focus silhouettes extend the weapon vocabulary.

`shared/equipment-collection.js` defines sets, pieces and reusable `equipmentUsage(item, classId)`. `classPreference` is a soft preference and allows every class; `allowedClasses` is a hard eligibility rule for signature-item intent. The workshop's preview class distinguishes those cases while letting designers inspect all art. Arcanist, Pathfinder and Stormcaller are planning profiles, not implemented playable classes. These records do not add loot or change live equipment eligibility by themselves. When promoting an item to gameplay, apply the policy server-side using an authoritative class ID.

`rarity`, `tier` and `source` describe planned field, boss or rare-world-drop acquisition. Sources marked as concepts have no implemented new boss, drop rate or reward assignment. Legendary designs use distinct silhouettes as well as signature materials.

The [itemization and leveling plan](ITEMIZATION_AND_LEVELING.md) reserves the starter zone for white/green equipment and targets an eventual level-100 cap. Tiered assets now export `plannedLevels`: green field sets 7–24, blue field sets 25–49 / 35–59, purple boss concepts 90–100, blue special weapons 35–59, and orange signature weapons 100. Gold unique is supported by the rarity registry/theme/filter but intentionally has no populated design. Untiered studies are marked Unassigned. Hollowguard refers to an endgame **Elder Hollow Warden** concept, rather than granting a purple shield from the current starter boss.

The workshop opens on **Human · original Dawnwarden**, also listed under Races. Equipment can be filtered by material, reward tier, slot and class intent. Presentation offers standalone, worn-piece and complete-set modes on any of the five races. Race previews have a set selector and optional hidden headgear. Worn GLB export includes the mannequin, equipped pieces, clips and `previewOf`/`outfit` metadata; curated item links remain standalone. The collection sheet and ZIP additionally include all 48 assembled sets. Shoulder, glove, waist and back models attach to existing rig sockets; add those slots to live public equipment rendering when introducing them into gameplay.

## Equipping item recipes

`itemRecipe(assetId, regionId)` returns an ordinary appearance recipe. `equipmentRecipe(recipe)` in `client/equipment.js` builds parts in the same socket-local coordinate system used by current game items. Factories support axes, hammers, staffs, spears, bows, daggers, greatswords, focuses, helmets, packs and all eight armor-set slots alongside the original models.

```js
import {itemRecipe} from '../shared/asset-library.js';
import {equipmentRecipe} from './equipment.js';

const recipe = itemRecipe('trail_axe', 'sunsteppe');
for (const [socket, part] of Object.entries(equipmentRecipe(recipe))) {
  rig.sockets[socket].add(part);
}
```

When adding a live inventory item, put this recipe in its `appearance` field and separately assign its slot/stats/price/loot rules in shared content. The back pack is authored at the torso socket; live rendering of a back slot still needs to be enabled in the visible-equipment layout. The workshop displays standalone equipment parts in a neutral bind-pose arrangement. GLBs retain `socket` extras on attachment nodes; the source factory is the direct integration path for game equipment.

## Placement and physics metadata

`root.userData.library` and each manifest entry include ID, category, region, bounds, size, triangle count, sockets and collision hints. Prop `collision.volumes` are local box volumes with center `{x,y,z}`, `{width,height,depth}` and a `support` flag. A support box's top is `y + height/2`. Bench seats, crate tops, cart floors, bridge decks and log stacks have support data; arches and wells use separate obstruction volumes. Small herbs, reeds and fungi are decorative/nonblocking.

Volumes are placement metadata, not an automatic registration with the live server's physics. Transform them with the prop and register them in shared collision/support data when placing content. Review room/door clearance and support surfaces during that integration. Cloth tent surfaces and decorative ropes have no comprehensive physical shell in this collection. Actor capsule dimensions are initial collision hints, not validated balance or navigation rules.

## Files and reproducible builds

- `client/assets/models/*.glb`: 881 curated models using their recommended regions.
- `client/assets/models/sets/*.glb`: eight fully assembled human outfits with animation clips.
- `client/assets/previews/*.png` and `previews/sets/*.png`: 929 actual 3D renders with alpha, suitable for catalog/inventory studies.
- `client/assets/library-manifest.json`: searchable IDs, tags, dimensions, animations, recipes, physics hints, file paths, sizes and SHA-256 hashes.
- `client/assets/catalog.html`: static collection sheet; it also works from the extracted ZIP.
- `client/assets/LICENSE`: license copied from the project.

With Node on PATH:

```sh
npm run build:assets
# Run an isolated game server in another terminal, for example:
# DATA_DIR=/tmp/emberwild-asset-preview PORT=3081 ./start.sh --world emberwild
TEST_URL=http://127.0.0.1:3081 npm run preview:assets
npm run package:assets
```

The preview script defaults to Firefox. Install it with `npx playwright install firefox` first (Linux may also need its system dependencies and Xvfb). After generating thumbnails, restart the disposable preview server to refresh its assembled snapshot before reviewing the gallery; the game launcher does not watch generated files. On a machine requiring software WebGL, use `DISPLAY=:99 LIBGL_ALWAYS_SOFTWARE=1 HEADED=1` with a running display. The archive command uses standard `tar` and gzip. The workshop can independently download the current region's GLB, including its clips/materials/metadata, or a transparent PNG without modifying source or saves.

## Verification

`npm run test:emberwild` covers all 13,215 variants, finite geometry, grounded origins, unique node names, triangle budgets, deterministic animations/continuous clip loops, race equipment sockets, and GLB loader round trips with manifest hashes. `npm run test:assets` opens the real workshop, renders all 881 designs and 15 palettes, checks filtering, race outfits, animation controls, GLB/PNG downloads, transparency, exported animation playback data and a compact desktop viewport.

## Source control and distribution

The procedural factories, registry and build tools are the source of truth. Generated `client/assets/models/` GLBs, `previews/` PNGs, the model ZIP, manifest, catalog and copied itemization document are ignored by Git. No LFS checkout is needed. Keep authored `shared/prop-profiles.js` available in source: gameplay physics imports that textual generated module, and the asset build refreshes it from collision recipes. Review changes to it when committing source changes.

A fresh source checkout can run the game without the optional binary exports. Run `npm run build:assets` and the preview steps above before the export-verification tests, which check both models and thumbnails and `npm run package:assets` only when producing the separate art collection. Release archives can include locally generated files even though Git ignores them. Standard game/starter downloads use `.tar.gz`; the existing art ZIP is an optional authoring resource.

## Complete automated rebuild and website

From a fresh source checkout, use the engine-root command `npm run build:world-assets` (Linux software rendering: `xvfb-run -a env HEADED=1 LIBGL_ALWAYS_SOFTWARE=1 npm run build:world-assets`). It builds models, serves an isolated runtime, captures all thumbnails and verifies exports before writing the ignored outputs back. No manual preview server or existing save directory is needed. It always enumerates the complete library, including unused content.

CI and GitHub Pages use this command. The static website includes the complete source-driven workshop and a generated art tarball. `npm run package:release -- --world emberwild --assets` creates separate generated-art `.tar.gz` release attachments; the older ZIP command is optional legacy authoring functionality. Never commit binary outputs or generated website media.

## Creature motion

The shared clip clock in `client/asset-library/motion.js` defines exact four-second idle, one-second locomotion and 1.2-second attack loops. Serpents propagate lateral waves; quadrupeds alternate diagonal pairs; many-legged crawlers stagger their feet; swimmers use tail sweeps or bell pulses; frogs and hares hop; flyers articulate mirrored wings. Armored beetle covers stay closed during walking. Scale animation is included in exported clips, including jelly pulses.

Live creatures use distance-based gait phase and filtered movement blends through `animateExpansionLocomotion`, instead of switching idle/walk at a per-frame movement threshold. This keeps gait consistent across display refresh rates. Corpses freeze their procedural motion. The workshop plays the same procedural rigs used to export GLBs.

Non-boss server ambient roaming chooses a collision-checked fixed destination 1–3 strides away (2.3 metres per stride), walks there continuously and rests for 2–6 seconds. Terrain/collision or direct interaction can interrupt a bout. Automatic social gestures wait until roaming/patrol walking has stopped; player interactions and combat still take priority. Capital residents retain their authored longer routes; bosses remain at their arena anchors until combat.

Run `node tools/test-world.js --world emberwild --script tests/creature-motion.test.js` from the engine repository for uncorrected loop seams, slither continuity, closed beetle covers, scale export tracks, refresh-rate consistency and actual starter roaming checks.

With Playwright/Firefox installed, `HEADED=1 xvfb-run -a node tools/creature-motion-browser.js --world emberwild` checks idle/move playback for all 32 body shapes in the workshop and exercises the actual live renderer on a disposable server.

The [equipment progression guide](EQUIPMENT_PROGRESSION.md) lists the ten shape bands and explains live templates. All 48 outfits can be previewed on each of the five race rigs. The workshop level-band filter is separate from the biome palette selector.
