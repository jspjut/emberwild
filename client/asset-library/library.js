import * as THREE from 'three';
import {ASSET_REGIONS,expansionAsset,assetRegion,itemRecipe} from '../../shared/complete-assets.js';
import {equipmentRecipe} from '../equipment.js';
import {group} from './primitives.js';
import {creatureAsset} from './creatures.js';
import {raceAsset} from './races.js';
import {propAsset} from './props.js';

const controllers=new WeakMap();
const socketPositions={torso:[0,0,0],head:[0,1.98,0],leftSleeve:[-.4,1.55,0],rightSleeve:[.4,1.55,0],leftForearm:[-.43,1.22,0],rightForearm:[.43,1.22,0],leftHand:[-.43,1.22,0],rightHand:[.43,1.22,0],leftThigh:[-.17,.95,0],rightThigh:[.17,.95,0],leftShin:[-.17,.52,0],rightShin:[.17,.52,0],leftFoot:[-.17,.09,0],rightFoot:[.17,.09,0]};
function equipmentAsset(def,region){const root=group(null,def.id),recipe=itemRecipe(def,region),parts=equipmentRecipe(recipe);for(const[socket,part]of Object.entries(parts)){part.position.set(...socketPositions[socket]);part.userData.socket=socket;root.add(part);}return {root,joints:[],recipe,sockets:Object.keys(parts)};}
export function createExpansionAsset(id,{region,outfit}={}){
  const def=expansionAsset(id);if(!def)throw Error(`Unknown expansion asset: ${id}`);
  region=Object.hasOwn(ASSET_REGIONS,region)?region:def.region;const palette=assetRegion(region);
  const model=def.category==='creature'?creatureAsset(def,palette,region):def.category==='race'?raceAsset(def,palette,region,outfit):def.category==='prop'?propAsset(def,palette,region):equipmentAsset(def,region);
  const root=group(null,`asset_${id}`);root.add(model.root);
  root.updateMatrixWorld(true);const raw=new THREE.Box3().setFromObject(root),offset=-raw.min.y;model.root.position.y+=offset;root.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3());
  let index=0;root.traverse(n=>{n.name=`${id}_${index++}`;});
  const joints=[...new Set(model.joints)],rest=joints.map(node=>({node,position:node.position.clone(),quaternion:node.quaternion.clone(),scale:node.scale.clone()}));
  controllers.set(root,{...model,def,rest});
  let triangles=0,meshes=0;root.traverseVisible(n=>{if(n.isMesh){meshes++;triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;}});
  root.userData.library={id,name:def.name,category:def.category,region,license:'MIT',units:'meters',forward:'+Z',up:'+Y',pivot:'ground center',modelOffsetY:offset,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray(),size:size.toArray()},triangles,meshes,collision:def.category==='prop'?{volumes:(model.colliders||[]).map(v=>({...v,y:v.y+offset}))}:['race','creature'].includes(def.category)?{type:'capsule',radius:Math.min(size.x*.35,.55),height:size.y}:null,sockets:model.sockets||model.rig&&Object.keys(model.rig.sockets)||[],recipe:model.recipe||undefined,...outfit?{outfit}:{}};
  if(def.category==='item')root.userData.library.equipmentIntent={slot:def.slot,armorType:def.armorType,setId:def.setId,rarity:def.rarity||null,plannedLevels:def.plannedLevels,classPreference:def.classPreference,allowedClasses:def.allowedClasses,handedness:def.handedness||1,source:def.source};
  if(def.playable)root.userData.library.playable=true;
  animateExpansionAsset(root,'idle',0);return root;
}
export function animateExpansionAsset(root,state='idle',time=0){const control=controllers.get(root);if(!control)return;for(const r of control.rest){r.node.position.copy(r.position);r.node.quaternion.copy(r.quaternion);r.node.scale.copy(r.scale);}control.animate?.(time,state);root.updateMatrixWorld(true);}
// The network animator filters speed and supplies distance-based gait phase.
// Blend actual idle/walk poses rather than toggling whole rigs at a per-frame
// displacement threshold (which changes behavior with the display refresh rate).
export function animateExpansionLocomotion(root,time,animation,{dead=false}={}){
 const control=controllers.get(root);if(!control)return;
 if(dead){animateExpansionAsset(root,'idle',0);return;}
 animateExpansionAsset(root,'idle',time%4);
 const idle=control.blendPose??=control.rest.map(()=>({position:new THREE.Vector3(),quaternion:new THREE.Quaternion(),scale:new THREE.Vector3()}));
 control.rest.forEach(({node},i)=>{idle[i].position.copy(node.position);idle[i].quaternion.copy(node.quaternion);idle[i].scale.copy(node.scale);});
 animateExpansionAsset(root,'walk',animation.phase/(Math.PI*2));
 const weight=animation.move;
 control.rest.forEach(({node},i)=>{node.position.lerpVectors(idle[i].position,node.position,weight);node.quaternion.slerpQuaternions(idle[i].quaternion,node.quaternion,weight);node.scale.lerpVectors(idle[i].scale,node.scale,weight);});
 const body=control.rest[0]?.node;if(body){body.position.z+=animation.lunge||0;body.rotation.x-=(animation.attack||0)*.15+(animation.windup||0)*.12;}
 root.updateMatrixWorld(true);
}
export function expansionRig(root){return controllers.get(root)?.rig||null;}
export function dressExpansionRace(root,enabled){controllers.get(root)?.dress?.(enabled);}
export function expansionClips(root){
  const control=controllers.get(root);if(!control?.rest.length)return [];
  const states=['creature','race'].includes(control.def.category)?[['idle',4,'Idle'],['walk',1,'Walk'],['attack',1.2,'Attack']]:[['idle',4,'Sway']];
  const clips=[];
  for(const[state,duration,name]of states){
    const samples=Math.ceil(duration*20),times=Array.from({length:samples+1},(_,i)=>i/samples*duration),values=control.rest.map(()=>({position:[],quaternion:[],scale:[]}));
    times.forEach(t=>{animateExpansionAsset(root,state,t);control.rest.forEach(({node},i)=>{values[i].position.push(...node.position.toArray());values[i].quaternion.push(...node.quaternion.toArray());values[i].scale.push(...node.scale.toArray());});});
    const tracks=[];control.rest.forEach(({node},i)=>{for(const[property,stride,Track]of[['position',3,THREE.VectorKeyframeTrack],['quaternion',4,THREE.QuaternionKeyframeTrack],['scale',3,THREE.VectorKeyframeTrack]]){const v=values[i][property];if(!v.some((n,index)=>Math.abs(n-v[index%stride])>1e-6))continue;for(let k=0;k<stride;k++)v[v.length-stride+k]=v[k];tracks.push(new Track(`${node.name}.${property}`,times,v));}});
    if(tracks.length)clips.push(new THREE.AnimationClip(name,duration,tracks));
  }
  animateExpansionAsset(root,'idle',0);return clips;
}
export function disposeExpansionAsset(root){root.removeFromParent();root.traverse(n=>{if(n.geometry&&!n.geometry.userData.libraryShared&&!n.geometry.userData.equipmentAsset)n.geometry.dispose();if(n.material?.userData.libraryOwned)n.material.dispose();});controllers.delete(root);}
