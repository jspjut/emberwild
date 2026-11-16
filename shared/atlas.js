import {REACH_WATERS} from './reach-geography.js';
import {CAPITAL_BOUNDS,CAPITAL_DISTRICTS,CAPITAL_ROADS,CAPITAL_BUILDINGS,CAPITAL_OUTLINE} from './capital.js';
import {zoneAt} from './zone-layout.js';
export {WORLD_CONTENT_SLOTS} from './world-plan.js';
import {introPoint,QUIET_POOL,ZONE_EXITS} from './zone-layout.js';
import {OUTPOSTS,ROUTES} from './world-layouts.js';
// Authored atlas coordinates, deliberately independent of terrain meshes.
// Every map uses the same paper size. A child places its whole chart inside
// its parent's `placement`; only charted children can be opened.
export const ATLAS_SIZE={width:1000,height:720};
export const STARTING_MAP='cinderwood';
export const ATLAS_MAPS={
  emberwild:{id:'emberwild',name:'Emberwild',kind:'World',parent:null,charted:true,
    subtitle:'An atlas of the known world',
    survey:[[212,377],[241,273],[333,179],[459,157],[565,202],[633,272],[682,360],[631,459],[533,529],[400,552],[280,481]],
    washes:[{x:438,y:354,rx:194,ry:160,color:'#85916b'}],
    forests:[{x:368,y:389,rx:66,ry:45,count:20},{x:502,y:293,rx:60,ry:45,count:15}],
    mountains:[{x:410,y:250,count:6,size:26}],
    rivers:[[[445,285],[424,337],[435,408],[408,482]]],
    labels:[{text:'THE DAWNLANDS',x:443,y:443,size:27},{text:'The unmeasured sea',x:769,y:340,size:19,italic:true}],
    unknown:[{x:747,y:488,text:'Beyond the known horizon'},{x:203,y:145,text:'Uncharted'}]},
  dawnlands:{id:'dawnlands',name:'The Dawnlands',kind:'Region',parent:'emberwild',charted:true,
    placement:{x:255,y:200,width:350,height:302},outline:[[270,418],[269,310],[319,222],[435,200],[536,235],[605,321],[585,412],[501,481],[381,502]],
    subtitle:'The frontier charts · southern survey',
    survey:[[204,523],[217,444],[266,402],[256,330],[320,272],[412,256],[500,288],[574,352],[615,430],[592,509],[508,580],[367,604],[264,571]],
    washes:[{x:400,y:447,rx:173,ry:140,color:'#9ca06d'}],
    forests:[{x:483,y:403,rx:70,ry:58,count:28},{x:294,y:468,rx:35,ry:53,count:15}],
    mountains:[{x:333,y:320,count:7,size:24}],
    rivers:[[[334,351],[316,404],[330,478],[306,558]]],
    roads:[[[400,542],[413,469],[448,425],[461,366]]],
    settlements:[{x:413,y:497,type:'village'}],
    labels:[{text:'CINDERWOOD REACH',x:414,y:554,size:24},{text:'Southern frontier',x:418,y:580,size:14,italic:true}],
    unknown:[{x:720,y:228,text:'Northern charts unfinished'},{x:771,y:480,text:'Lands yet to be charted'},{x:172,y:214,text:'Uncharted'}]},
  cinderwood:{id:'cinderwood',name:'The Cinderwood Reach',kind:'Zone',parent:'dawnlands',charted:true,
    placement:{x:258,y:330,width:335,height:260},outline:[[264,504],[279,403],[352,347],[445,330],[528,374],[593,470],[555,546],[434,590],[324,563]],
    subtitle:'Hearthstead & the paths of first light · levels 1–6',
    bounds:{minX:-80,maxX:80,minZ:-72,maxZ:72},
    survey:[[139,574],[122,484],[139,388],[130,285],[177,202],[277,111],[398,80],[529,90],[654,97],[771,150],[855,244],[872,354],[849,449],[791,526],[684,592],[559,627],[427,639],[292,617]],
    washes:[{x:300,y:412,rx:155,ry:175,color:'#a6a569'},{x:700,y:361,rx:141,ry:168,color:'#7d956f'},{x:539,y:187,rx:202,ry:89,color:'#aaa08d'},{x:505,y:538,rx:130,ry:75,color:'#c8a575'}],
    forests:[{x:244,y:293,rx:65,ry:52,count:19},{x:727,y:338,rx:92,ry:116,count:42},{x:359,y:172,rx:52,ry:35,count:12},{x:344,y:572,rx:57,ry:27,count:14}],
    mountains:[{x:353,y:144,count:6,size:20},{x:630,y:138,count:6,size:23},{x:777,y:232,count:3,size:18}],
    rivers:[[[173,135],[190,235],[173,350],[188,446],[173,581]]],
    roads:[[[500,550],[500,450]],[[500,475],[425,456],[338,420]],[[338,420],[313,361],[300,295]],[[500,475],[588,432],[681,375]],[[681,375],[688,336],[688,290]],[[500,450],[508,325],[519,210]],[[519,210],[562,194],[613,165]],[[519,210],[468,164],[406,115]]],
    settlements:[{x:486,y:511,type:'village'},{x:575,y:181,type:'ruin'},{x:406,y:115,type:'hollow'},{x:500,y:483,type:'hearth'}],
    fieldStrokes:[...Array.from({length:8},(_,i)=>{const x=240+i*11;return [[x,371],[x+7,391],[x+12,406]];}),...Array.from({length:6},(_,i)=>{const x=444+i*13;return [[x,360],[x+5,357],[x+10,361]];})],
    labels:[{text:'HEARTHSTEAD',x:510,y:591,size:23},{text:'Ambermead',x:315,y:467,size:25,italic:true},{text:'Briarwatch',x:732,y:457,size:25,italic:true},{text:'Grove',x:732,y:481,size:18,italic:true},{text:'ASHGLASS SANCTUARY',x:601,y:234,size:18},{text:'The Hollow',x:388,y:102,size:17,italic:true},{text:'Willowrun',x:158,y:374,size:17,italic:true,angle:-1.52}],
    unknown:[{x:868,y:565,text:'The unwritten wilds'},{x:165,y:94,text:'Uncharted'},{x:768,y:117,text:'Here the chart ends'}]}
};

