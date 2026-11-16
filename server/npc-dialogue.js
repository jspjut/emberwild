import {npcFaction,FACTIONS} from '../shared/social.js';
import {STORY_GREETINGS} from '../shared/story-content.js';
const hash=s=>[...s].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);
const reactions={
 wave:[['nod','Good to see you, {name}. What brings you along our road?'],['bow','Welcome, {name}. There is always room for another neighbor.']],
 bow:[['salute','Respect freely given is worth more than a title.'],['nod','A kind greeting, {name}. You are welcome here.']],
 nod:[['thank','Then we understand one another.'],['salute','I will remember that, {name}.']],
 cheer:[['applaud','That is the spirit! Save a little courage for the road ahead.'],['laugh','With a welcome like that, how could we lose heart?']],
 laugh:[['shrug','I was trying to look dignified. You have ruined it completely.'],['cheer','A little laughter keeps the long watch bearable.']],
 sit:[['yawn','Rest your feet. The road will still be there when you stand.'],['nod','Take your time, {name}. A quiet moment is useful too.']],
 point:[['nod','I see it. Keep to the marked paths if you are unsure of the way.'],['shrug','Another mystery? Ask me for directions if you need them.']],
 taunt:[['shrug','We can disagree without drawing weapons. You are safe here.'],['bow','An angry traveler is usually a tired one. Take a breath; we can talk.']],
 soothe:[['thank','Thank you. There are days when the quiet kindness matters most.'],['nod','Gentle hands can open a road that a weapon cannot.']],
 dance:[['applaud','Look at those steps! Did Lysa teach you the lantern-step?'],['cheer','A fine performance! Do another turn before you go.'],['dance','All right, one turn together. Then I really must get back to work.']],
 salute:[['bow','May your promises hold, and may your road bring you safely home.'],['nod','I will keep the hearth while you keep the road, {name}.']],
 thank:[['wave','You are welcome. Pass the kindness to the next traveler.'],['shrug','Neighbors help one another. No debt between us.']],
 shrug:[['point','A question without words? Try asking about work, the inn, or the road.'],['nod','Not every answer needs to come today.']],
 applaud:[['bow','Now you have made me blush. Thank you, {name}.'],['laugh','If you applaud my work, I may have to finish it!']],
 yawn:[['point','Sounds like someone needs an inn. Ask me where to find a bed.'],['laugh','Careful, yawns travel faster than gossip.']]
};
export function emoteReply(npc,p,id){if(npc.featured&&['wave','bow','salute','soothe'].includes(id))return {emote:id==='salute'?'salute':'bow',speech:({'alder-speaker':'Welcome, '+p.name+'. A question has as much right through this door as a petition.','alder-archivist':'An open hand. Good. We begin with the account, not the verdict.','alder-bellfounder':'A quiet hand before the strike. You have the beginning of the craft.','alder-lowdoor':'You greet us before counting us. There is a useful habit.','alder-relief':'Sera would recognize that greeting. There is a place to rest here.'})[npc.id]};const options=reactions[id]||reactions.wave,index=(hash(npc.id)+(npc.replySequence||0))%options.length;npc.replySequence=(npc.replySequence||0)+1;const [emote,text]=options[index];return {emote,speech:text.replaceAll('{name}',p.name)};}
export function spokenReply(npc,p,text){
 const words=text.toLowerCase(),services=npc.services||[];
 if(/\b(bye|goodbye|farewell)\b/.test(words))return {emote:'wave',speech:`Safe travels, ${p.name}. Come back with a story.`};
 if(/\b(thank|thanks)\b/.test(words))return emoteReply(npc,p,'thank');
 if(/\b(holdfast|witnesswork|compact|sanctuary|amendment|evacuation)\b/.test(words)){
  const ending=STORY_GREETINGS[npc.id];
  if(ending&&p.quests?.[ending.quest]?.status==='complete')return {emote:'nod',speech:ending.text};
  return {emote:'point',speech:npc.lore||'The old shelters repeat a guest-keeping order called Holdfast. Tamsin is comparing the keepers’ accounts in Willowcross. Look for open books on reading stands along the roads; their writers tell different parts of what happened.'};
 }
 if(/\b(inn|bed|rest|waypoint|return|home)\b/.test(words))return {emote:'point',speech:npc.id==='town-healer'?'This is the Crossroads Hearth. Speak to me and choose “Set my return waypoint at this inn.” Hearthward Return will bring you back, once every fifteen minutes.':'Merrin keeps the Crossroads Hearth on the west side of Willowcross. Ask to set your return waypoint there. Before you bind it, Hearthward Return takes you to First Light.'};
 if(/\b(bank)\b/.test(words))return {emote:'point',speech:'The Common Vault in Alderhaven’s Fourwinds Exchange is open. Speak to Maraen Ledger to store or withdraw items. The capital road leaves the Reach east of Wayfarer’s Watch.'};
 if(/\b(guild)\b/.test(words))return {emote:'shrug',speech:'Guilds are still to come. Travelers can already form parties and use /p.'};
 if(/\b(emote|gesture|dance|soothe|prowler)\b/.test(words))return {emote:'point',speech:'Open Skills → Emotes to see your gestures. Greet Sera early on to learn /soothe, then find Lysa at Lantern Rest for the lantern-step. Calm an uninjured prowler before it attacks.'};
 if(/\b(quest|work|help|job|trouble)\b/.test(words))return {emote:'point',speech:(npc.role==='quest'?'Speak to me with F to see the work I have available. ':'Look for neighbors with a gold ! above them. ')+(npc.z>60?'Tamsin at Willowcross sends travelers along the six camp roads.':'Elowen begins the welcome at Hearthstead. The western trail leads to Rowan, and the eastern path to Briar and Lysa.')};
 if(/\b(people|race|tradition|story|lore|yourself)\b/.test(words))return {emote:'nod',speech:npc.lore||FACTIONS[npcFaction(npc)]?.description||'I keep this corner of the Reach in good order. A place is made by the people who return to it.'};
 if(/\b(capital|alderhaven|road|way|direction|where)\b/.test(words))return {emote:'point',speech:'Follow the signs to Willowcross, then east toward Wayfarer’s Watch for the Alderhaven Road. The capital is open along that road. The Common Vault, three return hearths and eight city wards welcome visitors. Hover over each arrow board on a road sign to read its destination.'};
 if(/\b(hello|hi|hey|greetings|hail|morning|evening)\b/.test(words))return {emote:'wave',speech:`Hello, ${p.name}. ${services.includes('trainer')?'Here for training? Speak to me about your next lesson.':npc.role==='merchant'?'Need supplies? Speak to me to browse the goods.':services.includes('waypoint')?'There is a warm bed and a return waypoint here if you need them.':services.includes('inn')?'Rest here if you need to recover. Merrin can bind your return at the Willowcross inn.':'Ask me about work, our people, the inn, or the roads.'}`};
 return {emote:'nod',speech:`I hear you, ${p.name}. ${npc.lore||'I can help with directions, local work, the inn, or the gestures our neighbors teach.'}`};
}

import {ITEMS,canAddItem} from '../shared/content.js';
export function npcReaction(social,p,npc,id,speech) {
 const w=social.world;
  if(id==='taunt')speech='We can disagree without drawing weapons. You are safe here.';
  else if(npc.id==='sera'&&id==='wave'){
   speech='Welcome, neighbor. A greeting goes further than a blade. Try /bow with Lysa at Lantern Rest.';
   if(!p.socialClaims.includes('gift:sera')){if(canAddItem(p,'potion')){social.claim(p,'gift:sera');p.inventory.potion=(p.inventory.potion||0)+1;w.notify(p,`Sera gives you ${ITEMS.potion.name}. A welcome gift, once per character.`,'good');}else w.notify(p,'Sera has a welcome gift for you. Make room and wave again.');}
  }else if(npc.id==='rowan'&&id==='point')speech='Follow the creek north. Blackened root traces lead toward the fallen roadstone.';
  else if(npc.id==='lysa')speech=id==='bow'?'Listening is a kind of courage. Take the lantern-step home, and calm the Rootbound with /soothe.':id==='dance'?'There it is! A dance is best when someone else joins in.':'An uninjured prowler may listen to /soothe. Several new encounters build lasting trust; repeating one does not.';
 return speech;
}
