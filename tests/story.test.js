import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {World} from '../server/world.js';
import {QUESTS,NPCS,GATHERABLES,questAvailable,questForPlayer} from '../shared/content.js';
import {READABLES,readableAvailable} from '../shared/readables.js';
import {QUEST_STORY} from '../shared/story-content.js';
import {CLASSES} from '../shared/adventurers.js';
import {OUTPOSTS} from '../shared/world-layouts.js';
import {spokenReply} from '../server/npc-dialogue.js';
import {bodyFits,supportBelow,settleOnSurface,lineOfSight} from '../shared/props.js';
import {withinZone} from '../shared/zone-layout.js';
import {gatherPosition} from './gather-route.js';
const at=(p,r)=>{Object.assign(p,{x:r.x,z:r.z,input:{x:0,z:0},jumpHeight:0,jumpVelocity:0});delete p.y;settleOnSurface(p);};
const run=(w,t)=>{for(let i=0;i<t;i+=.05)w.step(.05);};
const complete={status:'complete',progress:1,gathered:[]};
test('the author bible ties 36 future threads to public evidence, while every existing quest has a chapter',async()=>{
 const b=JSON.parse(await readFile(new URL('../game-data/story/cinderwood-reach.json',import.meta.url),'utf8'));
 await readFile(new URL(`../game-data/story/${b.background_story_file}`,import.meta.url),'utf8');
 assert.equal(new Set(b.open_threads.map(t=>t.id)).size,36);
 for(const t of b.open_threads){assert.ok(READABLES.some(r=>r.storyId===t.seed_readable),t.id);assert.ok(t.question&&t.future_payoff&&t.status);}
 assert.equal(new Set(QUESTS.map(q=>q.id)).size,80);assert.equal(Object.keys(QUEST_STORY).length,80);
 for(const q of QUESTS){assert.ok(q.chapter&&q.text.length>50&&q.complete.length>30,q.id);for(const id of q.requires)assert.ok(QUESTS.some(q=>q.id===id));}
 for(const o of OUTPOSTS)for(const step of ['keepsakes','trouble','shelter','boss','return']){const scenes=OUTPOSTS.map(o=>QUESTS.find(q=>q.id===`${o.id}_${step}`).text);assert.equal(new Set(scenes).size,6);}
 for(const classId of Object.keys(CLASSES))for(const id of ['class_spark','class_mercy','class_dawn']){const q=questForPlayer({classId},QUESTS.find(q=>q.id===id));assert.ok(q.text.includes(CLASSES[classId].name));if(classId!=='dawnwarden')assert.ok(!q.text.includes('Dawnwarden'));}
 const visit=(q,path=[])=>{assert.ok(!path.includes(q.id),`cycle ${path} -> ${q.id}`);for(const id of q.requires)visit(QUESTS.find(q=>q.id===id),[...path,q.id]);};QUESTS.forEach(q=>visit(q));
});
test('world books have unique IDs, short pages, in-bounds stands and a reachable unobstructed approach',()=>{
 assert.equal(READABLES.length,17);assert.equal(new Set(READABLES.map(r=>r.id)).size,17);
 for(const r of READABLES){assert.ok(withinZone(r.x,r.z),r.id);assert.ok(bodyFits(r.x,r.z,supportBelow(r.x,r.z).y),r.id);assert.ok(r.author&&r.title&&r.pages.length);
  for(const page of r.pages)assert.ok(page.heading&&page.text.length>80&&page.text.split(/\s+/).length<180,r.id);
  const spots=Array.from({length:16},(_,i)=>({x:r.x+Math.cos(i*Math.PI/8)*2,z:r.z+Math.sin(i*Math.PI/8)*2}));assert.ok(spots.some(p=>bodyFits(p.x,p.z,supportBelow(p.x,p.z).y)&&lineOfSight(p,r)),`${r.id} readable from open ground`);
 }
});
test('reading is private, repeatable without rewards or quest credit, range-limited, and blocked through a wall',()=>{
 const w=new World(),p=w.addPlayer('Reader'),r=READABLES.find(r=>r.storyId==='camp-ledger');const before=JSON.stringify({xp:p.xp,gold:p.gold,inventory:p.inventory,quests:p.quests});
 w.command(p,{type:'interact',id:r.id});assert.ok(!w.events.some(e=>e.type==='reading'));at(p,r);w.events=[];
 for(let i=0;i<3;i++)w.command(p,{type:'interact',id:r.id});const readings=w.events.filter(e=>e.type==='reading');assert.equal(readings.length,3);assert.ok(readings.every(e=>e.to===p.id&&e.title===r.title&&e.pages.length===2));assert.equal(p.casting,null);assert.equal(p.globalCooldown,null);assert.equal(before,JSON.stringify({xp:p.xp,gold:p.gold,inventory:p.inventory,quests:p.quests}));
 // This stand is outside the farm's north wall; the reader is just inside it.
 const farm=READABLES.find(r=>r.storyId==='orchard-notes');at(p,{x:farm.x,z:255});w.events=[];assert.ok(Math.hypot(p.x-farm.x,p.z-farm.z)>4.8);w.command(p,{type:'interact',id:farm.id});assert.ok(!w.events.some(e=>e.type==='reading'));
 // Use the inn's north wall at z=129, keeping both points within interaction range.
 const inn=READABLES.find(r=>r.storyId==='inn-book');at(p,{x:inn.x,z:131});w.events=[];assert.equal(lineOfSight(p,inn),false);w.command(p,{type:'interact',id:inn.id});assert.ok(!w.events.some(e=>e.type==='reading'));assert.ok(w.events.some(e=>e.text?.includes('wall')));
 p.hp=0;at(p,r);w.events=[];w.command(p,{type:'interact',id:r.id});assert.ok(!w.events.some(e=>e.type==='reading'));
});
test('the release page and ending gossip follow personal quest completion; the harvest report gates new finale offers',()=>{
 const w=new World(),p=w.addPlayer('Witness',{xp:9800}),r=READABLES.find(r=>r.requiresQuest);at(p,r);w.events=[];
 assert.equal(readableAvailable(p,r),false);w.command(p,{type:'interact',id:r.id});assert.ok(!w.events.some(e=>e.type==='reading'));
 const finale=QUESTS.find(q=>q.id==='five_roads');for(const o of OUTPOSTS)p.quests[`${o.id}_return`]={...complete};assert.equal(questAvailable(p,finale),false);p.quests.town_seedroad={...complete};assert.equal(questAvailable(p,finale),true);
 const npc=NPCS.find(n=>n.id==='quartermaster');assert.ok(!spokenReply(npc,p,'Tell me about the amendment').speech.includes('Your testimony is in'));
 p.quests.five_roads={...complete};assert.equal(readableAvailable(p,r),true);at(p,r);w.events=[];w.command(p,{type:'interact',id:r.id});assert.equal(w.events.find(e=>e.type==='reading').id,r.id);assert.match(spokenReply(npc,p,'Tell me about the amendment').speech,/Your testimony is in/);
 const restored=new World().addPlayer(p.name,w.save(p));assert.equal(readableAvailable(restored,r),true);
});
test('the clean-amber breadcrumb follows the actual finding and existing accepted quests survive the stronger offer gate',()=>{
 const w=new World(),p=w.addPlayer('Listener',{xp:500}),q=QUESTS.find(q=>q.id==='social_road');p.quests.east_intro={...complete};assert.equal(questAvailable(p,q),false);p.quests.sap={...complete};assert.equal(questAvailable(p,q),true);
 delete p.quests.sap;p.quests.social_road={status:'active',progress:0,gathered:[]};const restored=new World().addPlayer(p.name,w.save(p));assert.equal(restored.quests.social_road.status,'active');
});
test('quest journals and tablets show text only after the one-second examination, with cancellation giving no page',()=>{
 const w=new World(),p=w.addPlayer('Investigator'),g=GATHERABLES.find(g=>g.id==='ledger');p.quests.ledger={status:'active',progress:0,gathered:[]};at(p,gatherPosition(w,g));w.events=[];
 w.command(p,{type:'interact',id:g.id});run(w,.4);assert.ok(!w.events.some(e=>e.type==='reading'));w.command(p,{type:'cancelCast'});run(w,.7);assert.equal(p.quests.ledger.progress,0);assert.ok(!w.events.some(e=>e.type==='reading'));
 w.command(p,{type:'interact',id:g.id});run(w,1.1);assert.equal(p.quests.ledger.progress,1);assert.equal(w.events.filter(e=>e.type==='reading').length,1);assert.match(w.events.find(e=>e.type==='reading').title,/Renn/);
 w.events=[];w.command(p,{type:'interact',id:g.id});run(w,1.1);assert.ok(!w.events.some(e=>e.type==='reading'),'used quest pickup does not reopen or grant credit');
});
