import {World} from '../server/world.js';
import {randomBytes} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const dir=process.env.DATA_DIR,file=process.env.ROSTER_FIXTURE;if(!dir||!file)throw Error('Set DATA_DIR and ROSTER_FIXTURE to new disposable paths.');
const world=new World(),p=world.addPlayer('Veteran Warden',{xp:2200,look:'ash',gold:123});p.x=2;p.z=27;
for(const [slot,item]of Object.entries({weapon:'dawn_blade',armor:'sentinel_coat',head:'trail_cap',offhand:'outpost_buckler',legs:'road_trousers',feet:'wayfarer_boots'})){p.inventory[item]=1;p.equipment[slot]=item;}
const token=randomBytes(32).toString('hex');await mkdir(dir,{recursive:true});await writeFile(`${dir}/characters.json`,JSON.stringify({[token]:world.save(p)}),{mode:0o600,flag:'wx'});
await writeFile(file,JSON.stringify({id:p.id,name:p.name,token}),{mode:0o600,flag:'wx'});console.log('Prepared disposable veteran character for roster previews.');
