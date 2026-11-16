import {WORLD_SITES as SETTLEMENT_SITES,QUEST_HUBS} from './continent-settlements.js';
import {PROVINCE_BOUNDARIES,nearestProvinceBoundary} from './province-boundaries.js';
import {CONTINENT_ROADS,continentAt,isContinental} from './continent.js';
import {CONTINENT_CITY_ROADS} from './continent-buildings.js';
import {heightAt,visualHeightAt} from './terrain.js';
import {buildingAt} from './buildings.js';
import {assetRegion} from './asset-library.js';
const buckets=new Map(),cache=new Map(),CELL=40;
const edges=[...CONTINENT_ROADS,...CONTINENT_CITY_ROADS].flatMap(r=>r.points.slice(1).map((b,i)=>[r.points[i],b]));
for(const edge of edges){const[a,b]=edge,n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/20);for(let i=0;i<=n;i++){const x=Math.floor((a[0]+(b[0]-a[0])*i/n)/CELL),z=Math.floor((a[1]+(b[1]-a[1])*i/n)/CELL);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const key=`${x+dx}:${z+dz}`;if(!buckets.has(key))buckets.set(key,new Set());buckets.get(key).add(edge);}}}
export function continentRoadDistance(x,z){let best=Infinity;for(const[a,b]of buckets.get(`${Math.floor(x/CELL)}:${Math.floor(z/CELL)}`)||[]){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)||0));best=Math.min(best,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));}return best;}
const random=(x,z)=>{let seed=(Math.imul(x,73856093)^Math.imul(z,19349663))>>>0;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};};
// Dense, continuous divides with deliberate openings wherever a graded road crosses.
const boundaryChunks=new Map();
for(const boundary of PROVINCE_BOUNDARIES)for(let i=1;i<boundary.points.length;i++){
 const a=boundary.points[i-1],b=boundary.points[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/7));
 for(let j=0;j<n;j++){
  const t=j/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  if(!isContinental(x,z)||['channel','crevasse'].includes(boundary.kind)||continentRoadDistance(x,z)<24||buildingAt(x,z,20)||SETTLEMENT_SITES.some(s=>Math.hypot(s.x-x,s.z-z)<85))continue;
  const key=`${Math.floor(x/100)}:${Math.floor(z/100)}`;
  if(!boundaryChunks.has(key))boundaryChunks.set(key,[]);
  boundaryChunks.get(key).push({x,z,kind:boundary.kind,seed:i+j,boundary:boundary.id});
 }
}
export function boundaryScenery(cx,cz){return (boundaryChunks.get(`${cx}:${cz}`)||[]).flatMap((p,i)=>{
 const palette=assetRegion(continentAt(p.x,p.z).biome),wall=p.kind==='wall',roots=p.kind==='roots',ice=p.kind==='ice',ground=heightAt(p.x,p.z),h=wall?15:roots?23:ice?24:12;
 // Embed the foot across the entire footprint, including steep pass shoulders.
 const low=Math.min(ground,...[[-10,0],[10,0],[0,-10],[0,10]].map(([dx,dz])=>heightAt(p.x+dx,p.z+dz)))-(p.kind==='ridge'?30:10),high=ground+h+(wall?0:Math.sin(p.seed*1.7)*4),sy=high-low;
 const core={id:`divide:${cx}:${cz}:${i}`,kind:wall?'column':roots?'trunk':ice?'needle':'rock',color:ice?'#a7bec8':roots?palette.wood:palette.stone,x:p.x,y:(low+high)/2,z:p.z,sx:roots?25:wall?7:14,sy,sz:roots?25:wall?7:14,rotation:0,solid:true,boundary:p.boundary};
 const out=[core];
 if(roots&&p.seed%3===0)out.push({...core,id:core.id+':canopy',kind:'crown',color:palette.leaf,y:high+3,sx:18,sy:10,sz:18,solid:false});
 if(wall&&p.seed%2===0)for(const dx of [-4,4])out.push({...core,id:core.id+`:merlon:${dx}`,kind:'column',pitch:0,x:p.x+dx,y:high+1.2,sx:1.4,sy:2.4,sz:1.4,solid:false});
 return out;
});}

