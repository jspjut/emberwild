import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTINENT_ZONES,CONTINENT_ROADS,continentAt,withinContinent} from '../shared/continent.js';
import {PROVINCE_POLYGONS,PROVINCE_BOUNDARIES,provinceRelief,nearestProvinceBoundary} from '../shared/province-boundaries.js';
import {ATLAS_MAPS,projectAtlasLocation} from '../shared/atlas.js';
import {roadCrossings} from '../shared/continent-atlas.js';
import {boundaryScenery,continentalColliders,continentRoadDistance} from '../shared/continent-geometry.js';
import {groundWalkable} from '../shared/props.js';

test('full province charts include every geographic vertex and use the same treatment as the starter and city',()=>{
 for(const zone of CONTINENT_ZONES){const map=ATLAS_MAPS[zone.id];for(const polygon of PROVINCE_POLYGONS.get(zone.id))for(const [x,z]of polygon){const p=projectAtlasLocation(zone.id,{x,z,mapId:zone.id});assert.ok(p.x>=25&&p.x<=975&&p.y>=100&&p.y<=640,`${zone.id}: ${p.x},${p.y}`);}assert.ok(map.landAreas.length);assert.ok(map.boundaries.length);assert.ok(roadCrossings(zone.id).length,`${zone.id} needs a pass`);}
 for(const id of ['cinderwood','alderhaven',...CONTINENT_ZONES.map(z=>z.id)]){const map=ATLAS_MAPS[id];assert.deepEqual(map.survey,[[25,100],[975,100],[975,640],[25,640]]);assert.deepEqual(map.unknown,[]);assert.equal(map.footer,false);assert.ok(map.landAreas.length);}
});
test('every boundary has a visible solid divide, and every road crossing remains clear',()=>{
 assert.deepEqual(new Set(PROVINCE_BOUNDARIES.map(e=>e.kind)),new Set(['ridge','roots','ice','wall','channel','crevasse']));
 for(const edge of PROVINCE_BOUNDARIES.filter(e=>!['channel','crevasse'].includes(e.kind))){let sampled=false;for(const [x,z]of edge.points){if(!withinContinent(x,z,20)||continentRoadDistance(x,z)<24)continue;const objects=boundaryScenery(Math.floor(x/100),Math.floor(z/100)).filter(o=>o.boundary===edge.id);const o=objects.find(o=>o.solid&&Math.hypot(o.x-x,o.z-z)<30);if(!o)continue;assert.ok(o.sy>=15);assert.ok(continentalColliders(o.x,o.z).some(c=>c.id===o.id));assert.equal(groundWalkable(o.x,o.z),false);if(edge.kind!=='wall'&&nearestProvinceBoundary(x,z,{naturalOnly:true})?.boundary.id===edge.id)assert.ok(provinceRelief(x,z)>20);sampled=true;break;}assert.ok(sampled,`${edge.id} has no physical divide`);}
 for(const zone of CONTINENT_ZONES)for(const point of roadCrossings(zone.id))assert.ok(groundWalkable(point.x,point.z),`${point.road} has a blocked pass`);
});
test('Alderhaven and regional charts retain all four onward roads, including cross-region connections',()=>{
 const roads=CONTINENT_ROADS.filter(r=>r.a==='alderhaven'&&r.b!=='alderhaven');assert.equal(roads.length,4);
 const city=ATLAS_MAPS.alderhaven;for(const road of roads){const zone=CONTINENT_ZONES.find(z=>z.id===road.b);assert.ok(city.labels.some(l=>l.text===zone.name));const p=projectAtlasLocation('alderhaven',{x:road.points[0][0],z:road.points[0][1],mapId:'alderhaven'});assert.ok(city.roads.some(line=>line.some(v=>Math.hypot(v[0]-p.x,v[1]-p.y)<1)));}
 assert.ok(ATLAS_MAPS.emberwild.roads.length);assert.ok(ATLAS_MAPS.dawnlands.roads.length>4);
});
