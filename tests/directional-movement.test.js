import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {advanceMotion,normalizeInput,movementSpeed,MOVE_STEP,MOVE_SPEED,BACKPEDAL_MULTIPLIER} from '../shared/movement.js';
import {CharacterAnimator} from '../client/animation.js';
import {createHumanoid,animateHumanoid,disposeHumanoid} from '../client/character.js';
import {MovementPredictor} from '../client/netcode.js';
import {World} from '../server/world.js';
const near=(a,b,epsilon=1e-7)=>assert.ok(Math.abs(a-b)<epsilon,`${a} != ${b}`),angle=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const directions=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
function inputFor(side,forward,facing){return normalizeInput({x:forward*Math.sin(facing)+side*Math.cos(facing),z:forward*Math.cos(facing)-side*Math.sin(facing),facing});}

test('backpedaling halves total speed at every heading; pure strafes and forward diagonals retain run speed',()=>{
 for(const facing of [0,.7,Math.PI/2,Math.PI,-2.4])for(const [side,forward]of directions){
  const input=inputFor(side,forward,facing),p={x:0,z:32,facing};advanceMotion(p,input,.1);
  const expected=MOVE_SPEED*(forward<0?BACKPEDAL_MULTIPLIER:1);near(Math.hypot(p.x,p.z-32),expected*.1);near(p.facing,input.facing);near(movementSpeed(input),expected);
 }
 for(const input of [{x:0,z:-1},{x:-1,z:0}])near(movementSpeed(input),MOVE_SPEED);
 const forged=normalizeInput({x:0,z:-1,facing:0,speed:100,multiplier:100});near(movementSpeed(forged),MOVE_SPEED*BACKPEDAL_MULTIPLIER);
});

test('all eight gaits separate lower-body travel from aim and reverse backward steps at 30/60/144Hz',()=>{
 for(const fps of [30,60,144])for(const [side,forward]of directions){
  const a=new CharacterAnimator(),p={x:0,z:0,facing:0,grounded:true},v=inputFor(side,forward,0),speed=movementSpeed(v),dt=1/fps;let state,phaseTravel=0;
  a.step(p,dt,()=>0);
  for(let i=0;i<fps*2;i++){p.x+=v.x*speed*dt;p.z+=v.z*speed*dt;const before=a.phase;state=a.step(p,dt,()=>0);if(i>fps)phaseTravel+=angle(state.phase,before);}
  const expected=Math.atan2(v.x*(forward<0?-1:1),v.z*(forward<0?-1:1));
  near(state.lowerYaw,expected,.025);near(state.facing,0);assert.ok(Math.abs(state.torsoYaw)<.45);assert.ok(Math.abs(state.torsoYaw+state.headYaw)<.075);
  assert.ok(phaseTravel*(forward<0?-1:1)>1);assert.equal(state.gaitDirection,forward<0?-1:1);near(state.backpedal,forward<0?1:0,.001);assert.ok(state.blend>.99);
 }
});

test('strafe/backpedal transitions blend without angle jumps and return to a straight idle/jump stance',()=>{
 const a=new CharacterAnimator(),p={x:0,z:0,facing:Math.PI-.02,grounded:true};a.step(p,MOVE_STEP,()=>0);let previous=0,state;
 for(const [side,forward]of [[1,0],[1,-1],[-1,-1],[-1,0],[0,1]])for(let i=0;i<90;i++){
  p.facing=i<45?Math.PI-.02:-Math.PI+.02;const v=inputFor(side,forward,p.facing),speed=movementSpeed(v);p.x+=v.x*speed*MOVE_STEP;p.z+=v.z*speed*MOVE_STEP;state=a.step(p,MOVE_STEP,()=>0);
  assert.ok(Math.abs(state.lowerYaw-previous)<.65,'no instantaneous hip reversal');assert.ok(Math.abs(state.lowerYaw)<=Math.PI/2+1e-8);previous=state.lowerYaw;
 }
 for(let i=0;i<120;i++)state=a.step(p,MOVE_STEP,()=>0);assert.ok(Math.abs(state.lowerYaw)<.001);assert.ok(state.blend<.001);
 p.grounded=false;p.jumpHeight=1;for(let i=0;i<30;i++)state=a.step(p,MOVE_STEP,()=>0);assert.ok(state.air>.99);assert.ok(Math.abs(state.lowerYaw)<.001);
 p.x+=20;state=a.step(p,MOVE_STEP,()=>0);near(state.lowerYaw,0);near(state.phase,0);
});

