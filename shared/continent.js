import {mainlandContains,distanceToCoast,isContinental} from './continent-coast.js';
export {distanceToCoast,CONTINENT_OUTLINE,isContinental} from './continent-coast.js';
// Static continent source. No encounters, rewards, quest givers or NPCs are
// implied by these geographic level bands. North is -z; distances are metres.
export const CONTINENT_BOUNDS={minX:-1800,maxX:15500,minZ:-12800,maxZ:13100};
export const ROUTE_NAMES=['The Greenward Road','The Crownspine Road','The Lantern Road','The Saltwind Road'];
// Every row is an authored identity, not a palette-only copy of its neighbor.
const routes=[
 [
 ['hazelwash','Hazelwash Downs','cinderwood','orchard',18,'Terraced orchards, low hedges and a three-armed cider press'],
 ['fernveil','Fernveil Wood','rainforest','canopy',38,'Dense fern valleys and a broken canopy observatory'],
 ['mirrorbough','Mirrorbough Lakes','brinecoast','lakes',22,'Still blue basins separated by pale wooded causeways'],
 ['cedarstairs','The Cedar Stairs','rainforest','terraces',66,'Wide forest terraces climbing past a ring of cedar pillars'],
 ['amberstep','Amberstep Prairie','sunsteppe','grassland',34,'Wind-bent grass ridges and an open stone sundial'],
 ['orchidrift','Orchidrift Basin','orchid','basin',48,'Lilac vegetation around a sunken geological bowl'],
 ['moonroot','Moonroot Wilds','gloamfen','roots',72,'Huge exposed root buttresses and low luminous groves'],
 ['silverwold','Silverwold Heights','frostfell','needles',110,'Silver trunks beneath narrow ice-cut granite spires'],
 ['elderwake','Elderwake Forest','rainforest','canopy',96,'Old-growth ridges around the empty crown of an elder tree']
 ],
 [
 ['redgranite','Redgranite Foothills','redrock','ridges',44,'Rust-red outcrops and a disused stone survey ring'],
 ['slatewater','Slatewater Gorge','frostfell','canyon',72,'A long slate cleft crossed by broad natural stone shelves'],
 ['bellstone','Bellstone Uplands','sunsteppe','mesas',84,'Flat-topped hills crowned by hollow bell-shaped monoliths'],
 ['frostlace','Frostlace Tundra','frostfell','snow',62,'Snow hummocks, blue meltwater and an empty survey enclosure'],
 ['glassback','Glassback Range','crystal','crystals',130,'Faceted peaks and a crystalline saddle observatory'],
 ['cloudrest','Cloudrest Escarpment','frostfell','terraces',160,'Broad cloud-facing shelves and a high wind colonnade'],
 ['ironchoir','Ironchoir Deeps','redrock','canyon',118,'Iron-dark cuts with resonant standing stone ranks'],
 ['starfall','Starfall Tablelands','astral','craters',135,'Impact bowls, silver rubble and a roofless astronomical court'],
 ['skybreak','Skybreak Crown','frostfell','needles',210,'Snow needles circling a climbable high summit approach']
 ],
 [
 ['ochretrail','Ochretrail Fields','sunsteppe','grassland',22,'Golden fields and an abandoned wayhouse courtyard'],
 ['coppermesa','Coppermesa','redrock','mesas',68,'Copper-colored shelves divided by low open gullies'],
 ['cinderbloom','Cinderbloom Heath','emberwastes','ash',48,'Ash-fed red flowers around cooled kiln arches'],
 ['saffronreach','Saffron Reach','desert','dunes',58,'Warm dune swells and a half-buried circular caravan court'],
 ['basaltveil','Basaltveil','emberwastes','columns',95,'Black column clusters marking a long extinct lava flow'],
 ['sunkenkilns','The Sunken Kilns','emberwastes','craters',78,'Low calderas with exposed ceramic rings and empty kilns'],
 ['umbralstep','Umbral Step','gloamfen','ridges',102,'Violet heath ridges, dark tors and a split watch arch'],
 ['pyreglass','Pyreglass March','crystal','crystals',126,'Smoky glass seams through red and charcoal hills'],
 ['dawnscar','Dawnscar Barrens','emberwastes','canyon',172,'Long cooled fissures and a broken dawn-facing amphitheatre']
 ],
 [
 ['saltmeadow','Saltmeadow Strand','brinecoast','coast',12,'Salt grass, pale sand and an empty net-drying court'],
 ['reedmosaic','Reedmosaic Delta','gloamfen','wetlands',16,'Braided reed pools linked by raised dry banks'],
 ['pearlshoal','Pearlshoal Coast','coral','coast',26,'Coral-colored rock shelves and pearly tidal basins'],
 ['rainharbor','Rainharbor Weald','rainforest','lakes',42,'Rain-dark woodland and empty terraced harbor foundations'],
 ['mangrovefold','Mangrovefold','gloamfen','roots',32,'Exposed mangrove roots above still green channels'],
 ['thunderstrand','Thunderstrand','storm','ridges',64,'Storm-dark coastal bluffs and a ruined lightning ring'],
 ['tidehollow','Tidehollow Basin','brinecoast','basin',48,'A salt basin surrounded by stepped white shoreline'],
 ['opalreach','Opalreach Fens','coral','wetlands',54,'Opal stones and pale reed islands in lavender water'],
 ['tempestcape','Tempest Cape','storm','columns',112,'Sea pillars and a wind-cut cape with an empty signal court']
 ]
];
export const LEVELING_ZONES=routes.flatMap((rows,route)=>rows.map(([id,name,biome,form,relief,identity],band)=>{
 const angle=(band<2?[-1.86,-.62,.62,1.86]:[-1.02,-.34,.34,1.02])[route]+Math.sin(band*1.7+route)*.035,radius=band<2?1750+band*1180:1650+band*1180;
 const x=Math.round(1100+Math.cos(angle)*radius),z=Math.round(145+Math.sin(angle)*radius);
 return {id,name,kind:'leveling',route,band,minLevel:11+band*10,maxLevel:20+band*10,biome,form,relief,identity,x,z,seed:101+route*97+band*31,bounds:{minX:x-530,maxX:x+530,minZ:z-530,maxZ:z+530}};
}));
export const NEW_CAPITALS=[
 {id:'sylvarin',name:'Sylvarin, the Listening Crown',raceId:'sylvren',route:0,band:2,biome:'rainforest',form:'canopy',relief:28,architecture:'living-bough',identity:'Radial garden wards, living-wood halls and a vast open crown pavilion'},
 {id:'karndur',name:'Karndur, the Witness Steps',raceId:'cairnkin',route:1,band:4,biome:'frostfell',form:'terraces',relief:45,architecture:'stepped-stone',identity:'Three civic terraces, low broad vaults and a monumental stone witness hall'},
 {id:'nereides',name:'Nereides, the Returning Harbor',raceId:'brinefolk',route:3,band:6,biome:'coral',form:'coast',relief:16,architecture:'tidal-shell',identity:'Crescent harbor wards, shell-domed halls and an open rescue quay'},
 {id:'veshkar',name:'Veshkar, the Patient Flame',raceId:'emberkin',route:2,band:8,biome:'emberwastes',form:'columns',relief:32,architecture:'kiln-vault',identity:'Concentric kiln courts, bronze-banded halls and a sheltered rebuilding forum'}
].map((c,i)=>{const host=LEVELING_ZONES.find(z=>z.route===c.route&&z.band===c.band),offset=[[1000,600],[400,1150],[1000,-600],[400,-1150]][i],x=host.x+offset[0],z=host.z+offset[1];return {...c,kind:'capital',x,z,seed:700+i,bounds:{minX:x-470,maxX:x+470,minZ:z-440,maxZ:z+440}};});
const frontiers=[
 ['hushcanopy','The Hush Canopy','sylvren','rainforest','canopy',190,'A ring of immense hollow tree buttresses around an open, silent crown'],
 ['palespore','Palespore Dream','sylvren','orchid','fungal',90,'Overlapping pale fungal shelves, lavender fog and a sunken spore amphitheatre'],
 ['worldanvil','The World Anvil','cairnkin','redrock','columns',240,'Basalt organ pipes around a huge terraced impact forge'],
 ['stillwinter','Stillwinter Expanse','cairnkin','frostfell','glacier',175,'Blue ice shelves, broad crevasses and a hollow ice cathedral'],
 ['abyssalstep','The Abyssal Steps','brinefolk','abyss','terraces',160,'Deep-teal terraced sea bowls and huge ribbed reef arches'],
 ['prismtide','Prismtide Labyrinth','brinefolk','coral','crystals',118,'Prismatic tidal stone teeth arranged around a pearl-bright inner lagoon'],
 ['lastcaldera','The Last Caldera','emberkin','emberwastes','caldera',235,'An enormous cooled volcanic bowl, ember vents and a black central plug'],
 ['ashclock','Ashclock Waste','emberkin','desert','dunes',146,'Concentric ash dunes, half-buried clock pillars and copper-lit desert glass'],
 ['brokenorrery','The Broken Orrery','human','astral','craters',210,'A field of nested impact basins beneath a monumental broken astronomical ring'],
 ['stormcrown','Stormcrown Meridian','human','storm','needles',255,'Wind-cut needle ranks, rain-dark stone and a split meridian beacon']
];
export const FRONTIER_ZONES=frontiers.map(([id,name,inspiration,biome,form,relief,identity],i)=>{
 const angle=-1.12+i/9*2.24,radius=12400,x=Math.round(1100+Math.cos(angle)*radius),z=Math.round(145+Math.sin(angle)*radius);
 return {id,name,inspiration,biome,form,relief,identity,kind:'max-level',minLevel:100,maxLevel:100,x,z,seed:1001+i*53,bounds:{minX:x-700,maxX:x+700,minZ:z-700,maxZ:z+700}};
});
export const CONTINENT_ZONES=[...LEVELING_ZONES,...NEW_CAPITALS,...FRONTIER_ZONES];
export const CONTINENT_BY_ID=Object.fromEntries(CONTINENT_ZONES.map(z=>[z.id,z]));
const edge=(a,b,kind='road')=>({id:[a.id,b.id].sort().join('--'),a:a.id,b:b.id,kind,points:[[a.x,a.z],[Math.round((a.x+b.x)/2+Math.sin(a.seed+b.seed)*65),Math.round((a.z+b.z)/2)],[b.x,b.z]]});
const gate={id:'alderhaven',x:1200,z:9,seed:0};
export const CONTINENT_ROADS=[{id:'alderhaven-east-approach',a:'alderhaven',b:'alderhaven',kind:'road',points:[[1090,9],[1200,9]]}];
for(let route=0;route<4;route++){
 const chain=LEVELING_ZONES.filter(z=>z.route===route);const departure=edge(gate,chain[0]);if(route===0||route===3)departure.points=[[gate.x,gate.z],[1420,route===0?-650:900],[chain[0].x,chain[0].z]];CONTINENT_ROADS.push(departure);
 for(let i=1;i<chain.length;i++)CONTINENT_ROADS.push(edge(chain[i-1],chain[i]));
}
for(let band=0;band<9;band++)for(let route=0;route<3;route++)CONTINENT_ROADS.push(edge(LEVELING_ZONES.find(z=>z.route===route&&z.band===band),LEVELING_ZONES.find(z=>z.route===route+1&&z.band===band),'crossroad'));
for(const c of NEW_CAPITALS)CONTINENT_ROADS.push(edge(LEVELING_ZONES.find(z=>z.route===c.route&&z.band===c.band),c));
for(const f of FRONTIER_ZONES){const nearest=LEVELING_ZONES.filter(z=>z.band===8).sort((a,b)=>Math.hypot(a.x-f.x,a.z-f.z)-Math.hypot(b.x-f.x,b.z-f.z))[0];CONTINENT_ROADS.push(edge(nearest,f));}
for(let i=1;i<FRONTIER_ZONES.length;i++)CONTINENT_ROADS.push(edge(FRONTIER_ZONES[i-1],FRONTIER_ZONES[i],'frontier-road'));
// Shared survey distortion bends province edges through the landscape while
// leaving hub positions and the authored coast fixed. Both ownership and maps
// use it, so the atlas does not invent decorative borders over different zones.
export function surveyWarp(x,z){const fade=Math.min(1,Math.max(0,distanceToCoast(x,z)/500))*Math.min(1,Math.max(0,Math.hypot(x-800,z-145)/600));return {x:x+fade*100*Math.sin(z/650)*Math.cos(x/1400),z:z+fade*(140*Math.sin(x/700)+55*Math.sin(z/1100))};}
export function worldFromSurvey(x,z){let p={x,z};for(let i=0;i<12;i++){const warped=surveyWarp(p.x,p.z);p={x:x-(warped.x-p.x),z:z-(warped.z-p.z)};}return [p.x,p.z];}
export const provinceWeight=zone=>zone.kind==='capital'?160000:0;
export function continentAt(x,z){if(!isContinental(x,z))return null;const p=surveyWarp(x,z);let best=null,distance=Infinity;for(const zone of CONTINENT_ZONES){const d=(p.x-zone.x)**2+(p.z-zone.z)**2-provinceWeight(zone);if(d<distance){distance=d;best=zone;}}return best;}