export function continentalScatter(cx,cz){
 const key=`${cx}:${cz}`;if(cache.has(key))return cache.get(key);const rand=random(cx,cz),objects=[...boundaryScenery(cx,cz),...bridgeScenery(cx,cz)];
 const add=(kind,color,x,y,z,sx,sy,sz,rotation=0,solid=false)=>objects.push({id:`scenery:${key}:${objects.length}`,kind,color,x,y,z,sx,sy,sz,rotation,solid});
 for(let i=0;i<30;i++){
  const x=cx*100+rand()*100,z=cz*100+rand()*100,zone=continentAt(x,z);if(!zone||visualHeightAt(x,z)<-.5||continentRoadDistance(x,z)<8||buildingAt(x,z,9)||QUEST_HUBS.some(h=>Math.hypot(x-h.x,z-h.z)<78)||SETTLEMENT_SITES.some(s=>Math.hypot(s.x-x,s.z-z)<65))continue;
  const p=assetRegion(zone.biome),y=visualHeightAt(x,z),s=1+rand()*2;
  if(['rainforest','cinderwood','gloamfen','orchid'].includes(zone.biome)){
   const h=(zone.form==='canopy'?12:6)+rand()*8;add('trunk',p.wood,x,y+h/2,z,2,h,2,0,true);add('crown',p.leaf,x,y+h,z,s*2,h*.4,s*2);
   if(zone.form==='fungal')add('column',p.cloth,x,y+4,z,5,.8,5);
   if(zone.form==='roots')for(let j=0;j<3;j++)add('column',p.wood,x+Math.sin(j*2)*3,y+2,z+Math.cos(j*2)*3,.7,4,.7,0,true);
  }else if(zone.biome==='frostfell'&&zone.form==='snow'){
   add('trunk',p.wood,x,y+3,z,1,6,1,0,true);add('needle',p.leaf,x,y+7,z,3,8,3);add('rock',p.light,x,y+.5,z,2,1,2,0,true);
  }else if(['crystals','needles','columns','glacier'].includes(zone.form)){
   const h=5+rand()*12;add(zone.form==='columns'?'column':'needle',zone.form==='glacier'?p.glow:p.stone,x,y+h/2,z,s,h,s,rand()*6,true);
  }else if(['coast','wetlands','lakes'].includes(zone.form)){
   add('rock',p.stone,x,y+s*.35,z,s,s*.7,s*1.6,0,true);for(let j=0;j<3;j++)add('needle',p.leaf,x+j*.4,y+.8,z,.13,1.6,.13);
  }else add('rock',p.stone,x,y+s*.5,z,s*1.5,s,s,rand()*6,true);
 }
 if(cache.size>256)cache.clear();cache.set(key,objects);return objects;
}
export function continentalColliders(x,z,radius=.3){
 if(!isContinental(x,z))return [];const out=[];
 const edge=nearestProvinceBoundary(x,z);if(edge&&['channel','crevasse'].includes(edge.boundary.kind)&&edge.distance<25+radius&&continentRoadDistance(x,z)>7-radius)out.push({id:`divide-depth:${edge.boundary.id}`,minX:x-radius-1,maxX:x+radius+1,minZ:z-radius-1,maxZ:z+radius+1,minY:-1000,maxY:1000,standable:false});for(let cx=Math.floor((x-radius-12)/100);cx<=Math.floor((x+radius+12)/100);cx++)for(let cz=Math.floor((z-radius-12)/100);cz<=Math.floor((z+radius+12)/100);cz++)for(const o of continentalScatter(cx,cz))if(o.solid){
  // Trunks use their geometric radius; rocks/spires use a conservative core.
  const r=o.kind==='trunk'?o.sx*.3:Math.min(o.sx,o.sz)*.65;
  out.push({id:o.id,x:o.x,z:o.z,r,minX:o.x-r,maxX:o.x+r,minZ:o.z-r,maxZ:o.z+r,minY:o.y-o.sy/2,maxY:o.y+o.sy/2,standable:false});
 }
 for(const site of SETTLEMENT_SITES)if(Math.hypot(x-site.x,z-site.z)<70)out.push(...landmarkColliders(site));
 return out;
}

