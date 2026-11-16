import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../server/world.js';
import {CAPITAL_BUILDINGS,CAPITAL_DISTRICTS,CAPITAL_NPCS,CAPITAL_WAYPOINTS,CAPITAL_WALL_POSTS} from '../shared/capital.js';
import {capitalTopics} from '../shared/capital-story.js';
import {WORLD_CONTENT_SLOTS,validateWorldAllocation} from '../shared/world-plan.js';
import {ATLAS_MAPS,projectAtlasLocation,atlasHit} from '../shared/atlas.js';
import {LAYOUT_REVISION,HUB_PLACEMENTS,migratePosition,zoneAt,ZONE_BOUNDS} from '../shared/zone-layout.js';
import {NPCS,QUESTS,questAvailable} from '../shared/content.js';
import {advanceMotion} from '../shared/movement.js';
import {settleOnSurface,lineOfSight,bodyFits,supportBelow} from '../shared/props.js';
import {ARROW_BOARD} from '../shared/sign-geometry.js';
import {emoteReply} from '../server/npc-dialogue.js';
const at=(p,n)=>{Object.assign(p,{x:n.x,z:n.z,input:{x:0,z:0},latestMove:{x:0,z:0}});delete p.y;settleOnSurface(p);};
const run=(w,t)=>{for(let i=0;i<t;i+=.05)w.step(.05);};
test('world allocation includes 37 leveling zones, five race capitals and ten distinct level-100 frontiers',()=>{
 assert.equal(WORLD_CONTENT_SLOTS.filter(s=>s.kind==='leveling').length,37);assert.equal(WORLD_CONTENT_SLOTS.filter(s=>s.kind==='capital').length,5);assert.equal(WORLD_CONTENT_SLOTS.filter(s=>s.kind==='max-level').length,10);assert.equal(WORLD_CONTENT_SLOTS.filter(s=>s.mapId).length,52);assert.equal(validateWorldAllocation(ATLAS_MAPS),true);
 for(let level=1;level<=100;level++)assert.ok(WORLD_CONTENT_SLOTS.some(s=>s.kind==='leveling'&&s.minLevel<=level&&s.maxLevel>=level));for(const s of WORLD_CONTENT_SLOTS.filter(s=>!s.mapId))assert.ok(!s.placement&&!s.name);
 const p={x:837,z:34,mapId:'alderhaven'},local=projectAtlasLocation('alderhaven',p);assert.ok(local.x>0&&local.x<1000);assert.equal(projectAtlasLocation('cinderwood',p),null);assert.ok(projectAtlasLocation('dawnlands',p));assert.equal(atlasHit('dawnlands',...ATLAS_MAPS.alderhaven.outline.reduce((p,v)=>[p[0]+v[0]/ATLAS_MAPS.alderhaven.outline.length,p[1]+v[1]/ATLAS_MAPS.alderhaven.outline.length],[0,0])).id,'alderhaven');
});
test('Alderhaven is a large connected capital with eight districts, entered halls, city service points and unique principals',()=>{
 assert.equal(CAPITAL_DISTRICTS.length,8);assert.ok(CAPITAL_BUILDINGS.length>=40);assert.ok(CAPITAL_BUILDINGS.some(b=>b.width>=70&&b.wallHeight>=16));assert.equal(CAPITAL_NPCS.filter(n=>n.featured).length,5);assert.equal(CAPITAL_WAYPOINTS.length,3);assert.ok(CAPITAL_WALL_POSTS.length>500);
 for(const n of CAPITAL_NPCS){assert.equal(bodyFits(n.x,n.z,supportBelow(n.x,n.z).y),true,n.id);if(n.featured){assert.ok(n.equipment.armor&&n.equipment.shoulders&&n.appearance.hairStyle);assert.ok(capitalTopics(n,{quests:{}}).length);}}
 assert.ok(!QUESTS.some(q=>NPCS.find(n=>n.id===q.giver)?.mapId==='alderhaven'),'capital has no quest population yet');
});
test('the connecting road crosses the actual shared boundary in both directions without teleporting',()=>{
 const p={x:ZONE_BOUNDS.maxX-9,z:142};settleOnSurface(p);const start=p.x;for(let i=0;i<750;i++)advanceMotion(p,{x:1,z:0});assert.ok(p.x>405,`gate reached ${p.x}`);assert.equal(zoneAt(p.x,p.z),'alderhaven');for(let i=0;i<750;i++)advanceMotion(p,{x:-1,z:0});assert.ok(Math.abs(p.x-start)<1e-6);assert.equal(zoneAt(p.x,p.z),'cinderwood');
});
test('revision-two saves follow their moved camp or interior once, while northern landmarks stay fixed',()=>{
 const o=HUB_PLACEMENTS.emberkin,p=migratePosition({x:-230,z:299,layoutRevision:2});assert.deepEqual(p,{x:o.x-1,z:o.z});const w=new World(),s=w.addPlayer('Returning',{id:'stable',x:-295,z:330,layoutRevision:2,xp:500,inventory:{potion:7},quests:{welcome:{status:'complete',progress:1,gathered:[]}}});assert.ok(Math.abs(s.x-(o.siteX))<.01);assert.ok(Math.abs(s.z-(o.siteZ+12))<.01);assert.equal(s.inventory.potion,7);const saved=w.save(s),restored=new World().addPlayer(s.name,saved);assert.equal(saved.layoutRevision,LAYOUT_REVISION);assert.equal(restored.x,s.x);assert.equal(restored.z,s.z);assert.deepEqual(migratePosition({x:0,z:32,layoutRevision:2}),{x:0,z:32});
});
test('capital lore conversations validate proximity, sight, topic ownership and progression without rewarding repeated visits',()=>{
 const w=new World(),p=w.addPlayer('Visitor'),n=w.npcs.find(n=>n.id==='alder-speaker'),before={xp:p.xp,gold:p.gold,items:{...p.inventory}};
 w.command(p,{type:'npcTopic',npc:n.id,topic:'office'});assert.ok(!w.events.some(e=>e.type==='reading'));at(p,{x:n.x,z:n.z+2});w.events=[];w.command(p,{type:'npcTopic',npc:n.id,topic:'reach'});assert.ok(!w.events.some(e=>e.type==='reading'));w.command(p,{type:'npcTopic',npc:n.id,topic:'letter'});assert.ok(!w.events.some(e=>e.type==='reading'));
 w.command(p,{type:'npcTopic',npc:n.id,topic:'office'});assert.match(w.events.find(e=>e.type==='reading').pages[0].text,/assembly/i);assert.ok(w.events.some(e=>e.type==='social'&&e.source===n.id&&e.speech));assert.equal(w.events.find(e=>e.type==='reading').to,p.id);
 run(w,1.2);p.quests.five_roads={status:'complete',progress:1,gathered:[]};w.events=[];w.command(p,{type:'npcTopic',npc:n.id,topic:'reach'});assert.match(w.events.find(e=>e.type==='reading').pages[0].text,/Visitor/);assert.deepEqual({xp:p.xp,gold:p.gold,items:p.inventory},before);assert.notEqual(emoteReply(n,p,'bow').speech,emoteReply(w.npcs.find(n=>n.id==='tavi'),p,'bow').speech);
 at(p,{x:837,z:-80});assert.equal(lineOfSight(p,n),false);w.events=[];w.command(p,{type:'npcTopic',npc:n.id,topic:'office'});assert.ok(!w.events.some(e=>e.type==='reading'));
});
test('all three city hearths bind voluntarily, return across zones and retain cooldown and persistence; the bank conserves items',()=>{
 for(const point of CAPITAL_WAYPOINTS){const w=new World(),p=w.addPlayer('Hearth'),n=w.npcs.find(n=>n.id===point.npcId);at(p,n);w.command(p,{type:'interact',id:n.id});assert.equal(p.waypointId,'hearthstead');w.command(p,{type:'waypoint',npcId:n.id});assert.equal(p.waypointId,point.id);at(p,{x:0,z:32});w.command(p,{type:'skill',skill:'recall',requestId:1});run(w,8.1);assert.equal(p.x,point.x);assert.equal(p.z,point.z);assert.equal(p.mapId,'alderhaven');assert.ok(p.cooldowns.recall-w.time>899);assert.equal(new World().addPlayer(p.name,w.save(p)).waypointId,point.id);}
 const w=new World(),p=w.addPlayer('Depositor'),n=NPCS.find(n=>n.id==='alder-banker');p.inventory.resin=12;at(p,n);w.command(p,{type:'interact',id:n.id});assert.ok(w.snapshot(p).self.bank);w.command(p,{type:'bank',action:'deposit',item:'resin',count:12});assert.equal(p.bank.resin,12);assert.equal(p.inventory.resin,undefined);w.command(p,{type:'bank',action:'withdraw',item:'resin',count:4});assert.equal(p.bank.resin,8);assert.equal(p.inventory.resin,4);
});
test('arrow boards are one contiguous polygon with a joined triangular head and a consistent destination axis',()=>{
 const points=ARROW_BOARD.outline;assert.deepEqual(points[4],[0,1.45]);assert.equal(points[2][1],points[3][1]);assert.equal(points[5][1],points[6][1]);let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=a[0]*b[1]-a[1]*b[0];}assert.ok(area>0&&ARROW_BOARD.thickness>0);
});
