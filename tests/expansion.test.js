import {gatherPosition} from './gather-route.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {World} from '../server/world.js';
import {CharacterStore} from '../server/characters.js';
import {CLASSES,RACES,validRaceClass,classSkills,skillForRole,armorAllowed} from '../shared/adventurers.js';
import {QUESTS,NPCS,GATHERABLES,SKILLS,ITEMS,LEVEL_XP,questForPlayer,questRecord,questAvailable,questReady,stats,walkable} from '../shared/content.js';
import {OUTPOSTS,ROOM_LAYOUTS,EXPANSION_BUILDINGS,ROUTES} from '../shared/world-layouts.js';
import {lineOfSight,settleOnSurface,supportBelow,bodyFits} from '../shared/props.js';
import {heightAt} from '../shared/terrain.js';
import {advanceMotion} from '../shared/movement.js';
const run=(w,s)=>{for(let t=0;t<s;t+=.05)w.step(.05);};
const at=(p,o)=>{p.x=o.x;p.z=o.z;p.input={x:0,z:0};delete p.y;settleOnSurface(p);};

test('race traditions validate creation, class starter gear and durable identity for every supported combination',async()=>{
 const dir=await mkdtemp(`${tmpdir()}/emberwild-classes-`);try{
 const store=await CharacterStore.open(`${dir}/characters.json`);
 for(const race of Object.values(RACES))for(const c of Object.values(CLASSES)){
  const token=await store.session();
  if(!validRaceClass(race.id,c.id)){await assert.rejects(store.create(token,'Invalid Student','hearth',0,undefined,{raceId:race.id,classId:c.id}),/current expedition/);continue;}
  const id=await store.create(token,`Student ${Object.keys(RACES).indexOf(race.id)}${Object.keys(CLASSES).indexOf(c.id)}`,'hearth',0,undefined,{raceId:race.id,classId:c.id}),entry=store.roster(token).characters[0];assert.equal(entry.id,id);assert.equal(entry.raceId,race.id);assert.equal(entry.classId,c.id);assert.equal(entry.equipment.weapon,c.starterWeapon);assert.equal(entry.equipment.armor,c.starterArmor);
  const w=new World(),p=w.addPlayer(entry.name,{...entry,xp:LEVEL_XP[9]});const restored=new World().addPlayer(p.name,structuredClone(w.save(p)));assert.equal(restored.classId,c.id);assert.equal(restored.raceId,race.id);assert.equal(w.snapshot(p).players[0].raceId,race.id);
 }
 const legacy=new World().addPlayer('Old Friend');assert.equal(legacy.classId,'dawnwarden');assert.equal(legacy.raceId,'human');
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('class skills enforce ownership, armor ceilings, ranged attacks, absorbs and three-second slows',()=>{
 for(const c of Object.values(CLASSES)){
  const w=new World(),p=w.addPlayer('Student',{classId:c.id,raceId:'human',xp:LEVEL_XP[9]}),e=w.enemies[0];at(p,{x:e.x,z:e.z+2});p.target=e.id;
  const foreign=Object.keys(SKILLS).find(id=>!classSkills(p).includes(id)),energy=p.energy;w.command(p,{type:'skill',skill:foreign});assert.equal(p.energy,energy);assert.equal(p.casting,null);
  const utility=skillForRole(p,'utility'),s=SKILLS[utility];w.command(p,{type:'skill',skill:utility});
  if(s.shield){const hp=p.hp;assert.ok(p.shield>0);w.hurt(p,30,'test');assert.equal(p.hp,hp);run(w,8.1);assert.equal(p.shield,0);}else{assert.equal(e.slow,.75);assert.ok(e.slowUntil>w.time);}
  p.inventory.sentinel_coat=1;w.command(p,{type:'equip',item:'sentinel_coat'});assert.equal(p.equipment.armor==='sentinel_coat',armorAllowed(c.id,'plate'));
  const r=new World(),rp=r.addPlayer('Archer',{classId:c.id}),re=r.enemies[0];at(rp,{x:re.x,z:re.z+12});rp.target=re.id;rp.auto=true;const hp=re.hp;r.step(.05);assert.equal(re.hp<hp,c.autoRange>=12);
 }
});

test('all five boss sites have connected walk-through rooms, flat floors and solid walls that stop spells',()=>{
 for(const o of OUTPOSTS){const rooms=EXPANSION_BUILDINGS.filter(b=>b.siteId===`lair-${o.id}`),plan=ROOM_LAYOUTS[o.layout];assert.equal(rooms.length,plan.rooms.length);
  const p={x:rooms[0].x,z:rooms[0].z,facing:0,jumpHeight:0,jumpVelocity:0};settleOnSurface(p);
  for(const b of rooms){for(let i=0;i<500&&Math.hypot(p.x-b.x,p.z-b.z)>.12;i++){const d=Math.hypot(b.x-p.x,b.z-p.z);advanceMotion(p,{x:(b.x-p.x)/d,z:(b.z-p.z)/d});}assert.ok(Math.hypot(p.x-b.x,p.z-b.z)<.15,`${o.id}: ${b.id} connected`);assert.ok(Math.abs(heightAt(p.x,p.z)-.2)<1e-6);}
  const b=rooms.at(-1),inside={x:b.x,z:b.z},outside={x:b.x,z:b.z+b.depth/2+2};assert.equal(lineOfSight(inside,outside),false,`${o.id} closed far wall`);
 }
});

for(const c of Object.values(CLASSES))test(`${c.name}: complete the whole starter campaign with real combat, loot, class quests and all six delegation bosses`,()=>{
 const w=new World(),p=w.addPlayer('Campaign',{classId:c.id,raceId:'human'});let kills=0;
 function recover(){p.auto=false;p.target=null;w.cancelCast(p);at(p,{x:0,z:29});run(w,55);assert.ok(p.hp>0);}
 function cast(id){if(id)w.command(p,{type:'skill',skill:id});}
 function fight(type,required){
  recover();let e=w.enemies.find(e=>e.type===type&&e.hp>0&&!e.evading);if(!e){run(w,65);e=w.enemies.find(e=>e.type===type&&e.hp>0&&!e.evading);}assert.ok(e,`${type} available`);
  at(p,{x:e.x,z:e.z+3});p.target=e.id;p.auto=true;
  for(let i=0;i<3000&&e.hp>0;i++){
   if(e.slamAt>w.time){const radius=(w.snapshot(p).enemies.find(v=>v.id===e.id).slamRadius||7),cx=e.slamX??e.x,cz=e.slamZ??e.z;if(Math.hypot(p.x-cx,p.z-cz)<radius+.3){w.cancelCast(p);let spot;for(let a=0;a<32;a++){const x=cx+Math.cos(a/32*Math.PI*2)*(radius+.7),z=cz+Math.sin(a/32*Math.PI*2)*(radius+.7);if(walkable(x,z)&&lineOfSight({x,z},e)&&Math.hypot(x-e.homeX,z-e.homeZ)<18){spot={x,z};break;}}assert.ok(spot,`${type}: room for telegraph dodge`);at(p,spot);}}
   else if(Math.hypot(e.x-p.x,e.z-p.z)>3.4&&!p.casting)at(p,{x:e.x,z:e.z+3});
   if(p.hp<stats(p).maxHp*.65)cast(skillForRole(p,'heal'));
   if(p.hp<stats(p).maxHp*.35)w.command(p,{type:'potion'});
   if(required)cast(required);
   if(p.level>=7)cast(skillForRole(p,'utility'));
   if(p.level>=9)cast(skillForRole(p,'advanced'));
   if(p.level>=4)cast(skillForRole(p,'area'));
   cast(skillForRole(p,'primary'));cast(skillForRole(p,'ranged'));w.step(.05);
   assert.ok(p.hp>0,`${c.id} died to ${type} at level ${p.level}, enemy hp ${e.hp}`);
  }
  assert.equal(e.hp,0,`${type} defeated: ${JSON.stringify({enemy:{x:e.x,z:e.z,homeX:e.homeX,homeZ:e.homeZ,target:e.target,evading:e.evading,slamAt:e.slamAt},player:{x:p.x,z:p.z,hp:p.hp,auto:p.auto,casting:p.casting}})}`);at(p,e);w.command(p,{type:'interact',id:e.id,autoLoot:true});p.auto=false;kills++;
 }
 function finish(raw){const q=questForPlayer(p,raw);at(p,NPCS.find(n=>n.id===q.giver));w.command(p,{type:'quest',action:'accept',id:q.id});assert.equal(questRecord(p,q)?.status,'active',q.id);
  if(q.kind==='deliver'){at(p,NPCS.find(n=>n.id===q.target));w.command(p,{type:'interact',id:q.target});}
  else if(q.kind==='explore'){at(p,q.location);w.step(.05);}
  else if(q.kind==='gather')for(const g of GATHERABLES.filter(g=>g.type===q.target)){recover();at(p,gatherPosition(w,g));w.command(p,{type:'interact',id:g.id});for(let attempt=0;attempt<3&&!p.harvestReady[g.id];attempt++){if(attempt)w.command(p,{type:'interact',id:g.id});run(w,1.05);}if(questReady(p,q))break;}
  else if(['kill','loot'].includes(q.kind)){let limit=0;while(!questReady(p,q)&&limit++<20)fight(q.target);}
  else if(q.kind==='skill'){let limit=0;while(!questReady(p,q)&&limit++<12){const s=SKILLS[q.target];if(s.heal||s.shield){recover();p.hp-=20;p.target=null;cast(q.target);run(w,22);}else fight(p.level>=7?'roadbandit':p.level>=4?'shardling':'nibbler',q.target);}}
  if(q.kind==='emote'){recover();run(w,65);const target=w.unit(q.emoteTarget)||w.enemies.find(e=>e.type===q.emoteTarget&&e.hp>0&&!e.target&&!e.evading);assert.ok(target);at(p,{x:target.x,z:target.z+(target.role?2:10)});p.target=target.id;w.command(p,{type:'emote',id:q.target});}
  assert.ok(questReady(p,q),`${q.id} ready (${questRecord(p,q)?.progress}/${q.count})`);at(p,NPCS.find(n=>n.id===q.turnIn));w.command(p,{type:'quest',action:'complete',id:q.id});assert.equal(questRecord(p,q)?.status,'complete',`${q.id} turned in`);if(ITEMS[q.reward]?.slot)w.command(p,{type:'equip',item:q.reward});recover();
 }
 for(let i=0;i<QUESTS.length;i++){const q=QUESTS.find(q=>questAvailable(p,q));if(!q)break;finish(q);}
 const applicable=QUESTS.filter(q=>!q.classId||q.classId===c.id);assert.equal(Object.values(p.quests).filter(q=>q.status==='complete').length,applicable.length,`stalled level ${p.level} XP ${p.xp}, missing ${applicable.filter(q=>!questRecord(p,q)).map(q=>q.id)}`);assert.equal(p.level,10);assert.ok(p.xp>=LEVEL_XP[10]&&p.xp<=LEVEL_XP[10]+300,`Campaign finishes just into level 10: ${p.xp}`);assert.equal(questRecord(p,'five_roads').status,'complete');for(const o of OUTPOSTS)assert.equal(questRecord(p,`${o.id}_boss`).status,'complete');
 console.log(`${c.name}: ${applicable.length} quests, ${kills} combat wins, level ${p.level}, ${p.xp} XP. Travel is relocated; pacing is not measured.`);
});


test('painted southern roads remain walkable around settlement props and connect to actual doors',()=>{
 for(const [r,route]of ROUTES.entries())for(let j=1;j<route.length;j++){
  const[a,b]=[route[j-1],route[j]],steps=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])*4);
  for(let i=0;i<=steps;i++){const x=a[0]+(b[0]-a[0])*i/steps,z=a[1]+(b[1]-a[1])*i/steps;assert.ok(bodyFits(x,z,supportBelow(x,z).y),`Road ${r}: ${x},${z}`);}
 }
});

test('southern services bind a safe hearth and trade at the local provisioner',()=>{
 const w=new World(),p=w.addPlayer('Traveler');at(p,NPCS.find(n=>n.id==='town-healer'));w.command(p,{type:'interact',id:'town-healer'});assert.equal(p.hearthNpcId,'town-healer');w.hurt(p,10000,'test');run(w,5.1);w.command(p,{type:'respawn'});assert.equal(p.x,NPCS.find(n=>n.id==='town-healer').x);assert.equal(p.z,NPCS.find(n=>n.id==='town-healer').z);assert.equal(p.hp,stats(p).maxHp);
 at(p,NPCS.find(n=>n.id==='town-merchant'));p.gold=20;const count=p.inventory.potion;w.command(p,{type:'trade',action:'buy',item:'potion'});assert.equal(p.inventory.potion,count+1);assert.equal(p.gold,14);assert.equal(w.save(p).hearthNpcId,'town-healer');
});
