import {ENEMY_TYPES} from '../shared/content.js';
import {bodyFits,lineOfSight,supportBelow} from '../shared/props.js';
// Campaign bots stand beside a node instead of teleporting into its model or
// into a nearby creature. Gathering still runs through the full world tick.
export function gatherPosition(world,object){
 const positions=Array.from({length:32},(_,i)=>({x:object.x+Math.cos(i*Math.PI/16)*4.3,z:object.z+Math.sin(i*Math.PI/16)*4.3}));
 const threats=world.enemies.filter(e=>e.hp>0&&!e.evading&&ENEMY_TYPES[e.type].aggro);
 const safety=p=>Math.min(...threats.map(e=>Math.hypot(e.x-p.x,e.z-p.z)));
 return positions.filter(p=>bodyFits(p.x,p.z,supportBelow(p.x,p.z).y)&&lineOfSight(p,object,object.id)).sort((a,b)=>safety(b)-safety(a))[0]||object;
}
