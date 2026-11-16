import {FOUNDING_BOUNDS} from './continent-coast.js';
import {WAYPOINTS} from './travel.js';
import {TRAVEL_NODES} from './continent-travel.js';
import {WORLD_SITES as SETTLEMENT_SITES,QUEST_HUBS} from './continent-settlements.js';
import {PROVINCE_POLYGONS,PROVINCE_BOUNDARIES,polygonBounds} from './province-boundaries.js';
import {CAPITAL_ROADS} from './capital.js';
import {ROUTES} from './world-layouts.js';
import {ZONE_BOUNDS,CONNECTING_ROAD,REACH_DIVIDE_POSTS} from './zone-layout.js';
import {CAPITAL_BOUNDS} from './capital.js';
import {CONTINENT_ZONES,CONTINENT_ROADS} from './continent.js';
import {CONTINENT_WARDS,CONTINENT_BUILDINGS,CONTINENT_CITY_ROADS} from './continent-buildings.js';
import {ATLAS_REGIONS,atlasRegionFor} from './atlas-regions.js';
import {assetRegion} from './asset-library.js';
const worldBounds={minX:-1900,maxX:15600,minZ:-12900,maxZ:13200};
const project=(b,[x,z])=>[(x-b.minX)/(b.maxX-b.minX)*1000,(z-b.minZ)/(b.maxZ-b.minZ)*720];
function features(zone,x=500,y=340,scale=1){
 const forest=['canopy','roots','orchard','fungal'].includes(zone.form)||zone.biome==='rainforest',wet=['coast','wetlands','lakes','basin'].includes(zone.form)||zone.form==='terraces'&&zone.biome==='abyss';
 return {geography:[{kind:zone.form||'ridges',x:x+65*scale,y:y+5*scale,size:45*scale}],forests:forest?[{x:x-100*scale,y:y-50*scale,rx:120*scale,ry:75*scale,count:Math.round(22*scale)}]:[],mountains:!forest&&!wet?[{x:x+70*scale,y:y-30*scale,count:4,size:28*scale}]:[],lakes:wet?[{x:x+70*scale,y:y-25*scale,rx:65*scale,ry:38*scale}]:[],settlements:zone.form==='craters'||zone.form==='caldera'?[{x,y:y+50*scale,type:'ruin'}]:[]};
}
const rectangle=b=>[[b.minX,b.minZ],[b.maxX,b.minZ],[b.maxX,b.maxZ],[b.minX,b.maxZ]];
const extent=polygons=>({minX:Math.min(...polygons.flat().map(p=>p[0])),maxX:Math.max(...polygons.flat().map(p=>p[0])),minZ:Math.min(...polygons.flat().map(p=>p[1])),maxZ:Math.max(...polygons.flat().map(p=>p[1]))});
const framed=(b,f,p)=>{const[x,y]=project(b,p);return [f.x+x/1000*f.width,f.y+y/720*f.height];};
function borders(polygons){const edges=new Map(),key=p=>p.map(v=>Math.round(v*1000)).join(':');for(const polygon of polygons)for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],id=[key(a),key(b)].sort().join('|');if(edges.has(id))edges.delete(id);else edges.set(id,[a,b]);}return [...edges.values()];}
const inside=(p,poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
function terrainMarks(chart,site,polygon,point,detailed){
 let seed=site.seed||101;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},b=extent([polygon]);
 for(let i=0;i<(detailed?5:1);i++){
  let p;for(let n=0;n<100;n++){const candidate=[b.minX+rand()*(b.maxX-b.minX),b.minZ+rand()*(b.maxZ-b.minZ)];if(inside(candidate,polygon)){p=candidate;break;}}if(!p)continue;
  const[x,y]=point(p),f=features(site,x,y,detailed?.38:.3);for(const forest of f.forests){forest.count=detailed?4:3;forest.rx=20;forest.ry=14;}for(const m of f.mountains)m.count=3;
  for(const key of ['forests','mountains','lakes','geography'])chart[key].push(...f[key]);
 }
}
const baseChart=()=>({charted:true,subtitle:'',survey:[[25,100],[975,100],[975,640],[25,640]],unknown:[],washes:[],forests:[],mountains:[],lakes:[],geography:[],rivers:[],roads:[],settlements:[],labels:[],landAreas:[],borders:[],avoidLabelCollisions:true,footer:false});
function intersects(points,b){const e=polygonBounds([points]);return e.maxX>=b.minX&&e.minX<=b.maxX&&e.maxZ>=b.minZ&&e.minZ<=b.maxZ;}
export function clipRoad(points,b){const lines=[];for(let i=1;i<points.length;i++){const a=points[i-1],end=points[i],d=[end[0]-a[0],end[1]-a[1]];let lo=0,hi=1;for(const[axis,min,max]of [[0,b.minX,b.maxX],[1,b.minZ,b.maxZ]]){if(Math.abs(d[axis])<1e-9){if(a[axis]<min||a[axis]>max){hi=-1;break;}}else{const u=(min-a[axis])/d[axis],v=(max-a[axis])/d[axis];lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));}}if(lo<=hi){const first=[a[0]+d[0]*lo,a[1]+d[1]*lo],last=[a[0]+d[0]*hi,a[1]+d[1]*hi],previous=lines.at(-1);if(previous&&Math.hypot(previous.at(-1)[0]-first[0],previous.at(-1)[1]-first[1])<.01)previous.push(last);else lines.push([first,last]);}}return lines;}
export function roadCrossings(id){const out=[];for(const edge of PROVINCE_BOUNDARIES.filter(e=>e.zones.includes(id)))for(const road of CONTINENT_ROADS)for(let i=1;i<road.points.length;i++)for(let j=1;j<edge.points.length;j++){
 const a=road.points[i-1],b=road.points[i],c=edge.points[j-1],d=edge.points[j],rx=b[0]-a[0],rz=b[1]-a[1],sx=d[0]-c[0],sz=d[1]-c[1],den=rx*sz-rz*sx;if(Math.abs(den)<1e-9)continue;const t=((c[0]-a[0])*sz-(c[1]-a[1])*sx)/den,u=((c[0]-a[0])*rz-(c[1]-a[1])*rx)/den;if(t>=0&&t<=1&&u>=0&&u<=1){const x=a[0]+t*rx,z=a[1]+t*rz;if(!out.some(p=>Math.hypot(p.x-x,p.z-z)<30))out.push({x,z,kind:edge.kind,road:road.id,boundary:edge.id});}
 }return out;}
