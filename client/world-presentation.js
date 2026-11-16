import {PROVINCE_BOUNDARIES} from '/shared/province-boundaries.js';
import {ContinentScene} from './continent-scene.js';
import {CONTINENT_ROADS,CONTINENT_ZONES,continentAt,isContinental} from '/shared/continent.js';
import {CONTINENT_CITY_ROADS} from '/shared/continent-buildings.js';
import {assetRegion} from '/shared/asset-library.js';
import {storageKey} from '../shared/world-storage.js';
import {ACTOR_FADE_START,ACTOR_VIEW_DISTANCE} from '/shared/zone-regions.js';
import {arrivalBlend} from '/shared/city-topography.js';
import {REACH_WATERS} from '/shared/reach-geography.js';
import {ARROW_BOARD} from '/shared/sign-geometry.js';
import {buildCapitalDecor} from './capital-scene.js';
import {WORLD_BOUNDS,zoneAt} from '/shared/zone-layout.js';
import {buildQuietPool} from './quiet-pool.js';
import {MAILBOXES} from '/shared/mail.js';
import {READABLES,readableAvailable} from '/shared/readables.js';
import {WAYPOINTS} from '/shared/travel.js';
import {TerrainScene} from './terrain-scene.js';
import {Landscape} from './landscape.js';
import {introPoint,QUIET_POOL,INTRO_SCALE,ZONE_BOUNDS,ZONE_EXITS,SPAWN,EXIT_POSTS,REACH_DIVIDE_POSTS} from '/shared/zone-layout.js';
import {EMOTES} from '/shared/social.js';
import {ROAD_SIGNS} from '/shared/roadsigns.js';
import * as THREE from 'three';
import {cameraOrbit} from './camera-look.js';
import {classDefinition} from '/shared/adventurers.js';
import {ROUTES,OUTPOSTS,EXPANSION_PROP_PLACEMENTS} from '/shared/world-layouts.js';
import {createExpansionAsset,animateExpansionAsset,animateExpansionLocomotion} from './asset-library/library.js';
import { GroundArea } from './ground-area.js';
import {overheadHealthBar} from './nameplate-health.js';
import { TargetMarker } from './target-marker.js';
import {drawAtlas} from './cartography.js';
import {CAMP_TABLE,FENCE_LINES,LANTERNS,RUIN_COLUMNS,RUIN_STEPS,CAMP_HEARTH,CAMP_GATE,SANCTUARY_GATE,HOLLOW_ALTAR,supportBelow} from '/shared/props.js';
import { BuildingScene } from './buildings.js';
import { buildingAt } from '/shared/buildings.js';
import { CreatureAnimator } from './animation.js';
import { createHumanoid,animateHumanoid,disposeHumanoid } from './character.js';
import { STREAM_LEVEL, streamX, waterBounds, terrainSlope, TERRAIN_SIZE, TERRAIN_SEGMENTS } from '/shared/terrain.js';
import { SnapshotInterpolator } from './netcode.js';
import { MAP_RADII, DEFAULT_MAP_ZOOM, clampZoom, mapView, mapPoint, edgePoint, trackingSettings, trackingMarkers, questOverlays, questTooltip } from './minimap.js';
import { SKILLS, heightAt, NPCS, GATHERABLES, RESOURCE_TYPES, ENEMY_TYPES, BUILDINGS, LANDMARKS, questRecord, questReady, questDone, npcQuests, trackedQuest, questDestination } from '/shared/content.js';

import {rand,material,mesh,box,ball,cylinder,beam} from './scene-primitives.js';
const paths=[...CONTINENT_ROADS,...CONTINENT_CITY_ROADS].flatMap(r=>r.points.slice(1).map((p,i)=>[r.points[i],p])).concat(ROUTES.flatMap(route=>route.slice(1).map((point,i)=>[route[i],point])));
const segDistance = (x,z,a,b) => { const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz); };
// Only distances within six metres affect road paint/foliage. Bucket long
// routes once, avoiding a full-world search for every streamed terrain vertex.
const ROAD_CELL=40,roadBuckets=new Map();
for(const edge of paths){const[a,b]=edge,n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/20));for(let i=0;i<=n;i++){const cx=Math.floor((a[0]+(b[0]-a[0])*i/n)/ROAD_CELL),cz=Math.floor((a[1]+(b[1]-a[1])*i/n)/ROAD_CELL);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const key=`${cx+dx}:${cz+dz}`;if(!roadBuckets.has(key))roadBuckets.set(key,new Set());roadBuckets.get(key).add(edge);}}}
const pathDistance=(x,z)=>{let distance=Infinity;for(const[a,b]of roadBuckets.get(`${Math.floor(x/ROAD_CELL)}:${Math.floor(z/ROAD_CELL)}`)||[])distance=Math.min(distance,segDistance(x,z,a,b));return distance;};

