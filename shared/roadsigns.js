import {CAPITAL_SIGNS} from './capital.js';
import {introPoint,ZONE_EXITS} from './zone-layout.js';
import {OUTPOSTS} from './world-layouts.js';
// Arrow direction is computed from the actual destination, shared with hover copy.
export const ROAD_SIGNS=[
 {id:'hearthstead-crossroads',x:3,z:13,name:'Hearthstead crossroads',destinations:[{name:'Ambermead · Rowan’s trail',x:-43,z:-7},{name:'Briarwatch · Lantern Rest',x:65,z:-8},{name:'Ashglass Sanctuary',x:3,z:-30},{name:'Willowcross',x:0,z:70}]},
 {id:'western-bend',x:-28,z:15,name:'Western trail',destinations:[{name:'Hearthstead',x:0,z:29},{name:'Rowan’s camp · Quiet pool',x:-43,z:-7}]},
 {id:'grove-fork',x:47,z:12,name:'Grove path',destinations:[{name:'Hearthstead',x:0,z:29},{name:'Lantern Rest',x:65,z:-8},{name:'Sanctuary gate',x:-3,z:-23}]},
 {id:'lantern-rest',x:61,z:-3,name:'Lantern Rest',destinations:[{name:'Lysa · Listening circle',x:65,z:-8},{name:'Briarwatch Grove',x:49,z:18}]},

].map(sign=>{const destinations=sign.destinations.map(d=>({...d,...(d.name==='Willowcross'?{x:0,z:113}:introPoint(d.x,d.z))}));return {...sign,...introPoint(sign.x,sign.z),destinations};});
ROAD_SIGNS.push(
 {id:'willowcross-road',x:5,z:87,name:'Willowcross approach',destinations:[{name:'Hearthstead',...introPoint(0,29)},{name:'Willowcross · Inn & market',x:0,z:132}]},
 {id:'willowcross-square',x:6,z:118,name:'The roads of the Reach',destinations:OUTPOSTS.map(o=>({name:o.name,x:o.x,z:o.z}))},
 {id:'willowcross-inn',x:-32,z:124,name:'The Crossroads Hearth',destinations:[{name:'Inn · Bind return waypoint',x:-38,z:133},{name:'Market & town hall',x:25,z:175}]},
 ...OUTPOSTS.map(o=>({id:`sign-${o.id}`,x:o.x+8,z:o.z-13,name:o.name,destinations:[{name:'Willowcross',x:0,z:132},{name:o.id==='human'?'Alderhaven · Human capital':'Local shelter',x:o.id==='human'?ZONE_EXITS[0].x:o.siteX,z:o.id==='human'?ZONE_EXITS[0].z:o.siteZ}]})),
 ...ZONE_EXITS.map(e=>({id:`exit-${e.id}`,x:e.x+(e.direction==='east'?-8:e.direction==='west'?8:7),z:e.z+(e.direction==='south'?-8:6),name:e.name,destinations:[{name:`${e.neighbor} · ${e.available?'Open city':'Future zone'}`,x:e.x,z:e.z},{name:'Return to Willowcross',x:0,z:132}]}))
);
ROAD_SIGNS.push(...CAPITAL_SIGNS);
export const roadDirection=(sign,destination)=>['N','NE','E','SE','S','SW','W','NW'][(Math.round(Math.atan2(destination.x-sign.x,-(destination.z-sign.z))/(Math.PI/4))+8)%8];
