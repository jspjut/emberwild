// Shared authored mainland coast. Bays and headlands stay outside all roads,
// capitals and frontier sites. The Dawnlands wrap around the existing Reach and Alderhaven settlements.
export const CONTINENT_OUTLINE=[
 [-1500,-3500],[-850,-4300],
 [1900,-5200],[1400,-6200],[2100,-7400],[1900,-8800],[3500,-10000],
 [4000,-12200],[5900,-12800],[7300,-12100],[8600,-11000],[10500,-9800],
 [10500,-8500],[12500,-7800],[13200,-6000],[12700,-5000],[14000,-4500],
 [15000,-2400],[14600,-1000],[15500,300],[14800,1800],[15100,3500],
 [14000,4400],[14600,6200],[13300,7000],[12400,8000],[12200,9400],
 [10400,10500],[9300,10400],[8100,11900],[6800,13100],[4900,12900],
 [3600,11800],[2800,11600],[2700,9900],[1700,9700],[1300,8000],
 [400,7700],[200,6500],[-400,5100],
 [-650,3700],[-1550,2700],[-1800,900],[-1700,-1200]

];
export function mainlandContains(x,z){let inside=false;for(let i=0,j=CONTINENT_OUTLINE.length-1;i<CONTINENT_OUTLINE.length;j=i++){const a=CONTINENT_OUTLINE[i],b=CONTINENT_OUTLINE[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
const cache=new Map(),GRID=16;
function sampleDistance(x,z){const key=`${x}:${z}`;if(cache.has(key))return cache.get(key);let distance=Infinity;for(let i=0;i<CONTINENT_OUTLINE.length;i++){const a=CONTINENT_OUTLINE[i],b=CONTINENT_OUTLINE[(i+1)%CONTINENT_OUTLINE.length],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));distance=Math.min(distance,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}const result=mainlandContains(x,z)?distance:-distance;if(cache.size>24000)cache.clear();cache.set(key,result);return result;}
export function distanceToCoast(x,z){const ax=Math.floor(x/GRID)*GRID,az=Math.floor(z/GRID)*GRID,tx=(x-ax)/GRID,tz=(z-az)/GRID;return (sampleDistance(ax,az)*(1-tx)+sampleDistance(ax+GRID,az)*tx)*(1-tz)+(sampleDistance(ax,az+GRID)*(1-tx)+sampleDistance(ax+GRID,az+GRID)*tx)*tz;}

// The authored starter and city retain their coordinates inside the mainland.
// Outside this rectangle, the streamed continent owns terrain and actors.
export const FOUNDING_BOUNDS={minX:-240*Math.SQRT2,maxX:1190,minZ:-245,maxZ:535};
export function foundingDistance(x,z){const b=FOUNDING_BOUNDS;return Math.hypot(Math.max(b.minX-x,0,x-b.maxX),Math.max(b.minZ-z,0,z-b.maxZ));}
export const isContinental=(x,z)=>foundingDistance(x,z)>0;
