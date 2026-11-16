import {creatureCycle,gaitOffset} from './motion.js';
import {group,ball,cone,cylinder,beam,eyes} from './primitives.js';
export function continentCreature(def,p){
 const root=group(null,def.id),body=group(root,'body'),joints=[body],limbs=[],legs=[],wings=[],coils=[],shells=[],claws=[];let head=group(body,'head',0,1.2,.8);joints.push(head);
 const limb=(name,x,y,z)=>{const n=group(body,name,x,y,z);joints.push(n);limbs.push(n);if(name.startsWith('leg'))legs.push(n);else if(name.startsWith('wing'))wings.push(n);else if(name.startsWith('coil'))coils.push(n);else if(name.startsWith('shell'))shells.push(n);else if(name.startsWith('claw'))claws.push(n);return n;};
 if(def.model==='mammoth'){
  ball(body,p.body,0,1.45,0,.8,1,1.35);ball(head,p.body,0,.35,.3,.6,.65,.6);eyes(head,p,.38,.55,.7,.07);
  for(let i=0;i<4;i++)ball(head,p.body,Math.sin(i*.3)*.1,.1-i*.24,.7+i*.12,.17-i*.02,.24,.18);
  for(const side of [-1,1]){beam(head,p.light,[side*.32,.1,.5],[side*.55,-.25,1.1],.09);cone(head,p.light,side*.55,-.12,1.1,.09,.35);for(const z of [-.8,0,.8]){const leg=limb(`leg_${side}_${z}`,side*.6,.8,z);cylinder(leg,p.dark,0,-.35,0,.19,.9);}}
 }else if(def.model==='wyvern'||def.model==='ray'){
  const ray=def.model==='ray';ball(body,p.body,0,ray?1:1.3,0,.38,.3,1);head.position.set(0,ray?1:1.5,.9);ball(head,p.light,0,0,.2,.22,.16,.45);eyes(head,p,.14,.08,.4,.04);
  for(const side of [-1,1]){const wing=limb(`wing_${side}`,side*.25,ray?1:1.35,0);ball(wing,p.cloth,side*.9,0,-.15,1.2,.1,.75);beam(wing,p.trim,[0,0,.3],[side*1.9,0,-.4],.045);if(!ray){const leg=limb(`leg_${side}`,side*.23,1,-.5);cylinder(leg,p.dark,0,-.5,0,.08,1);}}
  const tail=limb('tail',0,ray?1:1.2,-.9);for(let i=0;i<5;i++)ball(tail,p.body,0,0,-i*.3,.12-i*.018,.1,.26);
 }else if(def.model==='serpent'){
  for(let i=0;i<10;i++){const n=limb(`coil_${i}`,Math.sin(-i*.65)*.18,.22+i*.025,-i*.24);ball(n,p.body,0,0,0,.23-i*.012,.22-i*.01,.26);}
  head.position.set(0,.55,.35);ball(head,p.body,0,0,.1,.34,.23,.4);eyes(head,p,.21,.13,.36,.045);for(const side of [-1,1])cone(head,p.trim,side*.28,.3,-.1,.14,.5).rotation.z=side*-.5;
 }else{
  const scorpion=def.model==='scorpion';ball(body,p.body,0,.55,0,.55,.4,.75);head.position.set(0,.5,.65);ball(head,p.dark,0,0,0,.28,.2,.24);eyes(head,p,.17,.09,.19,.035);
  for(const side of [-1,1])for(let i=0;i<(scorpion?4:3);i++){const leg=limb(`leg_${side}_${i}`,side*.4,.45,-.5+i*.3);beam(leg,p.body,[0,0,0],[side*.5,-.15,.12],.06);beam(leg,p.dark,[side*.5,-.15,.12],[side*.65,-.4,.2],.04);}
  if(scorpion){for(const side of [-1,1]){const claw=limb(`claw_${side}`,side*.4,.45,.65);ball(claw,p.body,side*.2,0,.3,.24,.14,.3);for(const j of[-1,1])cone(claw,p.trim,side*.2+j*.12,0,.6,.08,.3).rotation.x=Math.PI/2;}
   const tail=limb('tail',0,.7,-.6);for(let i=0;i<5;i++)ball(tail,p.body,0,i*.23,-Math.sin(i*.5)*.45,.14-i*.015);cone(tail,p.trim,0,1,-.3,.1,.35).rotation.x=.7;
  }else{for(const side of[-1,1]){const shell=limb(`shell_${side}`,side*.27,.8,-.1);ball(shell,p.stone,0,0,0,.3,.18,.65);beam(head,p.trim,[side*.12,.1,.1],[side*.28,.4,.4],.025);}}
 }
 return {root,joints,animate(t,state){
  const {phase,move,attack}=creatureCycle(t,state),serpent=def.model==='serpent',flying=['ray','wyvern'].includes(def.model);
  if(serpent){
   // A lateral traveling wave, not a row of rotating legs. Adjacent segments
   // stay joined while the wave moves from the head toward the tail.
   const amplitude=move?.24:.035;
   coils.forEach((n,i)=>{n.position.x=Math.sin(phase-i*.65)*amplitude;n.rotation.y=Math.cos(phase-i*.65)*amplitude*.7;});
   head.position.x=Math.sin(phase+.35)*amplitude;head.rotation.y+=Math.cos(phase+.35)*amplitude*.7;head.position.z+=attack*.22;
  }else{
   if(!flying)body.position.y+=Math.sin(phase)*.008*(1-move)+move*(1-Math.cos(phase*2))*.012;
   else body.position.y+=Math.sin(phase)*.035;
   legs.forEach((n,i)=>{n.rotation.x+=Math.sin(phase+gaitOffset(n,i,legs.length))*.36*move;});
   wings.forEach((n,i)=>{n.rotation.z+=(i%2?-1:1)*Math.sin(phase*(def.model==='wyvern'?2:1))*(def.model==='ray'?.2:.38);});
   const tail=limbs.find(n=>!legs.includes(n)&&!wings.includes(n)&&!coils.includes(n)&&!shells.includes(n)&&!claws.includes(n));
   if(tail)tail.rotation.y+=Math.sin(phase-.6)*.08*(move||.3);
   claws.forEach(n=>n.rotation.x-=attack*.35);
   head.rotation.x-=attack*.25;head.rotation.y+=Math.sin(phase)*.025*(1-move);body.position.z+=attack*.12;
  }
 }};
}
