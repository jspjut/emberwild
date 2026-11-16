import {REACH_DIVIDE_POSTS} from '../shared/zone-layout.js';
import {settleOnSurface} from '../shared/props.js';
import {gatherPosition} from './gather-route.js';
import {ZONE_BOUNDS,introPoint} from '../shared/zone-layout.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../server/world.js';
import { QUESTS, NPCS, GATHERABLES, ENEMY_TYPES, SKILLS, ITEMS, questRecord, questAvailable, questReady, activeQuests, stats, walkable, bagEntries, BAG_CAPACITY } from '../shared/content.js';

const run=(w,seconds)=>{for(let t=0;t<seconds;t+=.05)w.step(.05);};
function at(p,o){p.x=o.x;p.z=o.z;p.input={x:0,z:0};delete p.y;settleOnSurface(p);}
function accept(w,p,id){const q=QUESTS.find(q=>q.id===id);at(p,NPCS.find(n=>n.id===q.giver));w.command(p,{type:'quest',action:'accept',id});assert.equal(questRecord(p,q)?.status,'active',`${id} must be available at level ${p.level}`);}
function turnIn(w,p,id){const q=QUESTS.find(q=>q.id===id);assert.ok(questReady(p,q),`${id} ready to complete`);at(p,NPCS.find(n=>n.id===q.turnIn));w.command(p,{type:'quest',action:'complete',id});assert.equal(questRecord(p,q).status,'complete');if(ITEMS[q.reward]?.slot)w.command(p,{type:'equip',item:q.reward});}

