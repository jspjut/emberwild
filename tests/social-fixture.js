// Create disposable saved characters for the real two-browser healing/party check.
import {World} from '../server/world.js';import {randomBytes} from 'node:crypto';import {mkdir,writeFile} from 'node:fs/promises';
const dir=process.env.DATA_DIR,file=process.env.SOCIAL_FIXTURES;if(!dir||!file)throw Error('Set DATA_DIR and SOCIAL_FIXTURES to new disposable paths. Existing files are never overwritten.');
const w=new World(),a=w.addPlayer('TestStormcaller',{xp:180,classId:'stormcaller'}),b=w.addPlayer('TestCompanion');a.hp=80;a.x=0;a.z=30;b.x=3;b.z=27;b.hp=5;
a.quests={welcome:{status:'complete',progress:1,gathered:[]},meadow:{status:'active',progress:1,gathered:[]},herbs:{status:'active',progress:1,gathered:['herb0']},seeds:{status:'active',progress:0,gathered:[]}};a.trackedQuest='meadow';
const profiles={},fixture={};for(const [key,p]of [['healer',a],['ally',b]]){const token=randomBytes(32).toString('hex');profiles[token]=w.save(p);fixture[key]={token,name:p.name,id:p.id};}
await mkdir(dir,{recursive:true});await writeFile(`${dir}/characters.json`,JSON.stringify(profiles),{mode:0o600,flag:'wx'});await writeFile(file,JSON.stringify(fixture),{mode:0o600,flag:'wx'});console.log('Prepared disposable healer/companion saves and browser access fixtures.');
