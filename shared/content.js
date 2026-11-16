import {WORLD_SITES as SETTLEMENT_SITES,QUEST_HUBS} from './continent-settlements.js';
import {CONTINENT_ENEMY_TEMPLATES,CONTINENT_ITEM_TEMPLATES} from './continent-templates.js';
import {BUILDINGS as WORLD_BUILDINGS} from './buildings.js';
import {CONTINENT_ZONES} from './continent.js';
import {CONTINENT_WARDS} from './continent-buildings.js';
import {CITY_WALKERS} from './city-routines.js';
import {CAPITAL_NPCS,CAPITAL_DISTRICTS,CAPITAL_REGALIA} from './capital.js';
import {introPoint,QUIET_POOL_SHORE,SPAWN,ZONE_BOUNDS,WORLD_BOUNDS,LAYOUT_REVISION,withinZone} from './zone-layout.js';
import {QUEST_STORY,NPC_STORY} from './story-content.js';
// Original game data shared by the renderer and authoritative simulation.
import { groundWalkable,SUPPLY_CRATES } from './props.js';
import { TERRAIN_FOUNDATIONS } from './terrain.js';
import {LIVE_LEVEL_CAP,BAG_PROGRESSION} from './progression.js';
import {CLASS_SKILLS,classDefinition,skillForRole} from './adventurers.js';
import {WORLD_RADIUS,OUTPOSTS} from './world-layouts.js';
import {CLASS_ITEMS,EXPANSION_NPCS,EXPANSION_ENEMIES,EXPANSION_SPAWNS,EXPANSION_GATHERABLES,EXPANSION_QUESTS,rewardItemFor} from './expansion-content.js';
export {rewardItemFor} from './expansion-content.js';
export const ZONE = { name: 'The Cinderwood Reach', radius: WORLD_RADIUS, spawn: SPAWN, bounds:WORLD_BOUNDS,layoutRevision:LAYOUT_REVISION,maxPlayers: 64 };
export const LEVEL_XP = [0, 0, 180, 500, 950, 1500, 2200, 3500, 5200, 7300, 9800];
export const BAG_CAPACITY = 20;
export const BAG_EQUIP_SLOTS = 4;
export const STACK_SIZE = 99;
export const GLOBAL_COOLDOWN = 1.5;
export const SKILLS=CLASS_SKILLS;
// Canonical IDs retain the original three slots so existing characters migrate intact.
export {EQUIPMENT_SLOTS,equipmentSlot,emptyEquipment} from './equipment-slots.js';
import {createInventoryRules} from './inventory-rules.js';
export const ITEMS = {
  training_blade: { allowedClasses:['dawnwarden'],name: 'Wayfarer’s blade', icon: '⚔', slot: 'weapon', appearance:{model:'sword',style:'iron',main:'#b5c3bd',trim:'#8f7953',detail:'#574d38'}, power: 0, quality: 'common', description: 'A well-balanced iron blade.' },
  linen_coat: { armorType:'cloth',name: 'Travel-worn coat', icon: '♜', slot: 'armor', appearance:{model:'coat',style:'cloth',main:'#697b73',trim:'#b5a581',detail:'#3e514c'}, armor: 0, quality: 'common', description: 'It has seen kinder roads.' },
  copper_blade: { allowedClasses:['dawnwarden'],name: 'Hearthguard blade', icon: '⚔', slot: 'weapon', appearance:{model:'sword',style:'copper',main:'#d69a61',trim:'#e2c189',detail:'#643f2e'}, power: 4, quality: 'common', sell:8, description: '+4 attack power. Forged at the outpost.' },
  trail_charm: { name: 'Trailkeeper’s charm', icon: '◈', slot: 'charm', vitality: 15, quality: 'common', sell:8, description: '+15 maximum health.' },
  bark_coat: { armorType:'leather',name: 'Barkweave mantle', icon: '♜', slot: 'armor', appearance:{model:'coat',style:'bark',main:'#536e49',trim:'#b4a474',detail:'#383f2d'}, armor: 2, quality: 'uncommon', sell:8, description: 'Reduces incoming damage by 2.' },
  dawn_blade: { allowedClasses:['dawnwarden'],name: 'Dawnforged edge', icon: '⚔', slot: 'weapon', appearance:{model:'sword',style:'copper',main:'#b5c1b5',trim:'#a8a080',detail:'#53614b'}, power: 10, quality: 'uncommon', sell:18, description: '+10 attack power. Reforged dawnsteel for a keeper of the Reach.' },
  sentinel_coat: { armorType:'plate',name: 'Sentinel’s vestment', icon: '♜', slot: 'armor', appearance:{model:'coat',style:'sentinel',main:'#647d88',trim:'#e0c68e',detail:'#334a59'}, armor: 4, quality: 'uncommon', sell:18, description: 'Reduces incoming damage by 4. The Reach remembers.' },
  outpost_buckler: {name:'Outpost buckler',icon:'⛨',slot:'offhand',appearance:{model:'shield',style:'round',main:'#8b6141',trim:'#a6b3ac',detail:'#535d56'},armor:1,quality:'common',price:14,description:'An iron-rimmed wooden shield, made for the western trail.'},
  trail_cap: {name:'Trailkeeper’s cap',icon:'⌂',slot:'head',appearance:{model:'hat',style:'cap',main:'#6a7652',trim:'#bdab78',detail:'#3b4d3d'},quality:'common',price:10,description:'A soft cap with a wide brim and a stitched sun badge.'},
  road_trousers: {name:'Roadwoven trousers',icon:'♜',slot:'legs',appearance:{model:'trousers',style:'cloth',main:'#75684f',trim:'#aa9570',detail:'#4b4837'},quality:'common',price:8,description:'Reinforced knees and room enough to run.'},
  wayfarer_boots: {name:'Wayfarer’s boots',icon:'♟',slot:'feet',appearance:{model:'boots',style:'leather',main:'#674b37',trim:'#b29b70',detail:'#332f28'},quality:'common',price:10,description:'Cuffed leather boots with sturdy dark soles.'},
  potion: { name: 'Hearth tonic', icon: '⚗', quality: 'common', consumable: true, price: 6, sell: 1, description: 'Restores 80 health. 8 second cooldown. Right-click to use, or drag onto your action bar.' },
  resin: { name: 'Amber resin', icon: '◆', quality: 'common', sell: 3, description: 'A fragrant trade good. Sell to Tavi.' },
  splinter: { name: 'Dull crystal', icon: '◇', quality: 'common', sell: 5, description: 'A remnant of the old wards. Sell to Tavi.' },
  seed_pouch: { name: 'Recovered seed pouch', icon: '❧', quality: 'common', quest: true, description: 'Seeds recovered for Tavi. Bring five back to Hearthstead.' },
  seedheart: { name: 'Intact seedheart', icon: '❧', quality: 'common', quest: true, description: 'A living seed from the grove. Sera can keep it safe.' },
  dawnsteel_fragment: { name: 'Dawnsteel fragment', icon: '◇', quality: 'common', quest: true, description: 'An old alloy that still holds the dawn. Orin needs five.' },
  linen_pouch: { name: 'Trailside pouch', icon: '▣', quality: 'common', bagSlots: 6, price: 6, sell: 1, description: 'A 6-slot bag. Right-click to equip in an empty bag slot, or drag onto a bag slot.' },
  trail_satchel: { name: 'Trailkeeper’s satchel', icon: '▣', quality: 'common', bagSlots: 8, price: 18, sell: 4, description: 'An 8-slot bag, stitched for the western road.' },
  ranger_pack: { name: 'Ranger’s field pack', icon: '▣', quality: 'uncommon', bagSlots: 12, price: 42, sell: 9, description: 'A sturdy 12-slot bag. Expanded storage for a long journey.' },
  sunmint: { name: 'Sunmint sprig', icon: '❧', quality: 'common', sell: 1, description: 'An aromatic herb from the western seedbeds. Trade material.' },
  copper_ore: { name: 'Copper ore', icon: '◇', quality: 'common', sell: 2, description: 'Raw copper from a surface seam. Trade material.' }
};
Object.assign(ITEMS,CLASS_ITEMS,CONTINENT_ITEM_TEMPLATES);
for(const tier of BAG_PROGRESSION){
  const existing=ITEMS[tier.id];ITEMS[tier.id]={name:tier.name,icon:'▣',quality:tier.slots<=8?'common':'uncommon',sell:Math.max(1,tier.slots),...existing,bagSlots:tier.slots,minLevel:tier.minLevel,description:`A ${tier.slots}-slot bag. ${tier.minLevel>11?'A future-region storage upgrade. ':''}Requires level ${tier.minLevel}.`};
}
export const MERCHANT_STOCK = ['potion','linen_pouch','trail_satchel','outpost_buckler','trail_cap','road_trousers','wayfarer_boots'];
export const RESOURCE_TYPES = { herb:{item:'sunmint',name:'Sunmint',tracking:'herbs',respawn:45}, ore:{item:'copper_ore',name:'Copper seam',tracking:'mining',respawn:60} };
// Currency value is authored independently of rarity; retagging a saved item
// should not silently change its stats or sale price.
for (const item of Object.values(ITEMS)) if (item.slot) item.sell ??= 2;
export const {compatibleEquipmentSlots,canEquipInSlot,VISIBLE_EQUIPMENT_SLOTS,visibleEquipment,equippedItemCount,defaultEquipmentSlot,normalizeEquipment,equipmentBonuses,inventoryCapacity,storedItemCount,bagContainers,bagEntries,canAddItem}=createInventoryRules({ITEMS,BAG_CAPACITY,BAG_EQUIP_SLOTS,STACK_SIZE});
const CORE_QUESTS = [
  { id: 'meadow', title: 'A small, sharp problem', objective: 'Defeat meadow nibblers', kind: 'kill', target: 'nibbler', count: 4, xp: 80, gold: 8, reward: 'copper_blade', location: { x: -22, z: 17 }, text: 'Welcome to Hearthstead, Dawnwarden. The meadow nibblers are tearing up our last seedbeds. Thin their numbers to the west, and I’ll find you a proper blade.', complete: 'Good work. A frontier survives on small acts of courage. Take this blade; you have earned it.' },
  { id: 'supplies', title: 'What the road left behind', objective: 'Recover abandoned supply crates', kind: 'gather', target: 'cache', count: 3, xp: 110, gold: 10, reward: 'trail_charm', location: { x: -32, z: 5 }, text: 'Our last caravan scattered its supplies along the western trail. Recover three crates. Watch for nibblers; the little beasts have a taste for canvas.', complete: 'Food, tools, and medicine. This will keep the hearth burning. Carry this trail charm with you.' },
  { id: 'thicket', title: 'Roots of unrest', objective: 'Defeat thornbound prowlers', kind: 'kill', target: 'prowler', count: 4, xp: 150, gold: 14, reward: 'bark_coat', location: { x: 29, z: 2 }, text: 'Living thorns have taken the eastern grove. Their roots glow with the same strange fire as the ruins. Clear a path through the thornbound prowlers.', complete: 'So the corruption is spreading from the old sanctuary. This barkweave should turn their thorns.' },
  { id: 'beacons', title: 'The sleeping lanterns', objective: 'Rekindle the ancient beacons', kind: 'gather', target: 'beacon', count: 3, xp: 170, gold: 16, reward: 'potion', rewardCount: 4, location: { x: 4, z: -20 }, text: 'Three lanterns once guarded these woods. Rekindle them with your dawnfire: one by the west trail, one in the eastern grove, and one at the sanctuary gate. Their light will reveal what stirs beneath.', complete: 'The lanterns answer! Something has broken the heart of the sanctuary. Prepare yourself before you go north.' },
  { id: 'shards', title: 'Fragments of a fallen dawn', objective: 'Defeat ashglass sentinels', kind: 'kill', target: 'shardling', count: 4, xp: 180, gold: 22, reward: 'dawn_blade', location: { x: 17, z: -34 }, text: 'The sanctuary guardians have shattered into ashglass. Free four of them from their restless watch. Then we can reach the creature at the heart of this blight.', complete: 'Their watch is over. I have reforged one of the fragments into an edge worthy of a Dawnwarden.' },
  { id: 'heart', title: 'A light in the hollow', objective: 'Defeat the Hollow Warden', kind: 'kill', target: 'warden', count: 1, xp: 350, gold: 40, reward: 'sentinel_coat', location: { x: -15, z: -49 }, text: 'The Hollow Warden waits beyond the sanctuary. Its roots drink the light of the whole Reach. Break its hold. When the earth glows red, move out of its reach, and let your light do the rest.', complete: 'You brought the dawn home. Hearthstead will remember your name. This is only the beginning of your journey, Dawnwarden.' }
];
export const NPCS = [
  { id: 'elowen', name: 'Elowen Ashford', title: 'Keeper of Hearthstead', x: 0, z: 20, facing:0, color: 0xe5b875, role: 'quest' },
  { id: 'tavi', name: 'Tavi Reed', title: 'Provisions & trade', x: 12, z: 31, facing:Math.PI, color: 0x8ec5bc, role: 'merchant', services:['merchant'] },
  { id: 'sera', name: 'Sera of the Hearth', title: 'Rest & recovery', x: -13, z: 28, facing:Math.PI/2, color: 0xc3a5dc, role: 'healer', services:['inn','healer'] },
  { id: 'orin', name: 'Orin Vale', title: 'Class mentor', x: 13, z: 15, facing:-Math.PI/2, color: 0xe3c289, role: 'quest', services:['trainer'] },
  { id: 'rowan', name: 'Rowan Fen', title: 'Western trailkeeper', x: -43, z: -7, facing:Math.PI/2, color: 0xa6bb88, role: 'quest' },
  { id: 'briar', name: 'Briar Moss', title: 'Grove tender', x: 49, z: 18, facing:-Math.PI/2, color: 0x95b2a0, role: 'quest' },
  { id: 'scout', name: 'Ilan Wren', title: 'Sanctuary outrider', x: -3, z: -23, color: 0xb4afc5, role: 'quest' }
];
for(const n of NPCS)Object.assign(n,introPoint(n.x,n.z));
NPCS.push(...EXPANSION_NPCS,{id:'lysa',name:'Lysa Rootsong',title:'Listener at Lantern Rest',raceId:'sylvren',...introPoint(65,-8),facing:Math.PI,role:'quest',color:0x9eb792,factionId:'rootbound',lore:'We came to listen to the injured grove. Its creatures remember kindness, even while the thorns make them afraid.'});
export const GATHERABLES = [
  ...SUPPLY_CRATES, ...EXPANSION_GATHERABLES,
  { id: 'beacon1', type: 'beacon', x: -26, z: -17 }, { id: 'beacon2', type: 'beacon', x: 30, z: -12 }, { id: 'beacon3', type: 'beacon', x: 8, z: -28 }
];
GATHERABLES.push(
  ...[[-12,14],[-18,6],[-30,11],[-38,4]].map(([x,z],i)=>({id:`herb${i}`,type:'herb',x,z})),
  ...[[-35,-13],[-42,-9],[-37,-21]].map(([x,z],i)=>({id:`track${i}`,type:'track',x,z})),
  {id:'ledger',type:'ledger',x:-42,z:-25},
  ...[[-44,8],[36,-18],[-4,-40]].map(([x,z],i)=>({id:`ore${i}`,type:'ore',x,z})),
  ...[[22,11],[32,2],[39,-6],[26,-10]].map(([x,z],i)=>({id:`sap${i}`,type:'sap',x,z})),
  ...[[0,-33],[13,-28],[26,-34]].map(([x,z],i)=>({id:`page${i}`,type:'page',x,z}))
);

