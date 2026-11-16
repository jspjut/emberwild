import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {CharacterStore} from '../server/characters.js';
import {BANK_CAPACITY,bankEntries} from '../shared/storage.js';
import {ITEMS,NPCS,MERCHANT_STOCK,inventoryCapacity,bagEntries,stats} from '../shared/content.js';
import {BAG_PROGRESSION,LIVE_LEVEL_CAP} from '../shared/progression.js';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
function fixture(){const w=new World(),p=w.addPlayer('Banker'),npc={id:'future-banker',name:'Future Banker',role:'banker',services:['bank'],x:p.x,z:p.z,hp:180};w.npcs.push(npc);w.command(p,{type:'bank',action:'open',npcId:npc.id});return {w,p,npc};}
const transfer=(w,p,action,item,count=1)=>w.command(p,{type:'bank',action,item,count});

test('bag upgrades start small, grow gradually and reserve 28 slots for level 100',()=>{
 assert.deepEqual(BAG_PROGRESSION.map(b=>b.slots),[6,8,10,12,14,16,18,20,22,24,26,28]);assert.equal(BAG_PROGRESSION.at(-1).minLevel,100);
 for(let i=0;i<BAG_PROGRESSION.length;i++){const b=BAG_PROGRESSION[i];assert.equal(ITEMS[b.id].minLevel,b.minLevel);if(i)assert.ok(b.minLevel>BAG_PROGRESSION[i-1].minLevel);if(b.minLevel>LIVE_LEVEL_CAP)assert.ok(!MERCHANT_STOCK.includes(b.id));}
 assert.deepEqual(MERCHANT_STOCK.filter(id=>ITEMS[id].bagSlots).map(id=>ITEMS[id].bagSlots),[6,8]);
 const w=new World(),p=w.addPlayer('Packer');p.inventory.worldstrider_pack=4;p.level=99;w.command(p,{type:'equipBag',item:'worldstrider_pack'});assert.equal(inventoryCapacity(p),20);p.level=100;for(let index=0;index<4;index++)w.command(p,{type:'equipBag',item:'worldstrider_pack',index});assert.equal(inventoryCapacity(p),132);
});

test('early merchants and bag commands enforce level requirements; existing larger bags retain items and capacity',()=>{
 const w=new World(),p=w.addPlayer('Early');p.x=NPCS[1].x;p.z=NPCS[1].z;p.gold=100;
 w.command(p,{type:'trade',action:'buy',item:'trail_satchel'});assert.equal(p.inventory.trail_satchel,undefined);assert.equal(p.gold,100);
 p.inventory.trail_satchel=1;w.command(p,{type:'equipBag',item:'trail_satchel'});assert.equal(p.bags[0],null);p.level=3;w.command(p,{type:'equipBag',item:'trail_satchel'});assert.equal(inventoryCapacity(p),28);
 w.command(p,{type:'trade',action:'buy',item:'ranger_pack'});assert.equal(p.inventory.ranger_pack,undefined);
 const legacy=new World().addPlayer('Existing',{bags:Array(4).fill('ranger_pack'),inventory:{ranger_pack:4,resin:99*60},xp:0});assert.equal(inventoryCapacity(legacy),68);assert.equal(legacy.inventory.resin,99*60);const reloaded=new World().addPlayer(legacy.name,structuredClone(w.save(legacy)));assert.equal(inventoryCapacity(reloaded),68);assert.deepEqual(reloaded.inventory,legacy.inventory);
});

test('bank access requires a living nearby banker and is unavailable away from the capital bank',()=>{
 assert.equal(NPCS.filter(n=>n.role==='banker').length,1);
 const w=new World(),p=w.addPlayer('Remote');p.bank={resin:20};p.inventory.resin=10;
 for(const n of NPCS.filter(n=>n.role!=='banker')){p.x=n.x;p.z=n.z;w.command(p,{type:'bank',action:'open',npcId:n.id});assert.equal(w.snapshot(p).self.bank,null);}
 transfer(w,p,'withdraw','resin',20);transfer(w,p,'deposit','resin',10);assert.equal(p.bank.resin,20);assert.equal(p.inventory.resin,10);
 const f=fixture();assert.equal(f.w.snapshot(f.p).self.bank.capacity,BANK_CAPACITY);f.p.x+=5.1;transfer(f.w,f.p,'deposit','potion');assert.equal(f.p.bankNpcId,null);assert.equal(f.w.snapshot(f.p).self.bank,null);
});

