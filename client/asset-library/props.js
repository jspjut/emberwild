import {continentProp} from './continent-props.js';
import * as THREE from 'three';
import {group,shape,mat,box,ball,rock,cylinder,cone,beam,leaf,ring} from './primitives.js';
export function propAsset(def,p,region){
 if(['skiff','basalt','reefarch','rootbuttress','iceshard','sporeshelf','orrery','coralfan','clockpillar'].includes(def.model))return continentProp(def,p);
  const root=group(null,def.id),joints=[],colliders=[];
  const solid=(x,y,z,width,height,depth,support=false)=>colliders.push({type:'box',x,y,z,width,height,depth,support});
  const moving=(name,x=0,y=0,z=0)=>{const g=group(root,name,x,y,z);joints.push(g);return g;};
  const cloth=(parent,points,color)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.computeVertexNormals();const material=mat(color).clone();material.side=THREE.DoubleSide;material.userData.libraryOwned=true;const m=new THREE.Mesh(g,material);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
  const roof=(parent,y,width,depth)=>{for(const side of[-1,1])cloth(parent,[[0,y+.55,-depth/2],[side*width/2,y,-depth/2],[side*width/2,y,depth/2],[0,y+.55,-depth/2],[side*width/2,y,depth/2],[0,y+.55,depth/2]],p.wood);};
  const stones=(radius,y,count=10)=>{for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const s=rock(root,p.stone,Math.sin(a)*radius,y,Math.cos(a)*radius,.23,.17,.18);s.rotation.y=a;}};
  if(['broadleaf','pine','willow','deadwood'].includes(def.model)){
    const pine=def.model==='pine',willow=def.model==='willow',dead=def.model==='deadwood',height=pine?4.8:3.9;
    cylinder(root,p.wood,0,height*.33,0,.17,height*.66);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;beam(root,p.dark,[0,.32,0],[Math.sin(a)*.52,.06,Math.cos(a)*.52],.09);}
    for(const side of[-1,1])beam(root,p.wood,[0,1.75,0],[side*.85,2.8,-.12],.105);
    const crown=moving('crown',0,pine?1.65:2.25,0);
    if(pine){for(let i=0;i<4;i++){const m=cone(crown,i%2?p.leaf:p.dark,0,.4+i*.7,0,1.17-i*.22,1.45);m.rotation.y=i*.9;if(region==='frostfell')cone(crown,p.light,0,.69+i*.7,0,.84-i*.16,.95);}}
    else if(dead){for(let i=0;i<4;i++){const side=i%2?1:-1;beam(root,p.wood,[0,1.3+i*.38,0],[side*(.65+i*.08),1.5+i*.42,-.16],.08);beam(root,p.dark,[side*.5,1.5+i*.42,-.16],[side*.72,1.9+i*.42,-.25],.045);}cone(crown,p.wood,0,.15,0,.16,1.2);}
    else{for(let i=0;i<7;i++){const a=i/7*Math.PI*2,x=Math.sin(a)*.8,z=Math.cos(a)*.7,y=.5+(i%3)*.28;beam(root,p.wood,[0,1.9,0],[x,2.5+y,z],.06);rock(crown,p.leaf,x,y,z,willow?.75:.85,willow?.5:.72,.8);if(willow)for(let j=0;j<3;j++){const b=ball(crown,j%2?p.dark:p.leaf,x+(j-1)*.27,y-.65-j*.11,z,.17,.83,.22);b.rotation.z=x*.12;}}}
    solid(0,1.3,0,.34,2.6,.34);
  }else if(def.model==='arch'){
    for(const side of[-1,1]){for(let i=0;i<5;i++){const m=box(root,i%2?p.stone:p.light,side*1.1,.26+i*.5,0,.65,.48,.7);m.rotation.y=(i%2?1:-1)*.025;}solid(side*1.1,1.25,0,.65,2.5,.7);}
    for(let i=0;i<5;i++){const a=i/4*Math.PI;const x=Math.cos(a)*1.1,y=2.5+Math.sin(a)*.75,m=box(root,p.stone,x,y,0,.56,.5,.7);m.rotation.z=a-Math.PI/2;}solid(0,3.03,0,1.6,.45,.7);
    for(const side of[-1,1])rock(root,p.dark,side*.95,.1,.55,.32,.15,.22);
  }else if(def.model==='runestone'){
    rock(root,p.stone,0,1,0,.54,1.05,.34).rotation.z=.12;rock(root,p.dark,0,.12,0,.65,.18,.46);
    for(let i=0;i<4;i++){const glyph=box(root,p.glow,.03+i*.03,.57+i*.29,.3,.2,.04,.02,{glow:true});glyph.rotation.z=i%2?.7:-.7;}solid(0,1,0,.8,2,.55);
  }else if(def.model==='crystal'){
    rock(root,p.stone,0,.13,0,.75,.19,.57);for(let i=0;i<6;i++){const a=i*2.4,r=i?.35:0;const crystal=group(root,`crystal_${i}`,Math.cos(a)*r,.13,Math.sin(a)*r);crystal.rotation.z=Math.sin(a)*.22;const h=i?.5+(i%3)*.24:1.4;cylinder(crystal,p.glow,0,h*.38,0,.13,h*.76,{glow:true});cone(crystal,p.light,0,h*.88,0,.13,h*.24,{glow:true});}solid(0,.45,0,1.1,.9,.9);
  }else if(def.model==='ore'){
    rock(root,p.stone,0,.43,0,.8,.55,.56);rock(root,p.dark,.46,.28,.2,.37,.32,.3);for(let i=0;i<5;i++){const v=box(root,p.metal,-.4+i*.2,.66+(i%2)*.1,.32,.08,.25,.07,{metal:true});v.rotation.z=.5;}solid(0,.43,0,1.5,.86,1);
  }else if(def.model==='herb'){
    const stems=moving('stems');for(let i=0;i<7;i++){const a=i*2.4,r=.08+i*.04,x=Math.cos(a)*r,z=Math.sin(a)*r,h=.24+(i%3)*.1;beam(stems,p.dark,[x,0,z],[x,h,z],.012);for(const side of[-1,1]){const l=leaf(stems,p.leaf,x+side*.09,h*.6,z,1.1);l.rotation.z=side*.6;}ball(stems,p.trim,x,h,z,.055,.045,.06);for(let j=0;j<4;j++)ball(stems,p.light,x+Math.cos(j*1.57)*.05,h,z+Math.sin(j*1.57)*.05,.032,.018,.035);}
  }else if(def.model==='mushroom'){
    for(const[x,z,s]of[[0,0,1],[-.35,.22,.6],[.4,.1,.75]]){const cap=moving(`cap_${joints.length}`,x,.52*s,z);cylinder(root,p.light,x,.28*s,z,.07*s,.56*s);shape(cap,'ball',p.cloth,0,0,0,.35*s,.16*s,.35*s);cylinder(cap,p.glow,0,-.07*s,0,.27*s,.035*s,{glow:true});for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ball(cap,p.light,Math.cos(a)*.2*s,.12*s,Math.sin(a)*.2*s,.045*s,.012*s,.045*s);}}
  }else if(def.model==='reeds'){
    const reeds=moving('reeds');for(let i=0;i<12;i++){const a=i*2.4,x=Math.cos(a)*(.1+i*.025),z=Math.sin(a)*(.1+i*.025),h=.8+(i%4)*.15;beam(reeds,p.leaf,[x,0,z],[x+.08,h,z],.012);ball(reeds,p.wood,x+.08,h+.08,z,.035,.14,.035);const l=leaf(reeds,p.leaf,x,.4,z,1.6);l.rotation.x=-1.05;l.rotation.z=a;}
  }else if(def.model==='logs'){
    for(const[x,y]of[[-.28,.22],[.28,.22],[0,.67]]){const log=cylinder(root,p.wood,x,y,0,.25,1.8);log.rotation.x=Math.PI/2;for(const z of[-.91,.91]){const cut=cylinder(root,p.light,x,y,z,.225,.015);cut.rotation.x=Math.PI/2;for(const r of[.1,.17])ring(root,p.dark,x,y,z+Math.sign(z)*.009,r);}}for(const z of[-.5,.5]){const rope=ring(root,p.trim,0,.43,z,.59);rope.scale.x=.95;rope.scale.y=.8;}solid(0,.445,0,1.06,.95,1.8,true);
  }else if(def.model==='crates'){
    for(const[x,y,z,s]of[[0,.45,0,.9],[.2,1.16,0,.52]]){box(root,p.wood,x,y,z,s,s,s);for(const side of[-1,1]){for(let i=-1;i<=1;i++)box(root,p.dark,x+i*s*.25,y,z+side*s*.505,.015,s,.015);for(const edge of[-1,1]){box(root,p.trim,x+edge*s*.44,y,z+side*s*.52,s*.12,s*1.02,.045);box(root,p.trim,x,y+edge*s*.44,z+side*s*.52,s,s*.12,.045);}const brace=box(root,p.light,x,y,z+side*s*.54,s*.11,s*1.08,.035);brace.rotation.z=.65;}solid(x,y,z,s,s,s,true);}
  }else if(def.model==='barrel'){
    const points=[new THREE.Vector2(.37,0),new THREE.Vector2(.47,.23),new THREE.Vector2(.5,.62),new THREE.Vector2(.46,1),new THREE.Vector2(.37,1.16)];const barrel=new THREE.Mesh(new THREE.LatheGeometry(points,14),mat(p.wood));barrel.geometry.computeVertexNormals();barrel.castShadow=barrel.receiveShadow=true;root.add(barrel);for(const[y,r]of[[.1,.42],[.58,.51],[1.05,.42]])ring(root,p.metal,0,y,0,r,Math.PI/2);cylinder(root,p.light,0,1.15,0,.37,.035);cylinder(root,p.dark,0,.025,0,.37,.05);for(let i=0;i<10;i++){const a=i/10*Math.PI*2;beam(root,p.dark,[Math.cos(a)*.38,.08,Math.sin(a)*.38],[Math.cos(a)*.45,1.05,Math.sin(a)*.45],.008);}solid(0,.58,0,.95,1.16,.95,true);
  }else if(def.model==='cart'){
    for(let i=0;i<6;i++)box(root,p.wood,-.45+i*.18,.68,0,.17,.1,1.5);for(const side of[-1,1]){for(let i=0;i<3;i++)box(root,p.wood,side*.55,.8+i*.19,0,.08,.13,1.5);beam(root,p.dark,[side*.42,.58,-.5],[side*.42,.58,2],.055);cylinder(root,p.dark,side*.7,.46,-.12,.085,.14).rotation.z=Math.PI/2;const wheel=ring(root,p.dark,side*.68,.46,-.12,.4);wheel.rotation.y=Math.PI/2;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;beam(root,p.trim,[side*.68,.46,-.12],[side*.68,.46+Math.cos(a)*.38,-.12+Math.sin(a)*.38],.018);}solid(side*.55,1,0,.08,.6,1.5);}solid(0,.68,0,1.1,.1,1.5,true);
  }else if(def.model==='stall'){
    for(const x of[-1,1])for(const z of[-.6,.6]){cylinder(root,p.wood,x,1.25,z,.045,2.5);solid(x,1.25,z,.09,2.5,.09);}box(root,p.wood,0,1,0,2.1,.12,1.25);solid(0,.98,0,2.1,.15,1.25,true);for(const side of[-1,1])for(let i=0;i<6;i++){const x=-1.2+i*.4;cloth(root,[[x,2.62,0],[x+.4,2.62,0],[x+.4,2.28,side*.85],[x,2.62,0],[x+.4,2.28,side*.85],[x,2.28,side*.85]],i%2?p.cloth:p.light);}for(let i=0;i<5;i++)ball(root,i%2?p.trim:p.body,-.7+i*.32,1.19,.05,.13,.14,.13);
  }else if(def.model==='lantern'){
    beam(root,p.wood,[0,0,0],[0,2.6,0],.075);beam(root,p.wood,[0,2.57,0],[.65,2.57,0],.06);beam(root,p.dark,[0,2.05,0],[.47,2.57,0],.04);const lamp=moving('lantern',.61,2.37,0);beam(lamp,p.metal,[0,.2,0],[0,-.05,0],.02);box(lamp,p.glow,0,-.32,0,.27,.42,.27,{glow:true});cone(lamp,p.dark,0,-.05,0,.27,.2);box(lamp,p.metal,0,-.57,0,.34,.055,.34);for(const x of[-.15,.15])for(const z of[-.15,.15])beam(lamp,p.dark,[x,-.1,z],[x,-.57,z],.016);solid(0,1.3,0,.15,2.6,.15);
  }else if(def.model==='sign'){
    cylinder(root,p.wood,0,1.05,0,.065,2.1);for(const[i,side]of[[0,1],[1,-1]]){const board=box(root,p.wood,side*.14,1.5+i*.35,0,1,.24,.08);board.rotation.z=side*.07;cone(root,p.trim,side*.69,1.5+i*.35,0,.17,.28).rotation.z=side*-Math.PI/2;for(const x of[-.2,.1])box(root,p.light,x+side*.14,1.5+i*.35,.05,.13,.025,.015);}rock(root,p.stone,0,.1,0,.3,.13,.25);solid(0,1.05,0,.13,2.1,.13);
  }else if(def.model==='bench'){
    for(const x of[-.65,.65])for(const z of[-.2,.2])box(root,p.dark,x,.3,z,.1,.6,.1);for(const z of[-.18,0,.18])box(root,p.wood,0,.62,z,1.65,.09,.16);for(const x of[-.7,.7])box(root,p.dark,x,.75,-.28,.08,.7,.08);for(const y of[.88,1.07])box(root,p.wood,0,y,-.29,1.65,.15,.07);solid(0,.59,0,1.65,.15,.52,true);solid(0,.94,-.29,1.65,.42,.08);
  }else if(def.model==='well'){
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const block=box(root,i%2?p.stone:p.light,Math.sin(a)*.64,.36,Math.cos(a)*.64,.32,.7,.29);block.rotation.y=a;solid(Math.sin(a)*.64,.36,Math.cos(a)*.64,.4,.7,.4,true);}cylinder(root,p.dark,0,.1,0,.5,.04);for(const side of[-1,1]){box(root,p.wood,side*.83,1.18,0,.12,2.36,.12);solid(side*.83,1.18,0,.12,2.36,.12);}roof(root,2.1,2.15,1.65);beam(root,p.wood,[-.9,1.55,0],[.9,1.55,0],.08);beam(root,p.trim,[0,1.57,.01],[0,.55,.01],.018);cylinder(root,p.wood,.98,.9,.1,.16,.3);ring(root,p.metal,.98,1.08,.1,.18);
  }else if(def.model==='bridge'){
    for(let i=0;i<14;i++)box(root,p.wood,0,.23,-2.05+i*.315,1.5,.12,.29);for(const side of[-1,1]){for(const z of[-2.15,2.15]){cylinder(root,p.dark,side*.84,.65,z,.07,1.3);solid(side*.84,.65,z,.14,1.3,.14);}for(const y of[.7,1.15])for(let j=0;j<8;j++){const z=-2.15+j*.5375,next=z+.5375;beam(root,p.trim,[side*.84,y-.15*Math.sin((z+2.15)/4.3*Math.PI),z],[side*.84,y-.15*Math.sin((next+2.15)/4.3*Math.PI),next],.024);}}solid(0,.23,0,1.5,.12,4.4,true);
  }else if(def.model==='tent'){
    for(const side of[-1,1]){cloth(root,[[0,1.85,-1.3],[side*1.2,0,-1.3],[side*1.2,0,1.3],[0,1.85,-1.3],[side*1.2,0,1.3],[0,1.85,1.3]],p.cloth);cloth(root,[[0,1.85,1.3],[side*1.2,0,1.3],[side*.65,0,1.3]],p.light);beam(root,p.wood,[0,0,side*1.25],[0,1.85,side*1.25],.04);for(const z of[-1.2,1.2]){beam(root,p.trim,[side*.85,.55,z],[side*1.6,.04,z],.012);cylinder(root,p.wood,side*1.6,.09,z,.025,.18);}}cloth(root,[[0,1.85,-1.3],[-1.2,0,-1.3],[1.2,0,-1.3]],p.cloth);box(root,p.dark,0,.05,0,1.2,.1,2);cylinder(root,p.light,-.35,.18,-.6,.14,.7).rotation.z=Math.PI/2;
  }
  return {root,joints,colliders,animate(time){joints.forEach((n,i)=>{n.rotation.z+=Math.sin(time*(def.model==='lantern'?1.5:1.05)+i*.7)*(def.model==='lantern'?.065:.025);n.rotation.x+=Math.sin(time*.8+i)*.012;});}};
}
