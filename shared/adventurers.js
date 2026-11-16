import {RECALL_SKILL} from './travel.js';
// Extensible class and cultural training registries, independent of content.
export const CLASSES={
  dawnwarden:{id:'dawnwarden',name:'Dawnwarden',armor:'plate',resource:'Resolve',color:'#d8b76c',role:'Melee fighter',description:'Commit to close combat with heavy blade strikes, sweeping attacks and personal defenses.',skills:['strike','lance','mend','nova','aegis','verdict'],autoRange:3.6,health:120,healthPerLevel:28,starterWeapon:'training_blade',starterArmor:'linen_coat'},
  arcanist:{id:'arcanist',name:'Arcanist',armor:'cloth',resource:'Mana',color:'#aa9bdf',role:'Damage spellcaster',description:'Control distance with frost, survive behind a personal barrier and unleash cinders and arcane cascades.',skills:['cinderbolt','frostneedle','sigil','starfall','prismward','arcchain'],autoRange:18,health:105,healthPerLevel:25,starterWeapon:'training_staff',starterArmor:'apprentice_robe'},
  pathfinder:{id:'pathfinder',name:'Pathfinder',projectile:'arrow',armor:'leather',resource:'Focus',color:'#a3be78',role:'Bow ranger',description:'Hunt at bow range with aimed shots, quick arrows and snares; bandage only your own wounds.',skills:['piercing','quickshot','dressing','volley','snare','predator'],autoRange:22,health:115,healthPerLevel:26,starterWeapon:'training_bow',starterArmor:'trailhide_jerkin'},
  stormcaller:{id:'stormcaller',name:'Stormcaller',armor:'mail',resource:'Tide',color:'#7bbac6',role:'Healer',description:'Restore allies with rain, shelter a companion and mend your party; lightning keeps solo adventures practical.',skills:['lightning','stoneshock','rainmend','thunder','stoneguard','stormchain'],autoRange:17,health:115,healthPerLevel:27,starterWeapon:'training_mace',starterArmor:'riveted_tunic'}
};
export const RACES={
  human:{id:'human',name:'Human',classes:['dawnwarden','arcanist','pathfinder','stormcaller'],description:'Hearthstead and Willowcross welcome travelers and teach every founding discipline.',tradition:'The crossroads brings all four schools together.'},
  sylvren:{id:'sylvren',name:'Sylvren',classes:['arcanist','pathfinder','stormcaller'],description:'Bark-skinned keepers of living groves. They cultivate memory through roots, seeds and careful listening.',tradition:'The local grove teaches spellcraft, trailcraft and weather-singing; plate training has not reached this outpost.'},
  cairnkin:{id:'cairnkin',name:'Cairnkin',classes:['dawnwarden','arcanist','stormcaller'],description:'Stonefolk who remember promises through carved marks, resonant crystals and shared craft.',tradition:'Stoneguard, rune study and storm-forging are taught at the quarry. The local lodge has no Pathfinder tutor yet.'},
  brinefolk:{id:'brinefolk',name:'Brinefolk',classes:['arcanist','pathfinder','stormcaller'],description:'Fin-eared coastal folk whose tide records guide rescue crews, traders and river pilots.',tradition:'Tide magic and shore scouting flourish here. Dawnwarden plate instruction is not available in this delegation.'},
  emberkin:{id:'emberkin',name:'Emberkin',classes:['dawnwarden','arcanist','pathfinder'],description:'Ash-touched hearthkeepers who rebuild after disaster and carry family histories in kiln-fired tokens.',tradition:'Their expedition teaches wardens, fire scholars and scouts; no Stormcaller mentor accompanied it.'}
};
export const classDefinition=id=>CLASSES[id]||CLASSES.dawnwarden;
export const raceDefinition=id=>RACES[id]||RACES.human;
export const validRaceClass=(race,classId)=>!!RACES[race]&&!!CLASSES[classId]&&RACES[race].classes.includes(classId);
export function normalizeIdentity(value={}){const raceId=RACES[value.raceId]?value.raceId:'human',classId=validRaceClass(raceId,value.classId)?value.classId:RACES[raceId].classes[0];return {raceId,classId};}
export const classSkills=p=>classDefinition(p?.classId).skills;
export const skillForRole=(p,role)=>classSkills(p)[{primary:0,ranged:1,followup:1,heal:2,sustain:2,area:3,utility:4,advanced:5}[role]];
export const armorAllowed=(classId,type)=>!type||({cloth:['cloth'],leather:['cloth','leather'],mail:['cloth','leather','mail'],plate:['cloth','leather','mail','plate']})[classDefinition(classId).armor].includes(type);

