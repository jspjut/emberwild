import {NPCS} from '../shared/content.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import WebSocket from 'ws';
import {randomBytes} from 'node:crypto';
import {World} from '../server/world.js';

async function start(dir){
  const proc=spawn(process.execPath,['server/index.js'],{env:{...process.env,HOST:'127.0.0.1',PORT:'0',DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
  const port=await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(Error('Server start timeout: '+output)),30000);proc.stderr.on('data',chunk=>{output+=chunk;});proc.once('error',error=>{clearTimeout(timer);reject(error);});proc.stdout.on('data',chunk=>{output+=chunk;const m=output.match(/localhost:(\d+)/);if(m){clearTimeout(timer);resolve(Number(m[1]));}});proc.once('exit',code=>{clearTimeout(timer);reject(Error(`Server exited ${code}`));});}).catch(async error=>{if(proc.exitCode===null&&proc.signalCode===null){const done=once(proc,'exit');proc.kill('SIGKILL');await done;}throw error;});
  return {proc,port,base:`http://127.0.0.1:${port}`,stop:async()=>{const done=once(proc,'exit');proc.kill('SIGTERM');await done;}};
}
async function client(port,name,token){
  const ws=new WebSocket(`ws://127.0.0.1:${port}/ws`),queue=[],waiters=[];
  ws.on('message',raw=>{const msg=JSON.parse(raw);const i=waiters.findIndex(w=>w.pred(msg));if(i>=0){const[w]=waiters.splice(i,1);clearTimeout(w.timer);w.resolve(msg);}else{queue.push(msg);if(queue.length>200)queue.shift();}});
  const next=(pred,timeout=5000)=>{const i=queue.findIndex(pred);if(i>=0)return Promise.resolve(queue.splice(i,1)[0]);return new Promise((resolve,reject)=>{const w={pred,resolve,timer:setTimeout(()=>{const i=waiters.indexOf(w);if(i>=0)waiters.splice(i,1);reject(Error('Message timeout'));},timeout)};waiters.push(w);});};
  await once(ws,'open');ws.send(JSON.stringify({type:'join',name,token}));const welcome=await next(m=>m.type==='welcome');
  return{ws,welcome,next,send:msg=>ws.send(JSON.stringify(msg)),close:async()=>{const done=once(ws,'close');ws.close();await done;}};
}
test('real protocol: say/yell distance, zone delivery, private party membership and unavailable guild chat',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'emberwild-chat-'));let server;const clients=[];
 try{const w=new World(),profiles={},keys=[];for(const [i,x]of [0,20,80,250].entries()){const p=w.addPlayer(`ChatGuest${i}`,{x,z:32,layoutRevision:2}),key=randomBytes(32).toString('hex');profiles[key]=w.save(p);keys.push(key);}await writeFile(path.join(dir,'characters.json'),JSON.stringify(profiles));server=await start(dir);
  for(const [i,key]of keys.entries())clients.push(await client(server.port,`ChatGuest${i}`,key));const [a,b,c,d]=clients;
  a.send({type:'chat',text:'/say Only nearby'});assert.equal((await b.next(m=>m.type==='chat'&&m.text==='Only nearby')).channel,'say');await assert.rejects(c.next(m=>m.type==='chat'&&m.text==='Only nearby',350),/timeout/);
  await new Promise(r=>setTimeout(r,1050));a.send({type:'chat',text:'/yell Further away'});assert.equal((await c.next(m=>m.type==='chat'&&m.text==='Further away')).channel,'yell');await assert.rejects(d.next(m=>m.type==='chat'&&m.text==='Further away',350),/timeout/);
  c.send({type:'chat',text:'/1 Zone news'});for(const receiver of [a,b,d]){const m=await receiver.next(m=>m.type==='chat'&&m.text==='Zone news');assert.equal(m.channel,'general');assert.equal(m.recipients,undefined);}
  a.send({type:'party',action:'invite',id:d.welcome.id});await d.next(m=>m.type==='state'&&m.partyInvite?.from===a.welcome.id);d.send({type:'party',action:'accept'});await a.next(m=>m.type==='state'&&m.party?.members.includes(d.welcome.id));await new Promise(r=>setTimeout(r,1050));
  a.send({type:'chat',text:'/p Private plan',recipients:[b.welcome.id]});assert.equal((await d.next(m=>m.type==='chat'&&m.text==='Private plan')).channel,'party');await assert.rejects(b.next(m=>m.type==='chat'&&m.text==='Private plan',350),/timeout/);
  b.send({type:'chat',text:'/p Outsider',partyId:a.welcome.id});await b.next(m=>m.type==='notice'&&m.text.includes('not in a party'));a.send({type:'chat',text:'/g Guild message'});await a.next(m=>m.type==='notice'&&m.text.includes('guilds are implemented'));
  d.send({type:'party',action:'leave'});await d.next(m=>m.type==='state'&&!m.party);d.send({type:'chat',text:'/p After leaving'});await d.next(m=>m.type==='notice'&&m.text.includes('not in a party'));
 }finally{await Promise.all(clients.map(c=>c.close()));if(server)await server.stop();await rm(dir,{recursive:true,force:true});}
});
test('real server: HTTP boundaries, two clients, chat, movement validation, token secrecy and durable restart',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'emberwild-test-'));let server,a,b;
  try{
    server=await start(dir);
    assert.equal((await fetch(server.base+'/health')).status,200);
    for(const file of ['/data/characters.json','/server/world.js','/package.json','/vendor/three/../../server/index.js'])assert.equal((await fetch(server.base+file)).status,404);
    a=await client(server.port,'NetworkOne');b=await client(server.port,'NetworkTwo');
    const snapshot=await b.next(m=>m.type==='state'&&m.players.length===2);
    assert.equal(snapshot.players.length,2);assert.equal(JSON.stringify(snapshot).includes(a.welcome.token),false);assert.equal(JSON.stringify(snapshot).includes(b.welcome.token),false);
    a.send({type:'chat',text:'Hello from another client'});assert.equal((await b.next(m=>m.type==='chat'&&m.text==='Hello from another client')).name,'NetworkOne');
    a.send({type:'input',x:9999,z:0});const s1=await a.next(m=>m.type==='state'&&m.self.x>0);assert.ok(s1.self.x<3);assert.ok(s1.self.x<68);
    a.send({type:'quest',action:'accept',id:'heart'});a.send({type:'equip',item:'dawn_blade'});
    const valid=await a.next(m=>m.type==='state'&&m.time>s1.time);assert.equal(valid.self.quests.heart,undefined);assert.equal(valid.self.equipment.weapon,'training_blade');
    // Accept the first quest over the wire, in range, then reconnect after a full process restart.
    const movement=setInterval(()=>a.send({type:'input',x:0,z:-1}),100);
    try{await a.next(m=>m.type==='state'&&Math.hypot(m.self.x,m.self.z-NPCS.find(n=>n.id==='elowen').z)<4);}finally{clearInterval(movement);}
    a.send({type:'input',x:0,z:0});a.send({type:'quest',action:'accept',id:'welcome'});
    await a.next(m=>m.type==='state'&&m.self.quests.welcome?.status==='active');
    a.send({type:'ping',clientTime:123});const pong=await a.next(m=>m.type==='pong');assert.equal(pong.clientTime,123);assert.ok(Number.isFinite(pong.serverTime));
    const beforeMove=await a.next(m=>m.type==='state');a.send({type:'move',epoch:beforeMove.self.motionEpoch,commands:Array.from({length:6},(_,i)=>({seq:i+1,x:1,z:0}))});
    const acknowledged=await a.next(m=>m.type==='state'&&m.self.lastInputSeq>=3);assert.ok(acknowledged.self.x>beforeMove.self.x);assert.ok(acknowledged.self.x-beforeMove.self.x<=6.5*(acknowledged.time-beforeMove.time+.1)+.001);
    const token=a.welcome.token,id=a.welcome.id;await a.close();a=null;await b.close();b=null;await server.stop();server=null;
    const persisted=JSON.parse(await readFile(path.join(dir,'characters.json'),'utf8'));assert.equal(persisted.profiles[token].quests.welcome.status,'active');
    server=await start(dir);a=await client(server.port,'Ignored name',token);assert.equal(a.welcome.id,id);assert.equal(a.welcome.name,'NetworkOne');
    const resumed=await a.next(m=>m.type==='state');assert.equal(resumed.self.quests.welcome.status,'active');
    assert.equal(resumed.self.lastInputSeq,0);assert.equal(resumed.self.casting,null);
  }finally{if(a)await a.close();if(b)await b.close();if(server)await server.stop();await rm(dir,{recursive:true,force:true});}
});

