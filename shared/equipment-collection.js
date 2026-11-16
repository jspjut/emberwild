import {PROGRESSION_SETS,PROGRESSION_WEAPONS} from './equipment-tiers.js';
// Art and future-content intent. These records do not alter live loot tables.
export const ARMOR_TYPES={cloth:'Cloth',leather:'Leather',mail:'Mail',plate:'Plate'};
export const EQUIPMENT_CLASSES={dawnwarden:'Dawnwarden',arcanist:'Arcanist',pathfinder:'Pathfinder',stormcaller:'Stormcaller'};
export const EQUIPMENT_SLOTS_ART={head:'Head',shoulders:'Shoulders',armor:'Chest',hands:'Hands',waist:'Waist',legs:'Legs',feet:'Feet',back:'Back'};
const setLevels={wayfarer_cloth:[7,24],trailhide_leather:[7,24],riveted_mail:[25,49],bastion_plate:[35,59]};
const ORIGINAL_SETS=[
  {id:'wayfarer_cloth',name:'Wayfarer Weave',armorType:'cloth',region:'gloamfen',classPreference:['arcanist'],tier:'field',rarity:'uncommon',source:'Tailoring / field equipment'},
  {id:'astral_cloth',name:'Starfall Vestments',armorType:'cloth',region:'frostfell',classPreference:['arcanist'],tier:'boss',rarity:'epic',source:'Boss reward concept · The Unlit Astronomer',signature:{trim:'#bfc3e5',glow:'#b5b4ff'}},
  {id:'trailhide_leather',name:'Trailhide',armorType:'leather',region:'sunsteppe',classPreference:['pathfinder'],tier:'field',rarity:'uncommon',source:'Leatherworking / field equipment'},
  {id:'briar_leather',name:'Briarcrown',armorType:'leather',region:'cinderwood',classPreference:['pathfinder'],tier:'boss',rarity:'epic',source:'Boss reward concept · The Briar Matriarch',signature:{trim:'#c4ac70',glow:'#a8d48b'}},
  {id:'riveted_mail',name:'Rivetguard',armorType:'mail',region:'brinecoast',classPreference:['stormcaller','dawnwarden'],tier:'field',rarity:'rare',source:'Armorsmithing / field equipment'},
  {id:'tide_mail',name:'Tide Sovereign',armorType:'mail',region:'brinecoast',classPreference:['stormcaller'],tier:'boss',rarity:'epic',source:'Boss reward concept · Sovereign of the Deep',signature:{trim:'#bed6ca',glow:'#7cddd7'}},
  {id:'bastion_plate',name:'Bastion',armorType:'plate',region:'frostfell',classPreference:['dawnwarden'],tier:'field',rarity:'rare',source:'Armorsmithing / field equipment'},
  {id:'dawn_plate',name:'Dawn-Crowned',armorType:'plate',region:'emberwastes',classPreference:['dawnwarden'],tier:'boss',rarity:'epic',source:'Boss reward concept · The Crownless Sentinel',signature:{trim:'#e5ba6c',glow:'#ffe3a2'}}
].map(set=>{const [min,max]=setLevels[set.id]||[90,100];return {...set,plannedLevels:{min,max}};});
export const GEAR_SETS=[...ORIGINAL_SETS,...PROGRESSION_SETS];
const pieceNames={cloth:{head:'Hood',shoulders:'Mantle',armor:'Robe',hands:'Handwraps',waist:'Sash',legs:'Legwraps',feet:'Slippers',back:'Drape'},leather:{head:'Cowl',shoulders:'Spaulders',armor:'Jerkin',hands:'Gloves',waist:'Belt',legs:'Legguards',feet:'Boots',back:'Travel cloak'},mail:{head:'Coif',shoulders:'Pauldrons',armor:'Hauberk',hands:'Grips',waist:'Chain belt',legs:'Chausses',feet:'Sabatons',back:'Shoulder cape'},plate:{head:'Helm',shoulders:'Pauldrons',armor:'Cuirass',hands:'Gauntlets',waist:'Warbelt',legs:'Greaves',feet:'Warboots',back:'Warcloak'}};
export const ARMOR_ASSETS=GEAR_SETS.flatMap(set=>Object.keys(EQUIPMENT_SLOTS_ART).map(slot=>({id:`${set.id}_${slot}`,name:`${set.name} ${pieceNames[set.armorType][slot]}`,category:'item',model:'armor',region:set.region,description:`${set.shapeTier?`Level ${set.plannedLevels.min}–${set.plannedLevels.max} ${set.shapeStyle}`:set.tier==='boss'?'Ceremonial reward':'Practical field'} ${ARMOR_TYPES[set.armorType].toLowerCase()} ${pieceNames[set.armorType][slot].toLowerCase()}. ${set.tier==='boss'?'A distinct silhouette, raised ornament and restrained signature light.':'Layered construction and readable material details.'}`,tags:['armor',set.armorType,set.tier,set.rarity,EQUIPMENT_SLOTS_ART[slot].toLowerCase(),set.name.toLowerCase()],license:'MIT',slot,setId:set.id,armorType:set.armorType,shapeTier:set.shapeTier,shapeStyle:set.shapeStyle,tier:set.tier,rarity:set.rarity,plannedLevels:set.plannedLevels,classPreference:set.classPreference,source:set.source,signature:set.signature})));
const weapon=(id,name,model,region,rarity,source,description,extra={})=>({id,name,category:'item',model,region,description,tags:['weapon',rarity,'reward',...extra.allowedClasses||[]],license:'MIT',slot:'weapon',tier:rarity==='rare'?'rare':'boss',rarity,plannedLevels:rarity==='legendary'?{min:100,max:100}:rarity==='epic'?{min:90,max:100}:{min:35,max:59},source,...extra});
export const REWARD_WEAPONS=[
 ...PROGRESSION_WEAPONS,
  weapon('dawnward_oathblade','Dawnward Oathblade','sword','emberwastes','legendary','Boss reward concept · The Crownless Sentinel','A sun-edged blade with a winged guard and a captured dawnstone.',{allowedClasses:['dawnwarden'],signature:{trim:'#e5ba6c',glow:'#ffe3a2'}}),
  weapon('cometspire','Cometspire','staff','frostfell','epic','Boss reward concept · The Unlit Astronomer','An orbital staff with an open armillary crown and suspended star.',{allowedClasses:['arcanist'],handedness:2,signature:{trim:'#c5c8ea',glow:'#b5b4ff'}}),
  weapon('briarstring','Briarstring','bow','cinderwood','epic','Boss reward concept · The Briar Matriarch','A living bow with branched limbs, leaf accents and an amber grip.',{allowedClasses:['pathfinder'],handedness:2,signature:{trim:'#c4ac70',glow:'#b0d78e'}}),
  weapon('tempest_piercer','Tempest Piercer','spear','brinecoast','epic','Boss reward concept · Sovereign of the Deep','A long forked spear with sweeping fins and a tideglass collar.',{classPreference:['stormcaller'],handedness:2}),
  weapon('hollowguard','Hollowguard','shield','gloamfen','epic','Endgame boss concept · Elder Hollow Warden','A thorn-rimmed shield with a luminous seedheart boss.',{slot:'offhand',classPreference:['dawnwarden']}),
  weapon('glacier_maul','Glacier Maul','hammer','frostfell','rare','Rare world-drop concept · highland guardians','A heavy fractured-ice maul bound by dark metal.',{handedness:2}),
  weapon('nightglass','Nightglass','dagger','gloamfen','rare','Extremely rare world-drop concept · twilight creatures','A short curved mineral blade with a divided crescent guard.',{classPreference:['pathfinder']}),
  weapon('sunken_axe','Drowned Mariner’s Axe','axe','brinecoast','rare','Rare cache concept · coastal wrecks','A broad sea-worn axe with a scalloped cutting head and metal inlays.'),
  weapon('eclipse_edge','Eclipse Edge','greatsword','emberwastes','legendary','Extremely rare world-drop concept · ancient sentinels','An oversized split-tip blade with an eclipsed core and a heavy crossguard.',{handedness:2}),
  weapon('oracle_focus','Oracle’s Tideglass','focus','brinecoast','epic','Boss reward concept · Sovereign of the Deep','An off-hand prism floating within a small gilt cage.',{slot:'offhand',classPreference:['arcanist','stormcaller']})
];
export const gearSet=id=>GEAR_SETS.find(s=>s.id===id);
export const gearSetItems=id=>ARMOR_ASSETS.filter(a=>a.setId===id).map(a=>a.id);
export function equipmentUsage(item,classId='dawnwarden'){
  const allowed=!item?.allowedClasses?.length||item.allowedClasses.includes(classId),preferred=!!item?.classPreference?.includes(classId);
  return {allowed,preferred,mode:item?.allowedClasses?.length?'restricted':item?.classPreference?.length?'preference':'open',classes:item?.allowedClasses||item?.classPreference||[]};
}
