import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {GLOBAL_COOLDOWN,SKILLS} from '../shared/content.js';
import {GlobalCooldownPresentation,CastPresentation} from '../client/netcode.js';
const run=(w,seconds)=>{for(let t=0;t<seconds-1e-8;t+=.05)w.step(.05);};
function fighter(){const w=new World(),p=w.addPlayer('Shared cooldown',{xp:950}),e=w.enemies[0];p.x=e.x;p.z=e.z+2;p.target=e.id;return {w,p,e};}
test('instant abilities start one shared cooldown and reject bursts without spending resources or replacing it',()=>{
  const {w,p,e}=fighter();w.command(p,{type:'skill',skill:'strike',requestId:1});p.auto=false;const hp=e.hp,energy=p.energy,gcd={...p.globalCooldown};
  assert.equal(gcd.endsAt-gcd.startedAt,GLOBAL_COOLDOWN);
  for(const [skill,requestId]of [['nova',2],['lance',3],['mend',4]])w.command(p,{type:'skill',skill,requestId});
  assert.equal(e.hp,hp);assert.equal(p.energy,energy);assert.equal(p.casting,null);assert.equal(p.cooldowns.nova,undefined);assert.deepEqual(p.globalCooldown,gcd);
  run(w,1.4);w.command(p,{type:'skill',skill:'nova',requestId:5});assert.equal(p.cooldowns.nova,undefined);
  run(w,.15);w.command(p,{type:'skill',skill:'nova',requestId:6});assert.ok(p.cooldowns.nova>w.time);assert.equal(p.globalCooldown.requestId,6);assert.ok(p.cooldowns.strike>w.time,'individual cooldown remains separate');
});
test('cancelling an unfinished cast releases its shared cooldown; completion does not restart it',()=>{
  const {w,p}=fighter();w.command(p,{type:'skill',skill:'lance',requestId:1});assert.ok(p.casting);assert.equal(p.cooldowns.lance,undefined);
  run(w,.3);w.command(p,{type:'cancelCast',requestId:1});assert.equal(p.casting,null);assert.equal(p.globalCooldown,null);assert.equal(p.energy,100);assert.equal(p.cooldowns.lance,undefined);
  w.command(p,{type:'skill',skill:'mend',requestId:2});assert.ok(p.casting,'another cast can begin immediately after cancellation');const ends=p.globalCooldown.endsAt;run(w,1.85);assert.equal(p.casting,null);assert.equal(p.globalCooldown.endsAt,ends);assert.ok(ends<w.time);assert.ok(p.cooldowns.mend>w.time);
  w.command(p,{type:'skill',skill:'nova',requestId:3});assert.ok(p.cooldowns.nova>w.time);
});
test('movement, jumping and explicit cancellation reset only the unfinished cast cooldown',()=>{
  for(const cancel of [{type:'input',x:1,z:0},{type:'jump'},{type:'cancelCast',requestId:1}]){
    const {w,p}=fighter();w.command(p,{type:'skill',skill:'lance',requestId:1});w.command(p,cancel);assert.equal(p.globalCooldown,null);assert.equal(p.casting,null);
    w.command(p,{type:'skill',skill:'nova',requestId:2});const gcd={...p.globalCooldown};assert.equal(gcd.requestId,2);
    w.command(p,{type:'cancelCast',requestId:1});w.command(p,{type:'cancelCast',requestId:2});w.command(p,{type:'input',x:1,z:0});assert.deepEqual(p.globalCooldown,gcd,'old cancels and movement cannot clear a completed instant ability cooldown');
  }
});
test('invalid abilities never start the global cooldown',()=>{
  for(const invalid of ['range','target','energy','moving','airborne','level','empty-area']){
    const {w,p,e}=fighter();let skill='lance';if(invalid==='range')p.z=e.z+30;if(invalid==='target')p.target=null;if(invalid==='energy')p.energy=0;
    if(invalid==='moving'){p.input={x:1,z:0};p.inputAt=w.time;}if(invalid==='airborne')p.grounded=false;if(invalid==='level'){p.level=1;skill='nova';}if(invalid==='empty-area'){p.z=e.z+50;skill='nova';}
    w.command(p,{type:'skill',skill,requestId:1});assert.equal(p.globalCooldown,null,invalid);assert.equal(p.casting,null,invalid);assert.deepEqual(p.cooldowns,{},invalid);
  }
});
test('autoattack and tonics remain usable during the shared cooldown, and death/resume clear transient timing',()=>{
  const {w,p,e}=fighter();p.hp=40;p.lastCombat=100;w.command(p,{type:'skill',skill:'strike',requestId:1});const gcd={...p.globalCooldown},hp=e.hp;
  w.command(p,{type:'auto',enabled:true});w.step(.05);assert.ok(e.hp<hp);w.command(p,{type:'potion'});assert.ok(p.hp>40);assert.ok(p.cooldowns.potion>w.time);assert.deepEqual(p.globalCooldown,gcd);
  assert.equal(w.save(p).globalCooldown,undefined);assert.equal(new World().addPlayer(p.name,w.save(p)).globalCooldown,null);
  w.hurt(p,10000,'test');assert.equal(p.globalCooldown,null);w.respawn(p);assert.equal(p.globalCooldown,null);
});
test('predicted shared sweeps survive stale snapshots, acknowledge without restarting and roll back rejected attempts',()=>{
  const g=new GlobalCooldownPresentation(),base={motionEpoch:0,hp:100,lastCastRequest:0,globalCooldown:null};g.reconcile(base,0,10);g.start(1,0);assert.equal(g.remaining(0),1.5);
  g.reconcile(base,100,10.1);assert.equal(g.remaining(100),1.4);
  const accepted={...base,lastCastRequest:1,globalCooldown:{requestId:1,startedAt:10.15,endsAt:11.65}};g.reconcile(accepted,300,10.3);assert.ok(Math.abs(g.remaining(300)-1.35)<1e-8);
  g.reconcile(accepted,500,10.5);assert.ok(Math.abs(g.remaining(500)-1.15)<1e-8);
  g.start(2,2000);g.reconcile(accepted,2100,12.1);assert.equal(g.current.requestId,2,'an old acknowledgement cannot erase the next prediction');g.reconcile({...base,lastCastRequest:2},2200,12.2);assert.equal(g.remaining(2200),0);
  g.start(3,2300);g.reconcile({...base,motionEpoch:1,lastCastRequest:3},2400,12.4);assert.equal(g.remaining(2400),0);
});
test('cast and instant abilities share a monotonic request sequence',()=>{
  const c=new CastPresentation();const instant=++c.sequence;assert.equal(instant,1);const cast=c.start('lance',SKILLS.lance,0,++c.sequence);assert.equal(cast.requestId,2);assert.equal(c.sequence,2);c.cancel();assert.equal(c.start('lance',SKILLS.lance,100).requestId,3);
});

test('cancelled cast sweeps stay cleared through late acknowledgements without erasing the next ability',()=>{
  const g=new GlobalCooldownPresentation(),base={motionEpoch:0,hp:100,lastCastRequest:0,globalCooldown:null};g.reconcile(base,0,10);g.start(1,0);g.cancelCast(1);assert.equal(g.remaining(100),0);
  const old={...base,lastCastRequest:1,globalCooldown:{requestId:1,startedAt:10.1,endsAt:11.6}};g.reconcile(old,200,10.2);assert.equal(g.remaining(200),0);
  g.start(2,250);g.reconcile(old,300,10.3);assert.equal(g.current.requestId,2);assert.ok(g.remaining(300)>1);
  g.reconcile({...base,lastCastRequest:2,globalCooldown:{requestId:2,startedAt:10.3,endsAt:11.8}},400,10.4);g.cancelCast(1);assert.equal(g.current.requestId,2);assert.ok(g.remaining(400)>1);
});
