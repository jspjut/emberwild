import {LAYOUT_REVISION} from '../shared/zone-layout.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceMotion,MOVE_STEP} from '../shared/movement.js';
import {WORLD_COLLIDERS,CHARACTER_HEIGHT,bodyFits,supportBelow,colliderTop,RUIN_STEPS,CAMP_TABLE,FENCE_LINES} from '../shared/props.js';
import {heightAt} from '../shared/terrain.js';
import {World} from '../server/world.js';
import {MovementPredictor,SnapshotInterpolator} from '../client/netcode.js';
const run=(p,frames,input)=>{for(let i=0;i<frames;i++)advanceMotion(p,typeof input==='function'?input(i):input);};
const pose=(x,z)=>({x,z,facing:0,jumpHeight:0,jumpVelocity:0});
test('a table blocks walking, supports landing and another jump, and walking off falls without snapping or air jumping',()=>{
  const p=pose(CAMP_TABLE.x-3,CAMP_TABLE.z);run(p,60,{x:1,z:0});assert.ok(p.x<=CAMP_TABLE.x-1.8+1e-6);assert.equal(p.grounded,true);
  run(p,90,i=>({x:p.x<CAMP_TABLE.x?1:0,z:0,jump:i===0}));assert.equal(p.supportId,'market-table');assert.equal(p.jumpHeight,0);assert.ok(Math.abs(p.y-1.35)<1e-8);
  const top=p.y;advanceMotion(p,{x:0,z:0,jump:true});assert.ok(p.y>top);assert.equal(p.grounded,false);const velocity=p.jumpVelocity;advanceMotion(p,{x:0,z:0,jump:true});assert.ok(p.jumpVelocity<velocity,'airborne input cannot restart a jump');run(p,90,{x:0,z:0});assert.equal(p.y,top);
  let edge;for(let i=0;i<60;i++){advanceMotion(p,{x:0,z:1});if(!p.grounded&&!edge)edge={...p};}
  assert.ok(edge.y>heightAt(edge.x,edge.z)+1,'leaving an edge preserves height');assert.equal(p.grounded,true);assert.equal(p.y,heightAt(p.x,p.z));
});
test('fence rails block movement, can be jumped over or balanced on, and follow their sloped visible beam',()=>{
  const fence=FENCE_LINES[1],p=pose(fence.x-1.5,fence.startZ+fence.spacing/2);run(p,60,{x:1,z:0});assert.ok(p.x<fence.x-.35);
  run(p,90,i=>({x:p.x<fence.x?1:0,z:0,jump:i===0}));assert.equal(p.supportId,`fence:${fence.x}:rail-0`);const rail=WORLD_COLLIDERS.find(c=>c.id===p.supportId);assert.ok(Math.abs(p.y-colliderTop(rail,p.x,p.z))<1e-8);
  run(p,7,{x:0,z:.5});assert.equal(p.grounded,true);assert.ok(Math.abs(p.y-colliderTop(rail,p.x,p.z))<1e-8);
  run(p,90,i=>({x:p.x<fence.x+2?1:0,z:0,jump:i===0}));assert.ok(p.x>fence.x+1.9);assert.equal(p.grounded,true);assert.equal(p.supportId,'terrain');
  const post=pose(fence.x-1.5,fence.startZ);run(post,120,i=>({x:1,z:0,jump:i%60===0}));assert.ok(post.x<fence.x-.4,'a ground jump cannot clear a taller fence post');
});
test('small stairs are walkable, tall sides block, and low ceilings stop upward movement',()=>{
  const p=pose(RUIN_STEPS[0].x,RUIN_STEPS[0].z+.9);run(p,42,{x:0,z:-1});assert.equal(p.grounded,true);assert.equal(p.supportId,RUIN_STEPS.at(-1).id);
  const ceiling=WORLD_COLLIDERS.find(c=>c.id==='lodge:ceiling'),under={...pose(WORLD_COLLIDERS.find(c=>c.id==='lodge:ceiling').minX+4,WORLD_COLLIDERS.find(c=>c.id==='lodge:ceiling').minZ+3.5),y:ceiling.minY-CHARACTER_HEIGHT-.08,grounded:false,jumpVelocity:7.5,jumpHeight:3};
  run(under,15,{x:0,z:0});assert.ok(under.y+CHARACTER_HEIGHT<=ceiling.minY+1e-6);assert.ok(under.jumpVelocity<0);
  for(const dt of [1/60,.05,.1]){const side=pose(CAMP_TABLE.x-3,CAMP_TABLE.z);for(let i=0;i<100;i++)advanceMotion(side,{x:1,z:1/100},dt);assert.ok(side.x<=CAMP_TABLE.x-1.8+1e-6);}
});
test('tables, counters, beds and crates persist as support surfaces; casting on them works and death/respawn settle correctly',()=>{
  for(const id of ['market-table','lodge:table','lodge:bed-west','workshop:west-counter','workshop:back-crates:1','cache1']){
    const c=WORLD_COLLIDERS.find(c=>c.id===id),x=(c.minX+c.maxX)/2,z=(c.minZ+c.maxZ)/2,w=new World(),p=w.addPlayer('Perched',{x,z,y:c.maxY,xp:180,layoutRevision:LAYOUT_REVISION});
    assert.equal(p.supportId,id);assert.ok(bodyFits(x,z,p.y));const saved=w.save(p),restored=new World().addPlayer(p.name,structuredClone(saved));assert.equal(restored.y,p.y);assert.equal(restored.supportId,id);
    w.command(p,{type:'skill',skill:'mend'});assert.ok(p.casting);w.hurt(p,10000,'test');assert.equal(p.y,c.maxY);assert.equal(p.grounded,true);w.step(.1);w.respawn(p);assert.equal(p.y,heightAt(p.x,p.z));assert.equal(p.supportId,'terrain');
  }
});
test('table jumps reconcile exactly under 300 ms latency and replicate absolute standing height to peers',()=>{
  const w=new World(),p=w.addPlayer('Predicted table',{x:7,z:27}),peer=w.addPlayer('Observer'),client=new MovementPredictor();client.reconcile(w.snapshot(p).self,0);
  const deliveries=[],snapshots=[];let stood=false;
  for(let tick=1;tick<=300;tick++){
    const time=tick*MOVE_STEP,now=time*1000;if(tick===1)client.jump();client.advance(MOVE_STEP,time<.6?1:0,0,now);if(client.pose.supportId==='market-table')stood=true;
    if(tick%3===0)client.flush(message=>deliveries.push({at:time+.15,message}));while(deliveries[0]?.at<=time)w.command(p,deliveries.shift().message);
    if(tick%3===0)w.step(.05);if(tick%6===0)snapshots.push({at:time+.15,self:structuredClone(w.snapshot(p).self)});while(snapshots[0]?.at<=time)client.reconcile(snapshots.shift().self,now);
  }
  assert.ok(stood);assert.equal(p.supportId,'market-table');assert.ok(Math.abs(client.pose.y-p.y)<1e-8);assert.ok(Math.abs(client.pose.x-p.x)<1e-8);
  const snapshot=w.snapshot(peer),remote=snapshot.players.find(v=>v.id===p.id);assert.equal(remote.y,p.y);assert.equal(remote.jumpHeight,0);assert.equal(remote.grounded,true);
  const timeline=new SnapshotInterpolator();timeline.push(snapshot);assert.equal(timeline.sample(p.id,snapshot.time).y,p.y);
});
