import * as THREE from 'three';
import {QUIET_POOL} from '/shared/zone-layout.js';
import {heightAt,STREAM_LEVEL} from '/shared/terrain.js';
// Small original shoreline props; frogs are scenery, rather than combat units.
export function buildQuietPool(scene){
 const group=new THREE.Group(),frogs=[];group.name='Quiet Pool shoreline';scene.add(group);
 const green=new THREE.MeshStandardMaterial({color:'#697e43',roughness:.85}),reed=new THREE.MeshStandardMaterial({color:'#79834b',roughness:1}),brown=new THREE.MeshStandardMaterial({color:'#71533a',roughness:1}),eye=new THREE.MeshStandardMaterial({color:'#172d24',roughness:.5});
 const sphere=new THREE.SphereGeometry(1,8,6),stem=new THREE.CylinderGeometry(.025,.035,1,5),pad=new THREE.CircleGeometry(.47,20,.15,Math.PI*2-.3);
 const ball=(parent,material,x,y,z,sx,sy,sz)=>{const mesh=new THREE.Mesh(sphere,material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;};
 for(const [i,a]of [.25,1.1,1.8,2.2,3.7,4.8,5.5].entries()){const x=QUIET_POOL.x+Math.cos(a)*QUIET_POOL.radiusX*.97,z=QUIET_POOL.z+Math.sin(a)*QUIET_POOL.radiusZ*.97,y=heightAt(x,z);
  for(let j=0;j<4;j++){const h=.65+(i+j)%4*.14,m=new THREE.Mesh(stem,reed);m.position.set(x+(j-1.5)*.13,y+h/2,z+Math.sin(j*2)*.16);m.scale.y=h;group.add(m);if(j%2===0)ball(group,brown,m.position.x,y+h-.05,m.position.z,.055,.13,.055);}
 }
 for(const [dx,dz]of [[-1,-2],[2,2],[-3,1],[3,-3]]){const lily=new THREE.Mesh(pad,green);lily.rotation.x=-Math.PI/2;lily.rotation.z=dx*.6;lily.position.set(QUIET_POOL.x+dx,STREAM_LEVEL+.025,QUIET_POOL.z+dz);group.add(lily);}
 for(const [i,a]of [.05,1.2,4.6].entries()){const x=QUIET_POOL.x+Math.cos(a)*QUIET_POOL.radiusX*.87,z=QUIET_POOL.z+Math.sin(a)*QUIET_POOL.radiusZ*.87,y=Math.max(heightAt(x,z),STREAM_LEVEL)+.09,frog=new THREE.Group();frog.position.set(x,y,z);frog.rotation.y=a+Math.PI;group.add(frog);frogs.push({object:frog,y,phase:i*2});
  ball(frog,green,0,.1,0,.29,.16,.24);ball(frog,green,0,.18,.18,.24,.15,.18);for(const side of [-1,1]){ball(frog,green,side*.27,.02,-.1,.17,.08,.23);ball(frog,green,side*.15,.31,.22,.08,.08,.08);ball(frog,eye,side*.15,.33,.28,.035,.04,.025);}
 }
 return {frogs,update(time){for(const frog of frogs)frog.object.position.y=frog.y+Math.sin(time*1.8+frog.phase)*.009;}};
}
