# Itemization and leveling plan

This is the working progression plan for Emberwild. The intended eventual level cap is **100**. The playable prototype now covers **levels 1–10**. Hearthstead’s original XP thresholds remain intact; Willowcross and the delegation chains extend the curve. Future bands below are authoring targets, not implemented zones, extra XP thresholds, or promises about release scope.

## Agreed direction and proposed milestones

The starter zone should take a character from **common (white)** equipment toward a few **uncommon (green)** upgrades. **Rare (blue), epic (purple), legendary (orange), and unique (gold)** belong later in the game. Existing high-rarity workshop assets are designs for that later content, not starter-zone loot.

The level-100 direction, starter ceiling and six rarity/color names reflect the current design decision. The specific introduction levels, timing ranges and acquisition mix below are **proposals to tune through playtesting**. Change the shared policy and this document together when those targets change.

## Rarity vocabulary

| Rarity | Color | First proposed level | Intended role |
| --- | --- | --- | --- |
| Common | White | 1 | Starter gear, ordinary crafted/vendor equipment and practical utility items. Common items can still be upgrades over older common items. |
| Uncommon | Green | 3 | First meaningful quest-chain upgrades; the main regional leveling tier after the starter zone. |
| Rare | Blue | 25 | Occasional dungeon, elite, long-chain and noteworthy crafted rewards; becomes more accessible later. |
| Epic | Purple | 60, very limited | Exceptional later-level milestones. Primarily a high-level and endgame reward, not routine quest loot at 60. |
| Legendary | Orange | 100 | Aspirational endgame signature items with substantial quests, crafting or boss progression. |
| Unique | Gold | 100 | Bespoke endgame artifacts or exceptional story rewards with a distinctive identity. Reserve room for them; no items need to be populated yet. |

Quality describes an item's intended acquisition and design tier. It does **not** multiply stats automatically: item level, required character level, stat budget, slot, class suitability and special effects need separate tuning. A well-budgeted higher-level green can replace an older blue. Vendor value and rarity are independently authored.

“Unique” here names the gold quality tier. It does not automatically mean one copy in the world, an account ownership cap, or a “unique-equipped” restriction. Those rules, if needed, must be separate explicit item properties. Gold artifacts should not be an obligatory power jump over orange weapons or a requirement for ordinary endgame participation.

## Leveling and reward bands

| Levels | Ordinary equipment | Noteworthy rewards / ceiling | Provisional active time per level |
| --- | --- | --- | --- |
| 1–10 · First steps | White starter/vendor/early quest gear | First greens around 3–6; regional quest chains add green weapons, chest and delegation pieces through 10. **No blue or higher**, including the zone boss. | 15–25 minutes; roughly 2.5–4.5 hours for the expanded starter experience, allowing quest reading and exploration. |
| 11–24 · Regional adventurer | Greens become normal quest-chain/crafted upgrades | Regional bosses still reward greens. Vary stats and appearance rather than spending another rarity tier. | 15–30 minutes |
| 25–49 · Journeyman | Mostly greens, with some long-lived blues | First blues from deliberate group/elite content, long chains or notable crafting. No routine complete blue outfit on arrival. | 30–50 minutes |
| 50–69 · Veteran | Greens and blues; blues become more reliable | Until 59, ceiling remains blue. At 60+, a small number of purple capstone rewards may appear. | 45–70 minutes |
| 70–89 · Regional champion | Good blues remain relevant | Occasional purple group/chapter rewards. Ordinary quests do not replace a whole outfit with epics. | 60–90 minutes |
| 90–99 · Approaching the cap | Blues with selected purple upgrades | Late group content prepares a character for endgame. Legendary and unique remain reserved for 100. | 90–120 minutes |
| 100 · Endgame | Entry progression mixes blues and purples | Sustained purple progression; orange and gold are exceptional long-term goals. | No further leveling band; progression comes from encounters, builds, professions, exploration and stories. |

These time ranges are an initial discussion target for a first character, roughly a **70–110 hour active-play journey** if retained. They are not a measured result of the prototype. Travel, story reading, grouping and learning count as play; queue/respawn waiting, repeated corpse runs and forced grinding should not be used to manufacture that duration. Alt and catch-up pacing can be designed separately. Do not generate levels 12–100's XP curve from these estimates before playable content and telemetry support it.

Every zone should offer enough varied optional/parallel quests that players can progress without exhausting a single narrow chain. Preserve time for exploration, class practice and recovery. A level milestone need not also grant a new rarity, a new slot, a new ability and a large stat leap all at once.

## Current starter-zone pass

