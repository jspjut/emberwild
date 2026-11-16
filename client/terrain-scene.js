import {continentAt,isContinental} from '/shared/continent.js';
import {assetRegion} from '/shared/asset-library.js';
import {arrivalBlend} from '/shared/city-topography.js';
import * as THREE from 'three';
import {visualHeightAt as heightAt,TERRAIN_SIZE} from '/shared/terrain.js';
import {introOriginal,INTRO_BOUNDS} from '/shared/zone-layout.js';
const terrainSlope=(x,z)=>({x:(heightAt(x+.1,z)-heightAt(x-.1,z))/.2,z:(heightAt(x,z+.1)-heightAt(x,z-.1))/.2});
const SIZE=30,FINE=40,COARSE=8;
// Fine tiles follow the player; coarse distant ground fills the horizon. Fine
// samples use the same .75m grid and shared normals on both sides of a seam.
export class TerrainScene{
 constructor(scene,pathDistance){this.scene=scene;this.pathDistance=pathDistance;this.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});this.tiles=[];this.lastX=Infinity;this.lastZ=Infinity;
  this.update(0,32,true);
 }
 geometry(tile,segments){const positions=[],normals=[],colors=[],indices=[],green=new THREE.Color(),path=new THREE.Color('#c6b488'),ash=new THREE.Color('#92968b');
  for(let z=0;z<=segments;z++)for(let x=0;x<=segments;x++){
   const wx=tile.x+x/segments*SIZE,wz=tile.z+z/segments*SIZE,h=heightAt(wx,wz),slope=terrainSlope(wx,wz),original=introOriginal(wx,wz);
   positions.push(wx,h,wz);const normal=new THREE.Vector3(-slope.x,1,-slope.z).normalize();normals.push(normal.x,normal.y,normal.z);
   green.set('#8caa69').lerp(new THREE.Color('#a3ac8c'),arrivalBlend(wx));green.lerp(new THREE.Color('#a4b377'),(Math.sin(wx*.14)*Math.cos(wz*.12)+1)/2);
   if(wx< -150&&wz>225)green.lerp(new THREE.Color('#a39367'),.45);if(wx>150&&wz>225)green.lerp(new THREE.Color('#759777'),.5);
   if(wx>INTRO_BOUNDS.minX&&wx<INTRO_BOUNDS.maxX&&wz<INTRO_BOUNDS.maxZ&&original.z< -24)green.lerp(ash,Math.min(1,(-original.z-24)/25));
   if(wx>350&&([[618,145,70],[837,34,100],[692,-88,70],[990,180,72]].some(([x,z,r])=>Math.hypot(wx-x,wz-z)<r)))green.set('#b4b09b');
   if(isContinental(wx,wz)){const zone=continentAt(wx,wz),palette=assetRegion(zone.biome);green.set(palette.ground).lerp(new THREE.Color(palette.stone),Math.min(.45,Math.hypot(slope.x,slope.z)*.3));if(zone.form==='snow'||zone.form==='glacier')green.lerp(new THREE.Color(palette.light),.5);}
   const distance=this.pathDistance(wx,wz),roadWidth=2.7+arrivalBlend(wx)*2.3;if(distance<roadWidth)green.lerp(wx>350?new THREE.Color('#bcb49b'):path,1-Math.max(0,distance-(roadWidth-.9))/.9);
   green.multiplyScalar(.97+(Math.sin(wx*3.7+wz*2.3)+1)*.025);colors.push(green.r,green.g,green.b);
  }
  const stride=segments+1;for(let z=0;z<segments;z++)for(let x=0;x<segments;x++){const a=z*stride+x,b=a+stride;indices.push(a,b,a+1,b,b+1,a+1);}
  // Skirts hide the sub-centimetre/coarse-edge differences without raising the
  // walkable surface or adding visual collision above the shared height field.
  const perimeter=[...Array.from({length:segments+1},(_,i)=>i),...Array.from({length:segments},(_,i)=>(i+1)*stride+segments),...Array.from({length:segments},(_,i)=>segments*stride+segments-i-1),...Array.from({length:segments-1},(_,i)=>(segments-i-1)*stride)];
  for(let i=0;i<perimeter.length;i++){const a=perimeter[i],b=perimeter[(i+1)%perimeter.length],base=positions.length/3;for(const source of [a,b]){positions.push(positions[source*3],positions[source*3+1]-1.5,positions[source*3+2]);normals.push(normals[source*3],normals[source*3+1],normals[source*3+2]);colors.push(colors[source*3],colors[source*3+1],colors[source*3+2]);}indices.push(a,base,b,b,base,base+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeBoundingSphere();return geo;
 }
 update(x,z,force=false){if(!force&&Math.hypot(x-this.lastX,z-this.lastZ)<8)return;this.lastX=x;this.lastZ=z;
  const wanted=new Set(),cx=Math.floor(x/SIZE),cz=Math.floor(z/SIZE);
  for(let dz=-9;dz<=9;dz++)for(let dx=-9;dx<=9;dx++){const tx=(cx+dx)*SIZE,tz=(cz+dz)*SIZE,key=`${tx}:${tz}`;wanted.add(key);if(this.tiles.some(t=>t.key===key))continue;const tile={key,x:tx,z:tz,cx:tx+SIZE/2,cz:tz+SIZE/2};tile.coarse=this.geometry(tile,COARSE);tile.object=new THREE.Mesh(tile.coarse,this.material);tile.object.receiveShadow=true;this.scene.add(tile.object);this.tiles.push(tile);}
  this.tiles=this.tiles.filter(tile=>{if(wanted.has(tile.key))return true;tile.object.removeFromParent();tile.coarse.dispose();tile.fine?.dispose();return false;});
  for(const tile of this.tiles){const distance=Math.hypot(tile.cx-x,tile.cz-z);if(distance<85&&!tile.fine){tile.fine=this.geometry(tile,FINE);tile.object.geometry=tile.fine;}else if(distance>130&&tile.fine){tile.object.geometry=tile.coarse;tile.fine.dispose();tile.fine=null;}}
 }
 debug(){return {tiles:this.tiles.length,fine:this.tiles.filter(t=>t.fine).length};}
}
