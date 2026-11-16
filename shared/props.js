import {continentalColliders} from './continent-geometry.js';
import {CAPITAL_WALL_POSTS} from './capital.js';
import {introPoint,INTRO_SCALE,withinZone,EXIT_POSTS,REACH_DIVIDE_POSTS} from './zone-layout.js';
import {ROAD_SIGNS} from './roadsigns.js';
import {BUILDINGS,wallParts,footprint,CHARACTER_RADIUS,circleHitsBox} from './buildings.js';
import {heightAt} from './terrain.js';
import {PROP_PROFILES} from './prop-profiles.js';
import {segmentHitsBox} from './buildings.js';
import {WORLD_RADIUS,EXPANSION_PROP_PLACEMENTS,ORCHARD_HARVESTS} from './world-layouts.js';

export const CHARACTER_HEIGHT=2.25,STEP_HEIGHT=.26,SUPPORT_RADIUS=CHARACTER_RADIUS;
export const CAMP_TABLE={id:'market-table',...introPoint(10,27),width:3,depth:1.4,height:1.15};
export const FENCE_LINES=[-19,19].map(x=>({x:x*INTRO_SCALE,startZ:introPoint(0,25).z,spacing:3*INTRO_SCALE,count:4,height:1.5,railHeight:1}));
export const LANTERNS=[[-4,18],[4,18],[-5,39],[5,39]].map(([x,z])=>{const p=introPoint(x,z);return [p.x,p.z];});
export const CAMP_HEARTH=introPoint(0,29);
export const CAMP_GATE=[-5,5].map(x=>introPoint(x,16));
export const SANCTUARY_GATE=[-1,6].map(x=>introPoint(x,-30));
export const HOLLOW_ALTAR=introPoint(-15,-49);
export const SUPPLY_CRATES=[{id:'cache1',type:'cache',x:-23,z:8},{id:'cache2',type:'cache',x:-36,z:1},{id:'cache3',type:'cache',x:-32,z:-10}].map(c=>({...c,...introPoint(c.x,c.z)}));
export const RUIN_COLUMNS=Array.from({length:9},(_,i)=>{const a=i/9*Math.PI*2;return {id:`ruin-column-${i}`,...introPoint(14+Math.cos(a)*10,-37+Math.sin(a)*8),height:2+(i*7%11)/11*3};});
export const RUIN_STEPS=Array.from({length:4},(_,i)=>{const p=introPoint(2.5,-27.4-i*.75),base=introPoint(2.5,-26.7);return {id:`sanctuary-step-${i}`,...p,width:3*INTRO_SCALE,depth:.8*INTRO_SCALE,top:heightAt(base.x,base.z)+.22+.24*i};});
const box=(id,x,z,width,depth,minY,maxY,standable=true)=>({id,minX:x-width/2,maxX:x+width/2,minZ:z-depth/2,maxZ:z+depth/2,minY,maxY,standable});
const column=(id,x,z,r,minY,maxY,standable=true)=>({...box(id,x,z,r*2,r*2,minY,maxY,standable),x,z,r});
export const WORLD_COLLIDERS=ROAD_SIGNS.map(sign=>column(`roadsign:${sign.id}`,sign.x,sign.z,.16,heightAt(sign.x,sign.z),heightAt(sign.x,sign.z)+3.2,false));
for(const p of CAPITAL_WALL_POSTS)WORLD_COLLIDERS.push(column(p.id,p.x,p.z,1.6,heightAt(p.x,p.z),heightAt(p.x,p.z)+14,false));
for(const p of REACH_DIVIDE_POSTS)WORLD_COLLIDERS.push(column(p.id,p.x,p.z,8,heightAt(p.x,p.z),heightAt(p.x,p.z)+p.height,false));
for(const p of EXIT_POSTS)WORLD_COLLIDERS.push(column(p.id,p.x,p.z,.36,heightAt(p.x,p.z),heightAt(p.x,p.z)+6,false));
for(const b of BUILDINGS){
  if(b.landmark==='assembly')for(const dx of[-20,-8.4,8.4,20])WORLD_COLLIDERS.push(column(`${b.id}:portico:${dx}`,b.x+dx,b.z+b.depth/2+2,1.15,heightAt(b.x,b.z),heightAt(b.x,b.z)+12,false));
  const floor=heightAt(b.x,b.z);
  for(const [i,p]of wallParts(b).entries())WORLD_COLLIDERS.push({id:`${b.id}:wall-${i}`,...footprint(b,p),minY:floor+p.bottom,maxY:floor+p.bottom+p.height,standable:false});
  WORLD_COLLIDERS.push(box(`${b.id}:ceiling`,b.x,b.z,b.width,b.depth,floor+b.wallHeight,floor+b.wallHeight+.2,false));
  for(const p of b.furniture){
    const x=b.x+p.x,z=b.z+p.z,id=`${b.id}:${p.id}`;
    if(p.type==='bed'){
      WORLD_COLLIDERS.push(box(id,x,z,p.width,p.depth,floor,floor+.8));
      WORLD_COLLIDERS.push(box(id+':headboard',x,z-p.depth/2+.03,p.width,.13,floor,floor+.955));
    }else if(p.type==='crates'){
      for(let i=0;i<2;i++)WORLD_COLLIDERS.push(box(id+`:${i}`,x+(i-.5)*p.width*.48,z,p.width*.46,p.depth,floor,floor+p.height*(i?1:.65)));
    }else WORLD_COLLIDERS.push(box(id,x,z,p.width,p.depth,floor,floor+p.height));
  }
}
{
  const t=CAMP_TABLE,y=heightAt(t.x,t.z);WORLD_COLLIDERS.push(box(t.id,t.x,t.z,t.width,t.depth,y,y+t.height));
  for(const c of [...SUPPLY_CRATES,...ORCHARD_HARVESTS])WORLD_COLLIDERS.push(box(c.id,c.x,c.z,1.6,1.2,heightAt(c.x,c.z),heightAt(c.x,c.z)+1.17));
  for(const line of FENCE_LINES){
    for(let i=0;i<line.count;i++){
      const z=line.startZ+i*line.spacing,y=heightAt(line.x,z);WORLD_COLLIDERS.push(column(`fence:${line.x}:post-${i}`,line.x,z,.14,y,y+line.height));
      if(i<line.count-1){const next=heightAt(line.x,z+line.spacing);WORLD_COLLIDERS.push({...box(`fence:${line.x}:rail-${i}`,line.x,z+line.spacing/2,.12,line.spacing,Math.min(y,next),Math.max(y,next)+line.railHeight+.06),topStart:y+line.railHeight+.06,topEnd:next+line.railHeight+.06});}
    }
  }
  for(const [i,[x,z]]of LANTERNS.entries())WORLD_COLLIDERS.push(column(`lantern-${i}`,x,z,.17,heightAt(x,z),heightAt(x,z)+3.65,false));
  for(const p of CAMP_GATE)WORLD_COLLIDERS.push(column(`gate-post:${p.x}`,p.x,p.z,.3,heightAt(p.x,p.z),heightAt(p.x,p.z)+5.25,false));
  for(const c of RUIN_COLUMNS)WORLD_COLLIDERS.push(column(c.id,c.x,c.z,.8,heightAt(c.x,c.z),heightAt(c.x,c.z)+c.height+.35));
  for(const step of RUIN_STEPS)WORLD_COLLIDERS.push(box(step.id,step.x,step.z,step.width,step.depth,Math.min(heightAt(step.x,step.z)-.1,step.top-.24),step.top));
  for(const p of SANCTUARY_GATE)WORLD_COLLIDERS.push(box(`sanctuary-gate:${p.x}`,p.x,p.z,1.1,1.2,heightAt(p.x,p.z),heightAt(p.x,p.z)+5,false));
  WORLD_COLLIDERS.push(column('hollow-altar',HOLLOW_ALTAR.x,HOLLOW_ALTAR.z,2.7,heightAt(HOLLOW_ALTAR.x,HOLLOW_ALTAR.z),heightAt(HOLLOW_ALTAR.x,HOLLOW_ALTAR.z)+.65));
}

for(const [index,placement]of EXPANSION_PROP_PLACEMENTS.entries())for(const [part,v]of (PROP_PROFILES[placement.id]||[]).entries()){
 const scale=placement.scale||1,y=heightAt(placement.x,placement.z);WORLD_COLLIDERS.push(box(`expansion:${index}:${part}`,placement.x+v.x*scale,placement.z+v.z*scale,v.width*scale,v.depth*scale,y+(v.y-v.height/2)*scale,y+(v.y+v.height/2)*scale,v.support));
}

import {createCollisionWorld} from './collision.js';
export const {nearbyColliders,overlaps,colliderTop,supportBelow,bodyFits,groundWalkable,settleOnSurface,lineOfSight}=createCollisionWorld({WORLD_COLLIDERS,heightAt,withinZone,extraColliders:continentalColliders});
