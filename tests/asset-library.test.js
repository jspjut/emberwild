import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {EXPANSION_ASSETS,ASSET_REGIONS,itemRecipe} from '../shared/complete-assets.js';
import {createExpansionAsset,animateExpansionAsset,expansionClips,expansionRig,disposeExpansionAsset} from '../client/asset-library/library.js';
import {equipmentRecipe} from '../client/equipment.js';
import {GEAR_SETS,ARMOR_ASSETS,EQUIPMENT_CLASSES,EQUIPMENT_SLOTS_ART,gearSetItems,equipmentUsage} from '../shared/equipment-collection.js';
import {createHumanoid,disposeHumanoid} from '../client/character.js';
const finiteBounds=root=>{const b=new THREE.Box3().setFromObject(root);assert.ok([...b.min,...b.max].every(Number.isFinite));assert.ok(b.max.y>b.min.y);return b;};

test('the complete collection has finite, grounded geometry and all regional recipes fit the art budget',()=>{
  assert.equal(EXPANSION_ASSETS.length,881);assert.equal(new Set(EXPANSION_ASSETS.map(d=>d.id)).size,881);assert.equal(Object.keys(ASSET_REGIONS).length,15);
  assert.deepEqual(Object.fromEntries(['creature','race','item','prop'].map(c=>[c,EXPANSION_ASSETS.filter(d=>d.category===c).length])),{creature:208,race:5,item:637,prop:31});
  for(const def of EXPANSION_ASSETS)for(const region of Object.keys(ASSET_REGIONS)){
    const root=createExpansionAsset(def.id,{region}),bounds=finiteBounds(root),info=root.userData.library;assert.ok(Math.abs(bounds.min.y)<.001,`${def.id} ground pivot`);assert.ok(info.triangles>0&&info.triangles<12000,`${def.id} mesh budget`);assert.equal(info.region,region);
    const names=[];root.traverse(n=>{names.push(n.name);if(n.geometry)for(const key of['position','normal'])assert.ok(n.geometry.attributes[key].array.every(Number.isFinite),`${def.id} ${key}`);});assert.equal(new Set(names).size,names.length);
    for(const state of['idle','walk','attack'])for(const time of[0,.25,.75]){animateExpansionAsset(root,state,time);finiteBounds(root);}
    for(const v of info.collision?.volumes||[])assert.ok([v.width,v.height,v.depth].every(n=>Number.isFinite(n)&&n>0));
    disposeExpansionAsset(root);
  }
});
test('animation is deterministic across state switches, clips loop continuously, and races retain every game equipment socket',()=>{
  for(const def of EXPANSION_ASSETS.filter(a=>['creature','race'].includes(a.category))){
    const root=createExpansionAsset(def.id);animateExpansionAsset(root,'idle',.3);const first=[];root.traverse(n=>first.push(...n.matrixWorld.elements));animateExpansionAsset(root,'attack',.6);animateExpansionAsset(root,'walk',.9);animateExpansionAsset(root,'idle',.3);const again=[];root.traverse(n=>again.push(...n.matrixWorld.elements));assert.deepEqual(again,first,def.id);
    const clips=expansionClips(root);assert.deepEqual(clips.map(c=>c.name),['Idle','Walk','Attack']);for(const c of clips)for(const t of c.tracks){assert.ok(t.values.every(Number.isFinite));const size=t.getValueSize();assert.deepEqual([...t.values.slice(0,size)],[...t.values.slice(-size)]);}
    if(def.category==='race'){const rig=expansionRig(root);for(const id of EXPANSION_ASSETS.filter(a=>a.category==='item').map(a=>a.id))for(const[socket,part]of Object.entries(equipmentRecipe(itemRecipe(id)))){assert.ok(rig.sockets[socket],`${def.id}: ${id} needs ${socket}`);rig.sockets[socket].add(part);assert.equal(part.parent,rig.sockets[socket]);part.removeFromParent();}}
    disposeExpansionAsset(root);
  }
});
test('every curated GLB passes a loader round trip, keeps its license/identity, and has a verified manifest hash',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../client/assets/library-manifest.json',import.meta.url),'utf8'));assert.equal(manifest.assets.length,EXPANSION_ASSETS.length);
  const loader=new GLTFLoader();
  for(const asset of manifest.assets){const bytes=await readFile(new URL(`../client/assets/${asset.modelFile}`,import.meta.url));assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
    const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');finiteBounds(gltf.scene);const info=gltf.scene.children[0].userData.library;assert.equal(info.id,asset.id);assert.equal(info.license,'MIT');assert.deepEqual(gltf.animations.map(c=>c.name),asset.animations);
    if(gltf.animations.length){const mixer=new THREE.AnimationMixer(gltf.scene);mixer.clipAction(gltf.animations[0]).play();mixer.update(.4);finiteBounds(gltf.scene);mixer.stopAllAction();mixer.uncacheRoot(gltf.scene);}
    const png=await readFile(new URL(`../client/assets/${asset.previewFile}`,import.meta.url));assert.equal(png.subarray(1,4).toString(),'PNG');
  }
});
test('the human uses the original game face, hair and proportions, and full sets animate on all five race rigs',()=>{
  const human=createExpansionAsset('human'),original=createHumanoid('#fff',false,'hearth'),r=expansionRig(human),o=original.userData.rig;
  assert.equal(r.face.children[0].material,o.face.children[0].material);assert.equal(r.hair.children.length,o.hair.children.length);assert.deepEqual(r.body.scale.toArray(),o.body.scale.toArray());assert.equal(human.userData.library.playable,true);disposeExpansionAsset(human);disposeHumanoid(original);
  for(const race of EXPANSION_ASSETS.filter(a=>a.category==='race'))for(const set of GEAR_SETS){
    const root=createExpansionAsset(race.id,{region:set.region,outfit:{setId:set.id}}),ids=new Set();root.traverse(n=>{if(n.userData.itemId)ids.add(n.userData.itemId);});assert.deepEqual([...ids].sort(),gearSetItems(set.id).sort());
    for(const state of['idle','walk','attack']){animateExpansionAsset(root,state,.4);finiteBounds(root);}assert.ok(root.userData.library.triangles<15000);disposeExpansionAsset(root);
  }
});
test('all 48 complete sets cover every intended slot and distinguish soft class preferences from signature restrictions',()=>{
  assert.equal(GEAR_SETS.length,48);assert.equal(ARMOR_ASSETS.length,384);
  for(const set of GEAR_SETS){const items=ARMOR_ASSETS.filter(a=>a.setId===set.id);assert.deepEqual(items.map(i=>i.slot).sort(),Object.keys(EQUIPMENT_SLOTS_ART).sort());for(const item of items){assert.equal(item.armorType,set.armorType);for(const id of item.classPreference)assert.ok(EQUIPMENT_CLASSES[id]);for(const role of Object.keys(EQUIPMENT_CLASSES))assert.equal(equipmentUsage(item,role).allowed,true);assert.equal(equipmentUsage(item,item.classPreference[0]).preferred,true);}}
  const oath=EXPANSION_ASSETS.find(a=>a.id==='dawnward_oathblade');assert.equal(equipmentUsage(oath,'dawnwarden').allowed,true);assert.equal(equipmentUsage(oath,'arcanist').allowed,false);assert.equal(equipmentUsage(oath,'arcanist').mode,'restricted');
  for(const type of['cloth','leather','mail','plate']){const field=GEAR_SETS.find(s=>s.armorType===type&&s.tier==='field'),boss=GEAR_SETS.find(s=>s.armorType===type&&s.tier==='boss');const a=createExpansionAsset(`${field.id}_shoulders`,{region:'cinderwood'}),b=createExpansionAsset(`${boss.id}_shoulders`,{region:'cinderwood'});assert.ok(b.userData.library.triangles>a.userData.library.triangles);assert.notDeepEqual(a.userData.library.bounds.size,b.userData.library.bounds.size);disposeExpansionAsset(a);disposeExpansionAsset(b);}
});
test('assembled set exports retain their outfit IDs, complete rig animations and manifest integrity',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../client/assets/library-manifest.json',import.meta.url),'utf8'));assert.equal(manifest.gearSets.length,48);
  for(const set of manifest.gearSets){const b=await readFile(new URL(`../client/assets/${set.modelFile}`,import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),set.sha256);const model=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');assert.equal(model.scene.children[0].userData.library.outfit.setId,set.id);assert.deepEqual(model.animations.map(a=>a.name),['Idle','Walk','Attack']);finiteBounds(model.scene);}
});
