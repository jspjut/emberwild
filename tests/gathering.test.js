import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {GATHERABLES} from '../shared/content.js';
import {GATHER_CAST_TIME,gatherAvailable} from '../shared/gathering.js';
import {settleOnSurface} from '../shared/props.js';
const run=(w,t)=>{for(let i=0;i<t-1e-9;i+=.05)w.step(.05);};
function setup(type='cache'){const w=new World(),p=w.addPlayer('Collector'),g=GATHERABLES.find(g=>g.type===type);p.quests.supplies={status:'active',progress:0,gathered:[]};Object.assign(p,{x:g.x,z:g.z+2});delete p.y;settleOnSurface(p);return {w,p,g};}
test('ground pickups take one second, grant nothing early, do not trigger GCD, and duplicate requests cannot double collect',()=>{
 const {w,p,g}=setup();assert.equal(GATHER_CAST_TIME,1);w.command(p,{type:'interact',id:g.id,requestId:1});assert.equal(p.casting.kind,'gather');assert.equal(p.globalCooldown,null);assert.equal(p.quests.supplies.progress,0);run(w,.8);assert.equal(p.quests.supplies.progress,0);assert.ok(p.casting);run(w,.25);assert.equal(p.quests.supplies.progress,1);assert.equal(p.casting,null);assert.equal(gatherAvailable(p,g),false);w.command(p,{type:'interact',id:g.id,requestId:1});run(w,1.1);assert.equal(p.quests.supplies.progress,1);
});
test('movement, jumping, damage, and explicit cancellation abort pickups without granting rewards',()=>{
 for(const action of [{type:'input',x:1,z:0},{type:'jump'},{type:'cancelCast',requestId:1},'damage']){const {w,p,g}=setup();w.command(p,{type:'interact',id:g.id,requestId:1});assert.ok(p.casting);if(action==='damage')w.hurt(p,1,'test');else w.command(p,action);assert.equal(p.casting,null);run(w,1.1);assert.equal(p.quests.supplies.progress,0);}
});
test('pickup completion revalidates range, active quests and available bag space; cooldown starts only on success',()=>{
 for(const change of [p=>{p.x=0;p.z=32;},p=>{delete p.quests.supplies;}]){const {w,p,g}=setup();w.command(p,{type:'interact',id:g.id,requestId:1});change(p);run(w,1.1);assert.ok(!p.quests.supplies||p.quests.supplies.progress===0);}
 const {w,p,g}=setup('herb');w.command(p,{type:'interact',id:g.id,requestId:1});assert.equal(p.inventory.sunmint,undefined);assert.equal(p.harvestReady[g.id],undefined);p.inventory.resin=99*30;run(w,1.1);assert.equal(p.inventory.sunmint,undefined);assert.equal(p.harvestReady[g.id],undefined);delete p.inventory.resin;w.command(p,{type:'interact',id:g.id,requestId:2});run(w,1.1);assert.equal(p.inventory.sunmint,1);assert.ok(p.harvestReady[g.id]>w.time);
});
test('moving or airborne characters cannot start gathering; cancelling gathering cannot erase an existing GCD',()=>{
 for(const airborne of [false,true]){const {w,p,g}=setup();if(airborne)p.grounded=false;else w.command(p,{type:'input',x:1,z:0});w.command(p,{type:'interact',id:g.id,requestId:1});assert.equal(p.casting,null);}
 const {w,p,g}=setup();p.globalCooldown={requestId:0,startedAt:w.time,endsAt:w.time+1.5};w.interact(p,g.id);assert.ok(p.casting);w.cancelCast(p);assert.ok(p.globalCooldown);assert.equal(p.quests.supplies.progress,0);
});
test('saved harvest cooldowns expire on the server while client hover uses the snapshot remaining time',()=>{
 const {w,p,g}=setup('herb');p.harvestReady[g.id]=w.time+5;const next=new World(),restored=next.addPlayer(p.name,w.save(p));assert.equal(gatherAvailable(restored,g,next.time),false);next.time=6;assert.equal(gatherAvailable(restored,g,next.time),true);assert.equal(gatherAvailable({hp:120,harvestCooldowns:{[g.id]:5}},g),false);assert.equal(gatherAvailable({hp:120,harvestCooldowns:{}},g),true);
});