The refined prototype has 80 authored quests (74 applicable to each class), including 28 northern introductory quests. The full real-combat campaign reaches level 10 at 9,972–10,026 XP (level 10 begins at 9,800). It preserves the level 1–6 thresholds, item IDs, bag capacities, prices and existing character progress. The expanded geography and detailed pacing budget are documented in [STARTER_REGION_REFINEMENT.md](STARTER_REGION_REFINEMENT.md).

| Item | Rarity after this pass | Placement / reason |
| --- | --- | --- |
| Wayfarer’s blade, Travel-worn coat | Common | Starting equipment. |
| Hearthguard blade | Common | Early crafted quest upgrade; +4 power remains worthwhile without being green. |
| Trailkeeper’s satchel | Common | Early quality-of-life supply reward and merchant bag. |
| Trailkeeper’s charm | Common | Early utility/stat reward; trinket slot use in the prototype does not establish the final jewelry unlock schedule. |
| Barkweave mantle | Uncommon | First substantial armor upgrade in the level-3 grove branch. |
| Dawnforged edge | Uncommon | Later starter-zone weapon upgrade, with simpler metalwork instead of the former magical-glow presentation. |
| Sentinel’s vestment | Uncommon | Starter boss/zone-completion armor reward. A named boss does not automatically imply a blue or purple reward. |
| Ranger’s field pack | Uncommon | A later-region upgrade: 12 slots at level 25. Removed from starter vendors. |
| Other starter shop gear, resources and quest items | Common | Practical starter items rather than later-game quality signals. |

Target exit state: green weapon/chest and selected delegation pieces, 6/8-slot common bags, with several utility positions still common or empty. Completing every optional chain grants more green pieces than the original level-6 exit. No guaranteed complete green outfit is needed. Preserve reward identity through appearance, narrative and sensible stat increments rather than adding quality tiers. Existing saves pick up the new definitions without a wipe.

## Workshop assets and future loot

`shared/equipment-collection.js` gives tiered designs explicit **planned level ranges**:

- Wayfarer Weave and Trailhide green field sets: 7–24.
- Rivetguard blue field set: 25–49; Bastion blue field set: 35–59.
- Purple boss sets and signature purple weapons: 90–100.
- Blue special weapons: 35–59.
- Orange Dawnward Oathblade and Eclipse Edge: 100.
- Gold unique: schema, theme and authoring space reserved; no catalog item is required now.

Hollowguard's source is an **endgame Elder Hollow Warden concept**, distinct from the current starter Hollow Warden. The starter encounter still caps at green. Untiered equipment studies have no assigned gameplay rarity or level range. A visually ornate model can be repurposed later; its existence in the workshop never grants a starter reward or establishes a drop rate.

Before promoting any design to a real item, assign its zone/source, required level, item level/stat budget, class preference/restriction, rarity, special effects, economic value and acquisition frequency. State whether a reward is guaranteed, a deterministic token/craft path, or an optional random drop. Avoid extremely rare mandatory build items with no alternate path.

## Endgame guardrails

At 100, let normal/introductory group play establish a usable blue/purple baseline, then let harder dungeons, bosses, professions and longer stories progress an epic outfit. Keep multiple routes for different play styles. Legendary and unique acquisition should provide long-lived goals, not fill every slot by default, erase all previous rewards, or gate ordinary participation.

Reward visual budgets should grow gradually: functional silhouettes first, restrained regional details next, and signature collars/crests/runes/glow reserved for later exceptional designs. Do not make a level-5 reward look identical in prestige to a level-100 signature item. Class-restricted set pieces and slot unlocks should follow their own documented progression rather than being inferred from rarity colors.

## Tracking and validation

`shared/progression.js` is the machine-readable vocabulary: planned/live caps, all six colors, earliest proposed introduction levels and leveling bands. `rarityFitsPlannedLevel` validates an authoring target; it does not grant equipment, create future levels or impose an unimplemented character-level gate. Live and workshop rarity colors use the same registry. Workshop exports/manifest retain planned ranges and rarity intent.

Before adding a zone or changing rewards, record:

| Decision / measurement | Starter baseline | Future review |
| --- | --- | --- |
| Entry / exit levels and active time | 1 → 11; timing target above, actual first-player median still to measure | Measure median and slow-player range, including reading/travel. |
| First green / blue / purple earned | Green in the grove/capstone portion; no live blue or higher | Check actual acquisition level against this plan. |
| Exit outfit distribution | Mixed white/green | Count slots by rarity, not just total items received. |
| Upgrade frequency and size | Core starter upgrades retain current stats | Track time between meaningful upgrades, replacement rate and survival/damage changes. |
| Acquisition routes / RNG | Quest and merchant routes | Record guarantees, crafting/token alternatives, duplicate protection and missing-slot streaks. |
| Wallet and storage | Starter bags are 6/8 slots; larger sizes advance through the planned levels | Watch repair/consumable/travel burdens and storage pressure. |
| Newly populated slots | Prototype is ahead of the eventual jewelry schedule | Decide shoulders/head/jewelry/trinket unlock timing before expanding live rewards. |

