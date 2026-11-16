import {beginCameraDrag,moveCameraBy,endCameraDrag} from './camera-input.js';
import { chromium, firefox } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base=process.env.TEST_URL||'http://127.0.0.1:3080';
await mkdir('test-results',{recursive:true});
const engine=process.env.BROWSER==='firefox'?firefox:chromium;
const browser=await engine.launch({headless:process.env.HEADED!=='1',...(engine===firefox?{firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}}:{args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})});
const errors=[];
let page;
const observeGameState=()=>{
    window.__maxJumpHeight=0;
    const NativeWebSocket=window.WebSocket;
    window.WebSocket=class extends NativeWebSocket{
      constructor(...args){super(...args);this.addEventListener('message',event=>{
        const msg=JSON.parse(event.data);if(msg.type==='state'){window.__latestGameState=msg;window.__maxJumpHeight=Math.max(window.__maxJumpHeight,msg.self.jumpHeight||0);}
      });}
    };
};
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(observeGameState);
  page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?debug=1');await page.waitForTimeout(1600);
  await page.screenshot({path:'test-results/title.png'});
  const name=`Scout${Date.now().toString(36)}`;
  await page.locator('#name').fill(name);await page.locator('#join').click();
  await page.locator('#hud').waitFor({state:'visible'});await page.locator('#player-name').filter({hasText:name}).waitFor();
  await page.waitForTimeout(1000);await page.screenshot({path:'test-results/hearthstead.png'});
  assert.equal(await page.locator('#extra-bag-slots [data-bag-equip]').count(),4);
  await page.locator('#minimap-tracking-button').click();await page.locator('[data-tracking="herbs"]').check();await page.locator('[data-tracking="mining"]').check();await page.keyboard.press('Escape');
  for(let i=0;i<8;i++){if(await page.locator('#minimap-zoom-out').isDisabled())break;await page.locator('#minimap-zoom-out').click();}
  await page.waitForFunction(()=>document.querySelector('#minimap').dataset.markerIds.includes('object:ore0'));
  await page.locator('#minimap-tracking-button').click();await page.screenshot({path:'test-results/map-tracking-filters.png'});
  for(const[id,npc]of[['questGivers','elowen'],['inns','sera'],['trainers','orin'],['merchants','tavi']]){
    await page.locator(`[data-tracking="${id}"]`).uncheck();await page.waitForFunction(npc=>!document.querySelector('#minimap').dataset.markerIds.split('|').includes(`npc:${npc}`),npc);await page.locator(`[data-tracking="${id}"]`).check();
  }
  await page.keyboard.press('Escape');for(let i=0;i<3;i++)await page.locator('#minimap-zoom-in').click();
  await beginCameraDrag(page,'right',700,400);assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('camera-dragging')),true);assert.equal(await page.locator('#world').evaluate(el=>getComputedStyle(el).cursor),'none');
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('camera-dragging')),false);await page.mouse.up({button:'right'});

  await page.keyboard.press('Space');await page.waitForFunction(()=>window.__maxJumpHeight>1);await page.waitForFunction(()=>window.__latestGameState.self.jumpHeight===0);
  assert.equal(await page.evaluate(()=>window.__latestGameState.self.auto),false,'Space must jump without enabling autoattack');
  async function walkUntil(code,axis,limit,direction){
    await page.keyboard.down(code);
    try{await page.waitForFunction(({axis,limit,direction})=>direction*window.__latestGameState.self[axis]>=direction*limit,{axis,limit,direction},{timeout:10000});}
    finally{await page.keyboard.up(code);}
    await page.waitForTimeout(200);
  }
  async function accept(id){await page.locator(`[data-quest-offer="${id}"]`).click();await page.locator(`[data-quest="${id}"][data-action="accept"]`).click();await page.waitForFunction(id=>window.__latestGameState.self.quests[id]?.status==='active',id);}
  assert.equal(await page.locator('.action-slot').count(),12);
  await page.keyboard.press('KeyB');await page.keyboard.press('KeyC');await page.keyboard.press('KeyP');
  await page.locator('#window-spellbook').waitFor();assert.equal(await page.locator('.game-window').count(),3);
  assert.equal(await page.locator('.bag-slot').count(),20);
  assert.equal(await page.locator('#modal-backdrop').count(),0,'Windows must leave the world unobstructed');
  await page.locator('#window-character [data-equipment="weapon"]').click({button:'right'});
  await page.waitForFunction(()=>window.__latestGameState.self.equipment.weapon===null);
  const blade=page.locator('#window-bags [data-item="training_blade"]');await blade.waitFor();await blade.hover();
  await page.locator('#game-tooltip').waitFor({state:'visible'});assert.match(await page.locator('#game-tooltip').textContent(),/Wayfarer/);
  await blade.click({button:'right'});await page.waitForFunction(()=>window.__latestGameState.self.equipment.weapon==='training_blade');
  await page.locator('#window-bags [data-item="potion"]').dragTo(page.locator('[data-bag-slot="19"]'));
  await page.waitForFunction(()=>document.querySelector('[data-bag-slot="19"]').dataset.item==='potion');
  await page.locator('#window-spellbook [data-action-id="strike"]').dragTo(page.locator('.action-slot[data-slot="6"]'));
  await page.waitForFunction(()=>document.querySelector('.action-slot[data-slot="6"]').dataset.actionId==='strike');
  await page.keyboard.down('Shift');await page.locator('.action-slot[data-slot="6"]').dragTo(page.locator('.action-slot[data-slot="7"]'));await page.keyboard.up('Shift');
  await page.waitForFunction(()=>document.querySelector('.action-slot[data-slot="7"]').dataset.actionId==='strike');
  const header=page.locator('#window-spellbook .window-titlebar'),before=await header.boundingBox();
  await page.mouse.move(before.x+120,before.y+20);await page.mouse.down();await page.mouse.move(before.x+235,before.y+35,{steps:8});await page.mouse.up();
  assert.ok((await header.boundingBox()).x>before.x+80,'Windows must be draggable');
  await page.screenshot({path:'test-results/classic-windows.png'});
  await walkUntil('KeyW','z',27,-1);assert.equal(await page.locator('.game-window').count(),3,'Moving must not close inventory, character or spellbook');
  await page.keyboard.press('KeyP');await page.keyboard.press('KeyC');await page.keyboard.press('KeyB');
  await page.keyboard.press('KeyF');await page.locator('#window-dialogue').waitFor();
  assert.match(await page.locator('#window-dialogue .window-titlebar').textContent(),/Elowen/);
  await page.locator('[data-quest-offer="welcome"]').click();
  const questWindow=await page.locator('#window-dialogue').boundingBox();assert.ok(questWindow.width<400&&questWindow.x<80);
  await page.screenshot({path:'test-results/quest-window.png'});
  await page.locator('[data-quest="welcome"]').click();await page.waitForFunction(()=>window.__latestGameState.self.quests.welcome?.status==='active');await page.keyboard.press('Escape');
  await walkUntil('KeyA','x',-8,-1);await page.keyboard.press('KeyF');await page.locator('[data-quest-offer="welcome"]').click();
  await page.locator('[data-quest="welcome"][data-action="complete"]').click();await page.waitForFunction(()=>window.__latestGameState.self.quests.welcome.status==='complete');
  assert.equal(await page.locator('#modal-backdrop').count(),0);await accept('herbs');await page.keyboard.press('Escape');
  await walkUntil('KeyD','x',0,1);await page.keyboard.press('KeyF');await accept('meadow');await page.keyboard.press('Escape');
  await walkUntil('KeyD','x',8,1);await page.keyboard.press('KeyF');await accept('seeds');
  await page.waitForFunction(()=>document.querySelector('#minimap').dataset.questIds.includes('meadow')&&document.querySelector('#minimap').dataset.questIds.includes('herbs'));
  const pin=await page.evaluate(()=>{const marker=window.emberwildDebug.minimap.markers.find(m=>m.kind==='quest'),current=window.__latestGameState.self.trackedQuest;return {...marker,expected:marker.quests[(marker.quests.indexOf(current)+1)%marker.quests.length]};});
  const mapRect=await page.locator('#minimap').boundingBox();await page.mouse.move(mapRect.x+pin.x*mapRect.width/220,mapRect.y+pin.y*mapRect.height/180);await page.locator('#map-marker-tooltip').waitFor({state:'visible'});
  await page.mouse.click(mapRect.x+pin.x*mapRect.width/220,mapRect.y+pin.y*mapRect.height/180);await page.waitForFunction(id=>window.__latestGameState.self.trackedQuest===id,pin.expected);
  await page.locator('#minimap-tracking-button').click();await page.locator('[data-tracking="objectives"]').uncheck();await page.locator('#minimap-objective').waitFor({state:'hidden'});await page.locator('[data-tracking="objectives"]').check();await page.keyboard.press('Escape');
  await page.screenshot({path:'test-results/quest-navigation.png'});
  await page.locator('[data-shop]').click();await page.locator('#window-merchant').waitFor();await page.locator('#window-bags').waitFor();
  await page.screenshot({path:'test-results/merchant.png'});await page.locator('#window-merchant .window-close').click();await page.keyboard.press('KeyB');
  await page.keyboard.press('KeyM');await page.locator('#zone-map').waitFor();await page.screenshot({path:'test-results/map.png'});await page.keyboard.press('Escape');
  await page.keyboard.press('KeyL');assert.match(await page.locator('#window-journal').textContent(),/A small, sharp problem/);assert.equal(await page.locator('[data-journal-quest]').count(),3,'Quest log defaults to current quests');
  await page.locator('[data-journal-filter="completed"]').click();assert.equal(await page.locator('[data-journal-quest="welcome"]').count(),1);await page.keyboard.press('Escape');
  await walkUntil('KeyA','x',-17,-1);await walkUntil('KeyW','z',19,-1);await page.keyboard.press('Tab');await page.locator('#target-frame').waitFor({state:'visible'});
  const selected=page.locator('.nameplate.enemy.selected');await selected.waitFor({state:'visible'});const enemyLabel=await selected.boundingBox();
  const enemyX=enemyLabel.x+enemyLabel.width/2,enemyY=enemyLabel.y+enemyLabel.height+40;
  await beginCameraDrag(page,'right',enemyX-30,enemyY);await moveCameraBy(page,30);await moveCameraBy(page,-30);await endCameraDrag(page);
  await page.waitForTimeout(200);assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('camera-dragging')),false);assert.equal(await page.evaluate(()=>window.__latestGameState.self.auto),false,'Dragging must not start autoattack');
  for(const offset of [40,55,25,70]){
    const label=await selected.boundingBox();await page.mouse.click(label.x+label.width/2,label.y+label.height+offset,{button:'right'});await page.waitForTimeout(200);
    if(await page.evaluate(()=>window.__latestGameState.self.auto))break;
  }
  assert.equal(await page.evaluate(()=>window.__latestGameState.self.auto),true,'Right-clicking an enemy must enable autoattack');
  await page.keyboard.press('Space');await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>window.__latestGameState.self.auto),true,'Jumping must not disable autoattack');
  async function fightUntil(count){
    for(let i=0;i<35;i++){if(await page.evaluate(count=>(window.__latestGameState.self.quests.meadow?.progress||0)>=count,count))return;await page.keyboard.press('Digit2');await page.keyboard.press('Digit1');await page.waitForTimeout(800);}
    throw Error('Combat did not complete');
  }
  await fightUntil(1);
  const purse=await page.evaluate(()=>window.__latestGameState.self.gold);
  await page.keyboard.press('KeyF');await page.locator('#window-loot').waitFor();
  assert.equal(await page.evaluate(()=>window.__latestGameState.self.gold),purse,'Opening loot must not collect it');
  await page.keyboard.press('KeyB');await page.screenshot({path:'test-results/loot-window.png'});
  await page.locator('[data-loot-slot="coins"]').click();await page.waitForFunction(before=>window.__latestGameState.self.gold===before+3,purse);
  await page.locator('[data-loot-slot="seeds"]').click();await page.waitForFunction(()=>window.__latestGameState.self.inventory.seed_pouch===1);
  await page.locator('[data-loot-slot="resin"]').click();await page.locator('#window-loot').waitFor({state:'detached'});
  assert.equal(await page.locator('#window-bags [data-item="seed_pouch"]').count(),1);await page.keyboard.press('KeyB');
  await walkUntil('KeyA','x',-26,-1);await page.keyboard.press('Tab');await fightUntil(2);
  await page.keyboard.down('Shift');await page.keyboard.press('KeyF');await page.keyboard.up('Shift');
  await page.waitForFunction(()=>window.__latestGameState.self.inventory.seed_pouch===2);
  assert.equal(await page.locator('#window-loot').count(),0,'Shift-loot must collect without opening a window');
  await page.screenshot({path:'test-results/combat.png'});
  await walkUntil('KeyW','z',15,-1);await walkUntil('KeyD','x',7,1);await walkUntil('KeyS','z',27,1);await page.keyboard.press('KeyF');
  await page.locator('[data-shop]').click();const gold=await page.evaluate(()=>window.__latestGameState.self.gold);
  await page.locator('#window-bags [data-item="resin"]').click({button:'right',modifiers:['Shift']});
  await page.waitForFunction(gold=>window.__latestGameState.self.gold===gold+6,gold);
  const potions=await page.evaluate(()=>window.__latestGameState.self.inventory.potion);
  await page.locator('[data-buy="potion"]').click();await page.waitForFunction(potions=>window.__latestGameState.self.inventory.potion===potions+1,potions);
  await page.locator('[data-buy="linen_pouch"]').click();await page.waitForFunction(()=>window.__latestGameState.self.inventory.linen_pouch===1);
  await page.locator('#window-bags .bag-slot[data-item="linen_pouch"]').dragTo(page.locator('#extra-bag-slots [data-bag-equip="0"]'));
  await page.waitForFunction(()=>window.__latestGameState.self.bags[0]==='linen_pouch');assert.equal(await page.locator('.bag-slot').count(),26);
  await page.locator('#window-merchant .window-close').click();await page.locator('#extra-bag-slots [data-bag-equip="0"]').click({button:'right'});await page.waitForFunction(()=>window.__latestGameState.self.bags[0]===null);
  await page.locator('#window-bags .bag-slot[data-item="linen_pouch"]').click({button:'right'});await page.waitForFunction(()=>window.__latestGameState.self.bags[0]==='linen_pouch');
  await page.screenshot({path:'test-results/expanded-bags.png'});await page.keyboard.press('KeyB');
  const other=await browser.newContext({viewport:{width:1280,height:900}});await other.addInitScript(observeGameState);const page2=await other.newPage();page2.on('pageerror',e=>errors.push(e.message));
  await page2.goto(base);await page2.locator('#name').fill(`Ally${Date.now().toString(36)}`);await page2.locator('#join').click();await page2.locator('#hud').waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelector('#online').textContent.includes('2 adventurers'));
  await page.evaluate(()=>{window.__maxJumpHeight=0;});await page.keyboard.press('Space');
  await page2.waitForFunction(name=>window.__latestGameState?.players.some(p=>p.name===name&&p.jumpHeight>0),name);
  await page.keyboard.press('Enter');await page.locator('#chat-input').fill('The hearth is shared.');await page.keyboard.press('Enter');
  await page2.locator('#chat-messages').getByText('The hearth is shared.',{exact:false}).waitFor();
  await page2.screenshot({path:'test-results/multiplayer.png'});
  await other.close();
  await page.reload();await page.locator('#join').click();await page.locator('#hud').waitFor({state:'visible'});
  assert.match(await page.locator('#quest-content').textContent(),/2\/6/);
  await page.waitForFunction(()=>document.querySelector('.action-slot[data-slot="7"]').dataset.actionId==='strike');
  await page.keyboard.press('KeyB');await page.waitForFunction(()=>document.querySelector('[data-bag-slot="19"]').dataset.item==='potion');assert.equal(await page.locator('.bag-slot').count(),26);await page.keyboard.press('KeyB');
  await page.locator('#minimap-tracking-button').click();assert.equal(await page.locator('[data-tracking="mining"]').isChecked(),true);assert.equal(await page.locator('[data-tracking="herbs"]').isChecked(),true);await page.keyboard.press('Escape');
  await walkUntil('KeyW','z',15,-1);await walkUntil('KeyA','x',-43,-1);await walkUntil('KeyW','z',8,-1);await page.keyboard.press('KeyF');
  await page.waitForFunction(()=>window.__latestGameState.self.inventory.copper_ore===1&&window.__latestGameState.self.harvestCooldowns.ore0>0);
  await page.waitForFunction(()=>!document.querySelector('#minimap').dataset.markerIds.includes('object:ore0'));
  await walkUntil('KeyD','x',-38,1);await walkUntil('KeyW','z',4,-1);await page.keyboard.press('KeyF');await page.waitForFunction(()=>window.__latestGameState.self.inventory.sunmint===1&&window.__latestGameState.self.quests.herbs.progress===1);
  await page.screenshot({path:'test-results/resource-tracking.png'});
  assert.equal(errors.length,0,errors.join('\n'));
  await page.setViewportSize({width:1280,height:720});await page.keyboard.press('KeyB');await page.waitForTimeout(250);
  const dock=await page.locator('#utility-dock').boundingBox(),bar=await page.locator('#action-bar-frame').boundingBox();assert.ok(dock.y+dock.height<=bar.y||dock.x>=bar.x+bar.width,'Bag dock must clear the action bar');
  await page.screenshot({path:'test-results/bags-tracking-1280x720.png'});
  console.log('PASS: bag expansion and persistence, drag equipment, cursor hide/restore, quest pins and filters, gathering, draggable nonmodal quest windows, simultaneous bags/character/spellbook, movement with panels open, equip/unequip, tooltips, 12 action slots, spell drag/drop and saved layout, explicit per-slot loot, quick loot, quest items, merchant buy/sell, quest turn-in, map/log, combat, jumping, two-client chat and character resume.');
}catch(e){if(page){console.error(await page.locator('#coords').textContent(),await page.locator('#target-frame').textContent());await page.screenshot({path:'test-results/failure.png'}).catch(()=>{});}throw e;}finally{await browser.close();}
