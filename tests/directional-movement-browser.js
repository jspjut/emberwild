import {firefox} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {beginCameraDrag,moveCameraBy,endCameraDrag} from './camera-input.js';
const base=process.env.TEST_URL||'http://127.0.0.1:3081';
const browser=await firefox.launch({headless:process.env.HEADED!=='1',firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],samples=[];
page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
const delta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const snapshot=()=>page.evaluate(()=>{const d=window.emberwildDebug;return {pose:{...d.local},server:{...d.authoritative},animation:{...d.character},time:performance.now()};});
async function idle(){await page.waitForFunction(()=>window.emberwildDebug.character.blend<.02&&Math.abs(window.emberwildDebug.character.lowerYaw)<.025);await page.waitForFunction(()=>{const d=window.emberwildDebug;return Math.hypot(d.local.x-d.authoritative.x,d.local.z-d.authoritative.z)<.08;});}
async function walk(name,keys,duration,backward){
 const before=await snapshot();for(const key of keys)await page.keyboard.down(key);await page.waitForTimeout(duration);const after=await snapshot();
 const a=after.animation,direction=Math.atan2(after.pose.x-before.pose.x,after.pose.z-before.pose.z),stance=direction+(backward?Math.PI:0);
 assert.ok(Math.abs(delta(a.lowerFacing,stance))<.12,`${name}: feet face the locomotion stance`);assert.ok(Math.abs(delta(a.headFacing,after.pose.facing))<.15,`${name}: head keeps aim`);assert.ok(Math.abs(delta(a.torsoFacing,after.pose.facing))<.5);assert.ok(Math.abs(delta(after.pose.facing,before.pose.facing))<.01,'strafes never change actual facing');
 assert.equal(a.gaitDirection,backward?-1:1);assert.ok(a.backpedal>(backward?.98:-1)&&a.backpedal<(backward?1.001:.02));assert.ok(Math.abs(a.speed-(backward?3.25:6.5))<.65,`${name}: speed ${a.speed}`);
 for(const f of a.feet)assert.ok(f.y-f.ground>.08,`${name}: grounded feet stay above the ground`);
 if(['strafe-right','back-left','backward'].includes(name))await page.screenshot({path:`test-results/locomotion-${name}.png`});
 samples.push({name,speed:a.speed,lowerFacing:a.lowerFacing,headFacing:a.headFacing,facing:after.pose.facing,gaitDirection:a.gaitDirection});for(const key of keys)await page.keyboard.up(key);await idle();
}
try{
 await mkdir('test-results',{recursive:true});await page.goto(base+'/?debug=1');await page.locator('#name').fill('Stride'+Date.now().toString(36));await page.locator('#join').click();await page.waitForFunction(()=>window.emberwildDebug?.character&&Math.abs(window.emberwildDebug.local.facing-Math.PI)<.001);await idle();
 await walk('forward',['KeyW'],650,false);await walk('backward',['KeyS'],1300,true);
 await walk('strafe-right',['KeyD'],700,false);await walk('strafe-left',['KeyA'],700,false);
 await walk('forward-right',['KeyW','KeyD'],650,false);await walk('back-left',['KeyS','KeyA'],1300,true);
 await walk('forward-left',['KeyW','KeyA'],650,false);await walk('back-right',['KeyS','KeyD'],1300,true);
 const ratio=samples.find(s=>s.name==='backward').speed/samples.find(s=>s.name==='forward').speed;assert.ok(Math.abs(ratio-.5)<.07);
 await page.keyboard.down('KeyD');await beginCameraDrag(page);await moveCameraBy(page,80);await page.waitForTimeout(650);let d=await snapshot();assert.ok(Math.abs(Math.abs(delta(d.animation.lowerFacing,d.pose.facing))-Math.PI/2)<.1);assert.ok(Math.abs(delta(d.animation.headFacing,d.pose.facing))<.15);await endCameraDrag(page);await page.keyboard.up('KeyD');await idle();
 await page.keyboard.down('KeyS');await page.keyboard.down('KeyA');await page.keyboard.press('Space');await page.waitForFunction(()=>window.emberwildDebug.character.air>.8);assert.ok(Number.isFinite((await snapshot()).animation.lowerFacing));await page.keyboard.up('KeyS');await page.keyboard.up('KeyA');await page.waitForFunction(()=>window.emberwildDebug.character.air<.01);await idle();
 assert.equal(await page.evaluate(()=>window.emberwildDebug.environment.shaderErrors),0);assert.deepEqual(errors,[]);
 const result={eightDirections:samples,backwardSpeedRatio:ratio,aimPreserved:true,steeringWhileStrafing:true,reverseGait:true,feetGrounded:true,predictionConverges:true,jumpAndIdle:true,errors};await writeFile('test-results/locomotion-results.json',JSON.stringify(result,null,2));console.log('PASS:',JSON.stringify(result));
}catch(e){console.error(await snapshot().catch(()=>null));await page.screenshot({path:'test-results/locomotion-failure.png'}).catch(()=>{});throw e;}finally{await browser.close();}
