import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import path from 'node:path';
import * as THREE from 'three';
import {normalizeAppearance,appearancePalette,CUSTOMIZATION_OPTIONS} from '../shared/character.js';
import {CharacterStore} from '../server/characters.js';
import {World} from '../server/world.js';
import {createHumanoid,animateHumanoid,disposeHumanoid} from '../client/character.js';
const customized={skin:'ebony',hairColor:'gold',hairStyle:'braid',facialHair:'full',eyeColor:'green',face:'angular',build:'broad'};
test('independent appearance options validate safely and old presets retain their skin/hair defaults',()=>{
  assert.equal(normalizeAppearance(null,'ash').skin,'bronze');assert.equal(normalizeAppearance(null,'grove').hairColor,'raven');assert.deepEqual(normalizeAppearance(customized),customized);
  const invalid=normalizeAppearance({skin:'<script>',hairStyle:{id:'bald'},build:'huge',unknown:'ignored'});assert.deepEqual(invalid,normalizeAppearance());assert.equal(appearancePalette(customized).skin,'#50382e');
});
test('every hairstyle and beard renders finite geometry and custom builds keep gear attached through animation and hats',()=>{
  const counts=[];
  for(const hairStyle of Object.keys(CUSTOMIZATION_OPTIONS.hairStyle))for(const facialHair of Object.keys(CUSTOMIZATION_OPTIONS.facialHair)){
    const o=createHumanoid('#888',false,'hearth',{...customized,hairStyle,facialHair}),r=o.userData.rig;o.userData.equipment.update({armor:'linen_coat',weapon:'training_blade',feet:'wayfarer_boots'});
    for(let i=0;i<60;i++)animateHumanoid(o,{x:i/60,z:0,facing:Math.PI/2,grounded:true},1/60,{},()=>0);o.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(o);assert.ok([bounds.min.x,bounds.min.y,bounds.min.z,bounds.max.x,bounds.max.y,bounds.max.z].every(Number.isFinite));assert.ok(bounds.max.y>1.8&&bounds.max.y<2.8);
    assert.equal(o.userData.equipment.pieces.get('weapon').parts.rightHand.parent,r.sockets.rightHand);assert.ok(r.body.scale.x>1);counts.push(r.hair.children.length);
    o.userData.equipment.update({head:'trail_cap'});assert.equal(r.hair.visible,false);o.userData.equipment.clear();assert.equal(r.hair.visible,true);disposeHumanoid(o);
  }
  assert.ok(new Set(counts).size>=4,'styles have different authored silhouettes');
});
test('creation and offline customization persist all options and preserve progression, inventory and equipment',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'emberwild-customize-'));
  try{
    const file=path.join(dir,'characters.json'),store=await CharacterStore.open(file),key=await store.session(),other=await store.session();const id=await store.create(key,'Custom Warden','grove',0,customized),pkey=store.data.accounts[key].characters[0];
    const w=new World(),p=w.addPlayer('Custom Warden',store.profile(pkey));p.xp=950;p.gold=80;p.inventory.copper_blade=1;p.equipment.weapon='copper_blade';await store.saveProfiles([[pkey,w.save(p)]]);
    assert.deepEqual(w.snapshot(p).players[0].appearance,customized);
    const before=store.profile(pkey),changed={...customized,hairStyle:'ponytail',facialHair:'none',build:'slender'};
    await assert.rejects(store.customize(other,id,'hearth',changed,0,()=>false),/roster/);await assert.rejects(store.customize(key,id,'hearth',changed,1,()=>true),/Log.*out/);
    await store.customize(key,id,'hearth',changed,1,()=>false);const after=(await CharacterStore.open(file)).profile(pkey);assert.deepEqual(after.appearance,changed);for(const field of ['xp','gold','inventory','equipment','quests','x','z'])assert.deepEqual(after[field],before[field]);
    assert.deepEqual((await CharacterStore.open(file)).roster(key).characters[0].appearance,changed);
  }finally{await rm(dir,{recursive:true,force:true});}
});
