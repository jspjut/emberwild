import test from 'node:test';
import assert from 'node:assert/strict';
import {GroundArea,GROUND_EFFECT_LIFT} from '../client/ground-area.js';
import {heightAt,TERRAIN_SIZE,TERRAIN_SEGMENTS} from '../shared/terrain.js';
import {WORLD_COLLIDERS,colliderTop,HOLLOW_ALTAR} from '../shared/props.js';
const cell=TERRAIN_SIZE/TERRAIN_SEGMENTS,half=TERRAIN_SIZE/2;
function renderedTerrain(x,z){
 const ax=Math.fround(Math.floor((x+half)/cell)*cell-half),az=Math.fround(Math.floor((z+half)/cell)*cell-half),bx=Math.fround(ax+cell),bz=Math.fround(az+cell),u=(x-ax)/(bx-ax),v=(z-az)/(bz-az),a=Math.fround(heightAt(ax,az)),b=Math.fround(heightAt(bx,az)),c=Math.fround(heightAt(ax,bz)),d=Math.fround(heightAt(bx,bz));
 return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);
}
function topAt(geometry,x,z){
 const p=geometry.attributes.position,indices=geometry.index;let top=-Infinity;
 for(let i=0;i<indices.count;i+=3){const[a,b,c]=[indices.getX(i),indices.getX(i+1),indices.getX(i+2)],ax=p.getX(a),az=p.getZ(a),bx=p.getX(b),bz=p.getZ(b),cx=p.getX(c),cz=p.getZ(c),den=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(den)<1e-8)continue;const u=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/den,v=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/den,w=1-u-v;if(Math.min(u,v,w)>=-1e-5)top=Math.max(top,u*p.getY(a)+v*p.getY(b)+w*p.getY(c));}return top;
}

test('area fills stay above the rendered terrain across triangle interiors, including the Hollow Warden hillside',()=>{
 for(const[x,z,radius]of [[-15,-49,7],[-27,-1,7],[31,-5,8],[-50,118,7],[0,124,5],[121,155,4]]){
  const area=new GroundArea({x,z,radius}),p=area.geometry.attributes.position,index=area.geometry.index,n=area.geometry.userData.terrainVertices;
  for(let i=0;i<index.count;i+=3){const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)];if(ids.some(id=>id>=n))continue;
   for(const weights of [[1/3,1/3,1/3],[.1,.45,.45],[.45,.1,.45],[.45,.45,.1]]){const [wx,wy,wz]=['X','Y','Z'].map(axis=>ids.reduce((sum,id,j)=>sum+p['get'+axis](id)*weights[j],0));assert.ok(wy-renderedTerrain(wx,wz)>GROUND_EFFECT_LIFT-.001,`${x},${z}: buried face at ${wx},${wz}`);}
  }
  assert.equal(area.material.depthTest,true);assert.equal(area.material.depthWrite,false);area.geometry.dispose();area.material.dispose();
 }
});

test('the old flat Warden disk intersects this hillside; the replacement covers the altar top as well',()=>{
 const {x,z}=HOLLOW_ALTAR,radius=7,area=new GroundArea({x,z,radius});let oldBuried=0;
 for(let dx=-6;dx<=6;dx+=.5)for(let dz=-6;dz<=6;dz+=.5){if(Math.hypot(dx,dz)>radius)continue;if(heightAt(x+dx,z+dz)>heightAt(x,z)+.09)oldBuried++;assert.ok(topAt(area.geometry,x+dx,z+dz)>renderedTerrain(x+dx,z+dz)+.04);}
 assert.ok(oldBuried>50,'reproduce the reported terrain intersection');const altar=WORLD_COLLIDERS.find(c=>c.id==='hollow-altar');assert.ok(Math.abs(topAt(area.geometry,x,z)-colliderTop(altar,x,z)-GROUND_EFFECT_LIFT)<1e-4);area.geometry.dispose();area.material.dispose();
});

test('walkable furniture and steps receive the marker on their surface without flattening nearby hills',()=>{
 for(const id of ['market-table','lodge:table','sanctuary-step-3']){const c=WORLD_COLLIDERS.find(c=>c.id===id),x=(c.minX+c.maxX)/2,z=(c.minZ+c.maxZ)/2,area=new GroundArea({x,z,radius:4});assert.ok(Math.abs(topAt(area.geometry,x,z)-colliderTop(c,x,z)-GROUND_EFFECT_LIFT)<1e-4,id);area.geometry.dispose();area.material.dispose();}
});

test('expanding rings change their footprint without scaling ground heights, and moving warnings update their surface',()=>{
 const area=new GroundArea({x:-15,z:-49,radius:.3,maxRadius:7.3,innerRatio:.9}),original=area.geometry,heights=Array.from(original.attributes.position.array);
 for(const radius of [.3,1,3,7.3]){area.setRadius(radius).setOpacity(.8);assert.equal(area.geometry,original);assert.deepEqual(Array.from(area.geometry.attributes.position.array),heights);assert.deepEqual(area.scale.toArray(),[1,1,1]);assert.equal(area.debug().radius,radius);}
 let disposed=false;original.addEventListener('dispose',()=>disposed=true);area.place(31,-5,7);assert.ok(disposed);assert.notEqual(area.geometry,original);assert.ok(topAt(area.geometry,31,-5)>renderedTerrain(31,-5)+.04);area.geometry.dispose();area.material.dispose();
});