test('64 real WebSocket clients share a zone; the 65th is refused cleanly',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'emberwild-capacity-'));let server;const clients=[];
  try{
    server=await start(dir);
    const connected=await Promise.all(Array.from({length:64},(_,i)=>client(server.port,`LoadScout${i}`)));clients.push(...connected);
    const state=await clients[0].next(m=>m.type==='state'&&m.players.length===64);assert.equal(state.players.length,64);
    const health=await(await fetch(server.base+'/health')).json();assert.equal(health.players,64);
    for(const c of clients)c.send({type:'input',x:1,z:0});
    const later=await clients[0].next(m=>m.type==='state'&&m.time>state.time+.2);assert.ok(later.self.x>0);
    const extra=new WebSocket(`ws://127.0.0.1:${server.port}/ws`);await once(extra,'open');
    const rejected=once(extra,'message');extra.send(JSON.stringify({type:'join',name:'OneTooMany'}));assert.equal(JSON.parse((await rejected)[0]).type,'error');extra.close();
  }finally{await Promise.all(clients.map(c=>c.close()));if(server)await server.stop();await rm(dir,{recursive:true,force:true});}
});

test('browser identity owns a durable roster; foreign entry, stale edits and online deletion are rejected',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'emberwild-roster-network-'));let server,ws;
 try{
  server=await start(dir);
  async function api(route,method='GET',token,body){const response=await fetch(server.base+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,data:await response.json()};}
  const owner=(await api('/api/session','POST',null,{})).data.token,other=(await api('/api/session','POST',null,{})).data.token;
  assert.equal((await api('/api/characters')).status,401);
  const first=await api('/api/characters','POST',owner,{name:'Roster Warden',look:'grove',revision:0});assert.equal(first.status,201);const id=first.data.createdId;
  assert.equal((await api('/api/characters','POST',owner,{name:'Stale Warden',revision:0})).status,409);
  const rejected=new WebSocket(`ws://127.0.0.1:${server.port}/ws`);await once(rejected,'open');const denied=once(rejected,'message');rejected.send(JSON.stringify({type:'join',accountToken:other,characterId:id}));assert.match(JSON.parse((await denied)[0]).text,/roster/);rejected.close();
  ws=new WebSocket(`ws://127.0.0.1:${server.port}/ws`);const messages=[];ws.on('message',raw=>messages.push(JSON.parse(raw)));await once(ws,'open');const joined=once(ws,'message');ws.send(JSON.stringify({type:'join',accountToken:owner,characterId:id}));const welcome=JSON.parse((await joined)[0]);assert.equal(welcome.type,'welcome');assert.equal(welcome.id,id);assert.equal(welcome.token,undefined);
  const online=await api('/api/characters','GET',owner);assert.equal(online.data.characters[0].online,true);assert.equal(JSON.stringify(messages).includes(owner),false);
  assert.equal((await api(`/api/characters/${id}`,'DELETE',owner,{confirmName:'Roster Warden',revision:1})).status,409);
  const closed=once(ws,'close');ws.send(JSON.stringify({type:'logout'}));await closed;ws=null;
  await server.stop();server=await start(dir);const resumed=await api('/api/session','POST',null,{token:owner});assert.equal(resumed.data.characters[0].id,id);assert.equal(resumed.data.characters[0].look,'grove');assert.equal(resumed.data.characters[0].online,false);
  assert.equal((await api(`/api/characters/${id}`,'DELETE',owner,{confirmName:'Roster Warden',revision:1})).status,200);await server.stop();server=await start(dir);assert.equal((await api('/api/characters','GET',owner)).data.characters.length,0);
 }finally{if(ws)ws.close();if(server)await server.stop();await rm(dir,{recursive:true,force:true});}
});

