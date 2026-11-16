import {beginCameraDrag,moveCameraBy,endCameraDrag} from './camera-input.js';
import {firefox,chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {projectAtlasLocation} from '../shared/atlas.js';
const base=process.env.TEST_URL||'http://127.0.0.1:3081',engine=process.env.BROWSER==='firefox'?firefox:chromium;
const browser=await engine.launch({headless:process.env.HEADED!=='1',...(engine===firefox?{firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}}:{args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);this.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.type==='state'){if(window.__pauseSnapshots){e.stopImmediatePropagation();return;}window.__state=m;}});}};});
const canvas=page.locator('#zone-map'),headings=[];
async function level(id){await page.waitForFunction(id=>document.querySelector('#zone-map')?.dataset.mapId===id,id);assert.equal(await page.locator('#atlas-breadcrumbs [aria-current]').count(),1);}
async function click(x,y,button='left'){const r=await canvas.boundingBox();await page.mouse.click(r.x+x/1000*r.width,r.y+y/720*r.height,{button});}
async function position(id){const expected=projectAtlasLocation(id,await page.evaluate(()=>window.__state.self)),actual=await canvas.evaluate(c=>({x:+c.dataset.playerX,y:+c.dataset.playerY}));assert.ok(Math.hypot(actual.x-expected.x,actual.y-expected.y)<1,JSON.stringify({id,actual,expected}));}
async function heading(){
  await page.waitForFunction(()=>{const expected=window.emberwildDebug.view.cameraHeading,map=Number(document.querySelector('#zone-map').dataset.playerHeading),mini=Number(document.querySelector('#minimap').dataset.playerHeading);return Math.abs(map-expected)<.001&&Math.abs(mini-expected)<.001;});
  const result=await canvas.evaluate(c=>{const context=c.getContext('2d'),x=Number(c.dataset.playerX)/1000*c.width,y=Number(c.dataset.playerY)/720*c.height,left=Math.floor(x-22),top=Math.floor(y-22),pixels=context.getImageData(left,top,45,45).data;let dx=0,dy=0,count=0;for(let py=0;py<45;py++)for(let px=0;px<45;px++){const i=(py*45+px)*4;if(pixels[i]===50&&pixels[i+1]===100&&pixels[i+2]===120&&pixels[i+3]===255){dx+=left+px+.5-x;dy+=top+py+.5-y;count++;}}return {map:c.dataset.mapId,heading:Number(c.dataset.playerHeading),pixelHeading:Math.atan2(dx,dy),pixels:count};});
  assert.ok(result.pixels>70,'player marker must be visible');const delta=result.pixelHeading-result.heading;assert.ok(Math.abs(Math.atan2(Math.sin(delta),Math.cos(delta)))<.35,JSON.stringify(result));headings.push(result);
}
async function turn(){await beginCameraDrag(page,'left',100,400);await moveCameraBy(page,Math.PI/2/.006);await endCameraDrag(page,'left');await heading();}
async function visible(){const r=await page.locator('#window-map').boundingBox(),v=page.viewportSize();assert.ok(r.x>=0&&r.y>=48&&r.x+r.width<=v.width&&r.y+r.height<=v.height,JSON.stringify({r,v}));const c=await canvas.boundingBox(),status=await page.locator('.atlas-footer').boundingBox();assert.ok(c.y+c.height<=status.y&&status.y+status.height<=r.y+r.height);}
try{
  await mkdir('test-results',{recursive:true});await page.goto(base+'/?debug=1');await page.locator('#name').fill(`Atlas${Date.now().toString(36)}`);await page.locator('#join').click();await page.waitForFunction(()=>window.__state);
  await page.keyboard.down('KeyW');try{await page.waitForFunction(()=>window.__state.self.z<27);}finally{await page.keyboard.up('KeyW');}await page.waitForTimeout(300);
  await page.keyboard.press('KeyF');await page.locator('[data-quest-offer="welcome"]').click();await page.locator('[data-quest="welcome"][data-action="accept"]').click();await page.waitForFunction(()=>window.__state.self.quests.welcome?.status==='active');await page.keyboard.press('Escape');
  await page.keyboard.press('KeyM');await level('cinderwood');await position('cinderwood');await visible();await heading();const stationary=await page.evaluate(()=>({x:window.__state.self.x,z:window.__state.self.z,facing:window.__state.self.facing}));
  const snapshotTime=await page.evaluate(()=>{window.__pauseSnapshots=true;return window.__state.time;});await turn();assert.equal(await page.evaluate(()=>window.__state.time),snapshotTime,'heading updates locally while server snapshots are withheld');await page.evaluate(()=>window.__pauseSnapshots=false);for(let i=0;i<3;i++)await turn();const after=await page.evaluate(()=>({x:window.__state.self.x,z:window.__state.self.z,facing:window.__state.self.facing}));assert.deepEqual(after,stationary,'camera orbit must not turn or move the pawn');assert.equal(await canvas.getAttribute('data-quest-ids'),'welcome');
  await page.screenshot({path:'test-results/atlas-zone.png'});await canvas.screenshot({path:'test-results/atlas-zone-chart.png'});
  await click(500,400);await level('cinderwood');
  await click(500,400,'right');await level('dawnlands');await position('dawnlands');await turn();await page.screenshot({path:'test-results/atlas-region.png'});assert.equal(await canvas.getAttribute('data-quest-ids'),'');
  await click(880,180);await level('dawnlands'); // Uncharted paper is not a destination.
  await click(500,400,'right');await level('emberwild');await position('emberwild');await heading();await page.screenshot({path:'test-results/atlas-world.png'});assert.equal(await page.locator('#atlas-up').isDisabled(),true);
  await click(500,400,'right');await level('emberwild');
  await click(430,350);await level('dawnlands');await click(420,460);await level('cinderwood');
  assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('camera-dragging')),false);
  await page.locator('#minimap').click({button:'right'});await level('cinderwood');assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('camera-dragging')),false);
  await page.locator('#atlas-breadcrumbs [data-atlas-map="emberwild"]').click();await level('emberwild');await page.locator('#atlas-locate').click();await level('cinderwood');
  await canvas.focus();await page.keyboard.press('ArrowLeft');await level('dawnlands');await page.keyboard.press('ArrowLeft');await level('emberwild');await page.keyboard.press('Enter');await level('dawnlands');await page.keyboard.press('ArrowRight');await level('cinderwood');
  await page.setViewportSize({width:1280,height:720});await visible();await page.screenshot({path:'test-results/atlas-1280.png'});
  // The minimap keeps its local zoom and tracking behavior independently.
  const zoom=+(await page.locator('#minimap').getAttribute('data-radius'));await page.locator('#minimap-zoom-out').click();assert.ok(+(await page.locator('#minimap').getAttribute('data-radius'))>zoom);await level('cinderwood');
  await page.locator('#minimap-tracking-button').click();await page.locator('[data-tracking="objectives"]').uncheck();await page.waitForFunction(()=>document.querySelector('#zone-map').dataset.questIds==='');await page.locator('[data-tracking="objectives"]').check();await page.waitForFunction(()=>document.querySelector('#zone-map').dataset.questIds==='welcome');await page.keyboard.press('Escape');
  await page.locator('#atlas-up').click();await level('dawnlands');await canvas.hover();await page.keyboard.press('Escape');await page.keyboard.press('KeyM');await level('dawnlands');await page.locator('#atlas-locate').click();await level('cinderwood');
  const b=await canvas.evaluate(async()=>{const {chartBackground}=await import('/cartography.js');const c=chartBackground('cinderwood'),ctx=c.getContext('2d');return {cached:chartBackground('cinderwood')===c,blank:[...ctx.getImageData(930,160,1,1).data],inked:[...ctx.getImageData(720,340,1,1).data]};});assert.equal(b.cached,true);assert.notDeepEqual(b.blank,b.inked);assert.ok(b.blank[0]>b.blank[2]+30,'unknown land stays parchment');assert.deepEqual(errors,[]);
  const result={cameraHeadingOnAllMapLevels:true,localHeadingWithoutSnapshots:true,pawnFacingIndependent:true,headings,drawnCharts:true,worldRegionZone:true,rightClickUp:true,leftClickDown:true,rootAndLeafLimits:true,unchartedAreasBlocked:true,projectedPlayer:true,questOverlaysAndFilters:true,breadcrumbsAndFindMe:true,keyboardNavigation:true,minimapIndependent:true,compactDesktop:true,cachedArtwork:true,errors};await writeFile('test-results/atlas-results.json',JSON.stringify(result,null,2));console.log('PASS',JSON.stringify(result));
}catch(e){await page.screenshot({path:'test-results/atlas-failure.png'}).catch(()=>{});throw e;}finally{await browser.close();}