export const worldPresentation={
  buildWorld() {
    this.continentScene=new ContinentScene(this.scene,pathDistance);
    this.terrain=new TerrainScene(this.scene,pathDistance);
    this.buildForest();this.buildCamp();this.buildRuins();this.buildExpansionDecor();this.buildRoadSigns();this.buildTravelMarkers();this.capitalDecor=buildCapitalDecor(this.scene,{pathDistance});
    for(const p of REACH_DIVIDE_POSTS){const ridge=mesh(new THREE.ConeGeometry(12,p.height,6),'#7c9988',this.scene,p.x,heightAt(p.x,p.z)+p.height/2,p.z);ridge.castShadow=true;}
    // Border ridges leave visible openings at the authored outgoing roads.
    for(let i=0;i<72;i++){const side=i%4,t=Math.floor(i/4)/17,x=side<2?(side===0?ZONE_BOUNDS.minX-23:ZONE_BOUNDS.maxX+23):ZONE_BOUNDS.minX+t*(ZONE_BOUNDS.maxX-ZONE_BOUNDS.minX),z=side<2?ZONE_BOUNDS.minZ+t*(ZONE_BOUNDS.maxZ-ZONE_BOUNDS.minZ):(side===2?ZONE_BOUNDS.minZ-25:ZONE_BOUNDS.maxZ+25);if(side===1||ZONE_EXITS.some(e=>Math.hypot(x-e.x,z-e.z)<42))continue;const h=15+rand()*22,ridge=mesh(new THREE.ConeGeometry(18+rand()*12,h,5),i%2?'#7c9988':'#8da594',this.scene,x,heightAt(x,z)+h*.33,z);ridge.rotation.y=rand()*6;ridge.castShadow=false;}
    this.buildWater();

    for(const g of [...GATHERABLES,...READABLES,...MAILBOXES]){
      const o=new THREE.Group();o.position.set(g.x,heightAt(g.x,g.z),g.z);this.scene.add(o);
      if(g.type==='mailbox'){
        cylinder(.12,.16,1.35,'#625342',o,0,.67,0);box(1.3,.8,.85,'#58787b',o,0,1.6,0);box(1.42,.12,.95,'#c4a869',o,0,2.04,0);box(.7,.1,.035,'#243c40',o,0,1.67,.44);box(.45,.28,.04,'#e7d5a2',o,0,1.38,.46);box(.34,.04,.04,'#a99168',o,0,1.39,.49);
      }else if(g.storyId){
        // A small reading stand keeps pages legible above grass without blocking movement.
        cylinder(.07,.13,.8,'#74634b',o,0,.4,0);
        box(1.25,.12,.85,'#68523d',o,0,.85,0);
        box(.98,.09,.64,'#a4784c',o,0,.96,0);
        for(const x of [-.24,.24]){box(.46,.035,.57,'#ecdcb6',o,x,1.02,0);for(let i=0;i<3;i++)box(.29,.008,.018,'#89714c',o,x,1.043,-.15+i*.13);}
      }else if(g.type==='cache'||g.type==='orchard'){
        box(1.5,1.05,1.1,'#886944',o,0,.52,0);box(1.6,.14,1.2,'#aa8c5b',o,0,1.1,0);
        for(const x of [-.5,.5])box(.12,1.15,1.22,'#535c4b',o,x,.58,0);
      }else if(g.type==='beacon'){
        cylinder(.95,1.1,.35,'#777e6a',o,0,.17,0);cylinder(.38,.5,2.5,'#7a8774',o,0,1.5,0);
        cylinder(.85,.3,.5,'#a39971',o,0,2.9,0);const flame=ball(.44,'#ffd98c',o,0,3.35,0,1);flame.scale.y=1.8;flame.material=material('#f9cf78',{emissive:'#ed9637',emissiveIntensity:1.3});o.userData.flame=flame;
      }else if(g.type==='herb'){
        for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const leaf=ball(.25,'#80b4a0',o,Math.sin(a)*.25,.3,Math.cos(a)*.25);leaf.scale.set(.6,1.5,.4);}ball(.12,'#f7d999',o,0,.65,0);
      }else if(g.type.startsWith('keepsake-')){
        if(g.raceId==='sylvren'){for(let i=0;i<3;i++){const seed=ball(.22,'#b4bf73',o,(i-1)*.22,.22,0);seed.scale.set(.65,1.35,.65);}cylinder(.04,.05,.5,'#63774e',o,0,.4,0);}
        else if(g.raceId==='cairnkin'){const token=mesh(new THREE.OctahedronGeometry(.35),'#8ca4af',o,0,.32,0);token.scale.y=.8;box(.3,.035,.12,'#c9c391',o,0,.5,0);}
        else if(g.raceId==='brinefolk'){const token=ball(.3,'#78b8b5',o,0,.22,0);token.scale.y=.5;cylinder(.09,.11,.3,'#d8c38b',o,0,.35,0);}
        else if(g.raceId==='emberkin'){cylinder(.3,.33,.14,'#a86646',o,0,.12,0,8);box(.24,.025,.08,'#e8ba71',o,0,.2,0);}
        else{box(.65,.18,.45,'#786044',o,0,.15,0);box(.5,.025,.34,'#e4d6b0',o,0,.25,0);}
      }else if(g.type==='ore'){
        for(let i=0;i<4;i++){const stone=ball(.45+i*.07,'#7e877c',o,(i%2-.5)*.75,.25,Math.floor(i/2)*.5-.3);stone.scale.y=.7;}
        for(let i=0;i<3;i++){const ore=mesh(new THREE.OctahedronGeometry(.3),'#c49365',o,-.4+i*.4,.55,.05,{emissive:'#9e602c',emissiveIntensity:.15});ore.scale.y=1.4;}
      }else if(g.type==='sap'){
        cylinder(.35,.5,1.8,'#7b7354',o,0,.9,0);ball(.23,'#e8b761',o,0,1,.33).material=material('#e8b761',{emissive:'#ad6f20',emissiveIntensity:.3});
      }else if(g.type==='track'){
        const mark=mesh(new THREE.CircleGeometry(1,7),'#5b6047',o,0,.04,0);mark.rotation.x=-Math.PI/2;for(let i=0;i<3;i++)beam([-.6+i*.4,.1,-.5],[-.4+i*.4,.1,.5],.04,'#ab995c',o);
      }else{
        box(g.type==='page'?1.1:.8,.25,.8,'#a4a38a',o,0,.2,0);box(.6,.06,.5,'#e2cea5',o,0,.36,0);
      }
      this.gathers.set(g.id,{object:o,data:g});
    }
  }