test('explicit logout acknowledges a durable save, removes party presence, and permits immediate resume',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'emberwild-logout-'));let server,a,b;
 try{
  server=await start(dir);a=await client(server.port,'LogoutOne');b=await client(server.port,'LogoutTwo');
  a.send({type:'party',action:'invite',id:b.welcome.id});await b.next(m=>m.type==='state'&&m.partyInvite);b.send({type:'party',action:'accept'});await a.next(m=>m.type==='state'&&m.party?.members.length===2);
  a.send({type:'unequip',slot:'weapon'});a.send({type:'input',x:1,z:0});const moved=await a.next(m=>m.type==='state'&&m.self.equipment.weapon===null&&m.self.x>0);a.send({type:'input',x:0,z:0});
  const token=a.welcome.token,id=a.welcome.id;a.send({type:'logout'});const reply=await a.next(m=>m.type==='loggedOut');assert.equal(reply.saved,true);
  const saved=JSON.parse(await readFile(path.join(dir,'characters.json'),'utf8')).profiles[token];assert.equal(saved.id,id);assert.equal(saved.equipment.weapon,null);assert.equal(saved.inventory.training_blade,1);assert.ok(saved.x>=moved.self.x);assert.equal((await (await fetch(server.base+'/health')).json()).players,1);
  await b.next(m=>m.type==='state'&&!m.party&&m.players.every(p=>p.id!==id));if(a.ws.readyState!==WebSocket.CLOSED)await once(a.ws,'close');a=await client(server.port,'Ignored',token);assert.equal(a.welcome.id,id);const state=await a.next(m=>m.type==='state');assert.equal(state.self.equipment.weapon,null);assert.equal(state.self.x,saved.x);assert.equal(state.self.auto,false);assert.equal(state.self.casting,null);
 }finally{if(a&&a.ws.readyState!==WebSocket.CLOSED)await a.close();if(b)await b.close();if(server)await server.stop();await rm(dir,{recursive:true,force:true});}
});

