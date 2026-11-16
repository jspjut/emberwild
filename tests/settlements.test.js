import test from 'node:test';
import assert from 'node:assert/strict';
import {QUEST_HUBS,HUB_OBJECTIVES} from '../shared/continent-settlements.js';
import {CONTINENT_ZONES,continentAt} from '../shared/continent.js';
import {CONTINENT_BUILDINGS,CONTINENT_INNS,CONTINENT_WARDS} from '../shared/continent-buildings.js';
import {TRAVEL_NODES,FLIGHT_EDGES,flightRoute} from '../shared/travel-network.js';
import {WAYPOINTS} from '../shared/travel.js';
import {groundWalkable,settleOnSurface} from '../shared/props.js';
import {ATLAS_MAPS} from '../shared/atlas.js';
import {PROVINCE_BOUNDARIES} from '../shared/province-boundaries.js';
import {heightAt,visualHeightAt} from '../shared/terrain.js';
import {roadCrossings} from '../shared/continent-atlas.js';
import {interestedIn} from '../shared/zone-regions.js';
import {World} from '../server/world.js';

test('every later zone has 6–10 built hubs, nearby named objective grounds and 2–4 enterable inns',()=>{
 for(const zone of CONTINENT_ZONES){
  const hubs=zone.kind==='capital'?CONTINENT_WARDS.filter(h=>h.mapId===zone.id):QUEST_HUBS.filter(h=>h.mapId===zone.id),inns=CONTINENT_INNS.filter(v=>v.mapId===zone.id);
  assert.ok(hubs.length>=6&&hubs.length<=10,zone.id);assert.ok(inns.length>=2&&inns.length<=4,zone.id);
  for(const h of hubs){assert.equal(continentAt(h.x,h.z)?.id,zone.id,h.id);if(zone.kind==='capital')continue;assert.ok(groundWalkable(h.x,h.z),h.id);assert.equal(CONTINENT_BUILDINGS.filter(b=>b.hubId===h.id).length,4);const objective=HUB_OBJECTIVES.find(s=>s.hubId===h.id);assert.ok(objective?.name);assert.ok(Math.hypot(objective.x-h.x,objective.z-h.z)<=272);assert.ok(groundWalkable(objective.x,objective.z),objective.id);}
 }
});
test('each inn has a mapped return hearth and paired connected flight stop; all capitals have city badges',()=>{
 for(const inn of WAYPOINTS.filter(v=>!v.default)){const stop=TRAVEL_NODES.find(n=>n.innId===inn.id);assert.ok(stop,inn.id);assert.ok(Math.hypot(stop.x-inn.x,stop.z-inn.z)<25);assert.ok(groundWalkable(stop.x,stop.z),stop.id);assert.ok(groundWalkable(inn.x,inn.z),inn.id);assert.ok(flightRoute(inn.mapId,stop.id,[inn.mapId,stop.id]));const services=ATLAS_MAPS[inn.mapId].services;assert.ok(services.some(v=>v.id===inn.id&&v.type==='inn'));assert.ok(services.some(v=>v.id===stop.id&&v.type==='flight'));}
 assert.equal(TRAVEL_NODES.filter(n=>n.kind==='capital').length,5);assert.equal(ATLAS_MAPS.emberwild.services.filter(s=>s.type==='capital').length,5);
 assert.equal(new Set(TRAVEL_NODES.map(n=>n.id)).size,TRAVEL_NODES.length);for(const e of FLIGHT_EDGES)assert.ok(TRAVEL_NODES.some(n=>n.id===e.a)&&TRAVEL_NODES.some(n=>n.id===e.b));
});
test('unpopulated inn hearths bind only in person, recall and persist without adding NPCs',()=>{
 const world=new World(),p=world.addPlayer('Inn visitor'),inn=CONTINENT_INNS[0],original=p.waypointId;
 world.command(p,{type:'waypoint',waypointId:inn.id});assert.equal(p.waypointId,original);
 Object.assign(p,{x:inn.x,z:inn.z});delete p.y;settleOnSurface(p);p.lastCombat=-100;
 world.command(p,{type:'waypoint',waypointId:'willowcross'});assert.equal(p.waypointId,original);
 world.command(p,{type:'waypoint',waypointId:inn.id});assert.equal(p.waypointId,inn.id);
 const restored=new World().addPlayer('Inn visitor',world.save(p));assert.equal(restored.waypointId,inn.id);p.x+=40;world.travel.complete(p);assert.equal(p.x,inn.x);assert.equal(p.mapId,inn.mapId);
});
test('coastal channels and highland crevasses have visible depth beneath walkable bridges',()=>{
 const counts=Object.groupBy(PROVINCE_BOUNDARIES,b=>b.kind);assert.ok(counts.ridge.length+counts.ice.length>PROVINCE_BOUNDARIES.length/2);
 for(const kind of ['channel','crevasse']){assert.ok(counts[kind].length>=3);const crossings=CONTINENT_ZONES.flatMap(z=>roadCrossings(z.id)).filter(c=>c.kind===kind);assert.ok(crossings.length);for(const p of crossings){assert.ok(groundWalkable(p.x,p.z),p.road);assert.ok(heightAt(p.x,p.z)-visualHeightAt(p.x,p.z)>10,`${kind}: ${p.road}`);}}
});
test('the surrounding Dawnlands subscribe to actors across every founding border',()=>{
 for(const [a,b]of [[{x:600,z:-220},{x:600,z:-270}],[{x:600,z:510},{x:600,z:560}],[{x:-320,z:100},{x:-370,z:100}],[{x:1170,z:9},{x:1220,z:9}]]){assert.ok(interestedIn(a,b));assert.ok(interestedIn(b,a));}
});
