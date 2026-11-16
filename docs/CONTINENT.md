# The Emberwild continent

This static geography pass contains **37 leveling zones including Cinderwood, five capitals including Alderhaven, and ten level-100 frontiers**. All 52 maps are named, allocated, charted and reachable on foot in one coordinate space. The original 60 NPCs, 80 quests and 78 creature spawns remain. No new quest or NPC population has been placed. The playable cap remains 10; later level labels describe intended future content, not a completed leveling campaign.

## Connected geography

Cinderwood (1–10) leads into Alderhaven. Four roads leave the eastern gate. Every subsequent ten-level band has lateral crossings connecting all four alternatives, so characters can change routes between bands. Capitals have their own approaches, and frontier roads join into an outer circuit. The Dawnlands wrap north, south and west around the founding settlements: Alderhaven sits at the center of the early fan, with Cinderwood immediately to its west. The continent spans roughly 17 km east-to-west and 26 km north-to-south with an authored polygon coastline shared by terrain, movement and the atlas. Each shared province edge now carries a physical divide: rocky ridges, ice escarpments, root berms, capital walls, highland crevasses or sea channels. Mountain divides remain the majority. The upper Crownspine uses deep cuts, while later Saltwind zones form a bridged island chain. Broad terrain shoulders support natural divides, and the actual road network cuts clear passes through them. Coastal edges meet the sea. Roads retain gentle surveyed grades and buildings/objectives retain clear ground pads.

Every later leveling/frontier zone has **6–10 built quest hubs and 2–4 inns**, for 369 hubs and 139 inns across those 46 zones. Each hub has four enterable buildings, a clear public square, connected approach/door paths and a named objective clearing 160–270 metres away. The 369 added objective clearings supplement each zone's original signature landscape, grounds and ruins. Names, palettes, roof forms and landscape motifs follow the zone identity. These remain static places, without new NPCs, mobs, quest definitions or rewards.

`shared/continent-settlements.js` exports `QUEST_HUBS`, `HUB_OBJECTIVES`, `WORLD_SITES` and `HUB_ROADS`. IDs are stable source identifiers; positions are resolved against the current province polygons, coastal clearance, existing sites and road vertices. Author later live content using the coordinates from the installed version, not coordinates copied from an older world baseline. All placements are deterministic.

Each new capital has six wards, 33 enterable ground-floor buildings, three inns, civic architecture and open gate lodges. Their sites and weighted province boundaries reserve room for the whole city, rather than assigning outer wards to a neighboring zone. Their roof/material vocabulary differs: living-bough crowns, broad stone roofs, shell domes and kiln vaults. Interiors remain prototype rooms with some simple workshop furniture; upper floors, populations, vendors and quests remain future content. Existing Alderhaven architecture, conversations, banking and hearths are preserved. No capital has racial access restrictions.

## Zone maps and boundaries

Local charts show the **entire owned province**, including the countryside between hubs; the former fixed 1,060/1,400-metre chart windows no longer crop zones to their centers. The early fan and four later capital sites have been repositioned to make room for settlements. Existing Cinderwood and Alderhaven buildings, NPCs and quests retain their coordinates. Cinderwood and all five cities use the same chart frame, ground washes and concise labels. Alderhaven's chart includes the eastern river crossing and the four outgoing paths to Hazelwash, Redgranite, Ochretrail and Saltmeadow. Regional maps retain roads across regional borders.

The physical border, terrain shoulder, atlas boundary and minimap line derive from the same province geometry. Ridges and root divides have continuous solid cores; channels and crevasses have excavated terrain and cannot be crossed away from their road bridges; city walls use the same authoritative collision system. Road corridors remain open, with pass symbols on local charts. Bridge decks, rails and piers follow the graded crossing; terrain is drawn below the deck. Root canopies and wall merlons are decorative. The Reach keeps its established ridgelines and gains an eastern rock divide beside the approach to Alderhaven; Alderhaven keeps its existing gates, wall and river.

When authoring new borders, edit the hub/coast/survey geometry and inspect both sides of each pass. Keep roads, entrances and future-content pads clear. Run the road and boundary tests after any change. These are static terrain changes and require a server restart, with a save backup and live-journal baseline check as described below.

## Flight stones, inns and portals

The network has **208 stops**: the 52 main zone/capital stones plus 156 paired inn stops. Each inn has a nearby stone; the central zone stone provides an additional stop. Every new zone has 3–5 stops in total. Flight discovery and return-hearth binding are separate actions.

The new unpopulated inns have self-service hearths and nearby mailboxes. Stand within 4.8 metres of the hearth marker and open **Travel → Set my return waypoint here**. Hearthward Return keeps its existing cast, combat restrictions and 15-minute cooldown. Existing hosted inns continue to bind through their innkeepers. Cinderwood now has return points at both Wayfarer's Lodge and the Crossroads Hearth. The four newer capitals each have three inns; Alderhaven retains its three hosted inns.

