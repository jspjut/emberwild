import test from 'node:test';import assert from 'node:assert/strict';
import {World} from '../server/world.js';import {stats} from '../shared/content.js';
import {questOverlays,questTooltip,trackingSettings,OBJECTIVE_OPTIONS} from '../client/minimap.js';
import {CreatureAnimator} from '../client/animation.js';
const run=(w,n)=>{for(let t=0;t<n;t+=.05)w.step(.05);};
const healers=()=>{const w=new World(),a=w.addPlayer('Healer',{xp:180,classId:'stormcaller'}),b=w.addPlayer('Friend');a.x=b.x=0;a.z=b.z=32;b.hp=20;b.lastCombat=100;return {w,a,b};};
test('passive targeting selects enemies, players and NPCs without attacking; friendly damage is refused',()=>{
 const {w,a,b}=healers(),e=w.enemies[0];a.auto=true;w.command(a,{type:'target',id:e.id,passive:true});assert.equal(a.target,e.id);assert.equal(a.auto,false);
 for(const unit of [a,b,w.npcs[0]]){a.auto=true;const hp=unit.hp;w.command(a,{type:'target',id:unit.id});assert.equal(a.target,unit.id);assert.equal(a.auto,false);w.command(a,{type:'skill',skill:'strike'});assert.equal(unit.hp,hp);}
 w.command(a,{type:'target',id:'missing'});assert.equal(a.target,null);
});
test('Healing Rain heals the friendly target, locks the recipient, credits the caster and never enables autoattack',()=>{
 const {w,a,b}=healers();a.hp=90;a.lastCombat=100;a.quests.class_mercy={status:'active',progress:0,gathered:[]};
 w.command(a,{type:'target',id:b.id});w.command(a,{type:'skill',skill:'rainmend'});assert.equal(a.casting.target,b.id);w.command(a,{type:'target',id:a.id});run(w,1.85);
 assert.equal(b.hp,85);assert.equal(a.hp,90);assert.equal(a.quests.class_mercy.progress,1);assert.equal(a.auto,false);assert.ok(w.events.some(e=>e.kind==='heal'&&e.source===a.id&&e.target===b.id));
});
test('friendly healing revalidates range, life and connection on completion without spending on failed casts',()=>{
 for(const change of [(w,b)=>{b.x=40;},(w,b)=>{b.hp=0;},(w,b)=>w.removePlayer(b.id)]){
  const {w,a,b}=healers();w.command(a,{type:'target',id:b.id});w.command(a,{type:'skill',skill:'rainmend'});change(w,b);run(w,1.85);assert.equal(a.cooldowns.rainmend,undefined);assert.equal(a.energy,100);
 }
 const {w,a,b}=healers();b.x=30;w.command(a,{type:'target',id:b.id});w.command(a,{type:'skill',skill:'rainmend'});assert.equal(a.casting,null);
});
test('healing an NPC is valid and enemy/no target retains self-healing',()=>{
 const {w,a}=healers(),npc=w.npcs[0];a.x=npc.x;a.z=npc.z;npc.hp=30;w.command(a,{type:'target',id:npc.id});w.command(a,{type:'skill',skill:'rainmend'});run(w,1.85);assert.equal(npc.hp,95);assert.equal(w.snapshot(a).npcs.find(n=>n.id===npc.id).hp,95);
 a.cooldowns={};a.hp=50;a.lastCombat=100;w.command(a,{type:'target',id:w.enemies[0].id});w.command(a,{type:'skill',skill:'rainmend'});run(w,1.85);assert.equal(a.hp,115);
});
test('party invites require consent, enforce five members and leadership, and clean up on disconnect',()=>{
 const w=new World(),players=Array.from({length:6},(_,i)=>w.addPlayer(`Player${i}`)),[a,b]=players;
 w.command(a,{type:'party',action:'invite',id:b.id});assert.equal(b.partyId,null);assert.equal(w.snapshot(b).partyInvite.from,a.id);
 w.command(b,{type:'party',action:'accept'});assert.equal(a.partyId,b.partyId);assert.deepEqual(w.snapshot(a).party.members,[a.id,b.id]);
 for(const p of players.slice(2,5)){w.time+=3;w.command(a,{type:'party',action:'invite',id:p.id});w.command(p,{type:'party',action:'accept'});}assert.equal(w.snapshot(a).party.members.length,5);
 w.time+=3;w.command(a,{type:'party',action:'invite',id:players[5].id});assert.equal(w.snapshot(players[5]).partyInvite,null);
 w.command(b,{type:'party',action:'invite',id:players[5].id});assert.equal(w.snapshot(players[5]).partyInvite,null);
 w.removePlayer(a.id);assert.equal(w.snapshot(b).party.leader,b.id);for(const p of players.slice(2,5))w.removePlayer(p.id);assert.equal(b.partyId,null);assert.equal(w.parties.size,0);
});
test('expired or declined invites cannot join; party state never persists in saves',()=>{
 const {w,a,b}=healers();w.command(a,{type:'party',action:'invite',id:b.id});w.command(b,{type:'party',action:'decline'});w.command(b,{type:'party',action:'accept'});assert.equal(b.partyId,null);
 w.time+=3;w.command(a,{type:'party',action:'invite',id:b.id});w.time+=31;w.command(b,{type:'party',action:'accept'});assert.equal(b.partyId,null);
 w.command(a,{type:'party',action:'invite',id:b.id});w.command(b,{type:'party',action:'accept'});assert.ok(a.partyId);assert.equal(w.save(a).partyId,undefined);w.removePlayer(b.id);assert.equal(a.partyId,null);
});
test('objective filters retain quest numbers and tooltips pair every title with its progress',()=>{
 const w=new World(),p=w.addPlayer('Mapper');p.quests={meadow:{status:'active',progress:1,gathered:[]},herbs:{status:'active',progress:1,gathered:['herb0']},seeds:{status:'active',progress:0,gathered:[]}};
 const settings=trackingSettings({hunt:false}),all=questOverlays(p,w.snapshot(p).enemies);assert.deepEqual(questOverlays(p,[],settings).map(q=>q.number),[2]);
 const off=trackingSettings(Object.fromEntries(OBJECTIVE_OPTIONS.map(([id])=>[id,false])));assert.equal(questOverlays(p,[],off).length,0);
 const tooltip=questTooltip(all,false);assert.match(tooltip.detail,/1\. A small, sharp problem\nDefeat meadow nibblers · 1\/6/);assert.match(tooltip.detail,/sunmint sprigs · 1\/3/);assert.match(tooltip.detail,/Click to open the world map/);
 p.quests.meadow.progress=6;assert.ok(questOverlays(p,[],settings).some(q=>q.id==='meadow'));assert.ok(!questOverlays(p,[],{...settings,turnIns:false}).some(q=>q.id==='meadow'));
});
test('all creature rigs have continuous idle, travel, attack and boss windup presentation',()=>{
 const a=new CreatureAnimator(),p={x:0,z:0};let s=a.step(p,1/60);assert.ok(Number.isFinite(s.bob));
 for(let i=0;i<60;i++){p.x+=3/60;s=a.step(p,1/60);}assert.ok(s.move>.9);assert.ok(s.phase>0);a.strike();s=a.step(p,.1,{windup:true});assert.ok(s.attack>0);assert.equal(s.windup,1);
 for(let i=0;i<90;i++)s=a.step(p,1/60);assert.ok(s.move<.01);assert.equal(s.attack,0);assert.notEqual(s.bob,0);
});
