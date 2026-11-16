import test from 'node:test';import assert from 'node:assert/strict';
import {BUILDINGS,BUILDING_COLLIDERS,CHARACTER_RADIUS,WALL_THICKNESS,wallParts,buildingAt,entrancePoint,circleHitsBox,segmentHitsBox} from '../shared/buildings.js';
import {walkable,heightAt} from '../shared/content.js';import {advanceMotion,MOVE_STEP} from '../shared/movement.js';import {World} from '../server/world.js';import {MovementPredictor} from '../client/netcode.js';
const direction={north:{x:0,z:1},south:{x:0,z:-1},east:{x:-1,z:0},west:{x:1,z:0}};
test('all buildings have open entrances, tall interiors, flat floors and a clear central aisle',()=>{
 assert.ok(BUILDINGS.length>=36);
 for(const b of BUILDINGS){assert.ok(b.wallHeight>=5.8);assert.ok(b.doorHeight>2.25+1.5);assert.ok(b.doorWidth>=2.8);const start=entrancePoint(b,2),v=direction[b.doorSide],pose={...start,facing:0,jumpHeight:0,jumpVelocity:0};
  assert.ok(walkable(start.x,start.z));const steps=Math.round(Math.hypot(start.x-b.x,start.z-b.z)/(6.5*MOVE_STEP));
  for(let i=0;i<steps;i++){advanceMotion(pose,{...v,jump:i===10});assert.ok(walkable(pose.x,pose.z));assert.ok(Math.abs(heightAt(pose.x,pose.z)-heightAt(b.x,b.z))<.01);}
  assert.equal(buildingAt(pose.x,pose.z)?.id,b.id);assert.ok(Math.hypot(pose.x-b.x,pose.z-b.z)<.15);
  for(let i=0;i<steps;i++)advanceMotion(pose,{x:-v.x,z:-v.z});assert.ok(Math.hypot(pose.x-start.x,pose.z-start.z)<1e-7);
 }
});
test('walls and furniture block actors while door clearances account for character radius',()=>{
 for(const b of BUILDINGS){
  for(const part of wallParts(b).filter(part=>part.solid))assert.equal(walkable(b.x+part.x,b.z+part.z),false);
  for(const p of b.furniture)assert.equal(walkable(b.x+p.x,b.z+p.z),false);
  const door=entrancePoint(b,0);assert.ok(walkable(door.x,door.z));const horizontal=['north','south'].includes(b.doorSide);
  assert.ok(walkable(door.x+(horizontal?b.doorWidth/2-CHARACTER_RADIUS-.02:0),door.z+(horizontal?0:b.doorWidth/2-CHARACTER_RADIUS-.02)));
  assert.equal(walkable(door.x+(horizontal?b.doorWidth/2-CHARACTER_RADIUS+.04:0),door.z+(horizontal?0:b.doorWidth/2-CHARACTER_RADIUS+.04)),false);
 }
});
test('jumping and diagonal movement cannot tunnel through solid wall segments',()=>{
 const b=BUILDINGS[0],pose={x:b.x+b.width/2+1,z:b.z,facing:0,jumpHeight:0,jumpVelocity:0};
 for(let i=0;i<50;i++)advanceMotion(pose,{x:-1,z:0,jump:i%45===0});assert.ok(pose.x>=b.x+b.width/2+WALL_THICKNESS/2+CHARACTER_RADIUS);assert.ok(walkable(pose.x,pose.z));
 const diagonal={x:b.x+b.width/2+1,z:b.z-b.depth/2-1,facing:0,jumpHeight:0,jumpVelocity:0};
 for(let i=0;i<50;i++){advanceMotion(diagonal,{x:-Math.SQRT1_2,z:Math.SQRT1_2});assert.ok(walkable(diagonal.x,diagonal.z));}assert.equal(buildingAt(diagonal.x,diagonal.z),null);
 const corner=BUILDING_COLLIDERS.find(c=>c.building==='lodge'&&c.type==='wall');assert.equal(circleHitsBox(corner.minX,corner.minZ,corner),true);assert.equal(circleHitsBox(corner.minX-.4,corner.minZ-.4,corner),false);
});
test('the server and predicting client agree on delayed entry and exit through every door',()=>{
 for(const b of BUILDINGS.filter(b=>!b.continent)){const w=new World(),p=w.addPlayer('Door'),start=entrancePoint(b,2),v=direction[b.doorSide];Object.assign(p,start);const client=new MovementPredictor();client.reconcile(w.snapshot(p).self,0);const deliveries=[],snapshots=[];let maxError=0,entered=false;
  for(let tick=1;tick<=300;tick++){const time=tick*MOVE_STEP,now=time*1000,input=time<1? v:time<2?{x:0,z:0}:time<3?{x:-v.x,z:-v.z}:{x:0,z:0};client.advance(MOVE_STEP,input.x,input.z,now);if(tick%3===0)client.flush(message=>deliveries.push({at:time+.15,message}));while(deliveries[0]?.at<=time)w.command(p,deliveries.shift().message);if(tick%3===0)w.step(.05);if(tick%6===0)snapshots.push({at:time+.15,self:structuredClone(w.snapshot(p).self)});while(snapshots[0]?.at<=time)client.reconcile(snapshots.shift().self,now);if(buildingAt(client.pose.x,client.pose.z)?.id===b.id)entered=true;if(time>4)maxError=Math.max(maxError,Math.hypot(client.pose.x-p.x,client.pose.z-p.z));}
  assert.ok(entered);assert.ok(maxError<1e-7);assert.ok(walkable(p.x,p.z));assert.ok(Math.hypot(p.x-start.x,p.z-start.z)<.15);
 }
});
test('characters saved inside a room resume there with their equipment and inventory',()=>{
 for(const b of BUILDINGS.filter(b=>!b.continent)){const w=new World(),p=w.addPlayer('Interior');p.x=b.x;p.z=b.z;const saved=w.save(p),loaded=new World().addPlayer(p.name,structuredClone(saved));assert.equal(loaded.x,b.x);assert.equal(loaded.z,b.z);assert.deepEqual(loaded.inventory,p.inventory);assert.deepEqual(loaded.equipment,p.equipment);}
});
test('camera cutaway checks use the finite 3D segment and distinguish overhead or distant walls',()=>{
 const box={minX:-1,maxX:1,minY:0,maxY:6,minZ:-1,maxZ:1};assert.equal(segmentHitsBox({x:0,y:1,z:-4},{x:0,y:3,z:4},box),true);assert.equal(segmentHitsBox({x:0,y:8,z:-4},{x:0,y:9,z:4},box),false);assert.equal(segmentHitsBox({x:0,y:1,z:-4},{x:0,y:1,z:-2},box),false);assert.equal(segmentHitsBox({x:0,y:1,z:0},{x:0,y:1,z:0},box),true);assert.equal(segmentHitsBox({x:4,y:1,z:0},{x:4,y:1,z:0},box),false);
});
