import {CAPITAL_WAYPOINTS} from './capital.js';
export const LODGE_HEARTH={id:'wayfarers-lodge',name:'Wayfarer’s Lodge',mapId:'cinderwood',x:-11*Math.SQRT2,z:32+5*Math.SQRT2-8.5,available:true,selfService:true};
export const FOUNDING_INN_STOPS=[
 {...LODGE_HEARTH},
 {id:'willowcross',name:'Crossroads Hearth',mapId:'cinderwood',x:-38,z:152},
 ...CAPITAL_WAYPOINTS
];
