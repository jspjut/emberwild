import {FOUNDING_BOUNDS,foundingDistance} from './continent-coast.js';
import {CONTINENT_ZONES,CONTINENT_ROADS,continentAt,surveyWarp,isContinental} from './continent.js';
// Simulation ownership and replication subscriptions are independent of atlas charts.
// A transition owns its actors once, and is subscribed to by both adjacent cores.
export const ZONE_REGIONS={
 cinderwood:{id:'cinderwood',kind:'zone',neighbors:['reach-alderhaven']},
 alderhaven:{id:'alderhaven',kind:'zone',neighbors:['reach-alderhaven']},
 'reach-alderhaven':{id:'reach-alderhaven',kind:'transition',zones:['cinderwood','alderhaven'],bounds:{minX:280,maxX:450,minZ:-245,maxZ:535},midpoint:365}
};
export const ARRIVAL_REGION=ZONE_REGIONS['reach-alderhaven'];
for(const zone of CONTINENT_ZONES)ZONE_REGIONS[zone.id]={id:zone.id,kind:'zone',neighbors:[...new Set(CONTINENT_ROADS.filter(e=>e.a===zone.id||e.b===zone.id).map(e=>e.a===zone.id?e.b:e.a))]};
export function regionAt(x,z){if(isContinental(x,z))return continentAt(x,z).id;const b=ARRIVAL_REGION.bounds;return x>=b.minX&&x<=b.maxX&&z>=b.minZ&&z<=b.maxZ?ARRIVAL_REGION.id:x>365?'alderhaven':'cinderwood';}
export const primaryZoneAt=(x,z)=>isContinental(x,z)?continentAt(x,z).id:x>ARRIVAL_REGION.midpoint?'alderhaven':'cinderwood';
export function interestAt(x,z){
 const region=regionAt(x,z),primary=primaryZoneAt(x,z),continental=isContinental(x,z),b=FOUNDING_BOUNDS;
 const regions=continental?[region]:region===ARRIVAL_REGION.id?[primary,region]:[region,...ZONE_REGIONS[region].neighbors];
 const nearFounding=continental?foundingDistance(x,z)<160:Math.min(x-b.minX,b.maxX-x,z-b.minZ,b.maxZ-z)<160;
 if(continental||nearFounding){const survey=surveyWarp(x,z),best=continentAt(x,z)||CONTINENT_ZONES.reduce((a,v)=>Math.hypot(survey.x-v.x,survey.z-v.z)<Math.hypot(survey.x-a.x,survey.z-a.z)?v:a),d=Math.hypot(survey.x-best.x,survey.z-best.z);regions.push(...CONTINENT_ZONES.filter(v=>Math.hypot(survey.x-v.x,survey.z-v.z)<=d+320).map(v=>v.id));}
 if(continental&&nearFounding)regions.push('alderhaven','cinderwood',ARRIVAL_REGION.id);
 return {region,primary,regions:[...new Set(regions)]};
}

export function interestedIn(observer,source){return interestAt(observer.x,observer.z).regions.includes(regionAt(source.x,source.z));}

// Actor meshes fade out before an adjacent core can leave the subscription.
export const ACTOR_FADE_START=60,ACTOR_VIEW_DISTANCE=75;
