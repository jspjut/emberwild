// All procedural clips use exact periods, including their idle secondary motion.
export function creatureCycle(time,state){
 const duration=state==='walk'?1:state==='attack'?1.2:4;
 const phase=time/duration*Math.PI*2;
 return {phase,idle:Math.sin(phase),move:state==='walk'?1:0,attack:state==='attack'?(1-Math.cos(phase))/2:0};
}
export function gaitOffset(node,index,total){
 // Diagonal pairs for four legs; alternating metachronal waves for many legs.
 if(total===4)return [0,Math.PI,Math.PI,0][index];
 if(total===2)return index*Math.PI;
 const side=node.position.x<0?0:Math.PI;
 return side+Math.round(-node.position.z/.2)*Math.PI*.65;
}
