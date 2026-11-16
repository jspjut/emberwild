// Small authored circuits with purposeful stops, not random wandering.
const path=(points,pause=0)=>points.map(([x,z],i)=>({x,z,wait:i===points.length-1?pause:0}));
const gate=path([[430,143],[390,142],[362,147],[333,150],[301,144]],8);
const civic=path([[618,145],[684,150],[726,120],[776,56],[837,34]],10);
const school=path([[635,339],[630,385],[690,421],[704,405],[704,391],[704,382]],80);
const market=path([[554,143],[618,145],[682,165],[751,182]],18);
export const CITY_ROUTINES={
 'gate-patrol':{speed:2.3,stops:[...gate,...gate.slice(0,-1).reverse().map(s=>({...s,wait:s===gate[0]?10:0}))]},
 'civic-patrol':{speed:2.1,stops:[...civic,...civic.slice(0,-1).reverse()]},
 'school-walk':{speed:2.8,stops:[{...school[0],wait:25},...school.slice(1),...school.slice(0,-1).reverse().map((s,i,all)=>({...s,wait:i===all.length-1?90:0}))]},
 'market-peddler':{speed:1.8,stops:[{x:554,z:143,wait:16},...market.slice(1),...market.slice(0,-1).reverse().map(s=>({...s,wait:12}))]}
};
const actor=(id,name,title,routineId,extra={})=>{const point=CITY_ROUTINES[routineId].stops[0];return {id,name,title,routineId,x:point.x,z:point.z,mapId:'alderhaven',factionId:'alderhaven',role:'resident',raceId:'human',look:'hearth',color:0x9caa8e,facing:Math.PI,...extra};};
export const CITY_WALKERS=[
 actor('city-patrol-gate','Warden Elric Way','Gate road patrol','gate-patrol',{equipment:{armor:'sentinel_coat',weapon:'training_blade'},lore:'The road stays open. We walk it both ways, because a welcome also needs a safe departure.'}),
 actor('city-patrol-civic','Warden Nessa Bell','Civic road patrol','civic-patrol',{appearance:{skin:'deep',hairStyle:'braid',hairColor:'umber'},equipment:{armor:'sentinel_coat',weapon:'training_blade'},lore:'I keep the market walk and the Assembly approach clear. Ask the Speaker a question if you have one; that door is not reserved for uniforms.'}),
 actor('city-child-pip','Pip Lowdoor','On the school road','school-walk',{scale:.7,phaseDelay:0,appearance:{skin:'pearl',hairStyle:'swept',hairColor:'copper'},lore:'Our school keeps two copies of every story. One for what happened, and one for the questions we still have. Tessa says that is not quite what a copy means.'}),
 actor('city-child-miri','Miri Wick','On the school road','school-walk',{scale:.67,phaseDelay:7,appearance:{skin:'bronze',hairStyle:'ponytail',hairColor:'raven'},lore:'Pip always asks whether the bell will ring before lessons. Master Corven says that is a larger question than the time of day.'}),
 actor('city-peddler','Bessa Basket','Walking provisions','market-peddler',{role:'merchant',services:['merchant'],equipment:{back:'city_vendor_pack'},lore:'Tonics, small bags and a story for the road. I stop at the market bends; wave if you want a moment to browse.'})
];
