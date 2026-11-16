import http from 'node:http';
import {once} from 'node:events';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import WebSocket,{WebSocketServer} from 'ws';
import {firefox,chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const fixture=JSON.parse(await readFile(process.env.GCD_FIXTURE||'/tmp/emberwild-gcd-fixture.json','utf8')),upstream=new URL(process.env.TEST_URL||'http://127.0.0.1:3081'),delay=150;
const proxy=http.createServer((req,res)=>{const request=http.request(new URL(req.url,upstream),{method:req.method,headers:req.headers},response=>{res.writeHead(response.statusCode,response.headers);response.pipe(res);});request.on('error',()=>{res.writeHead(502);res.end();});req.pipe(request);});
const wss=new WebSocketServer({server:proxy}),timers=new Set();
function later(fn){const timer=setTimeout(()=>{timers.delete(timer);fn();},delay);timers.add(timer);}
wss.on('connection',client=>{
  const server=new WebSocket(`ws://${upstream.host}/ws`),waiting=[];
  client.on('message',raw=>{const payload=raw.toString();later(()=>{if(server.readyState===WebSocket.OPEN)server.send(payload);else if(server.readyState===WebSocket.CONNECTING)waiting.push(payload);});});
  server.on('open',()=>{for(const payload of waiting)server.send(payload);});server.on('message',raw=>{const payload=raw.toString();later(()=>{if(client.readyState===WebSocket.OPEN)client.send(payload);});});
  client.on('error',()=>{});server.on('error',()=>client.close());client.on('close',()=>server.close());server.on('close',()=>client.close());
});
proxy.listen(0,'127.0.0.1');await once(proxy,'listening');
const engine=process.env.BROWSER==='firefox'?firefox:chromium,browser=await engine.launch({headless:process.env.HEADED!=='1',...(engine===firefox?{firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}}:{args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})});
let page;const errors=[];
async function ready(){await page.waitForFunction(()=>window.emberwildDebug.globalCooldown.remaining===0&&(!window.__state.self.globalCooldown||window.__state.self.globalCooldown.endsAt<=window.__state.time));}
try{
  await mkdir('test-results',{recursive:true});page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(fixture=>{localStorage.setItem('emberwild-character',JSON.stringify(fixture));window.__sentSkills=[];const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);window.__connection=this;this.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.type==='state')window.__state=m;});}send(raw){const m=JSON.parse(raw);if(m.type==='skill')window.__sentSkills.push(m);return super.send(raw);}};},fixture);
  await page.goto(`http://127.0.0.1:${proxy.address().port}/?debug=1`);await page.locator('#join').click();await page.waitForFunction(()=>window.emberwildDebug?.rtt>=280);
  // An invalid target never begins a local or authoritative shared cooldown.
  await page.keyboard.press('Digit1');await page.waitForFunction(()=>window.__state.self.lastCastRequest>=1);assert.equal(await page.evaluate(()=>window.emberwildDebug.globalCooldown.remaining),0);assert.equal(await page.evaluate(()=>window.__state.self.globalCooldown),null);
  const target=await page.evaluate(()=>window.emberwildDebug.units.find(u=>u.id==='mob-0').screen);await page.mouse.click(target.x,target.y);await page.waitForFunction(()=>window.__state.self.target==='mob-0');
  await page.keyboard.press('Digit1');await page.waitForFunction(()=>window.emberwildDebug.globalCooldown.remaining>1);
  assert.equal(await page.evaluate(()=>window.__state.self.globalCooldown),null,'sweeps start before the delayed server response');
  for(const id of ['strike','lance','mend','nova'])assert.equal(await page.locator(`.action-slot[data-action-id="${id}"]`).getAttribute('data-cooldown-kind'),'global');
  for(const id of ['auto','potion'])assert.equal(await page.locator(`.action-slot[data-action-id="${id}"]`).getAttribute('data-cooldown-kind'),'');
  const sent=await page.evaluate(()=>window.__sentSkills.length);for(const key of ['Digit2','Digit3','Digit4'])await page.keyboard.press(key);assert.equal(await page.evaluate(()=>window.__sentSkills.length),sent,'shared cooldown blocks rapid client inputs');
  await page.waitForFunction(()=>window.__state.self.globalCooldown?.requestId===2);const ends=await page.evaluate(()=>window.__state.self.globalCooldown.endsAt);
  await page.evaluate(()=>window.__connection.send(JSON.stringify({type:'skill',skill:'nova'})));await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.__state.self.cooldowns.nova),undefined,'server also rejects packets bypassing the UI');assert.equal(await page.evaluate(()=>window.__state.self.globalCooldown.endsAt),ends);
  assert.equal(await page.locator('.action-slot[data-action-id="strike"]').getAttribute('data-cooldown-kind'),'ability');await page.screenshot({path:'test-results/global-cooldown-shared-sweeps.png'});
  await ready();await page.keyboard.press('Digit2');await page.locator('#cast-bar').waitFor({state:'visible'});await page.waitForTimeout(150);await page.keyboard.press('Space');await page.locator('#cast-bar').waitFor({state:'hidden'});assert.equal(await page.evaluate(()=>window.emberwildDebug.globalCooldown.remaining),0);await page.keyboard.press('Digit4');const followup=await page.evaluate(()=>window.emberwildDebug.globalCooldown.requestId);assert.ok(await page.evaluate(()=>window.emberwildDebug.globalCooldown.remaining)>1);
  await page.keyboard.press('Digit6');await page.keyboard.press('Digit5');await page.waitForFunction(()=>window.__state.self.inventory.potion===2);await page.waitForFunction(id=>window.__state.self.globalCooldown?.requestId===id,followup);assert.ok(await page.evaluate(()=>window.__state.self.cooldowns.nova>window.__state.time));assert.equal(await page.evaluate(()=>window.__state.self.cooldowns.lance),undefined,'interrupted cast does not gain an individual cooldown');assert.equal(await page.evaluate(()=>window.__state.self.auto),false);
  await ready();await page.waitForFunction(()=>window.emberwildDebug.local.grounded);await page.keyboard.press('Digit3');await page.locator('#cast-bar').waitFor({state:'visible'});await page.waitForFunction(()=>window.__state.self.casting?.skill==='mend');
  const cast=await page.evaluate(()=>({end:window.__state.self.casting.endsAt,gcdEnd:window.__state.self.globalCooldown.endsAt}));assert.ok(Math.abs(cast.end-cast.gcdEnd-.3)<.001);await page.locator('#cast-bar').waitFor({state:'hidden'});assert.equal(await page.evaluate(()=>window.emberwildDebug.globalCooldown.remaining),0,'cast completion must not start another shared cooldown');
  assert.deepEqual(errors,[]);const result={simulatedRoundTripMs:300,immediatePredictedSweep:true,allFourSkillsShareCooldown:true,clientSpamBlocked:true,serverBypassBlocked:true,ownCooldownWins:true,interruptResetsGlobalCooldown:true,immediateFollowupAfterCancel:true,autoAndPotionExempt:true,noExtraGlobalAfterCast:true,invalidTargetNoGlobalCooldown:true,errors};await writeFile('test-results/global-cooldown-results.json',JSON.stringify(result,null,2));console.log('PASS:',JSON.stringify(result));
}catch(e){if(page&&!page.isClosed()){console.error(await page.evaluate(()=>({gcd:window.emberwildDebug?.globalCooldown,self:window.__state?{globalCooldown:window.__state.self.globalCooldown,casting:window.__state.self.casting,cooldowns:window.__state.self.cooldowns,lastCastRequest:window.__state.self.lastCastRequest}:null})));await page.screenshot({path:'test-results/global-cooldown-failure.png'}).catch(()=>{});}throw e;}
finally{await browser.close();for(const timer of timers)clearTimeout(timer);for(const ws of wss.clients)ws.terminate();wss.close();proxy.close();}
