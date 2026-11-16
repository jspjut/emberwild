import {ECOLOGY_ASSETS} from './creature-ecology.js';
import {CONTINENT_ASSETS} from './continent-assets.js';
import {CONTINENT_PALETTES} from './continent-biomes.js';
// Original expansion assets. These are art recipes, not live enemy/loot tables.
import {ARMOR_ASSETS,REWARD_WEAPONS} from './equipment-collection.js';
export const ASSET_REGIONS={
 ...CONTINENT_PALETTES,
  cinderwood:{name:'Cinderwood frontier',description:'Warm timber, sage foliage, worn brass and amber light.',ground:'#7b8960',body:'#947253',light:'#c3a27b',dark:'#534b3b',leaf:'#74865a',wood:'#796044',stone:'#959483',metal:'#a7aca0',trim:'#c5a56b',cloth:'#667e72',glow:'#efbd6d'},
  brinecoast:{name:'Brine Coast',description:'Salt-washed timber, pale sand, sea glass and coral.',ground:'#8e9c91',body:'#658e91',light:'#b3c1ae',dark:'#3d5f65',leaf:'#638e7a',wood:'#938b71',stone:'#a0b0ae',metal:'#adc1bd',trim:'#d1ad7c',cloth:'#426e7d',glow:'#88ded0'},
  frostfell:{name:'Frostfell highlands',description:'Blue slate, pale fur, silver fittings and winter cloth.',ground:'#8b9da0',body:'#aab8b6',light:'#e0dfc7',dark:'#526875',leaf:'#60827d',wood:'#6e7471',stone:'#8397a3',metal:'#c3d3d4',trim:'#a79eac',cloth:'#626f8a',glow:'#b5e6e9'},
  emberwastes:{name:'Emberwastes',description:'Charcoal stone, red clay, bronze and small ember accents.',ground:'#6c655b',body:'#876251',light:'#c49c76',dark:'#3c3d3e',leaf:'#7c7152',wood:'#675249',stone:'#626366',metal:'#a98e76',trim:'#d39760',cloth:'#865448',glow:'#f5a25e'},
  sunsteppe:{name:'Sunsteppe',description:'Dry grass, tawny hides, weathered gold and woven indigo.',ground:'#a79d70',body:'#b49565',light:'#ddcca1',dark:'#66563c',leaf:'#9a9a60',wood:'#967b50',stone:'#b7a17f',metal:'#b7ad8c',trim:'#d9b974',cloth:'#64758b',glow:'#f4d891'},
  gloamfen:{name:'Gloamfen',description:'Peat wood, moss, plum cloth and restrained fungal light.',ground:'#647365',body:'#78856b',light:'#b4b89a',dark:'#454b4b',leaf:'#658169',wood:'#646451',stone:'#888b91',metal:'#9ca4a4',trim:'#b5a480',cloth:'#75667e',glow:'#b4d6a1'}
};
const asset=(id,name,category,model,region,description,tags=[],extra={})=>({id,name,category,model,region,description,tags,license:'MIT',...extra});
export const EXPANSION_ASSETS=[
 ...CONTINENT_ASSETS,...ECOLOGY_ASSETS,
  asset('brushfox','Brush-tail fox','creature','fox','cinderwood','An alert woodland scavenger with a sweeping tail and oversized ears.',['wildlife','quadruped']),
  asset('ridgeboar','Ridgeback boar','creature','boar','sunsteppe','A low, heavy grazer with a bristled ridge and curved tusks.',['wildlife','quadruped']),
  asset('thornstag','Bough-antler stag','creature','stag','cinderwood','A long-legged forest sentinel with branching antlers.',['wildlife','quadruped']),
  asset('duskowl','Duskwing owl','creature','owl','frostfell','A round, watchful hunter with a broad facial disc and articulated wings.',['wildlife','flying']),
  asset('marshhopper','Mirebell hopper','creature','frog','gloamfen','A wide-mouthed amphibian with folded hind legs and throat markings.',['wildlife','amphibian']),
  asset('stoneback','Stoneback tortoise','creature','tortoise','sunsteppe','A patient carrier of a ridged, plate-covered shell.',['wildlife','quadruped']),
  asset('lanternmoth','Lantern moth','creature','moth','gloamfen','A luminous insect with four patterned wings and a lantern-like abdomen.',['insect','flying']),
  asset('reedstalker','Reedstride wader','creature','wader','brinecoast','A tall wetland bird with slender legs, a hooked neck and a long bill.',['wildlife','biped']),
  asset('shardcrab','Shardclaw crab','creature','crab','brinecoast','An armored shore scavenger with moving claws and mineral encrustations.',['wildlife','crustacean']),
  asset('rootguard','Wayroot guardian','creature','guardian','emberwastes','A towering elemental assembled from timber, stone and a dim living core.',['elemental','biped']),
  asset('human','Human · original Dawnwarden','race','human','cinderwood','The original playable human, using the same face, proportions, hair and starter equipment as the game.',['humanoid','human','playable','original'],{playable:true}),
  asset('sylvren','Sylvren','race','sylvren','cinderwood','Slender bark-skinned folk with leaf-shaped ears and a living crown.',['humanoid','forest','prototype']),
  asset('cairnkin','Cairnkin','race','cairnkin','frostfell','Broad stonefolk with mineral brows, rounded ears and a crystalline crest.',['humanoid','mountain','prototype']),
  asset('brinefolk','Brinefolk','race','brinefolk','brinecoast','Amphibious travelers with fin-like ears, cheek ridges and a swept crest.',['humanoid','coast','prototype']),
  asset('emberkin','Emberkin','race','emberkin','emberwastes','Ash-touched folk with curling horns, warm eyes and ember freckles.',['humanoid','volcanic','prototype']),
  asset('frontier_sword','Frontier longsword','item','sword','cinderwood','A practical blade with a broad guard and a wrapped grip.',['weapon','main hand'],{slot:'weapon'}),
  asset('trail_axe','Trailcleaver axe','item','axe','sunsteppe','A bearded axe with a wedged head and a long timber haft.',['weapon','main hand'],{slot:'weapon'}),
  asset('ward_hammer','Waystone hammer','item','hammer','frostfell','A stone-faced hammer held by metal bands and a carved haft.',['weapon','main hand'],{slot:'weapon'}),
  asset('lantern_staff','Lanternkeeper staff','item','staff','gloamfen','A forked staff carrying a small suspended light.',['weapon','main hand'],{slot:'weapon'}),
  asset('reed_spear','Reedguard spear','item','spear','brinecoast','A leaf-bladed spear with bindings and a counterweight.',['weapon','main hand'],{slot:'weapon'}),
  asset('round_shield','Wayfarer shield','item','shield','cinderwood','A plank shield with a metal rim and crossed reinforcing bands.',['shield','off hand'],{slot:'offhand'}),
  asset('traveler_cap','Foldbrim cap','item','hat','sunsteppe','A soft travel hat with a stitched band and badge.',['armor','head'],{slot:'head'}),
  asset('ridge_helm','Ridgewatch helm','item','helmet','frostfell','An open-faced helmet with a brow band, nasal guard and cheek plates.',['armor','head'],{slot:'head'}),
  asset('warden_coat','Roadwarden coat','item','coat','emberwastes','A fitted coat with a split hem and reinforced shoulder pieces.',['armor','chest'],{slot:'armor'}),
  asset('trail_leggings','Trailbound leggings','item','trousers','cinderwood','Reinforced trousers with knee guards and side piping.',['armor','legs'],{slot:'legs'}),
  asset('wayfarer_boots_asset','Wayfarer field boots','item','boots','brinecoast','Sturdy cuffed boots with thick soles and binding straps.',['armor','feet'],{slot:'feet'}),
  asset('survey_pack','Surveyor pack','item','pack','gloamfen','A framed field pack with a bedroll, side pouch and buckles.',['bag','back'],{slot:'back'}),
  asset('broadleaf_tree','Roundcrown tree','prop','broadleaf','cinderwood','A branching shade tree with clustered, softly shaded foliage.',['vegetation','tree']),
  asset('pine_tree','Ridgepine','prop','pine','frostfell','A tiered evergreen with a visible trunk and drooping lower boughs.',['vegetation','tree']),
  asset('willow_tree','Riverveil willow','prop','willow','brinecoast','A crooked riverside tree with hanging curtains of leaves.',['vegetation','tree']),
  asset('dead_tree','Weathered snag','prop','deadwood','emberwastes','A twisted bare trunk with split roots and broken branches.',['vegetation','tree']),
  asset('stone_arch','Broken waygate','prop','arch','frostfell','A freestanding arch of cut, weathered blocks with an open passage.',['ruin','architecture']),
  asset('runestone','Survey runestone','prop','runestone','emberwastes','A leaning stone marker with inset luminous glyphs.',['ruin','landmark']),
  asset('crystal_cluster','Mineral bloom','prop','crystal','gloamfen','A group of growing mineral shards on a stone bed.',['resource','mineral']),
  asset('ore_seam','Exposed ore seam','prop','ore','frostfell','A broken boulder exposing several metallic veins.',['resource','mining']),
  asset('herb_patch','Wayleaf herb patch','prop','herb','cinderwood','Broad leaves, curled stems and a few clustered flowers.',['resource','herbalism']),
  asset('mushroom_cluster','Bellcap colony','prop','mushroom','gloamfen','Three rounded mushrooms with pale gills and a faint inner glow.',['vegetation','fungus']),
  asset('reeds','River reedbed','prop','reeds','brinecoast','A small clump of swaying reeds and seed heads.',['vegetation','water']),
  asset('log_stack','Bound timber stack','prop','logs','cinderwood','Cut timber with visible growth rings and securing ropes.',['settlement','supplies']),
  asset('crate_stack','Provision crates','prop','crates','cinderwood','Two braced supply crates with corner fittings and slatted lids.',['settlement','supplies']),
  asset('barrel','Coopered barrel','prop','barrel','brinecoast','A bulging stave barrel with three hoops and a sealed lid.',['settlement','storage']),
  asset('handcart','Trail handcart','prop','cart','sunsteppe','An open slatted cart with spoked wheels and two long handles.',['settlement','transport']),
  asset('market_stall','Frontier market stall','prop','stall','sunsteppe','A cloth awning over a timber counter and simple market wares.',['settlement','merchant']),
  asset('wayside_lantern','Wayside lantern','prop','lantern','gloamfen','A crooked wooden post supporting a caged warm lantern.',['settlement','lighting']),
  asset('trail_sign','Crossroads signpost','prop','sign','cinderwood','Two direction boards, a route badge and a stone footing.',['settlement','wayfinding']),
  asset('bench','Travelers’ bench','prop','bench','cinderwood','A plank seat with a backrest, braces and solid legs.',['settlement','furniture']),
  asset('well','Village well','prop','well','brinecoast','A stone well with a pitched roof, rope spindle and bucket.',['settlement','water']),
  asset('rope_bridge','Short rope bridge','prop','bridge','gloamfen','A modular plank crossing with rope handrails and four posts.',['architecture','crossing']),
  asset('trail_tent','Survey camp tent','prop','tent','sunsteppe','An open-front canvas tent with bedroll, stakes and guy ropes.',['settlement','camp']),
  ...ARMOR_ASSETS,...REWARD_WEAPONS
];
export const ASSET_CATEGORIES={creature:'Creatures',race:'Races',item:'Equipment',prop:'World props'};
const catalogAssets=new Map();
export function registerCatalogAssets(assets){for(const asset of assets)catalogAssets.set(asset.id,asset);}
export const expansionAsset=id=>EXPANSION_ASSETS.find(a=>a.id===id)||catalogAssets.get(id);
export function assetRegion(id){return ASSET_REGIONS[id]||ASSET_REGIONS.cinderwood;}
export function itemRecipe(id,region){const a=typeof id==='string'?expansionAsset(id):id;if(a?.category!=='item')return null;const p=assetRegion(region||a.region);if(a.runtimeAppearance)return {...a.runtimeAppearance,...region&&region!==a.region?{main:p.body,trim:p.trim,detail:p.dark,cloth:p.cloth,glow:p.glow}:{}};return {model:a.model,shapeTier:a.shapeTier,shapeStyle:a.shapeStyle,style:a.model==='coat'?'sentinel':a.model==='sword'?(a.tier?'dawn':'copper'):'frontier',main:a.armorType?['mail','plate'].includes(a.armorType)?p.metal:a.armorType==='leather'?p.wood:p.cloth:['sword','helmet','axe','spear','dagger','greatsword'].includes(a.model)?p.metal:a.model==='hammer'?p.stone:['staff','shield','bow'].includes(a.model)?p.wood:p.cloth,trim:a.signature?.trim||p.trim,detail:p.dark,glow:a.signature?.glow||p.glow,cloth:p.cloth,light:p.light,armorType:a.armorType,slot:a.slot,tier:a.tier,identity:a.tier?a.id:undefined};}