Local atlas maps and the minimap distinguish **inn/return hearth**, **flight stone** and **capital city**. Paired inn/flight icons sit side by side; a legend explains the atlas symbols. World and regional charts prominently mark the five capitals. These identify civic/service hubs; no new friendly NPCs or service vendors are implied.

Approach within 12 metres of a travel stone on the ground to discover it. Discoveries belong to the character and persist in saves. Open **Travel** and stand within 14 metres of a stone to depart. Clicking a flight or capital badge in the atlas also opens this planner. Travel opens a spatial world map: select a stone to highlight its actual flight path, distance and estimated duration, then press **Fly**. Pan by dragging; zoom with the wheel or +/− controls; **World** resets the view and **Fit route** frames the selected journey. Search highlights named cities, zones and inn stops on the map. Hollow markers and dashed links show undiscovered parts of the network. Capitals use diamonds, and **Portal · instant** remains a separate option. These self-service objects need no NPC population.

Flights follow a connected chain of discovered stones through the world on a skyway skiff, rising above terrain. Passing another stone in flight does not unlock it. Capital portals require both capital stones to have been discovered. Neither mode works during combat, while dead, during a cast or during another journey. Existing hearth binding and its cooldown remain separate.

Logging out or restarting during a flight safely returns the character to the departure stone, retaining discoveries. The server checks route, discovery, proximity and sight; clients cannot supply unlock lists or destination coordinates. Packs without optional travel nodes, such as Meadow, keep their existing behavior.

## Source and authoring

- `shared/continent.js`: names, positions, identities, height recipes, inter-zone roads, hubs and future sites.
- `shared/continent-settlements.js`: deterministic hub/objective placement, themed names and local routes.
- `shared/founding-inns.js`: paired inn flight stops and the starter lodge hearth.
- `shared/continent-buildings.js`: capital wards, buildings, footprint-aware street routing, foundations and road grades.
- `shared/province-boundaries.js`: full curved province polygons, shared boundary types, spatial lookup and terrain relief. Atlas outlines and physical divides use the same source.
- `shared/continent-geometry.js`: deterministic nearby scenery and collision shared by browser and server.
- `shared/continent-atlas.js` / `shared/atlas-regions.js`: five regional charts, adjoining polygon provinces and terrain illustrations.
- `shared/continent-travel.js`: flight stones, routes and capital classification.
- `client/continent-scene.js`: bounded scenery streaming and signature landmarks. Terrain streams separately; new buildings load nearby and are disposed when distant.
- `shared/continent-assets.js` and `client/asset-library/continent-*.js`: new reusable art generators.
- Engine `client/item-icons.js`: SVG equipment silhouettes/colors used in bags, equipment, loot, rewards and art exports.

The complete library has **881 catalog entries, 15 palettes and 48 assembled outfits**, retaining every original generator. The creature collection now has 208 designs across 32 body shapes, including 188 ecology additions. Continental props include the flight skiff, alongside 32 equipment studies. See [CREATURE_ECOLOGY.md](CREATURE_ECOLOGY.md) for all 52 zone backstories and five-type population plans. The build emits 929 GLBs and previews, plus 637 equipment SVGs. Generated output stays ignored; rebuild it with `npm run build:world-assets`. Git LFS is unnecessary.

198 dormant enemy templates (ten continental and 188 ecology designs) and 462 dormant item templates (32 continental studies and 430 new progression pieces) make the pre-shipped art available to validated live bundles. They have no spawns, vendors, rewards or balanced progression sources. Configure stats and acquisition deliberately. The unapplied `examples/continental-live-update.json` demonstrates adding a woolback encounter and an axe item at an empty Hazelwash site. Read the engine's `docs/LIVE_UPDATES.md`; use `--check` before applying to a backed-up world. The example is never automatically loaded.

Optional generated GLB, PNG and SVG exports are excluded from the world baseline hash, so rebuilding them does not invalidate accepted live bundles; their source generators and physics recipes remain hashed.

Geometry, collision, art source, maps and travel topology require a restart to change. Live bundles remain additive data updates. The higher-level XP table, quests and balancing are separate work. Layout revision 4 preserves valid revision-3 positions. This revision moves later capital and early-zone travel destinations; inspect any saved characters or live additions located in those reshaped areas before upgrading. Invalid/obstructed saved positions use the normal safe-spawn fallback; older migrations remain supported. Back up saves before upgrading. A nonempty live-update journal bound to the old content hash must be explicitly rebased and tested for the new baseline; startup deliberately refuses silent replay onto changed source.

## Verification and limits

Run `npm run test:emberwild` for campaigns/regressions and `node tools/continent-browser.js` from the engine root for a disposable rendered survey, flight, portal and persistence check. If headless WebGL is unavailable, use a virtual display with `HEADED=1`. The driver injects its survey command only into a temporary runtime; no warp/admin endpoint ships. Screenshots/results go to ignored `test-results/`. `node tools/province-browser.js` renders each physical boundary type and its pass; `node tools/atlas-browser.js` checks labels and the city departure charts.

