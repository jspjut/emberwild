import test from 'node:test';
import assert from 'node:assert/strict';
import {ECOLOGY_ASSETS,ZONE_ECOLOGY,ECOLOGY_ENEMY_TEMPLATES} from '../shared/creature-ecology.js';
import {CONTINENT_ZONES} from '../shared/continent.js';
import {EXPANSION_ASSETS} from '../shared/asset-library.js';
import {ENEMY_TYPES,ENEMY_SPAWNS} from '../shared/content.js';
import {prepareLivePatch} from '../shared/live-content.js';

test('every zone and capital has five different creature body types and a compact population plan',()=>{
 assert.deepEqual(Object.keys(ZONE_ECOLOGY).sort(),['cinderwood','alderhaven',...CONTINENT_ZONES.map(z=>z.id)].sort());
 assert.equal(ECOLOGY_ASSETS.length,188);assert.equal(new Set(ECOLOGY_ASSETS.map(a=>a.id)).size,188);assert.equal(new Set(ECOLOGY_ASSETS.map(a=>a.name)).size,188);
 assert.equal(EXPANSION_ASSETS.filter(a=>a.category==='creature').length,208);assert.equal(new Set(EXPANSION_ASSETS.filter(a=>a.category==='creature').map(a=>a.model)).size,32);
 for(const zone of Object.values(ZONE_ECOLOGY)){
  assert.ok(zone.backstory.length>100,zone.id);assert.equal(zone.roster.length,5);assert.equal(new Set(zone.roster.map(r=>r.type)).size,5);assert.equal(zone.roster.reduce((n,r)=>n+r.count,0),zone.population);assert.ok(zone.population>=15&&zone.population<=25);
  const species=zone.roster.map(r=>ECOLOGY_ASSETS.find(a=>a.id===r.type));assert.equal(new Set(species.map(a=>a.model)).size,5,zone.id);
  for(const [i,animal] of species.entries()){assert.ok(animal.adaptation&&animal.role&&animal.description);assert.equal(ENEMY_TYPES[animal.id].assetId,animal.id);assert.ok(Number.isInteger(zone.roster[i].count)&&zone.roster[i].count>0);}
  if(zone.habitat==='urban')assert.ok(zone.roster.every(r=>r.disposition==='peaceful'));
 }
});
test('dormant species clone through additive live updates without placing creatures or changing starter encounters',()=>{
 const original=JSON.stringify(ENEMY_SPAWNS);assert.equal(ENEMY_SPAWNS.length,78);
 const source=ZONE_ECOLOGY.stormcrown.roster[2].type;
 const patch=prepareLivePatch({id:'ecology-template-check',worldId:'emberwild',enemyTypes:{future_meridian_eagle:{template:source,values:{name:'Meridian patrol eagle',hp:1200,damage:60,level:100,aggro:6}}}});
 assert.equal(patch.additions.enemyTypes.future_meridian_eagle.assetId,source);assert.equal(patch.additions.enemyTypes.future_meridian_eagle.level,100);assert.deepEqual(patch.additions.spawns,[]);assert.equal(JSON.stringify(ENEMY_SPAWNS),original);assert.equal(ENEMY_TYPES.future_meridian_eagle,undefined);
 for(const id of Object.keys(ECOLOGY_ENEMY_TEMPLATES)){assert.equal(ENEMY_TYPES[id].templateOnly,true);assert.equal(ENEMY_TYPES[id].xp,0);assert.equal(ENEMY_TYPES[id].aggro,0);assert.ok(!ENEMY_SPAWNS.some(s=>s.type===id));}
});
