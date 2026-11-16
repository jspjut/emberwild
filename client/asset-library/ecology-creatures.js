import {creatureCycle,gaitOffset} from './motion.js';
import {group,ball,cone,cylinder,beam,eyes,rock} from './primitives.js';
export const ECOLOGY_BODY_TYPES=['wolf','bear','hare','lynx','badger','goat','bat','eagle','lizard','crocodile','fish','jelly','spider','centipede','snail','elemental'];
export function ecologyCreature(def,p){
 const root=group(null,def.id),body=group(root,'body'),joints=[body],legs=[],wings=[],tails=[];
 const joint=(name,x,y,z,parent=body)=>{const n=group(parent,name,x,y,z);joints.push(n);return n;};
 const leg=(x,y,z,r=.065)=>{const n=joint('leg',x,y,z);beam(n,p.body,[0,0,0],[x*.15,-y*.65,.06],r);beam(n,p.dark,[x*.15,-y*.65,.06],[x*.12,-y+.05,.16],r*.8);ball(n,p.dark,x*.12,-y+.06,.19,r*1.5,.07,.15);legs.push(n);};
 let head;
 const model=def.model;
 if(['wolf','bear','hare','lynx','badger','goat'].includes(model)){
  const bear=model==='bear',hare=model==='hare',goat=model==='goat',badger=model==='badger';
  const h=bear?1.25:goat?1.2:hare?.5:badger?.45:.82,w=bear?.57:badger?.35:hare?.23:.3,len=bear?.85:hare?.4:badger?.6:.72;
  ball(body,p.body,0,h,0,w,bear?.65:hare?.35:.36,len);ball(body,p.light,0,h-.12,len*.55,w*.8,.22,.3);
  for(const side of[-1,1])for(const z of[-len*.65,len*.65]){leg(side*w*.8,h-.2,z,bear?.13:hare?.05:.07);if(hare&&z<0)ball(body,p.body,side*.23,.3,z,.18,.23,.24);}
  head=joint('head',0,h+(goat?.52:bear?.3:hare?.15:.17),len*.86);ball(head,p.body,0,0,.05,bear?.36:.23,bear?.32:.24,.28);ball(head,p.light,0,-.09,.3,bear?.22:.13,.13,model==='wolf'?.32:.17);ball(head,p.dark,0,-.04,model==='wolf'?.57:.43,.065,.055,.035);eyes(head,p,.16,.08,.24,.04);
  for(const side of[-1,1]){const ear=joint('ear',side*.18,.2,0,head);if(hare)ball(ear,p.body,side*.05,.33,-.01,.09,.38,.08);else if(bear||badger)ball(ear,p.dark,side*.02,.08,0,.12,.12,.07);else cone(ear,p.body,0,.12,0,.11,.3).rotation.z=-side*.2;
   if(goat){beam(head,p.trim,[side*.15,.18,-.04],[side*.24,.64,-.16],.055);beam(head,p.trim,[side*.24,.64,-.16],[side*.17,.79,-.34],.04);}
   if(model==='lynx')cone(ear,p.dark,0,.34,0,.025,.2);
   if(badger)ball(head,p.dark,side*.125,.02,.25,.065,.18,.06);
  }
  const tail=joint('tail',0,h,-len);if(hare||bear)ball(tail,p.light,0,0,-.1,.12,.12,.14);else{beam(tail,p.body,[0,0,0],[0,-.05,-.5],.09);ball(tail,p.dark,0,-.05,-.5,.1,.09,.15);}tails.push(tail);
 }else if(['bat','eagle'].includes(model)){
  const bat=model==='bat';ball(body,p.body,0,1.3,0,bat?.18:.28,.27,.47);head=joint('head',0,1.55,.4);ball(head,p.body,0,0,0,.19,.2,.22);eyes(head,p,.12,.06,.16,.035);
  if(bat)for(const side of[-1,1])cone(head,p.body,side*.15,.26,-.03,.12,.4);else cone(head,p.trim,0,-.03,.31,.08,.3).rotation.x=Math.PI/2;
  for(const side of[-1,1]){const wing=joint('wing',side*.18,1.4,0);ball(wing,bat?p.cloth:p.body,side*.68,0,-.1,.75,.035,.42);beam(wing,p.dark,[0,0,0],[side*1.35,0,-.08],.025);for(let i=0;i<5;i++){const x=side*(.3+i*.21);if(bat)beam(wing,p.trim,[0,0,.08],[x,0,-.5],.017);else ball(wing,p.dark,x,-.01,-.35,.09,.03,.32);}wings.push(wing);leg(side*.12,1,-.12,.03);}
  const tail=joint('tail',0,1.24,-.42);ball(tail,p.dark,0,0,-.22,.21,.035,.35);tails.push(tail);
 }else if(['lizard','crocodile'].includes(model)){
  const croc=model==='crocodile';ball(body,p.body,0,.4,0,croc?.43:.29,.25,croc?.95:.62);head=joint('head',0,.43,croc?.95:.6);ball(head,p.body,0,0,.25,croc?.3:.2,.17,croc?.58:.3);ball(head,p.light,0,-.1,.32,croc?.26:.17,.07,croc?.5:.26);eyes(head,p,croc?.21:.14,.14,.24,.04);
  for(const side of[-1,1])for(const z of[-.5,.45]){leg(side*(croc?.45:.3),.3,z,.07);}
  for(let i=0;i<7;i++)rock(body,p.stone,0,.61,-.6+i*.2,.14,.12,.13);
  const tail=joint('tail',0,.38,croc?-.9:-.6);for(let i=0;i<7;i++)ball(tail,p.body,Math.sin(i*.3)*.1,0,-i*.18,.2-i*.024,.16-i*.018,.23);tails.push(tail);
 }else if(model==='fish'){
  body.position.y=1;ball(body,p.body,0,0,0,.19,.4,.7);ball(body,p.light,0,-.13,.2,.17,.18,.42);head=joint('head',0,.02,.52);ball(head,p.body,0,0,.1,.18,.26,.24);eyes(head,p,.15,.08,.21,.04);
  const tail=joint('tail',0,0,-.62);ball(tail,p.cloth,0,0,-.3,.035,.4,.35);tails.push(tail);for(const side of[-1,1]){const fin=joint('fin',side*.14,-.03,.08);ball(fin,p.trim,side*.22,0,-.15,.28,.025,.22);wings.push(fin);}ball(body,p.trim,0,.35,-.12,.035,.26,.32);
 }else if(model==='jelly'){
  body.position.y=1.5;ball(body,p.cloth,0,0,0,.58,.35,.58);ball(body,p.glow,0,-.03,0,.23,.2,.23,{glow:true});
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,n=joint('tentacle',Math.cos(a)*.36,-.2,Math.sin(a)*.36);for(let j=0;j<4;j++)beam(n,p.light,[Math.sin(j)*.07,-j*.23,0],[Math.sin(j+1)*.07,-(j+1)*.23,0],.025);tails.push(n);}
 }else if(model==='spider'||model==='centipede'){
  const spider=model==='spider',segments=spider?2:9;for(let i=0;i<segments;i++)ball(body,i%2?p.dark:p.body,0,.37,-i*.17,spider?(i?.4:.27):.2,spider?.27:.16,spider?.38:.18);
  head=joint('head',0,.4,.26);ball(head,p.body,0,0,0,.22,.17,.2);eyes(head,p,.13,.05,.14,.035);
  for(const side of[-1,1])for(let i=0;i<(spider?4:9);i++){const leg=joint('leg',side*(spider?.22:.14),.35,-i*(spider?.16:.17));beam(leg,p.dark,[0,0,0],[side*(spider?.5:.23),.12,.04],.035);beam(leg,p.body,[side*(spider?.5:.23),.12,.04],[side*(spider?.66:.32),-.32,.14],.025);legs.push(leg);}
  for(const side of[-1,1])beam(head,p.trim,[side*.1,.1,.1],[side*.26,.3,.3],.02);
 }else if(model==='snail'){
  ball(body,p.body,0,.16,0,.3,.14,.8);ball(body,p.stone,0,.62,-.15,.48,.52,.52);for(let i=0;i<10;i++){const a=i*.65,r=.34-i*.024;ball(body,p.trim,.44,.62+Math.sin(a)*r,-.15+Math.cos(a)*r,.045,.07,.07);}
  head=joint('head',0,.25,.6);ball(head,p.body,0,0,.12,.21,.16,.25);for(const side of[-1,1]){beam(head,p.body,[side*.12,.05,.12],[side*.23,.43,.23],.03);ball(head,p.glow,side*.23,.44,.24,.055);}
 }else if(model==='elemental'){
  rock(body,p.stone,0,1.1,0,.48,.67,.36);rock(body,p.glow,0,1.35,.3,.18,.25,.12,{glow:true});head=joint('head',0,2.02,0);rock(head,p.stone,0,0,0,.3,.32,.3);eyes(head,p,.13,.04,.27,.04);
  for(const side of[-1,1]){leg(side*.27,.6,0,.15);const arm=joint('arm',side*.58,1.56,0);rock(arm,p.stone,0,-.15,0,.2,.4,.22);rock(arm,p.body,0,-.62,.12,.22,.22,.25);wings.push(arm);}
 }
 return {root,joints,animate(t,state){
  const {phase,move,attack}=creatureCycle(t,state),swimmer=model==='fish',jelly=model==='jelly',flier=['bat','eagle'].includes(model),crawler=['spider','centipede','lizard','crocodile','snail'].includes(model);
  if(jelly){body.scale.y*=1+Math.sin(phase)*.07;body.scale.x*=1-Math.sin(phase)*.035;body.scale.z*=1-Math.sin(phase)*.035;body.position.y+=Math.sin(phase)*.035;}
  else if(flier)body.position.y+=Math.sin(phase)*.03;
  else if(!swimmer&&!crawler)body.position.y+=(1-Math.cos(phase*(model==='hare'?1:2)))*(model==='hare'?.07:.012)*move+Math.sin(phase)*.006*(1-move);
  legs.forEach((n,i)=>{if(flier)return;const offset=model==='hare'?(i%2?Math.PI:0):gaitOffset(n,i,legs.length),wave=Math.sin(phase+offset);n.rotation.x+=wave*(crawler?.18:.4)*move;if(['spider','centipede'].includes(model))n.rotation.z+=wave*.12*move;});
  wings.forEach((n,i)=>{if(flier)n.rotation.z+=(i%2?1:-1)*Math.sin(phase*(model==='bat'?3:1))*.36;else if(swimmer)n.rotation.z+=(i%2?1:-1)*Math.sin(phase)*.1;else n.rotation.x+=Math.sin(phase+i*Math.PI)*.2*move-attack*.6;});
  tails.forEach((n,i)=>{n.rotation.y+=Math.sin(phase-i*.35)*(swimmer?.35:jelly?.12:.1)*(move||.25);});
  if(model==='snail'){body.scale.z*=1+Math.sin(phase)*.02*move;if(head)head.position.z+=Math.sin(phase)*.035*move;}
  if(head){head.rotation.y+=Math.sin(phase)*.025*(1-move);head.rotation.x-=attack*.25;}body.position.z+=attack*.12;
 }};

}
// Adaptations change geometry as well as color. They are attached to animated
// body/head nodes and participate in the same GLB export rig as the base animal.
export function adaptCreature(model,def,p){
 const body=model.joints[0],head=model.joints.find(n=>n.name==='head')||body;
 let top=0;body.traverse(n=>{if(n.isMesh){n.geometry.computeBoundingBox();const b=n.geometry.boundingBox;top=Math.max(top,n.position.y+b.max.y*n.scale.y);}});
 const crown=Math.max(.35,Math.min(top,2.6)),a=def.adaptation;
 for(const side of[-1,1]){
  if(['horns','tufts','ears'].includes(a)){const n=cone(head,a==='horns'?p.trim:p.body,side*.19,.34,-.05,a==='ears'?.09:.055,a==='ears'?.5:.24);n.rotation.z=-side*.2;}
  if(a==='fins')ball(body,p.cloth,side*.38,crown*.6,-.1,.3,.025,.35).rotation.z=side*.3;
  if(a==='mane')for(let i=0;i<4;i++)cone(body,p.dark,side*.25,crown*.72,.18-i*.16,.1,.32).rotation.z=side*.6;
 }
 for(let i=0;i<4;i++){
  const z=-.45+i*.25,y=crown-.1;
  if(['crystals','spines','sail'].includes(a)){const n=cone(body,a==='crystals'?p.glow:p.trim,0,y,z,a==='sail'?.16:.07,a==='sail'?.5:.25+(i%2)*.14);n.scale.z=a==='sail'?1.4:1;}
  if(a==='plates')rock(body,p.stone,0,y-.06,z,.29,.08,.2);
  if(['flowers','spores'].includes(a)){const x=(i%2?1:-1)*.2;beam(body,p.wood,[x,y-.1,z],[x,y+.14,z],.018);ball(body,a==='spores'?p.cloth:p.glow,x,y+.15,z,.14,.055,.14);}
  if(a==='roots')beam(body,p.wood,[-.25,y-.12,z],[.3,y+.12,z+.1],.045);
  if(a==='feathers')for(const side of[-1,1])ball(body,p.light,side*.23,y-.15,z,.045,.04,.24).rotation.z=side*.3;
  if(a==='glow')ball(body,p.glow,(i%2?1:-1)*.26,y-.18,z,.07,.08,.1,{glow:true});
 }
 model.root.scale.setScalar(def.size||1);return model;
}
