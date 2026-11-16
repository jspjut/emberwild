import {introPoint} from '../shared/zone-layout.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {heightAt,terrainSlope,STREAM_LEVEL,streamX,TERRAIN_SIZE,TERRAIN_SEGMENTS} from '../shared/terrain.js';
import {NPCS,BUILDINGS,walkable} from '../shared/content.js';
import {advanceMotion,MOVE_STEP} from '../shared/movement.js';
import {CharacterAnimator} from '../client/animation.js';

test('terrain has meaningful elevation with continuous climbable grades and level camp foundations',()=>{
  let low=Infinity,high=-Infinity;
  for(let x=-68;x<=68;x++)for(let z=-68;z<=68;z++){
    const h=heightAt(x,z),s=terrainSlope(x,z);assert.ok(Number.isFinite(h));low=Math.min(low,h);high=Math.max(high,h);
    assert.ok(Math.hypot(s.x,s.z)<.95,`excessive grade at ${x},${z}`);
    assert.ok(Math.abs(heightAt(x+.02,z)-h)<.02,'no terrain discontinuities');
  }
  assert.ok(high-low>12);assert.ok(heightAt(0,introPoint(0,-45).z)-heightAt(0,32)>9);
  for(const point of BUILDINGS)assert.ok(Math.abs(heightAt(point.x,point.z)-(point.floorY??.2))<1e-6);
  for(const npc of NPCS)assert.ok(walkable(npc.x,npc.z),`${npc.id}: traversable service position`);
  for(let z=-65;z<65;z++)assert.ok(heightAt(streamX(z),z)<STREAM_LEVEL,'stream surface stays above its bed');
});
test('render mesh resolution follows the shared surface without visible grounding gaps',()=>{
  const cell=TERRAIN_SIZE/TERRAIN_SEGMENTS;let error=0;
  for(let x=-67.7;x<68;x+=1.1)for(let z=-67.7;z<68;z+=1.3){
    const ax=Math.floor((x+TERRAIN_SIZE/2)/cell)*cell-TERRAIN_SIZE/2,az=Math.floor((z+TERRAIN_SIZE/2)/cell)*cell-TERRAIN_SIZE/2,u=(x-ax)/cell,v=(z-az)/cell;
    const a=heightAt(ax,az),b=heightAt(ax+cell,az),c=heightAt(ax,az+cell),d=heightAt(ax+cell,az+cell);
    const mesh=u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);
    error=Math.max(error,Math.abs(mesh-heightAt(x,z)));
  }
  assert.ok(error<.04,`mesh/height error ${error}`);
});
test('shared movement climbs and descends the northern route and lands on elevated ground',()=>{
  const p={x:0,z:32,facing:0,jumpHeight:0,jumpVelocity:0};let previous=heightAt(p.x,p.z),peak=previous;
  for(let i=0;i<1020;i++){advanceMotion(p,{x:0,z:-1,jump:i===880});const ground=heightAt(p.x,p.z);assert.ok(walkable(p.x,p.z));assert.ok(Math.abs(ground-previous)<.11);peak=Math.max(peak,ground);previous=ground;}
  assert.ok(peak>10);assert.equal(p.jumpHeight,0);
  for(let i=0;i<1020;i++)advanceMotion(p,{x:0,z:1});assert.ok(Math.abs(p.z-32)<1e-8);assert.ok(Math.abs(heightAt(p.x,p.z)-.2)<1e-8);
});

function simulate(fps){
  const a=new CharacterAnimator(),p={x:0,z:32,facing:Math.PI/2,jumpHeight:0},dt=1/fps;let budget=0,minBlend=1,maxChange=0,previous=0,state;
  a.step(p,dt,heightAt);
  for(let i=0;i<fps*2;i++){
    budget+=dt;while(budget+1e-9>=MOVE_STEP){p.x+=6.5*MOVE_STEP;budget-=MOVE_STEP;}
    state=a.step(p,dt,heightAt);if(i>fps*.5){minBlend=Math.min(minBlend,state.blend);maxChange=Math.max(maxChange,Math.abs(state.legs[0].hip-previous));}previous=state.legs[0].hip;
  }
  return {a,p,state,minBlend,maxChange};
}
test('local gait stays continuous between prediction steps and matches travel at 30/60/144Hz',()=>{
  const runs=[30,60,144].map(simulate);
  for(const run of runs){assert.ok(run.minBlend>.9);assert.ok(run.maxChange<.65);assert.ok(Math.abs(run.state.speed-6.5)<1);}
  for(const run of runs)assert.ok(Math.abs(run.state.phase-runs[0].state.phase)<1e-8);
  const {a,p}=runs[2];let previous=a.step(p,1/144,heightAt),state;
  for(let i=0;i<144;i++){state=a.step(p,1/144,heightAt);assert.ok(Math.abs(state.legs[0].hip-previous.legs[0].hip)<.15);previous=state;}
  assert.ok(state.blend<.01);assert.ok(state.speed<.01);
});
test('terrain-aware legs reach their sampled feet, while jumps, landings and teleports blend safely',()=>{
  const a=new CharacterAnimator(),p={x:0,z:15,facing:Math.PI,jumpHeight:0};let state;
  a.step(p,1/60,heightAt);
  for(let i=0;i<550;i++){
    p.z-=6.5/60;state=a.step(p,1/60,heightAt);
    for(const leg of state.legs){
      const footY=.95+state.bodyY-.43*Math.cos(leg.hip)-.43*Math.cos(leg.hip+leg.knee);
      assert.ok(Math.abs(footY-leg.y)<.025,`foot grounding error ${footY-leg.y}`);
    }
  }
  p.jumpHeight=1;for(let i=0;i<12;i++)state=a.step(p,1/60,heightAt);assert.ok(state.air>.98);
  p.jumpHeight=0;state=a.step(p,1/60,heightAt);assert.ok(a.land>0);for(let i=0;i<90;i++)state=a.step(p,1/60,heightAt);assert.ok(state.air<.01);assert.ok(a.land<.001);
  p.x=40;p.z=10;p.facing=-2;state=a.step(p,1/60,heightAt);assert.equal(state.phase,0);assert.equal(state.speed,0);assert.equal(state.facing,-2);
  state=a.step(p,0,heightAt);assert.ok(Number.isFinite(state.legs[0].hip));
});


test('southern ridges blend gently into town and outpost foundations without cliff-like grades',()=>{
 for(let x=-150;x<=150;x+=2)for(let z=45;z<=170;z+=2){const slope=terrainSlope(x,z);assert.ok(Math.hypot(slope.x,slope.z)<.8,`Southern grade at ${x},${z}`);}
});
