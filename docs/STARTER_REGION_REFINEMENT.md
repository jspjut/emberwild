# The Reach: starter region refinement

Implemented 4 November 2026. This guide supersedes the earlier compact 1–11 layout and its pacing totals. The current playable region is **levels 1–10**, with the wider game's planned cap still 100.

## Scale and geography

The requested multipliers refer to land area. The original northern quest footprint was measured as x = −80…80, z = −72…44, covering 18,560 square metres. Introductory placements expand uniformly by √2 around the unchanged initial spawn at **(0, 32)**. Buildings, characters and furniture keep their own dimensions: the roads between them get longer.

| Area | Land area | Relative to the new introduction |
| --- | ---: | ---: |
| Hearthstead / levels 1–6 | 37,120 m² | 1× |
| Remaining region / levels 6–10 | 296,960 m² | 8× |
| Entire playable region | 334,080 m² | 9× |

The remaining region budgets approximately two introductory districts to Willowcross and its countryside, and one to each of six outlying hubs. These are land budgets, not building footprints or invisible subdivisions. Paths bend around hills, buildings and camps. The playable bounds are approximately **679 × 492 metres**; terrain continues beyond the surveyed frontier for scenery and future approaches.

| Settlement | Approximate centre | Role |
| --- | --- | --- |
| Hearthstead | (0, 28) | Level-1 welcome, western errands, class/social introduction |
| Willowcross | (0, 132) | Market, smith, study, council hall, homes, inn and return waypoint |
| Southfield | (−28, 258) | Willowcross's southern farms and harvest tasks |
| Wayfarer's Watch | (232, 142) | Human roadkeepers and the locked storehouse; level 6 |
| Tideglass Station | (235, −24) | Brinefolk rescue traditions and coastal shelter; level 7 |
| Rootsong Embassy | (−229, −24) | Sylvren memory groves and Rootmemory Hollow; level 7 |
| Stonepromise Lodge | (−239, 144) | Cairnkin oaths and the Resonant Vault; level 8 |
| Ashen Hearth | (−229, 299) | Emberkin rebuilding and the Quiet Kiln; level 9 |
| Reedwatch Camp | (232, 299) | A shared wetland survey and Reedwater Burrow; levels 9–10 |

The six hubs are separated by at least 145 metres. Their keepsakes and creature populations spread across broad field circuits instead of clustering around a representative's hut. Every camp has a representative, a neighboring character, furnishings, an authored approach and a connected multi-room boss shelter. The original five playable peoples remain the same; Reedwatch is a cooperative camp rather than a sixth race.

Willowcross has eleven town buildings plus its surrounding fields, with separate service/training locations, market stalls, residential lanes, and a larger inn with two entrances, beds, table and a clear return arrival point. Town roads and the new northern/southern routes share collision with visible structures. The original northern quest contacts, resource nodes, supply crates, lanterns, fences, gates, sanctuary columns, stairs, altar and roadside signs all move with the refined layout. The Hollow Warden stands clear of the altar, and the third beacon is beside the stairs rather than embedded in them.

## Quest route and progression

There are **80 quest definitions / 74 quests per class**, **31 NPCs**, **16 enemy types**, and seven bosses. Each class has its own two advanced training quests; the rest of the route is shared.

The northern **28-quest** sequence retains the level-2 greeting and `/soothe` reward, the western breadcrumb flow, Lantern Rest's dance and peaceful-creature introduction, and the sanctuary conclusion. It reaches level 6 at **2,791 XP** in the regression campaign. Roads and objective positions now require more travel; the same names, objective IDs and learned gestures are retained.

At level 6, Tavi sends the player to Willowcross. The town tour introduces the inn, market and southern road. A short Southfield branch teaches the town's dependence on its countryside and reminds players to bind their return. The main route introduces the six hubs in this order:

1. Wayfarer's Watch
2. Tideglass Station
3. Rootsong Embassy
4. Stonepromise Lodge
5. Ashen Hearth
6. Reedwatch Camp

Each hub retains the introduction → keepsakes → local trouble → shelter discovery → boss → return breadcrumb structure. Earlier hubs finish before the later hubs open. Class training and the farm branch provide limited parallel work. Existing accepted quests stay accepted across the refinement, even if their present prerequisites differ.

Regional quest rewards were reduced to fit the new level target; introductory rewards remain intact. The final community quest is available from level 9 so its reward can help carry the player into 10 instead of requiring level 10 beforehand. Full campaigns using actual combat, corpse loot, class skills, social objectives and quest rewards finish at:

| Class | Final XP | Level | XP beyond reaching 10 |
| --- | ---: | ---: | ---: |
| Dawnwarden | 9,972 | 10 | 172 |
| Arcanist | 9,972 | 10 | 172 |
| Pathfinder | 10,026 | 10 | 226 |
| Stormcaller | 9,972 | 10 | 172 |

