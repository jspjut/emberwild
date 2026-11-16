import {FOUNDING_BOUNDS} from '/shared/continent-coast.js';
import {WORLD_SITES as SETTLEMENT_SITES,QUEST_HUBS} from '/shared/continent-settlements.js';
import {TRAVEL_NODES} from '/shared/travel-network.js';
import {continentalScatter,continentRoadDistance} from '/shared/continent-geometry.js';
import * as THREE from 'three';
import {CONTINENT_ZONES,continentAt,isContinental} from '/shared/continent.js';
import {heightAt} from '/shared/terrain.js';
import {buildingAt} from '/shared/buildings.js';
import {assetRegion} from '/shared/asset-library.js';
const geo={deck:new THREE.BoxGeometry(1,1,1),rock:new THREE.IcosahedronGeometry(1,1),trunk:new THREE.CylinderGeometry(.18,.3,1,6),crown:new THREE.IcosahedronGeometry(1,1),needle:new THREE.ConeGeometry(1,1,6),column:new THREE.CylinderGeometry(1,1,1,6)};
const paint=color=>new THREE.MeshStandardMaterial({color,roughness:.94});
const random=(x,z)=>{let seed=(Math.imul(x,73856093)^Math.imul(z,19349663))>>>0;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};};
export class ContinentScene{
 constructor(scene,pathDistance){this.scene=scene;this.pathDistance=pathDistance;this.chunks=new Map();this.landmarks=new Map();this.last='';this.buildTravelStones();const b=FOUNDING_BOUNDS,water=new THREE.MeshStandardMaterial({color:'#527f89',roughness:.35,metalness:.15});for(const [minX,maxX,minZ,maxZ]of [[-3000,b.minX,-14000,14100],[b.maxX,17000,-14000,14100],[b.minX,b.maxX,-14000,b.minZ],[b.minX,b.maxX,b.maxZ,14100]]){const sea=new THREE.Mesh(new THREE.PlaneGeometry(maxX-minX,maxZ-minZ),water);sea.rotation.x=-Math.PI/2;sea.position.set((minX+maxX)/2,-.65,(minZ+maxZ)/2);this.scene.add(sea);}}
 buildTravelStones(){
  for(const kind of ['flight','capital']){const nodes=TRAVEL_NODES.filter(n=>n.kind===kind);for(const [geometry,color,offset,scale]of [[new THREE.CylinderGeometry(1.8,2,.35,12),'#969b87',.15,1],[new THREE.OctahedronGeometry(.8),kind==='capital'?'#d2b9e5':'#92d6d0',1.7,1]]){const batch=new THREE.InstancedMesh(geometry,paint(color),nodes.length),dummy=new THREE.Object3D();nodes.forEach((node,i)=>{dummy.position.set(node.x,heightAt(node.x,node.z)+offset,node.z);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});batch.castShadow=batch.receiveShadow=true;batch.computeBoundingSphere();this.scene.add(batch);}}
 }
 dispose(root){root.removeFromParent();root.traverse(o=>{if(o.geometry&&!Object.values(geo).includes(o.geometry))o.geometry.dispose();if(o.material)o.material.dispose();o.dispose?.();});}
 update(x,z,time=0){const key=`${Math.floor(x/100)}:${Math.floor(z/100)}`;if(key===this.last)return;this.last=key;
  const wanted=new Set();for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){
   const cx=Math.floor(x/100)+dx,cz=Math.floor(z/100)+dz,id=`${cx}:${cz}`;if(!isContinental(cx*100+50,cz*100+50))continue;wanted.add(id);if(!this.chunks.has(id))this.chunks.set(id,this.chunk(cx,cz));
  }
  for(const [id,root]of this.chunks)if(!wanted.has(id)){this.dispose(root);this.chunks.delete(id);}
  const nearby=SETTLEMENT_SITES.filter(s=>Math.hypot(s.x-x,s.z-z)<380),ids=new Set(nearby.map(s=>s.id));
  for(const site of nearby)if(!this.landmarks.has(site.id))this.landmarks.set(site.id,this.landmark(site));
  for(const [id,root]of this.landmarks)if(!ids.has(id)){this.dispose(root);this.landmarks.delete(id);}
 }
 chunk(cx,cz){const root=new THREE.Group();this.scene.add(root);const rand=random(cx,cz),batches=new Map();
  const add=(kind,color,x,y,z,sx,sy,sz,rotation=0,pitch=0)=>{const id=`${kind}:${color}`;if(!batches.has(id))batches.set(id,{kind,color,transforms:[]});const d=new THREE.Object3D();d.position.set(x,y,z);d.scale.set(sx,sy,sz);d.rotation.order='YXZ';d.rotation.y=rotation;d.rotation.x=pitch;d.updateMatrix();batches.get(id).transforms.push(d.matrix);};
  for(const o of continentalScatter(cx,cz))add(o.kind,o.color,o.x,o.y,o.z,o.sx,o.sy,o.sz,o.rotation,o.pitch);
  for(const {kind,color,transforms}of batches.values()){
   const batch=new THREE.InstancedMesh(geo[kind],paint(color),transforms.length);transforms.forEach((m,i)=>batch.setMatrixAt(i,m));batch.castShadow=batch.receiveShadow=true;batch.computeBoundingSphere();root.add(batch);
  }
  return root;
 }
 landmark(site){const root=new THREE.Group(),{zone}=site,p=assetRegion(zone.biome);root.position.set(site.x,heightAt(site.x,site.z),site.z);this.scene.add(root);
  const part=(geometry,color,x,y,z,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(geometry,paint(color));o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=o.receiveShadow=true;if([geo.column,geo.needle,geo.rock].includes(geometry)&&continentRoadDistance(site.x+x,site.z+z)<=Math.max(sx,sz)+8)o.visible=false;root.add(o);return o;};
  // Survey pads and ruin circles stay clear for later encounter authoring.
  if(site.kind==='grounds'){const ring=part(new THREE.TorusGeometry(15,.45,6,40),p.trim,0,.5,0);ring.rotation.x=Math.PI/2;return root;}
  if(site.kind==='ruins'){for(let i=0;i<5;i++){const a=i*1.256;part(geo.column,p.stone,Math.sin(a)*13,3+i,Math.cos(a)*13,1,6+i*2,1);}return root;}
  const form=zone.form;
  if(['lakes','wetlands','coast','basin','terraces'].includes(form)){
   const pool=part(new THREE.CircleGeometry(30,48),p.glow,0,.12,0);pool.rotation.x=-Math.PI/2;pool.material.transparent=true;pool.material.opacity=.75;
   for(let i=0;i<3;i++){const ring=part(new THREE.TorusGeometry(32+i*7,1,6,40),p.stone,0,.6+i*.5,0);ring.rotation.x=Math.PI/2;}
  }else if(['canopy','roots','orchard'].includes(form)){
   for(let i=0;i<7;i++){const a=i*Math.PI*2/7;part(geo.column,p.wood,Math.sin(a)*19,20,Math.cos(a)*19,3,40,3);part(geo.crown,p.leaf,Math.sin(a)*19,43,Math.cos(a)*19,13,9,13);}
  }else if(form==='fungal'){
   for(let i=0;i<7;i++){const a=i*2.4,h=8+i*3;part(geo.column,p.light,Math.sin(a)*17,h/2,Math.cos(a)*17,1,h,1);part(geo.crown,p.cloth,Math.sin(a)*17,h,Math.cos(a)*17,12,2,12);}
  }else if(form==='caldera'){
   for(let i=0;i<16;i++){const a=i*Math.PI/8;part(geo.rock,p.stone,Math.sin(a)*31,4,Math.cos(a)*31,9,10,9);}part(geo.column,p.dark,0,9,0,9,18,9);const vent=part(new THREE.TorusGeometry(12,.8,8,48),p.glow,0,.4,0);vent.rotation.x=Math.PI/2;
  }else if(form==='craters'){
   const ring=part(new THREE.TorusGeometry(25,1.5,8,56,Math.PI*1.6),p.metal,0,28,0);ring.rotation.z=.3;part(geo.column,p.stone,-20,13,0,3,26,3);part(geo.column,p.stone,20,13,0,3,26,3);
  }else if(form==='dunes'){
   for(let i=0;i<12;i++){const a=i*Math.PI/6;part(geo.column,p.stone,Math.sin(a)*24,3+i%3*2,Math.cos(a)*24,1.5,6+i%3*4,1.5);}const dial=part(new THREE.TorusGeometry(18,.7,6,48),p.metal,0,.3,0);dial.rotation.x=Math.PI/2;
  }else if(form==='glacier'){
   for(let i=0;i<8;i++){const a=i*Math.PI/4;part(geo.needle,p.glow,Math.sin(a)*23,16,Math.cos(a)*23,5,32,6);}const arch=part(new THREE.TorusGeometry(19,3,6,32,Math.PI),p.light,0,3,0);arch.rotation.z=0;
  }else{
   for(let i=0;i<9;i++){const a=i*2.4,h=12+i*3;part(form==='columns'?geo.column:geo.needle,p.stone,Math.sin(a)*20,h/2,Math.cos(a)*20,3,h,3);}
  }
  if(zone.id==='worldanvil')for(let i=0;i<3;i++){const forge=part(new THREE.TorusGeometry(10+i*4,.7,6,32),p.metal,0,.4+i*.3,0);forge.rotation.x=Math.PI/2;}
  if(zone.id==='prismtide'){const lagoon=part(new THREE.CircleGeometry(14,40),p.glow,0,.15,0);lagoon.rotation.x=-Math.PI/2;}
  if(zone.id==='stormcrown'){for(const side of[-1,1])part(geo.column,p.dark,side*6,25,0,2,50,2);const meridian=part(new THREE.TorusGeometry(7,.6,6,24,Math.PI*.8),p.glow,0,49,0);meridian.rotation.z=.2;}
  return root;
 }
 debug(){return {chunks:this.chunks.size,landmarks:this.landmarks.size};}
}
