import {World} from '../server/world.js';
import {NPCS,LEVEL_XP} from '../shared/content.js';
import {LAYOUT_REVISION} from '../shared/zone-layout.js';
import {OUTPOSTS} from '../shared/world-layouts.js';
import {randomBytes} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const dir=process.env.DATA_DIR,file=process.env.ZONE_FIXTURES;if(!dir||!file)throw Error('Use new disposable DATA_DIR and ZONE_FIXTURES paths.');
const w=new World(),profiles={},fixture={hubs:[]},merrin=NPCS.find(n=>n.id==='town-healer');
for(const [key,name,position,xp]of [['town','Town Visitor',{x:merrin.x+1.5,z:merrin.z+1},LEVEL_XP[6]],['start','New Traveler',{x:0,z:32},0],...OUTPOSTS.map(o=>[o.id,`${o.id} Explorer`,{x:o.x,z:o.z-13},LEVEL_XP[9]])]){
 const p=w.addPlayer(name,{x:position.x,z:position.z,xp,layoutRevision:LAYOUT_REVISION}),token=randomBytes(32).toString('hex');profiles[token]=w.save(p);fixture[key]={id:p.id,name,token};if(OUTPOSTS.some(o=>o.id===key))fixture.hubs.push({key,x:p.x,z:p.z});
}
await mkdir(dir,{recursive:true});await writeFile(`${dir}/characters.json`,JSON.stringify(profiles),{flag:'wx',mode:0o600});await writeFile(file,JSON.stringify(fixture),{flag:'wx',mode:0o600});console.log('Prepared isolated town, starter and six hub explorers.');
