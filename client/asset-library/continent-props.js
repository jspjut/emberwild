import {group,box,ball,rock,cylinder,cone,beam,ring} from './primitives.js';
export function continentProp(def,p){const root=group(null,def.id),joints=[],colliders=[];
 const solid=(x,y,z,width,height,depth)=>colliders.push({x,y,z,width,height,depth});
 switch(def.model){
 case 'skiff':box(root,p.wood,0,.25,0,1.7,.3,2.8);for(const side of[-1,1]){beam(root,p.metal,[side*.7,.4,-.8],[side*.7,2.8,-.8],.04);box(root,p.cloth,side*1.35,2.8,0,2.7,.08,1.8);}box(root,p.glow,0,.1,0,.5,.1,2);break;
 case 'basalt':for(let i=0;i<7;i++){const x=Math.sin(i*2.4)*.7,z=Math.cos(i*2.4)*.7,h=1.2+i*.3;cylinder(root,p.stone,x,h/2,z,.3,h);solid(x,h/2,z,.6,h,.6);}break;
 case 'reefarch':for(const side of[-1,1])for(let i=0;i<5;i++){const x=side*(1.2-i*.12),y=.3+i*.5;rock(root,p.stone,x,y,0,.3,.4,.3);beam(root,p.trim,[x,y,0],[x+side*.25,y+.3,.15],.05);solid(x,y,0,.6,.8,.6);}beam(root,p.light,[-.75,2.6,0],[.75,2.6,0],.25);solid(0,2.6,0,1.8,.5,.5);break;
 case 'rootbuttress':cylinder(root,p.wood,0,1.7,0,.4,3.4);solid(0,1.7,0,.8,3.4,.8);for(let i=0;i<5;i++){const a=i*1.256;beam(root,p.wood,[0,1.7,0],[Math.sin(a)*1.8,.12,Math.cos(a)*1.8],.18);}break;
 case 'iceshard':for(let i=0;i<3;i++){const n=cone(root,p.glow,(i-1)*.45,1+i*.25,0,.5,2+i*.5);n.rotation.z=(i-1)*.12;solid((i-1)*.45,1,0,.7,2,.7);}break;
 case 'sporeshelf':cylinder(root,p.light,0,1.1,0,.15,2.2);for(let i=0;i<3;i++){const n=group(root,`shelf_${i}`,(i%2?1:-1)*.35,.8+i*.6,0);joints.push(n);ball(n,p.cloth,0,0,0,.75,.15,.6);ball(n,p.glow,0,-.07,0,.6,.06,.5);}solid(0,1.1,0,.3,2.2,.3);break;
 case 'orrery':for(const side of[-1,1]){box(root,p.stone,side*1.1,.8,0,.3,1.6,.4);solid(side*1.1,.8,0,.3,1.6,.4);}for(let i=0;i<2;i++){const r=ring(root,p.metal,0,1.6,0,1.1);r.rotation.y=i*.8;r.rotation.z=i*.5;joints.push(r);}break;
 case 'coralfan':for(let i=0;i<7;i++){const a=(i/6-.5)*2;beam(root,p.body,[0,0,0],[Math.sin(a)*1.2,1.2+Math.cos(a)*.6,0],.05);for(const side of[-1,1])beam(root,p.trim,[Math.sin(a)*.8,1,0],[Math.sin(a)*1.2+side*.2,1.6,0],.025);}break;
 case 'clockpillar':box(root,p.stone,0,1.1,0,.8,2.2,.7);ring(root,p.metal,0,1.6,.4,.5);beam(root,p.dark,[0,1.6,.42],[.2,1.9,.42],.035);solid(0,1.1,0,.8,2.2,.7);break;
 }
 return {root,joints,colliders,animate(t){joints.forEach((j,i)=>j.rotation.z+=(Math.sin(t+i)-Math.sin(i))*.03);}};
}
