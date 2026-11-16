import {NPCS,ENEMY_SPAWNS} from '../shared/content.js';
import {LAYOUT_REVISION} from '../shared/zone-layout.js';
import {World} from '../server/world.js';
import {randomBytes} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const dir=process.env.DATA_DIR,file=process.env.EMOTE_FIXTURES;if(!dir||!file)throw Error('Set disposable DATA_DIR and EMOTE_FIXTURES.');
const sera=NPCS.find(n=>n.id==='sera'),lysa=NPCS.find(n=>n.id==='lysa'),prowler=ENEMY_SPAWNS.find(e=>e.type==='prowler'),distance=Math.hypot(prowler.x-lysa.x,prowler.z-lysa.z),listener={x:lysa.x+(prowler.x-lysa.x)/distance*4.2,z:lysa.z+(prowler.z-lysa.z)/distance*4.2};
const done={status:'complete',progress:1,gathered:[]},active={status:'active',progress:0,gathered:[]},w=new World(),profiles={},fixture={};
for(const [key,name,extra]of [
 ['neighbor','LanternGuest',{x:sera.x+2,z:sera.z+2,layoutRevision:LAYOUT_REVISION,xp:180,quests:{welcome:done,meadow:{...done,progress:6},social_greeting:active}}],
 ['friend','DancingFriend',{x:sera.x+4,z:sera.z+1,layoutRevision:LAYOUT_REVISION,xp:180,emotes:['dance']}],
 ['listener','GroveGuest',{...listener,layoutRevision:LAYOUT_REVISION,xp:500,emotes:['soothe','dance'],quests:{welcome:done,meadow:done,social_greeting:done,social_road:done,social_listen:done,social_peace:active}}]
]){const p=w.addPlayer(name,extra),token=randomBytes(32).toString('hex');profiles[token]=w.save(p);fixture[key]={id:p.id,name,token};}
fixture.prowler=w.enemies.find(e=>e.type==='prowler').id;
await mkdir(dir,{recursive:true});await writeFile(`${dir}/characters.json`,JSON.stringify(profiles),{flag:'wx',mode:0o600});await writeFile(file,JSON.stringify(fixture),{flag:'wx',mode:0o600});console.log('Prepared three disposable social characters.');
