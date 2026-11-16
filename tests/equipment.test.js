import test from 'node:test';import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {ITEMS,EQUIPMENT_SLOTS,compatibleEquipmentSlots,normalizeEquipment,bagEntries,storedItemCount,stats} from '../shared/content.js';
// Fixtures exercise future content without adding late-game drops to the starter zone.
Object.assign(ITEMS,{
 test_ring:{name:'Test ring',slot:'ring',vitality:8,power:2,quality:'common',sell:2},
 test_ring_upgrade:{name:'Test ring upgrade',slot:'ring',vitality:12,power:3,quality:'common'},
 test_trinket:{name:'Test trinket',slot:'trinket',power:3,quality:'common'},
 test_boots:{name:'Test boots',slot:'feet',armor:1,quality:'common'},
 test_cloak:{name:'Test cloak',slot:'back',armor:1,vitality:5,quality:'common'},
 test_shield:{name:'Test shield',slot:'offhand',armor:2,quality:'common'}
});
const equip=(w,p,item,slot)=>w.command(p,{type:'equip',item,...(slot?{slot}:{})});
test('all nineteen equipment positions exist at level one, with only starter weapon and chest filled',()=>{
 const w=new World(),p=w.addPlayer('Starter');assert.equal(EQUIPMENT_SLOTS.length,19);assert.equal(Object.keys(p.equipment).length,19);
 assert.deepEqual(Object.entries(p.equipment).filter(([,id])=>id),[['armor','linen_coat'],['weapon','training_blade']]);
 for(const id of ['head','neck','shoulders','ring1','ring2','charm','trinket2','offhand','relic'])assert.equal(p.equipment[id],null);
 assert.deepEqual(stats(p),{maxHp:120,power:5,armor:0});
});
test('old three-slot saves retain their gear and stats, and round-trip as the complete layout',()=>{
 const w=new World(),p=w.addPlayer('Old save',{inventory:{training_blade:1,linen_coat:1,trail_charm:1},equipment:{weapon:'training_blade',armor:'linen_coat',charm:'trail_charm'}});
 assert.equal(p.equipment.weapon,'training_blade');assert.equal(p.equipment.armor,'linen_coat');assert.equal(p.equipment.charm,'trail_charm');assert.equal(stats(p).maxHp,135);assert.equal(Object.keys(p.equipment).length,19);
 assert.deepEqual(new World().addPlayer(p.name,w.save(p)).equipment,p.equipment);
 const invalid=normalizeEquipment({...p.equipment,head:'training_blade',ring1:'trail_charm',trinket2:'trail_charm'},{...p.inventory});assert.equal(invalid.head,null);assert.equal(invalid.ring1,null);assert.equal(invalid.charm,'trail_charm');assert.equal(invalid.trinket2,null);
});
test('rings and trinkets choose empty paired slots, require a spare owned copy, and preserve ownership',()=>{
 const w=new World(),p=w.addPlayer('Jewelry');p.inventory.test_ring=2;p.inventory.test_trinket=2;
 equip(w,p,'test_ring');equip(w,p,'test_ring');equip(w,p,'test_trinket');equip(w,p,'test_trinket');
 assert.equal(p.equipment.ring1,'test_ring');assert.equal(p.equipment.ring2,'test_ring');assert.equal(p.equipment.charm,'test_trinket');assert.equal(p.equipment.trinket2,'test_trinket');
 assert.equal(p.inventory.test_ring,2);assert.equal(storedItemCount(p,'test_ring'),0);assert.ok(!bagEntries(p).some(e=>e.id==='test_ring'));
 assert.deepEqual(stats(p),{maxHp:136,power:15,armor:0});
 w.command(p,{type:'unequip',slot:'ring2'});assert.equal(storedItemCount(p,'test_ring'),1);equip(w,p,'test_ring','ring2');assert.equal(storedItemCount(p,'test_ring'),0);
 const q=w.addPlayer('One copy');q.inventory.test_ring=1;equip(w,q,'test_ring','ring1');equip(w,q,'test_ring','ring2');assert.equal(q.equipment.ring2,null);assert.equal(q.inventory.test_ring,1);
});
test('explicit slot swaps, compatibility checks, stats from every slot and save validation work',()=>{
 const w=new World(),p=w.addPlayer('Outfitted');Object.assign(p.inventory,{test_ring:1,test_ring_upgrade:1,test_boots:1,test_cloak:1,test_shield:1});
 equip(w,p,'test_ring','ring2');equip(w,p,'test_ring_upgrade','ring2');assert.equal(storedItemCount(p,'test_ring'),1);assert.equal(p.equipment.ring1,null);
 for(const [item,slot]of [['test_boots','feet'],['test_cloak','back'],['test_shield','offhand']])equip(w,p,item,slot);
 assert.deepEqual(stats(p),{maxHp:137,power:8,armor:4});assert.deepEqual(new World().addPlayer(p.name,w.save(p)).equipment,p.equipment);
 equip(w,p,'test_ring','head');equip(w,p,'training_blade','offhand');equip(w,p,'test_ring','__proto__');assert.equal(p.equipment.head,null);assert.equal(p.equipment.offhand,'test_shield');assert.equal(Object.hasOwn(p.equipment,'__proto__'),false);
 assert.deepEqual(compatibleEquipmentSlots('test_ring').map(s=>s.id),['ring1','ring2']);assert.deepEqual(compatibleEquipmentSlots('trail_charm').map(s=>s.id),['charm','trinket2']);
});
test('full bags refuse unequipping expanded slots, and vitality removal clamps current health',()=>{
 const w=new World(),p=w.addPlayer('Full bags');p.inventory.test_ring=1;equip(w,p,'test_ring','ring2');p.hp=stats(p).maxHp;p.inventory.resin=99*19;
 assert.equal(bagEntries(p).length,20);w.command(p,{type:'unequip',slot:'ring2'});assert.equal(p.equipment.ring2,'test_ring');assert.equal(p.hp,128);
 delete p.inventory.resin;w.command(p,{type:'unequip',slot:'ring2'});assert.equal(p.equipment.ring2,null);assert.equal(p.hp,120);assert.equal(storedItemCount(p,'test_ring'),1);
});
test('merchant sales exclude both equipped copies of a paired item',()=>{
 const w=new World(),p=w.addPlayer('Selling');p.x=w.npcs.find(n=>n.id==='tavi').x;p.z=w.npcs.find(n=>n.id==='tavi').z;p.inventory.test_ring=3;equip(w,p,'test_ring');equip(w,p,'test_ring');
 w.command(p,{type:'trade',action:'sellItem',item:'test_ring',all:true});assert.equal(p.inventory.test_ring,2);assert.equal(p.gold,2);w.command(p,{type:'trade',action:'sellItem',item:'test_ring',all:true});assert.equal(p.inventory.test_ring,2);assert.equal(p.gold,2);
});
