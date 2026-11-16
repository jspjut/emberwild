import {firefox,chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {beginCameraDrag,moveCameraBy,endCameraDrag} from './camera-input.js';
const engine=process.env.BROWSER==='firefox'?firefox:chromium,base=process.env.TEST_URL||'http://127.0.0.1:3081';
const browser=await engine.launch({headless:process.env.HEADED!=='1',...(engine===firefox?{firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}}:{args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{const Native=window.WebSocket;window.__commands=[];window.WebSocket=class extends Native{constructor(...args){super(...args);window.__socket=this;this.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.type==='state')window.__state=m;});}send(data){const m=JSON.parse(data);if(['target','auto','interact'].includes(m.type))window.__commands.push(m);return super.send(data);}};});
const view=()=>page.evaluate(()=>window.emberwildDebug.view),delta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
async function released(){await page.waitForFunction(()=>!document.pointerLockElement&&!window.emberwildDebug.view.pointerLockPending&&!window.emberwildDebug.controls.buttons.length);assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('camera-dragging')),false);}
try{
 await mkdir('test-results',{recursive:true});await page.goto(base+'/?debug=1');await page.locator('#name').fill('Camera'+Date.now().toString(36));await page.locator('#join').click();await page.waitForFunction(()=>window.emberwildDebug?.character);
 await page.evaluate(()=>{window.__lockedMoves=[];window.__restoredMoves=[];document.addEventListener('mousemove',e=>{if(document.pointerLockElement)window.__lockedMoves.push({x:e.clientX,y:e.clientY,dx:e.movementX,dy:e.movementY});else window.__restoredMoves.push({x:e.clientX,y:e.clientY});});});
 const original=await view(),commands=await page.evaluate(()=>window.__commands.length);
 await beginCameraDrag(page);assert.equal(await page.locator('#world').evaluate(el=>getComputedStyle(el).cursor),'none');
 // Travel farther than the desktop width, then reverse while still captured.
 await moveCameraBy(page,1800);let current=await view();assert.ok(Math.abs(current.cursor.x-2450)<2);assert.ok(Math.abs(delta(current.cameraHeading,original.cameraHeading+(-1800*.006)))<.02);
 await moveCameraBy(page,-1800);assert.ok(Math.abs(delta((await view()).cameraHeading,original.cameraHeading))<.02);
 await moveCameraBy(page,0,-900);assert.equal((await view()).cameraPitch,-1.2);await page.screenshot({path:'test-results/camera-look-up.png'});
 await moveCameraBy(page,0,1000);assert.equal((await view()).cameraPitch,1.48);await page.screenshot({path:'test-results/camera-overhead.png'});
 await moveCameraBy(page,0,-210);assert.ok(Math.abs((await view()).cameraPitch-.64)<.001);
 const lockedMoves=await page.evaluate(()=>window.__lockedMoves);assert.ok(lockedMoves.filter(m=>m.dx||m.dy).length>30);assert.ok(lockedMoves.every(m=>m.x===650&&m.y===400),'client coordinates stay fixed throughout native camera capture');
 await endCameraDrag(page);await released();await page.waitForFunction(()=>window.__restoredMoves.some(m=>m.x===650&&m.y===400));assert.equal(await page.evaluate(()=>window.__commands.length),commands,'drag release must not select or attack');
 const facing=await page.evaluate(()=>window.emberwildDebug.local.facing);await beginCameraDrag(page,'left');await moveCameraBy(page,100);assert.ok(Math.abs(delta((await view()).cameraHeading,original.cameraHeading))>.5);assert.ok(Math.abs(delta(await page.evaluate(()=>window.emberwildDebug.local.facing),facing))<.01);await moveCameraBy(page,-100);await endCameraDrag(page,'left');
 // Unlock with Escape while both buttons and autorun could otherwise latch.
 await beginCameraDrag(page);await page.mouse.down({button:'left'});await page.waitForFunction(()=>window.emberwildDebug.controls.bothButtons);await page.keyboard.press('Escape');await released();assert.equal(await page.locator('#game-menu').isVisible(),false);assert.equal(await page.evaluate(()=>window.emberwildDebug.controls.autorun),false);await page.mouse.up({button:'left'});await page.mouse.up({button:'right'});
 await page.waitForTimeout(1300);await beginCameraDrag(page);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await released();await page.mouse.up({button:'right'});
 await beginCameraDrag(page);await page.locator('#main-menu-button').evaluate(el=>el.click());await released();await page.mouse.up({button:'right'});await page.locator('[data-resume]').click();
 // An ordinary right click still talks to the NPC under the original cursor.
 const npc=await page.evaluate(()=>window.emberwildDebug.units.find(u=>u.id==='elowen').screen);await page.mouse.click(npc.x,npc.y,{button:'right'});await page.waitForFunction(()=>window.__state.self.target==='elowen');await released();await page.keyboard.press('Escape');
 // Capture is also released if a connection is lost while the button is held.
 await beginCameraDrag(page);await page.evaluate(()=>window.__socket.close());await page.locator('#disconnected').waitFor({state:'visible'});await released();await page.mouse.up({button:'right'});
 assert.equal(await page.evaluate(()=>window.emberwildDebug.environment.shaderErrors),0);assert.deepEqual(errors,[]);
 const result={origin:base,upwardDegrees:69,overheadDegrees:85,nativePointerLock:true,frozenCursor:true,travelPastWindowEdges:true,restoresCursor:true,leftFreeLook:true,clickSelection:true,escapeBlurMenuDisconnectRelease:true,lockedMovementEvents:lockedMoves.length,errors};await writeFile('test-results/camera-browser.json',JSON.stringify(result,null,2));console.log('PASS:',JSON.stringify(result));
}catch(e){await page.screenshot({path:'test-results/camera-failure.png'}).catch(()=>{});console.error(await page.evaluate(()=>({view:window.emberwildDebug?.view,controls:window.emberwildDebug?.controls,toasts:document.querySelector('#toasts').textContent})).catch(()=>null));throw e;}finally{await browser.close();}
