import {BUILDINGS} from '../shared/buildings.js';
import {introPoint} from '../shared/zone-layout.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {EMOTES,PLAYER_EMOTES,STARTER_EMOTES,knowsEmote,parseEmoteCommand,EMOTE_NOTICE_RANGE} from '../shared/social.js';
import {LEVEL_XP,ENEMY_TYPES,stats} from '../shared/content.js';
import {settleOnSurface} from '../shared/props.js';
const run=(w,t)=>{for(let i=0;i<t;i+=.05)w.step(.05);};
const at=(p,x,z)=>{Object.assign(p,{x,z,input:{x:0,z:0},latestMove:{x:0,z:0}});delete p.y;settleOnSurface(p);};
const social=w=>w.events.filter(e=>e.type==='social');

test('public gestures work with no selection, an invalid old target, self selection or a corpse',()=>{
 for(const selected of ['missing','self','dead','far','none']){const w=new World(),p=w.addPlayer('Public');at(p,0,32);if(selected==='self')p.target=p.id;else if(selected==='dead'){const mob=w.enemies[0];mob.hp=0;p.target=mob.id;p.auto=true;}else if(selected==='far')p.target=w.enemies.find(e=>e.type==='warden').id;else p.target=selected==='none'?null:'missing';const old=p.target;
  w.command(p,{type:'emote',id:'wave'});assert.equal(p.emote.id,'wave');assert.equal(p.emote.target,null);assert.equal(p.target,old,'emoting does not clear selection');assert.equal(social(w)[0].audience,'nearby');assert.equal(p.auto,false);
 }
});
test('explicit nearby mode keeps selection, reaches players/NPCs and credits the right social quest',()=>{
 const w=new World(),p=w.addPlayer('Greeter',{xp:LEVEL_XP[2]}),other=w.addPlayer('Friend');at(p,-13,30);at(other,-10,30);p.target='elowen';p.quests.social_greeting={status:'active',progress:0,gathered:[]};
 w.command(p,{type:'emote',id:'wave',audience:'nearby'});const event=social(w)[0];assert.equal(event.target,null);assert.ok(event.noticedBy.includes('sera'));assert.ok(event.noticedBy.includes(other.id));assert.equal(p.target,'elowen');assert.equal(p.quests.social_greeting.progress,1);assert.equal(other.emote,null,'players choose their own response');
 run(w,.7);assert.ok(social(w).some(e=>e.source==='sera'&&e.target===p.id));assert.equal(p.inventory.potion,4);
});
test('public listeners respect range and walls; named/strict targets do not silently become public',()=>{
 const w=new World(),p=w.addPlayer('Privacy'),sera=w.npcs.find(n=>n.id==='sera'),other=w.addPlayer('Outside');const cottage=BUILDINGS.find(b=>b.id==='cottage');at(p,cottage.x+cottage.width/2+1.5,cottage.z);at(other,sera.x,sera.z+1);w.command(p,{type:'emote',id:'wave',audience:'nearby'});assert.equal(social(w)[0].noticedBy.includes('sera'),false,'cottage wall blocks perception');assert.equal(social(w)[0].noticedBy.includes(other.id),false);assert.equal(p.inventory.potion,3);
 run(w,1.3);at(p,100,30);w.social.perform(p,'wave',sera.id,'target');assert.equal(social(w).filter(e=>e.source===p.id).length,1);assert.ok(w.events.some(e=>e.type==='notice'&&e.text.includes('@nearby')));
 assert.deepEqual(parseEmoteCommand('/wave @nearby'),{id:'wave',audience:'nearby'});assert.deepEqual(parseEmoteCommand('/bow @target'),{id:'bow',audience:'target'});assert.deepEqual(parseEmoteCommand('/thank Sera of the Hearth'),{id:'thank',name:'Sera of the Hearth'});
});
test('public soothe affects several uninjured creatures personally and still rejects interrupted fights',()=>{
 const w=new World(),p=w.addPlayer('Calm',{emotes:['soothe']}),other=w.addPlayer('Fighter'),foes=w.enemies.filter(e=>e.type==='prowler').slice(0,3);at(p,95,25);at(other,140,25);
 foes.forEach((e,i)=>{e.x=95+i*2;e.z=15;e.homeX=e.x;e.homeZ=e.z;});foes[2].target=other.id;
 w.command(p,{type:'emote',id:'soothe',audience:'nearby'});assert.ok(w.social.friendly(p,foes[0]));assert.ok(w.social.friendly(p,foes[1]));assert.equal(w.social.friendly(other,foes[0]),false);assert.equal(w.social.friendly(p,foes[2]),false);assert.equal(foes[2].target,other.id);assert.equal(p.reputation.rootbound,100);
});
test('new player gestures are learned; animal vocabulary cannot be forged into player training',()=>{
 assert.equal(PLAYER_EMOTES.length,15);assert.equal(STARTER_EMOTES.length,12);for(const id of ['thank','shrug','applaud','yawn'])assert.ok(knowsEmote({},id));for(const id of ['sniff','growl']){assert.ok(EMOTES[id].ambientOnly);assert.equal(knowsEmote({emotes:[id]},id),false);}
});
test('NPCs greet approaching players without granting gifts, reputation or quest progress',()=>{
 const w=new World(),p=w.addPlayer('Visitor');at(p,-13,30);p.quests.social_greeting={status:'active',progress:0,gathered:[]};run(w,2.2);
 const event=social(w).find(e=>e.ambient&&e.cause==='proximity');assert.ok(event);assert.equal(event.source,'sera');assert.equal(event.target,p.id);assert.equal(p.inventory.potion,3);assert.deepEqual(p.reputation,{});assert.equal(p.quests.social_greeting.progress,0);assert.deepEqual(p.socialClaims,[]);
 run(w,12);assert.equal(social(w).filter(e=>e.ambient&&e.source==='sera'&&e.cause==='proximity').length,1,'remaining nearby is not a new arrival');
});
test('NPC conversations are reciprocal, bounded and do not recursively trigger more responses',()=>{
 const w=new World(),p=w.addPlayer('Audience');at(p,100,20);const a=w.npcs[0],b=w.npcs[1];Object.assign(a,{x:100,z:10,nextAmbient:0});Object.assign(b,{x:105,z:10,nextAmbient:0});
 for(const n of [a,b])w.social.ambient.encounter(n,p);run(w,2.7);const events=social(w).filter(e=>e.ambient&&e.cause==='conversation');assert.equal(events.length,2);assert.equal(events[0].target,events[1].source);assert.equal(events[1].target,events[0].source);assert.deepEqual(p.reputation,{});run(w,10);assert.equal(social(w).filter(e=>e.ambient&&e.cause==='conversation').length,2);
});
test('idle and creature proximity emotes do not alter aggression, XP, loot or personal trust',()=>{
 const w=new World(),p=w.addPlayer('Observer'),e=w.enemies.find(e=>e.type==='prowler');at(p,100,20);Object.assign(e,{x:100,z:10,homeX:100,homeZ:10});run(w,2.2);const warning=social(w).find(v=>v.source===e.id&&v.ambient);assert.equal(warning.emote,'growl');assert.equal(e.target,null);assert.equal(p.xp,0);assert.deepEqual(p.reputation,{});assert.equal(e.loot.size,0);
 const initial=w.social.ambient.encounters.size;assert.ok(initial>0);w.removePlayer(p.id);assert.equal(w.social.ambient.encounters.size,0);
 const calmWorld=new World(),friend=calmWorld.addPlayer('Friend',{reputation:{rootbound:300}}),creature=calmWorld.enemies.find(e=>e.type==='prowler');Object.assign(creature,{x:100,z:10,homeX:100,homeZ:10});at(friend,100,20);run(calmWorld,2.2);assert.equal(social(calmWorld).find(v=>v.source===creature.id&&v.ambient)?.emote,'sniff');assert.equal(creature.target,null);
 const idleWorld=new World(),audience=idleWorld.addPlayer('QuietGuest'),npc=idleWorld.npcs[0];Object.assign(npc,{x:100,z:10,nextIdleSocial:2});at(audience,100,20);idleWorld.social.ambient.encounter(npc,audience);run(idleWorld,2.2);assert.ok(social(idleWorld).some(e=>e.ambient&&e.cause==='idle'&&e.target===null));
});
test('ambient observers celebrate leveling and healing and yield to explicit player gestures',()=>{
 const w=new World(),p=w.addPlayer('Helper'),sera=w.npcs.find(n=>n.id==='sera');at(p,-13,30);w.gainXP(p,180);assert.ok(social(w).some(e=>e.ambient&&e.cause==='level'&&e.emote==='cheer'));
 w.command(p,{type:'emote',id:'bow'});run(w,.7);assert.ok(social(w).some(e=>!e.ambient&&e.source==='sera'&&['nod','salute'].includes(e.emote)&&typeof e.speech==='string'));assert.equal(p.reputation.hearthstead,15);
 run(w,40);w.events=[];w.social.ambient.globalReady=0;sera.nextAmbient=0;sera.socialBusyUntil=0;sera.emote=null;sera.hp=100;w.heal(sera,10,p.id);assert.ok(social(w).some(e=>e.ambient&&e.cause==='healing'&&e.emote==='thank'));assert.equal(sera.hp,110);
});
test('ambient traffic is bounded with many observers; inactive zones produce no chatter',()=>{
 const w=new World();run(w,90);assert.equal(social(w).length,0);for(let i=0;i<64;i++){const p=w.addPlayer(`Crowd${i}`);at(p,-13,30);}run(w,60);const events=social(w).filter(e=>e.ambient);assert.ok(events.length>0);assert.ok(events.length<=22,`bounded ambient output: ${events.length}`);for(const p of w.players.values()){assert.equal(p.hp,stats(p).maxHp);assert.deepEqual(p.reputation,{});assert.equal(p.inventory.potion,3);}
});


test('a witnessed defeat can be celebrated after enemy health reaches zero without duplicating combat rewards',()=>{
 const w=new World(),p=w.addPlayer('Victor'),e=w.enemies[0];at(p,-13,30);Object.assign(e,{x:-13,z:30,homeX:-13,homeZ:30});w.hit(p,e,999);const cheers=social(w).filter(v=>v.ambient&&v.cause==='victory');assert.equal(cheers.length,1);assert.equal(cheers[0].emote,'cheer');assert.equal(e.hp,0);assert.equal(p.xp,ENEMY_TYPES[e.type].xp);assert.equal(e.loot.size,1);assert.deepEqual(p.reputation,{});w.hit(p,e,999);assert.equal(social(w).filter(v=>v.cause==='victory').length,1);assert.equal(p.xp,ENEMY_TYPES[e.type].xp);
});
