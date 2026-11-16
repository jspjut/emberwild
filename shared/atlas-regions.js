// Regional charts group geography, not simulation ownership or level locks.
export const ATLAS_REGIONS=[
 {id:'dawnlands',name:'Dawnlands',color:'#a9b681',capital:'alderhaven'},
 {id:'greenward',name:'Greenward Wilds',color:'#759c78',capital:'sylvarin'},
 {id:'crownspine',name:'Crownspine',color:'#a3b2b7',capital:'karndur'},
 {id:'lantern-marches',name:'Lantern Marches',color:'#b99579',capital:'veshkar'},
 {id:'saltwind',name:'Saltwind Coast',color:'#8eafaa',capital:'nereides'}
];
export function atlasRegionFor(zone){
 if(zone.id==='cinderwood'||zone.id==='alderhaven'||zone.kind==='leveling'&&zone.band<2)return 'dawnlands';
 if(zone.kind==='capital')return ATLAS_REGIONS.find(r=>r.capital===zone.id).id;
 if(zone.kind==='max-level'){const index=['hushcanopy','palespore','worldanvil','stillwinter','abyssalstep','prismtide','lastcaldera','ashclock','brokenorrery','stormcrown'].indexOf(zone.id);return index<2?'greenward':index<5?'crownspine':index<8?'lantern-marches':'saltwind';}
 return ['greenward','crownspine','lantern-marches','saltwind'][zone.route];
}
