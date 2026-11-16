import test from 'node:test';
import assert from 'node:assert/strict';
import {QUIET_POOL,QUIET_POOL_SHORE} from '../shared/zone-layout.js';
import {heightAt,STREAM_LEVEL,waterBounds,poolRadius} from '../shared/terrain.js';
import {QUESTS,NPCS,walkable} from '../shared/content.js';
import {ROUTES} from '../shared/world-layouts.js';
import {ATLAS_MAPS,projectAtlasLocation} from '../shared/atlas.js';
import {World} from '../server/world.js';
test('the quiet pool objective sits on a dry walkable bank beside actual shallow water and a connected path',()=>{
 const q=QUESTS.find(q=>q.id==='creek');assert.deepEqual(q.location,QUIET_POOL_SHORE);assert.ok(walkable(q.location.x,q.location.z));assert.ok(heightAt(q.location.x,q.location.z)>STREAM_LEVEL);
 const depth=STREAM_LEVEL-heightAt(QUIET_POOL.x,QUIET_POOL.z);assert.ok(depth>.3&&depth<.8,`shallow pool depth: ${depth}`);assert.ok(poolRadius(q.location.x,q.location.z)<1.1);assert.ok(ROUTES.some(r=>Math.hypot(r.at(-1)[0]-q.location.x,r.at(-1)[1]-q.location.z)<.1));
 const rowan=NPCS.find(n=>n.id==='rowan');assert.ok(QUIET_POOL.x<rowan.x&&QUIET_POOL.z<rowan.z,'pool remains northwest of Rowan');
 const banks=waterBounds(QUIET_POOL.z);assert.ok(banks[0]<QUIET_POOL.x-7&&banks[1]>QUIET_POOL.x+7);
});
test('pool water and atlas position agree with the quest, and exploration credits only when the player reaches its bank',()=>{
 const q=QUESTS.find(q=>q.id==='creek'),point=projectAtlasLocation('cinderwood',QUIET_POOL),lake=ATLAS_MAPS.cinderwood.lakes[0];assert.equal(lake.x,point.x);assert.equal(lake.y,point.y);
 const w=new World(),p=w.addPlayer('Visitor');p.quests.creek={status:'active',progress:0,gathered:[]};w.step(.05);assert.equal(p.quests.creek.progress,0);Object.assign(p,QUIET_POOL_SHORE);w.step(.05);assert.equal(p.quests.creek.progress,1);assert.equal(p.quests.creek.status,'active');
});
