import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {ZONE,NPCS,QUESTS,GATHERABLES,ENEMY_TYPES,SKILLS,LEVEL_XP,walkable} from '../shared/content.js';
import {INTRO_SCALE,INTRO_AREA,REGIONAL_AREA,ZONE_BOUNDS,INTRO_BOUNDS,SPAWN,LAYOUT_REVISION,introPoint,ZONE_EXITS} from '../shared/zone-layout.js';
import {OUTPOSTS,ROUTES,EXPANSION_BUILDINGS} from '../shared/world-layouts.js';
import {advanceMotion} from '../shared/movement.js';
import {settleOnSurface,bodyFits,supportBelow,lineOfSight} from '../shared/props.js';
import {heightAt} from '../shared/terrain.js';
import {WAYPOINTS,RECALL_COOLDOWN} from '../shared/travel.js';
import {learnedSkill} from '../shared/adventurers.js';
import {questOverlays} from '../client/minimap.js';
const at=(p,o)=>{Object.assign(p,{x:o.x,z:o.z,input:{x:0,z:0},latestMove:{x:0,z:0}});delete p.y;settleOnSurface(p);};
const run=(w,t)=>{for(let i=0;i<t-1e-8;i+=.05)w.step(.05);};
test('refined area has the requested ratios, one town, six widely separated hubs and open future connections',()=>{
 assert.ok(Math.abs(INTRO_SCALE**2-2)<1e-12);assert.equal(Math.round(INTRO_AREA),37120);assert.equal(REGIONAL_AREA/INTRO_AREA,8);assert.ok(Math.abs((ZONE_BOUNDS.maxX-ZONE_BOUNDS.minX)*(ZONE_BOUNDS.maxZ-ZONE_BOUNDS.minZ)/INTRO_AREA-9)<1e-12);
 assert.equal(OUTPOSTS.length,6);assert.equal(new Set(OUTPOSTS.map(o=>o.name)).size,6);for(const [i,a]of OUTPOSTS.entries())for(const b of OUTPOSTS.slice(i+1))assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>115);
 assert.ok(EXPANSION_BUILDINGS.filter(b=>b.id.startsWith('town-')||b.id.startsWith('council')).length>=11);assert.ok(QUESTS.some(q=>q.id==='reedwatch_boss'));assert.equal(QUESTS.filter(q=>!q.classId||q.classId==='dawnwarden').length,74);
 for(const e of ZONE_EXITS){assert.ok(walkable(e.x,e.z),e.id);assert.ok(ROUTES.some(route=>route.at(-1)[0]===e.x&&route.at(-1)[1]===e.z));}assert.equal(ZONE_EXITS.filter(e=>e.next).length,1);
 for(const n of NPCS)assert.ok(walkable(n.x,n.z),n.id);for(const g of GATHERABLES){const p=supportBelow(g.x,g.z);assert.ok(bodyFits(g.x,g.z,p.y),g.id);}
});
test('authored road segments can be traversed using the actual player step and collision rules',()=>{
 for(const [index,route]of ROUTES.entries())for(let j=1;j<route.length;j++){const a=route[j-1],b=route[j],p={x:a[0],z:a[1],facing:0,jumpHeight:0,jumpVelocity:0};p.y=supportBelow(p.x,p.z).y;settleOnSurface(p);const distance=Math.hypot(b[0]-p.x,b[1]-p.z),steps=Math.ceil(distance/6.5*60)+20;
  for(let i=0;i<steps&&Math.hypot(b[0]-p.x,b[1]-p.z)>.11;i++){const d=Math.hypot(b[0]-p.x,b[1]-p.z);advanceMotion(p,{x:(b[0]-p.x)/d,z:(b[1]-p.z)/d});}
  assert.ok(Math.hypot(b[0]-p.x,b[1]-p.z)<.12,`Road ${index} segment ${j}: blocked at ${p.x},${p.z}`);
 }
});
test('wide objective regions contain their objectives and utility training points to the first regional camp',()=>{
 const w=new World(),p=w.addPlayer('Surveyor',{classId:'pathfinder',xp:LEVEL_XP[9]});
 for(const id of ['human_keepsakes','human_trouble','pathfinder_ward'])p.quests[id]={status:'active',progress:0,gathered:[]};
 const overlays=questOverlays(p,w.snapshot(p).enemies);
 for(const q of overlays)for(const point of q.points)assert.ok(Math.hypot(point.x-q.area.x,point.z-q.area.z)+3<=q.area.radius,`${q.id}: objective outside marked region`);
 const training=overlays.find(q=>q.id==='pathfinder_ward');assert.ok(training.points.every(point=>point.type==='roadbandit'));assert.ok(overlays.find(q=>q.id==='human_trouble').area.radius>65);
});
test('legacy positions migrate once without wiping identity, quests, inventory or bindings',()=>{
 const old={id:'preserved',name:'Returning',x:-13,z:28,xp:1500,inventory:{training_blade:1,linen_coat:1,potion:7},equipment:{weapon:'training_blade',armor:'linen_coat'},quests:{welcome:{status:'complete',progress:1,gathered:[]}},reputation:{hearthstead:100},emotes:['dance'],bank:{resin:7}};
 const w=new World(),p=w.addPlayer(old.name,old),position=introPoint(old.x,old.z);assert.equal(p.x,position.x);assert.equal(p.z,position.z);assert.equal(p.id,old.id);assert.deepEqual(p.quests,old.quests);assert.equal(p.inventory.potion,7);assert.equal(p.reputation.hearthstead,100);assert.equal(p.bank.resin,7);assert.equal(p.waypointId,'hearthstead');const saved=w.save(p),again=new World().addPlayer(p.name,saved);assert.equal(saved.layoutRevision,LAYOUT_REVISION);assert.equal(again.x,p.x);assert.equal(again.z,p.z);
});
test('all classes know the return skill at level one; the default point is precisely the initial spawn',()=>{
 for(const classId of ['dawnwarden','arcanist','pathfinder','stormcaller']){const w=new World(),p=w.addPlayer('Traveler',{classId});assert.ok(learnedSkill(p,'recall'));assert.equal(SKILLS.recall.cooldown,900);assert.equal(p.waypointId,'hearthstead');assert.deepEqual({x:WAYPOINTS[0].x,z:WAYPOINTS[0].z},SPAWN);assert.equal(w.save(p).waypointId,'hearthstead');}
 assert.ok(WAYPOINTS.filter(w=>w.mapId==='alderhaven'&&w.available).length>=3);
});
test('inn waypoint binding is explicit, requires visiting Merrin, rejects remote/future points and retains cooldown',()=>{
 const w=new World(),p=w.addPlayer('Binder'),npc=NPCS.find(n=>n.id==='town-healer');w.command(p,{type:'waypoint',npcId:npc.id});assert.equal(p.waypointId,'hearthstead');at(p,npc);w.command(p,{type:'interact',id:npc.id});assert.equal(p.waypointId,'hearthstead','resting does not silently bind the return ability');
 p.cooldowns.recall=w.time+600;w.command(p,{type:'waypoint',npcId:npc.id});assert.equal(p.waypointId,'willowcross');assert.equal(p.cooldowns.recall,w.time+600);w.command(p,{type:'waypoint',npcId:'alderhaven-market'});assert.equal(p.waypointId,'willowcross');const restored=new World().addPlayer(p.name,w.save(p));assert.equal(restored.waypointId,'willowcross');assert.ok(restored.cooldowns.recall>599);
});
test('return casts predictably, teleports to safe inn ground, clears old motion and starts a 15-minute cooldown',()=>{
 const w=new World(),p=w.addPlayer('Returner');p.waypointId='willowcross';w.command(p,{type:'skill',skill:'recall',requestId:1});assert.equal(p.casting.skill,'recall');assert.equal(p.globalCooldown,null);assert.equal(p.cooldowns.recall,undefined);const epoch=p.motionEpoch;run(w,8.1);const point=WAYPOINTS.find(v=>v.id==='willowcross');assert.equal(p.x,point.x);assert.equal(p.z,point.z);assert.equal(p.y,heightAt(point.x,point.z));assert.ok(bodyFits(p.x,p.z,p.y));assert.equal(p.motionEpoch,epoch+1);assert.equal(p.casting,null);assert.ok(p.cooldowns.recall-w.time>899);const atReturn={x:p.x,z:p.z};w.command(p,{type:'skill',skill:'recall',requestId:2});assert.equal(p.casting,null);assert.deepEqual({x:p.x,z:p.z},atReturn);
});
test('movement, jumping, damage and cancellation interrupt a return without spending its cooldown; combat blocks it',()=>{
 for(const action of [{type:'input',x:1,z:0},{type:'jump'},{type:'cancelCast',requestId:1},'damage']){const w=new World(),p=w.addPlayer('Interrupt');w.command(p,{type:'skill',skill:'recall',requestId:1});assert.ok(p.casting);if(action==='damage')w.hurt(p,1,'test');else w.command(p,action);assert.equal(p.casting,null);assert.equal(p.cooldowns.recall,undefined);}
 const w=new World(),p=w.addPlayer('Combat');p.lastCombat=w.time;w.command(p,{type:'skill',skill:'recall',requestId:1});assert.equal(p.casting,null);assert.equal(p.cooldowns.recall,undefined);
});
test('return cooldown survives saves and elapsed offline time, and unknown waypoint IDs cannot teleport outside the zone',()=>{
 const w=new World(),p=w.addPlayer('Saved');p.cooldowns.recall=900;const saved=w.save(p);assert.ok(saved.recallReadyAt>Date.now()+899000);const restored=new World().addPlayer(p.name,{...saved,recallReadyAt:Date.now()+125000});assert.ok(restored.cooldowns.recall>124&&restored.cooldowns.recall<=125);const expired=new World().addPlayer(p.name,{...saved,recallReadyAt:Date.now()-1000,waypointId:'unknown-future-point'});assert.equal(expired.cooldowns.recall,undefined);assert.equal(expired.waypointId,'hearthstead');
});
