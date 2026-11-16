import {firefox} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {RACES,CLASSES,validRaceClass} from '../shared/adventurers.js';
const base=process.env.TEST_URL||'http://127.0.0.1:3081';
const browser=await firefox.launch({headless:process.env.HEADED!=='1',firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);this.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.type==='state')window.__state=m;});}};});
const race=id=>page.locator(`[data-race-choice="${id}"]`),cls=id=>page.locator(`[data-class-choice="${id}"]`),tip=page.locator('#creation-tooltip');
async function tooltip(kind,id){await page.waitForFunction(({kind,id})=>{const t=document.querySelector('#creation-tooltip');return !t.classList.contains('hidden')&&t.dataset.kind===kind&&t.dataset.identity===id;},{kind,id});const r=await tip.boundingBox(),v=page.viewportSize();assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<=v.width&&r.y+r.height<=v.height);}
async function preview(r,c){await page.waitForFunction(({r,c})=>{const p=document.querySelector('#character-preview');return p.dataset.raceId===r&&p.dataset.classId===c;},{r,c});}
try{
 await mkdir('test-results',{recursive:true});await page.goto(base+'/?debug=1');await page.waitForFunction(()=>!document.querySelector('#join').disabled);
 assert.equal(await page.locator('[data-race-choice]').count(),5);assert.equal(await page.locator('[data-class-choice]').count(),4);await preview('human','dawnwarden');
 const symbols=await page.evaluate(async()=>{const doc=new DOMParser().parseFromString(await(await fetch('/icons.svg')).text(),'image/svg+xml');return [...document.querySelectorAll('.identity-choice use')].map(el=>({id:el.getAttribute('href').split('#')[1],exists:!!doc.getElementById(el.getAttribute('href').split('#')[1])}));});assert.equal(new Set(symbols.map(s=>s.id)).size,9);assert.ok(symbols.every(s=>s.exists));
 const combos=[];
 for(const r of Object.values(RACES)){
  await race(r.id).click();await tooltip('race',r.id);assert.ok((await tip.textContent()).includes(r.description));assert.match(await tip.textContent(),/Races have no stat bonuses/);for(const id of r.classes)assert.ok((await tip.textContent()).includes(CLASSES[id].name));
  const p=await page.locator('#identity-fields').boundingBox(),t=await tip.boundingBox();assert.ok(t.x>=p.x+p.width,'tooltip must not cover neighboring choices');
  for(const c of Object.values(CLASSES)){
   const allowed=validRaceClass(r.id,c.id);assert.equal(await cls(c.id).getAttribute('aria-disabled'),String(!allowed));
   if(allowed){await cls(c.id).click();await preview(r.id,c.id);assert.equal(await cls(c.id).getAttribute('aria-pressed'),'true');combos.push([r.id,c.id]);}
   else{const before=await page.locator('#character-preview').getAttribute('data-class-id');await cls(c.id).hover();await tooltip('class',c.id);assert.match(await tip.textContent(),/Unavailable to/);assert.ok((await tip.textContent()).includes(r.tradition));await cls(c.id).click({force:true});assert.equal(await page.locator('#character-preview').getAttribute('data-class-id'),before,'unavailable clicks cannot change the draft');}
  }
 }
 assert.equal(combos.length,16);
 await race('human').click();await cls('dawnwarden').click();await race('sylvren').click();await preview('sylvren','arcanist');assert.equal(await cls('arcanist').getAttribute('aria-pressed'),'true','invalid combinations fall back to an allowed class');
 for(const c of Object.values(CLASSES)){
  await cls(c.id).hover();await tooltip('class',c.id);for(const text of ['Playstyle','Early abilities',c.resource,c.armor])assert.ok((await tip.textContent()).includes(text));
 }
 await cls('arcanist').focus();await tooltip('class','arcanist');assert.equal(await cls('arcanist').getAttribute('aria-describedby'),'creation-tooltip');await page.keyboard.press('Escape');await tip.waitFor({state:'hidden'});assert.equal(await cls('arcanist').getAttribute('aria-describedby'),null);
 // Keyboard-only activation updates both identity and the real model preview.
 await race('cairnkin').focus();await tooltip('race','cairnkin');await page.keyboard.press('Enter');await cls('stormcaller').focus();await page.keyboard.press('Space');await preview('cairnkin','stormcaller');
 await page.locator('#name').fill('Stone'+Date.now().toString(36));await cls('stormcaller').hover();await tooltip('class','stormcaller');await page.screenshot({path:'test-results/identity-class-tooltip.png'});
 await race('cairnkin').hover();await tooltip('race','cairnkin');await page.screenshot({path:'test-results/identity-race-tooltip.png'});
 await page.mouse.move(1100,400);await page.locator('#name').focus();await tip.waitFor({state:'hidden'});
 await page.setViewportSize({width:1280,height:720});await cls('stormcaller').hover();await tooltip('class','stormcaller');await page.screenshot({path:'test-results/identity-1280x720.png'});await page.keyboard.press('Escape');
 // Tooltip closes on scroll and cannot float over the character list or world.
 await cls('stormcaller').focus();await tooltip('class','stormcaller');await page.locator('.login-copy').evaluate(el=>el.scrollTop=el.scrollHeight);await tip.waitFor({state:'hidden'});
 await page.locator('#save-character').click();await page.waitForFunction(()=>!document.querySelector('#join').disabled&&!document.querySelector('#character-list').classList.contains('hidden'));await tip.waitFor({state:'hidden'});await preview('cairnkin','stormcaller');
 await page.reload();await page.waitForFunction(()=>!document.querySelector('#join').disabled);await preview('cairnkin','stormcaller');await page.locator('#customize-character').click();assert.equal(await page.locator('#identity-fields').isVisible(),false);await page.locator('#cancel-create').click();
 await page.locator('#join').click();await page.waitForFunction(()=>window.__state?.self.raceId==='cairnkin'&&document.querySelector('#login').classList.contains('hidden'));assert.equal(await page.evaluate(()=>window.__state.self.classId),'stormcaller');assert.equal(await page.evaluate(()=>window.__state.self.equipment.weapon),'training_mace');assert.equal(await tip.isVisible(),false);
 await page.locator('#main-menu-button').click();await page.locator('[data-logout]').click();await page.waitForFunction(()=>!document.querySelector('#login').classList.contains('hidden')&&!document.querySelector('#join').disabled);await preview('cairnkin','stormcaller');
 assert.deepEqual(errors,[]);const result={raceIcons:5,classIcons:4,validCombinations:combos.length,racialDifferencesAccurate:true,classFantasyAndEarlySkills:true,unavailableReasons:true,keyboardAndEscape:true,tooltipDoesNotBlockChoices:true,compactViewport:true,previewAndSavedIdentity:true,identityFixedWhenCustomizing:true,worldEntryAndLogout:true,errors};await writeFile('test-results/identity-picker-results.json',JSON.stringify(result,null,2));console.log('PASS:',JSON.stringify(result));
}catch(e){console.error(await page.locator('#login-error').textContent().catch(()=>null));await page.screenshot({path:'test-results/identity-picker-failure.png'}).catch(()=>{});throw e;}finally{await browser.close();}
