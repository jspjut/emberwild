import {firefox} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {tmpdir} from 'node:os';
import {CharacterStore} from '../server/characters.js';
import {QUESTS,NPCS} from '../shared/content.js';
const dir=await mkdtemp(`${tmpdir()}/emberwild-dialogue-browser-`),store=await CharacterStore.open(`${dir}/characters.json`),token=await store.session(),record=(id,status='active')=>({status,progress:QUESTS.find(q=>q.id===id).count,gathered:[]});
for(const[i,[name,npcId]]of [['Orin Visitor','orin'],['Ilan Visitor','scout']].entries()){
 await store.create(token,name,'hearth',i);const key=store.data.accounts[token].characters[i],p=store.profile(key),npc=NPCS.find(n=>n.id===npcId);Object.assign(p,{x:npc.x,z:npc.z,xp:2200});
 p.quests=npcId==='orin'?{class_spark:record('class_spark','complete'),class_mercy:record('class_mercy','complete'),relics:record('relics'),class_dawn:record('class_dawn')}:{missing_scout:record('missing_scout','complete'),beacons:record('beacons'),memory:record('memory')};if(npcId==='orin')p.inventory.dawnsteel_fragment=5;await store.saveProfiles([[key,p]]);
}
const server=spawn(process.execPath,['server/index.js'],{env:{...process.env,PORT:'3086',DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let serverLog='';server.stdout.on('data',d=>serverLog+=d);server.stderr.on('data',d=>serverLog+=d);
const browser=await firefox.launch({headless:process.env.HEADED!=='1',firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}});let page;const errors=[];
try{
 for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:3086/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 await mkdir('test-results',{recursive:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addInitScript(token=>{localStorage.setItem('emberwild-account',JSON.stringify({token}));const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);window.__socket=this;this.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.type==='state')window.__state=m;});}};},token);
 page=await context.newPage();page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:3086/?debug=1');await page.waitForFunction(()=>!document.querySelector('#join').disabled);
 async function enter(name){await page.locator('.character-select').filter({hasText:name}).click();await page.locator('#join').click();await page.waitForFunction(name=>window.__state?.self.name===name&&document.querySelector('#login').classList.contains('hidden'),name);}
 async function logout(){await page.locator('#main-menu-button').click();await page.locator('[data-logout]').click();await page.waitForFunction(()=>!document.querySelector('#login').classList.contains('hidden')&&!document.querySelector('#join').disabled);}
 async function interact(npcId){await page.evaluate(id=>window.__socket.send(JSON.stringify({type:'interact',id})),npcId);await page.locator('#window-dialogue').waitFor();}
 async function check(expected){await page.waitForFunction(expected=>{const ids=[...document.querySelectorAll('#window-dialogue [data-quest-offer]')].map(b=>b.dataset.questOffer);return JSON.stringify(ids)===JSON.stringify(expected);},expected);const ids=await page.locator('#window-dialogue [data-quest-offer]').evaluateAll(nodes=>nodes.map(n=>n.dataset.questOffer));assert.equal(ids.length,new Set(ids).size);}
 async function complete(id){await page.locator(`[data-quest-offer="${id}"]`).click();await page.locator(`[data-quest="${id}"][data-action="complete"]`).click();await page.waitForFunction(id=>window.__state.self.quests[id]?.status==='complete',id);}
 await enter('Orin Visitor');await interact('orin');await check(['relics','class_dawn']);await page.screenshot({path:'test-results/orin-unique-quest-turnins.png'});
 for(let i=0;i<3;i++){await page.locator('[data-goodbye]').click();await interact('orin');await check(['relics','class_dawn']);}
 const before=await page.evaluate(()=>({xp:window.__state.self.xp,blade:window.__state.self.inventory.dawn_blade||0}));await complete('relics');await check(['class_dawn']);assert.equal(await page.evaluate(()=>window.__state.self.inventory.dawn_blade),before.blade+1);assert.equal(await page.evaluate(()=>window.__state.self.xp),before.xp+100);
 await complete('class_dawn');await check([]);await logout();
 await enter('Ilan Visitor');await interact('scout');await check(['beacons','memory']);assert.match(await page.locator('#window-dialogue .window-titlebar').textContent(),/Ilan Wren/);await page.screenshot({path:'test-results/ilan-unique-quest-turnins.png'});
 await complete('beacons');await check(['memory','shards']);assert.equal((await page.locator('[data-quest-offer="memory"] .gossip-mark').textContent()).trim(),'?');assert.equal((await page.locator('[data-quest-offer="shards"] .gossip-mark').textContent()).trim(),'!');
 await page.locator('[data-quest-offer="shards"]').click();await page.locator('[data-quest="shards"][data-action="accept"]').click();await page.waitForFunction(()=>window.__state.self.quests.shards?.status==='active');await check(['memory','shards']);assert.match(await page.locator('[data-quest-offer="shards"]').textContent(),/In progress/);
 await complete('memory');await check(['shards']);await page.locator('[data-goodbye]').click();await interact('scout');await check(['shards']);await logout();await page.reload();await page.waitForFunction(()=>!document.querySelector('#join').disabled);await enter('Ilan Visitor');await interact('scout');await check(['shards']);await logout();
 assert.deepEqual(errors,[]);const result={orinReadyQuestsUnique:true,ilanReadyQuestsUnique:true,reopeningDoesNotDuplicate:true,turnInsDisappear:true,rewardsOnce:true,availableAndActiveFollowupsUnique:true,persistedAfterReload:true,errors};await writeFile('test-results/quest-dialogue-browser.json',JSON.stringify(result,null,2));console.log('PASS:',JSON.stringify(result));
}catch(e){if(page&&!page.isClosed())await page.screenshot({path:'test-results/quest-dialogue-failure.png'}).catch(()=>{});console.error(serverLog,errors);throw e;}
finally{await browser.close();if(server.exitCode===null){const done=once(server,'exit');server.kill('SIGTERM');await done;}await rm(dir,{recursive:true,force:true});}
