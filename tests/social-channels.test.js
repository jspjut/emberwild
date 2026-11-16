import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {parseChat,CHAT_CHANNELS} from '../shared/chat.js';
import {emoteReply} from '../server/npc-dialogue.js';
import {NPCS,QUESTS} from '../shared/content.js';
import {PLAYER_EMOTES} from '../shared/social.js';
import {settleOnSurface} from '../shared/props.js';
const at=(p,n)=>{Object.assign(p,{x:n.x,z:n.z,input:{x:0,z:0}});delete p.y;settleOnSurface(p);};
const run=(w,t)=>{for(let i=0;i<t;i+=.05)w.step(.05);};
test('chat parses explicit channel aliases, defaults to local say and leaves emotes separate',()=>{
 for(const [command,channel]of [['say','say'],['s','say'],['YELL','yell'],['y','yell'],['1','general'],['general','general'],['p','party'],['party','party'],['g','guild']])assert.deepEqual(parseChat(`/${command}  Hello neighbor `),{channel,text:'Hello neighbor',explicit:true});
 assert.deepEqual(parseChat('/p'),{channel:'party',text:'',explicit:true});assert.equal(parseChat('Hi').channel,'say');assert.equal(parseChat('Hi','party').channel,'party');assert.equal(parseChat('/wave'),null);assert.equal(parseChat('/constructor no'),null);assert.equal(parseChat(null),null);assert.equal(parseChat('x'.repeat(250)).text.length,200);assert.equal(parseChat('a\u0000b').text,'ab');
});
test('say and yell use different bounded ranges; general is restricted to the zone',()=>{
 const w=new World(),a=w.addPlayer('Speaker'),near=w.addPlayer('Near'),far=w.addPlayer('Far'),other=w.addPlayer('Elsewhere');near.x=CHAT_CHANNELS.say.range-1;far.x=CHAT_CHANNELS.say.range+5;other.x=250;
 const send=text=>{w.events=[];w.time+=2;assert.equal(w.chat.handle(a,{text}),true);return w.events.find(e=>e.type==='chat');};
 assert.deepEqual(send('/say Hello').recipients,[a.id,near.id]);assert.deepEqual(send('/yell Hello').recipients,[a.id,near.id,far.id]);assert.equal(send('/1 Hello').recipients.length,4);other.mapId='another-zone';assert.equal(send('/1 Again').recipients.includes(other.id),false);
 w.events=[];w.chat.handle(a,{text:'Too soon'});assert.ok(!w.events.some(e=>e.type==='chat'));w.time+=2;w.chat.handle(a,{text:'No forged channel',channel:'constructor'});assert.ok(!w.events.some(e=>e.type==='chat'));
});
test('party chat reaches only actual party members regardless of distance; guild is explicitly unavailable',()=>{
 const w=new World(),a=w.addPlayer('Leader'),b=w.addPlayer('Member'),c=w.addPlayer('Bystander');
 w.chat.handle(a,{text:'/p Hello'});assert.ok(w.events.some(e=>e.to===a.id&&e.text.includes('not in a party')));assert.ok(!w.events.some(e=>e.type==='chat'));
 w.partyAction(a,{action:'invite',id:b.id});w.partyAction(b,{action:'accept'});b.x=300;b.z=300;w.events=[];w.chat.handle(a,{text:'/p Only us',recipients:[c.id]});assert.deepEqual(w.events.find(e=>e.type==='chat').recipients,[a.id,b.id]);
 w.time+=2;w.partyAction(b,{action:'leave'});w.events=[];w.chat.handle(a,{text:'/p Gone'});assert.ok(!w.events.some(e=>e.type==='chat'));w.chat.handle(a,{text:'/g Hello'});assert.ok(w.events.some(e=>e.to===a.id&&e.text.includes('guilds are implemented')));assert.ok(!w.events.some(e=>e.type==='chat'));
});
test('every player emote has written NPC responses and repeated encounters vary without making friendly NPCs aggressive',()=>{
 const w=new World(),p=w.addPlayer('Guest'),npc=w.npcs.find(n=>n.id==='tavi');at(p,npc);
 for(const e of PLAYER_EMOTES){const replies=Array.from({length:4},()=>emoteReply(npc,p,e.id));assert.ok(replies.every(r=>r.speech.length>20));assert.ok(new Set(replies.map(r=>r.speech)).size>1);assert.ok(replies.some(r=>r.emote!==e.id));}
 p.emotes=['dance','soothe','salute'];for(const id of ['wave','dance','taunt']){w.social.perform(p,id,npc.id,'target');run(w,4);assert.ok(w.events.some(e=>e.type==='social'&&e.source===npc.id&&e.speech));assert.equal(npc.target,undefined);assert.equal(p.hp,p.maxHp||120);}
});
test('nearby say draws one spoken NPC answer with useful hints, range/visibility limits and no repeat rewards',()=>{
 const w=new World(),p=w.addPlayer('Neighbor'),sera=w.npcs.find(n=>n.id==='sera');at(p,{x:sera.x+1,z:sera.z+1});p.target=sera.id;const gold=p.gold,xp=p.xp,potions=p.inventory.potion;
 w.chat.handle(p,{text:'/say Where is the inn?'});run(w,1);let replies=w.events.filter(e=>e.type==='social'&&e.conversation);assert.equal(replies.length,1);assert.equal(replies[0].source,sera.id);assert.match(replies[0].speech,/Merrin|Crossroads/);
 w.chat.handle(p,{text:'/say hello'});run(w,1);assert.equal(w.events.filter(e=>e.conversation).length,1);assert.equal(p.gold,gold);assert.equal(p.xp,xp);assert.equal(p.inventory.potion,potions);
 run(w,4);at(p,{x:150,z:0});w.events=[];w.chat.handle(p,{text:'/say hello'});run(w,1);assert.equal(w.events.filter(e=>e.conversation).length,0);
 const cabin=NPCS.find(n=>n.id==='sera');at(p,{x:cabin.x-10,z:cabin.z+5});w.events=[];w.social.hearSay(p,'Hello');assert.ok(!w.social.responses.some(r=>r.context.conversation&&r.target===p.id&&r.source==='sera'),'a nearby cottage wall blocks hearing');
});
test('abandonment works away from the giver, removes quest items and tracking, persists, and permits fresh acceptance',()=>{
 const w=new World(),p=w.addPlayer('Traveler');p.quests={meadow:{status:'complete',progress:6,gathered:[]},seeds:{status:'active',progress:3,gathered:['one','two','three']},herbs:{status:'active',progress:1,gathered:['herb-1']}};p.inventory.seed_pouch=3;p.inventory.sunmint=2;p.trackedQuest='seeds';p.xp=210;p.gold=22;at(p,{x:232,z:142});
 w.quest(p,'abandon','seeds');assert.equal(p.quests.seeds,undefined);assert.equal(p.inventory.seed_pouch,undefined);assert.equal(p.inventory.sunmint,2);assert.equal(p.trackedQuest,'herbs');assert.equal(p.xp,210);assert.equal(p.gold,22);w.quest(p,'abandon','meadow');assert.equal(p.quests.meadow.status,'complete');
 const restored=new World().addPlayer(p.name,w.save(p));assert.equal(restored.quests.seeds,undefined);const giver=NPCS.find(n=>n.id===QUESTS.find(q=>q.id==='seeds').giver);at(p,giver);w.quest(p,'accept','seeds');assert.deepEqual(p.quests.seeds,{status:'active',progress:0,gathered:[]});w.quest(p,'abandon','herbs');assert.equal(p.inventory.sunmint,2);
});
