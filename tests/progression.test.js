import test from 'node:test';import assert from 'node:assert/strict';
import {PLANNED_LEVEL_CAP,LIVE_LEVEL_CAP,RARITIES,RARITY_ORDER,LEVELING_BANDS,levelingBand,rarityFitsPlannedLevel} from '../shared/progression.js';
import {ITEMS,QUESTS,MERCHANT_STOCK,ENEMY_TYPES,ENEMY_SPAWNS,RESOURCE_TYPES,LEVEL_XP,levelForXP} from '../shared/content.js';
import {EXPANSION_ASSETS} from '../shared/asset-library.js';
import {GEAR_SETS} from '../shared/equipment-collection.js';
import {World} from '../server/world.js';

test('starter acquisition paths stay within white/green, with white early rewards and green capstones',()=>{
  const obtainable=new Set(['training_blade','linen_coat','potion',...MERCHANT_STOCK,...QUESTS.flatMap(q=>[q.reward,q.dropItem]).filter(Boolean),...ENEMY_SPAWNS.map(e=>ENEMY_TYPES[e.type].loot).filter(Boolean),...Object.values(RESOURCE_TYPES).map(r=>r.item)]);
  for(const id of obtainable){assert.ok(ITEMS[id],id);assert.ok(RARITIES[ITEMS[id].quality].rank<=RARITIES.uncommon.rank,`${id} exceeds starter ceiling`);}
  for(const id of['training_blade','linen_coat','copper_blade','trail_satchel','trail_charm'])assert.equal(ITEMS[id].quality,'common');
  for(const id of['bark_coat','dawn_blade','sentinel_coat','ranger_pack'])assert.equal(ITEMS[id].quality,'uncommon');
});
test('retagging preserves starter power, armor, currency, bag size and saved item ownership',()=>{
  assert.deepEqual(['copper_blade','trail_charm','bark_coat','dawn_blade','sentinel_coat'].map(id=>ITEMS[id].sell),[8,8,8,18,18]);
  assert.equal(ITEMS.copper_blade.power,4);assert.equal(ITEMS.dawn_blade.power,10);assert.equal(ITEMS.sentinel_coat.armor,4);assert.equal(ITEMS.trail_charm.vitality,15);assert.equal(ITEMS.ranger_pack.price,42);assert.equal(ITEMS.ranger_pack.bagSlots,12);
  const w=new World(),p=w.addPlayer('Keeper');p.inventory.dawn_blade=1;p.inventory.sentinel_coat=1;p.equipment.weapon='dawn_blade';p.equipment.armor='sentinel_coat';const save=w.save(p),restored=new World().addPlayer('Keeper',save);assert.deepEqual(restored.inventory,p.inventory);assert.deepEqual(restored.equipment,p.equipment);
  assert.notEqual(ITEMS.dawn_blade.appearance.style,'dawn');
});
test('six rarity tiers reserve later rewards without extending the live level cap or creating gold items',()=>{
  assert.equal(PLANNED_LEVEL_CAP,100);assert.equal(LIVE_LEVEL_CAP,10);assert.equal(LEVEL_XP.length-1,LIVE_LEVEL_CAP);assert.equal(levelForXP(1e9),10);
  assert.deepEqual(RARITY_ORDER,['common','uncommon','rare','epic','legendary','unique']);assert.deepEqual(RARITY_ORDER.map(id=>RARITIES[id].colorName),['white','green','blue','purple','orange','gold']);assert.equal(new Set(RARITY_ORDER.map(id=>RARITIES[id].color)).size,6);
  for(let level=1;level<=100;level++)assert.equal(LEVELING_BANDS.filter(b=>level>=b.min&&level<=b.max).length,1);
  for(const[id,before,first]of[['uncommon',2,3],['rare',24,25],['epic',59,60],['legendary',99,100],['unique',99,100]]){assert.equal(rarityFitsPlannedLevel(id,before),false);assert.equal(rarityFitsPlannedLevel(id,first),true);}
  assert.equal(levelingBand(101),null);assert.equal(rarityFitsPlannedLevel('unknown',100),false);assert.ok(!EXPANSION_ASSETS.some(a=>a.rarity==='unique'));
});
test('future asset and set ranges follow the rarity plan and never imply starter boss epics',()=>{
  for(const item of [...EXPANSION_ASSETS.filter(a=>a.rarity),...GEAR_SETS]){assert.ok(item.plannedLevels,`${item.id} needs a planned range`);const {min,max}=item.plannedLevels;assert.ok(min<=max&&max<=100);assert.ok(rarityFitsPlannedLevel(item.rarity,min),item.id);assert.ok(rarityFitsPlannedLevel(item.rarity,max),item.id);}
  assert.match(EXPANSION_ASSETS.find(a=>a.id==='hollowguard').source,/Endgame.*Elder/);
});
