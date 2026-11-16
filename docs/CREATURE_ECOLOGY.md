# Emberwild creature ecology

The source library contains **208 creature designs across 32 body shapes**. The ecology expansion adds 188 designs: three local species per zone plus two shared habitat species. Each of the 52 zones and capitals has five different body shapes and a suggested population of **20** (3 + 4 + 5 + 4 + 4), within the 15–25 target. Shared species connect neighboring ecosystems; physical adaptations distinguish local designs beyond palette changes.

These are **authoring plans, not live spawns**. The existing starter's 78 encounters are retained. Its 20-creature roster is an additional planning reference, not a replacement or a population cap. Capital rosters suggest peaceful companions, pollinators and garden residents.

Open **/bestiary.html** on an Emberwild server to browse by zone, read its backstory and open each animated model in the workshop. Optional thumbnails appear after an asset build. Source models work in the workshop without generated GLBs or previews.

## Authoring and live updates

- Source of truth: `shared/creature-ecology.js` exports `ECOLOGY_ASSETS`, `ZONE_ECOLOGY` and dormant enemy templates. Counts and dispositions are planning metadata; importing them never creates encounters.
- New body factories and physical adaptations live in `client/asset-library/ecology-creatures.js`. All previous asset generators remain available.
- Build the complete collection with `npm run build:world-assets` from the engine repository. Generated models/previews stay ignored; no binary assets or Git LFS are required in source repositories.
- Rebuild this reference with `node tools/document-ecology.js` from the Emberwild repository.

For later placement, choose a roster entry's **type ID** as the template in a live bundle's `enemyTypes` section. Assign a new encounter type ID and explicitly set level, health, damage, aggression and rewards. Then add spawn records at validated walkable coordinates. Follow the engine's **docs/LIVE_UPDATES.md**, validate with `--check` and back up the world before applying. A creature template alone does not place anything. Once applied, live bundles persist in the world's journal across restarts.

Example definition (no spawn records, so it adds only an encounter type):

```json
{
  "id": "hazelwash-fauna-v1",
  "worldId": "emberwild",
  "enemyTypes": {
    "hazelwash_ciderhare": {
      "template": "fauna_hazelwash_2",
      "values": {"name": "Ciderlop hare", "level": 11, "hp": 240, "damage": 6, "aggro": 0, "xp": 25, "gold": 0}
    }
  }
}
```

The dormant templates deliberately use placeholder level-1 stats, zero XP/gold and no aggression. The planned continent extends to level 100, while playable progression remains capped at 10; this collection does not claim balanced level-100 encounters. Population plans do not specify safe spawn coordinates. Aquatic and flying body shapes are art, not new swimming or flight AI: the current server moves creatures on walkable ground. Place them appropriately or add the desired movement behavior before using deep-water/aerial encounters. Disposition labels do not automatically grant social factions or companion behavior.

## Zone rosters

### The Cinderwood Reach

Old hearth fires spared pockets of ancient woodland. Orchard wildlife and rootbound creatures now compete along the returning roads.

Habitat: cinderwood. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Hedgerow fox | fox | tufts | predator | 3 | territorial | fauna_cinderwood_0 |
| Orchard boughstag | stag | flowers | grazer | 4 | neutral | fauna_cinderwood_1 |
| Hearthbank hare | hare | ears | grazer | 5 | neutral | fauna_cinderwood_2 |
| Briarcoat badger | badger | mane | burrower | 4 | neutral | fauna_cinderwood_3 |
| Ashglass lacewing | moth | crystals | pollinator | 4 | neutral | fauna_cinderwood_4 |

### Alderhaven

The Open Hand protects gardens and granaries as carefully as its gates. Small companions and civic constructs thrive beside the river.

Habitat: urban. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Courtyard lantern moth | moth | glow | pollinator | 3 | peaceful | fauna_urban_0 |
| Garden shellback | tortoise | flowers | grazer | 4 | peaceful | fauna_urban_1 |
| Granary mouser | lynx | tufts | companion | 5 | peaceful | fauna_alderhaven_2 |
| Riverstep pigeon | eagle | feathers | scavenger | 4 | peaceful | fauna_alderhaven_3 |
| Openhand garden tender | elemental | flowers | steward | 4 | peaceful | fauna_alderhaven_4 |

### Hazelwash Downs

Cider terraces reclaimed an abandoned estate. Fallen fruit feeds burrowers while hollow hedges shelter predators.

Habitat: cinderwood. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Hedgerow fox | fox | tufts | predator | 3 | territorial | fauna_cinderwood_0 |
| Orchard boughstag | stag | flowers | grazer | 4 | neutral | fauna_cinderwood_1 |
| Ciderlop hare | hare | ears | grazer | 5 | neutral | fauna_hazelwash_2 |
| Pressyard badger | badger | plates | burrower | 4 | neutral | fauna_hazelwash_3 |
| Hazelbrush lynx | lynx | tufts | predator | 4 | territorial | fauna_hazelwash_4 |

### Fernveil Wood