test('movement is server-authoritative, normalized, bounded, expires, and collides',()=>{
  const w=new World(),p=w.addPlayer('Walker');
  w.command(p,{type:'input',x:10000,z:10000});w.step(.1);
  assert.ok(Math.hypot(p.x,p.z-32)<=.651);
  w.command(p,{type:'input',x:NaN,z:0});run(w,1);const x=p.x;run(w,1);assert.equal(p.x,x);
  const divide=REACH_DIVIDE_POSTS[0];at(p,{x:divide.x-8.4,z:divide.z});w.command(p,{type:'input',x:1,z:0});w.step(.1);assert.ok(p.x<divide.x-8,'the physical divide bounds movement after the mainland expansion');
  assert.equal(walkable(introPoint(-11,37).x,introPoint(-11,37).z),true,'room interiors are walkable');assert.equal(walkable(introPoint(-11,37).x+4,introPoint(-11,37).z),false,'exterior walls still collide');
});
test('jump rises and lands, preserves movement and autoattack, replicates to peers, and cannot restart midair or after death',()=>{
  const w=new World(),p=w.addPlayer('Jumper'),peer=w.addPlayer('Observer');
  p.auto=true;w.command(p,{type:'jump'});w.step(.1);
  assert.ok(p.jumpHeight>0);assert.equal(p.auto,true);
  const velocity=p.jumpVelocity;w.command(p,{type:'jump'});assert.equal(p.jumpVelocity,velocity);
  w.command(p,{type:'input',x:1,z:0});w.step(.1);assert.ok(p.x>0);
  const snapshot=w.snapshot(peer);assert.equal(snapshot.players.find(v=>v.id===p.id).jumpHeight,p.jumpHeight);assert.equal(w.snapshot(p).self.jumpHeight,p.jumpHeight);
  run(w,1);assert.equal(p.jumpHeight,0);assert.equal(p.jumpVelocity,0);assert.equal(p.auto,true);
  w.command(p,{type:'jump'});w.step(.1);assert.ok(p.jumpHeight>0);
  w.hurt(p,1000,'test');assert.equal(p.jumpHeight,0);w.command(p,{type:'jump'});assert.equal(p.jumpVelocity,0);
  run(w,5.1);w.command(p,{type:'respawn'});w.command(p,{type:'jump'});w.step(.1);assert.ok(p.jumpHeight>0);
});
test('skills enforce level, range, cost and cooldown and gear enforces ownership',()=>{
  const w=new World(),p=w.addPlayer('Fighter'),e=w.enemies[0];p.target=e.id;
  const hp=e.hp;w.command(p,{type:'skill',skill:'strike'});assert.equal(e.hp,hp);
  at(p,e);w.command(p,{type:'skill',skill:'strike'});assert.ok(e.hp<hp);const after=e.hp,energy=p.energy;
  w.command(p,{type:'skill',skill:'strike'});assert.equal(e.hp,after);assert.equal(p.energy,energy);
  w.command(p,{type:'skill',skill:'nova'});assert.equal(e.hp,after);
  w.command(p,{type:'equip',item:'dawn_blade'});assert.equal(p.equipment.weapon,'training_blade');
  p.energy=0;w.command(p,{type:'skill',skill:'lance'});assert.equal(e.hp,after);
});
test('concurrent quests enforce prerequisites, range, distinct gathering and one-time rewards',()=>{
  const w=new World(),p=w.addPlayer('Quester');accept(w,p,'welcome');
  assert.equal(questAvailable(p,QUESTS.find(q=>q.id==='meadow')),false);
  at(p,NPCS[2]);w.command(p,{type:'interact',id:'sera'});turnIn(w,p,'welcome');
  accept(w,p,'meadow');accept(w,p,'herbs');assert.equal(questAvailable(p,QUESTS.find(q=>q.id==='seeds')),false);assert.equal(activeQuests(p).length,2);
  const herb=GATHERABLES.find(g=>g.type==='herb');at(p,herb);w.command(p,{type:'interact',id:herb.id});w.command(p,{type:'interact',id:herb.id});run(w,1.05);assert.equal(questRecord(p,'herbs').progress,1);
  at(p,NPCS[0]);w.command(p,{type:'quest',action:'complete',id:'meadow'});assert.equal(questRecord(p,'meadow').status,'active');
  const before=p.xp;w.command(p,{type:'quest',action:'complete',id:'welcome'});assert.equal(p.xp,before);
});
test('shared kills award each participant their own XP and loot once',()=>{
  const w=new World(),a=w.addPlayer('One'),b=w.addPlayer('Two'),e=w.enemies[0];at(a,e);at(b,e);
  w.hit(a,e,10);w.hit(b,e,999);assert.equal(a.xp,20);assert.equal(b.xp,20);
  w.command(a,{type:'interact',id:e.id,autoLoot:true});w.command(b,{type:'interact',id:e.id,autoLoot:true});assert.equal(a.inventory.resin,1);assert.equal(b.inventory.resin,1);
  const gold=a.gold;w.command(a,{type:'interact',id:e.id,autoLoot:true});assert.equal(a.gold,gold);
});
test('opening loot grants nothing; individual slots enforce eligibility, range and one-time collection',()=>{
  const w=new World(),p=w.addPlayer('Looter'),other=w.addPlayer('Stranger'),e=w.enemies[0];at(p,e);at(other,e);w.hit(p,e,999);
  w.command(p,{type:'interact',id:e.id});assert.equal(p.gold,0);assert.equal(p.inventory.resin,undefined);assert.ok(w.events.some(v=>v.type==='loot'&&v.to===p.id&&v.items.length===1));
  w.command(other,{type:'loot',id:e.id,slot:'all'});assert.equal(other.inventory.resin,undefined);
  at(p,{x:0,z:32});w.command(p,{type:'loot',id:e.id,slot:'all'});assert.equal(p.gold,0);
  at(p,e);w.command(p,{type:'loot',id:e.id,slot:'coins'});assert.equal(p.gold,3);assert.equal(p.inventory.resin,undefined);assert.ok(e.loot.has(p.id));
  w.command(p,{type:'loot',id:e.id,slot:'coins'});assert.equal(p.gold,3);
  w.command(p,{type:'loot',id:e.id,slot:'resin'});assert.equal(p.inventory.resin,1);assert.equal(e.loot.has(p.id),false);
  w.command(p,{type:'loot',id:e.id,slot:'all'});assert.equal(p.inventory.resin,1);
});
test('full bags leave items on the corpse while allowing coins to be collected',()=>{
  const w=new World(),p=w.addPlayer('Packed'),e=w.enemies[0];p.inventory.resin=99*19;p.inventory.potion=99;
  assert.equal(bagEntries(p).length,BAG_CAPACITY);at(p,e);w.hit(p,e,999);w.command(p,{type:'loot',id:e.id,slot:'all'});
  assert.equal(p.gold,3);assert.equal(p.inventory.resin,99*19);assert.equal(e.loot.has(p.id),true);
  delete p.inventory.potion;w.command(p,{type:'loot',id:e.id,slot:'all'});assert.equal(p.inventory.resin,99*19+1);assert.equal(e.loot.has(p.id),false);
});
test('quest items occupy bags, cannot be sold, and are consumed on turn-in',()=>{
  const w=new World(),p=w.addPlayer('Seeds');p.quests.welcome={status:'complete',progress:1,gathered:[]};p.quests.meadow={status:'complete',progress:6,gathered:[]};accept(w,p,'seeds');
  for(const e of w.enemies.slice(0,5)){at(p,e);w.hit(p,e,999);w.command(p,{type:'loot',id:e.id,slot:'seeds'});}
  assert.equal(p.inventory.seed_pouch,5);assert.equal(questRecord(p,'seeds').progress,5);
  at(p,NPCS[1]);w.command(p,{type:'trade',action:'sellItem',item:'seed_pouch',all:true});assert.equal(p.inventory.seed_pouch,5);
  turnIn(w,p,'seeds');assert.equal(p.inventory.seed_pouch,0);
});
test('equipment rewards enter bags; equipping and unequipping transfer visible bag slots without losing ownership',()=>{
  const w=new World(),p=w.addPlayer('Gear');p.quests.welcome={status:'complete',progress:1,gathered:[]};p.quests.meadow={status:'active',progress:6,gathered:[]};at(p,NPCS[0]);
  w.command(p,{type:'quest',action:'complete',id:'meadow'});assert.equal(p.equipment.weapon,'training_blade');assert.equal(p.inventory.copper_blade,1);assert.ok(bagEntries(p).some(v=>v.id==='copper_blade'));
  w.command(p,{type:'equip',item:'copper_blade'});assert.ok(bagEntries(p).some(v=>v.id==='training_blade'));assert.ok(!bagEntries(p).some(v=>v.id==='copper_blade'));
  w.command(p,{type:'unequip',slot:'weapon'});assert.equal(p.equipment.weapon,null);assert.ok(bagEntries(p).some(v=>v.id==='copper_blade'));
  w.command(p,{type:'equip',item:'copper_blade'});at(p,NPCS[1]);w.command(p,{type:'trade',action:'sellItem',item:'copper_blade',all:true});assert.equal(p.inventory.copper_blade,1,'equipped gear cannot be sold');
  w.command(p,{type:'trade',action:'sellItem',item:'training_blade'});assert.equal(p.inventory.training_blade,0);
});
test('old active quest progress migrates into quest items without duplicating existing items',()=>{
  const initial=new World(),old=initial.addPlayer('Returning');old.quests.seeds={status:'active',progress:3,gathered:[]};
  const restored=new World().addPlayer(old.name,JSON.parse(JSON.stringify(initial.save(old))));assert.equal(restored.inventory.seed_pouch,3);
  const restoredAgain=new World().addPlayer(restored.name,JSON.parse(JSON.stringify(initial.save(restored))));assert.equal(restoredAgain.inventory.seed_pouch,3);assert.equal(restoredAgain.quests.seeds.progress,3);
});
test('vendor stacks spill into free bag slots; selling a stack is bounded and bulk trade sales retain tonics',()=>{
  const w=new World(),p=w.addPlayer('Trader');at(p,NPCS[1]);p.gold=20;p.inventory.potion=99;p.inventory.resin=120;
  w.command(p,{type:'trade',action:'buy'});assert.equal(p.inventory.potion,100);assert.equal(p.gold,14);assert.equal(bagEntries(p).filter(v=>v.id==='potion').length,2);
  w.command(p,{type:'trade',action:'sellItem',item:'resin',all:true,count:21});assert.equal(p.inventory.resin,99);assert.equal(p.gold,77);
  w.command(p,{type:'trade',action:'sell'});assert.equal(p.inventory.potion,100);assert.equal(p.inventory.resin,undefined);
  w.command(p,{type:'trade',action:'sellItem',item:'potion'});assert.equal(p.inventory.potion,99);
});
test('leashed enemies return home without repeatedly reacquiring or accepting damage',()=>{
  const w=new World(),p=w.addPlayer('Runner'),e=w.enemies.find(e=>e.type==='prowler');
  e.x=e.homeX+24;at(p,e);e.target=p.id;w.step(.05);assert.equal(e.evading,true);const hp=e.hp;w.hit(p,e,999);assert.equal(e.hp,hp);
  at(p,{x:0,z:32});run(w,8);assert.equal(e.evading,false);assert.ok(Math.hypot(e.x-e.homeX,e.z-e.homeZ)<3);
});
test('death, recovery, enemy respawn and persistence round trip preserve progression',()=>{
  const w=new World(),p=w.addPlayer('Survivor');p.gold=50;p.quests.welcome={status:'complete',progress:1,gathered:[]};w.hurt(p,1000,'test');
  w.command(p,{type:'respawn'});assert.equal(p.hp,0);run(w,5.1);w.command(p,{type:'respawn'});assert.equal(p.hp,stats(p).maxHp);assert.equal(p.gold,50);
  const e=w.enemies[0];at(p,e);w.hit(p,e,1000);run(w,31);assert.ok(w.enemies[0].hp>0);
  const saved=JSON.parse(JSON.stringify(w.save(p))),w2=new World(),restored=w2.addPlayer(saved.name,saved);
  assert.equal(restored.gold,50);assert.deepEqual(restored.quests,p.quests);assert.deepEqual(restored.inventory,p.inventory);
});
test('boss attack is telegraphed and can be dodged',()=>{
  const w=new World(),p=w.addPlayer('Dodger'),e=w.enemies.find(e=>e.type==='warden');at(p,e);w.hit(p,e,1);w.step(.05);assert.ok(e.slamAt>w.time);
  at(p,{x:e.x+9,z:e.z});const hp=p.hp;run(w,1.8);assert.equal(p.hp,hp);assert.equal(e.slamAt,0);
});