test('logout reports a failed disk write without falsely confirming a saved character',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'emberwild-logout-failure-'));let server,a;
 try{
  server=await start(dir);a=await client(server.port,'SaveFailure');
  for(let i=0;i<50;i++){try{await readFile(path.join(dir,'characters.json'));break;}catch{await new Promise(resolve=>setTimeout(resolve,10));}}
  const {mkdir}=await import('node:fs/promises');await mkdir(path.join(dir,'characters.json.tmp'));
  a.send({type:'logout'});assert.equal((await a.next(m=>m.type==='loggedOut')).saved,false);if(a.ws.readyState!==WebSocket.CLOSED)await once(a.ws,'close');a=null;
 }finally{if(a&&a.ws.readyState!==WebSocket.CLOSED)await a.close();if(server)await server.stop();await rm(dir,{recursive:true,force:true});}
});


test('social commands replicate locally, support named targets, reject locked gestures and retain personal unlocks',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'emberwild-emote-network-'));let server,a,b,far;
 try{
  const {World}=await import('../server/world.js'),{randomBytes}=await import('node:crypto'),w=new World(),p=w.addPlayer('FarListener',{x:120,z:40,emotes:['dance'],reputation:{rootbound:350},socialClaims:['gift:sera']}),token=randomBytes(32).toString('hex');
  await writeFile(path.join(dir,'characters.json'),JSON.stringify({[token]:w.save(p)}));server=await start(dir);a=await client(server.port,'Waver');b=await client(server.port,'Neighbor');far=await client(server.port,'Ignored',token);
  a.send({type:'chat',text:'/wave Neighbor'});const event=await b.next(m=>m.type==='social'&&m.source===a.welcome.id);assert.equal(event.target,b.welcome.id);assert.match(event.text,/Waver waves at Neighbor/);
  const farState=await far.next(m=>m.type==='state'&&m.time>event.startedAt+.25);assert.equal(farState.players.find(p=>p.id===a.welcome.id).emote,null,'gestures are outside render range');
  await a.next(m=>m.type==='state'&&m.time>event.startedAt+1.3);a.send({type:'target',id:b.welcome.id});a.send({type:'chat',text:'/thank @nearby'});const publicGesture=await b.next(m=>m.type==='social'&&m.source===a.welcome.id&&m.emote==='thank');assert.equal(publicGesture.target,null);assert.equal(publicGesture.audience,'nearby');assert.ok(publicGesture.noticedBy.includes(b.welcome.id));
  await a.next(m=>m.type==='state'&&m.time>publicGesture.startedAt+1.3);a.send({type:'target',id:a.welcome.id});a.send({type:'chat',text:'/wave @target'});await a.next(m=>m.type==='notice'&&m.text.includes('@nearby'));a.send({type:'chat',text:'/shrug'});const fallback=await b.next(m=>m.type==='social'&&m.source===a.welcome.id&&m.emote==='shrug');assert.equal(fallback.target,null);
  a.send({type:'emote',id:'dance'});assert.match((await a.next(m=>m.type==='notice'&&m.text.includes('not learned'))).text,/Skills/);
  far.send({type:'chat',text:'/dance'});const dance=await far.next(m=>m.type==='social'&&m.source===p.id);assert.equal(dance.emote,'dance');const resumed=await far.next(m=>m.type==='state'&&m.self.reputation.rootbound===350);assert.ok(resumed.self.emotes.includes('dance'));assert.equal(JSON.stringify(resumed.players).includes('socialClaims'),false);
  far.send({type:'logout'});assert.equal((await far.next(m=>m.type==='loggedOut')).saved,true);await once(far.ws,'close');far=null;const persisted=JSON.parse(await readFile(path.join(dir,'characters.json'))).profiles[token];assert.equal(persisted.reputation.rootbound,350);assert.ok(persisted.emotes.includes('dance'));assert.ok(persisted.socialClaims.includes('gift:sera'));
 }finally{for(const c of [a,b,far])if(c&&c.ws.readyState!==WebSocket.CLOSED)await c.close();if(server)await server.stop();await rm(dir,{recursive:true,force:true});}
});


