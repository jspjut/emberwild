import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {regionAt,interestAt,interestedIn,ARRIVAL_REGION} from '../shared/zone-regions.js';
import {ZoneIndex} from '../server/zone-index.js';
import {LAYOUT_REVISION} from '../shared/zone-layout.js';
const add=(w,name,x,z=145)=>w.addPlayer(name,{x,z,layoutRevision:LAYOUT_REVISION});
const ids=list=>list.map(v=>v.id).sort();
test('transition ownership is unique, both core zones receive it, and an overlap observer subscribes to one nearer core',()=>{
 const a={x:100,z:32},b={x:620,z:145},abA={x:350,z:147},abB={x:385,z:143};
 assert.equal(regionAt(abA.x,abA.z),ARRIVAL_REGION.id);assert.equal(regionAt(abB.x,abB.z),ARRIVAL_REGION.id);
 assert.deepEqual(interestAt(350,147).regions,['cinderwood',ARRIVAL_REGION.id]);assert.deepEqual(interestAt(385,143).regions,['alderhaven',ARRIVAL_REGION.id]);
 for(const p of [a,b,abA,abB])for(const q of [abA,abB])assert.equal(interestedIn(p,q),true);
 assert.equal(interestedIn(a,b),false);assert.equal(interestedIn(b,a),false);assert.equal(interestedIn(abA,b),false);assert.equal(interestedIn(abB,a),false);
});
test('snapshots contain only subscribed actors, deduplicate the overlap, preserve IDs during crossing and share a prepared frame',()=>{
 const w=new World(),a=add(w,'Reach',100,32),b=add(w,'City',620),left=add(w,'West',350,147),right=add(w,'East',385,143),frame=w.prepareSnapshots();
 assert.deepEqual(ids(w.snapshot(a,frame).players),ids([a,left,right]));assert.deepEqual(ids(w.snapshot(b,frame).players),ids([b,left,right]));assert.deepEqual(ids(w.snapshot(left,frame).players),ids([a,left,right]));assert.deepEqual(ids(w.snapshot(right,frame).players),ids([b,left,right]));
 assert.ok(w.snapshot(a,frame).npcs.some(n=>n.id==='elowen'));assert.ok(!w.snapshot(a,frame).npcs.some(n=>n.id==='alder-speaker'));assert.ok(w.snapshot(b,frame).npcs.some(n=>n.id==='alder-speaker'));assert.ok(!w.snapshot(b,frame).enemies.some(e=>e.type==='warden'));
 for(let x=285;x<=445;x+=5){left.x=x;const f=w.prepareSnapshots();for(const observer of[a,b]){const matches=w.snapshot(observer,f).players.filter(p=>p.id===left.id);assert.equal(matches.length,1,`actor ${x} remains in both views`);}}
 const counts=w.zones.counts();assert.equal(Object.values(counts).reduce((n,r)=>n+r.players,0),4);assert.equal(Object.values(counts).reduce((n,r)=>n+r.npcs,0),w.npcs.length);
});
test('any actors that switch subscription at the midpoint are beyond visible character range',()=>{
 for(const side of[-1,1]){const p={x:365+side*.01,z:145};for(let x=100;x<700;x+=5)for(let z=0;z<250;z+=5){const source={x,z},other={...p,x:365-side*.01};if(interestedIn(p,source)!==interestedIn(other,source))assert.ok(Math.hypot(p.x-x,p.z-z)>75);}}
});
test('world events follow their captured region rather than broadcasting, and unscoped events fail closed',()=>{
 const w=new World(),a=add(w,'Reach',100,32),b=add(w,'City',620),left=add(w,'Overlap',350,147);w.events=[];
 w.effect('level',b.id,b.id,1);const event=w.events.at(-1);assert.deepEqual(ids(w.zones.recipients(event,w.players)),[b.id].sort());
 w.effect('wave',left.id,left.id,0);assert.deepEqual(ids(w.zones.recipients(w.events.at(-1),w.players)),ids([a,b,left]));left.x=620;assert.deepEqual(ids(w.zones.recipients(w.events.at(-1),w.players)),ids([a,b,left]));
 assert.deepEqual(w.zones.recipients({type:'unknown'},w.players),[]);
});
test('party status crosses zones without leaking world coordinates or remote actors into local snapshots',()=>{
 const w=new World(),a=add(w,'Reach',100,32),b=add(w,'City',620);w.partyAction(a,{action:'invite',id:b.id});w.partyAction(b,{action:'accept'});const state=w.snapshot(a);assert.ok(!state.players.some(p=>p.id===b.id));const remote=state.party.units.find(p=>p.id===b.id);assert.equal(remote.name,b.name);assert.ok(remote.hp>0);assert.equal(remote.x,undefined);assert.equal(remote.inventory,undefined);
});
test('general remains zone-specific, local speech crosses the arrival boundary and party remains private across zones',()=>{
 const w=new World(),a=add(w,'West',363,147),b=add(w,'East',368,147),far=add(w,'City',620);w.events=[];w.chat.handle(a,{text:'/say Hello across the road'});assert.deepEqual(w.events.find(e=>e.type==='chat').recipients.sort(),[a.id,b.id].sort());w.time+=2;w.events=[];w.chat.handle(a,{text:'/1 Only the Reach'});assert.deepEqual(w.events.find(e=>e.type==='chat').recipients,[a.id]);
 w.partyAction(a,{action:'invite',id:far.id});w.partyAction(far,{action:'accept'});w.time+=2;w.events=[];w.chat.handle(a,{text:'/p Far away'});assert.deepEqual(w.events.find(e=>e.type==='chat').recipients.sort(),[a.id,far.id].sort());
});
test('zone buckets remove departed actors and bounded world payload excludes unrelated-zone NPCs and monsters',()=>{
 const w=new World(),a=add(w,'Reach',0,32),b=add(w,'City',620);const frame=w.prepareSnapshots(),state=w.snapshot(b,frame);assert.ok(state.enemies.length<w.enemies.length/4);assert.ok(state.npcs.length<w.npcs.length);w.removePlayer(b.id);w.prepareSnapshots();assert.equal(w.zones.regions.get('alderhaven').players.has(b.id),false);
});