An observatory collapsed into a humid fern ravine. Its abandoned channels now carry frogs and insects beneath a roof of enormous leaves.

Habitat: rainforest. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Canopy seedstag | stag | roots | grazer | 3 | neutral | fauna_rainforest_0 |
| Leafmantle tortoise | tortoise | flowers | grazer | 4 | neutral | fauna_rainforest_1 |
| Fernfrill lizard | lizard | sail | grazer | 5 | neutral | fauna_fernveil_2 |
| Lensweb spider | spider | crystals | predator | 4 | territorial | fauna_fernveil_3 |
| Rainbell snail | snail | flowers | decomposer | 4 | neutral | fauna_fernveil_4 |

### Mirrorbough Lakes

An old flood joined several forest hollows into still lakes. Waterline hunters and reflective-winged insects follow the wooded causeways.

Habitat: brinecoast. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Saltbank wader | wader | feathers | insectivore | 3 | neutral | fauna_brinecoast_0 |
| Shoreglass crab | crab | crystals | scavenger | 4 | neutral | fauna_brinecoast_1 |
| Mirrorfin perch | fish | fins | shoaler | 5 | neutral | fauna_mirrorbough_2 |
| Causeway otterhound | wolf | fins | predator | 4 | territorial | fauna_mirrorbough_3 |
| Silverveil dragonbat | bat | crystals | insectivore | 4 | neutral | fauna_mirrorbough_4 |

### The Cedar Stairs

Cedar pillars once supported a pilgrimage staircase. Roots broke the stonework into grazing terraces, leaving cliff nests above the old processional route.

Habitat: rainforest. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Canopy seedstag | stag | roots | grazer | 3 | neutral | fauna_rainforest_0 |
| Leafmantle tortoise | tortoise | flowers | grazer | 4 | neutral | fauna_rainforest_1 |
| Stairhorn ibex | goat | horns | grazer | 5 | neutral | fauna_cedarstairs_2 |
| Cedarcrest eagle | eagle | feathers | predator | 4 | territorial | fauna_cedarstairs_3 |
| Pillarmoss bear | bear | mane | forager | 4 | neutral | fauna_cedarstairs_4 |

### Amberstep Prairie

An abandoned sundial still divides seasonal grazing grounds. Herd animals migrate through the grass while burrowing insects enrich the old firebreaks.

Habitat: sunsteppe. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Drygrass ridgeboar | boar | mane | forager | 3 | neutral | fauna_sunsteppe_0 |
| Grassveil moth | moth | feathers | pollinator | 4 | neutral | fauna_sunsteppe_1 |
| Ambermane courser | stag | mane | grazer | 5 | neutral | fauna_amberstep_2 |
| Sundial groundrunner | lizard | sail | insectivore | 4 | neutral | fauna_amberstep_3 |
| Honeycomb burrower | badger | plates | burrower | 4 | neutral | fauna_amberstep_4 |

### Orchidrift Basin

The basin sank around a warm spring. Orchids depend on luminous pollinators, and their thick fallen petals sustain enormous detritivores.

Habitat: orchid. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Nectarhorn stag | stag | flowers | grazer | 3 | neutral | fauna_orchid_0 |
| Petallight moth | moth | glow | pollinator | 4 | neutral | fauna_orchid_1 |
| Petalback snail | snail | flowers | decomposer | 5 | neutral | fauna_orchidrift_2 |
| Nectarveil bat | bat | ears | pollinator | 4 | neutral | fauna_orchidrift_3 |
| Orchidcoil millipede | centipede | spores | decomposer | 4 | neutral | fauna_orchidrift_4 |

### Moonroot Wilds

Ancient roots exposed a buried watercourse. Fungal light guides nocturnal hunters beneath the branches while patient grazers clear the banks.

Habitat: gloamfen. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Peatbell frog | frog | spores | insectivore | 3 | neutral | fauna_gloamfen_0 |
| Mossford tortoise | tortoise | roots | grazer | 4 | neutral | fauna_gloamfen_1 |
| Moonwhisker lynx | lynx | tufts | predator | 5 | territorial | fauna_moonroot_2 |
| Rootlantern spider | spider | spores | predator | 4 | territorial | fauna_moonroot_3 |
| Hollowroot keeper | elemental | roots | steward | 4 | neutral | fauna_moonroot_4 |

### Silverwold Heights

Silver-barked trees took root in glacial gravel. Pale browsers strip the lower boughs while insulated predators shelter between granite needles.

Habitat: frostfell. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Snowbranch elkhart | stag | crystals | grazer | 3 | neutral | fauna_frostfell_0 |
| Rimewing owl | owl | feathers | predator | 4 | territorial | fauna_frostfell_1 |
| Silverruff wolf | wolf | mane | predator | 5 | territorial | fauna_silverwold_2 |
| Needlehorn goat | goat | crystals | grazer | 4 | neutral | fauna_silverwold_3 |
| Frostburrow hare | hare | ears | grazer | 4 | neutral | fauna_silverwold_4 |

### Elderwake Forest

