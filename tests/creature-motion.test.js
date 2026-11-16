import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPANSION_ASSETS} from '../shared/asset-library.js';
import {createExpansionAsset,animateExpansionAsset,animateExpansionLocomotion,disposeExpansionAsset,expansionClips} from '../client/asset-library/library.js';
import {CreatureAnimator} from '../client/animation.js';
import {roamCreature,ROAM_STRIDE} from '../server/creature-roaming.js';
import {World} from '../server/world.js';
import {ENEMY_TYPES} from '../shared/content.js';
const transforms=root=>{const values=[];root.traverse(n=>values.push(...n.position,...n.quaternion,...n.scale));return values;};
const close=(a,b,label)=>{assert.equal(a.length,b.length);assert.ok(a.every((v,i)=>Math.abs(v-b[i])<1e-7),label);};
test('all creature and character clips loop in the procedural rig before export endpoint correction',()=>{
 for(const def of EXPANSION_ASSETS.filter(a=>a.category==='creature'||a.category==='race')){
  const root=createExpansionAsset(def.id);
  for(const [state,duration]of [['idle',4],['walk',1],['attack',1.2]]){animateExpansionAsset(root,state,0);const initial=transforms(root);animateExpansionAsset(root,state,duration);close(transforms(root),initial,`${def.id} ${state} seam`);animateExpansionAsset(root,state,duration*.37);const middle=transforms(root);assert.ok(middle.some((n,i)=>Math.abs(n-initial[i])>1e-4),`${def.id} ${state} is animated`);}
  disposeExpansionAsset(root);
 }
});
test('serpents propagate a lateral wave along connected segments without rolling like legs',()=>{
 const root=createExpansionAsset('root_serpent'),body=root.children[0].children[0],coils=body.children.slice(1);assert.equal(coils.length,10);
 animateExpansionAsset(root,'walk',0);const start=coils.map(n=>n.position.x);animateExpansionAsset(root,'walk',.25);
 assert.ok(coils.filter((n,i)=>Math.abs(n.position.x-start[i])>.03).length>=8);assert.ok(coils.every(n=>Math.abs(n.rotation.z)<1e-8));assert.ok(coils.some(n=>n.position.x>.1)&&coils.some(n=>n.position.x<-.1));
 for(let i=1;i<coils.length;i++)assert.ok(coils[i].position.distanceTo(coils[i-1].position)<.31);
 disposeExpansionAsset(root);
});
test('beetle shells stay closed while legs move and jelly pulse scale survives GLB animation tracks',()=>{
 const beetle=createExpansionAsset('glass_beetle'),body=beetle.children[0].children[0],shells=body.children.slice(-2);animateExpansionAsset(beetle,'walk',.25);assert.ok(shells.every(n=>Math.abs(n.rotation.z)<1e-8));disposeExpansionAsset(beetle);
 const jelly=createExpansionAsset('fauna_starfall_4');const clips=expansionClips(jelly);assert.ok(clips.every(c=>c.tracks.some(t=>t.name.endsWith('.scale'))));disposeExpansionAsset(jelly);
});
test('locomotion follows distance continuously at 30 and 144 Hz and freezes a dead rig',()=>{
 const sample=hz=>{const root=createExpansionAsset('ridgeboar'),animator=new CreatureAnimator();for(let i=0;i<=hz*3;i++){const a=animator.step({x:i/hz*1.6,z:0},1/hz);animateExpansionLocomotion(root,i/hz,a);}const final=transforms(root);animateExpansionLocomotion(root,4,{phase:1,move:1},{dead:true});const dead=transforms(root);animateExpansionLocomotion(root,10,{phase:4,move:1},{dead:true});close(transforms(root),dead,'dead pose');disposeExpansionAsset(root);return final;};
 const low=sample(30),high=sample(144);assert.ok(low.every((n,i)=>Math.abs(n-high[i])<.001));
});
test('starter creatures walk fixed one-to-three-cycle bouts, pause and remain near home',()=>{
 const w=new World(),unit=w.enemies.find(e=>e.type==='nibbler'),def=ENEMY_TYPES[unit.type],bouts=[];let current=null,wait=0,maxWait=0,previous=null;
 for(let i=0;i<1000;i++){
  w.time+=.05;const before={x:unit.x,z:unit.z};roamCreature(w,unit,def,.05);const moved=Math.hypot(unit.x-before.x,unit.z-before.z);
  if(moved>1e-6){if(!current)current={distance:0,duration:0};current.distance+=moved;current.duration+=.05;if(previous){const ax=unit.x-before.x,az=unit.z-before.z;assert.ok(ax*previous.x+az*previous.z>=-1e-8,'no reversal during a bout');}previous={x:unit.x-before.x,z:unit.z-before.z};maxWait=Math.max(maxWait,wait);wait=0;}
  else{if(current){bouts.push(current);current=null;}previous=null;wait+=.05;}
  assert.ok(Math.hypot(unit.x-unit.homeX,unit.z-unit.homeZ)<=9.01);
 }
 assert.ok(bouts.length>=4);assert.ok(maxWait>=2);for(const bout of bouts){assert.ok(bout.duration>1);assert.ok(bout.distance>=ROAM_STRIDE-.01&&bout.distance<=ROAM_STRIDE*3+.01);assert.ok(Math.abs(bout.distance/ROAM_STRIDE-Math.round(bout.distance/ROAM_STRIDE))<.01);}
});

test('longer roaming preserves safe NPC service approaches and gestures stop motion',()=>{
 const w=new World(),unit=w.enemies.find(e=>e.type==='prowler'),def=ENEMY_TYPES[unit.type];
 for(let i=0;i<1000;i++){w.time+=.05;roamCreature(w,unit,def,.05);for(const npc of w.npcs){const homeDistance=Math.hypot(npc.x-unit.homeX,npc.z-unit.homeZ),clearance=Math.max(0,Math.min(def.aggro+3,homeDistance-1.5));if(homeDistance<18)assert.ok(Math.hypot(npc.x-unit.x,npc.z-unit.z)>=clearance-1e-6);}}
 unit.emote={endsAt:w.time+2};const old={x:unit.x,z:unit.z};roamCreature(w,unit,def,.1);assert.equal(unit.roam,null);assert.deepEqual({x:unit.x,z:unit.z},old);
});
