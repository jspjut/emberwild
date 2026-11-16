import {CONTINENT_INNS} from './continent-buildings.js';
import {LODGE_HEARTH} from './founding-inns.js';
// Place a mailbox at every established town/city return point; the small
// expedition spawn deliberately has no postal service.
export const MAILBOXES=[
 {id:'mail-willowcross',name:'Willowcross post',type:'mailbox',x:-34,z:126},
 {id:'mail-alder-gate',name:'Gate of Welcome post',type:'mailbox',x:470,z:194},
 {id:'mail-alder-market',name:'Fourwinds post',type:'mailbox',x:618,z:93},
 {id:'mail-alder-gardens',name:'Lantern Gardens post',type:'mailbox',x:854,z:338},
 ...[...CONTINENT_INNS,LODGE_HEARTH].map(inn=>({id:`mail-${inn.id}`,name:inn.name+' · Post',type:'mailbox',x:inn.x-4,z:inn.z})),
];
export const MAIL_LIMIT=100,FRIEND_LIMIT=100,MAIL_ATTACHMENTS=6;
export const mailText=(value,limit)=>typeof value==='string'?value.replace(/[\x00-\x08\x0b-\x1f\x7f]/g,'').trim().slice(0,limit):'';