test('northern campaign stages social introductions between combat, skill and loot quests',()=>{
  const w=new World(),p=w.addPlayer('Campaign');let deaths=0;
  function recover(){at(p,{x:0,z:29});run(w,30);assert.ok(p.hp>0);}
  function fight(type){
    recover();
    let e=w.enemies.filter(e=>e.type===type&&e.hp>0&&!e.evading).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];
    if(!e){recover();run(w,60);e=w.enemies.find(e=>e.type===type&&e.hp>0&&!e.evading);}
    at(p,{x:e.x,z:e.z+3});p.target=e.id;p.auto=true;
    for(let i=0;i<1800&&e.hp>0;i++){
      // Bot dodges the same telegraph shown to human players.
      if(e.slamAt>w.time)at(p,{x:e.x,z:e.z+8});else if(Math.hypot(e.x-p.x,e.z-p.z)>3.4)at(p,{x:e.x,z:e.z+3});
      if(p.hp<stats(p).maxHp*.65&&p.level>=2)w.command(p,{type:'skill',skill:'mend'});
      if(p.hp<stats(p).maxHp*.4)w.command(p,{type:'potion'});
      if(p.level>=4)w.command(p,{type:'skill',skill:'nova'});
      w.command(p,{type:'skill',skill:'strike'});w.command(p,{type:'skill',skill:'lance'});w.step(.05);
      if(p.hp<=0){deaths++;throw Error(`Bot died fighting ${type} at level ${p.level}`);}
    }
    assert.equal(e.hp,0,`${type} kill`);at(p,e);w.command(p,{type:'interact',id:e.id,autoLoot:true});p.auto=false;
  }
  function finish(id){
    const q=QUESTS.find(q=>q.id===id);if(!questRecord(p,q))accept(w,p,id);
    if(q.kind==='deliver'){at(p,NPCS.find(n=>n.id===q.target));w.command(p,{type:'interact',id:q.target});}
    else if(q.kind==='explore'){at(p,q.location);w.step(.05);}
    else if(q.kind==='gather'){for(const g of GATHERABLES.filter(g=>g.type===q.target)){recover();at(p,gatherPosition(w,g));w.command(p,{type:'interact',id:g.id});run(w,1.05);if(questReady(p,q))break;}}
    else if(q.kind==='kill'||q.kind==='loot'){while(!questReady(p,q))fight(q.target);}
    else if(q.kind==='skill'){
      let attempts=0;
      while(!questReady(p,q)&&attempts++<20){if(q.target==='mend'){recover();p.hp-=20;w.command(p,{type:'skill',skill:'mend'});run(w,11);}else fight(p.level>=4?'shardling':'nibbler');}
    }
    if(q.kind==='emote'){recover();const target=w.unit(q.emoteTarget)||w.enemies.find(e=>e.type===q.emoteTarget&&e.hp===ENEMY_TYPES[e.type].hp&&!e.target);assert.ok(target);at(p,{x:target.x,z:target.z+(target.role?2:10)});p.target=target.id;w.command(p,{type:'emote',id:q.target});}
    turnIn(w,p,id);recover();
  }
  finish('welcome');accept(w,p,'meadow');accept(w,p,'herbs');
  finish('meadow');finish('social_greeting');finish('seeds');finish('herbs');finish('supplies');finish('survey');finish('west_report');finish('tracks');finish('creek');finish('ledger');
  finish('class_spark');finish('class_mercy');finish('east_intro');accept(w,p,'thicket');accept(w,p,'sap');accept(w,p,'seedhearts');
  finish('thicket');finish('sap');finish('seedhearts');finish('social_road');finish('social_listen');finish('social_peace');finish('missing_scout');accept(w,p,'beacons');accept(w,p,'memory');finish('beacons');finish('memory');
  accept(w,p,'shards');accept(w,p,'relics');accept(w,p,'class_dawn');finish('shards');finish('relics');finish('class_dawn');finish('heart');finish('farewell');
  assert.equal(Object.values(p.quests).filter(q=>q.status==='complete').length,28);assert.equal(p.level,6);assert.equal(p.equipment.weapon,'dawn_blade');assert.equal(p.equipment.armor,'sentinel_coat');assert.equal(deaths,0);
  console.log(`Campaign result: level ${p.level}, ${p.xp} XP, ${p.gold} copper, 28 quests, no deaths. Bot relocates between objectives; this is a rules/progression test, not a wall-clock pacing measurement.`);
});
