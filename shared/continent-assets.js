// Art recipes only. No live creature spawns, item stats, loot or vendors.
const make=(id,name,category,model,region,description,extra={})=>({id,name,category,model,region,description,tags:['continent',category],license:'MIT',...extra});
export const CONTINENT_ASSETS=[
 make('tundra_mammoth','Tundra woolback','creature','mammoth','frostfell','A shaggy six-footed woolback with a long trunk and swept tusks.'),
 make('storm_wyvern','Stormsail wyvern','creature','wyvern','storm','A lean winged reptile with a forked tail and broad articulated sails.'),
 make('reef_ray','Reefglide ray','creature','ray','coral','A broad diamond-winged ray with a long tapered tail.'),
 make('dune_scorpion','Copper dune scorpion','creature','scorpion','desert','An eight-legged armored crawler with grasping claws and a raised stinging tail.'),
 make('glass_beetle','Glasscarapace beetle','creature','beetle','crystal','A plated six-legged beetle with split wing covers and curved antennae.'),
 make('root_serpent','Rootcoil serpent','creature','serpent','rainforest','A low coiled serpent with a flared head crest and a long flexible body.'),
 make('ice_elkhart','Icecrown elkhart','creature','stag','frostfell','An alpine antler silhouette for the northern route.'),
 make('fen_tortoise','Mossplate tortoise','creature','tortoise','gloamfen','A moss-toned heavy grazer for low-water paths.'),
 make('astral_moth','Orrery moth','creature','moth','astral','A pale luminous moth for impact basins and night ruins.'),
 make('ash_guardian','Kilnslag guardian','creature','guardian','emberwastes','A warm stone-and-timber elemental concept for volcanic regions.'),
 ...[
 ['skyway_skiff','Skyway skiff','skiff','cinderwood','An open-deck flight skiff with broad canvas wings and a luminous keel.'],
 ['basalt_organ','Basalt organ cluster','basalt','emberwastes','Tall hexagonal columns with uneven tops.'],
 ['reef_arch','Ribbed reef arch','reefarch','abyss','A curved reef arch with coral ribs and an open central passage.'],
 ['giant_root','Elder root buttress','rootbuttress','rainforest','A broad branching root with exposed supporting buttresses.'],
 ['glacier_shard','Glacier shelf fragment','iceshard','frostfell','An angular pale-blue ice shard with frost bands.'],
 ['spore_shelf','Pale spore shelves','sporeshelf','orchid','Three pale fungal shelves on a branching central stalk.'],
 ['orrery_ring','Broken orrery ring','orrery','astral','A bronze astronomical ring suspended between two stone stands.'],
 ['coral_fan','Branching coral fan','coralfan','coral','A radial fan of branching coral stems.'],
 ['dune_pillar','Buried clock pillar','clockpillar','desert','A half-buried clock marker with a circular metal face.']
 ].map(([id,name,model,region,text])=>make(id,name,'prop',model,region,text)),
 ...['sword','axe','hammer','staff','spear','dagger','bow','greatsword','shield','helmet','hat','coat','trousers','boots','pack','wand'].flatMap((model,i)=>['field','frontier'].map((style,j)=>make(`continental_${style}_${model}`,`${j?'Frontier':'Continental'} ${model}`,'item',model==='wand'?'staff':model,['rainforest','frostfell','emberwastes','coral','astral'][i%5],`An original ${model} study for later world authoring. No reward source is assigned.`,{tier:j?'boss':'field',signature:j?{trim:'#d8c4e7',glow:'#c9e1ed'}:undefined,slot:({shield:'offhand',helmet:'head',hat:'head',coat:'armor',trousers:'legs',boots:'feet',pack:'back'})[model]||'weapon',plannedLevels:{min:j?90:20,max:j?100:70},rarity:j?'rare':'uncommon',source:'Unassigned continental art concept'})))
];
