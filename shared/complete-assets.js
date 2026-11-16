import {EXPANSION_ASSETS as DESIGNS,registerCatalogAssets} from './asset-library.js';
import {ITEMS} from './content.js';
export {ASSET_REGIONS,ASSET_CATEGORIES,expansionAsset,assetRegion,itemRecipe} from './asset-library.js';
// Include every appearance used by live equipment as well as curated art.
// This module is a client/authoring index; server content never imports it.
const gameItems=Object.entries(ITEMS).filter(([,item])=>item.appearance&&!item.templateOnly).map(([id,item])=>({id:`game_${id}`,sourceItemId:id,name:`Game · ${item.name}`,category:'item',model:item.appearance.model,slot:item.slot,armorType:item.armorType,region:id.includes('arcanist')?'frostfell':id.includes('pathfinder')?'sunsteppe':id.includes('stormcaller')?'brinecoast':'cinderwood',runtimeAppearance:item.appearance,description:item.description||'Equipment used by Emberwild characters and residents.',tags:['game equipment',id,item.slot,item.armorType||''],license:'MIT',rarity:item.quality,plannedLevels:{min:item.minLevel||1,max:10},allowedClasses:item.allowedClasses,source:'Existing game equipment · original appearance retained'}));
registerCatalogAssets(gameItems);
export const EXPANSION_ASSETS=[...DESIGNS,...gameItems];
export const ASSET_COUNTS={designs:EXPANSION_ASSETS.length,creatures:EXPANSION_ASSETS.filter(a=>a.category==='creature').length,equipment:EXPANSION_ASSETS.filter(a=>a.category==='item').length,gameEquipment:gameItems.length};
