import {cityBaseHeight,APPROACH_PATH} from './city-topography.js';
// Alderhaven: original human capital, continuous with the Reach. Distances in metres.
export const CAPITAL_BOUNDS={minX:350,maxX:1190,minZ:-245,maxZ:535};
export const CAPITAL_OUTLINE=[[390,75],[485,-110],[710,-202],[960,-137],[1122,24],[1118,245],[969,412],[704,475],[486,365],[390,224]];
export const CAPITAL_GATE={x:390,z:142};
export const CAPITAL_DISTRICTS=[
 {id:'welcome',name:'The Open Gate',x:454,z:148,radius:84,subtitle:'Arrivals, shelter and the road home',color:'#bba77e'},
 {id:'market',name:'Fourwinds Exchange',x:618,z:145,radius:88,subtitle:'Market hearth and the common bank',color:'#b7a173'},
 {id:'civic',name:'Concord Heights',x:837,z:34,radius:125,subtitle:'The Assembly of the Open Hand',color:'#c2c6aa'},
 {id:'archive',name:'The Unfinished Archive',x:692,z:-88,radius:100,subtitle:'Records, corrections and disputed names',color:'#9aaab5'},
 {id:'forge',name:'Bellfounders’ Close',x:990,z:180,radius:110,subtitle:'Workshops and the great witness bell',color:'#b89b7f'},
 {id:'gardens',name:'Lantern Gardens',x:814,z:303,radius:100,subtitle:'Five guest pavilions and a voluntary return hearth',color:'#98b58d'},
 {id:'homes',name:'Lowdoor Ward',x:635,z:339,radius:95,subtitle:'A neighborhood older than its official plan',color:'#c2b58d'},
 {id:'quay',name:'The Willow Quays',x:1023,z:9,radius:87,subtitle:'River stairs, rescue crews and an open sky',color:'#94afa9'}
];
export const CAPITAL_ROADS=[
 [...APPROACH_PATH,[495,153],[554,143],[618,145],[684,150],[726,120],[776,56],[837,34]],
 [[458,141],[476,88],[510,40],[560,-4],[617,-44],[665,-80],[692,-88],[752,-83],[773,-49],[774,-4],[800,26],[837,34]],
 [[618,145],[613,193],[620,242],[647,292],[681,326],[737,315],[814,303],[866,300],[900,300],[934,293],[947,285],[947,200],[990,180]],
 [[837,34],[909,13],[967,1],[1023,9],[1055,54],[1048,106],[1022,150],[990,180]],
 [[692,-88],[709,-132],[767,-139],[831,-114],[886,-71],[909,13]],
 [[442,147],[425,194],[426,239],[478,258],[527,300],[583,333],[635,339],[681,326]],
 [[618,145],[682,165],[751,182],[816,184],[895,183],[990,180]],
 [[837,34],[838,94],[829,144],[816,184],[814,245],[814,303]],
 [[635,339],[630,385],[690,421],[763,420],[814,365],[814,303]],
 // Individual doors connect civic streets to the walkable interiors.
 [[837,34],[837,-1]],[[692,-88],[665,-88],[665,-115]],
 [[618,145],[587,145],[587,135]],[[618,145],[645,145],[645,135]],
 [[442,147],[465,181],[465,197]],[[814,303],[850,325],[850,341]],
 [[990,180],[990,217]],[[1023,9],[1045,9],[1045,-21]],
 [[635,339],[599,339],[599,321]],[[618,145],[618,91],[614,91]]
];
const hall=(id,name,x,z,width,depth,extra={})=>({id:`capital-${id}`,siteId:`capital-${id}`,mapId:'alderhaven',name,subtitle:'Alderhaven · a city held in common',x,z,width,depth,r:Math.hypot(width,depth)/2,wallHeight:10,doorSide:'south',doorWidth:6,doorHeight:7,roofRise:5,capital:true,furniture:[],...extra});
export const CAPITAL_BUILDINGS=[
 hall('assembly','The Hall of the Open Hand',837,-37,76,72,{wallHeight:17,doorWidth:12,doorHeight:12,roofRise:10,landmark:'assembly',furniture:[{id:'assembly-table',type:'table',x:0,z:-10,width:20,depth:5,height:1.2}]}),
 hall('archive','The Unfinished Archive',665,-142,56,54,{wallHeight:15,roofRise:9,landmark:'archive',furniture:[...[-18,18].map((x,i)=>({id:`reading-shelves-${i}`,type:'shelf',x,z:-2,width:4,depth:27,height:4})),{id:'reading-table',type:'table',x:11,z:1,width:9,depth:3,height:1.15}]}),
 hall('bank','The Common Vault',587,116,38,38,{landmark:'bank',furniture:[{id:'bank-counter',type:'counter',x:9,z:0,width:6,depth:3,height:1.2}]}),
 hall('market-hall','Fourwinds Hall',645,116,38,38,{wallHeight:11,landmark:'market'}),
 hall('gate-inn','The Unlatched Door',465,215,38,36,{doorSide:'north',doors:['north','south'],landmark:'inn',furniture:[{id:'guest-table',type:'table',x:-10,z:0,width:7,depth:2,height:1.15},...[-10,10].map((x,i)=>({id:`guest-bed-${i}`,type:'bed',x,z:11,width:2,depth:3,height:.8}))]}),
 hall('garden-inn','The Lantern House',850,359,38,36,{doorSide:'north',doors:['north','south'],landmark:'inn'}),
 hall('foundry','The House of Bells',990,245,64,56,{doorSide:'north',wallHeight:13,roofRise:8,landmark:'foundry'}),
 hall('rescue','The Returners’ Hall',1045,-42,44,42,{landmark:'quay'}),
 hall('lowdoor','Lowdoor Common House',599,301,38,40,{landmark:'homes'}),
 hall('market-inn','The Wayfarers’ Measure',594,91,40,10,{doorSide:'east',doors:['east','west'],landmark:'inn'}),
 // Walk-in homes and workshops in staggered lanes, with gaps wide enough for camera play.
 ...[[425,86,18,20],[451,55,22,18],[488,19,24,20],[509,223,23,24],[546,248,20,24],[564,287,22,20],
 [538,128,22,24],[535,178,20,23],[578,190,22,22],[664,199,22,20],[700,224,24,22],
 [560,-64,24,25],[602,-106,24,22],[565,-121,22,22],[715,-150,25,23],[757,-113,22,26],
 [934,92,27,24],[975,118,24,25],[1035,207,24,26],[1066,161,24,22],[918,255,24,25],
 [738,256,22,25],[759,365,24,23],[901,340,26,24],[704,379,22,24],[590,379,24,26],[533,337,23,22],
 [1080,75,22,25],[1009,-62,23,22],[964,-29,24,23]].map(([x,z,w,d],i)=>hall(`home-${i}`,i%4===0?'Alderhaven workshop':i%4===1?'Alderhaven reading room':'Alderhaven home',x,z,w,d,{wallHeight:7+i%3,roofRise:3+i%2,doorWidth:4,doorHeight:5.6,doorSide:i%2?'east':'south',furniture:i%3===0?[{id:'work-table',type:'table',x:0,z:-3,width:4,depth:2,height:1.15}]:[]})),
 ...[[785,345],[844,242],[876,277],[791,384],[748,300]].map(([x,z],i)=>hall(`pavilion-${i}`,['Human guest pavilion','Sylvren guest pavilion','Cairnkin guest pavilion','Brinefolk guest pavilion','Emberkin guest pavilion'][i],x,z,17,17,{doors:['north','south','east','west'],wallHeight:8,roofRise:5,doorWidth:8}))
];
for(const b of CAPITAL_BUILDINGS)b.floorY=cityBaseHeight(b.x,b.z);
const school=CAPITAL_BUILDINGS.find(b=>b.id==='capital-home-24');school.name='Lowdoor Schoolhouse';school.subtitle='Alderhaven · lessons and the walk home';
const person=(id,name,title,x,z,extra={})=>({id,name,title,x,z,mapId:'alderhaven',factionId:'alderhaven',raceId:'human',role:'resident',facing:Math.PI,color:0xc4b58b,...extra});
export const CAPITAL_NPCS=[
 person('alder-speaker','First Speaker Aveline Rook','Custodian of the Open Hand',837,-57,{role:'lore',featured:true,look:3,appearance:{skin:'umber',hairStyle:'braid',hairColor:'silver',beardStyle:'none',face:'kind'},regalia:'speaker',lore:'An office is a promise to answer the next question. My mother carried water through the Night of Closed Doors. I will not borrow her courage to excuse our paperwork.'}),
 person('alder-archivist','Keeper Ysra Vey','Warden of Corrections',665,-151,{role:'lore',featured:true,look:1,regalia:'archivist',lore:'Annet Vey was my grandmother. Her correction letter is real; the popular account of it is not complete. Preserve the original and the amendment together.'}),
 person('alder-bellfounder','Master Corven Bell','Keeper of the Unstruck Bell',990,235,{role:'lore',featured:true,look:2,regalia:'bellfounder',lore:'The bell above this yard was cast after the evacuation. It has never been struck. The city has not yet agreed whose absence it should mark.'}),
 person('alder-lowdoor','Tessa Wren','Speaker for Lowdoor Ward',599,297,{role:'lore',featured:true,look:4,regalia:'lowdoor',lore:'Anja Wren brought my father through a low passage. We built homes here before a surveyor found a box to put them in. Ask our names before drawing your next boundary.'}),
 person('alder-relief','Maelin of the Open Hand','Keeper of the Relief House',472,211,{role:'lore',featured:true,look:0,regalia:'relief',lore:'Sera is my sister. We learned the open-hand greeting when we had more frightened arrivals than blankets. Tell her I still keep an unpromised one.'}),
 person('alder-gate-keeper','Innkeeper Hedd Rowan','The Unlatched Door',465,203,{role:'healer',services:['inn','healer','waypoint']}),
 person('alder-market-keeper','Juna Measure','Market hearth keeper',600,91,{role:'healer',services:['inn','healer','waypoint']}),
 person('alder-garden-keeper','Oris Lantern','Lantern House keeper',850,347,{role:'healer',services:['inn','healer','waypoint']}),
 person('alder-banker','Maraen Ledger','Common Vault banker',587,121,{role:'banker',services:['bank'],lore:'Deposits remain yours wherever the road takes you. Speak to me to store or withdraw items.'}),
 person('alder-provisioner','Perrin Fourwinds','City provisions',645,121,{role:'merchant',services:['merchant']}),
 person('alder-rescue','Captain Noll Shoretie','River rescue captain',1045,-40,{raceId:'brinefolk',lore:'Nemi can send us her corrected rescue tally. A passenger choosing to leave is not a rescue crew failing.'}),
 person('alder-sylvren','Leth Leaflisten','Garden envoy',844,242,{raceId:'sylvren',lore:'Mira’s question about who may learn has reached our schools. We are making room to answer it.'}),
 person('alder-cairnkin','Kerr Oathstone','Witness to the city works',876,277,{raceId:'cairnkin',lore:'Dorr dates his corrections. We should bring that habit to the capital’s own records.'}),
 person('alder-emberkin','Ina Ashkindle','Kilnwork envoy',748,300,{raceId:'emberkin',lore:'An unfinished token is still testimony. Iri is welcome to bring hers without finishing the sentence for our convenience.'}),
 ...[[437,129],[510,145],[618,173],[705,125],[771,41],[889,46],[947,170],[807,330],[650,367],[1000,37]].map(([x,z],i)=>person(`alder-resident-${i}`,['Oren Gateward','Bela Waycross','Saff Measure','Rennick Quill','Wenna Rook','Dale Northstep','Jori Bell','Lena Wick','Tolan Lowdoor','Hest River'][i],i%3?'Alderhaven neighbor':'City roadkeeper',x,z,{raceId:['human','human','brinefolk','sylvren','human','cairnkin','emberkin'][i%7]}))
];
export const CAPITAL_SIGNS=[
 {id:'city-gate',x:413,z:136,name:'Alderhaven · Gate of Welcome',destinations:[{name:'Willowcross · Cinderwood Reach',x:202,z:88},{name:'Fourwinds Exchange · Bank',x:618,z:145},{name:'The Unlatched Door · Inn',x:465,z:203}]},
 ...CAPITAL_DISTRICTS.map(d=>({id:`city-${d.id}`,x:d.x+8,z:d.z+8,name:d.name,destinations:CAPITAL_DISTRICTS.filter(v=>v.id!==d.id).sort((a,b)=>Math.hypot(a.x-d.x,a.z-d.z)-Math.hypot(b.x-d.x,b.z-d.z)).slice(0,3).map(v=>({name:v.name,x:v.x,z:v.z}))})),
 {id:'city-services',x:620,z:138,name:'Fourwinds services',destinations:[{name:'Common Vault · Bank',x:587,z:121},{name:'Market hearth · Bind return',x:600,z:91},{name:'City provisions',x:645,z:121},{name:'Assembly · First Speaker',x:837,z:-57}]},
 {id:'city-archive',x:672,z:-105,name:'Archive walk',destinations:[{name:'Keeper Ysra Vey',x:665,z:-151},{name:'Assembly of the Open Hand',x:837,z:-57},{name:'Fourwinds Exchange',x:618,z:145}]}
];
export function capitalDistrictAt(x,z){return [...CAPITAL_DISTRICTS].sort((a,b)=>Math.hypot(x-a.x,z-a.z)-Math.hypot(x-b.x,z-b.z))[0];}
export const CAPITAL_WAYPOINTS=[
 {id:'alderhaven-gate',name:'Alderhaven · Gate of Welcome',mapId:'alderhaven',x:465,z:201,npcId:'alder-gate-keeper',available:true},
 {id:'alderhaven-market',name:'Alderhaven · Market Hearth',mapId:'alderhaven',x:602,z:91,npcId:'alder-market-keeper',available:true},
 {id:'alderhaven-gardens',name:'Alderhaven · Lantern Gardens',mapId:'alderhaven',x:850,z:345,npcId:'alder-garden-keeper',available:true}
];
export const CAPITAL_WALL_SEGMENTS=CAPITAL_OUTLINE.map((a,i)=>({a,b:CAPITAL_OUTLINE[(i+1)%CAPITAL_OUTLINE.length]}));
export const CAPITAL_WALL_POSTS=CAPITAL_WALL_SEGMENTS.flatMap(({a,b},index)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3);return Array.from({length:n},(_,i)=>({id:`city-wall:${index}:${i}`,x:a[0]+(b[0]-a[0])*i/n,z:a[1]+(b[1]-a[1])*i/n})).filter(p=>!(p.x<400&&Math.abs(p.z-142)<12)&&!(p.x>1100&&Math.abs(p.z-9)<12));});
const ceremonial={speaker:{armorType:'plate',main:'#426575',trim:'#dfc17e',detail:'#2b414c',cloth:'#32505c'},archivist:{armorType:'cloth',main:'#76678c',trim:'#ddd2b0',detail:'#403a58',cloth:'#635477'},bellfounder:{armorType:'mail',main:'#8f6743',trim:'#dcb266',detail:'#493b31',cloth:'#685840'},lowdoor:{armorType:'leather',main:'#596d54',trim:'#d0b17e',detail:'#3b4837',cloth:'#607b60'},relief:{armorType:'cloth',main:'#ded6b7',trim:'#79b6b0',detail:'#707d73',cloth:'#bdcbbd'}};
export const CAPITAL_REGALIA={};
for(const [id,colors]of Object.entries(ceremonial))for(const slot of ['armor','shoulders','back','feet'])CAPITAL_REGALIA[`regalia_${id}_${slot}`]={name:`${id} ceremonial ${slot}`,slot,npcOnly:true,quality:'common',armorType:colors.armorType,appearance:{model:'armor',slot,tier:'boss',...colors,glow:colors.trim,light:colors.trim},description:'Ceremonial city clothing, not an adventurer reward.'};
for(const n of CAPITAL_NPCS)if(n.regalia){n.equipment=Object.fromEntries(['armor','shoulders','back','feet'].map(slot=>[slot,`regalia_${n.regalia}_${slot}`]));n.appearance={skin:({speaker:'deep',archivist:'pearl',bellfounder:'bronze',lowdoor:'olive',relief:'warm'})[n.regalia],hairStyle:({speaker:'braid',archivist:'bob',bellfounder:'bald',lowdoor:'ponytail',relief:'swept'})[n.regalia],hairColor:({speaker:'silver',archivist:'raven',bellfounder:'copper',lowdoor:'chestnut',relief:'ash'})[n.regalia],facialHair:n.regalia==='bellfounder'?'full':'none',face:n.regalia==='speaker'?'angular':'balanced',build:n.regalia==='bellfounder'?'broad':'balanced'};}
export const CAPITAL_PROPS=[
 ...[[568,150],[568,164],[587,172],[637,172],[661,166]].map(([x,z])=>({id:'market_stall',x,z,region:'cinderwood'})),
 ...[[430,151],[487,160],[606,153],[816,45],[697,-72],[1007,170],[823,290],[637,354]].map(([x,z])=>({id:'wayside_lantern',x,z,region:'cinderwood'})),
 ...[[824,276],[839,306],[785,326],[672,350],[618,318]].map(([x,z])=>({id:'bench',x,z,region:'cinderwood'})),
 {id:'well',x:593,z:153,region:'cinderwood'},
 {id:'crate_stack',x:975,z:184,region:'emberwastes'},
 {id:'handcart',x:1011,z:30,region:'brinecoast'}
];
