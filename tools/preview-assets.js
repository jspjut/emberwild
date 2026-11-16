import {firefox,chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import {EXPANSION_ASSETS} from '../shared/complete-assets.js';
import {GEAR_SETS} from '../shared/equipment-collection.js';
const engine=process.env.BROWSER==='chromium'?chromium:firefox,base=process.env.TEST_URL||'http://127.0.0.1:3081';
const browser=await engine.launch({headless:process.env.HEADED!=='1',...(engine===firefox?{firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}}:{args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})});
try{const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto(base+'/asset-library.html');await page.waitForFunction(()=>window.assetLibraryStudio?.debug.metadata);await mkdir('client/assets/previews',{recursive:true});await mkdir('test-results',{recursive:true});
  for(const def of EXPANSION_ASSETS){const data=await page.evaluate(({id,region})=>{window.assetLibraryStudio.select(id,region);return window.assetLibraryStudio.capturePNG(384);},def);await writeFile(`client/assets/previews/${def.id}.png`,Buffer.from(data.split(',')[1],'base64'));}
  await mkdir('client/assets/previews/sets',{recursive:true});for(const set of GEAR_SETS){const data=await page.evaluate(({id,region})=>{document.querySelector('#gear-set').value=id;window.assetLibraryStudio.select('human',region);return window.assetLibraryStudio.capturePNG(512);},set);await writeFile(`client/assets/previews/sets/${set.id}.png`,Buffer.from(data.split(',')[1],'base64'));}
  await page.reload();await page.waitForFunction(()=>window.assetLibraryStudio?.debug.metadata);await page.screenshot({path:'test-results/asset-workshop.png'});console.log(`Rendered ${EXPANSION_ASSETS.length} transparent asset previews.`);
}finally{await browser.close();}
