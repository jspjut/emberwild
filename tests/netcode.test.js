import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILDINGS, WALL_THICKNESS, CHARACTER_RADIUS } from '../shared/buildings.js';
import { World } from '../server/world.js';
import { MovementPredictor, SnapshotInterpolator, NetworkClock, CastPresentation } from '../client/netcode.js';
import { MOVE_STEP, advanceMotion, motionPose, MAX_MOVE_QUEUE } from '../shared/movement.js';
import { SKILLS, walkable } from '../shared/content.js';
import { MAP_RADII, clampZoom, mapView, mapPoint, edgePoint } from '../client/minimap.js';

const run=(w,seconds)=>{for(let t=0;t<seconds;t+=.05)w.step(.05);};
test('local prediction responds before a round trip, reconciles delayed commands, and converges after stopping',()=>{
  const w=new World(),p=w.addPlayer('Predicted'),client=new MovementPredictor();client.reconcile(w.snapshot(p).self,0);
  const deliveries=[],snapshots=[];let firstVisual=null,maxError=0;
  const expected=motionPose(p),delay=.12;
  for(let tick=1;tick<=210;tick++){
    const time=tick*MOVE_STEP,now=time*1000,input=time<1?{x:1,z:0}:time<1.6?{x:0,z:-1}:{x:0,z:0};
    advanceMotion(expected,input);client.advance(MOVE_STEP,input.x,input.z,now);
    if(tick===1){firstVisual=client.visual().x;assert.equal(p.x,0,'server has not received movement yet');}
    if(tick%3===0)client.flush(message=>deliveries.push({at:time+delay,message}));
    while(deliveries[0]?.at<=time)w.command(p,deliveries.shift().message);
    if(tick%3===0)w.step(.05);
    if(tick%6===0)snapshots.push({at:time+delay,self:structuredClone(w.snapshot(p).self)});
    while(snapshots[0]?.at<=time)client.reconcile(snapshots.shift().self,now);
    maxError=Math.max(maxError,Math.hypot(client.pose.x-expected.x,client.pose.z-expected.z));
  }
  assert.ok(firstVisual>.1);assert.ok(maxError<1e-7,`prediction/replay error ${maxError}`);
  assert.ok(Math.hypot(client.pose.x-p.x,client.pose.z-p.z)<1e-7);
  assert.ok(client.pending.length<25,'acknowledged history stays bounded');
});
test('sequenced movement shares collision rules and cannot exceed server time budget or accept invalid streams',()=>{
  const w=new World(),p=w.addPlayer('Bounded');p.x=-6;p.z=37;
  let seq=0;for(let i=0;i<50;i++)w.command(p,{type:'move',epoch:0,commands:Array.from({length:6},()=>({seq:++seq,x:-999,z:0}))});
  assert.ok(p.moveQueue.length<=MAX_MOVE_QUEUE);w.step(.05);assert.ok(Math.abs(p.x+6)<=.326);
  run(w,2);assert.ok(walkable(p.x,p.z));assert.ok(p.x>=BUILDINGS[0].x+BUILDINGS[0].width/2+WALL_THICKNESS/2+CHARACTER_RADIUS-1e-8,'the rendered exterior wall blocks the player');
  const last=p.lastQueuedSeq;
  w.command(p,{type:'move',epoch:0,commands:[{seq:last+2,x:1,z:0}]});assert.equal(p.lastQueuedSeq,last);
  w.command(p,{type:'move',epoch:0,commands:[{seq:last+1,x:Infinity,z:0}]});assert.equal(p.lastQueuedSeq,last);
  w.command(p,{type:'input',x:1,z:0});assert.equal(p.input.x,0,'legacy inputs cannot override sequenced movement');
  const oldEpoch=p.motionEpoch;w.respawn(p);w.command(p,{type:'move',epoch:oldEpoch,commands:[{seq:1,x:1,z:0}]});assert.equal(p.moveQueue.length,0);
});
test('jump prediction replays exactly and teleport/death epochs discard stale pending input',()=>{
  const w=new World(),p=w.addPlayer('Jump'),client=new MovementPredictor();client.reconcile(w.snapshot(p).self,0);client.jump();
  client.advance(MOVE_STEP,0,0,16.7);assert.ok(client.visual().jumpHeight>0);assert.equal(p.jumpHeight,0);
  client.flush(msg=>w.command(p,msg));w.step(MOVE_STEP);client.reconcile(w.snapshot(p).self,20);assert.ok(Math.abs(client.pose.jumpHeight-p.jumpHeight)<1e-8);
  client.advance(MOVE_STEP,1,0,40);w.respawn(p);client.reconcile(w.snapshot(p).self,50);assert.equal(client.pending.length,0);assert.equal(client.pose.x,p.x);assert.equal(client.pose.jumpHeight,0);
});
test('predicted travel is consistent at different render frame rates',()=>{
  const start={x:0,z:32,hp:120,motionEpoch:0,lastInputSeq:0};
  const slow=new MovementPredictor(),fast=new MovementPredictor();slow.reconcile(start,0);fast.reconcile(start,0);
  for(let i=1;i<=10;i++)slow.advance(.1,1,0,i*100);
  for(let i=1;i<=60;i++)fast.advance(1/60,1,0,i*1000/60);
  assert.ok(Math.abs(slow.pose.x-fast.pose.x)<1e-8);assert.ok(Math.abs(slow.pose.x-6.5)<1e-8);
});
test('remote snapshots interpolate position/angle and bound extrapolation during jitter',()=>{
  const buffer=new SnapshotInterpolator(.1);for(const [time,x,facing]of[[0,0,3.1],[.1,1,-3.1],[.2,2,-3]])buffer.push({time,players:[{id:'a',x,z:0,facing}],enemies:[]});
  assert.ok(Math.abs(buffer.sample('a',.25).x-1.5)<1e-8);
  assert.ok(buffer.sample('a',.15).facing>3,'angle interpolation takes the short route');
  assert.ok(buffer.sample('a',2).x<=3.00001,'stalled snapshots do not drift forever');
  buffer.push({time:.3,players:[],enemies:[]});assert.equal(buffer.sample('a',.3),null);
});
test('clock synchronization measures RTT and prefers low-jitter samples',()=>{
  const clock=new NetworkClock();clock.observe(10,1000);clock.pong(1000,10.1,1200);assert.equal(clock.rtt,200);assert.ok(Math.abs(clock.time(1200)-10.2)<1e-8);
  clock.pong(2000,10.9,2600);assert.ok(Math.abs(clock.offset-9)<1e-8);clock.pong(NaN,100,1);assert.ok(Number.isFinite(clock.offset));
  clock.reset();assert.equal(clock.rtt,null);clock.observe(0,3000);assert.equal(clock.time(3000),0);
});
test('cast presentation starts locally, survives acknowledgement, and cannot reappear after local interruption',()=>{
  const c=new CastPresentation(),base={hp:120,motionEpoch:0,casting:null,lastCastRequest:0};c.reconcile(base,0,0);
  const cast=c.start('lance',SKILLS.lance,0);assert.equal(c.progress(750),.5);
  c.reconcile({...base,casting:{skill:'lance',requestId:cast.requestId,startedAt:.1,endsAt:1.6}},200,.2);assert.equal(c.current.confirmed,true);
  c.cancel();c.reconcile({...base,casting:{skill:'lance',requestId:cast.requestId,startedAt:.1,endsAt:1.6}},250,.25);assert.equal(c.current,null);
  const next=c.start('lance',SKILLS.lance,1000);c.reconcile({...base,lastCastRequest:next.requestId},1100,1.1);assert.equal(c.current,null,'server rejection rolls back optimistic cast');
});
test('minimap stays centered at all zoom levels including zone edges; full map remains fixed',()=>{
  for(const player of[{x:0,z:32},{x:67,z:-67}])for(let zoom=0;zoom<MAP_RADII.length;zoom++){
    const view=mapView(220,180,player,zoom);assert.deepEqual(mapPoint(view,player.x,player.z),[110,90]);assert.ok(MAP_RADII[zoom]>=12&&MAP_RADII[zoom]<=76);
    const edge=edgePoint(view,player.x+200,player.z);assert.equal(edge.outside,true);assert.equal(edge.x,210);assert.equal(edge.y,90);
  }
  assert.equal(clampZoom(-10),0);assert.equal(clampZoom(100),MAP_RADII.length-1);assert.equal(clampZoom(NaN),2);
  assert.deepEqual(mapPoint(mapView(700,700,{x:67,z:50},0,true),0,0),[350,350]);
});
test('casts spend resources and apply effects only on completion; movement/jump/cancel/target loss interrupt',()=>{
  for(const interrupt of ['move','jump','cancel','target']){
    const w=new World(),p=w.addPlayer('Caster'),e=w.enemies[0];p.x=e.x;p.z=e.z+2;p.target=e.id;const hp=e.hp;
    w.command(p,{type:'skill',skill:'lance',requestId:1});assert.equal(p.casting.skill,'lance');assert.equal(p.energy,100);assert.equal(e.hp,hp);
    run(w,.5);assert.equal(e.hp,hp);
    if(interrupt==='move')w.command(p,{type:'input',x:1,z:0});
    if(interrupt==='jump')w.command(p,{type:'jump'});
    if(interrupt==='cancel')w.command(p,{type:'cancelCast',requestId:1});
    if(interrupt==='target'){e.hp=0;e.deadUntil=999;}
    run(w,2);assert.equal(p.casting,null);assert.equal(p.cooldowns.lance,undefined);assert.equal(p.energy,100);if(interrupt!=='target')assert.equal(e.hp,hp);
  }
  const w=new World(),p=w.addPlayer('Success'),e=w.enemies[0];p.x=e.x;p.z=e.z+2;p.target=e.id;
  w.command(p,{type:'skill',skill:'lance',requestId:1});run(w,1.45);assert.equal(e.hp,110);run(w,.1);assert.ok(e.hp<110);assert.ok(p.cooldowns.lance>w.time);assert.ok(p.energy<100);
});
test('casts reject already moving players and buffered jumps; post-cast sequenced movement interrupts',()=>{
  const w=new World(),p=w.addPlayer('Sequenced caster'),e=w.enemies[0];p.x=e.x;p.z=e.z+2;p.target=e.id;
  w.command(p,{type:'move',epoch:0,commands:[{seq:1,x:0,z:0,jump:true}]});w.command(p,{type:'skill',skill:'lance',requestId:1});assert.equal(p.casting,null);
  p.moveQueue=[];p.latestMove={x:0,z:0};w.command(p,{type:'skill',skill:'lance',requestId:2});assert.ok(p.casting);
  w.command(p,{type:'move',epoch:0,commands:[{seq:2,x:1,z:0}]});w.step(.05);assert.equal(p.casting,null);
});

test('remote flight interpolates at 90 metres per second but still rejects teleports',()=>{
 const timeline=new SnapshotInterpolator(0),push=(time,x)=>timeline.push({time,players:[{id:'flyer',x,z:0,y:24,facing:Math.PI/2,inTransit:true}],enemies:[]});
 push(1,0);push(1.1,9);assert.ok(Math.abs(timeline.sample('flyer',1.05).x-4.5)<1e-8);
 push(1.2,900);assert.equal(timeline.sample('flyer',1.15).x,900);
});