Automated checks cover the starter reward/shop/enemy/resource acquisition graph, price/stat preservation, the active level-10 cap, all planned rarity boundaries, catalog level-range validity and all six theme colors. The campaign tests verify the original level 1–6 prefix and all four classes through the expanded level 1–10 campaign. A bot completion test is not a pacing measurement; human playtests must supply the timing/distribution data above.

## Implemented southern progression

Willowcross introductions and five six-quest delegation chains carry the original story into levels 7–10. Two class-specific quests practice the level-7 utility and level-9 advanced skill. Armor ceilings are cloth for Arcanist, leather for Pathfinder, mail for Stormcaller and plate for Dawnwarden; higher armor training permits lower types. Signature practice/quest weapons are class restricted. Every playable reward remains white or green.

All four simulated full campaigns finish at level 10 (9,972 XP for three classes; 10,026 XP for Pathfinder in the current campaign checks), without repeated grinding. The simulations use real combat but relocate between objectives: travel duration and real player pacing remain playtest measurements.

## Bag progression and personal banks

The backpack stays at 20 slots with four additional bag positions. Storage upgrades progress separately from combat rarity; a bigger bag need not spend another rarity tier. `BAG_PROGRESSION` is the shared registry used for item requirements.

| Bag size | Earliest level | Current availability |
| --- | --- | --- |
| 6 | 1 | Starter provisioners; 6 copper |
| 8 | 3 | Starter provisioners; 18 copper; supply recovery quest reward |
| 10 | 15 | Future region/source |
| 12 | 25 | Ranger’s field pack; future source, no starter stock |
| 14 | 35 | Future region/source |
| 16 | 45 | Future region/source |
| 18 | 55 | Future region/source |
| 20 | 65 | Future region/source |
| 22 | 75 | Future region/source |
| 24 | 85 | Future region/source |
| 26 | 95 | Late leveling source |
| 28 | 100 | Endgame source |

New starter characters can reach 52 carried slots with four 8-slot bags; the planned endgame maximum is 132 with four 28-slot bags. A quest may award an 8-slot bag before level 3, but equipping it requires level 3. Later bag items are defined but have no live acquisition source or implemented level progression beyond 11. Their specific drops, crafting recipes and future prices remain to be authored. Existing equipped larger bags keep their capacity and contents; removing one requires meeting its new level requirement before re-equipping it.

Each character also has persistent personal bank storage with 28 base slots. Bank access requires visiting a banker in a future major town; no current settlement or menu offers access. Bank storage complements carried bags rather than replacing their gradual upgrades. Bank bags, purchased bank expansions and account-wide storage are future design space. The current implementation supports ordinary item/stack deposits and withdrawals, protects equipped and quest items, rejects full-destination transfers atomically, and closes access on departure or death.


## Ground collection and transaction controls (4 November 2026)

World resource nodes and active quest objects use a one-second gathering cast, predicted locally with the existing progress bar and confirmed by the server. Rewards, personal node cooldowns and quest credit begin only on successful completion. Moving, jumping, Escape or a hit interrupts gathering. Completion rechecks range, visibility, quest eligibility and available bag space. The object's own collision does not block interaction; other walls still do. Gathering neither spends nor clears a combat global cooldown. Available quest objects and harvestable nodes show a hand cursor on hover; unavailable objects do not.

Shop goods accept right-click to buy one; backpack items accept right-click to sell one, or Shift-right-click to sell their stack. Buy/sell cursors and contextual tooltip instructions identify the action and prices. The existing future bank UI uses corresponding deposit/withdraw cursors, right-click instructions and stack transfers. Equipped gear, equipped bags and quest items retain their existing storage restrictions. Opening a shop closes a bank window to avoid conflicting bag actions. No banker has been added to the starter zone.

Validation: **199/199 automated tests passed**, including interrupted/early/duplicate pickups, completion-time validation, saved node cooldown expiry and unchanged class campaign XP totals. `npm run test:ground-trade` passed real browser pickup timing, hand cursors, Escape/movement interruption, right-click buying/selling, cursor assets/tooltips and bank deposits/withdrawals. Its banker is an isolated test fixture. Artifacts are under `test-results/ground-*`, `shop-right-click-cursors.png` and `bank-transfer-cursors.png`. The live server was gracefully saved and restarted as a detached process; all eight profiles and two rosters were retained. Backup: `data/backups/characters-before-ground-pickups-and-trade-20261104T212458Z.json`.