The fallen crown of the elder tree became a nursery rather than a tomb. Seed carriers, canopy hunters and living root masses sustain the next forest.

Habitat: rainforest. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Canopy seedstag | stag | roots | grazer | 3 | neutral | fauna_rainforest_0 |
| Leafmantle tortoise | tortoise | flowers | grazer | 4 | neutral | fauna_rainforest_1 |
| Crownmoss bear | bear | flowers | forager | 5 | neutral | fauna_elderwake_2 |
| Elderwing eagle | eagle | feathers | predator | 4 | territorial | fauna_elderwake_3 |
| Seedheart colossus | elemental | roots | steward | 4 | neutral | fauna_elderwake_4 |

### Redgranite Foothills

Surveyors exposed mineral springs beneath the red ridges. Salt-seeking herds and rock-shelled scavengers inherited their empty camps.

Habitat: redrock. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Redseam scorpion | scorpion | plates | predator | 3 | territorial | fauna_redrock_0 |
| Dustback tortoise | tortoise | plates | grazer | 4 | neutral | fauna_redrock_1 |
| Rusthorn ibex | goat | horns | grazer | 5 | neutral | fauna_redgranite_2 |
| Surveyback armadillo | badger | plates | scavenger | 4 | neutral | fauna_redgranite_3 |
| Redridge wolf | wolf | mane | predator | 4 | territorial | fauna_redgranite_4 |

### Slatewater Gorge

The gorge carries meltwater through abandoned slate workings. Sheltered ledges support nesting hunters above cold-water shoals.

Habitat: frostfell. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Snowbranch elkhart | stag | crystals | grazer | 3 | neutral | fauna_frostfell_0 |
| Rimewing owl | owl | feathers | predator | 4 | territorial | fauna_frostfell_1 |
| Slatefin char | fish | fins | shoaler | 5 | neutral | fauna_slatewater_2 |
| Gorgehook eagle | eagle | feathers | predator | 4 | territorial | fauna_slatewater_3 |
| Shelfclaw crab | crab | plates | scavenger | 4 | neutral | fauna_slatewater_4 |

### Bellstone Uplands

Wind sings through hollow monoliths. Grazers gather in their lee and their vibrations attract hard-shelled burrowers.

Habitat: sunsteppe. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Drygrass ridgeboar | boar | mane | forager | 3 | neutral | fauna_sunsteppe_0 |
| Grassveil moth | moth | feathers | pollinator | 4 | neutral | fauna_sunsteppe_1 |
| Bellhorn ram | goat | horns | grazer | 5 | neutral | fauna_bellstone_2 |
| Chimeplate beetle | beetle | crystals | decomposer | 4 | neutral | fauna_bellstone_3 |
| Monolith rockbear | bear | plates | forager | 4 | neutral | fauna_bellstone_4 |

### Frostlace Tundra

Seasonal thaw draws lace-shaped channels through permanent frost. Burrows and insulated coats keep life close to the thin summer growth.

Habitat: frostfell. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Snowbranch elkhart | stag | crystals | grazer | 3 | neutral | fauna_frostfell_0 |
| Rimewing owl | owl | feathers | predator | 4 | territorial | fauna_frostfell_1 |
| Lacefoot hare | hare | ears | grazer | 5 | neutral | fauna_frostlace_2 |
| Rimecoat badger | badger | mane | burrower | 4 | neutral | fauna_frostlace_3 |
| Meltpool newt | lizard | fins | insectivore | 4 | neutral | fauna_frostlace_4 |

### Glassback Range

Mineral-rich snow feeds translucent growths along the saddle. Browsers grind their horns against the seams while predators hunt by refracted light.

Habitat: crystal. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Shardcoat boar | boar | crystals | forager | 3 | neutral | fauna_crystal_0 |
| Facetwing moth | moth | crystals | pollinator | 4 | neutral | fauna_crystal_1 |
| Glasshorn ibex | goat | crystals | grazer | 5 | neutral | fauna_glassback_2 |
| Refraction spider | spider | crystals | predator | 4 | territorial | fauna_glassback_3 |
| Quartzwing bat | bat | spines | insectivore | 4 | neutral | fauna_glassback_4 |

### Cloudrest Escarpment

Cloud moisture waters otherwise bare shelves. Nesting raptors and sure-footed grazers share the remnants of a wind colonnade.

Habitat: frostfell. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Snowbranch elkhart | stag | crystals | grazer | 3 | neutral | fauna_frostfell_0 |
| Rimewing owl | owl | feathers | predator | 4 | territorial | fauna_frostfell_1 |
| Cloudsail eagle | eagle | feathers | predator | 5 | territorial | fauna_cloudrest_2 |
| Miststep goat | goat | mane | grazer | 4 | neutral | fauna_cloudrest_3 |
| Colonnade marmot | badger | ears | burrower | 4 | neutral | fauna_cloudrest_4 |

### Ironchoir Deeps

Iron-rich fissures resonate beneath standing stones. Heat and mineral salts feed plated detritivores and the predators that follow them.

