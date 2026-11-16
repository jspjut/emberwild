import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTINENT_ZONES,LEVELING_ZONES,FRONTIER_ZONES,NEW_CAPITALS,CONTINENT_ROADS,CONTINENT_SITES} from '../shared/continent.js';
import {CONTINENT_BUILDINGS,CONTINENT_CITY_ROADS} from '../shared/continent-buildings.js';
import {heightAt,NPCS,QUESTS} from '../shared/content.js';
import {withinZone,zoneAt,LAYOUT_REVISION} from '../shared/zone-layout.js';
import {settleOnSurface,groundWalkable,bodyFits,nearbyColliders,overlaps} from '../shared/props.js';
import {advanceMotion} from '../shared/movement.js';
import {entrancePoint,buildingAt} from '../shared/buildings.js';
import {World} from '../server/world.js';
import {TRAVEL_NODES,flightRoute} from '../shared/travel-network.js';
import {ATLAS_MAPS,projectAtlasLocation,atlasHit} from '../shared/atlas.js';

test('all 52 maps are allocated, all four paths span levels 11–100, and frontiers have independent geography',()=>{
 assert.equal(CONTINENT_ZONES.length,50);assert.equal(LEVELING_ZONES.length,36);assert.equal(NEW_CAPITALS.length,4);assert.equal(FRONTIER_ZONES.length,10);assert.equal(NPCS.length,60);assert.equal(QUESTS.length,80);
 for(const node of TRAVEL_NODES)assert.ok(groundWalkable(node.x,node.z),node.id);
 assert.equal(new Set(FRONTIER_ZONES.map(z=>z.form)).size,10);assert.equal(new Set(CONTINENT_ZONES.map(z=>z.identity)).size,50);
 for(let band=0;band<9;band++)for(let route=0;route<4;route++){const z=LEVELING_ZONES.find(z=>z.band===band&&z.route===route);assert.equal(z.minLevel,11+band*10);assert.equal(z.maxLevel,20+band*10);if(route<3)assert.ok(CONTINENT_ROADS.some(e=>[e.a,e.b].includes(z.id)&&[e.a,e.b].includes(LEVELING_ZONES.find(n=>n.route===route+1&&n.band===band).id)));}
 for(const zone of CONTINENT_ZONES){assert.ok(withinZone(zone.x,zone.z));assert.equal(zoneAt(zone.x,zone.z),zone.id);assert.ok(groundWalkable(zone.x,zone.z),zone.id);assert.ok(ATLAS_MAPS[zone.id]);const parent=ATLAS_MAPS[zone.id].parent,p=projectAtlasLocation(parent,{x:zone.x,z:zone.z});assert.equal(atlasHit(parent,p.x,p.y)?.id,zone.id);}
});
test('every continental road and city street stays on walkable, connected static ground',()=>{
 for(const road of [...CONTINENT_ROADS,...CONTINENT_CITY_ROADS])for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/5));let previous=null;
  for(let j=0;j<=steps;j++){const t=j/steps,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;assert.ok(withinZone(x,z),`outside: ${road.a} -> ${road.b} at ${x},${z}`);assert.ok(groundWalkable(x,z),`blocked: ${road.a} -> ${road.b} at ${x},${z}: ${nearbyColliders(x,z).filter(c=>overlaps(x,z,c)).map(c=>c.id).join()} `);const y=heightAt(x,z);assert.ok(Number.isFinite(y));if(previous)assert.ok(Math.abs(y-previous.y)<6,`road grade: ${road.a} -> ${road.b} at ${x},${z}: ${previous.y} to ${y}`);previous={y};}
 }
});
test('new city and wayhouse entrances use shared collision and have an unobstructed central aisle',()=>{
 for(const b of CONTINENT_BUILDINGS){const start=entrancePoint(b,2),p={...start};delete p.y;settleOnSurface(p);assert.ok(bodyFits(p.x,p.z,p.y),b.id);const dx=b.x-start.x,dz=b.z-start.z,length=Math.hypot(dx,dz),steps=Math.round(length/(6.5/60));for(let i=0;i<steps;i++)advanceMotion(p,{x:dx/length,z:dz/length});assert.equal(buildingAt(p.x,p.z)?.id,b.id);assert.ok(Math.hypot(p.x-b.x,p.z-b.z)<.2,b.id);assert.ok(Math.abs(p.y-b.floorY)<.01,`${b.id}: ${p.y} vs ${b.floorY} at ${p.x},${p.z}`);}
});
const place=(p,node)=>{Object.assign(p,{x:node.x,z:node.z,input:{x:0,z:0},auto:false});delete p.y;settleOnSurface(p);};
test('travel requires physical discovery, rejects remote and combat use, flies without granting en-route unlocks, and persists safely',()=>{
 const w=new World(),p=w.addPlayer('Survey Traveler'),a=TRAVEL_NODES.find(n=>n.id==='alderhaven'),b=TRAVEL_NODES.find(n=>n.id==='hazelwash');
 w.command(p,{type:'travel',from:a.id,to:b.id,mode:'flight'});assert.equal(p.transit,null);place(p,a);w.step(.05);assert.ok(p.travelUnlocks.includes(a.id));w.command(p,{type:'travel',from:a.id,to:b.id,mode:'flight'});assert.equal(p.transit,null);
 place(p,b);w.step(.05);assert.ok(p.travelUnlocks.includes(b.id));place(p,a);p.lastCombat=w.time;w.command(p,{type:'travel',from:a.id,to:b.id,mode:'flight'});assert.equal(p.transit,null);p.lastCombat=-100;w.command(p,{type:'travel',from:a.id,to:b.id,mode:'flight'});assert.ok(p.transit);const unlocks=[...p.travelUnlocks];
 const before=p.x;w.command(p,{type:'input',x:1,z:0});assert.equal(p.input.x,0);w.step(.1);assert.notEqual(p.x,before);assert.ok(p.y>heightAt(p.x,p.z));assert.equal(w.snapshot(p).self.mapId,zoneAt(p.x,p.z));
 const saved=w.save(p);assert.equal(saved.x,a.x);assert.equal(saved.z,a.z);assert.equal(saved.transit,undefined);const restored=new World().addPlayer(p.name,saved);assert.deepEqual(restored.travelUnlocks,unlocks);assert.equal(restored.transit,null);assert.equal(restored.x,a.x);
 while(p.transit)w.step(.1);assert.equal(p.x,b.x);assert.equal(p.z,b.z);assert.equal(p.grounded,true);assert.deepEqual(p.travelUnlocks,unlocks);assert.ok(flightRoute(a.id,b.id,unlocks));assert.equal(flightRoute(a.id,'skybreak',unlocks),null);
});
test('capital portals require prior visits to both cities and never grant remote unlocks',()=>{
 const w=new World(),p=w.addPlayer('Portal Walker'),a=TRAVEL_NODES.find(n=>n.id==='alderhaven'),b=TRAVEL_NODES.find(n=>n.id==='sylvarin');place(p,a);w.step(.05);w.command(p,{type:'travel',from:a.id,to:b.id,mode:'portal'});assert.equal(p.x,a.x);place(p,b);w.step(.05);place(p,a);w.command(p,{type:'travel',from:a.id,to:b.id,mode:'portal'});assert.equal(p.x,b.x);assert.equal(p.mapId,b.mapId);const saved=w.save(p),restored=new World().addPlayer(p.name,saved);assert.equal(restored.x,b.x);assert.equal(restored.layoutRevision,LAYOUT_REVISION);assert.deepEqual(restored.travelUnlocks,p.travelUnlocks);
});

