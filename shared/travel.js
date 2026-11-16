import {LODGE_HEARTH} from './founding-inns.js';
import {CONTINENT_INNS} from './continent-buildings.js';
import {CAPITAL_WAYPOINTS} from './capital.js';
import {SPAWN} from './zone-layout.js';
export const RECALL_COOLDOWN=15*60;
export const RECALL_SKILL={name:'Hearthward Return',iconId:'recall',key:'=',level:1,cost:0,cooldown:RECALL_COOLDOWN,range:0,castTime:8,travel:true,triggersGCD:false,description:'Return to your bound waypoint after an 8-second cast. Moving, jumping or taking damage interrupts it. Cannot be used in combat. 15-minute cooldown, retained through logout.'};
export const WAYPOINTS=[
 {id:'hearthstead',name:'Hearthstead · First Light',mapId:'cinderwood',...SPAWN,available:true,default:true},
 {id:'willowcross',name:'Willowcross · Crossroads Hearth',mapId:'cinderwood',x:-38,z:133,npcId:'town-healer',available:true},
 ...CAPITAL_WAYPOINTS,
 LODGE_HEARTH,
 ...CONTINENT_INNS
];
export const waypointFor=id=>WAYPOINTS.find(point=>point.id===id&&point.available)||WAYPOINTS[0];

// Empty, self-service waystones; no NPC population is needed to use the network.
export {TRAVEL_NODES,FLIGHT_EDGES} from './continent-travel.js';
