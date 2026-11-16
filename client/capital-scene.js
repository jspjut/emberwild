import {buildingAt} from '/shared/buildings.js';
import * as THREE from 'three';
import {CAPITAL_WALL_POSTS,CAPITAL_OUTLINE,CAPITAL_DISTRICTS} from '/shared/capital.js';
import {heightAt,STREAM_LEVEL} from '/shared/terrain.js';
const paint=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.87,...extra});
export function buildCapitalDecor(scene,{pathDistance=()=>Infinity}={}){
 const root=new THREE.Group();root.name='Alderhaven-city';scene.add(root);
 const stone=paint('#a3a99a'),trim=paint('#c9c6ad'),roof=paint('#547a7c'),wood=paint('#716248'),gold=paint('#c4ae73');
 const box=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;};
 // Sampled masonry matches the shared city wall collision, including both gates.
 const wall=new THREE.InstancedMesh(new THREE.BoxGeometry(3.2,14,3.2),stone,CAPITAL_WALL_POSTS.length),dummy=new THREE.Object3D();
 CAPITAL_WALL_POSTS.forEach((p,i)=>{dummy.position.set(p.x,heightAt(p.x,p.z)+7,p.z);dummy.updateMatrix();wall.setMatrixAt(i,dummy.matrix);});wall.receiveShadow=true;root.add(wall);
 for(const [x,z]of CAPITAL_OUTLINE){const tower=new THREE.Mesh(new THREE.CylinderGeometry(6.2,7,25,12),stone);tower.position.set(x,heightAt(x,z)+12.5,z);tower.castShadow=true;root.add(tower);const cap=new THREE.Mesh(new THREE.ConeGeometry(7,9,12),roof);cap.position.set(x,heightAt(x,z)+29.5,z);root.add(cap);}
 // The western arch clears the player and camera; the gate has no closing barrier.
 box(3,25,7,stone,390,12.7,126);box(3,25,7,stone,390,12.7,158);box(4,4,35,trim,390,26.7,142);
 for(const z of [126,158]){box(1,10,4,gold,387.8,15,z);box(.15,8,3.2,roof,387.1,14,z);}
 // Garden trees are intentionally clustered, leaving broad shared paths open.
 for(const d of CAPITAL_DISTRICTS)for(let i=0;i<(d.id==='gardens'?28:5);i++){const a=i*2.399,r=d.id==='gardens'?48+Math.sin(i*4)*18:30+i%3*11,x=d.x+Math.cos(a)*r,z=d.z+Math.sin(a)*r;if(d.id==='civic'||d.id==='archive'||pathDistance(x,z)<8||buildingAt(x,z,5))continue;const y=heightAt(x,z);const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.38,4,7),wood);trunk.position.set(x,y+2,z);root.add(trunk);const crown=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),paint(d.id==='gardens'?'#87a576':'#7e9869'));crown.position.set(x,y+5,z);crown.scale.set(2.8,3.4,2.7);root.add(crown);}
 const riverGeometry=new THREE.PlaneGeometry(32,820,4,82);riverGeometry.rotateX(-Math.PI/2);riverGeometry.translate(1162,STREAM_LEVEL,145);const water=new THREE.Mesh(riverGeometry,new THREE.MeshStandardMaterial({color:'#6b999d',transparent:true,opacity:.86,roughness:.22,metalness:.1}));root.add(water);
 return {root,water};
}
