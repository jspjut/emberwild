import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {QUESTS,NPCS,dialogueQuests,npcQuests,activeQuests,questForPlayer} from '../shared/content.js';
import {CLASSES,skillForRole} from '../shared/adventurers.js';
const quest=id=>QUESTS.find(q=>q.id===id),record=(id,status='active',progress=quest(id).count)=>({status,progress,gathered:[]});
function fixture(npc,classId='dawnwarden'){
 const w=new World(),p=w.addPlayer('Quest List',{xp:2200,classId});
 if(npc==='orin'){p.quests={class_spark:record('class_spark','complete'),class_mercy:record('class_mercy','complete'),relics:record('relics'),class_dawn:record('class_dawn')};p.inventory.dawnsteel_fragment=5;}
 else p.quests={missing_scout:record('missing_scout','complete'),beacons:record('beacons'),memory:record('memory')};
 const contact=NPCS.find(n=>n.id===npc);p.x=contact.x;p.z=contact.z;return {w,p};
}
const ids=(p,npc)=>dialogueQuests(p,npc).map(q=>q.id);

for(const npc of ['orin','scout'])test(`${npc}: overlapping old lists reproduce duplicate ready quests; dialogue lists each ID only once`,()=>{
 const {p}=fixture(npc),expected=npc==='orin'?['relics','class_dawn']:['beacons','memory'],offers=npcQuests(p,npc),oldOngoing=activeQuests(p).filter(q=>(q.giver===npc||q.turnIn===npc)&&!offers.includes(q));
 assert.deepEqual([...offers,...oldOngoing].map(q=>q.id),[...expected,...expected],'reproduce the screenshot, including class-adjusted copies');
 assert.deepEqual(ids(p,npc),expected);assert.equal(new Set(ids(p,npc)).size,2);
});

test('ready quests, available follow-ups and unfinished quests remain distinct during turn-in transitions',()=>{
 const {w,p}=fixture('scout');p.quests.beacons.progress=0;assert.deepEqual(ids(p,'scout'),['memory','beacons']);p.quests.beacons.progress=quest('beacons').count;assert.deepEqual(ids(p,'scout'),['beacons','memory']);
 w.command(p,{type:'quest',action:'complete',id:'beacons'});assert.deepEqual(ids(p,'scout'),['memory','shards']);assert.ok(!ids(p,'scout').includes('beacons'));
 w.command(p,{type:'quest',action:'complete',id:'memory'});assert.deepEqual(ids(p,'scout'),['shards']);
 w.command(p,{type:'quest',action:'accept',id:'shards'});assert.deepEqual(ids(p,'scout'),['shards']);assert.equal(dialogueQuests(p,'scout')[0].id,'shards');
});

test('class-specific views keep their own skills/rewards while Orin turn-ins and rewards occur once',()=>{
 for(const classId of Object.keys(CLASSES)){
  const {w,p}=fixture('orin',classId),rows=dialogueQuests(p,'orin');assert.deepEqual(rows.map(q=>q.id),['relics','class_dawn']);assert.equal(rows[1].target,skillForRole(p,'area'));assert.notEqual(rows[1],quest('class_dawn'));
  const reward=questForPlayer(p,quest('relics')).reward,before=p.inventory[reward]||0,xp=p.xp;
  w.command(p,{type:'quest',action:'complete',id:'relics'});w.command(p,{type:'quest',action:'complete',id:'relics'});assert.equal(p.inventory[reward],before+1);assert.equal(p.xp,xp+quest('relics').xp);assert.deepEqual(ids(p,'orin'),['class_dawn']);
  w.command(p,{type:'quest',action:'complete',id:'class_dawn'});assert.deepEqual(ids(p,'orin'),[]);
 }
});

test('completed, unrelated and locked quests stay hidden; quests with another turn-in contact appear once',()=>{
 const w=new World(),p=w.addPlayer('Contacts',{xp:2200});assert.deepEqual(ids(p,'scout'),[]);p.quests.welcome=record('welcome');assert.deepEqual(ids(p,'elowen'),['welcome']);assert.deepEqual(ids(p,'sera'),['welcome']);assert.deepEqual(ids(p,'orin'),[]);
 p.quests.welcome.status='complete';assert.ok(!ids(p,'sera').includes('welcome'));assert.ok(!ids(p,'elowen').includes('welcome'));
});
