import test from 'node:test';
import assert from 'node:assert/strict';
import {atlasQuestIndicators,hitAtlasQuest,questsByZone} from '../client/atlas-quests.js';
test('parent charts count every active quest per zone, including ready quests, and navigate one level at a time',()=>{
 const p={quests:{meadow:{status:'active',progress:6,gathered:[]},herbs:{status:'active',progress:0,gathered:[]},welcome:{status:'complete',progress:1,gathered:[]}}};
 assert.equal(questsByZone(p).get('cinderwood').length,2);assert.equal(atlasQuestIndicators('cinderwood',p).length,0);
 for(const [map,navigate]of [['dawnlands','cinderwood'],['emberwild','dawnlands']]){const indicators=atlasQuestIndicators(map,p);assert.equal(indicators.length,1);assert.equal(indicators[0].count,2);assert.equal(indicators[0].navigate,navigate);assert.ok(Number.isFinite(indicators[0].x));}
 delete p.quests.herbs;assert.equal(atlasQuestIndicators('dawnlands',p)[0].count,1);delete p.quests.meadow;assert.equal(atlasQuestIndicators('dawnlands',p).length,0);
});
test('atlas hits use elliptical objective areas, combine overlapping quests, prioritize numbered pins and reuse minimap tooltips',()=>{
 const a={id:'a',title:'Herbs',number:1,objective:'Gather sprigs',progress:1,count:3},b={id:'b',title:'Seeds',number:2,objective:'Recover seeds',progress:2,count:5};
 const regions=[a,b].map(q=>({kind:'questArea',x:50,y:50,rx:20,ry:10,quests:[q]}));
 let hit=hitAtlasQuest(regions,55,52);assert.deepEqual(hit.quests,['a','b']);assert.match(hit.detail,/Herbs\nGather sprigs · 1\/3/);assert.match(hit.detail,/Seeds\nRecover seeds · 2\/5/);assert.equal(hitAtlasQuest(regions,50,62),null);
 hit=hitAtlasQuest([...regions,{kind:'quest',x:50,y:50,rx:7,ry:7,quests:[b]}],50,50);assert.deepEqual(hit.quests,['b']);assert.equal(hit.title,'Seeds');assert.match(hit.detail,/Click to track/);
});
