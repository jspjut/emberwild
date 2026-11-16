import {REACH_WATERS,reachWaterRadius} from '/shared/reach-geography.js';
import * as THREE from 'three';
import {heightAt,streamX,poolRadius} from '/shared/terrain.js';
import {ZONE_BOUNDS,introPoint} from '/shared/zone-layout.js';
import {NPCS,GATHERABLES} from '/shared/content.js';
import {buildingAt} from '/shared/buildings.js';
const CELL=60;
export class Landscape{
 constructor(scene,pathDistance,windMaterial){this.chunks=[];this.trees=[];this.last=-1;this.zero=new THREE.Matrix4().makeScale(0,0,0);let seed=7123;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},groups=new Map(),hearth=introPoint(0,29),hollow=introPoint(-15,-49);
  const group=(x,z)=>{const cx=Math.floor(x/CELL),cz=Math.floor(z/CELL),key=`${cx}:${cz}`;if(!groups.has(key))groups.set(key,{x:(cx+.5)*CELL,z:(cz+.5)*CELL,trees:[],grass:[],rocks:[]});return groups.get(key);};
  const sample=()=>[ZONE_BOUNDS.minX+rand()*(ZONE_BOUNDS.maxX-ZONE_BOUNDS.minX),ZONE_BOUNDS.minZ+rand()*(ZONE_BOUNDS.maxZ-ZONE_BOUNDS.minZ)];
  for(let i=0;i<9000;i++){const[x,z]=sample();if(REACH_WATERS.some(w=>reachWaterRadius(x,z,w)<1.3)||poolRadius(x,z)<1.35||buildingAt(x,z,6)||pathDistance(x,z)<4.5||Math.hypot(x-hearth.x,z-hearth.z)<20||Math.hypot(x-hollow.x,z-hollow.z)<13||NPCS.some(n=>Math.hypot(x-n.x,z-n.z)<7)||GATHERABLES.some(g=>Math.hypot(x-g.x,z-g.z)<4)||Math.abs(x-streamX(z))<6)continue;group(x,z).trees.push({x,z,y:heightAt(x,z),h:4+rand()*5,s:.8+rand()*.7,r:rand()*6});}
  for(let i=0;i<58000;i++){const[x,z]=sample();if(REACH_WATERS.some(w=>reachWaterRadius(x,z,w)<1.05)||poolRadius(x,z)<1.1||buildingAt(x,z,1)||pathDistance(x,z)<3||Math.hypot(x-hearth.x,z-hearth.z)<18||Math.abs(x-streamX(z))<5)continue;group(x,z).grass.push({x,z,h:.18+rand()*.4});}
  for(let i=0;i<550;i++){const[x,z]=sample();if(REACH_WATERS.some(w=>reachWaterRadius(x,z,w)<1.05)||poolRadius(x,z)<1.1||buildingAt(x,z,2)||pathDistance(x,z)<4||NPCS.some(n=>Math.hypot(x-n.x,z-n.z)<5))continue;group(x,z).rocks.push({x,z,s:.3+rand()*.9});}
  const trunkGeometry=new THREE.CylinderGeometry(.14,.32,1,6),trunkMaterial=new THREE.MeshStandardMaterial({color:'#6c6349',roughness:1}),crownGeometry=new THREE.IcosahedronGeometry(1,0),crownMaterial=windMaterial('#ffffff',.018),grassGeometry=new THREE.ConeGeometry(.14,1,3),grassMaterial=windMaterial('#9aaa65',.035),rockGeometry=new THREE.DodecahedronGeometry(1,0),rockMaterial=new THREE.MeshStandardMaterial({color:'#8d9781',roughness:1});
  const pos=crownGeometry.attributes.position,norm=crownGeometry.attributes.normal;for(let i=0;i<pos.count;i++){const v=new THREE.Vector3().fromBufferAttribute(pos,i).normalize();norm.setXYZ(i,v.x,v.y,v.z);}
  const dummy=new THREE.Object3D();
  for(const data of groups.values()){const root=new THREE.Group();scene.add(root);const chunk={...data,root};this.chunks.push(chunk);
   if(data.trees.length){const trunks=new THREE.InstancedMesh(trunkGeometry,trunkMaterial,data.trees.length),crowns=new THREE.InstancedMesh(crownGeometry,crownMaterial,data.trees.length*3);trunks.castShadow=true;crowns.castShadow=true;crowns.receiveShadow=true;root.add(trunks,crowns);
    data.trees.forEach((t,i)=>{dummy.position.set(t.x,t.y+t.h*.38,t.z);dummy.rotation.set(0,t.r,0);dummy.scale.set(t.s,t.h*.76,t.s);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);const matrices=[];
     for(let j=0;j<3;j++){dummy.position.set(t.x+(j-1)*t.s*.5,t.y+t.h*(.73+j*.1),t.z+Math.sin(j*2)*t.s*.6);dummy.rotation.set(0,t.r+j,0);dummy.scale.set(t.s*2.1,t.h*.3,t.s*1.8);dummy.updateMatrix();crowns.setMatrixAt(i*3+j,dummy.matrix);crowns.setColorAt(i*3+j,new THREE.Color(t.z>230&&t.x< -150?[0x9a874f,0xad9a59,0xaba06b][j]:t.z>220&&t.x>150?[0x6e8e67,0x7b9c7c,0x98ad83][j]:[0x758d59,0x889c5a,0xa6ab65][j]));matrices.push(dummy.matrix.clone());}
     this.trees.push({...t,crowns,index:i*3,matrices,hidden:false});
    });trunks.computeBoundingSphere();crowns.computeBoundingSphere();
   }
   if(data.grass.length){const grass=new THREE.InstancedMesh(grassGeometry,grassMaterial,data.grass.length);data.grass.forEach((g,i)=>{dummy.position.set(g.x,heightAt(g.x,g.z)+g.h/2,g.z);dummy.rotation.set(0,rand()*6,rand()*.2);dummy.scale.set(1,g.h,1);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);});grass.computeBoundingSphere();root.add(grass);}
   if(data.rocks.length){const rocks=new THREE.InstancedMesh(rockGeometry,rockMaterial,data.rocks.length);data.rocks.forEach((r,i)=>{dummy.position.set(r.x,heightAt(r.x,r.z)+r.s*.25,r.z);dummy.rotation.set(rand()*3,rand()*6,0);dummy.scale.set(r.s,r.s*.7,r.s*.8);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);});rocks.computeBoundingSphere();rocks.castShadow=true;root.add(rocks);}
  }
 }
 update(camera,focus,playing,time){if(time-this.last<.1)return;this.last=time;for(const chunk of this.chunks)chunk.root.visible=Math.hypot(chunk.x-focus.x,chunk.z-focus.z)<250;
  const dx=camera.position.x-focus.x,dy=camera.position.y-focus.y,dz=camera.position.z-focus.z,length2=dx*dx+dy*dy+dz*dz;
  for(const tree of this.trees){if(Math.abs(tree.x-focus.x)>45||Math.abs(tree.z-focus.z)>45){if(!tree.hidden)continue;}
   const tx=tree.x-focus.x,ty=tree.y+tree.h*.85-focus.y,tz=tree.z-focus.z,t=(tx*dx+ty*dy+tz*dz)/length2,nearest=Math.max(0,Math.min(1,t)),ex=tx-dx*nearest,ey=ty-dy*nearest,ez=tz-dz*nearest,hide=playing&&t>-.05&&t<1.05&&ex*ex+ey*ey+ez*ez<(tree.s*2.6)**2;
   if(hide!==tree.hidden){for(let j=0;j<3;j++)tree.crowns.setMatrixAt(tree.index+j,hide?this.zero:tree.matrices[j]);tree.crowns.instanceMatrix.needsUpdate=true;tree.hidden=hide;}
  }
 }
}