test('bank transfers conserve items, split stacks, exclude equipped copies and preserve combat stats',()=>{
 const {w,p}=fixture();p.inventory.resin=150;transfer(w,p,'deposit','resin',99);transfer(w,p,'deposit','resin',51);assert.equal(p.inventory.resin,undefined);assert.equal(p.bank.resin,150);assert.deepEqual(bankEntries(p),[{id:'resin',count:99},{id:'resin',count:51}]);
 transfer(w,p,'withdraw','resin',99);assert.equal(p.inventory.resin,99);assert.equal(p.bank.resin,51);transfer(w,p,'withdraw','resin',99);assert.equal(p.inventory.resin,150);assert.equal(p.bank.resin,undefined);
 const before=stats(p);transfer(w,p,'deposit','training_blade');assert.equal(p.bank.training_blade,undefined);p.inventory.training_blade++;transfer(w,p,'deposit','training_blade');assert.equal(p.bank.training_blade,1);assert.equal(p.inventory.training_blade,1);assert.equal(p.equipment.weapon,'training_blade');assert.deepEqual(stats(p),before);
 p.inventory.linen_pouch=2;w.command(p,{type:'equipBag',item:'linen_pouch'});transfer(w,p,'deposit','linen_pouch');assert.equal(p.bank.linen_pouch,1);assert.equal(p.inventory.linen_pouch,1);assert.equal(inventoryCapacity(p),26);transfer(w,p,'deposit','linen_pouch');assert.equal(p.bank.linen_pouch,1);
});

test('full-bank and full-bag failures are atomic, while partial existing stacks can still be filled',()=>{
 const {w,p}=fixture();p.bank={resin:99*28};p.inventory.copper_ore=1;let before=structuredClone({bank:p.bank,inventory:p.inventory});transfer(w,p,'deposit','copper_ore');assert.deepEqual({bank:p.bank,inventory:p.inventory},before);
 p.bank.resin--;p.inventory.resin=2;before=structuredClone({bank:p.bank,inventory:p.inventory});transfer(w,p,'deposit','resin',2);assert.deepEqual({bank:p.bank,inventory:p.inventory},before);transfer(w,p,'deposit','resin');assert.equal(p.inventory.resin,1);assert.equal(bankEntries(p).length,28);
 p.inventory={potion:99,resin:99*19};p.bank={copper_ore:1,resin:2};assert.equal(bagEntries(p).length,20);before=structuredClone({bank:p.bank,inventory:p.inventory});transfer(w,p,'withdraw','copper_ore');assert.deepEqual({bank:p.bank,inventory:p.inventory},before);
 p.inventory.resin--;transfer(w,p,'withdraw','resin');assert.equal(p.bank.resin,1);assert.equal(bagEntries(p).length,20);
});

test('malformed transfers and quest banking are rejected without granting items or quest credit',()=>{
 const {w,p}=fixture();p.inventory.seed_pouch=5;p.quests.seeds={status:'active',progress:5,gathered:[]};const before=structuredClone({bank:p.bank,inventory:p.inventory,quests:p.quests});
 for(const count of [0,-1,NaN,Infinity,1.5,'1',100,Number.MAX_SAFE_INTEGER])transfer(w,p,'deposit','potion',count);
 for(const id of ['missing','__proto__','constructor','seed_pouch'])transfer(w,p,'deposit',id);
 transfer(w,p,'swap','potion');assert.deepEqual({bank:p.bank,inventory:p.inventory,quests:p.quests},before);
});

test('bank sessions close on distance, explicit close and death; peer snapshots never expose bank contents',()=>{
 const {w,p,npc}=fixture(),other=w.addPlayer('Other');p.bank={resin:10};assert.equal(w.snapshot(p).self.bank.inventory.resin,10);assert.equal(w.snapshot(other).players.find(v=>v.id===p.id).bank,undefined);
 w.command(p,{type:'bank',action:'close'});assert.equal(w.snapshot(p).self.bank,null);assert.equal(w.save(p).bank.resin,10);w.command(p,{type:'interact',id:npc.id});assert.equal(p.bankNpcId,npc.id);
 p.x+=6;w.step(.05);assert.equal(p.bankNpcId,null);p.x=npc.x;w.command(p,{type:'bank',action:'open',npcId:npc.id});w.hurt(p,10000,'test');assert.equal(w.snapshot(p).self.bank,null);assert.equal(p.bank.resin,10);
});

test('personal banks survive save/load, durable roster reload and appearance edits without leaking in roster summaries',async()=>{
 const dir=await mkdtemp(`${tmpdir()}/emberwild-bank-`);try{
 const store=await CharacterStore.open(`${dir}/characters.json`),token=await store.session();await store.create(token,'Stored Goods','hearth',0);const key=store.data.accounts[token].characters[0],w=new World(),p=w.addPlayer('Stored Goods',store.profile(key));p.bank={resin:150,linen_pouch:2};
 await store.saveProfiles([[key,w.save(p)]]);p.bank.resin=0;const reopened=await CharacterStore.open(`${dir}/characters.json`),restored=new World().addPlayer(p.name,reopened.profile(key));assert.deepEqual(restored.bank,{resin:150,linen_pouch:2});assert.equal(restored.bankNpcId,null);assert.equal(reopened.roster(token).characters[0].bank,undefined);
 await reopened.customize(token,p.id,'ash',undefined,1,()=>false);assert.deepEqual(reopened.profile(key).bank,{resin:150,linen_pouch:2});
 }finally{await rm(dir,{recursive:true,force:true});}
});