Habitat: redrock. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Redseam scorpion | scorpion | plates | predator | 3 | territorial | fauna_redrock_0 |
| Dustback tortoise | tortoise | plates | grazer | 4 | neutral | fauna_redrock_1 |
| Ironseg millipede | centipede | plates | decomposer | 5 | neutral | fauna_ironchoir_2 |
| Resonant cavebat | bat | ears | insectivore | 4 | neutral | fauna_ironchoir_3 |
| Ferric stoneheart | elemental | crystals | steward | 4 | neutral | fauna_ironchoir_4 |

### Starfall Tablelands

Fallen fragments warmed a once barren tableland. Glass-lined pools and luminous dust sustain an unfamiliar nocturnal food web.

Habitat: astral. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Stardust moth | moth | glow | pollinator | 3 | neutral | fauna_astral_0 |
| Orbitback tortoise | tortoise | crystals | grazer | 4 | neutral | fauna_astral_1 |
| Meteorfin killifish | fish | crystals | shoaler | 5 | neutral | fauna_starfall_2 |
| Stargaze lynx | lynx | tufts | predator | 4 | territorial | fauna_starfall_3 |
| Dusthalo jelly | jelly | glow | filterer | 4 | neutral | fauna_starfall_4 |

### Skybreak Crown

The summit approach cuts through fierce updrafts. Low browsers cling to sheltered growth while broad-winged hunters ride the crown winds.

Habitat: frostfell. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Snowbranch elkhart | stag | crystals | grazer | 3 | neutral | fauna_frostfell_0 |
| Rimewing owl | owl | feathers | predator | 4 | territorial | fauna_frostfell_1 |
| Crownwing eagle | eagle | feathers | predator | 5 | territorial | fauna_skybreak_2 |
| Skybreak woolram | goat | mane | grazer | 4 | neutral | fauna_skybreak_3 |
| Icecrevice weasel | badger | tufts | predator | 4 | territorial | fauna_skybreak_4 |

### Ochretrail Fields

Caravan fields reverted to tall grass after the wayhouse closed. Seed eaters, their hunters and patient scavengers follow its old drainage ditches.

Habitat: sunsteppe. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Drygrass ridgeboar | boar | mane | forager | 3 | neutral | fauna_sunsteppe_0 |
| Grassveil moth | moth | feathers | pollinator | 4 | neutral | fauna_sunsteppe_1 |
| Ochre-ear hare | hare | ears | grazer | 5 | neutral | fauna_ochretrail_2 |
| Wayhouse jackal | wolf | tufts | predator | 4 | territorial | fauna_ochretrail_3 |
| Ditchplate lizard | lizard | plates | insectivore | 4 | neutral | fauna_ochretrail_4 |

### Coppermesa

Copper dust stains the mesa pools. Shelled crawlers consume mineral films while cliff predators watch the open gullies.

Habitat: redrock. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Redseam scorpion | scorpion | plates | predator | 3 | territorial | fauna_redrock_0 |
| Dustback tortoise | tortoise | plates | grazer | 4 | neutral | fauna_redrock_1 |
| Coppercrest lizard | lizard | sail | grazer | 5 | neutral | fauna_coppermesa_2 |
| Verdigris snail | snail | crystals | decomposer | 4 | neutral | fauna_coppermesa_3 |
| Mesahook eagle | eagle | feathers | predator | 4 | territorial | fauna_coppermesa_4 |

### Cinderbloom Heath

Cooled kilns nourish red flowers through their porous ash. Pollinators return every season, followed by fire-scarred omnivores.

Habitat: emberwastes. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Ashcoil serpent | serpent | spines | predator | 3 | territorial | fauna_emberwastes_0 |
| Emberdust moth | moth | glow | pollinator | 4 | neutral | fauna_emberwastes_1 |
| Cinderpetal bat | bat | flowers | pollinator | 5 | neutral | fauna_cinderbloom_2 |
| Kilnroot boar | boar | mane | forager | 4 | neutral | fauna_cinderbloom_3 |
| Ashseed hopper | frog | spines | insectivore | 4 | neutral | fauna_cinderbloom_4 |

### Saffron Reach

A buried caravan court traps dew beneath the dunes. Small burrowers and water-storing reptiles live from one shaded hollow to the next.

Habitat: desert. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Duneplate tortoise | tortoise | plates | grazer | 3 | neutral | fauna_desert_0 |
| Sandveil moth | moth | feathers | pollinator | 4 | neutral | fauna_desert_1 |
| Saffron sandhare | hare | ears | grazer | 5 | neutral | fauna_saffronreach_2 |
| Dewcrest monitor | lizard | sail | predator | 4 | territorial | fauna_saffronreach_3 |
| Courtstone scarab | beetle | plates | decomposer | 4 | neutral | fauna_saffronreach_4 |

### Basaltveil

Extinct lava tubes vent enough warmth to shelter colonies year round. The columns channel flying insects toward waiting webs.

