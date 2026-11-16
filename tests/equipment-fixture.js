// Disposable legacy save for browser migration/paired-slot checks; never overwrite a save.
import {World} from '../server/world.js';import {randomBytes} from 'node:crypto';import {mkdir,writeFile} from 'node:fs/promises';
const dir=process.env.DATA_DIR,file=process.env.EQUIPMENT_FIXTURE;if(!dir||!file)throw Error('Set DATA_DIR and EQUIPMENT_FIXTURE to new disposable paths.');
const w=new World(),p=w.addPlayer('LegacyEquipment');p.inventory.trail_charm=2;p.equipment={weapon:'training_blade',armor:'linen_coat',charm:'trail_charm'};const token=randomBytes(32).toString('hex');
await mkdir(dir,{recursive:true});await writeFile(`${dir}/characters.json`,JSON.stringify({[token]:w.save(p)}),{mode:0o600,flag:'wx'});await writeFile(file,JSON.stringify({name:p.name,token}),{mode:0o600,flag:'wx'});console.log(`Prepared disposable equipment fixture in ${dir}.`);
