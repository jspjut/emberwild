import {World} from '../server/world.js';
import {NPCS} from '../shared/content.js';
import {LAYOUT_REVISION} from '../shared/zone-layout.js';
import {randomBytes} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const dir=process.env.DATA_DIR,file=process.env.SOCIAL_FIXTURES;if(!dir||!file)throw Error('Set a disposable DATA_DIR and SOCIAL_FIXTURES.');
const sera=NPCS.find(n=>n.id==='sera'),w=new World(),profiles={},fixture={};
for(const [id,name,offset]of [['speaker','SpeakingGuest',2],['friend','ListeningGuest',5]]){const p=w.addPlayer(name,{x:sera.x+offset,z:sera.z+2,layoutRevision:LAYOUT_REVISION,xp:500,emotes:['dance'],quests:{welcome:{status:'complete',progress:1,gathered:[]},meadow:{status:'active',progress:2,gathered:[]},herbs:{status:'active',progress:1,gathered:['herb-0']},supplies:{status:'active',progress:0,gathered:[]}}}),token=randomBytes(32).toString('hex');profiles[token]=w.save(p);fixture[id]={id:p.id,name:p.name,token};}
await mkdir(dir,{recursive:true});await writeFile(`${dir}/characters.json`,JSON.stringify(profiles),{flag:'wx',mode:0o600});await writeFile(file,JSON.stringify(fixture),{flag:'wx',mode:0o600});console.log('Prepared two isolated social/quest browser characters.');
