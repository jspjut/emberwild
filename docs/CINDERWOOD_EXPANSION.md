# Cinderwood: four classes and the five-road frontier

Original expansion baseline: a playable shared level **1–11** starter region, retaining the original Hearthstead campaign and continuing south to Willowcross. The long-term cap remains 100 and the entire expanded starter region still caps its rewards at common/uncommon.

The current map refinement supersedes the compact layout and reward totals below: see [STARTER_REGION_REFINEMENT.md](STARTER_REGION_REFINEMENT.md) for the level-1–10 region, six outlying hubs and return waypoints.

## Playable identities

| Class | Preferred / maximum armor | Core play |
| --- | --- | --- |
| Dawnwarden | Plate | Melee blade attacks, self recovery and a personal absorb ward |
| Arcanist | Cloth | Ranged casting, frost slow, targeted starfall and arc chains |
| Pathfinder | Leather | Bow attacks, self bandaging, volleys, snare and aimed shots |
| Stormcaller | Mail | Healer: ally recovery, party healing, player shields and two solo lightning attacks |

Each class has six skills unlocked at 1, 1, 2, 4, 7 and 9. Registry IDs and skill ownership leave room for more classes. Humans can train all four; Sylvren and Brinefolk train Arcanist/Pathfinder/Stormcaller; Cairnkin train Dawnwarden/Arcanist/Stormcaller; Emberkin train Dawnwarden/Arcanist/Pathfinder. These are the current expedition's training traditions, not immutable biological restrictions. Existing saves default to Human Dawnwarden and retain their inventory, appearance and progress.

See [CLASS_DESIGN.md](CLASS_DESIGN.md) for the current independent kits, support targeting and save compatibility.

## Region and introductory lore

Willowcross is a shared market, inn, council hall and training hub. The human speaker Mara introduces the idea that the town's road belongs to hosts and visitors together. Liri's Rootsong Embassy introduces Sylvren memory-groves; Dorr's Stonepromise Lodge introduces Cairnkin records and vows; Nemi's Tideglass Station introduces Brinefolk rescue traditions; Ves's Ashen Hearth introduces Emberkin rebuilding and memory tokens. These short introductions establish working relationships while reserving broader history and disagreements for future lore.

Each delegation offers introduction, keepsake recovery, local trouble, shelter discovery, boss and return-to-town quests. Players can follow all five chains regardless of their own race/class. The current social redesign introduces them sequentially through return breadcrumbs, with the inn/market/survey tour first. See [social play and starter pacing](SOCIAL_AND_STARTER_PACING.md) for the updated northern route, emote rewards and reputation rules. The shared conclusion renews the town's promise after all five stories. Two additional class quests practice the level-7 and level-9 skills. Inn conversation binds a safe return point; travel does not require repeatedly running from the old camp after death.

## Reusable layout vocabulary

`shared/world-layouts.js` defines grounded placement data and explicit openings. Hut and hall plans support outposts/town buildings. Storehouse, dogleg-gallery and three-chamber-shrine plans support compact boss sites. Placed rooms share doors and level floors, use the same collision/support geometry as rendering, and have tall interiors with local ceiling/wall cutaways. Sites are traversed directly rather than teleported into a combat arena. Future content can reuse a plan with another placement, material/race theme, furniture and encounter.

Boss sites: The Locked Storehouse (human), Rootmemory Hollow (Sylvren), The Resonant Vault (Cairnkin), Tideglass Grotto (Brinefolk), and The Quiet Kiln (Emberkin). Bosses announce ground attacks; the later two mark the target's location rather than only their own feet. Their rewards are green regional gear, not the epic/legendary concepts in the asset workshop.

## Validation completed · 4 November 2026

- [x] Full class/race creation, persistence and ownership validation.
- [x] Four complete campaign simulations through the expanded quest chains.
- [x] Shared doorway/room traversal, cave line of sight and boss telegraphs.
- [x] Actual browser checks for class bars, race models, hub/outpost entry and map guidance.
- [x] Updated authored atlas, leveling/itemization plan and regression tests.
- [x] Live server backup/restart and saved-character verification.


`npm run test:emberwild`: the original expansion validation had **113 passing tests**; see the social guide for the newer coverage, including all sixteen supported race/class combinations, foreign-skill/armor rejection, original campaign regression, four full 65-quest campaign runs, multi-room doorway traversal and line of sight, road centerline collision clearance, safe hearth binding, local trade and gentle southern grades. Each full campaign reaches level 11 at 15,179 XP with real combat and loot; the bot relocates between objectives. These runs verify rules/progression, not human travel duration or pacing.

`npm run test:expansion`: headed Firefox with software GL checks all four class action bars and spellbooks, all five race previews/models, valid and disabled creation combinations, cast bars/healing, walking inside the new rooms, authored atlas, targeted boss marks and actual spell damage, logout and persisted movement. No browser or shader errors. The original browser regression also passes quest acceptance/turn-in, bags and equipment, draggable windows, loot, combat, gathering, jumping, two-client chat and resume.

Terrain is split into cullable tiles with continuous vertex normals. The expanded test views render roughly 279–297k triangles versus 675–693k before tiling. This is a geometry reduction, not a hardware FPS promise or large-scale MMO performance measurement. New outpost foundations blend over broad slopes; sampled southern grades stay below 0.6.

The live service was gracefully saved, backed up under `data/backups/characters-before-four-classes-20261104T153920Z.json`, and restarted. Its five existing characters and one roster were retained. All five saved profiles load at levels 3, 3, 1, 2 and 6, defaulted to Human Dawnwarden. The existing browser roster contains the level-6 character; four legacy profiles remain intact. Live API verification confirms that roster and its identity. Existing characters continue after **Tomorrow has a road**: Tavi offers **Where five roads meet** and sends them south to Tamsin. Create another character to try a different race/class; identity is fixed after creation while appearance remains editable.

Remaining playtest work: human leveling pace, route readability and individual class/boss tuning. Lore here is an introduction and training tradition, leaving room for future classes, cultural differences and later regions. The level cap of 11 applies to this prototype; the planned wider cap remains 100.
