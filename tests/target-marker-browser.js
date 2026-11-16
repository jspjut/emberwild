import {firefox,chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const engine=process.env.BROWSER==='firefox'?firefox:chromium;
const browser=await engine.launch({headless:process.env.HEADED!=='1',...(engine===firefox?{firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.software':true}}:{args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})});
try{
  await mkdir('test-results',{recursive:true});const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Isolate the renderer while loading the real item, character and marker
  // modules from the server. No game state or network messages are fabricated.
  await page.route('**/main.js',route=>route.fulfill({contentType:'text/javascript',body:''}));
  await page.goto((process.env.TEST_URL||'http://127.0.0.1:3081')+'/');
  const results=await page.evaluate(async()=>{
    const THREE=await import('three'),{TargetMarker}=await import('/target-marker.js'),{createHumanoid,animateHumanoid,disposeHumanoid}=await import('/character.js'),{heightAt}=await import('/shared/terrain.js');
    document.body.replaceChildren();const output=document.createElement('div');Object.assign(output.style,{display:'grid',gridTemplateColumns:'repeat(3,400px)',background:'#19342f'});document.body.append(output);
    const results=[];
    const pixels=renderer=>{const gl=renderer.getContext(),buffer=new Uint8Array(400*300*4);gl.readPixels(0,0,400,300,gl.RGBA,gl.UNSIGNED_BYTE,buffer);let count=0;for(let i=0;i<buffer.length;i+=4)if(buffer[i]>245&&buffer[i+1]>216&&buffer[i+1]<239&&buffer[i+2]>140&&buffer[i+2]<167)count++;return count;};
    for(const terrain of ['flat','slope','table']){
      const center={x:terrain==='slope'?-27:10,z:terrain==='slope'?-1:27};center.y=heightAt(center.x,center.z)+(terrain==='table'?1.15:0);
      const scene=new THREE.Scene();scene.background=new THREE.Color('#a8c4ad');scene.fog=new THREE.FogExp2('#a8c4ad',.018);scene.add(new THREE.HemisphereLight(0xffedcf,0x526a56,2));
      const geometry=new THREE.PlaneGeometry(18,18,48,48);geometry.rotateX(-Math.PI/2);const p=geometry.attributes.position;
      for(let i=0;i<p.count;i++){const x=p.getX(i)+center.x,z=p.getZ(i)+center.z;p.setXYZ(i,x,heightAt(x,z),z);}geometry.computeVertexNormals();
      scene.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#91a675',side:THREE.DoubleSide})));
      if(terrain==='table'){const table=new THREE.Mesh(new THREE.BoxGeometry(3,.3,1.4),new THREE.MeshStandardMaterial({color:'#9b8056'}));table.position.set(center.x,center.y-.15,center.z);scene.add(table);}
      const actor=createHumanoid('#888');actor.position.set(center.x,center.y,center.z);actor.userData.equipment.update({armor:'linen_coat'});animateHumanoid(actor,{x:0,z:0,facing:0,grounded:true},1/60,{},()=>0);scene.add(actor);
      const marker=new TargetMarker();scene.add(marker.root);const target={object:actor,kind:'enemy',data:{type:'nibbler'}};
      const old=new THREE.Mesh(new THREE.RingGeometry(1.1,1.22,48),new THREE.MeshBasicMaterial({color:'#ffe39a',side:THREE.DoubleSide,transparent:true,depthWrite:false,toneMapped:false,fog:false}));old.rotation.x=-Math.PI/2;old.position.set(center.x,center.y+.08,center.z);scene.add(old);
      for(const [label,distance,pitch]of [['near',9,.65],['far',55,.65],['grazing',32,.035]]){
        const panel=document.createElement('div');panel.style.position='relative';output.append(panel);const canvas=document.createElement('canvas');panel.append(canvas);const title=document.createElement('span');title.textContent=`${terrain} · ${label}`;Object.assign(title.style,{position:'absolute',left:'10px',top:'8px',color:'#fff'});panel.append(title);
        const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setSize(400,300);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
        const camera=new THREE.PerspectiveCamera(48,4/3,.1,160);camera.position.set(center.x,center.y+Math.sin(pitch)*distance,center.z+Math.cos(pitch)*distance);camera.lookAt(center.x,center.y,center.z);camera.updateMatrixWorld(true);
        marker.root.visible=false;old.visible=true;renderer.render(scene,camera);const oldPixels=pixels(renderer);
        old.visible=false;marker.update(target,camera,300,true);renderer.render(scene,camera);const visiblePixels=pixels(renderer);
        results.push({terrain,label,distance,visiblePixels,oldPixels,radius:marker.radius,stroke:marker.stroke});
        if(terrain==='flat'&&label==='near'){
          const wall=new THREE.Mesh(new THREE.BoxGeometry(12,8,1),new THREE.MeshBasicMaterial({color:'#65715b'}));wall.position.set(center.x,center.y+3,center.z+4);scene.add(wall);renderer.render(scene,camera);results.push({label:'wall',visiblePixels:pixels(renderer)});scene.remove(wall);wall.geometry.dispose();wall.material.dispose();
          marker.update(null,camera,300,true);renderer.render(scene,camera);results.push({label:'cleared',visiblePixels:pixels(renderer)});marker.update(target,camera,300,true);renderer.render(scene,camera);
          const ringHeight=()=>{const p=marker.ink.geometry.attributes.position;let total=0;for(let i=0;i<p.count;i++)total+=p.getY(i);return marker.root.position.y+total/p.count;};
          actor.position.y=center.y+.7;marker.update(target,camera,300,true);const first=ringHeight();actor.position.y=center.y+.9;marker.update(target,camera,300,true);results.push({label:'jump',rise:ringHeight()-first});actor.position.y=center.y;marker.update(target,camera,300,true);renderer.render(scene,camera);
        }
      }
      // Resources stay alive for the gallery screenshot; only detach the actor.
      disposeHumanoid(actor);
    }
    return results;
  });
  await page.screenshot({path:'test-results/target-marker-gallery.png'});
  for(const result of results){if(result.label==='jump')assert.ok(result.rise>.15&&result.rise<.3,'jumping must not pop the marker between terrain and foot height');else if(['wall','cleared'].includes(result.label))assert.equal(result.visiblePixels,0,`${result.label} must not reveal a ring`);else assert.ok(result.visiblePixels>=30,`${result.terrain}/${result.label} lost its marker: ${result.visiblePixels} pixels`);}
  const grazing=results.filter(r=>r.label==='grazing');assert.ok(grazing.every(r=>r.visiblePixels>r.oldPixels),`Rounded rings should improve grazing views: ${JSON.stringify(grazing)}`);
  assert.deepEqual(errors,[]);await writeFile('test-results/target-marker-results.json',JSON.stringify({results,errors},null,2));console.log('PASS:',JSON.stringify({views:9,occlusion:true,clearing:true,grazingImproved:true,errors}));
}finally{await browser.close();}
