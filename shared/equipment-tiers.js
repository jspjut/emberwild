// Shape progression is independent of biome/palette. No drops or stats are added.
export const EQUIPMENT_BANDS=Array.from({length:10},(_,i)=>({id:i+1,min:i*10+1,max:i*10+10,label:`${i*10+1}–${i*10+10}`}));
const names={
 cloth:['Hearthlinen','Wayfarer Poncho','Scribe’s Wrap','Windreader','Archive Keeper','Rain Cantor','Skyweave','Moonfold','Star Scholar','Dawn Hierophant'],
 leather:['Trailpatch','Hedgerow Scout','Briar Duelist','Ridge Tracker','Woolmantle','Farroad Duster','Scalehide','Night Prowler','Thorn Warden','Wildcrown'],
 mail:['Linked Pilgrim','River Scale','March Brigand','Gate Hauberk','Iron Lamellar','Quarry Sentinel','Storm Harness','Reefguard','Witness Mail','Tempest Sovereign'],
 plate:['Road Soldier','Ridge Cuirass','Oathplate','March Harness','Gateguard','Fluted Sentinel','Winged Bastion','Sunward Fauld','Rune Keeper','Crownforged']
};
const shapes=['plain fitted layers','broad rounded panels','split angular panels','crossed and swept forms','deep layered hems','segmented raised bands','flared articulated forms','asymmetric split forms','radial engraved frames','open crown and wing forms'];
const regions=['cinderwood','sunsteppe','brinecoast','redrock','rainforest','frostfell','storm','gloamfen','astral','emberwastes'];
const rarity=min=>min<3?'common':min<25?'uncommon':min<60?'rare':'epic';
const roles={cloth:['arcanist'],leather:['pathfinder'],mail:['stormcaller'],plate:['dawnwarden']};
export const PROGRESSION_SETS=Object.entries(names).flatMap(([armorType,rows])=>rows.map((name,i)=>({id:`tier${String(i+1).padStart(2,'0')}_${armorType}`,name,armorType,shapeTier:i+1,shapeStyle:shapes[i],region:regions[i],classPreference:roles[armorType],tier:'progression',rarity:rarity(EQUIPMENT_BANDS[i].min),plannedLevels:{min:EQUIPMENT_BANDS[i].min,max:EQUIPMENT_BANDS[i].max},source:`Level ${EQUIPMENT_BANDS[i].label} appearance study · acquisition unassigned`})));
export const WEAPON_FAMILIES=['sword','axe','hammer','staff','spear','dagger','bow','greatsword','shield','focus','wand'];
const weaponNames=['Trail','Leaf','Hook','Crescent','Split','Fluted','Wing','Fork','Crystal','Crown'];
export const PROGRESSION_WEAPONS=WEAPON_FAMILIES.flatMap(model=>EQUIPMENT_BANDS.map((band,i)=>({id:`tier${String(band.id).padStart(2,'0')}_${model}`,name:`${weaponNames[i]} ${model}`,category:'item',model,region:regions[i],description:`A distinct level ${band.label} ${model} silhouette. ${shapes[i]}; biome recolors preserve the shape.`,shapeTier:band.id,shapeStyle:shapes[i],tags:['weapon',model,'progression',`tier ${band.id}`,`levels ${band.label}`],license:'MIT',slot:['shield','focus'].includes(model)?'offhand':'weapon',tier:'progression',rarity:rarity(band.min),plannedLevels:{min:band.min,max:band.max},classPreference:({sword:['dawnwarden'],greatsword:['dawnwarden'],shield:['dawnwarden'],bow:['pathfinder'],dagger:['pathfinder'],staff:['arcanist','stormcaller'],wand:['arcanist'],focus:['arcanist','stormcaller'],hammer:['stormcaller','dawnwarden']})[model]||[],source:`Level ${band.label} appearance study · acquisition unassigned`})));
