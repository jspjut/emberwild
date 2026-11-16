import {CAPITAL_ROADS,CAPITAL_PROPS} from './capital.js';
import {QUIET_POOL_SHORE,WORLD_RADIUS,HUB_PLACEMENTS,TOWN,ZONE_EXITS,introPath,introPoint} from './zone-layout.js';
export {WORLD_RADIUS} from './zone-layout.js';
export const ROOM_LAYOUTS={
  hut:{name:'Delegation hut',rooms:[{x:0,z:0,width:9,depth:8,doors:['north']}]},
  hall:{name:'Town hall',rooms:[{x:0,z:0,width:14,depth:11,doors:['south','north']}]},
  storehouse:{name:'Storehouse chambers',rooms:[{x:0,z:0,width:12,depth:10,doors:['north','south']},{x:0,z:12,width:16,depth:14,doors:['north']}]},
  gallery:{name:'Dogleg cavern',rooms:[{x:0,z:0,width:10,depth:10,doors:['west','east','south']},{x:0,z:10,width:10,depth:10,doors:['north','east']},{x:13,z:10,width:16,depth:16,doors:['west']}]},
  shrine:{name:'Three-chamber vault',rooms:[{x:0,z:0,width:12,depth:10,doors:['west','east']},{x:12,z:0,width:12,depth:10,doors:['west','south']},{x:12,z:12,width:18,depth:14,doors:['north']}]}
};
const LEGACY_OUTPOSTS=[
  {raceId:'human',id:'human',name:'Willowcross',x:0,z:80,siteX:0,siteZ:112,layout:'storehouse',bossX:0,bossZ:124,level:7,region:'cinderwood',boss:'lockwarden',foe:'roadbandit',representative:'mara',title:'The common road',lore:'Humans build crossroads rather than walls between peoples. A promise made in Willowcross binds host and traveler alike.'},
  {raceId:'sylvren',id:'sylvren',name:'Rootsong Embassy',x:-65,z:82,siteX:-113,siteZ:82,layout:'gallery',bossX:-100,bossZ:92,level:7,region:'cinderwood',boss:'rootmatron',foe:'rootprowler',representative:'liri',title:'Memory in the roots',lore:'Sylvren keep memories in living groves. They harvest only what can regrow and regard listening as the first act of friendship.'},
  {raceId:'cairnkin',id:'cairnkin',name:'Stonepromise Lodge',x:-50,z:130,siteX:-94,siteZ:143,layout:'shrine',bossX:-82,bossZ:155,level:8,region:'frostfell',boss:'quarryheart',foe:'quarrymite',representative:'dorr',title:'A promise in stone',lore:'Cairnkin carve records of shared work and promises. Their stones are records, not relics to be taken without asking.'},
  {raceId:'brinefolk',id:'brinefolk',name:'Tideglass Station',x:70,z:80,siteX:114,siteZ:80,layout:'gallery',bossX:127,bossZ:90,level:9,region:'brinecoast',boss:'tideclaw',foe:'shorecrab',representative:'nemi',title:'Those who return',lore:'Brinefolk crews count a voyage complete only when every traveler returns. Tide charts and rescue knots are treasured communal knowledge.'},
  {raceId:'emberkin',id:'emberkin',name:'Ashen Hearth',x:65,z:140,siteX:109,siteZ:143,layout:'shrine',bossX:121,bossZ:155,level:10,region:'emberwastes',boss:'kilnkeeper',foe:'ashconstruct',representative:'ves',title:'What survives the fire',lore:'Emberkin keep stories in kiln-fired tokens. Their hearth traditions honor rebuilding, restraint and the lives saved after a disaster.'}
];

