import {QUEST_HUBS,WORLD_SITES,HUB_ROADS} from './continent-settlements.js';
import {assetRegion} from './asset-library.js';
import {divideSurface} from './province-boundaries.js';
import {NEW_CAPITALS,CONTINENT_ROADS,continentHeight} from './continent.js';
const styles={
 'living-bough':{wallColor:'#a6b68b',roofColor:'#416c58',roofStyle:'crown',wardNames:['Listening Court','Seedkeepers’ Walk','Rain Archive','Open Canopy','Bough Market','Guest Gardens']},
 'stepped-stone':{wallColor:'#9ba9b1',roofColor:'#65788d',roofStyle:'flat',wardNames:['Witness Stair','Common Quarry','Carvers’ Exchange','Snow Archive','Great Vault','Oath Court']},
 'tidal-shell':{wallColor:'#d4cdb4',roofColor:'#5a9b9a',roofStyle:'dome',wardNames:['Returning Quay','Pearl Exchange','Tide Archive','Rescue Crescent','Shell Gardens','Mooring Court']},
 'kiln-vault':{wallColor:'#927767',roofColor:'#624843',roofStyle:'vault',wardNames:['Patient Forum','Rebuilders’ Court','Kiln Exchange','Cooling Gardens','Ash Archive','Open Hearth']}
};
export const CONTINENT_WARDS=NEW_CAPITALS.flatMap(c=>styles[c.architecture].wardNames.map((name,i)=>{
 const a=i*Math.PI/3,x=c.x+Math.sin(a)*220,z=c.z+Math.cos(a)*200;return {id:`${c.id}-ward-${i}`,mapId:c.id,name,x,z,radius:95};
}));
// A shared smooth foundation field keeps streets and neighboring buildings
// on compatible grades. Cache the coarse samples; hundreds of hub paths must
// not re-evaluate every biome recipe for each pavement subdivision at startup.
const foundationSamples=new Map(),foundationRaw=new Map(),FOUNDATION_GRID=100;
function foundationSample(x,z){const key=`${x}:${z}`;if(foundationSamples.has(key))return foundationSamples.get(key);let sum=0;for(const dx of [-200,-100,0,100,200])for(const dz of [-200,-100,0,100,200]){const rawKey=`${x+dx}:${z+dz}`;if(!foundationRaw.has(rawKey))foundationRaw.set(rawKey,continentHeight(x+dx,z+dz));sum+=foundationRaw.get(rawKey);}const y=sum/25;foundationSamples.set(key,y);return y;}
const settlementHeight=(x,z)=>{const ax=Math.floor(x/FOUNDATION_GRID)*FOUNDATION_GRID,az=Math.floor(z/FOUNDATION_GRID)*FOUNDATION_GRID,tx=(x-ax)/FOUNDATION_GRID,tz=(z-az)/FOUNDATION_GRID;return (foundationSample(ax,az)*(1-tx)+foundationSample(ax+FOUNDATION_GRID,az)*tx)*(1-tz)+(foundationSample(ax,az+FOUNDATION_GRID)*(1-tx)+foundationSample(ax+FOUNDATION_GRID,az+FOUNDATION_GRID)*tx)*tz;};
export const CONTINENT_BUILDINGS=[];
const add=(zone,id,name,x,z,width,depth,extra={})=>{
 const palette=assetRegion(zone.biome),style=styles[zone.architecture]||{wallColor:palette.stone,roofColor:palette.cloth,roofStyle:['redrock','desert','emberwastes'].includes(zone.biome)?'flat':zone.biome==='coral'?'dome':'gable'};
 CONTINENT_BUILDINGS.push({id:`continent-${zone.id}-${id}`,siteId:`continent-${zone.id}-${id}`,name,mapId:zone.id,subtitle:`${zone.name} · unoccupied architecture`,x,z,width,depth,r:Math.hypot(width,depth)/2,wallHeight:9,doorSide:'south',doorWidth:5,doorHeight:6,roofRise:5,furniture:[],capital:zone.kind==='capital',continent:true,...style,...extra,floorY:extra.floorY??settlementHeight(x,z)});
};
for(const c of NEW_CAPITALS){
 add(c,'civic',`${c.name.split(',')[0]} · Civic hall`,c.x,c.z-90,74,68,{wallHeight:c.raceId==='cairnkin'?20:16,doorWidth:12,doorHeight:12,roofRise:12,landmark:'continental-civic'});
 for(const [i,ward]of CONTINENT_WARDS.filter(w=>w.mapId===c.id).entries()){
  add(c,`ward-${i}`,ward.name,ward.x,ward.z-28,42,42,{doorWidth:8,wallHeight:11+i%3,landmark:i===0?'continental-sanctum':undefined});
  // Homes and workshops face clear radial lanes and have enterable ground floors.
  for(let j=0;j<4;j++){const side=j%2?-1:1,dx=side*(45+Math.floor(j/2)*37),dz=32+Math.floor(j/2)*31;
   add(c,`ward-${i}-home-${j}`,`${ward.name} · ${j%2?'Workshop':'House'}`,ward.x+dx,ward.z+dz,22+j%2*3,24,{wallHeight:7+j%3,roofRise:3+j%2,doorWidth:4,furniture:[{id:'work-table',type:'table',x:-5,z:-4,width:3,depth:2,height:1.1}]});
  }
 }
 // Distinct gate halls on either side of an open approach, never a blocking wall.
 for(const side of [-1,1])add(c,`gate-${side}`,`${c.name.split(',')[0]} · Gate lodge`,c.x+side*42,c.z+335,28,30,{wallHeight:13,roofRise:9});
}
for(const h of QUEST_HUBS){
 const furnishings=[{id:'table',type:'table',x:5,z:-5,width:4,depth:2,height:1.1}];
 for(const [i,[dx,dz]]of [[-38,-30],[38,-30],[-38,34],[38,34]].entries()){
  const inn=h.inn&&i===0,role=inn?'Inn':['Meeting Hall','Workshop','Storehouse','Lodge'][i];
  add(h.zone,`${h.id}-${i}`,`${h.name} · ${role}`,h.x+dx,h.z+dz,inn?27:22,inn?26:20,{hubId:h.id,inn,floorY:settlementHeight(h.x,h.z),wallHeight:inn?8:6+i%2,doorWidth:5,roofRise:inn?5:3,furniture:inn?[...furnishings,...[-8,8].map((x,j)=>({id:`bed-${j}`,type:'bed',x,z:4,width:2,depth:3,height:.8}))]:furnishings});
 }
}
// Existing city wards already provide six civic hubs. Give three of them inns.
for(const city of NEW_CAPITALS)for(const i of [0,2,4]){const b=CONTINENT_BUILDINGS.find(b=>b.id===`continent-${city.id}-ward-${i}-home-0`);b.inn=true;b.name=CONTINENT_WARDS.find(w=>w.id===`${city.id}-ward-${i}`).name+' · Inn';b.furniture.push({id:'guest-bed',type:'bed',x:6,z:-4,width:2,depth:3,height:.8});}
export const CONTINENT_INNS=CONTINENT_BUILDINGS.filter(b=>b.inn).map(b=>({id:`${b.id}-hearth`,buildingId:b.id,name:b.name,mapId:b.mapId,x:b.x,z:b.z+b.depth/2+5,available:true,selfService:true}));
// Spatial indexing makes floor pads cheap even as the continent gains buildings.
const cells=new Map(),cell=100;
for(const b of CONTINENT_BUILDINGS)for(let x=Math.floor((b.x-b.width/2-30)/cell);x<=Math.floor((b.x+b.width/2+30)/cell);x++)for(let z=Math.floor((b.z-b.depth/2-30)/cell);z<=Math.floor((b.z+b.depth/2+30)/cell);z++){const key=`${x}:${z}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(b);}
const sitePads=[...WORLD_SITES,...QUEST_HUBS].map(s=>({...s,floorY:s.hubId?settlementHeight(QUEST_HUBS.find(h=>h.id===s.hubId).x,QUEST_HUBS.find(h=>h.id===s.hubId).z):settlementHeight(s.x,s.z)})),padCells=new Map();
for(const s of sitePads)for(let x=Math.floor((s.x-80)/200);x<=Math.floor((s.x+80)/200);x++)for(let z=Math.floor((s.z-80)/200);z<=Math.floor((s.z+80)/200);z++){const key=`${x}:${z}`;if(!padCells.has(key))padCells.set(key,[]);padCells.get(key).push(s);}
export function continentSurface(x,z){let y=divideSurface(x,z,continentHeight(x,z));for(const s of padCells.get(`${Math.floor(x/200)}:${Math.floor(z/200)}`)||[]){const d=Math.hypot(x-s.x,z-s.z);if(d<55)y=s.floorY;else if(d<80){const t=(d-55)/25,blend=1-t*t*(3-2*t);y=y*(1-blend)+s.floorY*blend;}}for(const b of cells.get(`${Math.floor(x/cell)}:${Math.floor(z/cell)}`)||[]){const dx=Math.max(0,Math.abs(x-b.x)-b.width/2-4),dz=Math.max(0,Math.abs(z-b.z)-b.depth/2-4),distance=Math.hypot(dx,dz);if(distance===0)return b.floorY;if(distance<22){const t=distance/22,blend=1-t*t*(3-2*t);y=y*(1-blend)+b.floorY*blend;}}return gradedRoadHeight(x,z,y);}
export const CONTINENT_CITY_ROADS=[...HUB_ROADS,...CONTINENT_BUILDINGS.filter(b=>b.hubId).map(b=>{const h=QUEST_HUBS.find(h=>h.id===b.hubId);return {id:`${b.id}-door`,a:b.mapId,b:b.mapId,points:[[h.x,h.z],[b.x,b.z+b.depth/2+5]]};}),...NEW_CAPITALS.flatMap(c=>{
 const roads=CONTINENT_WARDS.filter(w=>w.mapId===c.id).map(w=>({points:[[c.x,c.z],[w.x,w.z+8]],a:c.id,b:c.id}));
 roads.push({points:[[c.x,c.z+400],[c.x,c.z+210],[c.x,c.z]],a:c.id,b:c.id});
 for(const b of CONTINENT_BUILDINGS.filter(b=>b.mapId===c.id))roads.push({points:[[b.x,b.z+b.depth/2+4],[b.x,b.z+b.depth/2+12]],a:c.id,b:c.id});
 return roads;
})];

// Route streets around actual building footprints. The visibility graph uses
// expanded corners, keeping camera/walking clearance rather than paving walls.
export function routeAroundBuildings(points){
 const result=[points[0]];
 for(let k=1;k<points.length;k++){
  const start=result.at(-1),end=points[k],minX=Math.min(start[0],end[0])-100,maxX=Math.max(start[0],end[0])+100,minZ=Math.min(start[1],end[1])-100,maxZ=Math.max(start[1],end[1])+100;
  const obstacles=CONTINENT_BUILDINGS.filter(b=>b.x+b.width/2>=minX&&b.x-b.width/2<=maxX&&b.z+b.depth/2>=minZ&&b.z-b.depth/2<=maxZ).map(b=>{const near=point=>Math.abs(point[0]-b.x)<b.width/2+7&&Math.abs(point[1]-b.z)<b.depth/2+7,margin=near(start)||near(end)?3:7;return {minX:b.x-b.width/2-margin,maxX:b.x+b.width/2+margin,minZ:b.z-b.depth/2-margin,maxZ:b.z+b.depth/2+margin};});
  const hits=(a,b,r)=>{let lo=0,hi=1;for(const[axis,min,max]of [[0,r.minX,r.maxX],[1,r.minZ,r.maxZ]]){const d=b[axis]-a[axis];if(Math.abs(d)<1e-9){if(a[axis]<=min||a[axis]>=max)return false;}else{const t=(min-a[axis])/d,u=(max-a[axis])/d;lo=Math.max(lo,Math.min(t,u));hi=Math.min(hi,Math.max(t,u));if(lo>=hi)return false;}}return hi>0&&lo<1;};
  const clear=(a,b)=>!obstacles.some(r=>hits(a,b,r));if(clear(start,end)){result.push(end);continue;}
  const nodes=[start,end,...obstacles.flatMap(r=>[[r.minX-.1,r.minZ-.1],[r.maxX+.1,r.minZ-.1],[r.maxX+.1,r.maxZ+.1],[r.minX-.1,r.maxZ+.1]])],dist=nodes.map(()=>Infinity),previous=new Map(),seen=new Set();dist[0]=0;
  for(let n=0;n<nodes.length;n++){let next=-1;for(let i=0;i<nodes.length;i++)if(!seen.has(i)&&(next<0||dist[i]<dist[next]))next=i;if(next<0||!Number.isFinite(dist[next]))break;if(next===1)break;seen.add(next);for(let j=0;j<nodes.length;j++){if(seen.has(j))continue;const cost=dist[next]+Math.hypot(nodes[j][0]-nodes[next][0],nodes[j][1]-nodes[next][1]);if(cost<dist[j]&&clear(nodes[next],nodes[j])){dist[j]=cost;previous.set(j,next);}}}
  if(!Number.isFinite(dist[1]))throw Error(`A continental street has no clear building route: ${JSON.stringify({start,end,inside:CONTINENT_BUILDINGS.filter(b=>[start,end].some(p=>Math.abs(p[0]-b.x)<b.width/2+3&&Math.abs(p[1]-b.z)<b.depth/2+3)).map(b=>b.id)})}`);const segment=[];for(let i=1;i!==0;i=previous.get(i))segment.unshift(nodes[i]);result.push(...segment);
 }return result;
}
for(const road of [...CONTINENT_ROADS,...CONTINENT_CITY_ROADS])road.points=routeAroundBuildings(road.points);

const roadGrades=new Map();
function roadBase(x,z){for(const b of CONTINENT_BUILDINGS)if(Math.abs(x-b.x)<b.width/2+6&&Math.abs(z-b.z)<b.depth/2+6)return b.floorY;let y=settlementHeight(x,z);for(const s of sitePads){const d=Math.hypot(x-s.x,z-s.z),outer=240,inner=s.radius?85:55;if(d<inner)return s.floorY;if(d<outer){const t=(d-inner)/(outer-inner),blend=1-t*t*(3-2*t);y=y*(1-blend)+s.floorY*blend;}}return y;}

for(const road of [...CONTINENT_ROADS,...CONTINENT_CITY_ROADS])for(let i=1;i<road.points.length;i++){
 const a=road.points[i-1],b=road.points[i],count=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/30));let start=[a[0],a[1],roadBase(a[0],a[1])];
 for(let j=1;j<=count;j++){const end=[a[0]+(b[0]-a[0])*j/count,a[1]+(b[1]-a[1])*j/count];end.push(roadBase(...end));const segment=[start,end];for(let x=Math.floor((Math.min(start[0],end[0])-30)/80);x<=Math.floor((Math.max(start[0],end[0])+30)/80);x++)for(let z=Math.floor((Math.min(start[1],end[1])-30)/80);z<=Math.floor((Math.max(start[1],end[1])+30)/80);z++){const key=`${x}:${z}`;if(!roadGrades.has(key))roadGrades.set(key,[]);roadGrades.get(key).push(segment);}start=end;}
}
function gradedRoadHeight(x,z,base){let sum=0,weight=0,strength=0;for(const[a,b]of roadGrades.get(`${Math.floor(x/80)}:${Math.floor(z/80)}`)||[]){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)||0)),d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);if(d>=28)continue;const w=(1-d/28)**2;sum+=(a[2]+(b[2]-a[2])*t)*w;weight+=w;strength=Math.max(strength,d<7?1:Math.max(0,(28-d)/21));}return weight?base*(1-strength)+sum/weight*strength:base;}
