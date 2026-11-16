import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {EMOTES,STARTER_EMOTES,emoteSuggestions,knowsEmote,reputationRank,normalizeSocial} from '../shared/social.js';
import {NPCS,QUESTS,ENEMY_TYPES,LEVEL_XP,questAvailable,questReady,stats} from '../shared/content.js';
import {settleOnSurface} from '../shared/props.js';
import {questOverlays,trackingSettings} from '../client/minimap.js';
import {emotePose} from '../client/emote-animation.js';
const run=(w,t)=>{for(let i=0;i<t;i+=.05)w.step(.05);};
const at=(p,o)=>{p.x=o.x;p.z=o.z;p.input={x:0,z:0};p.latestMove={x:0,z:0};delete p.y;settleOnSurface(p);};
const gesture=(w,p,id,target)=>{p.target=target?.id||null;w.command(p,{type:'emote',id});};
test('only learned emotes autocomplete; reward migration and reputation ranks are durable',()=>{
 const p={};assert.equal(emoteSuggestions(p,'/').length,STARTER_EMOTES.length);assert.deepEqual(emoteSuggestions(p,'/wa').map(e=>e.id),['wave']);assert.equal(emoteSuggestions(p,'hello /wa').length,0);assert.equal(emoteSuggestions(p,'/so').length,0);assert.equal(knowsEmote(p,'constructor'),false);
 const normalized=normalizeSocial({emotes:['dance','dance','missing'],reputation:{rootbound:350,bogus:100,hearthstead:Infinity},socialClaims:['gift:sera','gift:sera','arbitrary'],quests:{social_greeting:{status:'complete'},farewell:{status:'complete'}}});
 assert.deepEqual(normalized.emotes,['dance','soothe','salute']);assert.deepEqual(normalized.reputation,{rootbound:350});assert.deepEqual(normalized.socialClaims,['gift:sera']);assert.equal(reputationRank(350).name,'Friendly');assert.equal(reputationRank(-75).name,'Wary');assert.equal(reputationRank(300).progress,0);
});
test('targeted greetings credit the correct NPC once, reward an emote and persist without replaying gifts',()=>{
 const w=new World(),p=w.addPlayer('Neighbor',{xp:LEVEL_XP[2],quests:{welcome:{status:'complete',progress:1,gathered:[]},meadow:{status:'complete',progress:6,gathered:[]}}}),q=QUESTS.find(q=>q.id==='social_greeting');
 at(p,NPCS.find(n=>n.id===q.giver));w.quest(p,'accept',q.id);gesture(w,p,'wave',w.npcs.find(n=>n.id==='elowen'));assert.equal(p.quests[q.id].progress,0);run(w,1.3);
 const sera=w.npcs.find(n=>n.id==='sera');at(p,{x:sera.x,z:sera.z+2});const count=p.inventory.potion;gesture(w,p,'wave',sera);assert.ok(questReady(p,q));assert.equal(p.inventory.potion,count+1);assert.ok(w.events.some(e=>e.type==='social'&&e.source===p.id&&e.text.includes('at Sera')));
 run(w,.7);assert.ok(w.events.some(e=>e.type==='social'&&e.source==='sera'&&e.target===p.id));w.quest(p,'complete',q.id);assert.ok(knowsEmote(p,'soothe'));const xp=p.xp;w.quest(p,'complete',q.id);assert.equal(p.xp,xp);
 const next=new World(),restored=next.addPlayer(p.name,structuredClone(w.save(p)));at(restored,sera);gesture(next,restored,'wave',next.npcs.find(n=>n.id==='sera'));assert.equal(restored.inventory.potion,count+1);assert.ok(knowsEmote(restored,'soothe'));assert.ok(restored.reputation.hearthstead>0);assert.equal(restored.reputation.rootbound,undefined);
});
test('server refuses locked gestures, distant targets, interrupted gestures and spam',()=>{
 const w=new World(),p=w.addPlayer('Boundaries'),sera=w.npcs.find(n=>n.id==='sera');gesture(w,p,'dance');assert.equal(p.emote,null);at(p,{x:sera.x,z:sera.z+16});w.social.perform(p,'wave',sera.id,'target');assert.equal(p.emote,null);
 at(p,{x:sera.x,z:sera.z+2});gesture(w,p,'wave',sera);const seq=p.emote.sequence;gesture(w,p,'bow',sera);assert.equal(p.emote.sequence,seq);w.command(p,{type:'input',x:1,z:0});w.step(.05);assert.equal(p.emote,null);run(w,1.3);p.auto=true;p.target=w.enemies[0].id;w.command(p,{type:'emote',id:'wave'});assert.equal(p.emote,null);p.auto=false;w.command(p,{type:'input',x:0,z:0});run(w,.4);gesture(w,p,'sit');assert.equal(p.emote.id,'sit');w.command(p,{type:'jump'});w.step(.05);assert.equal(p.emote,null);
});
test('NPCs never attack, face greeters temporarily and cannot farm reputation or gifts',()=>{
 const w=new World(),p=w.addPlayer('Patient');for(const npc of w.npcs){at(p,{x:npc.x,z:npc.z});gesture(w,p,'taunt',npc);run(w,1.3);assert.equal(p.hp,stats(p).maxHp);assert.equal(npc.target,undefined);assert.equal(npc.facing,0);}
 const sera=w.npcs.find(n=>n.id==='sera');at(p,{x:sera.x,z:sera.z+2});gesture(w,p,'wave',sera);run(w,4);const rep=p.reputation.hearthstead,count=p.inventory.potion;gesture(w,p,'wave',sera);run(w,8);assert.equal(p.reputation.hearthstead,rep);assert.equal(p.inventory.potion,count);assert.equal(sera.facing,sera.homeFacing);
});
test('calming is personal; new encounters build lasting trust and betrayal restores aggression',()=>{
 const w=new World(),p=w.addPlayer('Listener',{emotes:['soothe']}),other=w.addPlayer('Stranger');
 const creatures=w.enemies.filter(e=>e.type==='prowler');for(const e of creatures.slice(0,6)){at(p,{x:e.x,z:e.z+10});at(other,{x:0,z:32});p.lastCombat=-100;gesture(w,p,'soothe',e);assert.equal(w.social.friendly(p,e),true);assert.equal(w.social.friendly(other,e),false);run(w,1.3);}
 assert.equal(p.reputation.rootbound,300);const e=creatures[0];run(w,46);assert.equal(w.social.friendly(p,e),true);at(p,{x:e.x,z:e.z+10});const trust=p.reputation.rootbound;gesture(w,p,'soothe',e);assert.equal(p.reputation.rootbound,trust);run(w,1.3);gesture(w,p,'taunt',e);assert.equal(e.target,p.id);assert.equal(w.social.friendly(p,e),false);assert.equal(p.reputation.rootbound,225);
 const fresh=new World(),listener=fresh.addPlayer('Betrayer',{emotes:['soothe']}),untouched=fresh.enemies.find(e=>e.type==='prowler');at(listener,{x:untouched.x,z:untouched.z+10});gesture(fresh,listener,'soothe',untouched);assert.equal(listener.reputation.rootbound,50);fresh.hit(listener,untouched,1);assert.equal(fresh.social.friendly(listener,untouched),false);assert.equal(listener.reputation.rootbound,-50);
});
test('peace does not hijack another player’s fight, reset injury or grant unrelated quest credit',()=>{
 const w=new World(),p=w.addPlayer('Peace',{emotes:['soothe']}),other=w.addPlayer('Fighter'),e=w.enemies.find(e=>e.type==='prowler');at(p,{x:e.x,z:e.z+10});e.target=other.id;gesture(w,p,'soothe',e);assert.equal(w.social.friendly(p,e),false);assert.equal(e.target,other.id);assert.equal(p.reputation.rootbound,0);run(w,1.3);e.target=null;e.hp--;gesture(w,p,'soothe',e);assert.equal(w.social.friendly(p,e),false);
 p.quests.social_peace={status:'active',progress:0,gathered:[]};p.lastCombat=-100;run(w,1.3);const n=w.enemies[0];at(p,n);gesture(w,p,'soothe',n);assert.equal(p.quests.social_peace.progress,0);
});
test('emote poses are continuous local animation, cover every emote and stop at their timestamp',()=>{
 for(const id of Object.keys(EMOTES)){const e={id,startedAt:10,endsAt:10+EMOTES[id].duration};assert.equal(emotePose(e,9),null);assert.equal(emotePose(e,e.endsAt),null);assert.equal(emotePose(e,10).weight,0);const a=emotePose(e,10.8),b=emotePose(e,10.85);assert.ok(a.weight>0);assert.ok(Object.values(a).every(n=>typeof n==='boolean'||Number.isFinite(n)));if(['wave','dance','laugh','nod','cheer','soothe'].includes(id))assert.notDeepEqual(a,b);}
});
test('early hub offers are staged and social onboarding becomes available at level two',()=>{
 const w=new World(),p=w.addPlayer('Newcomer');assert.deepEqual(QUESTS.filter(q=>questAvailable(p,q)).map(q=>q.id),['welcome']);p.quests.welcome={status:'complete'};assert.deepEqual(QUESTS.filter(q=>questAvailable(p,q)).map(q=>q.id),['meadow','herbs']);
 p.xp=210;p.level=2;p.quests.meadow={status:'complete'};assert.ok(questAvailable(p,QUESTS.find(q=>q.id==='social_greeting')));assert.equal(questAvailable(p,QUESTS.find(q=>q.id==='east_intro')),false);
 for(const q of QUESTS){assert.ok(q.requires.every(id=>QUESTS.some(v=>v.id===id)));if(q.emoteReward)assert.ok(Object.hasOwn(EMOTES,q.emoteReward));if(q.kind==='emote')assert.ok(q.emoteTarget&&Object.hasOwn(EMOTES,q.target));}
});


test('social objective tracking locates the recipient or an undisturbed creature and respects its filter',()=>{
 const w=new World(),p=w.addPlayer('Guide');p.quests.social_greeting={status:'active',progress:0,gathered:[]};let overlays=questOverlays(p,w.snapshot(p).enemies);assert.equal(overlays[0].category,'social');assert.equal(overlays[0].target.id,'sera');assert.equal(questOverlays(p,[],trackingSettings({social:false})).length,0);
 p.quests={social_peace:{status:'active',progress:0,gathered:[]}};const near=w.enemies.find(e=>e.type==='prowler');at(p,{x:near.x,z:near.z+10});overlays=questOverlays(p,w.snapshot(p).enemies);assert.ok(overlays[0].target.type==='prowler');near.hp--;overlays=questOverlays(p,w.snapshot(p).enemies);assert.notEqual(overlays[0].target.id,near.id);
});
