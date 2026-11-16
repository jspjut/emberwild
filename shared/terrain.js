import {nearestProvinceBoundary,divideSurface} from './province-boundaries.js';
import {continentHeight} from './continent.js';
import {isContinental,foundingDistance,FOUNDING_BOUNDS} from './continent-coast.js';
import {distanceToCoast} from './continent.js';
import {continentSurface} from './continent-buildings.js';
import {cityBaseHeight} from './city-topography.js';
import {REACH_WATERS,reachWaterRadius} from './reach-geography.js';
import {BUILDINGS} from './buildings.js';
import {introOriginal,INTRO_SCALE,ZONE_BOUNDS,HUB_PLACEMENTS,ZONE_EXITS,QUIET_POOL} from './zone-layout.js';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{const t=clamp(x);return t*t*t*(t*(t*6-15)+10);};
const smoothMin=(a,b,k=.6)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
const hill=(x,z,cx,cz,rx,rz,h)=>h*Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));
export const STREAM_LEVEL=-.65;
export const TERRAIN_SIZE=840,TERRAIN_SEGMENTS=1120;
export const streamX=z=>-51*INTRO_SCALE+Math.sin((32+(z-32)/INTRO_SCALE)*.065)*3*INTRO_SCALE;
export const poolRadius=(x,z)=>Math.hypot((x-QUIET_POOL.x)/QUIET_POOL.radiusX,(z-QUIET_POOL.z)/QUIET_POOL.radiusZ);
export function waterBounds(z){const center=streamX(z),dz=(z-QUIET_POOL.z)/QUIET_POOL.radiusZ,extent=Math.sqrt(Math.max(0,1-dz*dz))*QUIET_POOL.radiusX;return Math.abs(dz)<1?[Math.min(center-6.8,QUIET_POOL.x-extent),Math.max(center+6.8,QUIET_POOL.x+extent)]:[center-6.8,center+6.8];}
export const TERRAIN_FOUNDATIONS=BUILDINGS.filter(b=>!b.continent);
export const cityRiverX=1162;
export function heightAt(x,z){
 if(isContinental(x,z)){const t=Math.min(1,foundingDistance(x,z)/100),blend=t*t*(3-2*t),b=FOUNDING_BOUNDS;const land=foundingHeight(Math.max(b.minX,Math.min(b.maxX,x)),Math.max(b.minZ,Math.min(b.maxZ,z)))*(1-blend)+continentSurface(x,z)*blend,shore=Math.max(0,Math.min(1,(160-distanceToCoast(x,z))/160)),sea=shore*shore*(3-2*shore);return land*(1-sea)-5*sea;}
 return foundingHeight(x,z);
}
function foundingHeight(x,z){
 if(x>=370){for(const b of TERRAIN_FOUNDATIONS)if(b.capital&&Math.abs(x-b.x)<=b.width/2+.5&&Math.abs(z-b.z)<=b.depth/2+.5)return b.floorY;for(const b of TERRAIN_FOUNDATIONS)if(b.capital&&Math.abs(x-b.x)<=b.width/2+3&&Math.abs(z-b.z)<=b.depth/2+3)return b.floorY;let y=cityBaseHeight(x,z);for(const b of TERRAIN_FOUNDATIONS){if(!b.capital)continue;const dx=Math.max(0,Math.abs(x-b.x)-b.width/2-3),dz=Math.max(0,Math.abs(z-b.z)-b.depth/2-3),distance=Math.hypot(dx,dz);if(distance<24){const blend=1-smooth(distance/24);y=y*(1-blend)+b.floorY*blend;}}return y;}
 const original=introOriginal(x,z),a=original.x,b=original.z;
 let y=hill(a,b,-29,0,23,30,7.5)+hill(a,b,31,-5,25,33,10)+hill(a,b,-6,-47,47,31,11)+hill(a,b,2,4,17,21,3.4)+Math.sin(x*.035)*Math.cos(z*.03)*.35;
 // Broad ridges and shallow valleys give the enlarged region a readable shape.
 y+=hill(x,z,-180,105,55,110,8)+hill(x,z,180,240,60,100,6)+hill(x,z,-220,285,65,65,7)+hill(x,z,0,285,100,90,3);
 y+=hill(x,z,-325,120,30,220,12)+hill(x,z,325,120,30,220,9);
 const camp=1-smooth((Math.hypot(a,b-29)-14)/24);y=y*(1-camp)+.2*camp;
 const bank=Math.abs(x-streamX(z)),river=1-smooth((bank-3.5)/28),bed=STREAM_LEVEL-.55+smooth((bank-2)/7)*.85;y=y*(1-river)+bed*river;
 const radius=poolRadius(x,z);if(radius<3.2){const basin=1-smooth((radius-.9)/2.3),bottom=STREAM_LEVEL-.55+smooth((radius-.5)/.7);y=y*(1-basin)+smoothMin(y,bottom)*basin;}
 if(x>285)y=y*(1-smooth((x-285)/85))+cityBaseHeight(x,z)*smooth((x-285)/85);
 // The eastern fen is a soft basin, with a walkable rim and raised camp pads.
 const fen=hill(x,z,245,305,70,55,1);y=y*(1-fen*.7)-fen*.25;
 for(const pad of TERRAIN_FOUNDATIONS){const blendWidth=pad.siteId?24:6,r=pad.r+1,reach=r+blendWidth;if(Math.abs(x-pad.x)>reach||Math.abs(z-pad.z)>reach)continue;const blend=1-smooth((Math.hypot(x-pad.x,z-pad.z)-r)/blendWidth);y=y*(1-blend)+.2*blend;}
 for(const w of REACH_WATERS){const r=reachWaterRadius(x,z,w);if(r<2){const blend=1-smooth((r-.75)/1.25);y=y*(1-blend)+Math.min(y,STREAM_LEVEL-.4)*blend;}}
 return y;
}
export function terrainSlope(x,z){const e=.1;return {x:(heightAt(x+e,z)-heightAt(x-e,z))/(2*e),z:(heightAt(x,z+e)-heightAt(x,z-e))/(2*e)};}

// A road over a divide is a bridge deck, not an earthen dam. Render the
// excavated terrain beneath the deck while actors use heightAt on the bridge.
export function visualHeightAt(x,z){if(isContinental(x,z)){const edge=nearestProvinceBoundary(x,z);if(edge&&['channel','crevasse'].includes(edge.boundary.kind)&&edge.distance<70)return divideSurface(x,z,continentHeight(x,z));}return heightAt(x,z);}
