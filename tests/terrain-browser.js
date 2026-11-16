import {beginCameraDrag,moveCameraBy,endCameraDrag} from './camera-input.js';
import {CAMERA_GROUND_CLEARANCE} from '../client/camera-look.js';
import {chromium,firefox} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const engine=process.env.BROWSER==='firefox'?firefox:chromium;
const browser=await engine.launch({headless:process.env.HEADED!=='1',...(engine===firefox?{firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}}:{args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})});
let page;
try{
  await mkdir('test-results',{recursive:true});page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(20000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.TEST_URL||'http://127.0.0.1:3081')+'/?debug=1');await page.locator('#name').fill(`HillScout${Date.now().toString(36)}`);await page.locator('#join').click();await page.waitForFunction(()=>window.emberwildDebug?.character);
  const start=await page.evaluate(()=>window.emberwildDebug.character.ground);await page.keyboard.down('KeyW');
  const samples=await page.evaluate(()=>new Promise((resolve,reject)=>{
    const samples=[],started=performance.now();
    function sample(){
      const d=window.emberwildDebug;if(d?.character)samples.push({elapsed:performance.now()-started,z:d.local.z,...d.character});
      if(d?.local.z<=-25)return resolve(samples);
      if(performance.now()-started>16000)return reject(Error('Could not traverse the northern slope'));
      requestAnimationFrame(sample);
    }sample();
  }));await page.keyboard.up('KeyW');
  assert.ok(Math.max(...samples.map(s=>s.ground))-start>8,'walkable route climbs a visible hill');
  const running=samples.filter(s=>s.elapsed>1000);assert.ok(running.every(s=>s.blend>.8),'running animation must not alternate idle between updates');
  assert.ok(new Set(running.map(s=>s.phase.toFixed(2))).size>50,'limbs advance continuously');
  assert.ok(running.every(s=>Math.abs(s.worldY-s.ground)<.001),'rendered root follows the shared terrain');
  assert.ok(running.every(s=>s.cameraClearance>=CAMERA_GROUND_CLEARANCE-1e-6),'camera stays above the hillside');
  const worstFoot=Math.min(...running.flatMap(s=>s.feet.map(f=>f.y-f.ground-.12)));assert.ok(worstFoot>-.035,`feet penetrate ground: ${worstFoot}`);
  await page.screenshot({path:'test-results/northern-slopes.png'});await page.waitForTimeout(900);assert.ok(await page.evaluate(()=>window.emberwildDebug.character.blend)<.02,'animation blends to idle after stopping');
  await beginCameraDrag(page);await moveCameraBy(page,524,-65);await endCameraDrag(page);await page.screenshot({path:'test-results/hills-overlook.png'});
  await beginCameraDrag(page);await moveCameraBy(page,-524,65);await endCameraDrag(page);
  await page.keyboard.press('Space');await page.waitForFunction(()=>window.emberwildDebug.character.air>.8);await page.screenshot({path:'test-results/slope-jump.png'});await page.waitForFunction(()=>window.emberwildDebug.character.air<.01);
  await page.keyboard.down('KeyS');try{await page.waitForFunction(()=>window.emberwildDebug.local.z>=31,null,{timeout:32000});}finally{await page.keyboard.up('KeyS');}
  await page.waitForTimeout(600);assert.ok(Math.abs(await page.evaluate(()=>window.emberwildDebug.character.ground)-start)<.02);
  assert.deepEqual(errors,[]);const result={renderedFrames:samples.length,climbedMetres:Math.max(...samples.map(s=>s.ground))-start,minimumFootGroundGap:worstFoot,continuousLocalAnimation:true,uphillDownhill:true,jumpLandsOnSlope:true,errors};
  await writeFile('test-results/terrain-animation-results.json',JSON.stringify(result,null,2));console.log('PASS:',JSON.stringify(result));
}catch(e){if(page)await page.screenshot({path:'test-results/terrain-failure.png'}).catch(()=>{});throw e;}
finally{await browser.close();}