const reed={raceId:'brinefolk',id:'reedwatch',layout:'gallery',boss:'fenkeeper',foe:'reedstalker',representative:'pella',region:'gloamfen',title:'A promise to the wetlands',lore:'Reedwatch is a shared survey camp. Its human and Brinefolk keepers protect the marsh as a living water reserve for Willowcross and the capital.'};
export const OUTPOSTS=['human','brinefolk','sylvren','cairnkin','emberkin','reedwatch'].map(id=>{
 const base=id==='reedwatch'?reed:LEGACY_OUTPOSTS.find(o=>o.id===id),placement=HUB_PLACEMENTS[id],offset=base.layout==='storehouse'?[0,12]:base.layout==='gallery'?[13,10]:[12,12];
 return {...base,...placement,bossX:placement.siteX+offset[0],bossZ:placement.siteZ+offset[1]};
});
export const INTRO_ROUTES=[[[0,38],[0,18]],[[0,23],[-26,12]],[[-26,12],[-27,-6],[-30,-13]],[[-30,-13],[-43,-7]],[[0,23],[30,18],[49,18]],[[30,18],[29,3]],[[29,3],[30,-14]],[[30,18],[49,18],[56,10],[61,2],[65,-8]],[[0,18],[3,-30]],[[3,-30],[18,-39]],[[3,-30],[-8,-49],[-8,-55],[-15,-55]]].map(introPath);
// Broad bends follow the creek, upland shoulders and wetland rim; no hub lattice.
const FIELD_ROUTES=[
 [[0,49],[4,66],[18,85],[14,103],[0,116],[0,132],[5,160],[0,185],[8,210],[0,238],[0,265]],
 [[0,116],[42,113],[84,122],[125,105],[163,88],[202,80]],
 [[202,80],[230,67],[249,43],[258,12],[269,-4],[279,-22],[278,-38],[259,-38],[259,-30]],
 [[0,105],[-34,87],[-80,74],[-122,45],[-147,13],[-172,-16],[-184,-20]],
 [[0,152],[-41,155],[-97,150],[-149,154],[-191,143],[-226,135],[-246,135]],
 [[0,220],[-36,229],[-65,252],[-90,273],[-117,277]],
 [[0,220],[39,229],[79,251],[113,280],[153,295],[195,281]],
 [[0,120],[-38,120],[-38,132]],[[0,151],[38,151],[38,159]],
 [[0,165],[-38,165],[-38,173]],[[0,185],[25,185],[25,193]],
 [[0,245],[-28,245],[-28,252]],
 [[202,80],[228,81],[252,78],[272,86]],
 [[259,-30],[270,-46],[274,-63],[277,-77],[285,-77]],
 [[-184,-20],[-219,-18],[-247,-25],[-288,-27],[-288,-54],[-280,-54]],
 [[-246,135],[-273,147],[-318,174],[-319,212],[-310,212]],
 [[-117,277],[-155,284],[-190,298],[-223,298],[-223,318],[-215,318]],
 [[195,281],[233,290],[263,300],[272,316],[280,316]],
 [[202,80],[219,78],[245,109],[285,142],[ZONE_EXITS[0].x,142]],
 [[279,-38],[299,-26],[315,-12],[ZONE_EXITS[1].x,ZONE_EXITS[1].z]],
 [[-246,135],[-270,139],[-300,144],[ZONE_EXITS[2].x,ZONE_EXITS[2].z]],
 [[-117,293],[-146,319],[-188,347],[ZONE_EXITS[3].x,ZONE_EXITS[3].z]],
 [[195,297],[213,325],[232,350],[ZONE_EXITS[4].x,ZONE_EXITS[4].z]]
];
export const ROUTES=[...INTRO_ROUTES,[[introPoint(-43,-7).x,introPoint(-43,-7).z],[QUIET_POOL_SHORE.x+2,QUIET_POOL_SHORE.z+9],[QUIET_POOL_SHORE.x,QUIET_POOL_SHORE.z]],...FIELD_ROUTES,...CAPITAL_ROADS];
export function placeLayout(id,layoutId,x,z,{cave=false,name=id,...extra}={}){
  const layout=ROOM_LAYOUTS[layoutId];if(!layout)throw Error(`Unknown layout: ${layoutId}`);
  return layout.rooms.map((room,i)=>({id:`${id}:${i}`,siteId:id,layoutId,name:i?`${name} · inner chamber`:name,subtitle:cave?'A sheltered passage through the stone':'A place along the shared road',x:x+room.x,z:z+room.z,r:Math.hypot(room.width,room.depth)/2,width:room.width,depth:room.depth,wallHeight:cave?7:6.2,doorSide:room.doors[0],doors:room.doors,doorWidth:4.8,doorHeight:5,roofRise:cave?1.1:1.8,cave,roomIndex:i,furniture:[],...extra}));
}