for(const g of GATHERABLES)if(!g.id.startsWith('keepsake-')&&!g.id.startsWith('orchard-')&&!g.id.startsWith('cache'))Object.assign(g,introPoint(g.x,g.z));
const core=(id,overrides)=>({...CORE_QUESTS.find(q=>q.id===id),...overrides});
const task=(id,title,giver,kind,target,count,xp,text,complete,extra={})=>({id,title,giver,turnIn:giver,kind,target,count,xp,gold:Math.max(2,Math.round(xp/12)),text,complete,...extra});
export const QUESTS = [
  task('welcome','A place by the fire','elowen','deliver','sera',1,20,'Before you brave the woods, introduce yourself to Sera by the western cottage. Every traveler should know the face that will welcome them home.','A new face, and a brave one. Sit a moment. The forest can wait for a steady breath.',{turnIn:'sera',reward:'potion',location:{x:-8,z:29},objective:'Introduce yourself to Sera'}),
  core('meadow',{giver:'elowen',turnIn:'elowen',requires:['welcome'],count:6,xp:70}),
  task('herbs','Something green for the kettle','sera','gather','herb',3,45,'My kettle is empty. Find three sprigs of sunmint among the western seedbeds. Leave the roots in the earth; we will need them again.','Perfect. Medicine starts with knowing what to leave growing.',{requires:['welcome'],reward:'potion',rewardCount:2,location:{x:-24,z:10},objective:'Gather sunmint sprigs'}),
  task('seeds','The seedbed thieves','tavi','loot','nibbler',5,55,'Those nibblers have swallowed half our seed stock! Bring back five seed pouches from their nests. Defeat the beasts, then search what they leave behind.','A little dirt never spoiled a good seed. We can plant again.',{requires:['meadow'],location:{x:-25,z:13},objective:'Loot recovered seed pouches'}),
  task('survey','Where the western road bends','tavi','explore',null,1,40,'Take a look beyond the western road bend. There should be a stone marker beside the creek. I want to know if the old trail is still passable.','Still standing? Good. Some things out here refuse to give way.',{requires:['supplies'],location:{x:-41,z:14},objective:'Reach the western road marker'}),
  core('supplies',{giver:'tavi',turnIn:'tavi',requires:['seeds'],xp:70,reward:'trail_satchel',complete:'Food, tools, and medicine. This will keep the hearth burning. Take this satchel; a good trailkeeper always makes room for what the road brings.'}),
  task('west_report','A parcel for Rowan','tavi','deliver','rowan',1,25,'Rowan keeps watch on the western trail, north of the lost crates. Carry these dry matches to his little camp. And tell him the supplies made it home.','Dry matches! You may have saved my supper. While you are here, I could use another pair of eyes.',{requires:['supplies'],turnIn:'rowan',minLevel:2,location:{x:-33,z:-6},objective:'Deliver Tavi’s parcel to Rowan'}),
  task('tracks','Tracks without footsteps','rowan','gather','track',3,60,'Three patches of blackened earth lie along the creek trail. Nothing walked there, but the grass bent toward the sanctuary. Examine them for me.','Roots, moving under the ground. So that is how the blight is traveling.',{requires:['west_report'],location:{x:-38,z:-14},objective:'Examine blackened root traces'}),
  task('creek','The quiet pool','rowan','explore',null,1,45,'There is a quiet pool northwest of here. I used to hear frogs there every night. Follow the short creekside path to its eastern bank and see whether anything still lives in it.','Frogs! That is better news than any scout report. There is still a healthy heart in these woods.',{requires:['west_report'],location:{x:-46,z:-18},objective:'Visit the quiet pool'}),
  task('ledger','The road remembers','rowan','gather','ledger',1,70,'A courier dropped her journal beyond the last root trace. It may explain where the caravan first met the blight. Find it by the fallen roadstone.','The last entry says the lanterns flickered before the roots moved. Tell the keeper when you next pass home.',{requires:['tracks'],location:{x:-42,z:-25},objective:'Recover the courier’s journal',reward:'trail_charm'}),
  task('class_spark','The shape of a spark','orin','skill','lance',3,60,'A Dawnwarden must be more than a swinging sword. Cast Ember Lance three times against the creatures threatening the Reach. Learn to choose your distance.','Fire follows intent. You are beginning to understand.',{requires:['social_greeting'],minLevel:2,location:{x:-24,z:12},objective:'Land Ember Lance on enemies'}),
  task('class_mercy','The light you keep','orin','skill','mend',2,70,'Our order endures because we know when to kindle our own light. Practice Kindle twice. Its ember cost matters; a dead hero protects no one.','Good. Mercy is a discipline, even when you offer it to yourself.',{requires:['class_spark'],minLevel:2,reward:'potion',rewardCount:3,location:{x:6,z:19},objective:'Practice Kindle'}),
  task('east_intro','A grove in need','elowen','deliver','briar',1,35,'Briar tends the grove east of Hearthstead. Her last message spoke of living thorns. Find her at the grove’s southern edge and offer your blade.','Elowen sent you? Then perhaps I can stop pretending that everything here is fine.',{requires:['ledger','social_greeting'],minLevel:3,turnIn:'briar',location:{x:34,z:16},objective:'Speak to Briar Moss'}),
  core('thicket',{giver:'briar',turnIn:'briar',requires:['east_intro'],count:6,xp:100,location:{x:30,z:1}}),
  task('sap','Amber under the bark','briar','gather','sap',4,70,'The old trees bleed clean amber even as their branches twist. Gather four drops from the marked saplings. I want to know whether the trees can still heal themselves.','Warm, clear, and alive. The blight has not reached their hearts.',{requires:['east_intro'],location:{x:30,z:1},objective:'Gather living amber'}),
  task('seedhearts','Little hearts of spring','sera','loot','prowler',4,75,'The prowlers carry the seedhearts of the grove. If you must fight them, recover four. I can keep those seeds alive until the forest is ready for them.','Four small lives saved from all this ruin. That matters, Dawnwarden.',{requires:['east_intro','herbs'],minLevel:3,location:{x:29,z:1},objective:'Loot intact seedhearts',reward:'potion',rewardCount:2}),
  task('missing_scout','At the edge of the ash','briar','deliver','scout',1,35,'Ilan was watching the sanctuary road when the thorns rose. Find him north of Hearthstead, just before the broken gate. Tell him the grove is holding.','Briar is safe? Good. I did not dare leave this road unguarded.',{requires:['thicket','social_peace'],turnIn:'scout',location:{x:-3,z:-23},objective:'Find outrider Ilan Wren'}),
  core('beacons',{giver:'scout',turnIn:'scout',requires:['missing_scout'],xp:110}),
  task('memory','Names beneath the ash','scout','gather','page',3,90,'There are memorial tablets scattered near the sanctuary. Copy three names before the ash swallows them. These guardians were people once. Someone should remember.','I knew one of these names. Thank you for bringing them back.',{requires:['missing_scout'],location:{x:13,z:-31},objective:'Read the memorial tablets'}),
  core('shards',{giver:'scout',turnIn:'scout',requires:['beacons'],count:6,xp:130,reward:null,complete:'Their long watch is over. The path to the hollow is clear. Tell Elowen what we found; it is time to bring the light home.'}),
  task('relics','An edge from the old dawn','orin','loot','shardling',5,100,'The broken sentinels carry fragments of dawnsteel. Bring me five from their remains. A weapon made from the Reach should serve the Reach again.','Listen to it ring. The metal remembers the morning. This blade is yours.',{requires:['class_mercy'],minLevel:4,location:{x:17,z:-35},objective:'Loot dawnsteel fragments',reward:'dawn_blade'}),
  task('class_dawn','Make room for the dawn','orin','skill','nova',3,90,'Dawnburst spreads your light to every foe around you. Practice it three times in battle. But never pull a crowd merely to prove you can; wisdom is also a weapon.','A steady hand, and light enough to share. You carry our name well.',{requires:['class_mercy'],minLevel:4,location:{x:17,z:-35},objective:'Use Dawnburst in battle'}),
  core('heart',{giver:'elowen',turnIn:'elowen',requires:['shards','memory'],minLevel:5,xp:180}),
  task('farewell','Tomorrow has a road','elowen','deliver','tavi',1,60,'Before you take the road beyond our valley, tell Tavi that the lanterns are burning again. There will be caravans to greet, and new travelers to welcome.','Then I will put another kettle on. When the next traveler arrives, I will tell them who brought our dawn home.',{requires:['heart'],emoteReward:'salute',turnIn:'tavi',location:{x:9,z:29},objective:'Share the good news with Tavi',reward:'potion',rewardCount:3})
 ,task('social_greeting','A greeting is a beginning','elowen','emote','wave',1,55,'You have earned your place here. Now learn your neighbors’ names. Stand near Sera and use /wave @nearby, or select her with a left click and use /wave. Press / to open chat. Skills → Emotes also lets you choose Everyone nearby. Public gestures reach twelve paces; selected gestures reach fifteen.','A wave, a welcome, and a small gift. Let me teach you a calming gesture: /soothe. It can reach creatures a blade cannot.',{requires:['meadow'],minLevel:2,emoteTarget:'sera',turnIn:'sera',emoteReward:'soothe',location:{x:-13,z:28},objective:'Greet Sera with /wave'}),
  task('social_road','A lantern beyond the grove','briar','deliver','lysa',1,65,'Our eastern path leads past the fighting to Lantern Rest. Lysa is listening to the creatures there. Take the winding road and meet her before deciding that every thorn is an enemy.','The road brought you here; listening will tell you why you should stay.',{requires:['east_intro'],turnIn:'lysa',location:{x:65,z:-8},objective:'Follow the eastern path to Lysa at Lantern Rest'}),
  task('social_listen','Listen before you speak','lysa','emote','bow',1,65,'Use /bow @nearby here, or select me and /bow. Here, we begin by making room for another voice. You can find all your gestures in Skills → Emotes; drag one onto a numbered action slot to give it a key.','You waited, you listened. Take the lantern-step with you. Try /dance with a friend, and see who joins in.',{requires:['social_road'],emoteTarget:'lysa',emoteReward:'dance',location:{x:65,z:-8},objective:'Greet Lysa with /bow'}),
  task('social_peace','Room for another path','lysa','emote','soothe',1,110,'An uninjured thornbound prowler can hear /soothe. Select one from a safe distance, before it attacks. Calm it to pass safely for 45 seconds. Different creatures build trust; repeating the same encounter does not. Never strike a creature whose trust you want to keep.','The Rootbound remember you. Calm more of them to become Friendly, and they will stop approaching you as a threat. This is your reputation, not a promise made for every traveler.',{requires:['social_listen'],emoteTarget:'prowler',reputationFaction:'rootbound',reputationReward:100,location:{x:59,z:-19},objective:'Calm an undisturbed thornbound prowler with /soothe'})
,...EXPANSION_QUESTS
].map(q=>({minLevel:1,requires:[],rewardCount:1,...q,...(!EXPANSION_QUESTS.includes(q)&&q.location?{location:introPoint(q.location.x,q.location.z)}:{}),...(q.id==='creek'?{location:{...QUIET_POOL_SHORE}}:{}),...(q.kind==='deliver'?{location:((n)=>({x:n.x,z:n.z}))(NPCS.find(n=>n.id===q.target))}:{}),skillRole:({class_spark:'ranged',class_mercy:'heal',class_dawn:'area'})[q.id],dropItem:({seeds:'seed_pouch',seedhearts:'seedheart',relics:'dawnsteel_fragment'})[q.id]}));
// Narrative revisions preserve accepted quest IDs, progress, rewards and objective geography.
for(const q of QUESTS)Object.assign(q,QUEST_STORY[q.id]||{});
NPCS.push(...CAPITAL_NPCS,...CITY_WALKERS);
for(const n of NPCS)if(NPC_STORY[n.id])n.lore=NPC_STORY[n.id];
QUESTS.find(q=>q.id==='five_roads').requires.push('town_seedroad');
// Briar sends the clean-amber finding to Lysa only after it has actually been gathered.
QUESTS.find(q=>q.id==='social_road').requires.push('sap');
Object.assign(ITEMS,CAPITAL_REGALIA);
ITEMS.city_vendor_pack={name:'Peddler’s pack',slot:'back',npcOnly:true,quality:'common',appearance:{model:'pack',main:'#8e6f48',trim:'#bda573',detail:'#4b5742'}};
const classLessons={
 dawnwarden:{ranged:'Stay in melee range and brace for Sundering Slash. A heavy blade strike takes 1.5 seconds; movement interrupts it.',heal:'Second Wind is a personal recovery. Stand still for 1.8 seconds to regain your own health; it cannot heal another traveler.',area:'Sweeping Blade strikes enemies around you. Close the distance before practicing your sweep.'},
 arcanist:{ranged:'Use Frost Needle to slow an enemy while moving, then stop to cast Cinderbolt. Your spells reward careful distance.',heal:'Prismatic Barrier absorbs damage rather than restoring health. Inscribe it before danger; use food, tonics or a healer to recover wounds.',area:'Aim Starfall at an enemy to strike the nearby cluster. Keep your distance and stand still until the cast completes.'},
 pathfinder:{ranged:'Quickshot fires an arrow instantly, even while moving. Alternate it with an aimed Piercing Shot at bow range.',heal:'Field Dressing bandages only your own wounds. Stand still for two seconds and plan around its long recovery time.',area:'Aim Volley at an enemy to rain arrows on the surrounding pack. Complete the draw before moving.'},
 stormcaller:{ranged:'Storm Spark is an instant ranged attack. Alternate it with Lightning Bolt to clear threats while traveling alone.',heal:'Healing Rain restores a selected living friend, or yourself with an enemy or no target selected. Stay within 24 paces and line of sight until the cast completes.',area:'Mending Tide heals yourself and nearby living party members. It is a recovery spell, not an attack; practice it with a wounded party or on yourself.'}
};
export const questForPlayer=(p,q)=>{
 const skill=q.skillRole?skillForRole(p,q.skillRole):q.target,lesson=classLessons[classDefinition(p.classId).id]?.[q.skillRole];
 // The story capstone reaches level ten even for support kits that earn less
 // incidental kill XP while practicing their healing skills.
 const xp=q.id==='five_roads'?Math.max(q.xp,LEVEL_XP[LIVE_LEVEL_CAP]-(p.xp||0)):q.xp;
 return {...q,xp,target:skill,reward:rewardItemFor(p,q),text:lesson?`${classDefinition(p.classId).name}: ${lesson}`:q.text.replaceAll('Dawnwarden',classDefinition(p.classId).name),objective:q.skillRole?`Practice ${SKILLS[skill].name}`:q.objective};
};
import {createQuestRules} from './quest-rules.js';
export const {questRecord,questDone,questReady,questAvailable,activeQuests,trackedQuest,npcQuests,dialogueQuests,questDestination}=createQuestRules({QUESTS,NPCS,questForPlayer,defaultClassId:'dawnwarden'});
export const ENEMY_TYPES = {
  nibbler: { name: 'Meadow nibbler', level: 1, hp: 110, damage: 4, xp: 20, speed: 3, aggro: 0, color: 0xb88b56, loot: 'resin' },
  prowler: { factionId:'rootbound',name: 'Thornbound prowler', level: 3, hp: 160, damage: 7, xp: 30, speed: 3.5, aggro: 7, color: 0x73885a, loot: 'resin' },
  shardling: { name: 'Ashglass sentinel', level: 4, hp: 230, damage: 10, xp: 42, speed: 3, aggro: 8, color: 0x9b7db8, loot: 'splinter' },
  warden: { name: 'The Hollow Warden', level: 5, hp: 720, damage: 13, xp: 100, speed: 2.4, aggro: 11, color: 0x625774, loot: 'splinter', boss: true }
};
Object.assign(ENEMY_TYPES,EXPANSION_ENEMIES,CONTINENT_ENEMY_TEMPLATES);
export const ENEMY_SPAWNS = [
  ...[[-18,18],[-28,19],[-23,9],[-36,13],[-32,-2],[-40,0],[-35,-11],[-17,4]].map(([x,z]) => ({ type: 'nibbler', x, z })),
  ...[[59,-19],[70,-23],[75,-10],[21,8],[30,7],[36,0],[24,-3],[33,-11],[40,-8]].map(([x,z]) => ({ type: 'prowler', x, z })),
  ...[[10,-32],[20,-29],[28,-37],[15,-43],[3,-39],[24,-46]].map(([x,z]) => ({ type: 'shardling', x, z })),
  { type: 'warden', x: -15, z: -53 }, ...EXPANSION_SPAWNS
];
export const LANDMARKS = [
  { name: 'Hearthstead', subtitle: 'A light at the edge of the wild', x: 0, z: 28, color: '#eac886' },
  { name: 'Ambermead', subtitle: 'Seedbeds & wandering teeth · Level 1', x: -27, z: 11, color: '#a9c878' },
  { name: 'Briarwatch Grove', subtitle: 'Something stirs beneath the roots · Level 3', x: 30, z: 0, color: '#91bdac' },
  { name: 'The Ashglass Sanctuary', subtitle: 'A fractured, forgotten dawn · Levels 4–5', x: 12, z: -36, color: '#bcace0' }
];
for(const l of LANDMARKS)Object.assign(l,introPoint(l.x,l.z));
for(const spawn of ENEMY_SPAWNS)if(!Object.hasOwn(EXPANSION_ENEMIES,spawn.type))Object.assign(spawn,introPoint(spawn.x,spawn.z));
LANDMARKS.push({name:'Willowcross',subtitle:'A common hearth · Levels 6–10',x:0,z:132,color:'#e4ca91'},{name:'Southfield',subtitle:'The town’s far fields',x:-28,z:258,color:'#bfb477'},{name:'Lantern Rest',subtitle:'Listen before you speak · Levels 2–4',...introPoint(65,-8),color:'#b5d5a5'},...OUTPOSTS.map(o=>({name:o.name,subtitle:`${o.title} · Levels 6–10`,x:o.x,z:o.z,color:'#b5b98b'})),...OUTPOSTS.map(o=>({name:({human:'The Locked Storehouse',sylvren:'Rootmemory Hollow',cairnkin:'The Resonant Vault',brinefolk:'Tideglass Grotto',emberkin:'The Quiet Kiln',reedwatch:'Reedwater Burrow'})[o.id],subtitle:'A troubled shelter · Watch the marked ground',x:o.siteX,z:o.siteZ,color:'#b4aaa0'})));
LANDMARKS.push(...SETTLEMENT_SITES.map(s=>({name:s.name,mapId:s.mapId,x:s.x,z:s.z,subtitle:s.zone.name})),...CONTINENT_ZONES.map(z=>({name:z.name,subtitle:z.identity,mapId:z.id,x:z.x,z:z.z,color:'#b8c7ac'})),...QUEST_HUBS.map(h=>({name:h.name,mapId:h.mapId,x:h.x,z:h.z,subtitle:h.zone.name})),...CONTINENT_WARDS.map(w=>({...w,subtitle:'Unoccupied capital ward',color:'#c4b8a1'})));
LANDMARKS.push(...CAPITAL_DISTRICTS.map(d=>({...d,mapId:'alderhaven',subtitle:d.subtitle})));
export const BUILDINGS = WORLD_BUILDINGS;
export { heightAt } from './terrain.js';
export function walkable(x, z) { return Number.isFinite(x) && Number.isFinite(z) && withinZone(x,z) && groundWalkable(x,z); }
export function levelForXP(xp) { let level = 1; while (level < LIVE_LEVEL_CAP && xp >= LEVEL_XP[level + 1]) level++; return level; }
export function stats(p) { const gear=equipmentBonuses(p),c=classDefinition(p.classId);return {maxHp:c.health+(p.level-1)*c.healthPerLevel+gear.vitality,power:5+(p.level-1)*2+gear.power,armor:gear.armor}; }

ENEMY_TYPES.warden.nameplateHeight=6;
