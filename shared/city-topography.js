// Shared smooth terraces: high civic ground, archive rise, garden banks and low quays.
const smooth=x=>{const t=Math.max(0,Math.min(1,x));return t*t*t*(t*(t*6-15)+10);};
const rise=(x,z,cx,cz,rx,rz,h)=>h*(1-smooth((Math.hypot((x-cx)/rx,(z-cz)/rz)-.3)/1.1));
export function cityBaseHeight(x,z){
 const river=Math.abs(x-1162),bed=.2-(1-smooth((river-7)/24))*1.7;
 return bed+rise(x,z,837,-16,205,180,17)+rise(x,z,665,-142,140,125,7)+rise(x,z,814,333,165,125,7)+rise(x,z,990,220,100,120,3);
}
export const APPROACH_PATH=[[272,132],[301,144],[333,150],[362,147],[390,142],[415,143],[442,147]];
export function arrivalBlend(x){return smooth((x-285)/165);}
