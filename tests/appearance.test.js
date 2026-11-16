import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {World} from '../server/world.js';
import {ITEMS,VISIBLE_EQUIPMENT_SLOTS,compatibleEquipmentSlots,visibleEquipment} from '../shared/content.js';
import {CharacterEquipment,equipmentModel} from '../client/equipment.js';

function rig(){
  const sockets=Object.fromEntries(['torso','head','leftHand','rightHand','leftSleeve','rightSleeve','leftForearm','rightForearm','leftThigh','rightThigh','leftShin','rightShin','leftFoot','rightFoot'].map(key=>[key,new THREE.Group()]));
  return {sockets,hair:{visible:true},baseTorso:{visible:true},baseFeet:[{visible:true},{visible:true}],baseLegs:Array.from({length:4},()=>({visible:true}))};
}
const outfit={weapon:'dawn_blade',offhand:'outpost_buckler',head:'trail_cap',armor:'sentinel_coat',legs:'road_trousers',feet:'wayfarer_boots'};
test('every item for a supported visible slot has a complete, finite original model',()=>{
  const covered=new Set();
  for(const [id,item]of Object.entries(ITEMS)){
    const slot=compatibleEquipmentSlots(item).find(s=>VISIBLE_EQUIPMENT_SLOTS.includes(s.id));if(!slot)continue;
    covered.add(slot.id);const model=equipmentModel(id);assert.ok(model,`Missing model for ${id}`);
    const meshes=Object.values(model).flatMap(p=>p.children);assert.ok(meshes.length>0);
    for(const m of meshes){assert.ok(m.geometry.attributes.position.count>0);assert.ok([...m.geometry.attributes.position.array,...m.geometry.attributes.normal.array].every(Number.isFinite));assert.ok(m.castShadow);}
  }
  assert.deepEqual([...covered].sort(),[...VISIBLE_EQUIPMENT_SLOTS].sort());assert.equal(equipmentModel('trail_charm'),null);
  const weapons=['training_blade','copper_blade','dawn_blade'].map(id=>Object.values(equipmentModel(id)).flatMap(p=>p.children).map(m=>[m.material.color.getHex(),m.geometry.attributes.position.count]));
  assert.notDeepEqual(weapons[0],weapons[1]);assert.notDeepEqual(weapons[1],weapons[2]);
});
test('equipment follows animated joints, swaps without accumulating meshes, and restores base clothing',()=>{
  const r=rig(),gear=new CharacterEquipment(r);gear.update(outfit);
  assert.equal(gear.pieces.size,6);assert.equal(r.hair.visible,false);assert.equal(r.baseTorso.visible,false);assert.ok(r.baseFeet.every(m=>!m.visible));
  const blade=gear.pieces.get('weapon').parts.rightHand,boot=gear.pieces.get('feet').parts.leftFoot;
  assert.equal(blade.parent,r.sockets.rightHand);assert.equal(boot.parent,r.sockets.leftFoot);
  r.sockets.rightHand.position.set(3,2,1);r.sockets.rightHand.rotation.x=1.4;r.sockets.leftFoot.position.set(0,.5,.3);
  const vertex=new THREE.Vector3().fromBufferAttribute(blade.children[0].geometry.attributes.position,0),before=vertex.clone();
  blade.children[0].localToWorld(vertex);assert.ok(vertex.distanceTo(before)>1,'weapon vertices move with the animated hand');
  assert.ok(boot.getWorldPosition(new THREE.Vector3()).distanceTo(new THREE.Vector3(0,.5,.3))<1e-6);
  gear.update({...outfit,charm:'trail_charm'});assert.equal(gear.pieces.get('weapon').parts.rightHand,blade,'ordinary snapshots do not rebuild items');
  const childCounts=Object.values(r.sockets).map(s=>s.children.length);
  for(let i=0;i<50;i++){gear.update({...outfit,weapon:i%2?'copper_blade':'training_blade'});assert.deepEqual(Object.values(r.sockets).map(s=>s.children.length),childCounts);}
  assert.equal(blade.parent,null);gear.clear();assert.equal(gear.pieces.size,0);assert.ok(Object.values(r.sockets).every(s=>s.children.length===0));
  assert.ok(r.hair.visible&&r.baseTorso.visible&&r.baseFeet.every(m=>m.visible)&&r.baseLegs.every(m=>m.visible));
  const a=equipmentModel('dawn_blade'),b=equipmentModel('dawn_blade');assert.notEqual(a.rightHand,b.rightHand);assert.equal(a.rightHand.children[0].geometry,b.rightHand.children[0].geometry,'characters share baked assets');
  gear.update({head:'training_blade',weapon:'missing',charm:'trail_charm'});assert.equal(gear.pieces.size,0);
});
test('trail gear can be bought, equipped, seen by peers and saved without revealing bags or jewelry',()=>{
  const w=new World(),p=w.addPlayer('Outfitter'),observer=w.addPlayer('Observer');Object.assign(p,w.npcs.find(n=>n.id==='tavi')&&{x:w.npcs.find(n=>n.id==='tavi').x,z:w.npcs.find(n=>n.id==='tavi').z});p.gold=100;
  for(const [slot,item]of Object.entries(outfit)){
    if(['weapon','armor'].includes(slot))p.inventory[item]=1;else w.command(p,{type:'trade',action:'buy',item});
    w.command(p,{type:'equip',item,slot});assert.equal(p.equipment[slot],item);
  }
  p.inventory.trail_charm=1;w.command(p,{type:'equip',item:'trail_charm'});
  const publicPlayer=w.snapshot(observer).players.find(v=>v.id===p.id);assert.deepEqual(publicPlayer.equipment,{...outfit,shoulders:null,hands:null,waist:null,back:null});assert.equal(publicPlayer.inventory,undefined);assert.equal(publicPlayer.equipment.charm,undefined);
  w.command(p,{type:'unequip',slot:'offhand'});assert.equal(w.snapshot(observer).players.find(v=>v.id===p.id).equipment.offhand,null);
  assert.deepEqual(publicPlayer.equipment,{...outfit,shoulders:null,hands:null,waist:null,back:null},'snapshots keep their own appearance values');
  const restored=new World().addPlayer(p.name,w.save(p));assert.deepEqual(restored.equipment,p.equipment);assert.deepEqual(visibleEquipment(restored.equipment),{...outfit,shoulders:null,hands:null,waist:null,back:null,offhand:null});
});