test('small velocity/facing lag during an interpolated strafe turn does not reverse the gait',()=>{
 for(const side of [-1,1])for(const turn of [-1,1]){
  const a=new CharacterAnimator(),p={x:0,z:0,facing:0,grounded:true};a.step(p,MOVE_STEP,()=>0);let state;
  for(let i=1;i<=240;i++){
   p.facing=i*MOVE_STEP*turn*.7;const v=inputFor(side,0,p.facing-turn*.06);p.x+=v.x*MOVE_SPEED*MOVE_STEP;p.z+=v.z*MOVE_SPEED*MOVE_STEP;state=a.step(p,MOVE_STEP,()=>0);
   assert.equal(state.gaitDirection,1,'turning a strafe should not switch to backpedaling');
  }
  assert.ok(Math.abs(state.lowerYaw)>1.4);assert.ok(state.backpedal<.001);
 }
});

test('turned leg rigs keep sampled feet aligned on slopes for every race and body build, with gear attached',()=>{
 const height=(x,z)=>x*.05+z*.08;
 for(const race of ['human','sylvren','cairnkin','brinefolk','emberkin'])for(const build of ['balanced','slender','broad']){
  const o=createHumanoid('#888',false,'hearth',{build},{},race);o.userData.equipment.update({legs:'road_trousers',feet:'wayfarer_boots',weapon:'training_blade'});
  const p={x:0,z:0,facing:.7,grounded:true};animateHumanoid(o,p,MOVE_STEP,{},height);
  for(const [side,forward]of [[1,0],[-1,-1],[1,-1]])for(let i=0;i<90;i++){
   const v=inputFor(side,forward,p.facing),speed=movementSpeed(v);p.x+=v.x*speed*MOVE_STEP;p.z+=v.z*speed*MOVE_STEP;o.position.set(p.x,height(p.x,p.z),p.z);animateHumanoid(o,p,MOVE_STEP,{},height);o.updateMatrixWorld(true);
   const state=o.userData.animation;
   for(let j=0;j<2;j++){const f=o.userData.rig.legs[j].ankle.getWorldPosition(new THREE.Vector3()),sample=state.legs[j];near(f.x,sample.wx,.025);near(f.z,sample.wz,.025);near(f.y,height(p.x,p.z)+sample.y,.025);}
  }
  assert.equal(o.userData.rig.sockets.leftFoot.parent,o.userData.rig.legs[0].knee);assert.ok(o.userData.equipment.pieces.has('feet'));disposeHumanoid(o);
 }
});

test('delayed authoritative snapshots replay mixed backward/strafe movement without drift or facing changes',()=>{
 const w=new World(),p=w.addPlayer('Directional'),client=new MovementPredictor(),deliveries=[],snapshots=[],expected={x:p.x,z:p.z,facing:0},dt=MOVE_STEP;client.reconcile(w.snapshot(p).self,0);
 let maxError=0;
 for(let tick=1;tick<=420;tick++){
  const t=tick*dt,now=t*1000,[side,forward]=t<5?directions[Math.floor(t/.4)%directions.length]:[0,0],v=inputFor(side,forward,.7);
  advanceMotion(expected,v);client.advance(dt,v.x,v.z,now,v.facing);if(tick%3===0)client.flush(message=>deliveries.push({at:t+.14,message}));
  while(deliveries[0]?.at<=t)w.command(p,deliveries.shift().message);if(tick%3===0)w.step(.05);if(tick%6===0)snapshots.push({at:t+.14,self:structuredClone(w.snapshot(p).self)});while(snapshots[0]?.at<=t)client.reconcile(snapshots.shift().self,now);
  maxError=Math.max(maxError,Math.hypot(client.pose.x-expected.x,client.pose.z-expected.z));
 }
 assert.ok(maxError<1e-7,`prediction drift ${maxError}`);near(client.pose.x,p.x);near(client.pose.z,p.z);near(p.facing,.7);
});
