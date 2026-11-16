import {beginCameraDrag,moveCameraBy,endCameraDrag} from './camera-input.js';
import {firefox,chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const engine=process.env.BROWSER==='firefox'?firefox:chromium;
const browser=await engine.launch({headless:process.env.HEADED!=='1',...(engine===firefox?{firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}}:{args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})});
const errors=[];let page;
async function join(prefix){
  const p=await browser.newPage({viewport:{width:1280,height:720}});
  await p.addInitScript(()=>{const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);window.__socket=this;this.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.type==='state')window.__state=m;});}};});
  p.setDefaultTimeout(20000);p.on('pageerror',e=>errors.push(e.message));
  await p.goto((process.env.TEST_URL||'http://127.0.0.1:3081')+'/?debug=1');
  await p.locator('#name').fill(`${prefix}${Date.now().toString(36)}`);await p.locator('#join').click();
  await p.waitForFunction(()=>window.emberwildDebug?.character);
  return p;
}
async function orbit(){
  await beginCameraDrag(page,'right',640,360);
  await page.evaluate(()=>window.__samplingPhase='drag');
  // Return to the same position so the next walk uses the original heading.
  for(let i=1;i<=48;i++){
    const t=i/48*Math.PI*2,previous=(i-1)/48*Math.PI*2;
    await moveCameraBy(page,310*(Math.sin(t)-Math.sin(previous)),65*(Math.sin(t*2)-Math.sin(previous*2)));
    await page.waitForTimeout(18);
  }
  await endCameraDrag(page);await page.waitForTimeout(200);
  await page.evaluate(()=>window.__samplingPhase='still');await page.waitForTimeout(350);
}
async function walk(key,axis,value,direction){
  await page.keyboard.down(key);
  try{await page.waitForFunction(({axis,value,direction})=>direction*window.emberwildDebug.local[axis]>=direction*value,{axis,value,direction});}
  finally{await page.keyboard.up(key);}
  await page.waitForTimeout(250);
}
try{
  await mkdir('test-results',{recursive:true});page=await join('Anchor');
  const ally=await join('Companion');
  await ally.keyboard.press('KeyA',{delay:400});
  // Pointer lock checks native window focus as well as the active tab.
  await page.bringToFront();await page.evaluate(()=>window.focus());await page.mouse.click(900,350);await page.waitForTimeout(400);
  const frameStyle=()=>page.locator('#target-frame').evaluate(el=>({font:getComputedStyle(el).fontSize,width:getComputedStyle(el).width}));
  const beforeFrame=await frameStyle();
  async function passiveSelect(id){await page.evaluate(id=>window.__socket.send(JSON.stringify({type:'target',id,passive:true})),id);await page.waitForFunction(id=>window.__state.self.target===id,id);}
  await passiveSelect('elowen');const friendly=page.locator('.nameplate.npc.selected');await friendly.waitFor({state:'visible'});assert.equal(await friendly.locator('.mini-health.friendly').count(),1);assert.equal(await friendly.locator('.name').evaluate(el=>getComputedStyle(el).fontSize),'15px');
  const companion=await page.evaluate(()=>window.__state.players.find(p=>p.id!==window.__state.self.id).id);await passiveSelect(companion);await page.locator('.nameplate.player.selected .mini-health.friendly').waitFor({state:'visible'});assert.equal(await page.locator('.nameplate.npc:not(.selected) .mini-health').count(),0);assert.deepEqual(await frameStyle(),beforeFrame);

  await page.evaluate(()=>{
    window.__anchorSamples=[];window.__samplingPhase='still';window.__sampleAnchors=true;
    function sample(){
      if(!window.__sampleAnchors)return;
      // The game has rendered by this callback. Compare each HTML anchor with
      // the actual model anchor projected using the camera from that render.
      for(const unit of window.emberwildDebug.units){
        const el=document.querySelector(`.nameplate[data-unit-id="${unit.id}"]`);
        if(!el||el.style.display==='none'||!unit.nameplate.visible)continue;
        const r=el.getBoundingClientRect(),p=unit.nameplate;
        if(!r.width||!r.height||p.x<0||p.x>innerWidth||p.y<0||p.y>innerHeight)continue;
        window.__anchorSamples.push({phase:window.__samplingPhase,kind:unit.kind,
          quest:!!el.querySelector('.quest-marker'),health:!!el.querySelector('.mini-health'),
          error:Math.hypot(r.left+r.width/2-p.x,r.bottom-p.y)});
      }
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await orbit();
  await page.mouse.wheel(0,-180);await page.waitForTimeout(250);await orbit();
  await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(250);
  await walk('KeyA','x',-17,-1);await walk('KeyW','z',24,-1);
  await page.keyboard.press('Tab');const selected=page.locator('.nameplate.enemy.selected');await selected.waitFor({state:'visible'});
  const dimensions=await selected.locator('.mini-health').evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,max:Number(el.dataset.maxHealth),step:Number(el.dataset.healthTick)}));assert.equal(dimensions.width,126);assert.equal(dimensions.height,12);assert.equal(dimensions.step,100);
  assert.ok(await page.locator('.nameplate.enemy:not(.selected) .mini-health').count()>0);const ordinary=await page.locator('.nameplate.enemy:not(.selected) .mini-health').first().evaluate(el=>({width:getComputedStyle(el).width,height:getComputedStyle(el).height}));assert.equal(ordinary.width,'80px');assert.equal(ordinary.height,'7px');
  const ticks=await selected.locator('.health-tick').evaluateAll(nodes=>nodes.map(n=>({value:Number(n.dataset.healthValue),percent:parseFloat(n.style.left)})));assert.equal(ticks.length,Math.ceil(dimensions.max/100)-1);for(const t of ticks)assert.ok(Math.abs(t.percent-t.value/dimensions.max*100)<.001);
  const tickSizes=await page.evaluate(async()=>{const {healthTicks}=await import('/nameplate-health.js');return [720,1300,1000000].map(max=>({max,...healthTicks(max)}));});assert.equal(tickSizes[0].marks.find(t=>t.value===500).major,true);assert.equal(tickSizes[0].marks.length,7);assert.equal(tickSizes[1].marks.length,12);assert.ok(tickSizes[2].marks.length<20);
  await page.keyboard.press('Digit2');await page.waitForFunction(()=>{const label=document.querySelector('.nameplate.enemy.selected .mini-health');return Number(label?.getAttribute('aria-valuenow'))<Number(label?.getAttribute('aria-valuemax'));});await page.evaluate(()=>window.__socket.send(JSON.stringify({type:'auto',enabled:false})));assert.ok((await selected.locator('.mini-health-value').textContent()).includes('/'));
  await page.screenshot({path:'test-results/selected-overhead-nameplate.png'});assert.deepEqual(await frameStyle(),beforeFrame);await orbit();
  await page.keyboard.press('Space');await orbit();
  const samples=await page.evaluate(()=>{window.__sampleAnchors=false;return window.__anchorSamples;});
  const moving=samples.filter(s=>s.phase==='drag'),still=samples.filter(s=>s.phase==='still');
  const result={movingSamples:moving.length,maxMovingError:Math.max(...moving.map(s=>s.error)),
    maxStillError:Math.max(...still.map(s=>s.error)),
    kinds:[...new Set(moving.map(s=>s.kind))],questMarkers:moving.some(s=>s.quest),enemyHealthBars:moving.some(s=>s.health),selectedDimensions:dimensions,ordinaryDimensions:ordinary,healthTicks:tickSizes,friendlySelection:true,fixedHudUnchanged:true,errors};
  await writeFile('test-results/nameplates-results.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
  assert.ok(moving.length>100,'Sample labels over sustained camera turns');
  assert.ok(result.maxMovingError<.75,`Nameplates drifted ${result.maxMovingError.toFixed(2)}px during camera movement`);
  assert.ok(result.maxStillError<.75,'Stationary nameplates stay anchored');
  assert.deepEqual(result.kinds.sort(),['enemy','npc','player']);
  assert.ok(result.questMarkers&&result.enemyHealthBars,'Include quest markers and enemy health bars');
  assert.deepEqual(errors,[]);console.log('PASS: nameplates follow rendered models during camera turns, zoom, resize, travel and jumps');
}catch(e){if(page)await page.screenshot({path:'test-results/nameplates-failure.png'}).catch(()=>{});throw e;}
finally{await browser.close();}
