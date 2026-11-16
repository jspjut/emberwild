import {CONTINENT_BOUNDS,withinContinent} from './continent.js';
import {primaryZoneAt} from './zone-regions.js';
import {CAPITAL_BOUNDS} from './capital.js';
// Distances are metres. Ratios describe land area, not a linear stretch.
export const LAYOUT_REVISION=4, INTRO_SCALE=Math.SQRT2;
export const SPAWN={x:0,z:32};
export const introPoint=(x,z)=>({x:x*INTRO_SCALE,z:SPAWN.z+(z-SPAWN.z)*INTRO_SCALE});
export const introOriginal=(x,z)=>({x:x/INTRO_SCALE,z:SPAWN.z+(z-SPAWN.z)/INTRO_SCALE});
export const introPath=path=>path.map(([x,z])=>{const p=introPoint(x,z);return [p.x,p.z];});
export const QUIET_POOL={...introPoint(-49,-19),radiusX:10,radiusZ:9};
export const QUIET_POOL_SHORE={x:QUIET_POOL.x+9.5,z:QUIET_POOL.z+1};
export const INTRO_BOUNDS={minX:-80*INTRO_SCALE,maxX:80*INTRO_SCALE,minZ:introPoint(0,-72).z,maxZ:introPoint(0,44).z};
export const DISTRICT_WIDTH=INTRO_BOUNDS.maxX-INTRO_BOUNDS.minX,DISTRICT_DEPTH=INTRO_BOUNDS.maxZ-INTRO_BOUNDS.minZ;
export const INTRO_AREA=DISTRICT_WIDTH*DISTRICT_DEPTH,REGIONAL_AREA=INTRO_AREA*8;
export const ZONE_BOUNDS={minX:-DISTRICT_WIDTH*1.5,maxX:DISTRICT_WIDTH*1.5,minZ:INTRO_BOUNDS.minZ,maxZ:INTRO_BOUNDS.minZ+DISTRICT_DEPTH*3};
export const WORLD_RADIUS=400;
export const TOWN={x:0,z:132,name:'Willowcross'};
export const HUB_PLACEMENTS={
 human:{x:202,z:88,name:'Wayfarer’s Watch',siteX:272,siteZ:92,level:6},
 brinefolk:{x:259,z:-22,name:'Tideglass Station',siteX:293,siteZ:-77,level:7},
 sylvren:{x:-184,z:-12,name:'Rootsong Embassy',siteX:-272,siteZ:-54,level:7},
 cairnkin:{x:-246,z:143,name:'Stonepromise Lodge',siteX:-302,siteZ:212,level:8},
 emberkin:{x:-117,z:285,name:'Ashen Hearth',siteX:-207,siteZ:318,level:9},
 reedwatch:{x:195,z:289,name:'Reedwatch Camp',siteX:288,siteZ:316,level:9}
};
export const ZONE_EXITS=[
 {id:'capital-road',name:'Alderhaven Road',neighbor:'Alderhaven',available:true,kind:'Capital city',x:ZONE_BOUNDS.maxX-3,z:142,direction:'east',next:true,description:'The human capital is open along this road: districts, inns, a bank and the Assembly of the Open Hand.'},
 {id:'coast-road',name:'The Saltwind Cut',neighbor:'The Brinecoast',kind:'Future zone',x:ZONE_BOUNDS.maxX-3,z:-24,direction:'east',description:'A coastal road beyond the surveyed woods.'},
 {id:'highland-road',name:'Stonegate Pass',neighbor:'The Frostfell',kind:'Future zone',x:ZONE_BOUNDS.minX+3,z:144,direction:'west',description:'An opening between the western highlands.'},
 {id:'southern-road',name:'The Emberway',neighbor:'The Ashen March',kind:'Future zone',x:-229,z:ZONE_BOUNDS.maxZ-3,direction:'south',description:'A broad southern road reserved for the next frontier.'},
 {id:'marsh-road',name:'Reedwater Crossing',neighbor:'The Lowwater Fens',kind:'Future zone',x:232,z:ZONE_BOUNDS.maxZ-3,direction:'south',description:'The wetland trail continues beyond the chart.'}
];
// The Reach meets Alderhaven through the arrival pass. Rock shoulders mark
// the eastern edge as clearly as its existing north/west/south ridgelines.
export const REACH_DIVIDE_POSTS=Array.from({length:Math.ceil((ZONE_BOUNDS.maxZ-ZONE_BOUNDS.minZ)/12)+1},(_,i)=>({id:`reach-divide:${i}`,x:ZONE_BOUNDS.maxX+14,z:ZONE_BOUNDS.minZ+i*12,height:22+Math.sin(i*1.7)*5})).filter(p=>!ZONE_EXITS.some(e=>e.direction==='east'&&Math.hypot(p.x-e.x,p.z-e.z)<43));
const inside=(b,x,z,m=0)=>x>b.minX+m&&x<b.maxX-m&&z>b.minZ+m&&z<b.maxZ-m;
export const CONNECTING_ROAD={minX:315,maxX:410,minZ:112,maxZ:180};
export const WORLD_BOUNDS={minX:CONTINENT_BOUNDS.minX,maxX:CONTINENT_BOUNDS.maxX,minZ:CONTINENT_BOUNDS.minZ,maxZ:CONTINENT_BOUNDS.maxZ};
export const zoneAt=primaryZoneAt;
export const withinZone=(x,z,margin=0)=>Number.isFinite(x)&&Number.isFinite(z)&&(inside(ZONE_BOUNDS,x,z,margin)||inside(CONNECTING_ROAD,x,z,margin)||inside(CAPITAL_BOUNDS,x,z,margin)||withinContinent(x,z,margin));
// Relocate legacy saves around the nearest old settlement; structures retain
// their human scale while the wilderness and the roads between them expand.
export function migratePosition(position){
 const x=Number(position.x),z=Number(position.z);if(!Number.isFinite(x)||!Number.isFinite(z))return {...SPAWN};
 if(position.layoutRevision>=3)return {x,z};
 if(position.layoutRevision>=2){
  if(z<INTRO_BOUNDS.maxZ&&x>INTRO_BOUNDS.minX&&x<INTRO_BOUNDS.maxX)return {x,z};
  const old={human:[232,142,283,154],brinefolk:[235,-24,287,-42],sylvren:[-229,-24,-294,-55],cairnkin:[-239,144,-303,169],emberkin:[-229,299,-295,318],reedwatch:[232,299,287,321]};
  const anchors=[{x:0,z:132,to:{x:0,z:132}},{x:-28,z:258,to:{x:-28,z:258}},...Object.entries(old).flatMap(([id,v])=>[{x:v[0],z:v[1],to:HUB_PLACEMENTS[id]},{x:v[2],z:v[3],to:{x:HUB_PLACEMENTS[id].siteX,z:HUB_PLACEMENTS[id].siteZ}}])];
  const a=anchors.sort((a,b)=>Math.hypot(x-a.x,z-a.z)-Math.hypot(x-b.x,z-b.z))[0];return {x:a.to.x+x-a.x,z:a.to.z+z-a.z};
 }
 if(z<48&&Math.abs(x)<85)return introPoint(x,z);
 const old=[['town',0,80],['human-lair',0,112],['sylvren',-65,82],['sylvren-lair',-113,82],['cairnkin',-50,130],['cairnkin-lair',-94,143],['brinefolk',70,80],['brinefolk-lair',114,80],['emberkin',65,140],['emberkin-lair',109,143]];
 const [id,ox,oz]=old.sort((a,b)=>Math.hypot(x-a[1],z-a[2])-Math.hypot(x-b[1],z-b[2]))[0];
 if(id==='town')return {x:TOWN.x+(x-ox)*2,z:TOWN.z+(z-oz)*2};
 const [hub,lair]=id.split('-'),p=HUB_PLACEMENTS[hub];return {x:(lair?p.siteX:p.x)+x-ox,z:(lair?p.siteZ:p.z)+z-oz};
}

export const EXIT_POSTS=ZONE_EXITS.filter(e=>!e.available).flatMap(e=>[-1,1].map(side=>({id:`exit-post:${e.id}:${side}`,x:e.x+(e.direction==='south'?side*4.5:0),z:e.z+(e.direction==='south'?0:side*4.5)})));