export const EXPANSION_BUILDINGS=[
 ...placeLayout('council','hall',25,199,{name:'Willowcross Hall',width:20,depth:14,r:12}),
 ...placeLayout('town-inn','hall',-38,138,{name:'The Crossroads Hearth',width:18,depth:18,r:13,furniture:[{id:'long-table',type:'table',x:5.5,z:1,width:4,depth:1.5,height:1.15},{id:'bed-west',type:'bed',x:-6,z:4,width:1.6,depth:2.4,height:.8},{id:'bed-east',type:'bed',x:6,z:5,width:1.6,depth:2.4,height:.8}]}),
 ...placeLayout('town-smith','hut',37,124,{name:'Four Winds Smithy'}),
 ...placeLayout('town-study','hut',-38,178,{name:'The Open Folio',width:12,depth:10,r:8}),
 ...placeLayout('town-market','hut',38,164,{name:'Willowcross Provisions',width:12,depth:10,r:8}),
 ...[[-65,172],[-63,199],[66,183],[65,140],[-28,258],[35,242]].flatMap(([x,z],i)=>placeLayout(`town-home-${i}`,'hut',x,z,{name:i===4?'Southfield Farm':i===5?'Roadkeepers’ Lodge':`Willowcross home ${i+1}`})),
 ...OUTPOSTS.flatMap(o=>placeLayout(`outpost-${o.id}`,'hut',o.x,o.z,{name:o.name,raceId:o.raceId})),
 ...OUTPOSTS.flatMap(o=>placeLayout(`lair-${o.id}`,o.layout,o.siteX,o.siteZ,{name:({human:'The Locked Storehouse',sylvren:'Rootmemory Hollow',cairnkin:'The Resonant Vault',brinefolk:'Tideglass Grotto',emberkin:'The Quiet Kiln',reedwatch:'Reedwater Burrow'})[o.id],cave:o.id!=='human',raceId:o.raceId}))
];
const lantern=introPoint(68,-5),bench=introPoint(68,-9),stone=introPoint(65,-13);
export const EXPANSION_PROP_PLACEMENTS=[
 {id:'wayside_lantern',...lantern,region:'cinderwood'},{id:'bench',...bench,region:'cinderwood'},{id:'runestone',...stone,region:'cinderwood',scale:.6},
 ...OUTPOSTS.flatMap(o=>[{id:'wayside_lantern',x:o.x-6,z:o.z-11,region:o.region},{id:'runestone',x:o.siteX-7,z:o.siteZ-7,region:o.region,scale:.8},{id:'bench',x:o.x-6,z:o.z+5,region:o.region},{id:'crate_stack',x:o.x+6,z:o.z+5,region:o.region},{id:o.id==='sylvren'?'broadleaf_tree':o.id==='brinefolk'||o.id==='reedwatch'?'willow_tree':o.id==='cairnkin'?'pine_tree':'dead_tree',x:o.x-11,z:o.z+10,region:o.region}]),
 {id:'well',x:-12,z:137,region:'cinderwood'},
 ...[[-16,143],[16,143],[-16,155],[16,155]].map(([x,z],i)=>({id:'market_stall',x,z,region:i%2?'brinecoast':'cinderwood'})),
 {id:'handcart',x:12,z:102,region:'sunsteppe'},
 ...[[-20,111],[20,111],[-20,186],[20,186],[-32,248],[36,288]].map(([x,z])=>({id:'wayside_lantern',x,z,region:'cinderwood'})),
 {id:'well',x:-35,z:265,region:'cinderwood'},
 ...ZONE_EXITS.filter(e=>!e.available).map(e=>({id:'wayside_lantern',x:e.x+(e.direction==='east'?-4:e.direction==='west'?4:5),z:e.z+(e.direction==='south'?-4:5),region:'cinderwood'}))
];

EXPANSION_PROP_PLACEMENTS.push(...CAPITAL_PROPS,
 ...[[310,122],[344,116],[371,176],[405,173]].map(([x,z])=>({id:'broadleaf_tree',x,z,region:'cinderwood',scale:.95})),
 {id:'wayside_lantern',x:331,z:160,region:'cinderwood'},{id:'handcart',x:359,z:168,region:'cinderwood'},{id:'runestone',x:316,z:130,region:'cinderwood',scale:.65});

export const ORCHARD_HARVESTS=[[-36,277],[-12,284],[16,270]].map(([x,z],i)=>({id:`orchard-${i}`,type:'orchard',name:'Orchard harvest',x,z}));