Level 10 begins at 9,800 XP. The test also asserts the final total lies within 300 XP of that threshold, so the level cap cannot conceal over-rewarding. The Pathfinder's extra kills come from its skill-practice route. Bots relocate between tasks: these numbers verify progression, **not** human play duration. Incidental fights, group participation and route choices can change a player's XP. Longer travel and actual quest readability still need human playtesting.

Starter gear stays common/uncommon. Larger bag tiers and higher rarities remain reserved for later regions and the eventual endgame.

## Waypoints and Hearthward Return

Every race/class knows **Hearthward Return** from level 1. It appears in **P → General**, can be dragged onto the action bar, and occupies the final action slot on a fresh default bar. Existing custom bars remain intact. It has:

- An eight-second cast, with a locally rendered cast bar.
- No resource cost or global cooldown.
- Interruption on movement, jumping, explicit cancellation or damage.
- A combat restriction, checked again when the cast finishes.
- A **15-minute cooldown**, spent only after successful arrival, and retained through logout and server restart. Offline time reduces the saved remaining cooldown.

The default bound point is exactly the initial spawn, Hearthstead's First Light. Merrin stands inside **The Crossroads Hearth** at Willowcross. Speak to Merrin and choose **Set my return waypoint at this inn**. Resting/healing alone does not bind the return skill. Binding does not refresh a return already on cooldown. Death recovery remains a separate system using the last recovery NPC.

Waypoints have ground rings, a floating crystal, map/minimap markers and hover information. The bound ring is gold; other available points are teal. Return arrival is inside the inn on an unobstructed floor. Teleporting resets the movement epoch, old input, target and transient casting state so prediction cannot pull the character back along its previous route. The server rejects remote binding and unimplemented points.

## Border roads and the next capital

The **Alderhaven Road** leaves the eastern side of the region beyond Wayfarer's Watch. Alderhaven is the associated capital planned next. The data registry reserves three independent district waypoints: **Gate of Welcome**, **Market Hearth**, and **Lantern Gardens**. They are unavailable for binding or travel until the city exists.

Other open approaches lead toward the Brinecoast, Frostfell, Ashen March and Lowwater Fens. Each has a visible opening in the bordering ridges, an unobstructed road, a stone gateway, directional sign and map label. Approaching the current boundary explains that the neighboring zone is not open yet. These roads do not claim to load or populate future content.

The cartographer's atlas was redrawn for the larger region, with six camps, Willowcross, the farm district, the northern introduction, shelters and outgoing roads. The regional atlas marks Alderhaven as an uncharted capital. Map navigation and the camera-facing player arrow are retained. Return waypoints and future roads have their own minimap tracking checkboxes.

## Rendering and saved characters

The enlarged world uses tiled terrain: a .75-metre fine grid around the player, coarser distant ground, shared height-field normals and skirts at tile edges. Fine tiles are discarded when sufficiently far away. Trees, grass and rocks are batched in spatial chunks for distance/frustum culling; canopy cutaways still follow the camera locally. This preserves terrain grounding without drawing an entire dense large-world mesh every frame.

The layout has a saved revision. Old character positions are migrated once into the enlarged northern area or near their former settlement/shelter. Unsafe migrated positions settle safely or fall back to spawn. Identity, inventory, equipment, bank, reputation, emote unlocks, quests and ownership stay intact. Existing high-XP characters retain XP, with the prototype's visible cap now 10. The live data is backed up before deployment; no save wipe is needed. Use a new character to assess the revised leveling route.

## Verification

`npm run test:emberwild` includes complete campaigns for all classes, exact area ratios, the six hubs, object/NPC positions, every road traversed through real movement/collision, building entry, one-time position migration, universal return ownership, inn binding, cast interruption, safe arrival, cooldown persistence/offline expiry, and a real-protocol return followed by a full server restart.

`npm run test:refined-zone` uses isolated saved explorers prepared with `DATA_DIR=... ZONE_FIXTURES=... node tests/refined-zone-fixture.js`. Start a disposable server with the same DATA_DIR, then run with ZONE_FIXTURES and TEST_URL. It checks actual inn binding, walking out through the door, interrupted and successful return casts, cooldown display and relogging, the General book, waypoint markers, the uncharted capital, all six distant hub views, terrain grounding, and the map at 1280×720. Screenshots/results are saved in `test-results/refinement-*`.

Validated on 4 November 2026:

- **185/185 automated tests passed**, including four full campaigns, real collision traversal of every authored road, and a return cooldown preserved through a process restart.
- The refined-zone, spellbook and emote browser suites passed in Firefox with software WebGL. No page or shader errors were recorded. The social pass covers a second observing player, quest unlocks, reputation, peaceful creatures and real road-sign raycast hover.
- Objective regions now enclose the full spread of their markers. Level-7 offensive utility practice points to the first regional camp rather than a late camp; defensive practice remains centered on the player.
- All seven live profiles were dry-run through migration without writing the save file. Their identity, XP, quest state and bank contents survived, and their migrated positions fit the new world collision.
- The shared server was restarted on port 3080. Both loopback and the LAN address responded successfully. Its seven profiles and one roster remained byte-for-byte identical to the backup immediately after restart, before any character joined.

