import {firefox,chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://127.0.0.1:3081';
const profile=JSON.parse(await readFile(process.env.APPEARANCE_FIXTURE||'/tmp/emberwild-appearance-fixture.json','utf8'));
const engine=process.env.BROWSER==='firefox'?firefox:chromium;
const browser=await engine.launch({headless:process.env.HEADED!=='1',...(engine===firefox?{firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}}:{args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})});
const errors=[];let page,observer;const checked=[];
async function join(saved=null){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(saved=>{
    if(saved)localStorage.setItem('emberwild-character',JSON.stringify(saved));
    const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);this.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.type==='state')window.__state=m;});}};
  },saved);
  const p=await context.newPage();p.setDefaultTimeout(20000);p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/?debug=1');if(!saved)await p.locator('#name').fill(`Observer${Date.now().toString(36)}`);
  await p.locator('#join').click();await p.waitForFunction(()=>window.emberwildDebug?.character);return p;
}
async function expectGear(slot,item){
  for(const p of [page,observer])await p.waitForFunction(({id,slot,item})=>{
    const unit=window.emberwildDebug.units.find(u=>u.id===id);
    return unit&&(unit.equipment?.[slot]?.item??null)===item;
  },{id:profile.id,slot,item});
  await page.waitForFunction(({slot,item})=>window.__state.self.equipment[slot]===item,{slot,item});
}
async function equip(item,slot){
  await page.locator(`#window-bags .bag-slot[data-item="${item}"]`).click({button:'right'});await expectGear(slot,item);checked.push(item);
}
async function camera(dx,dy){
  await page.mouse.move(640,370);await page.mouse.down({button:'right'});await page.mouse.move(640+dx,370+dy,{steps:18});await page.mouse.up({button:'right'});await page.waitForTimeout(250);
}
async function walk(key,axis,value,direction){
  await page.keyboard.down(key);try{await page.waitForFunction(({axis,value,direction})=>direction*window.emberwildDebug.local[axis]>=direction*value,{axis,value,direction});}finally{await page.keyboard.up(key);}await page.waitForTimeout(200);
}
try{
  await mkdir('test-results',{recursive:true});page=await join(profile);observer=await join();await observer.keyboard.press('KeyD',{delay:450});
  await page.bringToFront();await expectGear('weapon','training_blade');await expectGear('armor','linen_coat');await expectGear('offhand',null);
  await page.mouse.move(640,370);await page.mouse.wheel(0,-667);await camera(0,-60);
  await page.screenshot({path:'test-results/appearance-starter.png'});
  await page.keyboard.press('KeyB');await page.keyboard.press('KeyC');
  await page.locator('[data-equipment="weapon"]').click({button:'right'});await expectGear('weapon',null);
  await page.locator('[data-equipment="armor"]').click({button:'right'});await expectGear('armor',null);
  for(const [id,slot]of [['training_blade','weapon'],['copper_blade','weapon'],['dawn_blade','weapon'],['linen_coat','armor'],['bark_coat','armor'],['sentinel_coat','armor']])await equip(id,slot);
  const before=await page.evaluate(()=>window.emberwildDebug.units.find(u=>u.id===window.__state.self.id).equipment);
  await page.locator('#window-bags .bag-slot[data-item="trail_charm"]').click({button:'right'});await page.waitForFunction(()=>window.__state.self.equipment.charm==='trail_charm');
  assert.deepEqual(await page.evaluate(()=>window.emberwildDebug.units.find(u=>u.id===window.__state.self.id).equipment),before,'jewelry has no visible prop');
  await page.keyboard.press('KeyC');await page.keyboard.press('KeyB');await walk('KeyD','x',7,1);await page.keyboard.press('KeyF');await page.locator('[data-shop]').click();
  for(const [slot,item,label]of [['offhand','outpost_buckler','Off hand'],['head','trail_cap','Head'],['legs','road_trousers','Legs'],['feet','wayfarer_boots','Feet']]){
    const buy=page.locator(`[data-buy="${item}"]`);assert.match(await buy.textContent(),new RegExp(label));await buy.click();
    await page.waitForFunction(item=>window.__state.self.inventory[item]===1,item);
  }
  await page.locator('#window-merchant .window-close').click();
  for(const [slot,item]of [['offhand','outpost_buckler'],['head','trail_cap'],['legs','road_trousers'],['feet','wayfarer_boots']])await equip(item,slot);
  await page.keyboard.press('KeyB');
  await page.keyboard.press('KeyS',{delay:100});await page.waitForTimeout(250);
  await page.screenshot({path:'test-results/appearance-full-outfit.png'});await camera(262,0);await page.screenshot({path:'test-results/appearance-side.png'});await camera(-262,0);
  await observer.bringToFront();await observer.mouse.move(700,370);await observer.mouse.wheel(0,-500);await observer.waitForTimeout(300);await observer.screenshot({path:'test-results/appearance-peer.png'});await page.bringToFront();
  await page.keyboard.press('KeyC');await page.keyboard.press('KeyB');
  // Every slot can be removed and put back without leaving ghost equipment.
  const outfit={weapon:'dawn_blade',armor:'sentinel_coat',offhand:'outpost_buckler',head:'trail_cap',legs:'road_trousers',feet:'wayfarer_boots'};
  for(const [slot,item]of Object.entries(outfit)){await page.locator(`[data-equipment="${slot}"]`).click({button:'right'});await expectGear(slot,null);await equip(item,slot);}
  await page.keyboard.press('KeyC');await page.keyboard.press('KeyB');
  await page.keyboard.down('KeyW');await page.waitForFunction(()=>window.emberwildDebug.character.blend>.8);await page.screenshot({path:'test-results/appearance-running.png'});await page.keyboard.up('KeyW');
  await page.keyboard.press('Space');await page.waitForFunction(()=>window.emberwildDebug.character.air>.8);await page.screenshot({path:'test-results/appearance-jump.png'});await page.waitForFunction(()=>window.emberwildDebug.character.air<.01);
  await page.keyboard.press('Digit3');await page.locator('#cast-bar').waitFor({state:'visible'});await page.screenshot({path:'test-results/appearance-casting.png'});await page.locator('#cast-bar').waitFor({state:'hidden'});
  await page.locator('#main-menu-button').click();await page.locator('[data-logout]').click();await page.locator('#login').waitFor({state:'visible'});
  await observer.waitForFunction(id=>!window.emberwildDebug.units.some(u=>u.id===id),profile.id);
  await page.locator('#join').click();await page.waitForFunction(()=>window.emberwildDebug.character);
  for(const [slot,item]of Object.entries(outfit))await expectGear(slot,item);
  await page.reload();await page.locator('#join').click();await page.waitForFunction(()=>window.emberwildDebug.character);
  for(const [slot,item]of Object.entries(outfit))await expectGear(slot,item);
  await page.setViewportSize({width:1280,height:720});await page.waitForTimeout(250);await page.screenshot({path:'test-results/appearance-1280x720.png'});
  assert.equal(await page.evaluate(()=>window.emberwildDebug.environment.shaderErrors),0);assert.deepEqual(errors,[]);
  const result={modelsChecked:[...new Set(checked)],sixVisibleSlots:true,peerEquipUnequip:true,boughtTrailGear:true,noJewelryProp:true,animatedMovementJumpAndCasting:true,logoutResume:true,reloadPersistence:true,errors};
  await writeFile('test-results/appearance-results.json',JSON.stringify(result,null,2));console.log('PASS:',JSON.stringify(result));
}catch(e){if(page&&!page.isClosed()){console.error(await page.evaluate(()=>({local:window.emberwildDebug?.local,gear:window.emberwildDebug?.units.find(u=>u.id===window.__state?.self.id)?.equipment})));await page.screenshot({path:'test-results/appearance-failure.png'}).catch(()=>{});}throw e;}
finally{await browser.close();}
