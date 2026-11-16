import {creatureCycle,gaitOffset} from './motion.js';
import {ECOLOGY_BODY_TYPES,ecologyCreature,adaptCreature} from './ecology-creatures.js';
import {continentCreature} from './continent-creatures.js';
import {group,box,ball,rock,cylinder,cone,beam,leaf,eyes} from './primitives.js';
const TAU=Math.PI*2;
export function creatureAsset(def,p,region){
 const model=baseCreatureAsset(def,p,region);return def.adaptation?adaptCreature(model,def,p):model;
}
function baseCreatureAsset(def,p,region){
 if(ECOLOGY_BODY_TYPES.includes(def.model))return ecologyCreature(def,p);
 if(['mammoth','wyvern','ray','scorpion','beetle','serpent'].includes(def.model))return continentCreature(def,p);
  const root=group(null,def.id),body=group(root,'body'),joints=[body],legs=[],wings=[],arms=[];let head,tail;
  const joint=(name,x,y,z,parent=body)=>{const n=group(parent,name,x,y,z);joints.push(n);return n;};
  const leg=(side,z,height,width=.085)=>{const n=joint(`leg_${legs.length}`,side,height,z);cylinder(n,p.dark,0,-height/2,0,width,height);ball(n,p.dark,0,-height+.055,.06,width*1.3,.07,width*1.9);legs.push(n);return n;};
  if(['fox','boar','stag'].includes(def.model)){
    const stag=def.model==='stag',boar=def.model==='boar',h=stag?1.42:boar?.82:.72,w=boar?.48:stag?.3:.27;
    ball(body,p.body,0,h,0,w,stag?.44:boar?.45:.3,stag?.7:boar?.75:.62);ball(body,p.light,0,h-.08,.4,w*.8,.24,.27);
    for(const side of[-1,1])for(const z of[-.43,.4])leg(side*w*.8,z,h-.22,stag?.07:boar?.12:.065);
    head=joint('head',0,stag?1.9:h+.2,stag?.63:.67);ball(head,p.body,0,0,0,boar?.32:.25,stag?.28:.23,.3);ball(head,p.light,0,-.09,.25,boar?.25:.15,.13,boar?.23:.22);ball(head,p.dark,0,-.055,.43,boar?.17:.07,.065,.04);eyes(head,p,boar?.22:.16,.07,.2,stag?.043:.045);
    for(const side of[-1,1]){const ear=cone(head,p.body,side*.2,.3,-.05,boar?.13:.115,boar?.23:.36);ear.rotation.z=side*-.35;const inner=cone(head,p.light,side*.2,.31,-.005,.068,boar?.14:.23);inner.rotation.z=side*-.35;
      if(boar){beam(head,p.light,[side*.23,-.16,.23],[side*.36,-.06,.36],.055);cone(head,p.light,side*.36,.02,.36,.055,.2).rotation.z=side*-.25;}
      if(stag){beam(head,p.wood,[side*.14,.23,-.03],[side*.36,.81,-.13],.04);beam(head,p.wood,[side*.3,.64,-.1],[side*.6,.83,-.04],.029);beam(head,p.wood,[side*.26,.54,-.09],[side*.17,.8,.12],.025);beam(head,p.trim,[side*.36,.78,-.13],[side*.39,1.02,-.16],.024);}
    }
    tail=joint('tail',0,h+.08,-.59);if(def.model==='fox'){ball(tail,p.body,0,.08,-.3,.2,.19,.48);ball(tail,p.light,0,.1,-.65,.16,.16,.18);}else if(stag)ball(tail,p.light,0,.02,-.13,.1,.13,.2);else{beam(tail,p.dark,[0,0,0],[0,.15,-.22],.035);ball(tail,p.dark,.06,.15,-.22,.065,.04,.05);for(let i=0;i<7;i++)cone(body,p.dark,0,h+.4,-.5+i*.15,.055,.2);}
  }else if(def.model==='owl'){
    ball(body,p.body,0,.83,0,.42,.59,.32);ball(body,p.light,0,.8,.22,.31,.43,.14);head=joint('head',0,1.37,.04);ball(head,p.body,0,0,0,.4,.34,.32);
    for(const side of[-1,1]){ball(head,p.light,side*.16,.01,.235,.19,.22,.1);ball(head,p.dark,side*.16,.03,.32,.095,.12,.05);ball(head,p.glow,side*.16,.04,.355,.055,.08,.025);ball(head,'#263033',side*.16,.04,.38,.025,.065,.01);const horn=cone(head,p.body,side*.27,.3,-.03,.105,.26);horn.rotation.z=side*-.45;const wing=joint(`wing_${side}`,side*.33,1.02,0);ball(wing,p.dark,side*.21,-.19,-.02,.23,.42,.14);for(let i=0;i<4;i++)ball(wing,p.body,side*(.14+i*.07),-.34-i*.02,.04,.07,.24,.08);wings.push(wing);leg(side*.17,.04,.22,.04);}
    cone(head,p.trim,0,-.13,.38,.09,.2).rotation.x=-.7;tail=joint('tail',0,.46,-.25);ball(tail,p.dark,0,-.06,-.12,.19,.16,.2);
  }else if(def.model==='frog'){
    ball(body,p.body,0,.39,0,.48,.31,.5);ball(body,p.light,0,.29,.27,.35,.22,.27);head=joint('head',0,.49,.34);ball(head,p.body,0,0,0,.43,.23,.25);
    for(const side of[-1,1]){ball(head,p.body,side*.27,.18,.04,.15,.14,.14);const rear=joint(`leg_${legs.length}`,side*.42,.24,-.27);ball(rear,p.dark,side*.04,.01,-.02,.22,.16,.25);beam(rear,p.body,[side*.12,-.02,-.16],[side*.15,-.17,.15],.08);ball(rear,p.light,side*.13,-.18,.26,.16,.04,.17);legs.push(rear);const front=joint(`leg_${legs.length}`,side*.36,.29,.29);beam(front,p.body,[0,0,0],[side*.1,-.23,.14],.06);ball(front,p.light,side*.09,-.23,.2,.13,.035,.12);legs.push(front);for(let j=0;j<3;j++)ball(body,p.dark,side*(.16+j*.09),.63-j*.035,-.15,.055,.018,.075);}
    eyes(head,p,.27,.22,.15,.055);
    box(head,p.dark,0,-.08,.238,.48,.015,.015);
  }else if(def.model==='tortoise'){
    ball(body,p.dark,0,.43,0,.56,.3,.7);ball(body,p.stone,0,.59,-.04,.61,.4,.72);
    for(let i=0;i<3;i++)for(let j=0;j<3;j++){const x=(i-1)*.32,z=(j-1)*.39;rock(body,i===1?p.trim:p.body,x,.86-Math.abs(x)*.3-Math.abs(z)*.15,z,.22,.095,.25);}
    for(const side of[-1,1])for(const z of[-.4,.4])leg(side*.48,z,.28,.12);
    head=joint('head',0,.45,.68);ball(head,p.body,0,0,.12,.19,.15,.25);eyes(head,p,.12,.045,.29,.033);tail=joint('tail',0,.38,-.66);cone(tail,p.body,0,0,-.13,.08,.34).rotation.x=-Math.PI/2;
  }else if(def.model==='moth'){
    body.position.y=1;ball(body,p.body,0,0,0,.12,.2,.4);ball(body,p.glow,0,-.05,-.28,.16,.17,.23,{glow:true});head=joint('head',0,.09,.36);ball(head,p.dark,0,0,0,.16);eyes(head,p,.1,.035,.1,.04);
    for(const side of[-1,1]){beam(head,p.dark,[side*.07,.1,0],[side*.2,.34,.16],.015);ball(head,p.trim,side*.2,.34,.16,.035);const wing=joint(`wing_${side}`,side*.06,.06,.05);const upper=ball(wing,p.cloth,side*.42,0,.2,.5,.035,.38);upper.rotation.y=side*-.25;const lower=ball(wing,p.trim,side*.34,-.015,-.3,.35,.028,.28);lower.rotation.y=side*.35;ball(wing,p.dark,side*.52,.04,.23,.16,.012,.16);ball(wing,p.glow,side*.52,.052,.23,.095,.012,.095,{glow:true});for(let j=0;j<3;j++)ball(wing,p.light,side*(.25+j*.16),.039,-.25,.03,.009,.04);wings.push(wing);}
  }else if(def.model==='wader'){
    ball(body,p.body,0,1.48,0,.29,.4,.48);ball(body,p.light,0,1.43,.24,.23,.3,.27);beam(body,p.light,[0,1.65,.2],[0,2.19,.28],.12);beam(body,p.light,[0,2.15,.27],[0,2.31,.49],.13);head=joint('head',0,2.32,.5);ball(head,p.body,0,0,0,.18,.16,.22);eyes(head,p,.135,.035,.1,.032);cone(head,p.trim,0,-.04,.4,.085,.54).rotation.x=Math.PI/2;
    for(const side of[-1,1]){const n=leg(side*.13,-.02,1.23,.03);box(n,p.trim,0,-1.18,.15,.14,.035,.3);const wing=joint(`wing_${side}`,side*.22,1.56,-.03);ball(wing,p.dark,side*.06,-.05,-.06,.12,.27,.34);wings.push(wing);}tail=joint('tail',0,1.5,-.37);cone(tail,p.dark,0,0,-.2,.18,.43).rotation.x=-Math.PI/2;
  }else if(def.model==='crab'){
    ball(body,p.body,0,.47,0,.55,.25,.4);rock(body,p.stone,0,.59,-.04,.4,.18,.3);head=joint('head',0,.54,.25);
    for(const side of[-1,1]){beam(head,p.dark,[side*.18,0,0],[side*.23,.23,.08],.035);ball(head,p.glow,side*.23,.24,.08,.055);for(let j=0;j<3;j++){const n=joint(`leg_${legs.length}`,side*.38,.4,.2-j*.22);beam(n,p.body,[0,0,0],[side*.36,-.04,-.06],.06);beam(n,p.dark,[side*.36,-.04,-.06],[side*.52,-.36,.06],.038);legs.push(n);}const claw=joint(`claw_${side}`,side*.4,.5,.3);beam(claw,p.body,[0,0,0],[side*.25,.02,.4],.11);ball(claw,p.body,side*.26,.06,.49,.19,.15,.2);const pinch=joint(`pincer_${side}`,side*.27,.06,.5,claw);cone(pinch,p.trim,side*.1,0,.14,.07,.25).rotation.x=Math.PI/2;cone(claw,p.trim,side*.16,.06,.65,.07,.28).rotation.x=Math.PI/2;arms.push(claw);wings.push(pinch);}
    for(let i=0;i<4;i++)cone(body,p.trim,-.24+i*.16,.76,-.06,.065,.15);
  }else if(def.model==='guardian'){
    cylinder(body,p.wood,0,1.52,0,.46,1.1);rock(body,p.stone,0,1.55,.1,.52,.56,.34);rock(body,p.glow,0,1.67,.4,.15,.22,.07,{glow:true});head=joint('head',0,2.41,0);rock(head,p.stone,0,0,0,.3,.32,.27);eyes(head,p,.13,.03,.23,.04);
    for(const side of[-1,1]){leg(side*.3,0,.94,.15);rock(body,p.stone,side*.32,.28,.1,.2,.23,.26);const arm=joint(`arm_${side}`,side*.57,1.96,0);beam(arm,p.wood,[0,0,0],[side*.2,-.94,.08],.16);rock(arm,p.stone,side*.2,-.98,.08,.23,.3,.24);rock(arm,p.body,0,0,0,.29,.26,.26);arms.push(arm);beam(head,p.wood,[side*.16,.2,-.06],[side*.43,.64,-.1],.055);beam(head,p.wood,[side*.32,.48,-.1],[side*.6,.57,.03],.04);for(let j=0;j<3;j++)leaf(arm,p.leaf,side*(.05+j*.12),.21,.03,1.3);}
  }
  if(region==='frostfell'&&['boar','tortoise','guardian'].includes(def.model))rock(body,p.light,0,def.model==='guardian'?2:1.02,-.18,.25,.065,.34);
  if(region==='emberwastes'&&['boar','tortoise','guardian'].includes(def.model))for(const side of[-1,1])rock(body,p.glow,side*.17,def.model==='guardian'?1.9:.88,-.15,.055,.14,.05,{glow:true});
  return {root,joints,animate(time,state){
    const {move,phase,attack}=creatureCycle(time,state),frog=def.model==='frog',moth=def.model==='moth',crab=def.model==='crab';
    body.position.y+=Math.sin(phase)*.008*(1-move)+(frog?(1-Math.cos(phase))*.12*move:(1-Math.cos(phase*2))*.012*move);body.position.z+=attack*.16;body.rotation.x-=attack*.16;
    legs.forEach((n,i)=>{const offset=frog?(i%2?Math.PI:0):gaitOffset(n,i,legs.length),wave=Math.sin(phase+offset);n.rotation.x+=wave*(frog?.38:crab?.15:.4)*move;if(crab)n.rotation.z+=wave*.12*move;});
    wings.forEach((n,i)=>{n.rotation.z+=(i%2?1:-1)*(moth?Math.sin(phase*4)*.45:crab?attack*.55:move?Math.sin(phase)*.45:Math.sin(phase)*.025);});
    arms.forEach((n,i)=>n.rotation.x+=Math.sin(phase+i*Math.PI)*.3*move-attack*.9);
    if(head){head.rotation.y+=Math.sin(phase)*.045*(1-move);head.rotation.x-=attack*.25;}if(tail)tail.rotation.y+=Math.sin(phase)*.12;
    if(moth)body.position.y+=Math.sin(phase)*.035;
  }};
}