const spell=(name,key,level,cost,cooldown,range,description,extra={})=>({name,key:String(key),level,cost,cooldown,range,description,...extra});
export const CLASS_SKILLS={
  strike:spell('Sunstrike',1,1,14,4,3.6,'Strike with your blade for 20 + attack power damage. Melee range.',{damage:20,classId:'dawnwarden',iconId:'strike'}),
  lance:spell('Sundering Slash',2,1,20,7,3.6,'Brace for 1.5 seconds, then deliver a heavy blade strike for 32 + attack power damage. Requires melee range; moving interrupts.',{castTime:1.5,damage:32,classId:'dawnwarden',iconId:'strike'}),
  mend:spell('Second Wind',3,2,25,22,0,'Take 1.8 seconds to recover 55 + 5 health per level. Self only; a personal recovery, not an ally heal.',{castTime:1.8,heal:55,selfOnly:true,classId:'dawnwarden',iconId:'mend'}),
  nova:spell('Sweeping Blade',4,4,28,10,6,'Sweep every enemy within 6 paces for 35 + attack power damage.',{damage:35,area:true,classId:'dawnwarden',iconId:'strike'}),
  aegis:spell('Dawn Aegis',7,7,22,18,0,'Brace behind a personal ward, absorbing 90 + 5 damage per level for 8 seconds.',{shield:90,classId:'dawnwarden',iconId:'ward'}),
  verdict:spell('Radiant Verdict',8,9,30,12,3.6,'Finish a melee exchange with a decisive strike for 65 + attack power damage.',{damage:65,classId:'dawnwarden',iconId:'strike'}),
  cinderbolt:spell('Cinderbolt',1,1,16,2,23,'Cast for 1.4 seconds to deal 24 + attack power damage at spell range. Moving interrupts.',{damage:24,castTime:1.4,classId:'arcanist',iconId:'lance'}),
  frostneedle:spell('Frost Needle',2,1,18,6,22,'Deal 14 + attack power damage instantly and slow the enemy by 45% for 3 seconds.',{damage:14,slow:.45,classId:'arcanist',iconId:'frost'}),
  sigil:spell('Prismatic Barrier',3,2,24,18,0,'Inscribe a personal barrier over 1.8 seconds, absorbing 55 + 5 damage per level for 8 seconds. Does not heal.',{shield:55,castTime:1.8,classId:'arcanist',iconId:'prism'}),
  starfall:spell('Starfall',4,4,30,12,22,'Cast for 1.5 seconds to deal 40 + attack power damage to your target and enemies within 6 paces of it.',{damage:40,area:true,targetArea:true,radius:6,castTime:1.5,classId:'arcanist',iconId:'starfall'}),
  prismward:spell('Frost Ring',7,7,22,16,6,'Deal 12 + attack power damage to nearby enemies and slow them by 75% for 3 seconds. Create space to cast.',{damage:12,area:true,slow:.75,classId:'arcanist',iconId:'frost'}),
  arcchain:spell('Arc Cascade',8,9,32,12,23,'Cast for 1.6 seconds to deal 55 + attack power damage to up to three nearby enemies.',{damage:55,chain:3,castTime:1.6,classId:'arcanist',iconId:'arc-chain'}),
  piercing:spell('Piercing Shot',1,1,15,2,25,'Draw for 1.1 seconds and loose an arrow for 21 + attack power damage. Moving interrupts the aimed shot.',{damage:21,castTime:1.1,classId:'pathfinder',iconId:'bow-shot'}),
  quickshot:spell('Quickshot',2,1,18,5,24,'Loose an instant arrow for 16 + attack power damage, including while moving.',{damage:16,classId:'pathfinder',iconId:'quickshot'}),
  dressing:spell('Field Dressing',3,2,22,22,0,'Stand still for 2 seconds to bandage yourself for 52 + 5 health per level. Self only.',{heal:52,selfOnly:true,castTime:2,classId:'pathfinder',iconId:'bandage'}),
  volley:spell('Volley',4,4,30,12,24,'Aim for 1.2 seconds and rain arrows for 32 + attack power damage around your selected enemy.',{damage:32,area:true,targetArea:true,radius:6,castTime:1.2,classId:'pathfinder',iconId:'volley'}),
  snare:spell('Bramble Snare',7,7,18,16,24,'A barbed arrow deals 8 + attack power damage and slows an enemy by 75% for 3 seconds.',{damage:8,slow:.75,classId:'pathfinder',iconId:'snare'}),
  predator:spell('Predator Arrow',8,9,30,12,26,'Take careful aim for 1.7 seconds to deal 62 + attack power damage.',{damage:62,castTime:1.7,classId:'pathfinder',iconId:'predator'}),
  lightning:spell('Lightning Bolt',1,1,16,2,22,'Cast for 1.3 seconds to deal 18 + attack power damage. Your reliable solo leveling attack.',{damage:18,castTime:1.3,classId:'stormcaller',iconId:'lightning'}),
  stoneshock:spell('Storm Spark',2,1,16,6,22,'Deal 16 + attack power damage with an instant spark, including while moving.',{damage:16,classId:'stormcaller',iconId:'lightning'}),
  rainmend:spell('Healing Rain',3,2,25,3.5,24,'Cast for 1.8 seconds to heal a living friendly target for 55 + 5 health per level. With an enemy or no target selected, heals yourself.',{heal:55,castTime:1.8,classId:'stormcaller',iconId:'rain'}),
  thunder:spell('Mending Tide',4,4,32,12,12,'Instantly heal yourself and living party members within 12 paces and line of sight for 38 + 5 health per level. Does not heal strangers or NPCs.',{heal:38,partyHeal:true,classId:'stormcaller',iconId:'rain'}),
  stoneguard:spell('Rain Shelter',7,7,24,14,24,'Shield a living player for 75 + 5 damage per level for 8 seconds. With an enemy or no target selected, shields yourself.',{shield:75,friendlyTarget:true,classId:'stormcaller',iconId:'stoneguard'}),
  stormchain:spell('Life Surge',8,9,32,18,24,'Instantly restore 105 + 5 health per level to one living friendly target. With an enemy or no target selected, heals yourself.',{heal:105,classId:'stormcaller',iconId:'rain'})
};
CLASS_SKILLS.recall=RECALL_SKILL;
export const learnedSkill=(p,id)=>id==='recall'?true:!!CLASS_SKILLS[id]&&classSkills(p).includes(id)&&p.level>=CLASS_SKILLS[id].level;