test('Hearthward Return travels over the real protocol and preserves its 15-minute cooldown across a server restart',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'emberwild-recall-network-'));let server,a;
 try{server=await start(dir);a=await client(server.port,'Wayfarer');const initial=await a.next(m=>m.type==='state');assert.equal(initial.self.waypointId,'hearthstead');a.send({type:'skill',skill:'recall',requestId:1});await a.next(m=>m.type==='state'&&m.self.casting?.skill==='recall');const returned=await a.next(m=>m.type==='state'&&m.self.motionEpoch>initial.self.motionEpoch,12000);assert.equal(returned.self.x,0);assert.equal(returned.self.z,32);assert.ok(returned.self.cooldowns.recall-returned.time>895);assert.equal(returned.self.globalCooldown,null);const token=a.welcome.token;a.send({type:'logout'});assert.equal((await a.next(m=>m.type==='loggedOut')).saved,true);await once(a.ws,'close');a=null;await server.stop();server=await start(dir);a=await client(server.port,'Ignored',token);const resumed=await a.next(m=>m.type==='state');assert.equal(resumed.self.waypointId,'hearthstead');assert.ok(resumed.self.cooldowns.recall-resumed.time>890);a.send({type:'skill',skill:'recall',requestId:1});await a.next(m=>m.type==='notice'&&m.text.includes('not ready'));assert.equal((await a.next(m=>m.type==='state')).self.casting,null);
 }finally{if(a&&a.ws.readyState!==WebSocket.CLOSED)await a.close();if(server)await server.stop();await rm(dir,{recursive:true,force:true});}
});
