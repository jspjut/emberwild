// Rich inventory in a disposable save, to exercise every model through real UI.
import {World} from '../server/world.js';
import {randomBytes} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const dir=process.env.DATA_DIR,file=process.env.APPEARANCE_FIXTURE;
if(!dir||!file)throw Error('Set DATA_DIR and APPEARANCE_FIXTURE to new disposable paths.');
const w=new World(),p=w.addPlayer('TrailOutfitter',{xp:180,gold:100});p.z=27;
for(const id of ['copper_blade','dawn_blade','bark_coat','sentinel_coat','trail_charm'])p.inventory[id]=1;
const token=randomBytes(32).toString('hex');
await mkdir(dir,{recursive:true});await writeFile(`${dir}/characters.json`,JSON.stringify({[token]:w.save(p)}),{mode:0o600,flag:'wx'});
await writeFile(file,JSON.stringify({name:p.name,id:p.id,token}),{mode:0o600,flag:'wx'});console.log('Prepared disposable appearance fixture.');
