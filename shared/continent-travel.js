import {CONTINENT_INNS} from './continent-buildings.js';
import {FOUNDING_INN_STOPS} from './founding-inns.js';
import {CONTINENT_HUBS,CONTINENT_ROADS} from './continent.js';
export const INN_FLIGHT_STOPS=[...CONTINENT_INNS,...FOUNDING_INN_STOPS].map(inn=>({id:`${inn.id}-flight`,innId:inn.id,name:inn.name+' · Flight',mapId:inn.mapId,x:inn.x+(inn.buildingId?8:0),z:inn.z,kind:'flight'}));
export const TRAVEL_NODES=[
 ...INN_FLIGHT_STOPS,
 {id:'cinderwood',name:'Willowcross flight stone',mapId:'cinderwood',x:35,z:150,kind:'flight'},
 {id:'alderhaven',name:'Alderhaven east waystone',mapId:'alderhaven',x:1090,z:9,kind:'capital'},
 ...CONTINENT_HUBS.map(h=>({id:h.mapId,name:h.zone.name,mapId:h.mapId,x:h.x,z:h.z,kind:h.zone.kind==='capital'?'capital':'flight'}))
];
export const FLIGHT_EDGES=[
 ...INN_FLIGHT_STOPS.map(n=>{const hub=TRAVEL_NODES.find(h=>h.id===n.mapId);return {a:n.mapId,b:n.id,points:[[hub.x,hub.z],[n.x,n.z]]};}),
 {a:'cinderwood',b:'alderhaven',points:[[35,150],[202,88],[390,142],[618,145],[837,34],[1090,9]]},
 ...CONTINENT_ROADS.map(e=>({...e,points:e.points.map((p,i)=>e.a==='alderhaven'&&i===0?[1090,9]:p)}))
];
