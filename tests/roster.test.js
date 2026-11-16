import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,mkdir,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {CharacterStore} from '../server/characters.js';
import {World} from '../server/world.js';

async function fixture(fn){const dir=await mkdtemp(path.join(tmpdir(),'emberwild-roster-test-'));try{const file=path.join(dir,'characters.json');await fn(await CharacterStore.open(file),file);}finally{await rm(dir,{recursive:true,force:true});}}
test('rosters retain order, appearance, levels and ownership across disk reload; deletion cannot resurrect on autosave',()=>fixture(async(store,file)=>{
  const key=await store.session(),other=await store.session();let revision=0;
  const a=await store.create(key,'First Warden','grove',revision++),b=await store.create(key,'Second Warden','dawn',revision++);
  const pkey=store.data.accounts[key].characters[0],p=store.profile(pkey);p.xp=2200;p.equipment.weapon='dawn_blade';p.inventory.dawn_blade=1;
  await store.saveProfiles([[pkey,p]]);await store.reorder(key,[b,a],revision++);
  p.inventory.dawn_blade=99;assert.equal(store.profile(pkey).inventory.dawn_blade,1,'later simulation mutations do not modify committed profiles');
  const reopened=await CharacterStore.open(file),roster=reopened.roster(key);assert.deepEqual(roster.characters.map(c=>c.id),[b,a]);assert.equal(roster.characters[1].level,6);assert.equal(roster.characters[1].look,'grove');assert.equal(roster.characters[1].equipment.weapon,'dawn_blade');assert.equal(roster.characters[1].inventory,undefined);
  await assert.rejects(reopened.enter(other,a,()=>{}),/no.*roster/);await assert.rejects(reopened.delete(other,a,'First Warden',0,()=>false),/not.*roster/);
  await assert.rejects(reopened.delete(key,a,'wrong name',revision,()=>false),/Confirm/);await assert.rejects(reopened.delete(key,a,'First Warden',revision,()=>true),/Log.*out/);
  await reopened.delete(key,a,'First Warden',revision,()=>false);await reopened.saveProfiles([[pkey,p]]);
  assert.equal(reopened.profile(pkey),undefined);assert.deepEqual((await CharacterStore.open(file)).roster(key).characters.map(c=>c.id),[b]);
  assert.equal(JSON.stringify(reopened.roster(key)).includes(pkey),false);
}));
test('mutations reject stale tabs, partial/duplicate orders, invalid names and roster overflow',()=>fixture(async(store)=>{
  const key=await store.session();await store.create(key,'Valid Warden','not-a-look',0);
  await assert.rejects(store.create(key,'Another Warden','ash',0),/another tab/);
  assert.equal(store.roster(key).characters[0].look,'hearth');
  for(const name of ['a','<script>','                     ','A'.repeat(19)])await assert.rejects(store.create(key,name,'hearth',1),/2–18/);
  await assert.rejects(store.create(key,'valid warden','hearth',1),/already taken/);
  await assert.rejects(store.reorder(key,[],1),/each/);await assert.rejects(store.reorder(key,['unknown'],1),/each/);
  for(let i=1;i<12;i++)await store.create(key,`Warden ${i}`,'ash',i);
  await assert.rejects(store.create(key,'Thirteenth Warden','ash',12),/up to 12/);
  const ids=store.roster(key).characters.map(c=>c.id);await assert.rejects(store.reorder(key,ids.map(()=>ids[0]),12),/each/);
}));
test('a failed disk commit leaves roster order/deletions unchanged and can be retried',()=>fixture(async(store,file)=>{
  const key=await store.session(),a=await store.create(key,'Safe Warden','hearth',0);
  await mkdir(file+'.tmp');await assert.rejects(store.delete(key,a,'Safe Warden',1,()=>false));assert.equal(store.roster(key).characters[0].id,a);
  assert.equal(JSON.parse(await readFile(file,'utf8')).accounts[key].revision,1);
  await rm(file+'.tmp',{recursive:true});await store.delete(key,a,'Safe Warden',1,()=>false);assert.equal(store.roster(key).characters.length,0);
}));
test('legacy characters import once even with simultaneous tabs and entry is serialized against deletion',()=>fixture(async(store,file)=>{
  const w=new World(),p=w.addPlayer('Old Warden'),legacy='a'.repeat(64);await writeFile(file,JSON.stringify({[legacy]:w.save(p)}));store=await CharacterStore.open(file);
  const [a,b]=await Promise.all([store.session(null,legacy),store.session(null,legacy)]);assert.equal(a,b);assert.equal(store.roster(a).characters[0].id,p.id);
  let online=false;await Promise.all([store.enter(a,p.id,()=>{online=true;}),assert.rejects(store.delete(a,p.id,p.name,0,()=>online),/Log.*out/)]);
  assert.equal(store.roster(a).characters.length,1);
}));