Road checks sample every inter-zone road and city street; door checks exercise all new buildings. Travel checks cover discovery, combat/range restrictions, portals and interrupted-journey saves. Art checks cover every model/palette recipe and GLB round trips. Human navigation, travel pacing, visual polish and hardware performance still need review. This remains one authoritative simulation and one save writer with a shared 64-player cap. Geographic provinces are not separate servers or production sharding.

## Leveling routes

| Levels | Greenward | Crownspine | Lantern | Saltwind |
| --- | --- | --- | --- | --- |
| 11–20 | Hazelwash Downs | Redgranite Foothills | Ochretrail Fields | Saltmeadow Strand |
| 21–30 | Fernveil Wood | Slatewater Gorge | Coppermesa | Reedmosaic Delta |
| 31–40 | Mirrorbough Lakes | Bellstone Uplands | Cinderbloom Heath | Pearlshoal Coast |
| 41–50 | The Cedar Stairs | Frostlace Tundra | Saffron Reach | Rainharbor Weald |
| 51–60 | Amberstep Prairie | Glassback Range | Basaltveil | Mangrovefold |
| 61–70 | Orchidrift Basin | Cloudrest Escarpment | The Sunken Kilns | Thunderstrand |
| 71–80 | Moonroot Wilds | Ironchoir Deeps | Umbral Step | Tidehollow Basin |
| 81–90 | Silverwold Heights | Starfall Tablelands | Pyreglass March | Opalreach Fens |
| 91–100 | Elderwake Forest | Skybreak Crown | Dawnscar Barrens | Tempest Cape |

## Capitals

| Capital | Tradition | Adjacent level band | Identity |
| --- | --- | --- | --- |
| Alderhaven | Human | Shared arrival after 1–10 | Eight established wards and the Assembly |
| Sylvarin, the Listening Crown | sylvren | 31–40 | Radial garden wards, living-wood halls and a vast open crown pavilion |
| Karndur, the Witness Steps | cairnkin | 51–60 | Three civic terraces, low broad vaults and a monumental stone witness hall |
| Nereides, the Returning Harbor | brinefolk | 71–80 | Crescent harbor wards, shell-domed halls and an open rescue quay |
| Veshkar, the Patient Flame | emberkin | 91–100 | Concentric kiln courts, bronze-banded halls and a sheltered rebuilding forum |

## Level-100 frontiers

| Frontier | Identity |
| --- | --- |
| The Hush Canopy | A ring of immense hollow tree buttresses around an open, silent crown |
| Palespore Dream | Overlapping pale fungal shelves, lavender fog and a sunken spore amphitheatre |
| The World Anvil | Basalt organ pipes around a huge terraced impact forge |
| Stillwinter Expanse | Blue ice shelves, broad crevasses and a hollow ice cathedral |
| The Abyssal Steps | Deep-teal terraced sea bowls and huge ribbed reef arches |
| Prismtide Labyrinth | Prismatic tidal stone teeth arranged around a pearl-bright inner lagoon |
| The Last Caldera | An enormous cooled volcanic bowl, ember vents and a black central plug |
| Ashclock Waste | Concentric ash dunes, half-buried clock pillars and copper-lit desert glass |
| The Broken Orrery | A field of nested impact basins beneath a monumental broken astronomical ring |
| Stormcrown Meridian | Wind-cut needle ranks, rain-dark stone and a split meridian beacon |

## Regional atlas and developer exploration

The atlas now groups the continent into Dawnlands (9 zones), Greenward Wilds (9), Crownspine (10), Lantern Marches (10) and Saltwind Coast (9), with one separate capital in each region. Its shared polygon coast replaces the earlier half-ellipse boundary; all roads, cities and authored sites remain reachable. See [WORLD_ATLAS.md](WORLD_ATLAS.md).

For a local developer server, set `ENABLE_DEVELOPER_MODE=1` and bind `HOST=127.0.0.1`, then open `/developer`. The separate roster creates GM explorers with every route unlocked. **Travel → Explore** instantly visits a chosen zone/city, with destination search. This is disabled by default and accepts direct loopback connections only. The role persists; ordinary characters cannot request it. See the engine’s `docs/DEVELOPER.md` for a separate-data launch command and validation.

## Settlement validation

Run `node tools/test-world.js --world emberwild --script tests/settlements.test.js` from the engine to verify hub/inn counts, region ownership, objective access, flight pairing, map badges, hearth persistence and bridge depth. `tests/continent.test.js` samples every inter-zone road, local hub approach and doorway, and walks into every continental building. `tools/settlements-browser.js` exercises real inn binding, flight, recall and relogging; `tools/province-browser.js` renders all six divide types. Browser drivers use disposable saves and test-only fixture commands, never the live server protocol.
