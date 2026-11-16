import {CONTINENT_BUILDINGS} from './continent-buildings.js';
import {CAPITAL_BUILDINGS} from './capital.js';
import {introPoint} from './zone-layout.js';
import {EXPANSION_BUILDINGS} from './world-layouts.js';
// Buildings share their wall, doorway and furniture footprints with client prediction.
export const CHARACTER_RADIUS=.3;
export const BUILDINGS=[
 {id:'lodge',name:'Wayfarer’s Lodge',subtitle:'Beds and a warm place to rest',x:-11,z:37,r:4.6,width:8,depth:7,wallHeight:6.2,doorSide:'north',doorWidth:3,doorHeight:4.6,roofRise:2.4,
  furniture:[{id:'bed-west',type:'bed',x:-2.8,z:1.5,width:1.5,depth:2.5,height:.8},{id:'bed-east',type:'bed',x:2.8,z:1.5,width:1.5,depth:2.5,height:.8},{id:'table',type:'table',x:-2.6,z:-1.8,width:1.5,depth:1.1,height:1.15},{id:'cabinet',type:'shelf',x:2.6,z:-2.5,width:1.8,depth:.6,height:2.8}]},
 {id:'workshop',name:'Trailkeeper’s Workshop',subtitle:'Provisions, tools and travel supplies',x:12,z:37,r:4.6,width:8,depth:7,wallHeight:6.2,doorSide:'north',doorWidth:3,doorHeight:4.6,roofRise:2.4,
  furniture:[{id:'west-counter',type:'counter',x:-2.7,z:.1,width:1.5,depth:3.4,height:1.15},{id:'east-shelves',type:'shelf',x:3,z:.8,width:.7,depth:3.5,height:2.8},{id:'back-crates',type:'crates',x:-1.7,z:2.7,width:1.7,depth:.9,height:1.3}]},
 {id:'cottage',name:'Sera’s Cottage',subtitle:'Herbs, books and a quiet hearth',x:-13,z:22,r:3.6,width:6.6,depth:6,wallHeight:5.8,doorSide:'south',doorWidth:2.8,doorHeight:4.4,roofRise:2.1,
  furniture:[{id:'bed',type:'bed',x:-2.15,z:-.9,width:1.4,depth:2.4,height:.8},{id:'desk',type:'table',x:2.05,z:-1.8,width:1.5,depth:1,height:1.1},{id:'medicine-shelf',type:'shelf',x:2.4,z:.7,width:.55,depth:2.2,height:2.6}]}
];
for(const b of BUILDINGS)Object.assign(b,introPoint(b.x,b.z));
BUILDINGS.push(...EXPANSION_BUILDINGS,...CAPITAL_BUILDINGS,...CONTINENT_BUILDINGS);
export const WALL_THICKNESS=.34;
const directions={north:{x:0,z:-1},south:{x:0,z:1},west:{x:-1,z:0},east:{x:1,z:0}};
export function entrancePoint(b,distance=1.8){const direction=directions[b.doorSide];return {x:b.x+direction.x*(b.width/2+distance),z:b.z+direction.z*(b.depth/2+distance)};}
export function buildingAt(x,z,margin=0){return BUILDINGS.find(b=>Math.abs(x-b.x)<b.width/2+margin&&Math.abs(z-b.z)<b.depth/2+margin)||null;}
export function wallParts(b){
 const parts=[];
 for(const side of ['north','south','west','east']){
  const horizontal=side==='north'||side==='south',length=horizontal?b.width:b.depth,edge=(horizontal?b.depth:b.width)/2*(side==='north'||side==='west'?-1:1);
  const part=(offset,size,bottom,height,solid)=>parts.push({side,x:horizontal?offset:edge,z:horizontal?edge:offset,width:horizontal?size:WALL_THICKNESS,depth:horizontal?WALL_THICKNESS:size,bottom,height,solid});
  if(!(b.doors||[b.doorSide]).includes(side))part(0,length,0,b.wallHeight,true);
  else{const wing=(length-b.doorWidth)/2;part(-(b.doorWidth+wing)/2,wing,0,b.wallHeight,true);part((b.doorWidth+wing)/2,wing,0,b.wallHeight,true);part(0,b.doorWidth,b.doorHeight,b.wallHeight-b.doorHeight,false);}
 }
 return parts;
}
export function footprint(b,part){return {minX:b.x+part.x-part.width/2,maxX:b.x+part.x+part.width/2,minZ:b.z+part.z-part.depth/2,maxZ:b.z+part.z+part.depth/2};}
export const BUILDING_COLLIDERS=BUILDINGS.flatMap(b=>[
 ...wallParts(b).filter(part=>part.solid).map((part,i)=>({id:`${b.id}:wall-${i}`,building:b.id,type:'wall',...footprint(b,part)})),
 ...b.furniture.map(part=>({id:`${b.id}:${part.id}`,building:b.id,type:'furniture',...footprint(b,part)}))
]);
import {circleHitsBox,segmentHitsBox} from './geometry.js';
export {circleHitsBox,segmentHitsBox} from './geometry.js';
export function buildingWalkable(x,z){return !BUILDING_COLLIDERS.some(box=>circleHitsBox(x,z,box));}
