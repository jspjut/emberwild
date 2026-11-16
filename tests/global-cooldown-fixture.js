import {World} from '../server/world.js';
import {randomBytes} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const dir=process.env.DATA_DIR,file=process.env.GCD_FIXTURE;if(!dir||!file)throw Error('Set DATA_DIR and GCD_FIXTURE to new disposable paths.');
const world=new World(),p=world.addPlayer('Cooldown Warden',{xp:950});p.x=-17;p.z=18;p.hp=80;
const token=randomBytes(32).toString('hex');await mkdir(dir,{recursive:true});await writeFile(`${dir}/characters.json`,JSON.stringify({[token]:world.save(p)}),{mode:0o600,flag:'wx'});await writeFile(file,JSON.stringify({token,id:p.id,name:p.name}),{mode:0o600,flag:'wx'});console.log('Prepared disposable global cooldown fixture.');
