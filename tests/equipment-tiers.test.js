import {prepareLivePatch} from '../shared/live-content.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {EQUIPMENT_BANDS,PROGRESSION_SETS,PROGRESSION_WEAPONS,WEAPON_FAMILIES} from '../shared/equipment-tiers.js';
import {GEAR_SETS,ARMOR_ASSETS,EQUIPMENT_SLOTS_ART} from '../shared/equipment-collection.js';
import {EXPANSION_ASSETS} from '../shared/complete-assets.js';
import {ITEMS} from '../shared/content.js';
import {createExpansionAsset,disposeExpansionAsset} from '../client/asset-library/library.js';
function shape(id,region='cinderwood'){
 const root=createExpansionAsset(id,{region}),h=createHash('sha256'),vertices=[];root.updateMatrixWorld(true);const v=new THREE.Vector3();root.traverse(n=>{if(n.isMesh){const p=n.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(n.matrixWorld);vertices.push(v.toArray().map(n=>n.toFixed(5)).join(','));}}});vertices.sort();h.update(vertices.join(';'));disposeExpansionAsset(root);return h.digest('hex');
}
test('ten authored equipment bands cover every level and add forty complete armor sets',()=>{
 assert.equal(EQUIPMENT_BANDS.length,10);for(let level=1;level<=100;level++)assert.equal(EQUIPMENT_BANDS.filter(b=>level>=b.min&&level<=b.max).length,1);
 assert.equal(PROGRESSION_SETS.length,40);assert.equal(GEAR_SETS.length,48);assert.equal(ARMOR_ASSETS.length,384);
 for(const type of ['cloth','leather','mail','plate']){const sets=PROGRESSION_SETS.filter(s=>s.armorType===type);assert.deepEqual(sets.map(s=>s.shapeTier),[1,2,3,4,5,6,7,8,9,10]);for(const s of sets)assert.equal(ARMOR_ASSETS.filter(a=>a.setId===s.id).length,8);}
 for(const id of ['wayfarer_cloth','astral_cloth','trailhide_leather','briar_leather','riveted_mail','tide_mail','bastion_plate','dawn_plate'])assert.ok(GEAR_SETS.some(s=>s.id===id));
});
test('each armor slot has ten geometrically different looks per material, independent of palette',()=>{
 for(const type of ['cloth','leather','mail','plate'])for(const slot of Object.keys(EQUIPMENT_SLOTS_ART)){
  const items=ARMOR_ASSETS.filter(a=>a.armorType===type&&a.slot===slot&&a.shapeTier);assert.equal(items.length,10);assert.equal(new Set(items.map(a=>shape(a.id))).size,10,`${type} ${slot} needs ten physical shapes`);
 }
 for(const set of PROGRESSION_SETS){const id=`${set.id}_armor`;assert.equal(shape(id,'cinderwood'),shape(id,'astral'),`${id}: recoloring must preserve geometry`);}
});
test('all eleven weapon families have ten distinct geometries and themed recolors retain their silhouettes',()=>{
 assert.equal(PROGRESSION_WEAPONS.length,110);for(const model of WEAPON_FAMILIES){const designs=PROGRESSION_WEAPONS.filter(a=>a.model===model);assert.equal(new Set(designs.map(a=>shape(a.id))).size,10,model);for(const d of designs)assert.equal(shape(d.id,'cinderwood'),shape(d.id,'coral'),d.id);}
});
test('the catalog includes every original design and every live game equipment appearance',()=>{
 assert.equal(EXPANSION_ASSETS.length,881);assert.equal(new Set(EXPANSION_ASSETS.map(a=>a.id)).size,881);
 for(const [id,item]of Object.entries(ITEMS).filter(([,i])=>i.appearance&&!i.templateOnly)){const a=EXPANSION_ASSETS.find(a=>a.sourceItemId===id);assert.ok(a,id);assert.deepEqual(a.runtimeAppearance,item.appearance);const root=createExpansionAsset(a.id);assert.ok(root.userData.library.triangles>0);disposeExpansionAsset(root);}
});

test('new shape templates are available to later live items without activating drops',()=>{
 const patch=prepareLivePatch({id:'new-gear-template-check',worldId:'emberwild',items:{future_plate:{template:'tier05_plate_armor',values:{name:'Future oathplate',armor:12}},future_wand:{template:'tier09_wand',values:{name:'Future crystal wand',power:30}}}});
 assert.equal(patch.additions.items.future_plate.appearance.shapeTier,5);assert.equal(patch.additions.items.future_plate.appearance.armorType,'plate');assert.equal(patch.additions.items.future_wand.appearance.shapeTier,9);assert.equal(patch.additions.items.future_wand.appearance.model,'wand');assert.equal(ITEMS.future_plate,undefined);
});