export function extendContinentAtlas(maps){
 const sites=[{id:'cinderwood',name:'Cinderwood',x:0,z:120,kind:'leveling',biome:'cinderwood',form:'canopy',minLevel:1,maxLevel:10},{id:'alderhaven',name:'Alderhaven',x:800,z:145,kind:'capital',biome:'cinderwood'},...CONTINENT_ZONES];
 // Use the same polygon coast as terrain and authoritative movement.
 const shapes=new Map([['cinderwood',[rectangle({...FOUNDING_BOUNDS,maxX:350}),rectangle(CONNECTING_ROAD)]],['alderhaven',[rectangle(CAPITAL_BOUNDS)]],...PROVINCE_POLYGONS]);
 const roads=[...CONTINENT_ROADS,...CONTINENT_CITY_ROADS,...CAPITAL_ROADS.map(points=>({points})),...ROUTES.map(points=>({points}))];
 for(const site of sites){
  const polygons=shapes.get(site.id),territory=polygonBounds(polygons),b={...territory};
  // Full provinces, not the old 1 km square cropped around each hub. Leave
  // room for neighboring roads and for the shared title/compass treatment.
  if(site.id==='alderhaven')b.maxX=1730;
  const width=b.maxX-b.minX,depth=b.maxZ-b.minZ;b.minX-=width*.08;b.maxX+=width*.08;b.minZ-=depth*.21;b.maxZ+=depth*.18;
  const point=p=>project(b,p),palette=assetRegion(site.biome),old=maps[site.id];
  const chart=maps[site.id]={...baseChart(),id:site.id,name:site.name.split(',')[0],kind:site.kind==='capital'?'City':'Zone',bounds:b,territoryBounds:territory};
  // Preserve the actual starter settlements and city wards, reprojected from
  // their old charts rather than keeping a different decorative map layout.
  if(old){
   const ob=old.bounds,convert=p=>point([ob.minX+p[0]/1000*(ob.maxX-ob.minX),ob.minZ+p[1]/720*(ob.maxZ-ob.minZ)]),sx=(ob.maxX-ob.minX)/(b.maxX-b.minX),sy=(ob.maxZ-ob.minZ)/(b.maxZ-b.minZ);
   for(const key of ['forests','mountains','lakes','settlements','blocks','labels'])chart[key]=(old[key]||[]).filter(v=>key!=='labels'||(!v.text.includes('→')&&!v.text.includes('←')&&!v.text.includes('↓'))).map(v=>{const[x,y]=convert([v.x,v.y]);return {...v,x,y,...(v.rx?{rx:v.rx*sx,ry:v.ry*sy}:{}),...(v.w?{w:v.w*sx,h:v.h*sy}:{})};});
   chart.rivers=(old.rivers||[]).map(line=>line.map(convert));if(old.walls)chart.walls=old.walls.map(convert);
  }else{
   for(const polygon of polygons)terrainMarks(chart,site,polygon,point,true);
   const[x,y]=point([site.x,site.z]);chart.settlements.push({x,y,type:site.kind==='capital'?'capital':'hearth'});
   if(site.kind==='capital'){
    chart.blocks=CONTINENT_BUILDINGS.filter(v=>v.mapId===site.id).map(v=>{const[x,y]=point([v.x,v.z]);return {x,y,w:v.width/(b.maxX-b.minX)*1000,h:v.depth/(b.maxZ-b.minZ)*720,landmark:!!v.landmark};});
    chart.labels=CONTINENT_WARDS.filter(w=>w.mapId===site.id).map(w=>{const[x,y]=point([w.x,w.z]);return {text:w.name,x,y:y+18,size:15};});
   }else for(const mark of SETTLEMENT_SITES.filter(s=>s.mapId===site.id)){const[x,y]=point([mark.x,mark.z]);if(mark.kind==='ruins')chart.settlements.push({x,y,type:'ruin'});else if(mark.kind!=='grounds')chart.geography.push({kind:site.form,x,y,size:32});}
  }
  // Neighboring land gives context, while the owned polygon has stronger ink.
  for(const other of sites)for(const polygon of shapes.get(other.id)){if(!intersects(polygon,b))continue;chart.landAreas.push({points:polygon.map(point),color:other===site?palette.ground:'#c5ba9d'});}
  if(site.kind!=='capital'&&site.id!=='cinderwood'){
   for(const h of QUEST_HUBS.filter(h=>h.mapId===site.id)){const[x,y]=point([h.x,h.z]);chart.settlements.push({x,y,type:'hearth'});chart.labels.push({text:h.name.replace(site.name.replace(/^The /,'').split(/[ ,]/)[0]+' ',''),x,y:y+13,size:12});}
   chart.blocks=CONTINENT_BUILDINGS.filter(v=>v.mapId===site.id).map(v=>{const[x,y]=point([v.x,v.z]);return {x,y,w:v.width/(b.maxX-b.minX)*1000,h:v.depth/(b.maxZ-b.minZ)*720,landmark:v.inn};});
  }
  chart.borders=polygons.map(poly=>[...poly,poly[0]].map(point));
  chart.boundaries=PROVINCE_BOUNDARIES.filter(edge=>intersects(edge.points,b)).map(edge=>({kind:edge.kind,points:edge.points.map(point)}));
  if(site.id==='cinderwood'||site.id==='alderhaven')for(const p of REACH_DIVIDE_POSTS){const[x,y]=point([p.x,p.z]);chart.mountains.push({x,y,count:1,size:5});}
  chart.roads=roads.flatMap(r=>clipRoad(r.points,b).map(line=>line.map(point)));
  chart.crossings=roadCrossings(site.id).map(c=>({...c,points:undefined,...Object.fromEntries(['x','y'].map((key,i)=>[key,point([c.x,c.z])[i]]))}));
  chart.services=[...WAYPOINTS.filter(v=>v.available&&!v.default&&v.mapId===site.id).map(v=>({...v,type:'inn'})),...TRAVEL_NODES.filter(v=>v.mapId===site.id).map(v=>({...v,type:v.kind==='capital'?'capital':'flight'}))].map(v=>({...v,x:point([v.x,v.z])[0],y:point([v.x,v.z])[1]}));
  chart.parent=atlasRegionFor(site);chart.subtitle=site.kind==='capital'?'':site.minLevel===site.maxLevel?`Level ${site.minLevel}`:`Levels ${site.minLevel}–${site.maxLevel}`;
  chart.labels=chart.labels.filter(l=>l.text.length<=32&&!l.text.toUpperCase().includes(chart.name.toUpperCase()));
  // Label road destinations at the visible edge, including all four branches
  // beyond Alderhaven. These are real paths, not inferred atlas connections.
  for(const road of CONTINENT_ROADS.filter(r=>(r.a===site.id||r.b===site.id)&&r.a!==r.b)){
   const target=sites.find(s=>s.id===(road.a===site.id?road.b:road.a)),path=road.a===site.id?road.points:[...road.points].reverse();
   const visible=clipRoad(path,{minX:b.minX+width*.09,maxX:b.maxX-width*.09,minZ:b.minZ+depth*.17,maxZ:b.maxZ-depth*.17});if(!target||!visible.length)continue;
   const[x,y]=point(visible.at(-1).at(-1));chart.labels.push({text:target.name.split(',')[0].replace(/^The /,''),x:Math.max(100,Math.min(900,x)),y:Math.max(125,Math.min(610,y)),size:12,italic:true});
  }
 }
 const worldFrame={x:45,y:110,width:910,height:510},worldPoint=p=>framed(worldBounds,worldFrame,p);
 Object.assign(maps.emberwild,{...baseChart(),id:'emberwild',name:'Emberwild',kind:'World',parent:null,geographicProjection:{bounds:worldBounds,frame:worldFrame}});
 const root=maps.emberwild;root.services=TRAVEL_NODES.filter(v=>v.kind==='capital').map(v=>({...v,type:'capital',x:worldPoint([v.x,v.z])[0],y:worldPoint([v.x,v.z])[1]}));root.roads=CONTINENT_ROADS.filter(r=>r.kind!=='crossroad').map(r=>r.points.map(worldPoint));
 for(const region of ATLAS_REGIONS){
  const members=sites.filter(s=>atlasRegionFor(s)===region.id),all=members.flatMap(s=>shapes.get(s.id)),b=extent(all),padX=(b.maxX-b.minX)*.025,padZ=(b.maxZ-b.minZ)*.025;b.minX-=padX;b.maxX+=padX;b.minZ-=padZ;b.maxZ+=padZ;
  const frame={x:45,y:110,width:910,height:510},point=p=>framed(b,frame,p),outlines=all.map(poly=>poly.map(worldPoint)),box=extent(outlines),projection={bounds:b,frame};
  const chart=maps[region.id]={...baseChart(),id:region.id,name:region.name,kind:'Region',parent:'emberwild',geographicProjection:projection,placement:{x:box.minX,y:box.minZ,width:box.maxX-box.minX,height:box.maxZ-box.minZ},outline:outlines[0],outlines};
  for(const site of sites.filter(s=>!members.includes(s)))for(const polygon of shapes.get(site.id))if(intersects(polygon,b))chart.landAreas.push({points:polygon.map(point),color:'#c5ba9d'});
  for(const site of members){
   const map=maps[site.id],low=point([map.bounds.minX,map.bounds.minZ]),high=point([map.bounds.maxX,map.bounds.maxZ]);map.placement={x:low[0],y:low[1],width:high[0]-low[0],height:high[1]-low[1]};map.outlines=shapes.get(site.id).map(poly=>poly.map(point));map.outline=map.outlines[0];
   // A province covers its actual territory, including the land between hubs.
   for(const polygon of shapes.get(site.id)){chart.landAreas.push({points:polygon.map(point),color:assetRegion(site.biome).ground});root.landAreas.push({points:polygon.map(worldPoint),color:region.color});terrainMarks(chart,site,polygon,point,true);terrainMarks(root,site,polygon,worldPoint,false);}
   const[x,y]=point([site.x,site.z]);chart.settlements.push({x,y,type:site.kind==='capital'?'capital':'hearth'});chart.labels.push({text:site.name.split(',')[0].replace(/^The /,''),x,y:y+23,size:site.kind==='capital'?18:15});
  }
  chart.borders=all.flatMap(poly=>borders([poly]).map(edge=>edge.map(point)));root.borders.push(...borders(all).map(edge=>edge.map(worldPoint)));
  const ids=new Set(members.map(s=>s.id));chart.roads=CONTINENT_ROADS.filter(r=>ids.has(r.a)||ids.has(r.b)).flatMap(r=>clipRoad(r.points,b).map(line=>line.map(point)));chart.boundaries=PROVINCE_BOUNDARIES.filter(edge=>edge.zones.some(id=>ids.has(id))).map(edge=>({kind:edge.kind,points:edge.points.map(point)}));
  chart.services=TRAVEL_NODES.filter(v=>members.some(s=>s.id===v.mapId)&&v.kind==='capital').map(v=>({...v,type:'capital',x:point([v.x,v.z])[0],y:point([v.x,v.z])[1]}));
  const main=members.filter(s=>s.kind!=='capital'),center=[main.reduce((sum,s)=>sum+s.x,0)/main.length,main.reduce((sum,s)=>sum+s.z,0)/main.length],[x,y]=worldPoint(center);root.labels.push({text:region.name,x,y,size:23});
 }
}
