import test from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../server/world.js';
import { ITEMS, NPCS, GATHERABLES, inventoryCapacity, bagEntries, canAddItem } from '../shared/content.js';
import { trackingSettings, trackingMarkers, questOverlays, TRACKING_OPTIONS } from '../client/minimap.js';
const at=(p,o)=>{p.x=o.x;p.z=o.z;};
const run=(w,seconds)=>{for(let t=0;t<seconds;t+=.05)w.step(.05);};

test('four bag slots expand storage, exclude equipped copies, and persist without duplicating ownership',()=>{
  const w=new World(),p=w.addPlayer('Bags');assert.equal(inventoryCapacity(p),20);assert.deepEqual(p.bags,[null,null,null,null]);
  p.level=25;p.inventory.ranger_pack=4;
  for(let index=0;index<4;index++)w.command(p,{type:'equipBag',item:'ranger_pack',index});
  assert.equal(inventoryCapacity(p),68);assert.equal(p.inventory.ranger_pack,4);assert.equal(bagEntries(p).filter(v=>v.id==='ranger_pack').length,0);
  w.command(p,{type:'equipBag',item:'ranger_pack',index:0});assert.equal(inventoryCapacity(p),68);
  const loaded=new World().addPlayer(p.name,JSON.parse(JSON.stringify(w.save(p))));assert.deepEqual(loaded.bags,p.bags);assert.equal(inventoryCapacity(loaded),68);assert.equal(loaded.inventory.ranger_pack,4);
  const old=w.save(p);delete old.bags;const migrated=new World().addPlayer(p.name,old);assert.equal(inventoryCapacity(migrated),20);assert.equal(bagEntries(migrated).filter(v=>v.id==='ranger_pack').length,4);
});
test('removing or shrinking bags never loses items; unused storage can be safely repacked',()=>{
  const w=new World(),p=w.addPlayer('Packed');p.level=25;p.inventory.ranger_pack=1;p.inventory.linen_pouch=1;w.command(p,{type:'equipBag',item:'ranger_pack',index:0});
  p.inventory.resin=99*27;const before=structuredClone(p.inventory);
  w.command(p,{type:'equipBag',item:'linen_pouch',index:0});assert.equal(p.bags[0],'ranger_pack');assert.deepEqual(p.inventory,before);
  w.command(p,{type:'unequipBag',index:0});assert.equal(p.bags[0],'ranger_pack');assert.equal(inventoryCapacity(p),32);
  assert.equal(canAddItem(p,'copper_ore'),true);
  p.inventory.resin=99*17;w.command(p,{type:'unequipBag',index:0});assert.equal(p.bags[0],null);assert.equal(inventoryCapacity(p),20);assert.equal(bagEntries(p).length,20);assert.equal(canAddItem(p,'copper_ore'),false);
  w.command(p,{type:'equipBag',item:'linen_pouch',index:0});assert.equal(inventoryCapacity(p),26);assert.equal(canAddItem(p,'copper_ore'),true);
});
test('bag commands validate ownership and slots, and merchants cannot sell equipped bags',()=>{
  const w=new World(),p=w.addPlayer('Trading',{xp:500});at(p,NPCS[1]);p.gold=100;
  for(const index of[-1,4,1.5,'0'])w.command(p,{type:'equipBag',item:'trail_satchel',index});assert.equal(inventoryCapacity(p),20);
  w.command(p,{type:'trade',action:'buy',item:'trail_satchel'});assert.equal(p.gold,82);assert.equal(p.inventory.trail_satchel,1);
  w.command(p,{type:'equipBag',item:'trail_satchel'});assert.equal(p.bags[0],'trail_satchel');
  w.command(p,{type:'trade',action:'sellItem',item:'trail_satchel',all:true});assert.equal(p.inventory.trail_satchel,1);assert.equal(p.gold,82);
  p.inventory.trail_satchel++;w.command(p,{type:'trade',action:'sellItem',item:'trail_satchel',all:true});assert.equal(p.inventory.trail_satchel,1);assert.equal(p.gold,86);
  p.inventory.linen_pouch=1;w.command(p,{type:'trade',action:'sell'});assert.equal(p.inventory.linen_pouch,1);
  w.command(p,{type:'trade',action:'buy',item:'training_blade'});assert.equal(p.inventory.training_blade,1);
});
test('herbs and ore can be gathered outside quests, have personal cooldowns, and retain cooldowns through saves',()=>{
  const w=new World(),p=w.addPlayer('Miner'),other=w.addPlayer('Other'),ore=GATHERABLES.find(g=>g.type==='ore');
  at(p,ore);at(other,ore);w.command(p,{type:'interact',id:ore.id});run(w,1.05);assert.equal(p.inventory.copper_ore,1);
  w.command(p,{type:'interact',id:ore.id});run(w,1.05);assert.equal(p.inventory.copper_ore,1);
  w.command(other,{type:'interact',id:ore.id});run(w,1.05);assert.equal(other.inventory.copper_ore,1);
  const snapshot=w.snapshot(p).self;assert.ok(snapshot.harvestCooldowns[ore.id]>0);
  const restored=new World().addPlayer(p.name,JSON.parse(JSON.stringify(w.save(p))));assert.ok(restored.harvestReady[ore.id]>0);
  run(w,60.1);w.command(p,{type:'interact',id:ore.id});run(w,1.05);assert.equal(p.inventory.copper_ore,2);
});
test('full bags prevent resource rewards and quest credit; repeated herb harvests do not duplicate distinct-node progress',()=>{
  const w=new World(),p=w.addPlayer('Herbalist'),herbs=GATHERABLES.filter(g=>g.type==='herb');p.quests.herbs={status:'active',progress:0,gathered:[]};
  p.inventory.resin=99*19;p.inventory.potion=99;at(p,herbs[0]);w.command(p,{type:'interact',id:herbs[0].id});run(w,1.05);assert.equal(p.inventory.sunmint,undefined);assert.equal(p.quests.herbs.progress,0);
  delete p.inventory.resin;w.command(p,{type:'interact',id:herbs[0].id});run(w,1.05);assert.equal(p.inventory.sunmint,1);assert.equal(p.quests.herbs.progress,1);
  run(w,45.1);w.command(p,{type:'interact',id:herbs[0].id});run(w,1.05);assert.equal(p.inventory.sunmint,2);assert.equal(p.quests.herbs.progress,1);
  at(p,herbs[1]);w.command(p,{type:'interact',id:herbs[1].id});run(w,1.05);assert.equal(p.quests.herbs.progress,2);
});
test('tracking filters independently control quest givers, actual services, resources, and depleted nodes',()=>{
  const w=new World(),p=w.addPlayer('Map');const defaults=trackingSettings();
  assert.ok(trackingMarkers(p,defaults).some(m=>m.id==='npc:elowen'));
  assert.ok(trackingMarkers(p,defaults).some(m=>m.id==='npc:sera'));
  assert.ok(trackingMarkers(p,defaults).some(m=>m.id==='npc:orin'));
  assert.ok(!trackingMarkers(p,defaults).some(m=>m.kind==='herbs'||m.kind==='mining'));
  const off=Object.fromEntries(TRACKING_OPTIONS.map(([id])=>[id,false]));assert.equal(trackingMarkers(p,off).length,0);
  assert.deepEqual(trackingMarkers(p,{...off,trainers:true}).map(m=>m.npcId),['orin','mentor-dawnwarden','mentor-arcanist','mentor-pathfinder','mentor-stormcaller']);
  assert.deepEqual(trackingMarkers(p,{...off,inns:true}).map(m=>m.npcId),['sera','town-healer','alder-gate-keeper','alder-market-keeper','alder-garden-keeper']);
  const resources=trackingMarkers(p,{...off,herbs:true,mining:true});assert.equal(resources.filter(m=>m.kind==='herbs').length,4);assert.equal(resources.filter(m=>m.kind==='mining').length,3);
  p.harvestCooldowns={ore0:30};assert.ok(!trackingMarkers(p,{...off,mining:true}).some(m=>m.id==='object:ore0'));
  assert.equal(trackingSettings({herbs:'true',mining:true,unknown:true}).herbs,false);assert.equal(trackingSettings({mining:true}).mining,true);
});
test('quest overlays share stable tracker numbers, mark remaining targets and personal quest corpses, and return to the right NPC',()=>{
  const w=new World(),p=w.addPlayer('Quests');p.quests={meadow:{status:'active',progress:0,gathered:[]},herbs:{status:'active',progress:1,gathered:['herb0']},seeds:{status:'active',progress:0,gathered:[]}};p.trackedQuest='herbs';
  let overlays=questOverlays(p,w.snapshot(p).enemies);assert.deepEqual(overlays.map(q=>q.number),[1,2,3]);assert.equal(overlays.find(q=>q.id==='herbs').selected,true);assert.ok(!overlays.find(q=>q.id==='herbs').points.some(g=>g.id==='herb0'));
  const e=w.enemies[0];at(p,e);w.hit(p,e,999);overlays=questOverlays(p,w.snapshot(p).enemies);assert.equal(overlays.find(q=>q.id==='seeds').target.id,e.id);
  w.command(p,{type:'loot',id:e.id,slot:'seeds'});overlays=questOverlays(p,w.snapshot(p).enemies);assert.notEqual(overlays.find(q=>q.id==='seeds').target.id,e.id);
  p.quests.meadow.progress=6;const ready=questOverlays(p,w.snapshot(p).enemies).find(q=>q.id==='meadow');assert.equal(ready.ready,true);assert.equal(ready.target.id,'elowen');
  p.quests.class_mercy={status:'active',progress:0,gathered:[]};assert.equal(questOverlays(p,w.snapshot(p).enemies).find(q=>q.id==='class_mercy').target.self,true);
});