Pre-deployment backup: `data/backups/characters-before-starter-region-refinement-20261104T200911Z.json`. Browser artifacts: `test-results/refinement-results.json`, `spellbook-results.json`, `emotes-results.json`, and their screenshots. These checks establish functional progression and travel, not a measured human completion time or a hardware performance benchmark.


### Quiet Pool correction and individual sign boards

The western creek now widens into an authored shallow pool northwest of Rowan. `QUIET_POOL` and `QUIET_POOL_SHORE` in `shared/zone-layout.js` define its basin and dry eastern quest bank. Terrain, the continuous animated water mesh, shoreline props, approach path, quest location, minimap and cartographer's lake symbol use these shared positions. Reeds, lily pads and three gently animated frogs supply the life Rowan describes. Trees, grass and random rocks avoid the pool. The basin blends gently into the existing hills and does not fill the creek bed. The quest ID, prerequisites, reward and saved progress are unchanged.

Road-sign raycasts now resolve the actual arrow board under the pointer. A board carries one destination and its actual world direction; the tooltip shows only that board's text. Posts have no destination tooltip. New signs automatically inherit this behavior from their destination registry.

Validation: **201/201 automated tests passed**, including smooth terrain grades, mesh/physics agreement, real traversal of every road, the pool bank objective and all class campaigns. The two-character pool/sign browser test passed without page or shader errors. Screenshots: `test-results/quiet-pool-shore.png`, `quiet-pool-atlas.png`, `sign-board-1.png`, `sign-board-2.png`. The detached live server was gracefully saved and restarted, with all 8 profiles and 2 rosters retained. Backup: `data/backups/characters-before-quiet-pool-and-signs-20261104T213624Z.json`.

## Narrative foundation: The Road That Forgot Its Guests (4 November 2026)

The author background lives in `game-data/story/cinderwood-background.txt`, with fixed facts, chronology, character arcs, site explanations, quest act mapping, ending/disclosure rules and 36 future thread records in `game-data/story/cinderwood-reach.json`. These author files are outside the public server routes. `game-data/story/DEVELOPMENT_GUIDE.txt` recommends a repeatable process for future zones: begin with a complete local ending, distinguish facts from witness accounts and reserved answers, map evidence to real geography/mechanics, give every hub a personal payoff, and adopt only a few seeded continuations at a time.

All 80 definitions now receive public scenes from `shared/story-content.js`. The northern sanctuary resolves a local protection routine that has become an endless watch. Six outposts then contribute different evidence about retained guests, voluntary departures, repeated memories, broken intervals, unfinished labor and downstream water. Willowcross concludes the local incident with a release amendment; the capital shipment remains an invitation to a later investigation. The internal `five_roads` ID now has the title **The right to come home**. Its new offer also requires the existing `town_seedroad` harvest report. Briar's new `social_road` offer requires `sap` so her clean-amber evidence precedes its delivery. Existing active/completed quest records stay valid. Objectives, locations, reward totals and class restrictions are retained.

Seventeen authored documents in `shared/readables.js` appear as open books on small reading stands. They have title/author hover text, a hand cursor, click/F interaction within 4.8 paces and server line-of-sight checks, short paged parchment windows and Escape to close. Reading is optional and repeatable, with no XP, inventory cost, quest credit or cooldown. The existing one-second courier-journal and memorial-tablet examinations also reveal their actual text only after completion. The release addendum is visible/interactable only after that character completes the finale. Elowen, Briar, Ilan and Tamsin have changed personal ending gossip, also used in appropriate nearby spoken replies.

These conclusions are personal narrative state. No global enemy removal, permanent terrain/door changes or public event phase is claimed; encounters continue to respawn for other players. Human travel pace and the emotional clarity of the revised campaign still need playtesting.

Narrative release validation: **207/207 automated tests passed**, including dependency/canon-source checks, all four complete class campaigns, read range/wall/death guards, no repeated rewards, one-second examination timing/cancellation, personal ending visibility, persistence and accepted-quest compatibility. The northern campaign remains 28 quests / 2,791 XP / level 6; full campaigns remain 74 applicable quests / 9,972–10,026 XP / level 10. The isolated story browser workflow passed click/F, cursor, pages, Escape, 1280×720, examination delivery, actual finale hand-in, ending gossip and nonpublic author-data checks. The pool/sign browser regression also passed. Browser screenshots and JSON results are under `test-results/story-*`. The detached live server was restarted and checked through loopback and LAN. All eight profiles and two rosters were preserved byte-for-byte immediately after restart; backup: `data/backups/characters-before-story-foundation-20261104T220608Z.json`.
