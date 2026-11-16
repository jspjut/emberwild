import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {CLASSES,CLASS_SKILLS} from '../shared/adventurers.js';
import {QUESTS,questForPlayer,stats} from '../shared/content.js';
import {lineOfSight} from '../shared/props.js';
const run=(w,n)=>{for(let t=0;t<n-1e-8;t+=.05)w.step(.05);};
const create=(id)=>{const w=new World(),p=w.addPlayer('Specialist',{classId:id,xp:9800}),friend=w.addPlayer('Friend');for(const v of[p,friend]){v.x=0;v.z=32;v.lastCombat=1000;}friend.hp=20;return {w,p,friend};};
test('the four kits have independent roles, melee reach and healer-only ally recovery',()=>{
 for(const id of ['dawnwarden','arcanist','pathfinder','stormcaller'])assert.equal(CLASSES[id].skills.length,6);
 assert.equal(CLASSES.dawnwarden.autoRange,3.6);for(const id of CLASSES.dawnwarden.skills){const s=CLASS_SKILLS[id];if(s.damage)assert.ok(s.range<=6);if(s.heal)assert.equal(s.selfOnly,true);}
 assert.ok(CLASSES.arcanist.skills.every(id=>!CLASS_SKILLS[id].heal));assert.ok(CLASS_SKILLS.sigil.shield);assert.ok(CLASS_SKILLS.prismward.slow);
 assert.equal(CLASSES.pathfinder.projectile,'arrow');assert.ok(CLASS_SKILLS.piercing.castTime);assert.ok(!CLASS_SKILLS.quickshot.castTime);assert.equal(CLASS_SKILLS.dressing.selfOnly,true);
 const storm=CLASSES.stormcaller.skills.map(id=>CLASS_SKILLS[id]);assert.equal(storm.filter(s=>s.damage).length,2);assert.equal(storm.filter(s=>s.heal||s.shield).length,4);assert.ok(CLASS_SKILLS.thunder.partyHeal);assert.ok(CLASS_SKILLS.stoneguard.friendlyTarget);
});
test('personal recovery cannot heal a selected ally and mage barrier never restores health',()=>{
 for(const [classId,skill] of [['dawnwarden','mend'],['pathfinder','dressing'],['arcanist','sigil']]){
  const {w,p,friend}=create(classId);p.hp=30;p.target=friend.id;w.command(p,{type:'skill',skill});assert.equal(p.casting.target,p.id);run(w,2.05);assert.equal(friend.hp,20);if(classId==='arcanist'){assert.equal(p.hp,30);assert.ok(p.shield>0);}else assert.ok(p.hp>30);
 }
});
test('Mending Tide heals only the living, nearby, visible party and credits its caster once',()=>{
 const {w,p,friend}=create('stormcaller'),stranger=w.addPlayer('Stranger'),far=w.addPlayer('Far'),dead=w.addPlayer('Dead');for(const v of[stranger,far,dead]){v.x=0;v.z=32;v.hp=20;v.lastCombat=1000;}far.x=30;dead.hp=0;
 w.parties.set('test',{members:[p.id,friend.id,far.id,dead.id]});for(const v of[p,friend,far,dead])v.partyId='test';p.hp=30;p.quests.class_dawn={status:'active',progress:0,gathered:[]};const enemyHp=w.enemies[0].hp;p.target=w.enemies[0].id;
 assert.ok(lineOfSight(p,friend));w.command(p,{type:'skill',skill:'thunder'});assert.equal(p.hp,118);assert.equal(friend.hp,108);assert.equal(stranger.hp,20);assert.equal(far.hp,20);assert.equal(dead.hp,0);assert.equal(w.enemies[0].hp,enemyHp);assert.equal(p.quests.class_dawn.progress,1);assert.equal(p.auto,false);
});
test('healer shields a player, absorbs incoming damage and expires without changing class ownership',()=>{
 const {w,p,friend}=create('stormcaller');p.target=friend.id;w.command(p,{type:'skill',skill:'stoneguard'});assert.equal(friend.shield,125);assert.equal(p.shield,0);const hp=friend.hp;w.hurt(friend,25,'test');assert.equal(friend.hp,hp);assert.ok(friend.shield<125);run(w,8.1);assert.equal(friend.shield,0);
 const denied=create('arcanist');denied.p.target=denied.friend.id;w.command(denied.p,{type:'skill',skill:'rainmend'});assert.equal(denied.friend.hp,20);
});
test('tutorials and advanced mentor lessons describe the actual class mechanics',()=>{
 for(const classId of Object.keys(CLASSES))for(const id of ['class_spark','class_mercy','class_dawn']){const q=questForPlayer({classId},QUESTS.find(q=>q.id===id));assert.ok(CLASS_SKILLS[q.target]);assert.ok(q.text.includes(CLASSES[classId].name));assert.ok(q.objective.includes(CLASS_SKILLS[q.target].name));}
 assert.match(questForPlayer({classId:'arcanist'},QUESTS.find(q=>q.id==='class_mercy')).text,/rather than restoring health/);
 assert.match(QUESTS.find(q=>q.id==='stormcaller_mastery').text,/Life Surge/);assert.ok(!QUESTS.find(q=>q.id==='stormcaller_mastery').text.includes('against worthy enemies'));
});

test('the campaign capstone reaches level ten without making support classes farm extra kills',()=>{
 const raw=QUESTS.find(q=>q.id==='five_roads');for(const classId of Object.keys(CLASSES)){const p={classId,xp:9450};assert.equal(p.xp+questForPlayer(p,raw).xp,9800);assert.equal(questForPlayer({classId,xp:10000},raw).xp,raw.xp);}
});
