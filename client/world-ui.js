export const UI_CONFIG={zoneLabels:{cinderwood:'The Cinderwood Reach',alderhaven:'Alderhaven'},tagline:'A WORLD AT FIRST LIGHT',region:'The Cinderwood Reach',home:'Hearthstead',peopleLabel:'People of the Reach',entryLabel:'the Reach',welcome:'Welcome to the Reach.',lobbyFocus:[-1,1.6,23],questRing:{x:0,z:32+(20-32)*Math.SQRT2}};
export const showQuestRing=p=>p?.quests?.farewell?.status!=='complete';
export const trackerEmpty=p=>({title:p.quests?.five_roads?.status==='complete'?'The Reach opens before you.':p.quests?.farewell?.status==='complete'?'A wider road awaits.':'The Reach has stories.',text:p.quests?.five_roads?.status==='complete'?'The delegations welcome you. Finish local tasks and explore the Reach.':p.quests?.town_arrival?.status==='complete'?'Meet the delegation speakers and class mentors in Willowcross.':p.quests?.farewell?.status==='complete'?'Tavi has news of Willowcross. Follow the southern road to meet its people.':'Look for gold ! markers above people and on your map. Elowen stands ahead of the hearth.'});
export const npcGreeting=(p,npc)=>p.quests?.heart?.status==='complete'?'The Reach is brighter for your courage, traveler.':'A good day to you, traveler. What brings you here?';
export const raceTraits={
 human:'Human features, with varied skin tones, hairstyles and builds.',
 sylvren:'Leaflike ears, budding branches and bark-toned skin.',
 cairnkin:'Stone-toned skin, ridged brows and small crown crystals.',
 brinefolk:'Fin-shaped ears, gill markings and a swept-back crest.',
 emberkin:'Curved horns, ash-toned skin and bright cheek markings.'
};
export const classStories={
 dawnwarden:{fantasy:'Stand where the danger is. Dawnwardens master the blade and the discipline to hold their ground.',playstyle:'A melee fighter: stay close for Sunstrike and Sundering Slash, sweep packs with your blade and brace with Dawn Aegis. Second Wind restores only your own health.',weapon:'Blade'},
 arcanist:{fantasy:'Study the hidden patterns of cinders, frost and starlight, then turn them into overwhelming spellcraft.',playstyle:'A damage caster: cast Cinderbolt and Starfall from range, slow enemies with frost and set up a personal barrier. Arc Cascade strikes clustered foes. You have no healing spells.',weapon:'Staff'},
 pathfinder:{fantasy:'Read the ground, pick your range and trust a well-placed arrow. Trailcraft wins a fight before an enemy closes.',playstyle:'A bow ranger: combine aimed Piercing Shots with mobile Quickshots, slow pursuers with Bramble Snare and finish with Predator Arrow. Field Dressing bandages only yourself.',weapon:'Bow'},
 stormcaller:{fantasy:'Bring the rain that lets companions stand again. A weather-singer protects life while carrying enough lightning to walk the road alone.',playstyle:'A healer: use Healing Rain and Life Surge on allies, Mending Tide on your nearby party and Rain Shelter on a player. Lightning Bolt and Storm Spark support solo leveling.',weapon:'Mace and rain magic'}
};