Habitat: emberwastes. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Ashcoil serpent | serpent | spines | predator | 3 | territorial | fauna_emberwastes_0 |
| Emberdust moth | moth | glow | pollinator | 4 | neutral | fauna_emberwastes_1 |
| Basaltweb hunter | spider | spines | predator | 5 | territorial | fauna_basaltveil_2 |
| Lavachannel centipede | centipede | plates | decomposer | 4 | neutral | fauna_basaltveil_3 |
| Columnshade bat | bat | ears | insectivore | 4 | neutral | fauna_basaltveil_4 |

### The Sunken Kilns

Collapsed ceramic kilns hold warm rainwater. Glazed shells and mineral-coated hides protect creatures that forage among their sharp fragments.

Habitat: emberwastes. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Ashcoil serpent | serpent | spines | predator | 3 | territorial | fauna_emberwastes_0 |
| Emberdust moth | moth | glow | pollinator | 4 | neutral | fauna_emberwastes_1 |
| Glazeback crocodile | crocodile | plates | predator | 5 | territorial | fauna_sunkenkilns_2 |
| Potterclay snail | snail | crystals | decomposer | 4 | neutral | fauna_sunkenkilns_3 |
| Kilnpool catfish | fish | fins | shoaler | 4 | neutral | fauna_sunkenkilns_4 |

### Umbral Step

Dark tors divide patches of violet heath. Twilight favors quiet browsers and hunters adapted to the narrow strips of shelter.

Habitat: gloamfen. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Peatbell frog | frog | spores | insectivore | 3 | neutral | fauna_gloamfen_0 |
| Mossford tortoise | tortoise | roots | grazer | 4 | neutral | fauna_gloamfen_1 |
| Umbral tuftcat | lynx | tufts | predator | 5 | territorial | fauna_umbralstep_2 |
| Violetmane ram | goat | mane | grazer | 4 | neutral | fauna_umbralstep_3 |
| Duskheath glowworm | centipede | glow | decomposer | 4 | neutral | fauna_umbralstep_4 |

### Pyreglass March

Cooling glass fractures into razor seams. Armored reptiles and mineral-feeding crawlers thrive where softer-footed grazers cannot.

Habitat: crystal. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Shardcoat boar | boar | crystals | forager | 3 | neutral | fauna_crystal_0 |
| Facetwing moth | moth | crystals | pollinator | 4 | neutral | fauna_crystal_1 |
| Obsidian sailback | lizard | sail | predator | 5 | territorial | fauna_pyreglass_2 |
| Pyreshard crab | crab | crystals | scavenger | 4 | neutral | fauna_pyreglass_3 |
| Glassdust roller | beetle | plates | decomposer | 4 | neutral | fauna_pyreglass_4 |

### Dawnscar Barrens

A cooled fissure split an ancient gathering ground. Hardy seed eaters recolonize the amphitheatre while stonebound life wakes in its sheltered cracks.

Habitat: emberwastes. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Ashcoil serpent | serpent | spines | predator | 3 | territorial | fauna_emberwastes_0 |
| Emberdust moth | moth | glow | pollinator | 4 | neutral | fauna_emberwastes_1 |
| Scarhorn ibex | goat | horns | grazer | 5 | neutral | fauna_dawnscar_2 |
| Dawndust hare | hare | spines | grazer | 4 | neutral | fauna_dawnscar_3 |
| Fissureheart elemental | elemental | crystals | steward | 4 | neutral | fauna_dawnscar_4 |

### Saltmeadow Strand

Salt grass swallowed old net-drying courts. Shore birds and shell crushers follow the receding pools rather than the abandoned roads.

Habitat: brinecoast. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Saltbank wader | wader | feathers | insectivore | 3 | neutral | fauna_brinecoast_0 |
| Shoreglass crab | crab | crystals | scavenger | 4 | neutral | fauna_brinecoast_1 |
| Saltplume gull | eagle | feathers | insectivore | 5 | neutral | fauna_saltmeadow_2 |
| Netbank otterhound | wolf | fins | predator | 4 | territorial | fauna_saltmeadow_3 |
| Dunefan lizard | lizard | sail | insectivore | 4 | neutral | fauna_saltmeadow_4 |

### Reedmosaic Delta

Successive floods braided the delta into shifting islands. Raised banks shelter egg layers while filter feeders clean the sheltered channels.

Habitat: gloamfen. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Peatbell frog | frog | spores | insectivore | 3 | neutral | fauna_gloamfen_0 |
| Mossford tortoise | tortoise | roots | grazer | 4 | neutral | fauna_gloamfen_1 |
| Reedjaw crocodile | crocodile | plates | predator | 5 | territorial | fauna_reedmosaic_2 |
| Mosaic glassfish | fish | fins | shoaler | 4 | neutral | fauna_reedmosaic_3 |
| Channelveil jelly | jelly | glow | filterer | 4 | neutral | fauna_reedmosaic_4 |

### Pearlshoal Coast

Shell reefs grew over the remains of a coastal quarry. Mineral-filtering colonies draw grazers and hard-jawed scavengers to its tidal shelves.