const landmarkCache=new Map();
export function landmarkColliders(site){if(landmarkCache.has(site.id))return landmarkCache.get(site.id);const out=[],base=heightAt(site.x,site.z),form=site.zone.form;
 const column=(x,z,r,h,bottom=0)=>continentRoadDistance(site.x+x,site.z+z)>r+8&&out.push({id:`${site.id}:${out.length}`,x:site.x+x,z:site.z+z,r,minX:site.x+x-r,maxX:site.x+x+r,minZ:site.z+z-r,maxZ:site.z+z+r,minY:base+bottom,maxY:base+bottom+h,standable:false});
 if(site.kind==='ruins')for(let i=0;i<5;i++)column(Math.sin(i*1.256)*13,Math.cos(i*1.256)*13,1,6+i*2);
 else if(site.kind==='landmark'||!['grounds','ruins'].includes(site.kind)){
  if(['canopy','roots','orchard'].includes(form))for(let i=0;i<7;i++){const a=i*Math.PI*2/7;column(Math.sin(a)*19,Math.cos(a)*19,3,40);}
  else if(form==='fungal')for(let i=0;i<7;i++)column(Math.sin(i*2.4)*17,Math.cos(i*2.4)*17,1,8+i*3);
  else if(form==='caldera'){for(let i=0;i<16;i++)column(Math.sin(i*Math.PI/8)*31,Math.cos(i*Math.PI/8)*31,6,14);column(0,0,9,18);}
  else if(form==='craters'){column(-20,0,3,26);column(20,0,3,26);}
  else if(form==='dunes')for(let i=0;i<12;i++)column(Math.sin(i*Math.PI/6)*24,Math.cos(i*Math.PI/6)*24,1.5,6+i%3*4);
  else if(form==='glacier')for(let i=0;i<8;i++)column(Math.sin(i*Math.PI/4)*23,Math.cos(i*Math.PI/4)*23,3,32);
  else if(!['lakes','wetlands','coast','basin','terraces'].includes(form))for(let i=0;i<9;i++)column(Math.sin(i*2.4)*20,Math.cos(i*2.4)*20,2,12+i*3);
 }
 if(site.zone.id==='stormcrown'&&site.kind==='needles'){column(-6,0,2,50);column(6,0,2,50);}
 landmarkCache.set(site.id,out);return out;
}

// Decks follow the same graded road surface used by collision. The terrain
// renderer exposes the cut below; shared ground stays at the walking deck.
const bridgeChunks=new Map();
for(const [a,b]of edges){const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),n=Math.ceil(length/5);if(!n)continue;for(let i=0;i<n;i++){
 const x=a[0]+dx*(i+.5)/n,z=a[1]+dz*(i+.5)/n,edge=nearestProvinceBoundary(x,z);if(!edge||!['channel','crevasse'].includes(edge.boundary.kind)||edge.distance>80)continue;
 const key=`${Math.floor(x/100)}:${Math.floor(z/100)}`;if(!bridgeChunks.has(key))bridgeChunks.set(key,[]);bridgeChunks.get(key).push({x,z,length:length/n+1,rotation:Math.atan2(dx,dz),pitch:-Math.atan2(heightAt(a[0]+dx*(i+1)/n,a[1]+dz*(i+1)/n)-heightAt(a[0]+dx*i/n,a[1]+dz*i/n),length/n),kind:edge.boundary.kind});
}}
export function bridgeScenery(cx,cz){return (bridgeChunks.get(`${cx}:${cz}`)||[]).flatMap((p,i)=>{const y=heightAt(p.x,p.z),id=`bridge:${cx}:${cz}:${i}`,deck={id,kind:'deck',color:p.kind==='channel'?'#9e8060':'#869399',x:p.x,z:p.z,y:y-.12,sx:14,sy:.3,sz:p.length,rotation:p.rotation,pitch:p.pitch,solid:false};return [deck,...[-1,1].map(side=>({...deck,id:id+':rail:'+side,x:p.x+Math.cos(p.rotation)*side*6.8,z:p.z-Math.sin(p.rotation)*side*6.8,y:y+1.1,sx:.28,sy:.25})),...(i%3===0?[-1,1].map(side=>({...deck,id:id+':pier:'+side,kind:'column',pitch:0,x:p.x+Math.cos(p.rotation)*side*5.7,z:p.z-Math.sin(p.rotation)*side*5.7,y:y-14,sx:.8,sy:28,sz:.8})):[])];});}
