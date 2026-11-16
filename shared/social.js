// Original social vocabulary. Unlocks, reactions and reputation are authoritative.
export const EMOTES = Object.fromEntries([
  ['wave','Wave','☀','waves','at','Lift a hand to greet someone.'],
  ['bow','Bow','❧','bows','to','A small gesture of respect.'],
  ['nod','Nod','✓','nods','to','Acknowledge a friend or an idea.'],
  ['cheer','Cheer','✦','cheers','for','Celebrate someone’s achievement.'],
  ['laugh','Laugh','♫','laughs','with','Share a moment of laughter.'],
  ['sit','Sit','⌂','sits down','beside','Rest for a while. Moving or acting stands you up.'],
  ['point','Point','➜','points','toward','Draw attention to your selected character.'],
  ['taunt','Taunt','!','challenges','', 'A provocative gesture. Hostile creatures may attack.'],
  ['thank','Thank','♡','offers thanks','to','Offer gratitude to a friend or everyone nearby.'],
  ['shrug','Shrug','?','shrugs','at','Raise your shoulders when words fail you.'],
  ['applaud','Applaud','✧','applauds','for','Celebrate a performance or someone’s good work.'],
  ['yawn','Yawn','☾','yawns','beside','Stretch and let out a sleepy yawn.'],
  ['soothe','Soothe','❦','offers a calming gesture','to','Calm a selected uninjured thornbound prowler, or nearby ones, for 45 seconds. Earn lasting trust with the Rootbound.','A greeting is a beginning'],
  ['dance','Dance','♪','dances','with','Share the lantern-step, a dance learned through listening.','Listen before you speak'],
  ['salute','Salute','⚑','salutes','','Honor those who stood beside you.','Tomorrow has a road']
].map(([id,name,glyph,verb,preposition,description,unlock])=>[id,{id,name,glyph,verb,preposition,description,unlock,duration:id==='sit'?3600:id==='dance'?8:3}]));
// Creature vocabulary shares replication/presentation, but is not player training.
Object.assign(EMOTES,{
 sniff:{id:'sniff',name:'Sniff',glyph:'⋯',verb:'sniffs the air',preposition:'near',duration:3,ambientOnly:true},
 growl:{id:'growl',name:'Growl',glyph:'!',verb:'gives a warning growl',preposition:'toward',duration:3,ambientOnly:true}
});
export const PLAYER_EMOTES=Object.values(EMOTES).filter(e=>!e.ambientOnly);
export const STARTER_EMOTES=PLAYER_EMOTES.filter(e=>!e.unlock).map(e=>e.id);
export const SOCIAL_RANGE=35, EMOTE_TARGET_RANGE=15, EMOTE_NOTICE_RANGE=12;
export const FACTIONS={
 alderhaven:{name:'Alderhaven Neighbors',description:'The eight wards, public hearths and answerable offices of the human capital.'},
 hearthstead:{name:'Hearthstead Neighbors',description:'The keepers, travelers and trail tenders of the northern valley.'},
 rootbound:{name:'The Rootbound',description:'Woodland creatures defending damaged roots. Respect and a calming gesture can earn their trust.'},
 reedwatch:{name:'Reedwatch Survey',description:'Neighbors protecting the wetland water reserve and its paths.'},
 willowcross:{name:'Willowcross Compact',description:'Five peoples maintaining a common road.'},
 sylvren:{name:'Rootsong Delegation',description:'Keepers of living memory.'},
 cairnkin:{name:'Stonepromise Delegation',description:'Witnesses to promises and shared work.'},
 brinefolk:{name:'Tideglass Crews',description:'No journey ends until everyone returns.'},
 emberkin:{name:'Ashen Hearth',description:'Neighbors who rebuild after the fire.'}
};
export const REPUTATION_RANKS=[{name:'Wary',min:-600},{name:'Neutral',min:0},{name:'Acquainted',min:100},{name:'Friendly',min:300},{name:'Trusted',min:900},{name:'Honored',min:2400}];
export function reputationRank(value=0){const rank=[...REPUTATION_RANKS].reverse().find(r=>value>=r.min)||REPUTATION_RANKS[0],next=REPUTATION_RANKS[REPUTATION_RANKS.indexOf(rank)+1];return {...rank,next:next?.min??null,progress:next?Math.max(0,Math.min(1,(value-rank.min)/(next.min-rank.min))):1};}
export const knowsEmote=(p,id)=>Object.hasOwn(EMOTES,id)&&!EMOTES[id].ambientOnly&&(STARTER_EMOTES.includes(id)||p.emotes?.includes(id));
export const emoteAction=id=>`emote:${id}`;
export const actionEmote=id=>typeof id==='string'&&id.startsWith('emote:')&&Object.hasOwn(EMOTES,id.slice(6))?id.slice(6):null;
export function emoteSuggestions(p,text){if(!/^\/\w*$/.test(text))return [];const prefix=text.slice(1).toLowerCase();return Object.values(EMOTES).filter(e=>knowsEmote(p,e.id)&&e.id.startsWith(prefix));}
export function emoteText(name,id,target){const e=EMOTES[id];return e?`${name} ${e.verb}${target?` ${e.preposition?e.preposition+' ':''}${target}`:''}.`:'';}
export function parseEmoteCommand(text){if(typeof text!=='string')return null;const match=text.trim().match(/^\/([a-z]+)(?:\s+([^\x00-\x1f]{1,60}))?$/i);if(!match)return null;const name=match[2]?.trim();return {id:match[1].toLowerCase(),...(name?.toLowerCase()==='@nearby'?{audience:'nearby'}:name?.toLowerCase()==='@target'?{audience:'target'}:name?{name}:{})};}
export const npcFaction=n=>n.factionId||(['liri','dorr','nemi','ves'].includes(n.id)?({liri:'sylvren',dorr:'cairnkin',nemi:'brinefolk',ves:'emberkin'})[n.id]:n.z>45?'willowcross':'hearthstead');
export function normalizeSocial(saved={}){
 const emotes=[...new Set((Array.isArray(saved.emotes)?saved.emotes:[]).filter(id=>Object.hasOwn(EMOTES,id)&&!EMOTES[id].ambientOnly))];
 const reputation=Object.fromEntries(Object.entries(saved.reputation||{}).filter(([id,n])=>Object.hasOwn(FACTIONS,id)&&Number.isFinite(n)).map(([id,n])=>[id,Math.max(-600,Math.min(10000,Math.floor(n)))]));
 const socialClaims=[...new Set((Array.isArray(saved.socialClaims)?saved.socialClaims:[]).filter(v=>typeof v==='string'&&/^(gift:sera|respect:[a-z-]+|soothe:mob-\d+)$/.test(v)))].slice(0,400);
 // Completed quest rewards migrate without repeating quests or wiping saves.
 for(const [quest,id]of [['social_greeting','soothe'],['social_listen','dance'],['farewell','salute']])if(saved.quests?.[quest]?.status==='complete'&&!emotes.includes(id))emotes.push(id);
 return {emotes,reputation,socialClaims};
}

export const PEACE_FACTION='rootbound';

FACTIONS.rootbound.help='Friendly at 300: undisturbed prowlers leave you in peace. Hurting or taunting them breaks trust. Calming each different prowler earns trust once per character.';