Habitat: coral. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Reeffan wader | wader | fins | insectivore | 3 | neutral | fauna_coral_0 |
| Coralback tortoise | tortoise | crystals | grazer | 4 | neutral | fauna_coral_1 |
| Pearlshell snail | snail | plates | grazer | 5 | neutral | fauna_pearlshoal_2 |
| Shoalcrest ray | ray | fins | filterer | 4 | neutral | fauna_pearlshoal_3 |
| Quarryclaw lobster | crab | spines | scavenger | 4 | neutral | fauna_pearlshoal_4 |

### Rainharbor Weald

The harbor foundations filled with freshwater after the estuary shifted. Rainforest wildlife now forages among its terraces and flooded courts.

Habitat: rainforest. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Canopy seedstag | stag | roots | grazer | 3 | neutral | fauna_rainforest_0 |
| Leafmantle tortoise | tortoise | flowers | grazer | 4 | neutral | fauna_rainforest_1 |
| Rainruff bear | bear | mane | forager | 5 | neutral | fauna_rainharbor_2 |
| Harborbank kingfisher | eagle | fins | predator | 4 | territorial | fauna_rainharbor_3 |
| Courtyard mudskipper | fish | fins | insectivore | 4 | neutral | fauna_rainharbor_4 |

### Mangrovefold

Mangrove roots closed around an abandoned ferry channel. Root cavities shelter nurseries from the larger hunters patrolling the green water.

Habitat: gloamfen. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Peatbell frog | frog | spores | insectivore | 3 | neutral | fauna_gloamfen_0 |
| Mossford tortoise | tortoise | roots | grazer | 4 | neutral | fauna_gloamfen_1 |
| Rootjaw crocodile | crocodile | roots | predator | 5 | territorial | fauna_mangrovefold_2 |
| Ferryshade spider | spider | spines | predator | 4 | territorial | fauna_mangrovefold_3 |
| Mangrove mudsnail | snail | spores | decomposer | 4 | neutral | fauna_mangrovefold_4 |

### Thunderstrand

Storms repeatedly recharge the ruined lightning ring. Bluff wildlife has learned to ground the charge or feed on the creatures drawn to it.

Habitat: storm. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Raincoil serpent | serpent | sail | predator | 3 | territorial | fauna_storm_0 |
| Stormglass beetle | beetle | crystals | decomposer | 4 | neutral | fauna_storm_1 |
| Thunderfrill monitor | lizard | sail | predator | 5 | territorial | fauna_thunderstrand_2 |
| Stormcall eagle | eagle | feathers | predator | 4 | territorial | fauna_thunderstrand_3 |
| Ringcharge crawler | centipede | glow | decomposer | 4 | neutral | fauna_thunderstrand_4 |

### Tidehollow Basin

A former inlet became a seasonal salt basin. Creatures follow its retreating margins and shelter in limestone pockets through the dry season.

Habitat: brinecoast. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Saltbank wader | wader | feathers | insectivore | 3 | neutral | fauna_brinecoast_0 |
| Shoreglass crab | crab | crystals | scavenger | 4 | neutral | fauna_brinecoast_1 |
| Brineplate crocodile | crocodile | plates | predator | 5 | territorial | fauna_tidehollow_2 |
| Saltglass minnow | fish | crystals | shoaler | 4 | neutral | fauna_tidehollow_3 |
| Hollowbank badger | badger | mane | burrower | 4 | neutral | fauna_tidehollow_4 |

### Opalreach Fens

Opal sediment scatters light through the fen pools. Camouflaged grazers and translucent filter feeders sustain a delicate wetland chain.

Habitat: coral. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Reeffan wader | wader | fins | insectivore | 3 | neutral | fauna_coral_0 |
| Coralback tortoise | tortoise | crystals | grazer | 4 | neutral | fauna_coral_1 |
| Opalveil jelly | jelly | glow | filterer | 5 | neutral | fauna_opalreach_2 |
| Reedopal snail | snail | crystals | grazer | 4 | neutral | fauna_opalreach_3 |
| Lavender fenhare | hare | ears | grazer | 4 | neutral | fauna_opalreach_4 |

### Tempest Cape

An empty signal court still divides the strongest sea winds. Flying hunters use its pillars while low armored creatures shelter below.

Habitat: storm. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Raincoil serpent | serpent | sail | predator | 3 | territorial | fauna_storm_0 |
| Stormglass beetle | beetle | crystals | decomposer | 4 | neutral | fauna_storm_1 |
| Capehook eagle | eagle | feathers | predator | 5 | territorial | fauna_tempestcape_2 |
| Signalplate crab | crab | plates | scavenger | 4 | neutral | fauna_tempestcape_3 |
| Windcrest drake | wyvern | sail | predator | 4 | territorial | fauna_tempestcape_4 |

### Sylvarin, the Listening Crown

The Listening Crown treats the canopy as shared civic ground. Seed carriers, pest hunters and living gardeners keep its bough wards healthy.

