// Real WebSocket proxy: delay both directions, without mocking the game state.
import http from 'node:http';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import WebSocket, { WebSocketServer } from 'ws';
import { chromium, firefox } from '@playwright/test';

const upstream=new URL(process.env.TEST_URL||'http://127.0.0.1:3081');
const delay=150;
const proxy=http.createServer((req,res)=>{
  const request=http.request(new URL(req.url,upstream),{method:req.method,headers:{...req.headers}},response=>{res.writeHead(response.statusCode,response.headers);response.pipe(res);});
  request.on('error',()=>{res.writeHead(502);res.end();});req.pipe(request);
});
const wss=new WebSocketServer({server:proxy});
const timers=new Set();
const later=fn=>{const timer=setTimeout(()=>{timers.delete(timer);fn();},delay);timers.add(timer);};
wss.on('connection',client=>{
  const server=new WebSocket(`ws://${upstream.host}/ws`),waiting=[];
  client.on('message',raw=>{const payload=raw.toString();later(()=>{if(server.readyState===WebSocket.OPEN)server.send(payload);else if(server.readyState===WebSocket.CONNECTING)waiting.push(payload);});});
  server.on('open',()=>{for(const message of waiting.splice(0))server.send(message);});
  server.on('message',raw=>{const payload=raw.toString();later(()=>{if(client.readyState===WebSocket.OPEN)client.send(payload);});});
  client.on('error',()=>{});server.on('error',()=>client.close());
  client.on('close',()=>server.close());server.on('close',()=>client.close());
});
proxy.listen(0,'127.0.0.1');await once(proxy,'listening');
await mkdir('test-results',{recursive:true});
const engine=process.env.BROWSER==='firefox'?firefox:chromium;
const browser=await engine.launch({headless:process.env.HEADED!=='1',...(engine===firefox?{firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}}:{args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})});
let page;
try{
  page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);this.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.type==='state')window.__serverState=m;});}};
  });
  await page.goto(`http://127.0.0.1:${proxy.address().port}/?debug=1`);await page.locator('#name').fill(`LagScout${Date.now().toString(36)}`);await page.locator('#join').click();await page.locator('#hud').waitFor({state:'visible'});
  await page.waitForFunction(()=>window.emberwildDebug?.rtt>=280);
  await page.mouse.move(640,400);await page.mouse.down({button:'right'});assert.equal(await page.locator('#world').evaluate(el=>getComputedStyle(el).cursor),'none');
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('camera-dragging')),false);await page.mouse.up({button:'right'});
  await page.mouse.down({button:'right'});assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('camera-dragging')),true);await page.mouse.up({button:'right'});assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('camera-dragging')),false);
  const start=await page.evaluate(()=>({local:window.emberwildDebug.local,server:window.emberwildDebug.authoritative}));
  await page.keyboard.down('KeyD');
  await page.waitForFunction(x=>window.emberwildDebug.local.x>x+.1,start.local.x);
  const firstMove=await page.evaluate(()=>({local:window.emberwildDebug.local,server:window.emberwildDebug.authoritative}));
  assert.equal(firstMove.server.x,start.server.x,'local movement appears before delayed server response');
  assert.ok(await page.evaluate(()=>window.emberwildDebug.character.blend)>.01,'local animation starts before the server acknowledges movement');
  await page.waitForTimeout(500);await page.keyboard.up('KeyD');await page.waitForTimeout(100);
  const stopped=await page.evaluate(()=>window.emberwildDebug.local.x);await page.waitForTimeout(900);
  const settled=await page.evaluate(()=>window.emberwildDebug);
  assert.ok(Math.abs(settled.local.x-stopped)<.15,'stopping responds locally');assert.ok(Math.abs(settled.local.x-settled.authoritative.x)<.15,'server reconciliation converges');
  await page.keyboard.press('Space');await page.waitForFunction(()=>window.emberwildDebug.local.jumpHeight>.15);
  assert.equal(await page.evaluate(()=>window.emberwildDebug.authoritative.jumpHeight),0,'jump predicts before server acknowledgement');
  await page.waitForTimeout(1200);assert.equal(await page.evaluate(()=>window.emberwildDebug.local.jumpHeight),0);
  const radius=Number(await page.locator('#minimap').getAttribute('data-radius'));
  await page.locator('#minimap-zoom-in').click();assert.ok(Number(await page.locator('#minimap').getAttribute('data-radius'))<radius);
  for(let i=0;i<8;i++){if(await page.locator('#minimap-zoom-in').isDisabled())break;await page.locator('#minimap-zoom-in').click();}
  assert.equal(await page.locator('#minimap-zoom-in').isDisabled(),true);assert.equal(Number(await page.locator('#minimap').getAttribute('data-radius')),12);
  for(let i=0;i<8;i++){if(await page.locator('#minimap-zoom-out').isDisabled())break;await page.locator('#minimap-zoom-out').click();}
  assert.equal(Number(await page.locator('#minimap').getAttribute('data-radius')),76);assert.equal(await page.locator('#minimap-zoom-out').isDisabled(),true);
  const center=await page.evaluate(()=>({x:Number(document.querySelector('#minimap').dataset.centerX),z:Number(document.querySelector('#minimap').dataset.centerZ),pose:window.emberwildDebug.local}));
  assert.ok(Math.hypot(center.x-center.pose.x,center.z-center.pose.z)<.02,'minimap follows predicted player center');
  await page.locator('#minimap-zoom-in').click();await page.locator('#minimap').hover();await page.mouse.wheel(0,-100);await page.waitForTimeout(100);assert.ok(Number(await page.locator('#minimap').getAttribute('data-radius'))<55);
  async function walk(code,axis,value,direction){await page.keyboard.down(code);try{await page.waitForFunction(({axis,value,direction})=>direction*window.emberwildDebug.local[axis]>=direction*value,{axis,value,direction},{timeout:12000});}finally{await page.keyboard.up(code);}await page.waitForTimeout(650);}
  await walk('KeyA','x',-10.8,-1);await page.keyboard.down('KeyS');
  try{await page.waitForFunction(()=>window.emberwildDebug.local.z>33.7&&window.emberwildDebug.building.id==='lodge');assert.equal(await page.evaluate(()=>window.emberwildDebug.building.roofHidden),true,'interior visibility follows prediction immediately');assert.ok(await page.evaluate(()=>window.emberwildDebug.authoritative.z)<33.5,'roof cutaway starts before the server reports entering');await page.waitForFunction(()=>window.emberwildDebug.local.z>=37);}finally{await page.keyboard.up('KeyS');}
  await page.waitForTimeout(900);assert.equal(await page.evaluate(()=>window.emberwildDebug.building.id),'lodge');const indoor=await page.evaluate(()=>window.emberwildDebug);assert.ok(Math.hypot(indoor.local.x-indoor.authoritative.x,indoor.local.z-indoor.authoritative.z)<.15);await page.screenshot({path:'test-results/latency-interior.png'});await walk('KeyW','z',31.8,-1);
  await walk('KeyA','x',-18,-1);await walk('KeyW','z',22,-1);await page.keyboard.press('Tab');await page.waitForFunction(()=>window.__serverState.self.target!==null);
  const target=await page.evaluate(()=>window.__serverState.enemies.find(e=>e.id===window.__serverState.self.target));
  await page.keyboard.press('Digit2');await page.locator('#cast-bar').waitFor({state:'visible'});
  assert.equal(await page.evaluate(()=>window.__serverState.self.casting),null,'cast bar starts without waiting for server');
  await page.waitForTimeout(250);await page.keyboard.down('KeyW');await page.waitForTimeout(100);await page.keyboard.up('KeyW');
  await page.locator('#cast-bar').waitFor({state:'hidden'});await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(id=>window.__serverState.enemies.find(e=>e.id===id).hp,target.id),target.hp,'interrupted cast applies no damage');
  assert.equal(await page.evaluate(()=>window.__serverState.self.cooldowns.lance),undefined);
  await page.keyboard.press('Digit2');await page.locator('#cast-bar').waitFor({state:'visible'});await page.waitForTimeout(500);await page.screenshot({path:'test-results/latency-cast.png'});
  await page.waitForFunction(()=>window.__serverState.self.cooldowns.lance>window.__serverState.time);await page.locator('#cast-bar').waitFor({state:'hidden'});
  assert.ok(await page.evaluate(id=>window.__serverState.enemies.find(e=>e.id===id).hp,target.id)<target.hp);
  const zoom=await page.locator('#minimap').getAttribute('data-radius');await page.reload();await page.locator('#join').click();await page.locator('#hud').waitFor({state:'visible'});await page.waitForFunction(()=>window.emberwildDebug?.rtt>=280);assert.equal(await page.locator('#minimap').getAttribute('data-radius'),zoom,'zoom preference survives reconnect');
  assert.equal(errors.length,0,errors.join('\n'));
  const result={simulatedRoundTripMs:delay*2,measuredRoundTripMs:Math.round(await page.evaluate(()=>window.emberwildDebug.rtt)),predictedMovementBeforeAck:true,predictedJumpBeforeAck:true,stopConverged:true,castImmediate:true,castMovementInterrupted:true,castCompleted:true,minimapCentered:true,zoomBounded:true,cameraCursorRestored:true,animationBeforeAck:true,interiorPredicted:true,indoorReconciliation:true,errors};
  await writeFile('test-results/latency-results.json',JSON.stringify(result,null,2));console.log('PASS:',JSON.stringify(result));
}catch(e){if(page)await page.screenshot({path:'test-results/latency-failure.png'}).catch(()=>{});throw e;}
finally{await browser.close();for(const timer of timers)clearTimeout(timer);for(const ws of wss.clients)ws.terminate();wss.close();proxy.close();}
