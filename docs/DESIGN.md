# Current class roles

See [CLASS_DESIGN.md](CLASS_DESIGN.md) for the four independent starter kits and current support targeting. Historical implementation notes below describe the broader prototype.

# The Cinderwood Reach: first playable design

## Reference and intent

The intended feel is the early Classic RPG loop: learn a place, meet several people who need practical help, take overlapping tasks into the same nearby terrain, return with goods and stories, improve equipment, then venture farther out. The original six large-reward steps were replaced with 24 smaller quests in response to the requested Classic/Forever pacing reference.

Research consulted on November 2, 2026:

- [Blizzard: Forever What’s Next](https://worldofwarcraft.blizzard.com/en-us/news/24303862/world-of-warcraft-forever-whats-next-panel-recap): the world and leveling journey are central; additions preserve challenge, preparation, and social play.
- [Blizzard: Gather Around the Campfire](https://news.blizzard.com/en-gb/article/24301516/gather-around-the-campfire-in-world-of-warcraft-forever): pauses and shared rest support meeting people; not every activity is another combat objective.
- [Bind on Forever: first quests in every starting zone](https://bindonforever.com/articles/wow-forever-first-hour-every-starting-zone): a fan-maintained beta route reference, not an official quest specification. Comparing Northshire, Coldridge, Valley of Trials, and the new Skyborne opening suggests introductions, parallel local tasks, class visits, short chains, and a transition out of the small starting pocket. Its reported timings vary with class/player; they are not a fixed target or measured Emberwild timing.
- [Blizzard: New Player’s Starter Guide](https://worldofwarcraft.blizzard.com/en-us/news/24315280/einsteigerleitfaden-f%C3%BCr-neue-spieler-willkommen-bei-world-of-warcraft): multiple quest offers and a quest log support player choice and exploration.

These inform the structure, not the fiction or copied quest text. Campfire crafting, professions, and the broader Forever feature set are not implemented.

## Local stories

| Thread | Quests | Purpose |
| --- | --- | --- |
| Hearthstead introductions | A place by the fire | Establish the keeper, healer, and home |
| Meadow work | A small, sharp problem; Something green for the kettle; The seedbed thieves; Where the western road bends | Parallel hunting, gathering, loot, exploration |
| Western trail | What the road left behind; A parcel for Rowan; Tracks without footsteps; The quiet pool; The road remembers | Move to a new contact; investigate the blight |
| Dawnwarden identity | The shape of a spark; The light you keep; An edge from the old dawn; Make room for the dawn | Practice range, recovery, area skills, and earn a weapon |
| Eastern grove | A grove in need; Roots of unrest; Amber under the bark; Little hearts of spring | Overlapping objectives and a local character’s concerns |
| Sanctuary approach | At the edge of the ash; The sleeping lanterns; Names beneath the ash; Fragments of a fallen dawn | Scout contact, travel, remembrance, combat |
| Resolution | A light in the hollow; Tomorrow has a road | Telegraph/dodge boss encounter; a social return home |

Several quests can progress on one outing. Killing and looting are distinct interactions. Supplies/gathering objects are per-character so another player cannot exhaust the required resource. A maximum of 12 quests can be active. The journal shows locked, available, active, ready, and completed states; selecting an active entry tracks its area on the map. The main resolution can be completed without every side story, but level gates encourage doing local work rather than sprinting to the boss.

## Progression and pacing

The long-term target is level 100. [ITEMIZATION_AND_LEVELING.md](ITEMIZATION_AND_LEVELING.md) tracks the proposed full-game pace and its unresolved timing assumptions. The current zone is capped at common/uncommon, including its final boss and best merchant bag. Early blade/bag/charm rewards are common; later core upgrades are uncommon. Rarity names/colors and proposed introduction levels come from `shared/progression.js`; the XP table below remains the complete playable progression.

| Level | Cumulative XP | New capability |
| --- | --- | --- |
| 1 | 0 | Auto attack, Sunstrike, Sundering Slash |
| 2 | 180 | Second Wind self healing |
| 3 | 500 | Eastern grove work becomes available |
| 4 | 950 | Sweeping Blade; advanced class quests |
| 5 | 1,500 | Final boss quest, after sanctuary prerequisites |
| 6 | 2,200 | Original campaign checkpoint; the current live cap is 10 |

Experience comes from both combat and modest quest rewards. Creature levels are fixed. XP diminishes for creatures two/three levels below the player and reaches zero at four levels below. Loot and required quest credit remain available. Gear upgrades and levels make returning to older areas easier.

Combat is deliberately slower than the initial implementation: 1.8-second basic swings, 4/7-second opening skill cooldowns, and enemy health scaled to allow several actions. Second Wind, tonics, retreating, and recovery are useful without requiring perfect play. The boss pauses for a 1.8-second red ground warning before its seven-pace slam. Leaving that circle avoids the slam.

There is **no verified human completion-time claim**. The zone is compact, and an experienced reader skipping dialogue may still complete it faster than a mature Classic starter zone. First playtesting should record time to levels 2–6, downtime, travel confusion, skill usage, and which quests were skipped. Tune XP, objective counts, geography, enemy spacing, and recovery together after that evidence; adding quests alone is not sufficient. Avoid mandatory filler grinding merely to lengthen a stopwatch result.

The original 24-quest campaign reaches level 6; the expanded campaign validates all 74 class-applicable quests for each of the four classes through level 10 using actual skill, kill and loot rules. It relocates between objectives and is not a travel/pacing test. The browser test verifies real movement, UI, a combat encounter, multiplayer chat, and reconnect persistence.

## Desktop RPG interface

The interface pass uses the conventions described in the [original Classic manual](https://us.media.blizzard.com/manuals/wow/wow-classic-manual-enUS.pdf): individual quest and character windows, slot-based bags, a spellbook, a customizable 12-slot action bar, and a small interface menu. Frame textures, icons, and portrait art are original SVG/CSS, with no copied Blizzard interface assets.

Quest dialogue is a side window with an NPC list and one quest detail at a time. Current quests have a split list/detail log, with available and completed work in separate views. Major panels are independent, draggable, and placed beside existing panels when there is space. There is no backdrop, dimming, or gameplay pause; movement closes conversations and loot when you leave interaction range.

Inventory ownership remains authoritative. Equipped pieces are omitted from bag slots; equipping swaps the previous piece back into the bag. The backpack has 20 slots, with four equipped bag slots adding 6 or 8 slots apiece in this region (52 total starter slots). Bags are purchased from Tavi, with 6 slots at level 1 and 8 at level 3; the supply-recovery quest grants an 8-slot satchel. Stacks hold 99, while equipment and bags occupy individual slots. Equipped bags remain owned but are excluded from stored item counts. Removal and replacement validate the resulting capacity, including the returned bag, before changing anything. Quest rewards are placed in bags rather than automatically equipped. Quest drops are real inventory items, cannot be sold, and are consumed on turn-in. Existing active quest progress is migrated to matching quest items when an older character save loads.

Corpses maintain per-player contents. Opening one sends a preview; coins, individual items, or all contents can then be collected with eligibility, range, capacity, and duplicate-claim checks. Full bags retain remaining items on the corpse. Shift quick loot and an Auto Loot preference offer the familiar fast path.

Spell and item icons can be dragged to action slots, and unlocked/Shift-dragged slots can be rearranged. Action and bag order preferences are per-character browser settings, not changes to server-owned capabilities. Pointer dragging is used so behavior is consistent in Firefox and Chromium without relying on native browser dragging of button elements. Numbered keys invoke the current slot contents; level-up messages direct players to the spellbook rather than assuming a fixed key binding.

## Multiplayer and technical shape

The browser sends intentions: movement directions, selected targets, skill requests, interactions, and chat. The server owns positions, allowed movement, health, cooldowns, range checks, XP, inventory, quest prerequisites, and rewards. Input expires after 300 ms if its heartbeat stops. Payload/rate limits, bounded chat, host-origin checking, random bearer tokens, backpressure limits, and atomic saves provide a basic prototype foundation.

Every player who damages a creature recently, remains alive, and stays nearby receives independent XP and loot eligibility. Five-player parties provide consent-based invitations and clickable health frames. Membership is temporary and cleans up on disconnect; existing per-participant combat and loot rules still apply. Multiple characters can gather the same quest object independently. Enemies return home and evade damage after leashing. The server allows 64 characters in this single zone; there is no claim of persistent-world scale beyond this.

The Three.js client renders its own character from predicted movement and remote actors from interpolated snapshots, alongside deterministic scenery. All terrain, props, character models, and effects are code-authored. No asset pipeline or proprietary client is needed. This simplifies the starting point but leaves animation, terrain collision detail, navigation/pathfinding, UI accessibility, and remote-network responsiveness as future work.

## Responsive networking, casting, and map views

The local character and camera previously waited for 10 Hz snapshots and then both eased toward them. The new local path responds at the next render/fixed simulation step. Commands carry monotonically increasing sequence IDs and movement epochs, with deterministic 1/60-second collision and jump simulation shared between server and client. The client replays still-pending commands over each authoritative acknowledgement. Small correction offsets decay visually; large corrections, death, and respawn snap/reset prediction. Prediction pauses during long outages rather than extrapolating indefinitely.

The server accrues elapsed-time credit, capped at 100 ms of burst capacity, and consumes queued fixed steps only within that budget. Clients cannot supply durations, coordinates, jump height, or speed. Queue length, batch size, sequence continuity, finite input vectors, epochs, and collision rules are validated. Legacy directional input remains for bots/tests, but cannot override a character once it uses the sequenced protocol. Background/stale clients stop and their jump settles. Timing/interpolation histories reset on reconnect.

Other actors render from a 100 ms snapshot buffer with short-angle rotation interpolation and at most 100 ms extrapolation through jitter. An application ping/pong measures RTT and synchronizes a monotonic presentation clock using lower-jitter samples. This follows the general [client prediction/reconciliation](https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html) and [entity interpolation](https://www.gabrielgambetta.com/entity-interpolation.html) techniques described by Gabriel Gambetta; it is not a claim about proprietary WoW internals. Client targeting, attack-button feedback, and cast-start presentation respond immediately, while health/rewards remain authoritative.

Sundering Slash takes 1.5 seconds and Second Wind takes 1.8 seconds. Sunstrike and Sweeping Blade remain instant. The server validates cast start/end, retains the original target, pauses basic swings during casting, and applies costs, cooldowns, healing/damage, and skill quest credit only at successful completion. Movement, jumping, cancellation, and death interrupt. A pending jump cannot be used to start an airborne cast. Client cast cancellation suppresses stale in-flight confirmations so interrupted bars do not reappear. Full combat rewind, spell queueing, and cast pushback are outside this pass.

The minimap uses predicted local position as its center at all six zoom levels (12–76 pace radii), a cached static background, interpolated remote markers, and bounded edge arrows for offscreen quest destinations. Zoom uses buttons or wheel input and is saved locally. The full-zone map uses its fixed world origin and extent. Quest numbers match the tracker; selected objectives show area shading, remaining targets, a direction/distance card, and correct turn-in destinations. Personal quest loot on corpses takes priority over living targets. Nearby pins cluster and can be clicked to cycle the tracked quest. Saved filters independently control quest objectives, quest givers, rest points, class mentors, merchants, herbs, ore, other objects, and enemies. Service labels reflect the existing rest/healing and automatic class-skill progression; no new inn or profession subsystem is implied.

Sunmint and copper seams are ordinary gatherable trade goods, available outside quest objectives. Personal 45/60-second cooldowns avoid exhausting resources for other players. Remaining cooldown time is persisted and pauses offline. Gathering quests retain distinct-node credit rules. Right-drag camera movement hides the cursor until release, cancellation, focus loss, or disconnect.

Nameplate contents rebuild only when their data changes, while transforms still follow actors each frame. Canopy checks reuse scalar math on a slower cadence and shadow rendering updates at 20 Hz. A real 300 ms round-trip proxy browser test checks responsiveness and authority separately. Frame/DOM measurements are development evidence; hardware rendering performance still depends on the player's GPU/browser.

## Later local AI

Keep the simulation authoritative. Future local models should create candidate quests, dialogue, item descriptions, and zone changes as data, with schema checks, level/reward budgets, prerequisites, moderation appropriate to the intended audience, versioning, and rollback before entering a live world. Existing `World.events` is an in-memory gameplay event seam; it is not yet a durable event log. Persistence should migrate to a transactional database before large-scale or concurrent content editing. No LLM/GPU inference service is required or included in this milestone.


## Terrain and character motion

The playable terrain now has broad meadow hills and a raised northern approach, with approximately 13 metres between the stream bed and the highest ground. The hearth and building footprints remain level; transitions blend continuously into climbable slopes. The stream uses a consistent water elevation over a shallow carved bed. Paths follow the terrain mesh, and props, actors, selection rings, and camera elevation sample the same shared height field. The movement protocol still predicts horizontal movement and absolute foot elevation, grounding and velocity across terrain and prop surfaces; there are no new cliffs, fall damage, swimming, or climbing mechanics.

Character animation is presentation owned by the client. The local avatar reads predicted motion every rendered frame, while remote avatars read interpolated motion. Distance advances a continuous gait phase, smoothed speed blends running and idle, and jointed legs place feet against sampled terrain. Slopes shorten the visible stride. Arms counter-swing, held items follow the hands, and jumping/landing and melee swings add pose changes. Teleports reset animation history. The renderer smooths facing and ground-following camera height without delaying predicted horizontal movement. The models and motion remain procedural prototype art.

Validation includes fixed-step movement up/down the northern approach, terrain continuity and mesh-height agreement, joint grounding, gait stability at 30/60/144 Hz, real browser traversal and jumping, and animation appearing before acknowledgements over a real 300 ms RTT proxy.


## Targeting, tracking, and living-world presentation

Left-click selects enemies, players, and NPCs passively. Right-click starts enemy autoattack and retains nearby NPC conversations and gathering. Stormcaller’s Healing Rain resolves a living friendly recipient (or the caster when targeting an enemy/nothing), locks that recipient for its cast, and revalidates life, connection, line of sight and 24-pace range before spending resources. Second Wind is self-only. Friendly units cannot be damaged by offensive skills. NPC health is authoritative runtime state; NPCs remain stationary quest contacts.

Player/target frames sit near the lower center, with the party above and to their left. Parties require invitation acceptance, allow up to five members, restrict invitations to the leader, expire invitations after 30 seconds, and dissolve singleton groups. Party state is intentionally absent from persistent character saves.

The map has expandable objective-type checkbox filters. Filtering preserves quest numbering; ready quests can be controlled separately. Hovering objective areas collects matching quests and pairs each title with its current objective/progress. Clustered pin clicks cycle those pinned quests, while clicking an area opens the zone map.

Rounded characters use smoother normals while structures and silhouettes keep their polygonal shapes. Humanoids have breathing, head movement, locomotion, casts and weapon swings; creatures have local idle, gait and attack poses, including guardian windups. Grass and tree crowns use low-amplitude vertex-shader wind rather than per-instance CPU matrix updates. A continuous stream ribbon uses shallow geometric waves and moving ripple highlights over a matching river bed.


## Equipment layout and progression

All 19 equipment positions are displayed from level 1, with a sparse weapon/chest starter loadout. Head, neck, shoulders, back, chest, shirt, tabard, wrists, hands, waist, legs, feet, paired rings, paired trinkets, main hand, off hand, and relic surround a full-body illustration. Empty future positions have explicit guidance, rather than arbitrary level gates. Quest rewards retain the existing weapon, chest, and charm progression. Tavi additionally sells a wooden buckler, cloth cap, reinforced trousers and leather boots so players can gradually fill more visible slots.

A shared slot registry defines labels, icons, placement, and compatible item types. Legacy IDs `weapon`, `armor`, and `charm` remain the canonical main-hand/chest/first-trinket keys to preserve saves and existing rewards. New saves include null entries for every empty position. Loading validates item compatibility and owned-copy counts; rejected equipped references retain their underlying inventory ownership. Ring and trinket types support either paired destination, with default empty-slot selection and explicit drag destinations. Stats sum bonuses across compatible equipped positions. Stored item counts subtract every equipped copy, and removing vitality gear clamps current health. Full bags still prevent unequipping.

Visible items declare an `appearance` recipe in `shared/content.js`: `model`, `style`, and `main`/`trim`/`detail` colors. `client/equipment.js` builds original smooth-shaded procedural models for swords, shields, hats, coats, trousers and boots. Swords differ in blade width, guard details, metals and regional trim; coats differ in cloth tailoring, bark panels and sentinel breastplates. For new content, reuse a supported recipe or add a factory returning named rig-socket parts. Jewelry and unsupported slots can remain without a recipe.

Named sockets on the existing character rig attach pieces to the head, torso, forearms/hands, thighs, shins and ankles. Equipment shares the avatar's local animation and predicted/interpolated root, with no separate network motion. Multi-part clothing bends with the legs and arms. Unequipping restores base clothing and hair; shields and weapons exist only when equipped. The controller changes attachments only when an item ID changes. Asset templates bake decorative primitives by material once and share geometry/materials across characters; removing avatars detaches cached assets before disposing private character geometry.

Authoritative snapshots add only the six modeled equipment-slot IDs to public player appearance. Other players never receive inventory or jewelry data. The local avatar uses its authoritative equipment too, so invalid transactions cannot produce cosmetic gear. Existing equipment saves need no migration, and resuming/reloading reconstructs the same attachments.


## Menu, bindings, and logout lifecycle

The game menu is a modal overlay reached from the top-right button or Escape after casting, game windows, and targeting have been cleared. It isolates gameplay input, releases held keys/camera capture, traps keyboard focus, and explicitly leaves world simulation running. Settings apply locally without server round trips. Sound uses a shared master gain; graphics quality controls pixel ratio and shadows, while environment-motion preferences freeze the foliage/water shader clock.

A shared browser preference model validates primary/secondary physical-key bindings for 26 actions, including all twelve action slots. Modifier chords are supported; conflicting assignments are removed from their previous action with a visible explanation. Reserved menu/browser shortcuts are rejected. Movement polls the same bindings used by discrete input, and bar/interaction/window labels follow rebinding. Shift-interact retains quick loot unless an explicit modified binding takes precedence. Defaults can always be restored from the menu.

Explicit logout detaches the player and party presence once, atomically persists the latest authoritative character snapshot, sends a success/failure acknowledgement, and closes the socket. Normal disconnection uses the same detachment path. The client clears prediction, casts, dynamic character entities, windows and transient UI while retaining the browser roster identity and preferences. It enables the character-screen Enter button after the socket closes, so an immediate resume does not race the previous character connection. Stale socket callbacks are ignored. Save failure and lost acknowledgements do not display a successful-save claim.


## Enterable architecture

The default for new inhabited buildings is an enterable floorplan, with any sealed decorative exception chosen deliberately. Prioritize comfortable third-person visibility over realistic proportions: current rooms use 5.8–6.2 metre walls and 4.4–4.6 metre clear door height, above the character’s jumping head height. Wide doorways, flush thresholds and clear central aisles connect directly to the shared outdoor zone.

The lodge, workshop, and Sera’s cottage are now furnished single-level rooms. Shared metadata owns each footprint, doorway orientation, wall segmentation, and solid furniture bounds. Player-circle collision against wall/furniture boxes runs identically in prediction and authoritative movement, including conservative corners and jumping. Door lintels sit above reachable character height, and the floor tops coincide with the shared terrain height rather than introducing a hidden step.

The renderer builds walls and props from these definitions, uses precise mesh bounds for camera occlusion, hides obstructing roofs, and smoothly fades camera-facing or obstructing wall/furniture groups. Fading is local presentation; it never removes physical collision or changes another player’s view. Nameplates respect opaque walls, while visible door openings remain readable. A shared warm fill light follows the occupied room, and interior detail is culled at distance. Room names update the location bar without repeating full outdoor-zone announcements. No instance transition is required, and characters can save/rejoin indoors.

Verification covers each entry/exit, wall and furniture solidity, corner clearance, jumping, 300 ms delayed prediction/reconciliation, real rendered camera orbits, two clients sharing a room, indoor logout/resume, roof restoration and compact desktop visibility.


## Character roster and browser identity

The connection screen manages up to twelve characters per browser identity. A random 256-bit bearer key lives in `emberwild-account` local storage; there is no username/password workflow. The same browser profile and server address share a roster across tabs. Creation offers four presets plus independent skin tone, hair color/style, facial hair, eye color, face shape and build controls and randomization; race and class identity are chosen from the four-class registry at creation. `shared/character.js` validates the seven appearance option IDs and derives defaults from older preset-only saves. Procedural face/hair geometry uses the existing rig; build scales width/depth without changing height or collision dimensions. Character names and levels appear in ordered rows, and selection renders the actual equipped model using the same humanoid builder, animation rig, equipment factories and appearance data as gameplay. Drag/zoom, rotation and face/full-body buttons inspect the preview without entering the world. Preview rendering stops during play.

Offline characters can be customized through `PATCH /api/characters/:id/appearance`, using roster ownership/revision and the same transaction queue as entry. Only `look` and normalized `appearance` change; progression, position and equipment remain intact. The editor hides headgear in the preview only, restoring the saved gear when editing ends. Saved and public player snapshots include the validated appearance options. Remote models rebuild if a returning character's appearance changes, preserving its current rendered position and rotation.

`server/characters.js` owns the version-2 atomic save document: private character records and browser-owned ordered rosters. HTTP endpoints create/resume an identity, list/create characters, reorder a complete roster, and delete a confirmed character. Revisions reject stale edits from another tab; failed writes retain the previous committed state. Socket entry checks ownership and reserves the character on the same queue as deletion, so an online character cannot be deleted or opened twice. Simulation snapshots are copied into persistence; delayed autosaves cannot resurrect a deleted record. API summaries expose name, level, appearance, equipped visible items and online status, without inventory or character access keys.

Deletion opens a modal naming the character and level and explaining the loss of progression/items. Keep character and Escape cancel; Delete permanently submits the confirmed name and current roster revision. Character creation, ordering and deletion acknowledge success only after atomic disk replacement. Existing single-character save files migrate into the new document, and a browser presenting its old character key imports that remembered character into a roster. Other old records remain intact. Automatic ten-second saves, disconnect and confirmed logout persist ordinary game progress. Returning to the character screen refreshes levels and gear before the next selection.


## Solid props, support surfaces and jumping

`shared/props.js` derives static collision volumes from building wall/furniture data and explicit outdoor prop definitions. Table, fence, gate/lantern, sanctuary step/column and supply-crate placement is shared with the renderer. Spatial buckets restrict nearby collision queries. Character collision uses a 0.3 m horizontal radius and 2.25 m body height. Furniture is solid at its sides and supports the feet at its top; bed headboards and separate crate stacks have their own heights. Fence rails use interpolated endpoint elevations, so standing follows their sloping beam rather than an oversized horizontal top.

`advanceMotion` now tracks absolute foot elevation (`y`), vertical velocity, grounding and the current support ID. Jump height remains a derived presentation value above the supporting surface. A grounded character can step up/down 0.26 m; larger drops start a fall, and a larger upward edge requires jumping. Jumps retain the existing 7.5 m/s launch and 20 m/s² gravity. Fixed substeps, body clearance and descending surface tests prevent walking through tall sides, air-stepping onto a tabletop, restarting a jump in midair or passing through a lintel/ceiling. Contact with a top surface restores grounded movement and allows a new jump or stationary cast.

Authoritative snapshots and remote interpolation carry absolute elevation as well as grounding. Local reconciliation smooths world-space vertical error, retaining immediate predicted jumps. Animation samples the support surface for feet and keeps an unsupported edge foot from dragging the torso through a tabletop. The camera and target ring follow elevation. Save/load settles a character onto the valid surface below their saved feet; midair logout settles rather than floating. Death retains a supporting surface and respawn resets to the hearth. Quest supply crates stay visible after collection to avoid invisible physical obstacles. Small surface decorations remain cosmetic.


## Global cooldown

The four class abilities share `GLOBAL_COOLDOWN` (1.5 seconds). After validating level, energy, individual cooldown, target/range and cast movement restrictions, the server starts the shared window at ability start. Cast time overlaps it and completion only starts the spell’s individual cooldown. Interrupting an unfinished cast through movement, jumping or cancellation releases that cast's global cooldown; failed completion validation also releases it. Request ID and start-time matching prevent cancellation from clearing an instant ability's or newer cast's lock. Invalid attempts consume no global cooldown. Autoattack, movement, targeting and tonics continue on their existing rules/timers. Death, respawn and a new session clear transient shared timing.

All skill attempts use one monotonic request sequence. Snapshots carry the last processed request and the accepted global-cooldown request/start/end. `GlobalCooldownPresentation` starts a local sweep immediately, ignores snapshots older than a pending attempt, aligns to accepted server timing, and removes rejected predictions. Local cancellation clears the matching sweep immediately and suppresses late acknowledgements for the cancelled request, while allowing a new ability to start. Cast presentation uses the same request IDs. The action bar updates from the synchronized clock each frame, showing the longest applicable lock: the shared sweep or the individual skill cooldown. Short global sweeps omit numeric countdown clutter; longer individual timers keep their countdown. Shared timing is session state and is not part of a character save.

## Authored world atlas

The large map uses a data-defined world/region/zone hierarchy and a cached canvas cartography layer, independent of terrain geometry. All levels use parchment grain/folds, translucent land washes, inked vegetation/ridges/settlements, curved paths and original lettering/compass art. A survey polygon leaves unfinished land as undrawn parchment, with explicit uncharted notes rather than invented playable areas. This is content availability, not personal discovery state.

Right-click goes to the parent, left-click enters a charted child's polygon, and root/leaf/uncharted clicks stop safely. Breadcrumbs, region links, back and Find me provide alternative navigation. The chart also supports keyboard navigation and resizes to keep controls visible. Minimap projection, zoom and click behavior remain independent. Live player positions compose zone-to-parent transforms; local quest areas, service/resource markers and numbered objectives retain their existing filters. Stable IDs, parent placement and shared drawing primitives allow new maps without changing navigation or introducing another art style. See [WORLD_ATLAS.md](WORLD_ATLAS.md) for the registry schema and expansion workflow; adding playable zone simulation remains separate from adding its chart.

## Willowcross and the five roads

The playable region now includes four classes, five playable races, 60 NPCs and 80 authored quests, with 74 applicable per class. The original Hearthstead campaign leads to Willowcross after its farewell. The hub introduces the four racial delegations; every player can complete every delegation’s introductory chain and boss site. [Cinderwood expansion](CINDERWOOD_EXPANSION.md) describes the traditions, six-skill class structure and reusable layout vocabulary. The level-100 rarity policy remains unchanged: this entire expanded starter region awards white/green equipment.

`shared/adventurers.js` owns extensible race/class/skill registries. `shared/expansion-content.js` owns southern quests, NPCs, foes and class rewards. `shared/world-layouts.js` places multi-room plans and props; rendering and authoritative collision consume the same placements. Boss telegraphs use server-authored ground coordinates, including target-location attacks in the later sites.

## Storage progression and bank services

`BAG_PROGRESSION` in `shared/progression.js` defines bag sizes from 6 at level 1 to 28 at level 100. Level requirements are enforced by both merchant purchases and bag equipment commands. Only 6/8-slot bags are in starter stock; the 12-slot Ranger’s pack is reserved for level 25. Existing equipped larger bags remain equipped on load so a progression change cannot remove capacity or items. If removed, they follow the new level requirement before re-equipping. Four bag positions and the 20-slot backpack support 52 newly obtainable starter slots and a planned maximum of 132 at endgame. Later regions must author acquisition sources/prices before offering future bags.

The bag window defaults to independently headed bag grids. The **Combine bags into one** checkbox turns all carried storage into one virtual grid, while underlying slot indices, equipped-bag ownership and item arrangement remain intact. Individual bag-button clicks select their own container when separate, and the whole virtual bag when combined. `emberwild-combine-bags` stores the browser preference; it does not change server storage or create extra slots.

Bank contents are a per-character `bank` item/count dictionary, persisted alongside carried inventory by normal autosave/logout. `shared/storage.js` defines 28 base bank slots and atomic transfers, respecting 99-item stacks, single-slot gear/bags, ownership and destination capacity. Quest items stay carried; equipped copies cannot be deposited. Bank contents do not grant carried equipment stats or count as usable tonics. Empty legacy saves initialize an empty bank.

To place a bank in a future major town, add a shared NPC with `role:'banker'` or `services:['bank']`. No banker or bank menu shortcut is placed in current content. Interaction opens the existing bank window; client/server use `{type:'bank',action:'open',npcId}`, followed by `deposit`/`withdraw` with item ID and count (1–99), or `close`. The server checks a living banker within five paces for each action. Walking away, death and logout end access; the bank itself remains saved. Only the owner receives the bank view while visiting. Peer player snapshots and roster summaries never include bank contents.

The future bank UI opens beside the carried bags, supports right-click for one item, Shift-right-click for the displayed stack, and dragging stacks between storage windows. A banker exists only in the isolated browser-test process to verify this path without adding a placeholder service to the live zone.

Storage validation: **121 automated tests pass**, including full campaign/network regressions and the bank transfer/persistence rules. `npm run test:storage` verifies separate/combined grids, saved view and item order, single/stack/drag transfers, quest-item rejection, distance closure and bank contents after a real server restart in headed Firefox, with no browser errors.

## Terrain-conforming area effects

`client/ground-area.js` supplies all boss warning disks, expanding combat/heal/ward/level rings and the starter quest ring. Its geometry matches the terrain renderer’s grid and triangle diagonals, offset 0.055 m above the surface. Matching full triangles keeps face interiors above the actual rendered ground; sampling only a disk center or the perimeter of a triangle fan would still bury portions of the effect on curved slopes. Extra top surfaces follow shared walkable prop profiles, including the Hollow Warden’s altar, tables and steps. Depth testing remains enabled, so walls and solid objects naturally occlude markers.

A radial shader clips the patch to the server-authored center/radius and draws a clearer warning rim. Expanding rings animate shader radius/opacity, keeping their world-space heights fixed instead of scaling a flat mesh through the ground. Geometry is rebuilt only when a marker moves or outgrows its existing coverage. Combat timing, range and damage rules are unchanged.

Validation: four `tests/ground-area.test.js` cases cover triangle-interior clearance against the rendered height grid, the original Hollow Warden intersection, altar/furniture/step tops and expanding/moving geometry. `npm run test:ground-areas` verifies real Warden and targeted Kilnkeeper warnings in Firefox, healing-ring shader rendering, six terrain/camera views, animated rings and wall occlusion with no browser/shader errors. In the isolated Warden gallery, visible warning pixels increased from 17,686 to 32,083 overhead and 4,311 to 8,344 at an angle. This measures coverage in those test views, not combat radius or performance.

## Overhead target readability

World-anchored selected names use 15 px bold text and 126 × 12 px health bars; ordinary enemy bars use 80 × 7 px. Selected friendly players/NPCs show the same enlarged bar in green. Only selected overhead bars include current/maximum health text. The fixed player/target/party HUD retains its layout.

`client/nameplate-health.js` places ticks at absolute 100-HP intervals, with a stronger tick every 500 HP. Future large health pools choose larger 1/2/5 intervals and cap tick density at twenty divisions. Tick positions use maximum health and stay fixed when current health falls, making different enemy health pools distinguishable rather than giving every bar the same percentage divisions. Overhead meters also expose current, maximum and tick unit to accessibility tools.

The extended `npm run test:nameplates` browser check verifies selected/ordinary dimensions, friendly selection, absolute tick values and spacing, damage updates and fixed HUD sizing. It samples NPC/player/enemy anchors during orbit, zoom, resize, walking and jumping: 507 moving samples had a maximum drift of 0.012 px, with no browser errors.

## Unique NPC quest entries

NPC dialogue uses `dialogueQuests` in `shared/content.js`: enumerate the quest registry once and place each quest into one mutually exclusive category (ready turn-ins, available offers, or ongoing work), then apply the class-specific quest view. Merging independent offer/active lists previously let the same ready quest appear twice when class-specific copies were compared by object identity. Completed quests disappear from the contact list after turn-in; follow-ups can appear without duplicating ongoing entries.

Five quest-dialogue regression tests reproduce the old Orin Vale and Ilan Wren duplication, check mixed quest states, four-class views, completed/locked/unrelated contacts and one-time rewards. `npm run test:quest-dialogue` verifies both NPCs in the actual browser, repeated reopening, turn-in removal, follow-up acceptance, reward counts and persistence after reload, with no browser errors. Already-open clients need a full page refresh to load changed JavaScript; reconnecting the socket alone retains the old client code.

## Desktop movement and mouse bindings

Default movement retains W/S and the up/down arrows for forward/backward, A/D and left/right arrows for strafing, and Space for jumping. Q/E turn left/right at 2.4 radians per second. R and Mouse Back toggle autorun; forward/backward input takes over and clears the toggle. Holding both primary mouse buttons moves forward only while both are held, in either press/release order. A mouse movement chord consumes both clicks, so releasing it cannot select a character, loot, or enable autoattack.

`client/controls.js` keeps body heading separate from camera orbit. Left-drag free look preserves the body/travel heading, including during autorun. Right-button look steers body heading to the view direction; Q/E normally carry the camera with the body, while left-button free look can keep the view independent. The local hint shows when autorun is active. Menu/chat entry, blur/hidden document, disconnect, death/teleport and logout clear continuous movement. Cursor capture is released on cancellation; normal left clicks select and normal right clicks retain targeting/attack/interaction behavior.

All actions have two optional bindings. Settings accept keyboard keys plus middle/Back/Forward mouse buttons, with Ctrl/Alt/Shift chords. Primary left/right mouse buttons remain reserved for world interaction and camera controls. The keybinding editor captures mouse buttons as well as keys; auxiliary defaults are suppressed during play to avoid browser navigation. New action defaults fill only unclaimed keys, preserving existing custom R/Q/E assignments. Settings remain browser-owned, while autorun itself is transient and never resumes automatically on login.

Facing is an optional finite, angle-normalized field in the existing sequenced movement commands. Prediction and authority use it without granting extra displacement or bypassing collision. This supports stationary turns, backwards movement and strafing independently of body facing, replicates facing to peers and preserves it through reconciliation. Older movement commands still derive facing from velocity. Facing-only commands do not interrupt casts; actual movement and jumping retain the existing interruption rules.

Validation: **139 automated tests pass**, including mouse/keyboard preferences and migration, autorun/free-look/chord state, validated stationary orientation, casts while turning and delayed facing reconciliation. The controls browser check verifies R, stop inputs, side-button event cancellation, left free look, right steering, Q/E, both chord orders without click side effects, mouse capture in both binding slots, reload persistence and cleanup on menu/focus/logout. OS side buttons are exercised with browser pointer/mouse events; left/right chords use actual Playwright mouse presses.

The existing menu, atlas and full gameplay browser regressions also pass with the new controls. Atlas camera-independence checks now use left-drag free look, while right-drag steering intentionally changes body facing. The live server was saved, backed up as `data/backups/characters-before-desktop-controls-20261104T165738Z.json`, restarted for facing-command support, and verified reachable with all five saved profiles preserved.
