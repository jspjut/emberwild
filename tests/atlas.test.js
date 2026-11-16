import {ZONE_BOUNDS} from '../shared/zone-layout.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {ATLAS_MAPS,ATLAS_SIZE,STARTING_MAP,atlasMap,atlasTrail,atlasChildren,atlasHit,containsPoint,projectAtlasLocation} from '../shared/atlas.js';
import {NPCS,GATHERABLES,ENEMY_SPAWNS,LANDMARKS} from '../shared/content.js';

test('atlas forms a world/region/zone tree with charted hit regions and safe root/leaf boundaries',()=>{
  assert.deepEqual(atlasTrail(STARTING_MAP).map(m=>m.kind),['World','Region','Zone']);
  assert.equal(atlasMap('emberwild').parent,null);assert.equal(atlasChildren(STARTING_MAP).length,0);
  for(const map of Object.values(ATLAS_MAPS).filter(m=>m.charted)){
    assert.equal(atlasTrail(map.id).length,new Set(atlasTrail(map.id).map(m=>m.id)).size);
    assert.ok(map.survey.length>=3);if(!map.parent)continue;
    assert.ok(ATLAS_MAPS[map.parent]);const r=map.placement;
    assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<=ATLAS_SIZE.width&&r.y+r.height<=ATLAS_SIZE.height);
    assert.equal(atlasHit(map.parent,...map.outline.reduce((p,v)=>[p[0]+v[0]/map.outline.length,p[1]+v[1]/map.outline.length],[0,0]))?.id,map.id);
  }
  assert.equal(atlasHit('emberwild',995,5),null);assert.equal(atlasHit(STARTING_MAP,500,400),null);assert.equal(atlasMap('missing').id,STARTING_MAP);
});
test('live positions use a zone chart transform and compose through ancestors without inventing positions on sibling maps',()=>{
  const player={x:0,z:32},local=projectAtlasLocation('cinderwood',player);
  const bounds=ATLAS_MAPS.cinderwood.bounds;
  assert.deepEqual(projectAtlasLocation('cinderwood',{x:(bounds.minX+bounds.maxX)/2,z:(bounds.minZ+bounds.maxZ)/2,mapId:'cinderwood'}),{x:500,y:360});
  assert.ok(containsPoint(ATLAS_MAPS.cinderwood.survey,local.x,local.y));
  const r=ATLAS_MAPS.cinderwood.placement,regional=projectAtlasLocation('dawnlands',player);
  assert.ok(Math.abs(regional.x-(r.x+local.x/1000*r.width))<1e-8);assert.ok(Math.abs(regional.y-(r.y+local.y/720*r.height))<1e-8);
  const {bounds:b,frame:f}=ATLAS_MAPS.emberwild.geographicProjection;assert.deepEqual(projectAtlasLocation('emberwild',player),{x:f.x+(player.x-b.minX)/(b.maxX-b.minX)*f.width,y:f.y+(player.z-b.minZ)/(b.maxZ-b.minZ)*f.height});
  assert.equal(projectAtlasLocation('dawnlands',{x:NaN,z:0}),null);
  assert.equal(projectAtlasLocation('cinderwood',player,'not-added'),null);
  for(const p of [...NPCS,...GATHERABLES,...ENEMY_SPAWNS,...LANDMARKS]){
    const id=p.mapId||'cinderwood',v=projectAtlasLocation(id,p);assert.ok(containsPoint(ATLAS_MAPS[id].survey,v.x,v.y),`Current content outside inked survey: ${p.id||p.name||p.type} at ${p.x},${p.z}`);
  }
});
test('a future zone can be registered as uncharted, then inked and opened without changing navigation or projection code',()=>{
  const future={id:'future-test',name:'Future zone',kind:'Zone',parent:'future-survey',charted:false,placement:{x:700,y:200,width:150,height:160},outline:[[700,200],[850,200],[850,360],[700,360]],bounds:{minX:0,maxX:100,minZ:0,maxZ:100}};
  ATLAS_MAPS['future-survey']={...ATLAS_MAPS.dawnlands,id:'future-survey',geographicProjection:undefined};
  ATLAS_MAPS[future.id]=future;
  try{
    assert.equal(atlasHit('future-survey',775,280),null);assert.equal(atlasMap(future.id).id,STARTING_MAP);
    assert.equal(projectAtlasLocation('future-survey',{x:50,z:50},future.id),null);
    future.charted=true;
    assert.equal(atlasHit('future-survey',775,280).id,future.id);
    assert.deepEqual(atlasTrail(future.id).map(m=>m.id),['emberwild','future-survey','future-test']);
    assert.deepEqual(projectAtlasLocation('future-survey',{x:50,z:50},future.id),{x:775,y:280});
    assert.equal(projectAtlasLocation('cinderwood',{x:50,z:50},future.id),null);
  }finally{delete ATLAS_MAPS[future.id];delete ATLAS_MAPS['future-survey'];}
});

test('five top-level regions each contain at most ten zones and one separate capital chart',()=>{
 const regions=atlasChildren('emberwild');assert.equal(regions.length,5);
 assert.deepEqual(regions.map(r=>r.id),['dawnlands','greenward','crownspine','lantern-marches','saltwind']);
 const all=new Set();for(const region of regions){const children=atlasChildren(region.id),zones=children.filter(m=>m.kind==='Zone'),cities=children.filter(m=>m.kind==='City'||m.kind==='Capital city');assert.ok(zones.length>=9&&zones.length<=10);assert.equal(cities.length,1);assert.equal(region.subtitle,'');assert.ok(region.labels.every(l=>l.text.length<=32));for(const child of children){assert.ok(!all.has(child.id));all.add(child.id);}}
 assert.equal(all.size,52);assert.equal(ATLAS_MAPS.sylvarin.parent,'greenward');assert.equal(ATLAS_MAPS.stormcrown.parent,'saltwind');
});

test('polygon regions cover real mainland positions without empty gaps and project markers geographically',async()=>{
 const {CONTINENT_SITES,CONTINENT_BY_ID,distanceToCoast}=await import('../shared/continent.js'),{atlasRegionFor}=await import('../shared/atlas-regions.js'),{withinZone,zoneAt}=await import('../shared/zone-layout.js');let sampled=0;
 for(let x=1250;x<15400;x+=650)for(let z=-12500;z<12900;z+=650){if(!withinZone(x,z)||distanceToCoast(x,z)<40)continue;const id=zoneAt(x,z),p=projectAtlasLocation('emberwild',{x,z,mapId:id});assert.equal(atlasHit('emberwild',p.x,p.y)?.id,atlasRegionFor(CONTINENT_BY_ID[id]),`${x},${z}`);sampled++;}
 assert.ok(sampled>300);for(const site of CONTINENT_SITES)assert.ok(withinZone(site.x,site.z),site.id);
});