Habitat: urban. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Courtyard lantern moth | moth | glow | pollinator | 3 | peaceful | fauna_urban_0 |
| Garden shellback | tortoise | flowers | grazer | 4 | peaceful | fauna_urban_1 |
| Boughcourt glider | bat | flowers | pollinator | 5 | peaceful | fauna_sylvarin_2 |
| Crownstep mouser | lynx | tufts | companion | 4 | peaceful | fauna_sylvarin_3 |
| Listening seedkeeper | elemental | roots | steward | 4 | peaceful | fauna_sylvarin_4 |

### Karndur, the Witness Steps

Witness Steps were built around a living spring. Sure-footed companions and small civic constructs keep the terraces and their gardens in order.

Habitat: urban. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Courtyard lantern moth | moth | glow | pollinator | 3 | peaceful | fauna_urban_0 |
| Garden shellback | tortoise | flowers | grazer | 4 | peaceful | fauna_urban_1 |
| Witnessyard woolram | goat | mane | companion | 5 | peaceful | fauna_karndur_2 |
| Vaultstep badger | badger | plates | companion | 4 | peaceful | fauna_karndur_3 |
| Terrace hearthstone | elemental | crystals | steward | 4 | peaceful | fauna_karndur_4 |

### Nereides, the Returning Harbor

The Returning Harbor leaves its rescue quays open to harmless shore life. Filter feeders and trained companions help keep the sheltered water clean.

Habitat: urban. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Courtyard lantern moth | moth | glow | pollinator | 3 | peaceful | fauna_urban_0 |
| Garden shellback | tortoise | flowers | grazer | 4 | peaceful | fauna_urban_1 |
| Quayfin companion | fish | fins | companion | 5 | peaceful | fauna_nereides_2 |
| Shellcourt snail | snail | flowers | grazer | 4 | peaceful | fauna_nereides_3 |
| Rescuequay otterhound | wolf | fins | companion | 4 | peaceful | fauna_nereides_4 |

### Veshkar, the Patient Flame

The Patient Flame recycles kiln heat into sheltered gardens. Small heat-loving residents and careful hearth constructs share its rebuilding courts.

Habitat: urban. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Courtyard lantern moth | moth | glow | pollinator | 3 | peaceful | fauna_urban_0 |
| Garden shellback | tortoise | flowers | grazer | 4 | peaceful | fauna_urban_1 |
| Hearthcurl lizard | lizard | sail | companion | 5 | peaceful | fauna_veshkar_2 |
| Kilncourt mouser | lynx | tufts | companion | 4 | peaceful | fauna_veshkar_3 |
| Patient hearthkeeper | elemental | glow | steward | 4 | peaceful | fauna_veshkar_4 |

### The Hush Canopy

A broken pact silenced the oldest crown. Animals communicate through touch and root vibration while immense seed keepers tend its hollow buttresses.

Habitat: rainforest. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Canopy seedstag | stag | roots | grazer | 3 | neutral | fauna_rainforest_0 |
| Leafmantle tortoise | tortoise | flowers | grazer | 4 | neutral | fauna_rainforest_1 |
| Hushpelt bear | bear | spores | forager | 5 | neutral | fauna_hushcanopy_2 |
| Touchweb widow | spider | roots | predator | 4 | territorial | fauna_hushcanopy_3 |
| Silentcrown keeper | elemental | roots | steward | 4 | neutral | fauna_hushcanopy_4 |

### Palespore Dream

A dreaming fungal network occupies a sunken amphitheatre. Its airborne spores link decomposers, pale grazers and predators into a tightly coupled ecology.

Habitat: orchid. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Nectarhorn stag | stag | flowers | grazer | 3 | neutral | fauna_orchid_0 |
| Petallight moth | moth | glow | pollinator | 4 | neutral | fauna_orchid_1 |
| Dreamcap snail | snail | spores | decomposer | 5 | neutral | fauna_palespore_2 |
| Palefrond millipede | centipede | spores | decomposer | 4 | neutral | fauna_palespore_3 |
| Sporemask bat | bat | flowers | pollinator | 4 | neutral | fauna_palespore_4 |

### The World Anvil

An impact forge cooled around resonant basalt pipes. Mineral-consuming life inhabits the slag while stone hearts maintain an ancient cycle of fracture and repair.

Habitat: redrock. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Redseam scorpion | scorpion | plates | predator | 3 | territorial | fauna_redrock_0 |
| Dustback tortoise | tortoise | plates | grazer | 4 | neutral | fauna_redrock_1 |
| Anvilplate bear | bear | plates | forager | 5 | neutral | fauna_worldanvil_2 |
| Slagjaw monitor | lizard | crystals | predator | 4 | territorial | fauna_worldanvil_3 |
| Forgepulse elemental | elemental | glow | steward | 4 | neutral | fauna_worldanvil_4 |

### Stillwinter Expanse

An ice cathedral shelters geothermal melt below permanent winter. Insulated herds and ice-boring colonies survive on the brief growth around its vents.