test('live content can populate a new frontier using pre-shipped creature/item art and the correct map scope',async()=>{
 const {prepareLivePatch}=await import('../shared/live-content.js'),site=CONTINENT_SITES.find(s=>s.id==='stormcrown-grounds');
 const plan=prepareLivePatch({id:'frontier-validation-only',worldId:'emberwild',items:{survey_axe:{template:'continental_field_axe',values:{name:'Survey axe',minLevel:10,power:8}}},enemyTypes:{survey_woolback:{template:'tundra_mammoth',values:{name:'Survey woolback',hp:180,loot:'survey_axe'}}},npcs:[{id:'survey_neighbor',template:'rowan',x:site.x+5,z:site.z,values:{name:'Future neighbor'}}],spawns:[{id:'survey-woolback',type:'survey_woolback',x:site.x,z:site.z}]});
 assert.equal(plan.additions.enemyTypes.survey_woolback.assetId,'tundra_mammoth');assert.equal(plan.additions.items.survey_axe.appearance.model,'axe');assert.equal(plan.additions.npcs[0].mapId,'stormcrown');assert.equal(plan.additions.spawns.length,1);assert.equal(NPCS.length,60,'validation does not populate the world');
});

test('GM explorers retain all routes and may explore remotely; ordinary characters cannot request the same privilege',()=>{
 const w=new World(),normal=w.addPlayer('Normal Walker'),gm=w.addPlayer('GM Walker',{gameMaster:true}),destination=TRAVEL_NODES.find(n=>n.id==='stormcrown');assert.equal(gm.travelUnlocks.length,TRAVEL_NODES.length);const original={x:normal.x,z:normal.z};w.command(normal,{type:'gmTravel',to:destination.id,gameMaster:true});assert.equal(normal.x,original.x);assert.equal(normal.z,original.z);
 w.command(gm,{type:'gmTravel',to:destination.id});assert.equal(gm.x,destination.x);assert.equal(gm.mapId,'stormcrown');assert.equal(gm.grounded,true);const restored=new World().addPlayer(gm.name,w.save(gm));assert.equal(restored.gameMaster,true);assert.equal(restored.travelUnlocks.length,TRAVEL_NODES.length);
});

test('nearby actors remain subscribed on both sides of the curved continental borders',async()=>{
 const {regionAt,interestedIn}=await import('../shared/zone-regions.js');let crossings=0;
 for(let x=1500;x<14500;x+=350)for(let z=-12000;z<12500;z+=350)for(const [dx,dz]of [[70,0],[0,70]]){const a={x,z},b={x:x+dx,z:z+dz};if(!withinZone(a.x,a.z)||!withinZone(b.x,b.z)||regionAt(a.x,a.z)===regionAt(b.x,b.z))continue;assert.equal(interestedIn(a,b),true);assert.equal(interestedIn(b,a),true);crossings++;}assert.ok(crossings>30);
});