// The refined frontier has its own authored chart and reserves the capital's
// approach as unfinished paper; the city has a chart of its own.
{
 const map=ATLAS_MAPS.cinderwood;map.bounds={minX:-400,maxX:400,minZ:-160,maxZ:420};map.subtitle='First Light, Willowcross & six far roads · levels 1–10';
 const point=(x,z)=>[(x+400)/800*1000,(z+160)/580*720];
 map.survey=[[60,140],[75,73],[375,65],[650,65],[925,80],[942,190],[940,590],[900,660],[105,660],[60,590]];
 map.washes=[{x:500,y:200,rx:150,ry:110,color:'#b8af72'},{x:500,y:425,rx:120,ry:170,color:'#bea371'},{x:200,y:180,rx:115,ry:100,color:'#7f9869'},{x:800,y:180,rx:110,ry:95,color:'#91af9d'},{x:200,y:405,rx:120,ry:100,color:'#9bada8'},{x:200,y:580,rx:115,ry:90,color:'#b09069'},{x:795,y:577,rx:120,ry:85,color:'#7e9b79'}];
 map.forests=[{x:220,y:210,rx:110,ry:80,count:35},{x:500,y:190,rx:110,ry:65,count:26},{x:760,y:250,rx:100,ry:60,count:25},{x:220,y:470,rx:95,ry:60,count:25},{x:760,y:535,rx:100,ry:70,count:30}];
 map.mountains=[{x:115,y:375,count:3,size:18},{x:885,y:320,count:3,size:18},{x:360,y:98,count:4,size:15}];
 map.rivers=[[[-70,-110],[-75,0],[-66,140],[-74,250],[-68,370]].map(([x,z])=>point(x,z))];
 map.roads=ROUTES.filter(path=>path[0][0]<350).map(path=>path.map(([x,z])=>point(x,z)));map.settlements=[];map.labels=[];
 for(const o of [{x:0,z:132,name:'WILLOWCROSS',size:22},...OUTPOSTS.map(o=>({...o,name:o.name,size:17})),{...introPoint(0,29),name:'HEARTHSTEAD',size:18},{...introPoint(65,-8),name:'Lantern Rest',size:12}]){const[x,y]=point(o.x,o.z);map.settlements.push({x,y,type:'village'});map.labels.push({text:o.name,x,y:y-23,size:o.size,italic:o.size<18});}
 for(const o of OUTPOSTS){const[x,y]=point(o.siteX,o.siteZ);map.settlements.push({x,y,type:'hollow'});}
 const sanctuary=introPoint(12,-36),hollow=introPoint(-15,-49);for(const [location,name,type]of [[sanctuary,'Ashglass Sanctuary','ruin'],[hollow,'The Hollow','hollow']]){const[x,y]=point(location.x,location.z);map.settlements.push({x,y,type});map.labels.push({text:name,x:x+25,y:y-20,size:12,italic:true});}
 for(const exit of ZONE_EXITS){const[x,y]=point(exit.x,exit.z);map.labels.push({text:`${exit.direction==='west'?'← ':''}${exit.neighbor}${exit.direction==='east'?' →':exit.direction==='south'?' ↓':''}`,x:Math.max(100,Math.min(900,x)),y:y+20,size:12,italic:true});}
 const[poolX,poolY]=point(QUIET_POOL.x,QUIET_POOL.z);map.lakes=[{x:poolX,y:poolY,rx:QUIET_POOL.radiusX/800*1000,ry:QUIET_POOL.radiusZ/580*720}];map.labels.push({text:'Quiet Pool',x:poolX-40,y:poolY-16,size:12,italic:true});
 map.lakes.push(...REACH_WATERS.map(w=>{const[x,y]=point(w.x,w.z);map.labels.push({text:w.name,x:x-30,y:y-15,size:12,italic:true});return {x,y,rx:w.radiusX/800*1000,ry:w.radiusZ/580*720};}));
 map.fieldStrokes=Array.from({length:10},(_,i)=>[[465+i*7,470],[469+i*7,489],[465+i*7,510]]);
 map.unknown=[{x:165,y:105,text:'Beyond the woods'}];
 ATLAS_MAPS.dawnlands.labels.push({text:'ALDERHAVEN',x:748,y:410,size:20});ATLAS_MAPS.dawnlands.settlements.push({x:748,y:450,type:'capital'});
 const cityPoint=(x,z)=>[(x-CAPITAL_BOUNDS.minX)/(CAPITAL_BOUNDS.maxX-CAPITAL_BOUNDS.minX)*1000,(z-CAPITAL_BOUNDS.minZ)/(CAPITAL_BOUNDS.maxZ-CAPITAL_BOUNDS.minZ)*720];
 ATLAS_MAPS.alderhaven={id:'alderhaven',name:'Alderhaven',kind:'Capital city',parent:'dawnlands',charted:true,placement:{x:660,y:350,width:185,height:205},outline:[[660,350],[845,350],[845,555],[660,555]],bounds:{...CAPITAL_BOUNDS},subtitle:'The Open Hand · eight wards and the river road',survey:[[30,100],[390,35],[805,75],[990,180],[990,655],[685,690],[100,645],[25,430]],
 washes:CAPITAL_DISTRICTS.map(d=>{const[x,y]=cityPoint(d.x,d.z);return {x,y,rx:100,ry:82,color:d.color};}),
 rivers:[[[1162,-220],[1162,510]].map(([x,z])=>cityPoint(x,z))],roads:CAPITAL_ROADS.map(r=>r.map(([x,z])=>cityPoint(x,z))),forests:[],mountains:[],unknown:[],
 blocks:CAPITAL_BUILDINGS.map(b=>{const[x,y]=cityPoint(b.x,b.z);return {x,y,w:b.width/840*1000,h:b.depth/780*720,landmark:!!b.landmark};}),
 walls:[...CAPITAL_OUTLINE,CAPITAL_OUTLINE[0]].map(([x,z])=>cityPoint(x,z)),
 labels:CAPITAL_DISTRICTS.map(d=>{const[x,y]=cityPoint(d.x,d.z);return {text:d.name,x,y:y+40,size:d.id==='civic'?22:17,italic:true};}),settlements:[]};

}

import {extendContinentAtlas} from './continent-atlas.js';
extendContinentAtlas(ATLAS_MAPS);

import {createAtlasRules} from './atlas-rules.js';
export const {atlasMap,atlasChildren,atlasTrail,containsPoint,atlasHit,projectAtlasLocation}=createAtlasRules({ATLAS_MAPS,ATLAS_SIZE,STARTING_MAP,zoneAt});