Habitat: frostfell. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Snowbranch elkhart | stag | crystals | grazer | 3 | neutral | fauna_frostfell_0 |
| Rimewing owl | owl | feathers | predator | 4 | territorial | fauna_frostfell_1 |
| Cathedral woolback | mammoth | mane | grazer | 5 | neutral | fauna_stillwinter_2 |
| Stillfrost wolf | wolf | mane | predator | 4 | territorial | fauna_stillwinter_3 |
| Iceborer centipede | centipede | crystals | decomposer | 4 | neutral | fauna_stillwinter_4 |

### The Abyssal Steps

Raised sea bowls preserve pockets of an ancient deep reef. Filter feeders illuminate the terraces, attracting armored scavengers and long-bodied hunters.

Habitat: abyss. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Deepfan ray | ray | fins | filterer | 3 | neutral | fauna_abyss_0 |
| Ribreef crab | crab | spines | scavenger | 4 | neutral | fauna_abyss_1 |
| Abyssveil jelly | jelly | glow | filterer | 5 | neutral | fauna_abyssalstep_2 |
| Ribarch sea monitor | crocodile | fins | predator | 4 | territorial | fauna_abyssalstep_3 |
| Depthshell snail | snail | spines | grazer | 4 | neutral | fauna_abyssalstep_4 |

### Prismtide Labyrinth

Tidal crystals split the lagoon light into shifting bands. Residents use refractive shells or translucent bodies to disappear among the stone teeth.

Habitat: coral. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Reeffan wader | wader | fins | insectivore | 3 | neutral | fauna_coral_0 |
| Coralback tortoise | tortoise | crystals | grazer | 4 | neutral | fauna_coral_1 |
| Prismfin shoaler | fish | crystals | shoaler | 5 | neutral | fauna_prismtide_2 |
| Labyrinth glassjelly | jelly | glow | filterer | 4 | neutral | fauna_prismtide_3 |
| Pearlcrest ray | ray | crystals | filterer | 4 | neutral | fauna_prismtide_4 |

### The Last Caldera

The last eruption sealed a warm world beneath a cooled crust. Vent feeders and heat-shedding predators cluster around the remaining ember seams.

Habitat: emberwastes. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Ashcoil serpent | serpent | spines | predator | 3 | territorial | fauna_emberwastes_0 |
| Emberdust moth | moth | glow | pollinator | 4 | neutral | fauna_emberwastes_1 |
| Ventplate salamander | lizard | sail | predator | 5 | territorial | fauna_lastcaldera_2 |
| Caldera ashcrawler | centipede | plates | decomposer | 4 | neutral | fauna_lastcaldera_3 |
| Plugheart titan | elemental | glow | steward | 4 | neutral | fauna_lastcaldera_4 |

### Ashclock Waste

Buried clockworks trap heat under concentric ash dunes. Migratory burrowers time their emergence to cool intervals between the waste winds.

Habitat: desert. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Duneplate tortoise | tortoise | plates | grazer | 3 | neutral | fauna_desert_0 |
| Sandveil moth | moth | feathers | pollinator | 4 | neutral | fauna_desert_1 |
| Clockear sandhare | hare | ears | grazer | 5 | neutral | fauna_ashclock_2 |
| Hourglass scarab | beetle | crystals | decomposer | 4 | neutral | fauna_ashclock_3 |
| Ashdial scorpion | scorpion | plates | predator | 4 | territorial | fauna_ashclock_4 |

### The Broken Orrery

Fragments of the orrery bend dust and moisture into nested basins. Luminous colonies feed on the fallout while gliding hunters circle the broken rings.

Habitat: astral. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Stardust moth | moth | glow | pollinator | 3 | neutral | fauna_astral_0 |
| Orbitback tortoise | tortoise | crystals | grazer | 4 | neutral | fauna_astral_1 |
| Orbitveil jelly | jelly | glow | filterer | 5 | neutral | fauna_brokenorrery_2 |
| Ringwake wyvern | wyvern | crystals | predator | 4 | territorial | fauna_brokenorrery_3 |
| Impactheart wanderer | elemental | crystals | steward | 4 | neutral | fauna_brokenorrery_4 |

### Stormcrown Meridian

The split meridian beacon channels storms across needle ranks. Charge-tolerant creatures shelter between strikes and emerge to hunt in the rain.

Habitat: storm. Suggested population: 20.

| Creature | Body shape | Adaptation | Ecological role | Count | Disposition | Template ID |
| --- | --- | --- | --- | ---: | --- | --- |
| Raincoil serpent | serpent | sail | predator | 3 | territorial | fauna_storm_0 |
| Stormglass beetle | beetle | crystals | decomposer | 4 | neutral | fauna_storm_1 |
| Meridian stormeagle | eagle | feathers | predator | 5 | territorial | fauna_stormcrown_2 |
| Rainspine monitor | lizard | spines | predator | 4 | territorial | fauna_stormcrown_3 |
| Beaconcharge elemental | elemental | glow | steward | 4 | neutral | fauna_stormcrown_4 |
