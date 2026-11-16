import {CONTINENT_ZONES} from './continent.js';
export const WORLD_CONTENT_SLOTS=[
 {id:'leveling-cinderwood',kind:'leveling',minLevel:1,maxLevel:10,mapId:'cinderwood',status:'playable'},
 {id:'capital-human',kind:'capital',raceId:'human',mapId:'alderhaven',status:'playable'},
 ...CONTINENT_ZONES.map(zone=>({id:`${zone.kind}-${zone.id}`,kind:zone.kind,mapId:zone.id,name:zone.name,minLevel:zone.minLevel,maxLevel:zone.maxLevel,raceId:zone.raceId,inspiration:zone.inspiration,route:zone.route,status:'geometry'}))
];
export function validateWorldAllocation(maps){const seen=new Set();for(const s of WORLD_CONTENT_SLOTS){if(!s.mapId||seen.has(s.mapId)||!maps[s.mapId])throw Error(`Invalid world allocation ${s.id}`);seen.add(s.mapId);}return true;}