,
  windMaterial(color,strength){
    const mat=material(color).clone(),clock={value:0};this.windUniforms.push(clock);
    mat.onBeforeCompile=shader=>{shader.uniforms.uWindTime=clock;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uWindTime;').replace('#include <begin_vertex>',`#include <begin_vertex>
      vec3 windOrigin=vec3(0.0);
      #ifdef USE_INSTANCING
        windOrigin=instanceMatrix[3].xyz;
      #endif
      float windPhase=windOrigin.x*0.23+windOrigin.z*0.17;
      float windBend=pow(clamp(position.y+0.5,0.0,1.5),2.0);
      transformed.x+=sin(uWindTime*0.9+windPhase)*windBend*${strength.toFixed(3)};
      transformed.z+=sin(uWindTime*0.65+windPhase*1.3)*windBend*${(strength*.4).toFixed(3)};
    `);};mat.customProgramCacheKey=()=>`emberwind-${strength}`;return mat;
  }
,
  buildWater(){
    const positions=[],indices=[],segments=840;
    for(let i=0;i<=segments;i++){const z=-420+i;for(const x of waterBounds(z))positions.push(x,STREAM_LEVEL,z);if(i<segments){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
    const clock={value:0};this.windUniforms.push(clock);const mat=new THREE.MeshStandardMaterial({color:'#79a9a5',roughness:.3,metalness:.15,transparent:true,opacity:.8,side:THREE.DoubleSide});
    mat.onBeforeCompile=shader=>{shader.uniforms.uWaterTime=clock;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uWaterTime;\nvarying vec2 vWaterPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWaterPosition=position.xz; transformed.y+=sin(position.z*1.9-uWaterTime*1.1+position.x)*0.018;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWaterTime;\nvarying vec2 vWaterPosition;').replace('#include <color_fragment>','#include <color_fragment>\nfloat ripple=sin(vWaterPosition.y*4.0-uWaterTime*1.7+sin(vWaterPosition.x*2.0+uWaterTime*0.4))*0.5+0.5;\nfloat glint=pow(ripple,12.0); diffuseColor.rgb*=0.92+glint*0.22;');};
    if(this.capitalDecor?.water){this.capitalDecor.water.material.dispose();this.capitalDecor.water.material=mat;}
    const water=new THREE.Mesh(geo,mat);water.receiveShadow=true;this.scene.add(water);for(const lake of REACH_WATERS){const shape=new THREE.CircleGeometry(1,64);shape.rotateX(-Math.PI/2);shape.scale(lake.radiusX,1,lake.radiusZ);shape.translate(lake.x,STREAM_LEVEL,lake.z);const surface=new THREE.Mesh(shape,mat);surface.receiveShadow=true;this.scene.add(surface);}
    this.quietPool=buildQuietPool(this.scene);
  }
,
  buildForest(){this.landscape=new Landscape(this.scene,pathDistance,(color,strength)=>this.windMaterial(color,strength));}
,
  buildCamp(){
    this.buildings=new BuildingScene(this.scene);
    // Stone hearth, stacked logs, and a warm central flame.
    const cx=CAMP_HEARTH.x,cz=CAMP_HEARTH.z,cy=heightAt(cx,cz);
    for(let i=0;i<10;i++){const a=i/10*6.28;ball(.4,'#92927a',this.scene,cx+Math.cos(a)*1.5,cy+.2,cz+Math.sin(a)*1.5);}
    for(let i=0;i<3;i++){const log=cylinder(.16,.2,2.2,'#62543e',this.scene,cx,cy+.3,cz,6);log.rotation.z=Math.PI/2;log.rotation.y=i*1.2;}
    this.fire=mesh(new THREE.ConeGeometry(.65,1.9,6),'#ffbc64',this.scene,cx,cy+1,cz,{emissive:'#ff8533',emissiveIntensity:1});
    const light=new THREE.PointLight(0xffa34f,9,13,2);light.position.set(cx,cy+2,cz);this.scene.add(light);
    for(const [x,z] of LANTERNS){
      const y=heightAt(x,z);cylinder(.11,.17,3.4,'#6e6348',this.scene,x,y+1.7,z);
      box(.5,.65,.5,'#eed69b',this.scene,x,y+3.3,z);mesh(new THREE.ConeGeometry(.48,.38,4),'#5e6953',this.scene,x,y+3.8,z);
    }
    // The outpost gate and two hanging banners.
    for(const p of CAMP_GATE){const x=p.x,z=p.z,y=heightAt(x,z);cylinder(.22,.3,5,'#6d6446',this.scene,x,y+2.5,z);box(1.2,2,.07,'#647f72',this.scene,x+(x<0?1:-1),y+3.3,z);ball(.15,'#e7c07c',this.scene,x,y+5.1,z);}
    beam([CAMP_GATE[0].x,heightAt(CAMP_GATE[0].x,CAMP_GATE[0].z)+4.7,CAMP_GATE[0].z],[CAMP_GATE[1].x,heightAt(CAMP_GATE[1].x,CAMP_GATE[1].z)+4.7,CAMP_GATE[1].z],.15,'#786b4b',this.scene);
    for(const line of FENCE_LINES)for(let i=0;i<line.count;i++){
      const x=line.x,z=line.startZ+i*line.spacing,y=heightAt(x,z);cylinder(.1,.14,1.5,'#8b7d53',this.scene,x,y+.75,z);
      if(i<line.count-1)beam([x,y+line.railHeight,z],[x,heightAt(x,z+line.spacing)+line.railHeight,z+line.spacing],.06,'#a18b5e',this.scene);
    }
    const t=CAMP_TABLE,stand=new THREE.Group();stand.position.set(t.x,heightAt(t.x,t.z),t.z);this.scene.add(stand);
    box(t.width,.3,t.depth,'#9b8056',stand,0,t.height-.15,0);for(const x of [-1.3,1.3])for(const z of [-.5,.5])box(.15,1,.15,'#6e6146',stand,x,.5,z);
    for(let i=0;i<5;i++)cylinder(.16,.12,.45,i%2?'#a7b596':'#b68a66',stand,-.9+i*.45,1.4,-.48);
  }
,
  buildExpansionDecor(){
    this.expansionDecor=[];
    const place=(id,x,z,region,scale=1)=>{const o=createExpansionAsset(id,{region});o.position.set(x,heightAt(x,z),z);o.scale.setScalar(scale);this.scene.add(o);this.expansionDecor.push(o);return o;};
    for(const p of EXPANSION_PROP_PLACEMENTS)place(p.id,p.x,p.z,p.region,p.scale||1);

  }
,
  buildTravelMarkers(){
    this.waypointMarkers=[];
    for(const point of WAYPOINTS.filter(p=>p.available)){const root=new THREE.Group();root.position.set(point.x,heightAt(point.x,point.z),point.z);this.scene.add(root);const crystal=mesh(new THREE.OctahedronGeometry(.24),'#a6e4d7',root,1.8,1.35,0,{emissive:'#62b9ae',emissiveIntensity:.5}),ring=new GroundArea({x:point.x,z:point.z,radius:1.2,innerRatio:.87,color:0x8bd9cc,opacity:.48});this.scene.add(ring);this.waypointMarkers.push({point,root,crystal,ring});}
    for(const p of EXIT_POSTS){const y=heightAt(p.x,p.z);cylinder(.28,.36,6,'#919887',this.scene,p.x,y+3,p.z,7);box(.8,.35,.8,'#b5b396',this.scene,p.x,y+5.9,p.z);}
    for(const e of ZONE_EXITS){const posts=EXIT_POSTS.filter(p=>p.id.startsWith(`exit-post:${e.id}:`));if(posts.length<2)continue;beam([posts[0].x,heightAt(posts[0].x,posts[0].z)+5.7,posts[0].z],[posts[1].x,heightAt(posts[1].x,posts[1].z)+5.7,posts[1].z],.17,e.next?'#a9a38a':'#817b61',this.scene);}
  }
,
  buildRoadSigns(){
    this.signs=new Map();
    for(const sign of ROAD_SIGNS){const root=new THREE.Group();root.position.set(sign.x,heightAt(sign.x,sign.z),sign.z);this.scene.add(root);cylinder(.09,.15,3.2,'#776344',root,0,1.6,0);
      for(const [i,destination]of sign.destinations.entries()){const arrow=new THREE.Group();arrow.rotation.y=Math.atan2(destination.x-sign.x,destination.z-sign.z);arrow.userData.signDestination=destination;arrow.position.y=2.9-i*.4;root.add(arrow);const shape=new THREE.Shape();ARROW_BOARD.outline.forEach(([x,z],index)=>index?shape.lineTo(x,z):shape.moveTo(x,z));shape.closePath();const geometry=new THREE.ExtrudeGeometry(shape,{depth:ARROW_BOARD.thickness,bevelEnabled:false});geometry.rotateX(Math.PI/2);geometry.translate(0,ARROW_BOARD.thickness/2,0);mesh(geometry,'#b99a65',arrow);}
      this.signs.set(sign.id,{object:root,data:sign});
    }
  }
,
  buildRuins(){
    for(const column of RUIN_COLUMNS){
      const {x,z,height:h}=column,y=heightAt(x,z);cylinder(.65,.8,h,'#92988b',this.scene,x,y+h/2,z,6);cylinder(.95,.9,.35,'#b1af96',this.scene,x,y+h+.15,z,6);
    }
    for(const step of RUIN_STEPS){const bottom=Math.min(heightAt(step.x,step.z)-.1,step.top-.24);box(step.width,step.top-bottom,step.depth,'#a0a38c',this.scene,step.x,(step.top+bottom)/2,step.z);}
    for(const p of SANCTUARY_GATE){const y=heightAt(p.x,p.z);box(1.1,5,1.2,'#969d8e',this.scene,p.x,y+2.5,p.z);}
    const middle=introPoint(2.5,-30);box(8*INTRO_SCALE,1,1.3,'#a5aa95',this.scene,middle.x,heightAt(middle.x,middle.z)+5,middle.z);
    cylinder(2.7,3.4,.7,'#848e83',this.scene,HOLLOW_ALTAR.x,heightAt(HOLLOW_ALTAR.x,HOLLOW_ALTAR.z)+.3,HOLLOW_ALTAR.z,10);
    for(let i=0;i<7;i++){const a=i/7*6.28,p=introPoint(-15+Math.cos(a)*8,-49+Math.sin(a)*8),y=heightAt(p.x,p.z);const rock=mesh(new THREE.OctahedronGeometry(1),'#9483ab',this.scene,p.x,y+1,p.z,{emissive:'#594b70',emissiveIntensity:.15});rock.scale.set(.5,1.7,.6);rock.rotation.z=.3*Math.sin(a);}
  }
,
  creature(type,definition=ENEMY_TYPES[type]){
    if(definition.assetId){const o=createExpansionAsset(definition.assetId,{region:definition.assetRegion});o.userData.expansionCreature=true;o.userData.animation={};o.userData.animator=new CreatureAnimator();return o;}
    if(definition.assetModel){const id=({guardian:'rootguard',fox:'brushfox',tortoise:'stoneback',crab:'shardcrab',wader:'reedstalker'})[definition.assetModel],o=createExpansionAsset(id,{region:type.includes('reed')||type==='fenkeeper'?'gloamfen':type.includes('ash')||type==='kilnkeeper'?'emberwastes':type.includes('tide')||type==='shorecrab'?'brinecoast':type.includes('quarry')?'frostfell':'cinderwood'});o.userData.expansionCreature=true;o.userData.animation={};o.userData.animator=new CreatureAnimator();if(definition.boss)o.scale.setScalar(1.15);return o;}
    const o=new THREE.Group(),model=new THREE.Group(),def=definition,legs=[],arms=[];o.add(model);let head;
    if(type==='nibbler'||type==='prowler'){
      const thorn=type==='prowler',color=def.color;
      const body=ball(thorn?.8:.65,color,model,0,.65,0,1);body.scale.set(.85,.75,1.2);
      head=new THREE.Group();head.position.set(0,.75,.7);model.add(head);const face=ball(.4,thorn?'#8b9b69':'#c19c69',head,0,0,0,1);face.scale.z=1.2;
      for(const side of [-1,1]){
        const ear=mesh(new THREE.ConeGeometry(.17,.45,4),color,head,side*.28,.39,-.14);ear.rotation.z=side*-.35;ball(.065,'#252f28',head,side*.25,.13,.28);
        for(const z of [-.5,.45]){const leg=new THREE.Group();leg.position.set(side*.42,.48,z);model.add(leg);cylinder(.12,.1,.48,thorn?'#586b4b':'#806d47',leg,0,-.24,0);legs.push(leg);}
        if(thorn)for(let j=0;j<3;j++){const t=mesh(new THREE.ConeGeometry(.17,.65,4),'#c5bc8f',model,side*.42,1.04,-.5+j*.38);t.rotation.z=side*-.7;}
      }ball(.2,color,model,0,.8,-.85);
    }else{
      const boss=type==='warden',core=ball(.7,def.color,model,0,1.4,0,1);core.scale.set(.9,1.25,.7);
      ball(.3,boss?'#e2ac7c':'#d4b4e5',model,0,1.6,.44).material=material(boss?'#e3a16e':'#c7a6df',{emissive:boss?'#d47739':'#986fbe',emissiveIntensity:.6});
      head=new THREE.Group();head.position.y=2.4;model.add(head);ball(.4,def.color,head,0,0,0,1);
      for(const side of [-1,1]){
        const arm=new THREE.Group();arm.position.set(side*.5,1.8,0);model.add(arm);beam([0,0,0],[side*.48,-.85,.05],.22,def.color,arm);ball(.27,def.color,arm,side*.44,-.92,.04);arms.push(arm);
        const leg=new THREE.Group();leg.position.set(side*.32,1,0);model.add(leg);beam([0,0,0],[side*.13,-.85,.12],.24,def.color,leg);legs.push(leg);
        mesh(new THREE.ConeGeometry(.2,.85,4),boss?'#77664f':'#ad93c5',model,side*.28,2.95,0).rotation.z=side*-.3;
        if(boss){beam([side*.35,2.7,0],[side*.95,3.5,0],.11,'#75604b',model);beam([side*.65,3.1,0],[side*1.2,3.15,.1],.09,'#75604b',model);}
      }model.scale.setScalar(boss?1.75:1);
    }
    o.userData.creature={model,legs,arms,head,quadruped:legs.length===4};o.userData.animator=new CreatureAnimator();return o;
  }
,
  animateCreature(o,pose,dt,data){
    if(o.userData.expansionCreature){const a=o.userData.animator.step(pose,dt,{dead:data.hp<=0,windup:data.slamAt>this.serverTime});o.userData.animation=a;animateExpansionLocomotion(o,this.serverTime,a,{dead:data.hp<=0});o.rotation.y=pose.facing;return;}
    const rig=o.userData.creature,a=o.userData.animator.step(pose,dt,{dead:data.hp<=0,windup:data.slamAt>this.serverTime});o.userData.animation=a;
    rig.model.rotation.z=0;rig.model.position.y=a.bob;rig.model.position.z=a.lunge;rig.head.rotation.x=a.head;
    rig.legs.forEach((leg,i)=>leg.rotation.x=data.hp<=0?0:Math.sin(a.phase+(rig.quadruped?[0,Math.PI,Math.PI,0][i]:i*Math.PI))*.5*a.move);
    rig.arms.forEach((arm,i)=>arm.rotation.x=Math.sin(a.phase+i*Math.PI)*.3*a.move-a.attack*1.2-a.windup*1.5);
  }
,
  poolDebug(){return {frogs:this.quietPool?.frogs.length||0,screen:this.project(QUIET_POOL.x,STREAM_LEVEL,QUIET_POOL.z)};}
,
  drawMapBackground(){
    if(isContinental(this.focus.x,this.focus.z)){
      const layer=document.createElement('canvas');layer.width=layer.height=800;const c=layer.getContext('2d'),cx=Math.floor(this.focus.x/300)*300,cz=Math.floor(this.focus.z/300)*300;
      this.mapBackgroundBounds={minX:cx-600,maxX:cx+600,minZ:cz-600,maxZ:cz+600};const b=this.mapBackgroundBounds,s=800/1200,pos=(x,z)=>[(x-b.minX)*s,(z-b.minZ)*s];
      for(let x=0;x<800;x+=8)for(let z=0;z<800;z+=8){const zone=continentAt(b.minX+x/s,b.minZ+z/s);c.fillStyle=assetRegion(zone?.biome).ground;c.fillRect(x,z,8,8);}
      for(const edge of PROVINCE_BOUNDARIES){c.strokeStyle={wall:'#a69c87',ice:'#a1c6cf',roots:'#405d34',ridge:'#777362',channel:'#518797',crevasse:'#384653'}[edge.kind];c.lineWidth=7;c.beginPath();edge.points.forEach(([x,z],i)=>c[i?'lineTo':'moveTo'](...pos(x,z)));c.stroke();}
      c.strokeStyle='#d1c19a';c.lineWidth=4;for(const road of [...CONTINENT_ROADS,...CONTINENT_CITY_ROADS]){c.beginPath();road.points.forEach(([x,z],i)=>c[i?'lineTo':'moveTo'](...pos(x,z)));c.stroke();}
      c.fillStyle='#b2b0a0';for(const building of BUILDINGS){if(!building.continent)continue;c.fillRect(...pos(building.x-building.width/2,building.z-building.depth/2),building.width*s,building.depth*s);}
      this.mapBackground=layer;return;
    }
    {
      const layer=document.createElement('canvas');layer.width=layer.height=1600;const c=layer.getContext('2d'),b={minX:-340,maxX:1190,minZ:-245,maxZ:1285},s=1600/(b.maxX-b.minX),pos=(x,z)=>[(x-b.minX)*s,(z-b.minZ)*s];this.mapBackgroundBounds=b;
      c.fillStyle='#253d30';c.fillRect(0,0,1600,1600);c.fillStyle='#354e40';c.fillRect(...pos(ZONE_BOUNDS.minX,ZONE_BOUNDS.minZ),(ZONE_BOUNDS.maxX-ZONE_BOUNDS.minX)*s,(ZONE_BOUNDS.maxZ-ZONE_BOUNDS.minZ)*s);c.fillStyle='#415a4a';c.fillRect(...pos(350,-245),840*s,780*s);c.strokeStyle='#82a8aa';c.lineWidth=22*s;c.beginPath();c.moveTo(...pos(1162,-245));c.lineTo(...pos(1162,535));c.stroke();
      for(const l of LANDMARKS){c.fillStyle=l.name.includes('Ash')?'#666750':l.name.includes('Reed')?'#4c6c58':'#4a6042';c.beginPath();c.ellipse(...pos(l.x,l.z),35*s,30*s,0,0,7);c.fill();}
      c.strokeStyle='#74958e';c.lineWidth=3*s;c.beginPath();for(let z=-419;z<420;z++)c.lineTo(...pos(streamX(z),z));c.stroke();
      for(const w of REACH_WATERS){c.fillStyle='#74958e';c.beginPath();c.ellipse(...pos(w.x,w.z),w.radiusX*s,w.radiusZ*s,0,0,Math.PI*2);c.fill();}
      c.fillStyle='#74958e';c.beginPath();c.ellipse(...pos(QUIET_POOL.x,QUIET_POOL.z),QUIET_POOL.radiusX*s,QUIET_POOL.radiusZ*s,0,0,Math.PI*2);c.fill();
      c.strokeStyle='#a49d73';c.lineWidth=1.4*s;c.lineCap='round';for(const[a,b]of paths){c.beginPath();c.moveTo(...pos(...a));c.lineTo(...pos(...b));c.stroke();}

      c.fillStyle='#ae9d71';for(const b of BUILDINGS){const[x,z]=pos(b.x,b.z);c.fillRect(x-b.width/2*s,z-b.depth/2*s,b.width*s,b.depth*s);}
      c.strokeStyle='#b8c19355';c.lineWidth=2;c.strokeRect(...pos(ZONE_BOUNDS.minX,ZONE_BOUNDS.minZ),(ZONE_BOUNDS.maxX-ZONE_BOUNDS.minX)*s,(ZONE_BOUNDS.maxZ-ZONE_BOUNDS.minZ)*s);this.mapBackground=layer;
    }
  }
,
  updateWorld(dt,time,playing,p){
    const mapCell=isContinental(this.focus.x,this.focus.z)?`${Math.floor(this.focus.x/300)}:${Math.floor(this.focus.z/300)}`:'legacy';if(this.mapCell!==mapCell){this.mapCell=mapCell;this.mapBackground=null;}
    this.continentScene.update(this.focus.x,this.focus.z,time);
    for(const entry of this.entities.values())if(entry.kind==='player'){
      const flying=entry.data.id===this.selfId?this.state?.self.transit:entry.data.inTransit;
      if(flying&&!entry.flightSkiff){entry.flightSkiff=createExpansionAsset('skyway_skiff');entry.flightSkiff.position.y=-.3;entry.object.add(entry.flightSkiff);}
      if(entry.flightSkiff){if(entry.flightSkiff.parent!==entry.object)entry.object.add(entry.flightSkiff);entry.flightSkiff.visible=!!flying;}
    }
    const blend=arrivalBlend(this.focus.x),inCity=blend>.5;this.scene.fog.density=.012+(.0045-.012)*blend;if(this.camera.far!==(inCity?550:240)){this.camera.far=inCity?550:240;this.camera.updateProjectionMatrix();}
    if(isContinental(this.focus.x,this.focus.z)){const zone=continentAt(this.focus.x,this.focus.z),sky=new THREE.Color(assetRegion(zone.biome).ground).lerp(new THREE.Color('#c5d2cf'),.7);this.scene.fog.color.lerp(sky,.15);this.scene.background.copy(this.scene.fog.color);}else{this.scene.fog.color.set('#b0c5ad');this.scene.background.set('#a8c4ad');}
    this.quietPool?.update(time);this.terrain.update(this.focus.x,this.focus.z);this.landscape.update(this.camera,this.focus,playing,time);
    if(this.ambientMotion!==false)for(const clock of this.windUniforms)clock.value=time;
    for(const o of this.expansionDecor||[]){const near=!p||Math.hypot(o.position.x-p.x,o.position.z-p.z)<75;o.visible=near;if(near&&this.ambientMotion!==false)animateExpansionAsset(o,'idle',time%4);}
    for(const marker of this.waypointMarkers||[]){marker.root.visible=!p||Math.hypot(p.x-marker.point.x,p.z-marker.point.z)<100;marker.ring.visible=marker.root.visible;if(marker.root.visible){marker.crystal.rotation.y=time*.6;marker.crystal.position.y=1.35+Math.sin(time*1.7)*.1;marker.ring.material.uniforms.uColor.value.set(p?.waypointId===marker.point.id?0xe8d390:0x8bd9cc);}}
    if(this.fire){this.fire.scale.set(1+Math.sin(time*9)*.1,1+Math.sin(time*7)*.1,1);this.fire.rotation.y=time*.4;}
  }

};
