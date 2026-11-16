import {foundingDistance} from './continent-coast.js';
import {CONTINENT_ZONES,CONTINENT_SITES,CONTINENT_ROADS,continentAt,withinContinent} from './continent.js';
import {PROVINCE_POLYGONS,polygonBounds,nearestProvinceBoundary} from './province-boundaries.js';

// Static settlement reservations. These are architecture, public squares and
// objective clearings, not NPCs, encounters or quest definitions.
const vocab={
 cinderwood:['Cidercross','Hedgewatch','Applecourt','Millfield','Pressyard','Bramblegate','Beechrest','Haymarket','Orchardend','Wainstead'],
 rainforest:['Canopy Court','Fernwatch','Rainwell','Boughrest','Mossgate','Seedhouse','Vinebridge','Leafmarket','Rootward','Greenhall'],
 frostfell:['Snowwatch','Slate Refuge','Windcourt','Blueice Lodge','High Cairn','Rimegate','Witness Camp','Thawwell','Cloud Shelf','White Hearth'],
 redrock:['Quarrygate','Copperwatch','Bell Yard','Stonewell','Ironcourt','Dustrest','Chisel Camp','Red Arch','Cliffmarket','Hammerstead'],
 sunsteppe:['Waincross','Grasswatch','Sunwell','Longfield','Windmill Court','Amber Rest','Drover Camp','Haygate','Sundial Yard','Ridge Market'],
 gloamfen:['Reedwatch','Lantern Quay','Root Refuge','Mirewell','Willowcourt','Moss Landing','Rushgate','Duskstead','Fenmarket','Stilt Yard'],
 brinecoast:['Netters Quay','Saltwatch','Whitewater Court','Tern Landing','Driftwood Rest','Foamgate','Beacon Yard','Sailmarket','Shellwell','Shorestead'],
 coral:['Pearl Quay','Shellwatch','Tide Court','Coral Landing','Opal Rest','Reefgate','Rescue Yard','Sailmarket','Lagoonwell','Ternstead'],
 emberwastes:['Kilnwatch','Cooling Court','Ash Refuge','Cinderwell','Bronze Yard','Coalrest','Glassgate','Vent Camp','Forge Market','Emberstead'],
 desert:['Caravan Court','Shade Well','Dunewatch','Copper Rest','Awning Yard','Sandgate','Glass Camp','Date Market','Oasis Refuge','Sunstead'],
 crystal:['Facet Court','Prismwatch','Glass Refuge','Shardwell','Opal Yard','Lens Rest','Quartzgate','Mirror Camp','Glimmer Market','Lightstead'],
 orchid:['Petal Court','Sporewatch','Lilac Refuge','Dewwell','Bloom Yard','Pollen Rest','Orchidgate','Hollow Camp','Violet Market','Veilstead'],
 astral:['Survey Court','Starwatch','Orrery Refuge','Moonwell','Lens Yard','Comet Rest','Silvergate','Impact Camp','Astrolabe Market','Dawnstead'],
 storm:['Beacon Court','Stormwatch','Lee Refuge','Rainwell','Signal Yard','Thunder Rest','Windgate','Meridian Camp','Anchor Market','Cloudstead'],
 abyss:['Deep Quay','Ribwatch','Reef Refuge','Tidewell','Shell Yard','Blue Rest','Archgate','Sounding Camp','Pearl Market','Stepstead']
};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clear=(zone,p,margin=130)=>continentAt(p.x,p.z)?.id===zone.id&&foundingDistance(p.x,p.z)>190&&withinContinent(p.x,p.z,240)&&(nearestProvinceBoundary(p.x,p.z)?.distance??Infinity)>margin;
export const QUEST_HUBS=[],HUB_OBJECTIVES=[];
for(const zone of CONTINENT_ZONES.filter(z=>z.kind!=='capital')){
 const b=polygonBounds(PROVINCE_POLYGONS.get(zone.id)),candidates=[],original=CONTINENT_SITES.filter(s=>s.mapId===zone.id);
 for(let x=Math.ceil(b.minX/110)*110;x<b.maxX;x+=110)for(let z=Math.ceil(b.minZ/110)*110;z<b.maxZ;z+=110){const p={x,z};if(clear(zone,p)&&CONTINENT_ROADS.every(r=>r.points.every(([x,z])=>Math.hypot(p.x-x,p.z-z)>95))&&original.every(s=>distance(p,s)>180))candidates.push(p);}
 const count=6+zone.seed%5,selected=[{x:zone.x,z:zone.z}],names=vocab[zone.biome]||vocab.sunsteppe,prefix=zone.name.replace(/^The /,'').split(/[ ,]/)[0];
 for(let i=1;i<count;i++){
  // Spread hubs across the owned polygon, not in a tiny ring around the flight stone.
  candidates.sort((a,b)=>Math.min(...selected.map(s=>distance(b,s)))-Math.min(...selected.map(s=>distance(a,s))));
  const next=candidates.find(p=>selected.every(s=>distance(p,s)>240));if(!next)throw Error(`No room for ${count} hubs in ${zone.id}`);selected.push(next);
 }
 const innCount=2+zone.seed%3,innIndices=new Set(Array.from({length:innCount},(_,i)=>Math.round(i*(count-1)/(innCount-1))));
 for(const [i,p]of selected.entries()){
  const h={...p,id:`${zone.id}-hub-${i}`,mapId:zone.id,zone,name:`${prefix} ${names[i]}`,kind:['village','watchpost','refuge','workyard'][i%4],radius:70,inn:innIndices.has(i)};QUEST_HUBS.push(h);
  // Named objective areas remain separate from settlement footprints, with
  // enough cleared land for a later camp, encounter or outdoor quest object.
  const options=[];for(const radius of [160,210,270])for(let n=0;n<24;n++){const angle=n*Math.PI/12+zone.seed,p={x:Math.round(h.x+Math.cos(angle)*radius),z:Math.round(h.z+Math.sin(angle)*radius)};if(clear(zone,p,90)&&selected.every(s=>distance(p,s)>125)&&[...original,...HUB_OBJECTIVES.filter(s=>s.mapId===zone.id)].every(s=>distance(p,s)>110))options.push(p);}
  const objective=options[0];if(!objective)throw Error(`No objective clearing for ${h.id}`);
  HUB_OBJECTIVES.push({...objective,id:`${h.id}-objective`,hubId:h.id,mapId:zone.id,zone,kind:i%3===0?'ruins':'grounds',name:`${prefix} ${['Old Foundations','Foragers’ Glade','Signal Rise','Abandoned Works','Gathering Hollow','Watch Ruins','Dry Basin','Fallen Court','Outer Terraces','Stone Circle'][i]}`});
 }
}
export const WORLD_SITES=[...CONTINENT_SITES,...HUB_OBJECTIVES];
function landRoute(a,b){
 const clear=(a,b)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/40);for(let i=0;i<=n;i++)if(!withinContinent(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,180))return false;return true;};
 if(clear(a,b))return [a,b];const candidates=[];for(let dx=-1200;dx<=1200;dx+=150)for(let dz=-1200;dz<=1200;dz+=150){const p=[(a[0]+b[0])/2+dx,(a[1]+b[1])/2+dz];if(clear(a,p)&&clear(p,b))candidates.push(p);}candidates.sort((p,q)=>Math.hypot(p[0]-a[0],p[1]-a[1])+Math.hypot(p[0]-b[0],p[1]-b[1])-Math.hypot(q[0]-a[0],q[1]-a[1])-Math.hypot(q[0]-b[0],q[1]-b[1]));if(!candidates.length)throw Error('No inland settlement approach');return [a,candidates[0],b];
}
export const HUB_ROADS=QUEST_HUBS.flatMap(h=>{
 const peers=QUEST_HUBS.filter(v=>v.mapId===h.mapId),index=peers.indexOf(h),parent=index?peers.slice(0,index).sort((a,b)=>distance(h,a)-distance(h,b))[0]:null;
 const objective=HUB_OBJECTIVES.find(s=>s.hubId===h.id),roads=[{id:`${h.id}-objective-road`,a:h.mapId,b:h.mapId,kind:'trail',points:[[h.x,h.z],[objective.x,objective.z]]}];
 if(parent)roads.push({id:`${h.id}-approach`,a:h.mapId,b:h.mapId,kind:'local-road',points:landRoute([parent.x,parent.z],[h.x,h.z])});return roads;
});
