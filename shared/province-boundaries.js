import {FOUNDING_BOUNDS,isContinental} from './continent-coast.js';
import {CONTINENT_ZONES,CONTINENT_OUTLINE,worldFromSurvey,provinceWeight} from './continent.js';

// One geographic source for full local charts, terrain divides and collision.
export function clipPolygon(polygon,nx,nz,limit){const result=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],da=a[0]*nx+a[1]*nz-limit,db=b[0]*nx+b[1]*nz-limit;if(da<=0)result.push(a);if((da<=0)!==(db<=0)){const t=da/(da-db);result.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}}return result;}
export const polygonBounds=polygons=>({minX:Math.min(...polygons.flat().map(p=>p[0])),maxX:Math.max(...polygons.flat().map(p=>p[0])),minZ:Math.min(...polygons.flat().map(p=>p[1])),maxZ:Math.max(...polygons.flat().map(p=>p[1]))});
export const PROVINCE_POLYGONS=new Map(),PROVINCE_BOUNDARIES=[];
const mainland=CONTINENT_OUTLINE,seen=new Set();
function style(a,b){if(a.kind==='capital'||b?.kind==='capital')return 'wall';if([a,b].every(z=>z&&(z.route===3&&z.band>=2||['stormcrown','brokenorrery'].includes(z.id))))return 'channel';if([a,b].every(z=>z&&(z.route===1&&z.band>=5||['stillwinter','worldanvil'].includes(z.id))))return 'crevasse';if([a,b].some(z=>z?.biome==='frostfell'))return 'ice';if([a,b].every(z=>z&&['rainforest','cinderwood','gloamfen','orchid'].includes(z.biome)))return 'roots';return 'ridge';}
for(const zone of CONTINENT_ZONES){
 let polygon=mainland;for(const other of CONTINENT_ZONES)if(other!==zone)polygon=clipPolygon(polygon,other.x-zone.x,other.z-zone.z,(other.x**2+other.z**2-zone.x**2-zone.z**2+provinceWeight(zone)-provinceWeight(other))/2);
 const outline=[];
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],d=(mid[0]-zone.x)**2+(mid[1]-zone.z)**2-provinceWeight(zone);
  const neighbor=CONTINENT_ZONES.find(other=>other!==zone&&Math.abs((mid[0]-other.x)**2+(mid[1]-other.z)**2-provinceWeight(other)-d)<.01);
  const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/24)),points=[];
  for(let j=0;j<=n;j++)points.push(worldFromSurvey(a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n));
  outline.push(...points.slice(0,-1));
  const id=[zone.id,neighbor?.id||`coast:${i}`].sort().join('--');
  if(neighbor&&!seen.has(id)){seen.add(id);PROVINCE_BOUNDARIES.push({id,zones:[zone.id,neighbor.id],kind:style(zone,neighbor),points});}
 }
 // Remove the founding rectangle rather than drawing new provinces over it.
 const b=FOUNDING_BOUNDS,parts=[clipPolygon(outline,0,1,b.minZ),clipPolygon(outline,0,-1,-b.maxZ),clipPolygon(clipPolygon(clipPolygon(outline,0,-1,-b.minZ),0,1,b.maxZ),1,0,b.minX),clipPolygon(clipPolygon(clipPolygon(outline,0,-1,-b.minZ),0,1,b.maxZ),-1,0,-b.maxX)];
 PROVINCE_POLYGONS.set(zone.id,parts.filter(p=>p.length>=3));
}
// Founding settlements interrupt Voronoi edges. Remove those buried portions
// from both the atlas and collision, keeping disconnected stretches separate.
const exteriorEdges=[];
for(const edge of PROVINCE_BOUNDARIES){let line=[];const flush=()=>{if(line.length>1)exteriorEdges.push({...edge,id:edge.id+':'+exteriorEdges.length,points:line});line=[];};
 for(let i=1;i<edge.points.length;i++){const a=edge.points[i-1],b=edge.points[i],dx=b[0]-a[0],dz=b[1]-a[1];let lo=0,hi=1;for(const[axis,min,max]of [[0,FOUNDING_BOUNDS.minX,FOUNDING_BOUNDS.maxX],[1,FOUNDING_BOUNDS.minZ,FOUNDING_BOUNDS.maxZ]]){const delta=axis?dz:dx;if(Math.abs(delta)<1e-9){if(a[axis]<min||a[axis]>max){hi=-1;break;}}else{const u=(min-a[axis])/delta,v=(max-a[axis])/delta;lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));}}
  const portions=lo<=hi?[[0,lo],[hi,1]].filter(([u,v])=>v-u>1e-6):[[0,1]];if(!portions.length){flush();continue;}for(const[u,v]of portions){const first=[a[0]+dx*u,a[1]+dz*u],last=[a[0]+dx*v,a[1]+dz*v];if(line.length&&Math.hypot(line.at(-1)[0]-first[0],line.at(-1)[1]-first[1])>.01)flush();if(!line.length)line.push(first);line.push(last);}
 }flush();}
PROVINCE_BOUNDARIES.splice(0,PROVINCE_BOUNDARIES.length,...exteriorEdges);
// Spatial index shared by terrain and geometry; no scanning the continent per vertex.
const cells=new Map(),CELL=100;
for(const boundary of PROVINCE_BOUNDARIES)for(let i=1;i<boundary.points.length;i++){
 const a=boundary.points[i-1],b=boundary.points[i],segment={a,b,boundary};if(!isContinental((a[0]+b[0])/2,(a[1]+b[1])/2))continue;
 for(let x=Math.floor((Math.min(a[0],b[0])-80)/CELL);x<=Math.floor((Math.max(a[0],b[0])+80)/CELL);x++)for(let z=Math.floor((Math.min(a[1],b[1])-80)/CELL);z<=Math.floor((Math.max(a[1],b[1])+80)/CELL);z++){const key=`${x}:${z}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(segment);}
}
export function nearestProvinceBoundary(x,z,{naturalOnly=false}={}){let result=null,distance=Infinity;for(const segment of cells.get(`${Math.floor(x/CELL)}:${Math.floor(z/CELL)}`)||[]){if(naturalOnly&&segment.boundary.kind==='wall')continue;const {a,b}=segment,dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)||0)),d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);if(d<distance){distance=d;result={...segment,distance};}}return result;}
export function provinceRelief(x,z){const edge=nearestProvinceBoundary(x,z,{naturalOnly:true});if(!edge||edge.boundary.kind==='wall'||edge.distance>=70)return 0;const t=1-edge.distance/70;return (edge.boundary.kind==='crevasse'?-100:edge.boundary.kind==='channel'?-80:24)*t*t*(3-2*t);}

export function divideSurface(x,z,base){const edge=nearestProvinceBoundary(x,z,{naturalOnly:true});if(!edge)return base;const {kind}=edge.boundary,d=edge.distance;if(kind==='channel'&&d<70){const t=Math.min(1,d/70),blend=t*t*(3-2*t);return -12*(1-blend)+base*blend;}return base+provinceRelief(x,z);}
