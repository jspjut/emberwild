import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {NPCRoutines} from '../server/npc-routines.js';
import {CITY_ROUTINES,CITY_WALKERS} from '../shared/city-routines.js';
import {CAPITAL_BUILDINGS} from '../shared/capital.js';
import {heightAt,terrainSlope} from '../shared/terrain.js';
import {ARRIVAL_REGION} from '../shared/zone-regions.js';
import {ROUTES} from '../shared/world-layouts.js';
import {bodyFits,settleOnSurface,supportBelow} from '../shared/props.js';
import {LAYOUT_REVISION} from '../shared/zone-layout.js';
const at=(p,n)=>{Object.assign(p,{x:n.x,z:n.z,input:{x:0,z:0}});delete p.y;settleOnSurface(p);};
test('five city actors complete purposeful patrol, school and merchant circuits using actual collision and pauses',()=>{
 const w={time:0,npcs:CITY_WALKERS.map(n=>({...n,hp:180}))},system=new NPCRoutines(w),visited=new Map(w.npcs.map(n=>[n.id,new Set()])),travel=new Map(w.npcs.map(n=>[n.id,0]));
 for(let tick=0;tick<6500;tick++){w.time+=.1;const old=w.npcs.map(n=>({x:n.x,z:n.z}));system.step(.1);for(const [i,n]of w.npcs.entries()){visited.get(n.id).add(n.routeIndex);travel.set(n.id,travel.get(n.id)+Math.hypot(old[i].x-n.x,old[i].z-n.z));assert.ok(bodyFits(n.x,n.z,n.y),n.id);assert.ok(Math.abs(n.y-heightAt(n.x,n.z))<.04,n.id);}}
 for(const n of w.npcs){assert.equal(visited.get(n.id).size,CITY_ROUTINES[n.routineId].stops.length,`${n.id} cannot finish route at ${n.x},${n.z} step ${n.routeIndex}`);assert.ok(travel.get(n.id)>100,n.id);}
});
test('speaking and trading pause a moving merchant at its live position, not its authored spawn',()=>{
 const w=new World(),p=w.addPlayer('Customer',{gold:1000,x:620,z:145,layoutRevision:LAYOUT_REVISION}),n=w.npcs.find(n=>n.id==='city-peddler');for(let i=0;i<300;i++)w.step(.1);assert.ok(Math.hypot(n.x-CITY_WALKERS.at(-1).x,n.z-CITY_WALKERS.at(-1).z)>8);at(p,{x:n.x,z:n.z+2});w.command(p,{type:'interact',id:n.id});const x=n.x,z=n.z;for(let i=0;i<30;i++)w.step(.1);assert.equal(n.x,x);assert.equal(n.z,z);const before=p.gold;w.command(p,{type:'trade',action:'buy',item:'potion'});assert.ok(p.gold<before);at(p,CITY_WALKERS.at(-1));const gold=p.gold;w.command(p,{type:'trade',action:'buy',item:'potion'});assert.equal(p.gold,gold,'old spawn is not a shop');
});
test('civic heights, archive and gardens rise above low quays while buildings retain level usable floors',()=>{
 assert.ok(heightAt(837,34)-heightAt(1045,9)>12);assert.ok(heightAt(814,303)>5);assert.ok(heightAt(665,-142)>5);
 for(const b of CAPITAL_BUILDINGS)for(const [dx,dz]of [[0,0],[b.width*.4,0],[0,b.depth*.4]])assert.ok(Math.abs(heightAt(b.x+dx,b.z+dz)-b.floorY)<1e-6,b.id);
 // All authored streets remain climbable, rather than hiding level changes at a door.
 for(const route of ROUTES.filter(r=>r[0][0]>280))for(let j=1;j<route.length;j++){const[a,b]=[route[j-1],route[j]],n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1]));for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n,s=terrainSlope(x,z);assert.ok(Math.hypot(s.x,s.z)<.9,`street grade ${x},${z}: ${Math.hypot(s.x,s.z)}`);}}
});
test('arrival blends continuously and a saved city character loads onto the raised floor without losing state',()=>{
 let previous=heightAt(275,142);for(let x=275.05;x<451;x+=.05){const next=heightAt(x,142);assert.ok(Math.abs(next-previous)<.05,`arrival step ${x}`);previous=next;}
 const w=new World(),p=w.addPlayer('Returning',{x:837,z:-54,y:.2,layoutRevision:LAYOUT_REVISION,xp:9800,inventory:{potion:7},quests:{five_roads:{status:'complete',progress:1,gathered:[]}}});assert.equal(p.x,837);assert.equal(p.y,heightAt(p.x,p.z));assert.equal(p.inventory.potion,7);assert.equal(p.quests.five_roads.status,'complete');
});

test('unobserved city circuits sleep and advance offscreen before their first subscribed frame; the shared patrol keeps moving',()=>{
 const w=new World(),p=w.addPlayer('In the Reach'),vendor=w.npcs.find(n=>n.id==='city-peddler'),patrol=w.npcs.find(n=>n.id==='city-patrol-gate');for(let i=0;i<1000;i++)w.step(.1);assert.ok(vendor.suspendedAt!=null);assert.equal(patrol.suspendedAt,undefined);const old={x:vendor.x,z:vendor.z};
 const city=w.addPlayer('City arrival',{x:620,z:145,layoutRevision:LAYOUT_REVISION});const frame=w.snapshot(city);assert.equal(vendor.suspendedAt,null);assert.ok(Math.hypot(vendor.x-old.x,vendor.z-old.z)>5);assert.ok(frame.npcs.some(n=>n.id===vendor.id&&n.x===vendor.x));assert.ok(bodyFits(vendor.x,vendor.z,vendor.y));
});
