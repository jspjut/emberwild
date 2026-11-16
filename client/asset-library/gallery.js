import {EQUIPMENT_BANDS} from '../../shared/equipment-tiers.js';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EXPANSION_ASSETS,ASSET_REGIONS,ASSET_CATEGORIES,expansionAsset,assetRegion} from '../../shared/complete-assets.js';
import {ARMOR_TYPES,EQUIPMENT_CLASSES,EQUIPMENT_SLOTS_ART,GEAR_SETS,gearSet,equipmentUsage} from '../../shared/equipment-collection.js';
import {createExpansionAsset,animateExpansionAsset,disposeExpansionAsset,expansionClips} from './library.js';
import {RARITIES,RARITY_ORDER} from '../../shared/progression.js';
import {applyRarityTheme} from '../rarity-theme.js';
applyRarityTheme();
const $=s=>document.querySelector(s),canvas=$('#asset-stage');
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#233a32');scene.add(new THREE.HemisphereLight(0xffe7c2,0x7c9f9a,2.5));
const sun=new THREE.DirectionalLight(0xffe5b9,3.1);sun.position.set(-4,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-5,right:5,top:6,bottom:-5});sun.shadow.bias=-.0003;scene.add(sun);
const rim=new THREE.DirectionalLight(0xa8d7d3,2);rim.position.set(5,3,-5);scene.add(rim);
const floor=new THREE.Mesh(new THREE.CircleGeometry(12,64),new THREE.MeshStandardMaterial({color:'#53664c',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.012;floor.receiveShadow=true;scene.add(floor);
const grid=new THREE.GridHelper(20,20,'#b9c19b','#a7b28b');grid.material.transparent=true;grid.material.opacity=.13;grid.position.y=-.004;scene.add(grid);
const camera=new THREE.PerspectiveCamera(35,1,.01,100),controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.5+.15;controls.minDistance=.4;controls.maxDistance=24;
const options=entries=>entries.map(([id,label])=>`<option value="${id}">${label}</option>`).join('');
const classNames=ids=>(ids||[]).map(id=>EQUIPMENT_CLASSES[id]||id).join(', ');
let current=null,selected=new URLSearchParams(location.search).get('asset')||'human',region='cinderwood',category='all',state='idle',paused=false,age=0,last=performance.now(),exporting=false;
if(!expansionAsset(selected))selected='human';
$('#category-filters').innerHTML=[['all','All'],...Object.entries(ASSET_CATEGORIES)].map(([id,name])=>`<button data-category="${id}" aria-pressed="${id==='all'}">${name}</button>`).join('');
$('#asset-region').innerHTML=options(Object.entries(ASSET_REGIONS).map(([id,p])=>[id,p.name]));
$('#level-filter').innerHTML=options([['all','All level bands'],...EQUIPMENT_BANDS.map(b=>[String(b.id),`Levels ${b.label}`])]);
$('#armor-filter').innerHTML=options([['all','All materials'],...Object.entries(ARMOR_TYPES)]);
$('#rarity-filter').innerHTML=options([['all','All rewards'],['field','Field sets'],['boss','Boss concepts'],...RARITY_ORDER.map(id=>[id,RARITIES[id].name])]);
$('#slot-filter').innerHTML=options([['all','All slots'],...Object.entries(EQUIPMENT_SLOTS_ART),['weapon','Main hand'],['offhand','Off hand']]);
$('#class-filter').innerHTML=options([['all','All classes'],...Object.entries(EQUIPMENT_CLASSES)]);
$('#preview-class').innerHTML=options(Object.entries(EQUIPMENT_CLASSES));
$('#preview-race').innerHTML=options(EXPANSION_ASSETS.filter(a=>a.category==='race').map(a=>[a.id,a.model==='human'?'Human (original)':a.name]));
$('#gear-set').innerHTML=options([['','Matching / starter outfit'],...GEAR_SETS.map(s=>[s.id,`${s.name} · ${ARMOR_TYPES[s.armorType]}${s.shapeTier?` · ${s.plannedLevels.min}–${s.plannedLevels.max}`:s.tier==='boss'?' · Boss':''}`])]);
const initialSet=gearSet(new URLSearchParams(location.search).get('set'));if(initialSet)$('#gear-set').value=initialSet.id;
$('#catalog-note').innerHTML=`${EXPANSION_ASSETS.length} designs · ${Object.keys(ASSET_REGIONS).length} regional palettes<br>Original geometry · MIT licensed`;
let listKey;
function renderList(){
  const query=$('#asset-search').value.trim().toLowerCase(),armor=$('#armor-filter').value,rarity=$('#rarity-filter').value,slot=$('#slot-filter').value,role=$('#class-filter').value,level=$('#level-filter').value,band=EQUIPMENT_BANDS.find(b=>String(b.id)===level);
  const key=JSON.stringify([query,armor,rarity,slot,role,level,category]);
  if(key===listKey){for(const card of $('#asset-list').querySelectorAll('[aria-pressed="true"]'))card.setAttribute('aria-pressed','false');$('#asset-list').querySelector(`[data-asset="${selected}"]`)?.setAttribute('aria-pressed','true');return;}listKey=key;
  const assets=EXPANSION_ASSETS.filter(a=>{
    if(category!=='all'&&a.category!==category)return false;
    if(!`${a.name} ${a.tags.join(' ')} ${a.description} ${a.source||''} ${classNames(a.allowedClasses||a.classPreference)}`.toLowerCase().includes(query))return false;
    if([armor,rarity,slot,role,level].some(v=>v!=='all')&&a.category!=='item')return false;
    if(band&&(!a.plannedLevels||a.plannedLevels.min>band.max||a.plannedLevels.max<band.min))return false;
    return (armor==='all'||a.armorType===armor)&&(slot==='all'||a.slot===slot)&&(role==='all'||(a.allowedClasses||a.classPreference||[]).includes(role))&&(rarity==='all'||(['field','boss'].includes(rarity)?a.tier===rarity:a.rarity===rarity));
  });
  $('#asset-count').textContent=`${assets.length} / ${EXPANSION_ASSETS.length}`;
  $('#asset-list').innerHTML=assets.length?assets.map(a=>`<button class="asset-card ${a.rarity||''}" data-asset="${a.id}" aria-pressed="${a.id===selected}" aria-label="Preview ${a.name}"><img src="/assets/previews/${a.id}.png" alt="" loading="lazy"><strong>${a.name}</strong><small>${a.rarity?`${a.rarity} · `:''}${a.armorType||ASSET_CATEGORIES[a.category]}${a.shapeTier?` · ${a.plannedLevels.min}–${a.plannedLevels.max}`:''}</small></button>`).join(''):'<p class="empty-results">No matching assets. Clear an equipment filter to see the other categories.</p>';
  for(const button of document.querySelectorAll('[data-category]'))button.setAttribute('aria-pressed',String(button.dataset.category===category));
}
function isWorn(){return expansionAsset(selected).category==='item'&&$('#equipment-view').value!=='model';}
function makePreview(){
  const def=expansionAsset(selected),hideHead=$('#hide-headgear').checked;
  if(isWorn()){
    const whole=$('#equipment-view').value==='set',role=(def.allowedClasses||def.classPreference||['dawnwarden'])[0];
    const setId=whole?(def.setId||$('#gear-set').value||GEAR_SETS.find(s=>s.tier==='field'&&s.classPreference.includes(role))?.id):undefined;
    const root=createExpansionAsset($('#preview-race').value,{region,outfit:{enabled:true,setId,itemId:setId&&def.setId?undefined:selected,hideHead}});
    root.userData.library.previewOf=selected;return root;
  }
  return createExpansionAsset(selected,{region,...def.category==='race'?{outfit:{enabled:$('#race-outfit').checked,setId:$('#gear-set').value||undefined,hideHead}}:{}});
}
function resetCamera(){if(!current)return;const b=new THREE.Box3().setFromObject(current),center=b.getCenter(new THREE.Vector3()),radius=b.getBoundingSphere(new THREE.Sphere()).radius,distance=radius/Math.sin(camera.fov*Math.PI/360)*1.2;controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(.85,.48,1.35).normalize().multiplyScalar(distance));camera.near=Math.max(.005,distance/500);camera.far=Math.max(100,distance*10);camera.updateProjectionMatrix();controls.update();}
function showUsage(){
  const def=expansionAsset(selected);if(def.category!=='item')return;
  const usage=equipmentUsage(def,$('#preview-class').value),el=$('#class-eligibility');el.className=usage.allowed?'eligible':'restricted';
  el.textContent=!usage.allowed?'Class intent: unavailable to this preview class. You can still inspect the art.':usage.preferred?'Preferred equipment for this preview class.':usage.mode==='preference'?'Usable by this preview class; another class is preferred.':usage.mode==='restricted'?'Signature equipment for this preview class.':'No class restriction specified.';
}
function select(id,variant=region){
  const def=expansionAsset(id);if(!def)return;selected=id;region=variant in ASSET_REGIONS?variant:def.region;
  if(def.category==='item'&&$('#equipment-view').value==='set'&&def.setId)$('#gear-set').value=def.setId;
  if(current)disposeExpansionAsset(current);current=makePreview();scene.add(current);age=0;
  const palette=assetRegion(region),info=current.userData.library,clips=expansionClips(current),worn=isWorn();floor.material.color.set(palette.ground).multiplyScalar(.6);
  $('#asset-name').textContent=def.name;$('#asset-category').textContent=`${ASSET_CATEGORIES[def.category]}${def.rarity?` · ${def.rarity.toUpperCase()}`:''}${worn?' · worn preview':''}`;$('#asset-category').className=`eyebrow quality-${def.rarity||'common'}`;
  $('#asset-region-badge').textContent=palette.name;$('#asset-description').textContent=def.description;$('#asset-region').value=region;$('#region-description').textContent=palette.description;
  $('#palette-swatches').innerHTML=['body','light','dark','leaf','wood','metal','cloth','glow'].map(key=>`<i style="background:${palette[key]}"></i>`).join('');$('#asset-tags').innerHTML=def.tags.map(tag=>`<span>${tag}</span>`).join('');
  $('#asset-stats').innerHTML=[['Dimensions',info.bounds.size.map(v=>v.toFixed(2)).join(' × ')+' m'],['Triangles',info.triangles.toLocaleString()],['Animations',clips.map(c=>c.name).join(', ')||'Static'],['Rig sockets',info.sockets.length||'—'],['Collision',info.collision?.volumes?`${info.collision.volumes.length} authored volumes`:info.collision?.type||'—']].map(([name,value])=>`<dt>${name}</dt><dd>${value}</dd>`).join('');
  $('#equipment-details').hidden=def.category!=='item';$('#tryon-controls').hidden=def.category!=='item';$('#loadout-controls').hidden=def.category!=='race'&&!worn;$('#outfit-option').hidden=def.category!=='race';
  $('#gear-set').disabled=worn&&($('#equipment-view').value==='piece'||!!def.setId);
  if(def.category==='item'){
    $('#equipment-stats').innerHTML=[['Armor',ARMOR_TYPES[def.armorType]||'—'],['Set',gearSet(def.setId)?.name||'Independent piece'],['Quality',RARITIES[def.rarity]?.name||'Unassigned'],['Planned levels',def.plannedLevels?`${def.plannedLevels.min}–${def.plannedLevels.max}${def.plannedLevels.min===100?' · Endgame':''}`:'Unassigned art study'],['Class intent',def.allowedClasses?`${classNames(def.allowedClasses)} only`:def.classPreference?`Prefers ${classNames(def.classPreference)}`:'Open'],['Grip',def.handedness===2?'Two hands':'One hand / worn'],['Source',def.source||'General equipment study']].map(([name,value])=>`<dt>${name}</dt><dd>${value}</dd>`).join('');showUsage();
  }
  $('#asset-status').textContent=def.playable?'Original human Dawnwarden, built from the live game character model. Default outfit shows the actual starter blade and coat.':def.category==='race'?'Race art prototype with shared character rig sockets. Choose an outfit to inspect armor fit.':def.sourceItemId?'An equipment appearance used by the live game. Source definitions remain authoritative.':def.category==='item'?'Equipment art and class/reward intent for future content. Bosses, drop rates and class access are assigned when the item enters gameplay.':'Expansion library asset for future content.';
  const animated=def.category==='creature'||def.category==='race'||worn;
  for(const button of document.querySelectorAll('[data-state]'))button.disabled=!animated&&button.dataset.state!=='idle';if(!animated)state='idle';
  $('#animation-note').textContent=animated?'Locally animated':clips.length?'Subtle ambient motion':'Static model';$('#curated-download').href=`/assets/models/${id}.glb`;$('#curated-download').textContent=`Curated item · ${assetRegion(def.region).name} ↗`;$('#export-glb').textContent=worn?'Download worn preview · GLB':'Download this model · GLB';$('#export-status').textContent='';
  updateAnimationButtons();renderList();resetCamera();render();
}
function updateAnimationButtons(){for(const b of document.querySelectorAll('[data-state]'))b.setAttribute('aria-pressed',String(b.dataset.state===state));$('#pause-animation').textContent=paused?'Resume':'Pause';$('#pause-animation').setAttribute('aria-pressed',String(paused));}
function render(){const r=canvas.getBoundingClientRect();if(r.width&&r.height&&(canvas.width!==Math.round(r.width*renderer.getPixelRatio())||canvas.height!==Math.round(r.height*renderer.getPixelRatio()))){renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}if(current)animateExpansionAsset(current,state,age%(state==='attack'?1.2:state==='walk'?1:4));controls.update();renderer.render(scene,camera);}
function download(data,name,type){const url=URL.createObjectURL(data instanceof Blob?data:new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
async function exportCurrent(){const root=makePreview();try{const{exportExpansionGLB}=await import('./export.js');return await exportExpansionGLB(root);}finally{disposeExpansionAsset(root);}}
function capturePNG(size=512){
  const saved={width:renderer.getSize(new THREE.Vector2()),ratio:renderer.getPixelRatio(),aspect:camera.aspect,position:camera.position.clone(),target:controls.target.clone(),background:scene.background,floor:floor.visible,grid:grid.visible};
  try{renderer.setPixelRatio(1);renderer.setSize(size,size,false);camera.aspect=1;camera.updateProjectionMatrix();resetCamera();scene.background=null;floor.visible=grid.visible=false;animateExpansionAsset(current,'idle',0);renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');}
  finally{renderer.setPixelRatio(saved.ratio);renderer.setSize(saved.width.x,saved.width.y,false);camera.aspect=saved.aspect;camera.position.copy(saved.position);controls.target.copy(saved.target);camera.updateProjectionMatrix();scene.background=saved.background;floor.visible=saved.floor;grid.visible=saved.grid;controls.update();render();}
}
$('#asset-list').onclick=e=>{const b=e.target.closest('[data-asset]');if(b)select(b.dataset.asset);};
$('#category-filters').onclick=e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;for(const id of['armor-filter','rarity-filter','slot-filter','class-filter','level-filter'])$('#'+id).value='all';renderList();}};
$('#asset-search').oninput=renderList;for(const id of['armor-filter','rarity-filter','slot-filter','class-filter','level-filter'])$('#'+id).onchange=renderList;
$('#asset-region').onchange=e=>select(selected,e.target.value);$('#reset-camera').onclick=resetCamera;$('#show-grid').onchange=e=>grid.visible=e.target.checked;
for(const id of['equipment-view','preview-race','gear-set','hide-headgear','race-outfit'])$('#'+id).onchange=()=>select(selected);
$('#preview-class').onchange=showUsage;
$('#animation-states').onclick=e=>{const b=e.target.closest('[data-state]');if(b&&!b.disabled){state=b.dataset.state;age=0;updateAnimationButtons();}};$('#pause-animation').onclick=()=>{paused=!paused;updateAnimationButtons();};
$('#export-png').onclick=()=>{const bytes=Uint8Array.from(atob(capturePNG(768).split(',')[1]),c=>c.charCodeAt(0));download(bytes,`${selected}-${region}${isWorn()?'-worn':''}.png`,'image/png');$('#export-status').textContent='Transparent model preview downloaded.';};
$('#export-glb').onclick=async()=>{if(exporting)return;const name=`${selected}-${region}${isWorn()?'-worn':''}.glb`;exporting=true;$('#export-glb').disabled=true;$('#export-status').textContent='Preparing model and animation clips…';try{download(await exportCurrent(),name,'model/gltf-binary');$('#export-status').textContent='Model downloaded with materials, animations and asset metadata.';}catch(e){$('#export-status').textContent=`Export failed: ${e.message}`;}finally{exporting=false;$('#export-glb').disabled=false;}};
window.assetLibraryStudio=Object.freeze({select,capturePNG,render,exportGLB:exportCurrent,get current(){return current;},get debug(){return {id:selected,region,state,paused,presentation:isWorn()?$('#equipment-view').value:'model',metadata:current?.userData.library,render:{...renderer.info.render},shaderErrors:renderer.info.programs.filter(p=>p.diagnostics?.runnable===false).length};}});
select(selected,initialSet?.region||expansionAsset(selected).region);requestAnimationFrame(function frame(now){if(!paused&&!exporting)age+=Math.min(.05,(now-last)/1000);last=now;if(!exporting)render();requestAnimationFrame(frame);});
