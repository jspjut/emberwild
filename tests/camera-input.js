// Native pointer lock recenters the OS cursor after each event. Playwright's
// absolute mouse coordinates must therefore be relative to the viewport center,
// rather than its remembered pre-lock mouse location. These remain trusted input.
export async function beginCameraDrag(page,button='right',x=650,y=400){
 await page.mouse.move(x,y);await page.mouse.down({button});
 if(button==='left')await page.mouse.move(x+8,y);
 try{await page.waitForFunction(()=>document.pointerLockElement===document.querySelector('#world'));}catch(e){console.error('Capture failed',await page.evaluate(()=>({focused:document.hasFocus(),hidden:document.hidden,controls:window.emberwildDebug?.controls,view:window.emberwildDebug?.view,toasts:document.querySelector('#toasts')?.textContent})));throw e;}
 await page.waitForTimeout(60);
}
export async function moveCameraBy(page,dx,dy=0){
 const size=page.viewportSize(),steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/150));
 for(let i=1;i<=steps;i++){
  const x=Math.round(dx*i/steps)-Math.round(dx*(i-1)/steps),y=Math.round(dy*i/steps)-Math.round(dy*(i-1)/steps);
  await page.mouse.move(size.width/2+x,size.height/2+y);await page.waitForTimeout(60);
 }
}
export async function endCameraDrag(page,button='right'){
 await page.mouse.up({button});await page.waitForFunction(()=>!document.pointerLockElement);await page.waitForTimeout(60);
}
