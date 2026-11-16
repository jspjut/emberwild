import {ECOLOGY_ASSETS,ZONE_ECOLOGY} from './shared/creature-ecology.js';
import {EXPANSION_ASSETS} from './shared/asset-library.js';
const $=id=>document.getElementById(id),select=$('zone'),assets=new Map(ECOLOGY_ASSETS.map(a=>[a.id,a]));
$('summary').textContent=`${EXPANSION_ASSETS.filter(a=>a.category==='creature').length} creature designs · ${Object.keys(ZONE_ECOLOGY).length} zone rosters · 5 body types per zone`;
for(const zone of Object.values(ZONE_ECOLOGY).sort((a,b)=>a.name.localeCompare(b.name))){const option=document.createElement('option');option.value=zone.id;option.textContent=zone.name;select.append(option);}
function show(){
 const zone=ZONE_ECOLOGY[select.value];$('zone-name').textContent=zone.name;$('story').textContent=zone.backstory;$('population').textContent=`Suggested population: ${zone.population} creatures across ${zone.roster.length} types${zone.habitat==='urban'?' · peaceful city residents':''}.`;$('roster').replaceChildren();
 for(const entry of zone.roster){const animal=assets.get(entry.type),card=document.createElement('article'),image=document.createElement('img'),title=document.createElement('h3'),detail=document.createElement('p'),budget=document.createElement('p'),link=document.createElement('a');image.src=`/assets/previews/${animal.id}.png`;image.alt=animal.name;image.onerror=()=>image.remove();title.textContent=animal.name;detail.textContent=animal.description;budget.textContent=`${entry.count} planned · ${entry.disposition}`;link.href=`/asset-library.html?asset=${encodeURIComponent(animal.id)}`;link.textContent='View animated model ↗';card.append(image,title,detail,budget,link);$('roster').append(card);}
 history.replaceState(null,'',`?zone=${encodeURIComponent(zone.id)}`);
}
const requested=new URLSearchParams(location.search).get('zone');select.value=Object.hasOwn(ZONE_ECOLOGY,requested)?requested:'cinderwood';select.addEventListener('change',show);show();
