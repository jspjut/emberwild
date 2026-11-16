import test from 'node:test';import assert from 'node:assert/strict';
import {AdventureControls,TURN_SPEED} from '../client/controls.js';
import {normalizeInput} from '../shared/movement.js';
import {MovementPredictor} from '../client/netcode.js';
import {World} from '../server/world.js';
const held=(...keys)=>key=>keys.includes(key),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('autorun advances continuously, toggles off, and forward/backward take over without restarting on release',()=>{
 const c=new AdventureControls();c.toggleAutorun();let v=c.update(.1,0,held());near(v.x,0);near(v.z,-1);assert.equal(c.autorun,true);c.toggleAutorun();near(c.update(.1,0,held()).z,0);
 for(const key of ['forward','backward']){c.toggleAutorun();v=c.update(.1,0,held(key));assert.equal(c.autorun,false);near(v.z,key==='forward'?-1:1);near(c.update(.1,0,held()).z,0);}
});
test('left-drag look keeps the pawn and autorun heading fixed; right-held look steers them toward the camera',()=>{
 const c=new AdventureControls();c.toggleAutorun();c.update(.1,0,held());c.mouseDown(0,100,100);assert.deepEqual(c.mouseMove(140,100),{x:40,y:0});let v=c.update(.1,1.2,held());near(v.facing,Math.PI);near(v.x,0);near(v.z,-1);assert.equal(c.mouseUp(0,140,100).clicked,false);assert.equal(c.autorun,true);
 c.mouseDown(2,140,100);v=c.update(.1,1.2,held());near(v.facing,Math.PI+1.2);assert.ok(v.x<-.9);assert.equal(c.hideCursor,true);c.mouseUp(2,140,100);assert.equal(c.hideCursor,false);
});
test('Q/E turn the body and camera; free-look can stay independent and strafing never turns the body',()=>{
 const c=new AdventureControls();let v=c.update(.1,0,held('turnLeft','forward'));near(v.facing,Math.PI+TURN_SPEED*.1);near(v.cameraYaw,TURN_SPEED*.1);assert.ok(v.x<0);v=c.update(.1,v.cameraYaw,held('turnRight'));near(v.facing,Math.PI);near(v.cameraYaw,0);v=c.update(.1,0,held('right'));near(v.x,1);near(v.z,0);near(v.facing,Math.PI);
 c.mouseDown(0,0,0);v=c.update(.1,1,held('turnRight'));near(v.cameraYaw,1);near(v.facing,Math.PI-TURN_SPEED*.1);
});
test('both mouse buttons move only while both are held, in either press/release order, without emitting clicks',()=>{
 for(const order of [[0,2],[2,0]])for(const release of [[0,2],[2,0]]){
  const c=new AdventureControls();c.update(.1,0,held());c.mouseDown(order[0],10,10);near(c.update(.1,0,held()).z,0);c.toggleAutorun();c.mouseDown(order[1],10,10);assert.equal(c.autorun,false);assert.equal(c.bothButtons,true);near(c.update(.1,0,held()).z,-1);
  assert.equal(c.mouseUp(release[0],10,10).clicked,false);near(c.update(.1,0,held()).z,0);assert.equal(c.mouseUp(release[1],10,10).clicked,false);assert.equal(c.mouseUp(release[1],10,10),null);assert.equal(c.hideCursor,false);
 }
 const c=new AdventureControls();c.mouseDown(0,1,1);assert.equal(c.mouseUp(0,1,1).clicked,true);c.mouseDown(2,1,1);assert.equal(c.mouseUp(2,1,1).clicked,true);c.mouseDown(0,1,1);c.mouseMove(30,30);assert.equal(c.mouseUp(0,30,30).clicked,false);
});
test('disabled input and session/focus cleanup cannot leave autorun or mouse movement latched',()=>{
 const c=new AdventureControls();c.toggleAutorun();const v=c.update(.1,0,held(),false);near(v.x,0);near(v.z,0);assert.equal(c.autorun,false);c.mouseDown(0,0,0);c.mouseDown(2,0,0);c.stop();assert.equal(c.bothButtons,false);assert.equal(c.hideCursor,false);c.reset();assert.equal(c.heading,null);
});
test('stationary facing is authoritative, replicated and rejects nonfinite or malformed input without granting movement',()=>{
 const w=new World(),p=w.addPlayer('Turner'),peer=w.addPlayer('Peer'),origin={x:p.x,z:p.z};w.command(p,{type:'move',epoch:0,commands:[{seq:1,x:0,z:0,facing:Math.PI/2}]});w.step(.05);near(p.facing,Math.PI/2);near(p.x,origin.x);near(p.z,origin.z);near(w.snapshot(peer).players.find(v=>v.id===p.id).facing,Math.PI/2);
 for(const facing of [NaN,Infinity,-Infinity,'1',null]){assert.equal(normalizeInput({x:0,z:0,facing}),null);w.command(p,{type:'move',epoch:0,commands:[{seq:2,x:1,z:0,facing}]});assert.equal(p.lastQueuedSeq,1);}
});
test('facing-only commands preserve casts, and prediction/reconciliation retain turns under delayed acknowledgements',()=>{
 const w=new World(),p=w.addPlayer('Caster'),e=w.enemies[0];p.x=e.x;p.z=e.z+3;p.target=e.id;w.command(p,{type:'skill',skill:'lance'});assert.ok(p.casting);w.command(p,{type:'move',epoch:0,commands:[{seq:1,x:0,z:0,facing:1}]});w.step(.05);assert.ok(p.casting);near(p.facing,1);
 const server=new World(),q=server.addPlayer('Predicted turn'),client=new MovementPredictor(),deliveries=[],snapshots=[];client.reconcile(server.snapshot(q).self,0);
 for(let tick=1;tick<=300;tick++){const t=tick/60,now=t*1000;client.advance(1/60,0,0,now,t<1.5?t:1.5);if(tick%3===0)client.flush(message=>deliveries.push({at:t+.15,message}));while(deliveries[0]?.at<=t)server.command(q,deliveries.shift().message);if(tick%3===0)server.step(.05);if(tick%6===0)snapshots.push({at:t+.15,self:structuredClone(server.snapshot(q).self)});while(snapshots[0]?.at<=t)client.reconcile(snapshots.shift().self,now);}
 near(client.pose.facing,1.5);near(q.facing,1.5);near(q.x,0);near(q.z,32);
});
