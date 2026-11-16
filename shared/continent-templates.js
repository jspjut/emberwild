import {ARMOR_ASSETS,REWARD_WEAPONS} from './equipment-collection.js';
import {ECOLOGY_ENEMY_TEMPLATES} from './creature-ecology.js';
import {CONTINENT_ASSETS} from './continent-assets.js';
import {itemRecipe} from './asset-library.js';
// Dormant definitions make pre-shipped art selectable by additive live bundles.
// Nothing here is spawned, sold, granted or balanced as a progression reward.
export const CONTINENT_ENEMY_TEMPLATES={...ECOLOGY_ENEMY_TEMPLATES,...Object.fromEntries(CONTINENT_ASSETS.filter(a=>a.category==='creature').map(a=>[a.id,{name:a.name,assetId:a.id,assetRegion:a.region,hp:55,damage:4,speed:3,xp:0,gold:0,respawn:30,level:1,aggro:0,templateOnly:true}]))};
export const CONTINENT_ITEM_TEMPLATES=Object.fromEntries([...CONTINENT_ASSETS.filter(a=>a.category==='item'),...ARMOR_ASSETS.filter(a=>a.shapeTier),...REWARD_WEAPONS.filter(a=>a.shapeTier)].map(a=>[a.id,{name:a.name,description:a.description,slot:a.slot,appearance:itemRecipe(a.id),quality:a.shapeTier?a.rarity:'common',power:0,armor:0,sell:0,minLevel:a.plannedLevels.min,templateOnly:true}]));
