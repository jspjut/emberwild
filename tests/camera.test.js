import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraOrbit,clampCameraPitch,MIN_CAMERA_PITCH,MAX_CAMERA_PITCH,CAMERA_GROUND_CLEARANCE} from '../client/camera-look.js';
import {CameraPointerLock} from '../client/pointer-lock.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);

test('camera reaches upward and almost overhead views without crossing either vertical pole',()=>{
 near(clampCameraPitch(-20),MIN_CAMERA_PITCH);near(clampCameraPitch(20),MAX_CAMERA_PITCH);near(clampCameraPitch(.64),.64);
 assert.ok(MIN_CAMERA_PITCH<-Math.PI/3&&MIN_CAMERA_PITCH>-Math.PI/2);assert.ok(MAX_CAMERA_PITCH>Math.PI*.45&&MAX_CAMERA_PITCH<Math.PI/2);
 const focus={x:3,y:1.1,z:7};
 for(const pitch of [MIN_CAMERA_PITCH,0,.64,MAX_CAMERA_PITCH])for(const yaw of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
  const c=cameraOrbit(focus,yaw,pitch,18,()=>4),horizontal=Math.hypot(c.x-focus.x,c.z-focus.z);
  assert.ok(c.y>=4+CAMERA_GROUND_CLEARANCE);near(Math.atan2(c.y-c.targetY,horizontal),pitch);near(Math.sin(Math.atan2(c.x-focus.x,c.z-focus.z)-yaw),0);
 }
});
test('unobstructed default orbit keeps the focus on the character',()=>{
 const focus={x:3,y:9,z:-6},c=cameraOrbit(focus,.7,.64,16,()=>0);
 near(c.x,focus.x+Math.sin(.7)*Math.cos(.64)*16);near(c.z,focus.z+Math.cos(.7)*Math.cos(.64)*16);near(c.y,9+Math.sin(.64)*16);near(c.targetY,9);
});

function fixture(request){
 const doc=new EventTarget();doc.pointerLockElement=null;let exits=0;
 doc.exitPointerLock=()=>{exits++;doc.pointerLockElement=null;doc.dispatchEvent(new Event('pointerlockchange'));};
 const element={ownerDocument:doc,requestPointerLock:request},moves=[],events=[];
 const lock=new CameraPointerLock(element,{onMove:p=>moves.push(p),onLost:()=>events.push('lost'),onError:()=>events.push('error')});
 const grant=()=>{doc.pointerLockElement=element;doc.dispatchEvent(new Event('pointerlockchange'));};
 const move=(x,y)=>doc.dispatchEvent(Object.assign(new Event('mousemove'),{movementX:x,movementY:y,clientX:100,clientY:200}));
 return {doc,element,lock,moves,events,grant,move,get exits(){return exits;}};
}
test('pointer lock uses relative motion and restores a click coordinate independently of frozen client coordinates',()=>{
 const f=fixture(()=>undefined);f.lock.request(120,230);assert.equal(f.lock.pending,true);f.grant();assert.equal(f.lock.locked,true);assert.equal(f.lock.pending,false);
 f.move(15,-12);f.move(1800,300);assert.deepEqual(f.moves,[{x:135,y:218},{x:1935,y:518}]);assert.deepEqual(f.lock.coordinates({clientX:100,clientY:200}),{x:1935,y:518});
 f.lock.release();assert.equal(f.exits,1);assert.deepEqual(f.events,[]);assert.deepEqual(f.lock.coordinates({clientX:120,clientY:230}),{x:120,y:230});f.move(10,10);assert.equal(f.moves.length,2);
});
test('releasing before permission resolves immediately unlocks a late grant',()=>{
 const f=fixture(()=>undefined);f.lock.request(20,30);f.lock.release();f.grant();assert.equal(f.lock.locked,false);assert.equal(f.exits,1);assert.deepEqual(f.events,[]);
});
test('unexpected unlock cancels held input, while normal release does not',()=>{
 const f=fixture(()=>undefined);f.lock.request(20,30);f.grant();f.doc.exitPointerLock();assert.deepEqual(f.events,['lost']);assert.equal(f.lock.wanted,false);
 f.lock.request(20,30);f.grant();f.lock.release();assert.deepEqual(f.events,['lost']);
});
test('blocked capture reports once per gesture and can be retried after release',async()=>{
 let calls=0;const f=fixture(()=>{calls++;return Promise.reject(Error('Denied'));});f.lock.request(0,0);await Promise.resolve();f.doc.dispatchEvent(new Event('pointerlockerror'));f.lock.request(10,10);assert.equal(calls,1);assert.deepEqual(f.events,['error']);assert.equal(f.lock.pending,false);
 f.lock.release();f.lock.request(10,10);await Promise.resolve();assert.equal(calls,2);assert.deepEqual(f.events,['error','error']);
});
test('stale promise rejection cannot cancel the next gesture, and disposal removes relative motion listeners',async()=>{
 let reject;const f=fixture(()=>new Promise((_,r)=>{reject=r;}));f.lock.request(1,2);const oldReject=reject;f.lock.release();f.lock.request(3,4);oldReject(Error('Canceled'));await Promise.resolve();assert.equal(f.lock.pending,true);assert.deepEqual(f.events,[]);f.grant();f.lock.dispose();f.doc.pointerLockElement=f.element;f.move(10,10);assert.deepEqual(f.moves,[]);
});
test('late native error events cannot abandon an already granted lock',()=>{
 const f=fixture(()=>undefined);f.lock.request(0,0);f.grant();f.doc.dispatchEvent(new Event('pointerlockerror'));f.move(12,4);assert.equal(f.lock.wanted,true);assert.deepEqual(f.moves,[{x:12,y:4}]);assert.deepEqual(f.events,[]);f.lock.release();
});
test('missing or throwing pointer lock implementation fails visibly and never leaves a pending request',()=>{
 for(const request of [undefined,()=>{throw Error('Unsupported');}]){const f=fixture(request);f.lock.request(0,0);assert.equal(f.lock.pending,false);assert.deepEqual(f.events,['error']);}
});