const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function rawContinentHeight(x,z,zone=continentAt(x,z)){
 if(!zone)return 0;const u=(x-zone.x)/130,v=(z-zone.z)/130,s=zone.seed*.17,r=Math.hypot(u,v),wave=Math.sin(u*.7+s)*Math.cos(v*.6-s),ridge=Math.sin(u*.8+v*.45+s);
 let shape=.4+wave*.24;
 switch(zone.form){
 case 'terraces':shape=.25+((wave+1)*3|0)/9+smooth(((wave+1)*3)%1)/9;break;
 case 'canyon':shape=.68-Math.exp(-(((u+Math.sin(v)*.7)/.65)**2))*.6;break;
 case 'mesas':shape=.15+smooth((wave-.15)*4)*.65;break;
 case 'needles':shape=.12+Math.pow(Math.abs(ridge*Math.sin(v+s)),3)*.8;break;
 case 'columns':shape=.2+Math.abs(Math.sin(u*1.1+s)*Math.sin(v*1.1))*.5;break;
 case 'craters':shape=.65-Math.exp(-(((r-2.2)/1.1)**2))*.4;break;
 case 'caldera':shape=.2+Math.exp(-(((r-2.5)/.65)**2))*.7;break;
 case 'basin':case 'lakes':shape=.12+smooth(r/5)*.45;break;
 case 'coast':case 'wetlands':shape=.08+Math.abs(wave)*.12;break;
 case 'glacier':shape=.28+Math.abs(ridge)*.38;break;
 case 'roots':shape=.25+Math.abs(ridge)*.3;break;
 case 'dunes':shape=.25+(Math.sin(u*.9+Math.sin(v*.2))*.5+.5)*.35;break;
 }
 return 4+zone.relief*shape;
}
// Blend nearby terrain recipes continuously across geographic boundaries.
const fieldCache=new Map(),FIELD=12;
function fieldHeight(x,z){const key=`${x}:${z}`;if(fieldCache.has(key))return fieldCache.get(key);let total=0,y=0,nearest=null,best=Infinity;for(const zone of CONTINENT_ZONES){const d=Math.hypot(x-zone.x,z-zone.z);if(d<best){nearest=zone;best=d;}if(d>=5000)continue;const weight=Math.pow(1-d/5000,4)/Math.pow(Math.max(60,d),4);total+=weight;y+=weight*rawContinentHeight(x,z,zone);}const result=total?y/total:rawContinentHeight(x,z,nearest);if(fieldCache.size>24000)fieldCache.clear();fieldCache.set(key,result);return result;}
export function continentHeight(x,z){const ax=Math.floor(x/FIELD)*FIELD,az=Math.floor(z/FIELD)*FIELD,tx=(x-ax)/FIELD,tz=(z-az)/FIELD;return (fieldHeight(ax,az)*(1-tx)+fieldHeight(ax+FIELD,az)*tx)*(1-tz)+(fieldHeight(ax,az+FIELD)*(1-tx)+fieldHeight(ax+FIELD,az+FIELD)*tx)*tz;}
export function withinContinent(x,z,margin=0){return mainlandContains(x,z)&&(margin<=0||distanceToCoast(x,z)>=margin);}
export const CONTINENT_HUBS=CONTINENT_ZONES.map(zone=>({id:`${zone.id}-crossing`,mapId:zone.id,name:zone.kind==='capital'?zone.name:`${zone.name} · Survey crossing`,x:zone.x,z:zone.z,zone}));
const roadDistance=(x,z)=>{let best=Infinity;for(const road of CONTINENT_ROADS)for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)||0));best=Math.min(best,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return best;};
export const CONTINENT_SITES=CONTINENT_ZONES.filter(zone=>zone.kind!=='capital').flatMap(zone=>{
 const selected=[],prefix=zone.name.replace(/^The /,'').split(' ')[0],signature={canopy:'Crown Grove',orchard:'Old Press',lakes:'Stillwater',terraces:'High Steps',grassland:'Sundial',basin:'Sunken Court',roots:'Root Hall',needles:'Wind Spires',ridges:'Standing Stones',canyon:'Deep Cut',mesas:'Bell Rocks',snow:'Blueice Bowl',crystals:'Glass Garden',craters:'Sky Circle',ash:'Cooled Kilns',dunes:'Buried Dial',columns:'Stone Organ',coast:'Tide Court',wetlands:'Reed Pools',fungal:'Spore Ring',glacier:'Ice Cathedral',caldera:'Black Heart'};
 for(const [suffix,name,kind]of [['landmark',`${prefix} ${signature[zone.form]||'Survey Ring'}`,zone.form],['grounds',`${prefix} Outer Grounds`,'grounds'],['ruins',`${prefix} Fallen Court`,'ruins']]){
  const candidates=[];for(const radius of [260,370,470])for(let i=0;i<12;i++){const a=i*Math.PI/6+.15,x=zone.x+Math.cos(a)*radius,z=zone.z+Math.sin(a)*radius;if(continentAt(x,z)?.id!==zone.id||selected.some(s=>Math.hypot(x-s.x,z-s.z)<150))continue;candidates.push({x,z,distance:roadDistance(x,z)});}
  candidates.sort((a,b)=>b.distance-a.distance);const choice=candidates[0];if(!choice||choice.distance<85)throw Error(`No clear objective site for ${zone.id}`);
  selected.push({id:`${zone.id}-${suffix}`,mapId:zone.id,name,x:Math.round(choice.x),z:Math.round(choice.z),zone,kind});
 }
 return selected;
});
