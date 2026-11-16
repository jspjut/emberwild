import {introPoint,QUIET_POOL_SHORE} from './zone-layout.js';
import {OUTPOSTS} from './world-layouts.js';
// Public, in-world testimony only. Author truths and future plans stay in game-data/story/.
const field=(id,title,author,place,pages,extra={})=>({id:`reading-${id}`,storyId:id,title,author,...place,pages,...extra});
const hub=id=>{const o=OUTPOSTS.find(o=>o.id===id);return {x:o.x-3,z:o.z-9};};
export const READABLES=[
 field('camp-ledger','Tavi’s small account book','Tavi Reed',introPoint(16,31),[
  {heading:'Enough for the next arrival',text:'Six seed pouches missing. Three crates late. Sera asks whether I have counted the people waiting for them. I had not.\n\nIn my first season a Sunsteppe carrier canceled a debt I could not pay. No explanation, just a line through the number. I have kept the page. I still do not know the carrier’s name.'},
  {heading:'A note in the margin',text:'For the next caravan: dry matches for Rowan, clean wraps for Sera, and one sack left unpromised. A full ledger is no use if there is nothing for the person who arrives after it closes.'}
 ]),
 field('hearth-note','A hearth is an invitation','Sera, with a later note by Merrin',introPoint(-16,28),[
  {heading:'Open hand',text:'My sister taught us to lift an empty hand before approaching someone frightened. It meant: I have come to help; I will wait for you to see me. She used it on the evacuation road. It belongs to anyone who has need of it.\n\nShe stayed in Alderhaven when I came north. One day I should ask what became of the relief house.'},
  {heading:'A different sort of return',text:'Merrin’s note: a return hearth is a bond a traveler chooses. It calls one person to a place they have named. It does not write them into a shelter’s guest tally, and it gives no keeper the right to stop them leaving. Ask at the Crossroads Hearth if you wish to make that choice.'}
 ]),
 field('pool-observation','What the frogs tell us','Rowan Fen',{x:QUIET_POOL_SHORE.x+2,z:QUIET_POOL_SHORE.z+2},[
  {heading:'A place outside the trouble',text:'Frogs on the eastern bank. Clear water under the reeds. No witness tile in the spring bed and no lantern conduit along this bank.\n\nThe black traces bend toward the sanctuary; they do not spread evenly through the woods. If the pool stays alive while the lamps fail, we should investigate the lamps before declaring the entire forest lost.\n\nI have never followed this spring to its source. The old upland map ends at the first ridge.'}
 ]),
 field('courier','Renn Tal’s recovered journal','Renn Tal; Rowan’s field copy',introPoint(-46,-7),[
  {heading:'Nine days before your arrival',text:'The lamps flickered before anything moved under the road. I am certain of that order. A gate voice said KEEP ALL GUESTS, though there was no one at the gate.\n\nI took the low path. Lost my journal at the fallen roadstone and kept the carbon copy inside my coat. If a keeper finds this: I went south, alive. Please do not carve my name into a memorial.'},
  {heading:'Rowan’s attached message',text:'Renn reached Willowcross. Merrin treated her ankle and found her passage toward the coast. The journal does not tell us where she went after that, or who was meant to receive her unaddressed copy.\n\nA record stops where its writer stops writing. That is not the same as a life ending.'}
 ]),
 field('lysa-lesson','A listener’s practice','Lysa Rootsong',introPoint(69,-10),[
  {heading:'Room for refusal',text:'Bow to make room for another voice. Soothe to offer a quiet moment. Neither gesture gives you ownership of an answer. A frightened creature may accept peace; a wounded one may have no room for it.\n\nMira asks why our memory schools require a lineage before a student may ask to learn. I have no answer I would want to teach. Perhaps our next school should begin with a place for the person whose name we do not know.'}
 ]),
 field('sanctuary-names','Three names beneath the ash','Ilan Wren’s rubbings',introPoint(-7,-23),[
  {heading:'Anja Wren · Beren Ash · Omi Salt',text:'Anja opened the side passage. Beren held the lantern above it. Omi counted the people who came through, and refused to stop counting those still outside.\n\nThe later inscription says: THEIR WATCH SHALL NOT END. Beneath the soot an older hand has written: Let the last one leave. Then come home.'},
  {heading:'Ilan’s questions',text:'Anja was my aunt. Elowen remembers voting to seal this place after the fire, when nobody could promise that taking the order apart would not close the other shelters. I can understand that fear. I still want the full account.\n\nAlderhaven sheltered some of the people Anja brought out. One rubbing includes a kilnworkers’ refrain I have heard nowhere else: Leave a light for the last shift.'}
 ]),
 field('inn-book','The Crossroads Hearth guest book','Guests, with permission to copy',{x:-43,z:128},[
  {heading:'People passing through',text:'Renn Tal: ankle improving; coastal passage arranged. Tell Rowan his road is still worth walking.\n\nRilla: if the bridge in the old road song was never built, why do three towns sing the same crossing toll?\n\nMoss Tidebell: Nemi’s older charts use my teacher’s island marks. The new copies have lost one.\n\nTeren Cross: looking for a clockmaker who stopped the capital clock at dawn and never sent a bill.'},
  {heading:'Merrin’s rule',text:'Only write what a guest agrees to leave here. An empty line is not a missing person.\n\nVisitors ask whether a city may have more than one return hearth. Of course. The harder question is who keeps them lit, and who is allowed through their doors.'}
 ]),
 field('dispatch','Invoice for replacement witness tiles','Joss Fourwinds; sealed Alderhaven dispatch',{x:33,z:157},[
  {heading:'Batch seven · delivered eighteen days ago',text:'Six station replacements. Archive pattern: HOLDFAST / temporary evacuation. Seal: Retention Office, Alderhaven.\n\nJoss’s note: I signed for sealed parts and sound crates. That signature is mine. The wagon driver did not choose the pattern. The Retention Office was renamed years ago; I cannot tell you why its old seal is on a new delivery.'},
  {heading:'Not a verdict',text:'A copied clause can be a mistake, a convenience, or a choice. The invoice proves a route and a date. It does not prove why the capital sent it. Keep the paper intact until someone can ask the clerks who made the copy.'}
 ]),
 field('charter','The Open Hand Compact','Public copy, maintained at Willowcross',{x:13,z:108},[
  {heading:'A road belongs to its travelers',text:'Let there be a fire held in common, a path maintained in turn, and a place for the stranger who has not yet learned our names.\n\nA guest may depart without penalty. A keeper shall not turn an absence into a debt.\n\nWater annex: provisional pending the testimony of downstream residents. The space for that testimony remains blank.'},
  {heading:'Later annotations',text:'One city gate is absent from the attached refuge plan. Someone has written “already lived in” beside the blank.\n\nA mentor’s later question: when a lawful keeper gives an unlawful shelter order, who must refuse it? No answer has been entered here. There is room beneath the question.'}
 ]),
 field('gate-ledger','Arrivals and departures','Mara Waycross and Edda Wayfarer',hub('human'),[
  {heading:'Two equal columns',text:'Mara: every arrival once had a matching departure space. The new tile copied arrival names into a list labeled KEEP. It copied none of the departures. The Lockwarden is obeying that list.\n\nEdda: I remember Senn leaving by choice. Write that down before you call another rescue. A person may leave us and still be safe.'}
 ]),
 field('tide-notes','A rescue is not a prison','Nemi Tideglass',hub('brinefolk'),[
  {heading:'Senn’s token',text:'Rescue token recovered. Reverse knot: passenger released at their own request. We have a sign for that, distinct from a death mark and from a missing crew member. I should have read both sides.\n\nWarm witness stone drew the glassclaws into the grotto. Clear the blocked passage and we can cool the relay without stripping every nest from the shore.'},
  {heading:'Older chart',text:'An island appears on the old chart and not the replacement. I have marked the discrepancy, not drawn a monster in the empty water.\n\nA crew off the eastern headland reports a rescue bell from a place their chart calls deserted. They did not find the caller. It is a report, not an explanation.'}
 ]),
 field('root-transcript','The memory that stops at “let”','Liri Rootsong; transcription, not the seed itself',hub('sylvren'),[
  {heading:'A fragment with limits',text:'Boots in mud. A child’s small hand. Lantern heat. “Please let—”\n\nThen the seed returns to boots in mud. The defense pattern repeats the waiting and never reaches the leaving. Preserving that repetition does not honor the child.\n\nSomeone requested a separate seed before the new tiles came. The request bears a school mark I cannot place. Mira says we should find the requester before deciding they meant harm.'}
 ]),
 field('stone-rubbing','An oath with a broken interval','Dorr Stonepromise and Bren Oathstone',hub('cairnkin'),[
  {heading:'Until is not forever',text:'HOLD UNTIL [fracture]. The master interval after UNTIL is missing. The vault has kept the first beat and lost the release. Shardbacks hear it through the stone.\n\nWe can date a correction beside the break without pretending the old words were never carved. Bren will witness the new interval.'},
  {heading:'Witness marks',text:'The master bell was calibrated at a Frostfell foundry. One signatory’s mark has been struck through; the date was carefully left visible.\n\nBren’s application to learn correction-carving came back unsigned. There is no explanation. We will ask before calling it a refusal.'}
 ]),
 field('kiln-token','The shift nobody ended','Iri Ashkindle; family token and Ves’s transcription',hub('emberkin'),[
  {heading:'Leave a light',text:'Grandmother’s token: keep the low door open. Leave a light for the last shift. The fire is coming from—\n\nThe edge broke before the sentence ended. Ves remembers a successful evacuation. This token remembers work still being done. Both belong on the table. The Last Kilnkeeper carries a routine, not my grandmother’s living mind.'},
  {heading:'Unpaid questions',text:'There are more shift marks than workers’ names. Who did the uncredited work?\n\nThe fuel invoice names a southern destination that never signed for it. A cool-fired repair token survives, though our kiln has no record of teaching that craft.\n\nAnnet Vey authorized Holdfast. Her public plaque credits the evacuation; a family letter was said to correct that account. We do not have the letter.'}
 ]),
 field('water-survey','Water below the line','Pella Reedwake and Hollis Reed',hub('reedwatch'),[
  {heading:'A missing witness field',text:'The reserve order counts shelter guests but has no field for anyone downstream. The keeper holds more water each time the missing guest total increases.\n\nWe must isolate that instruction, not drain the marsh. Stalkers are following the banks they used before the water moved. Their route is older than our survey.'},
  {heading:'Beyond the approved map',text:'Hollis traced a side channel past an old household marker. No capital chart names the household. That does not make their home empty.\n\nThe Compact’s provisional water annex never received their testimony. We will leave a space for their own words rather than write consent on their behalf.'}
 ]),
 field('orchard-notes','Seeds for another season','Ada Southfield',{x:-33,z:248},[
  {heading:'What a repaired road must carry',text:'Fruit for the market. Seed for the next planting. Clean water through the dry weeks. That is what an open road is for, when the speeches are over.\n\nOne cutting from the northern groves flowers after a frost. Liri asked me to keep the dates, not call it a miracle.\n\nTake the harvest report back to Tamsin. A charter meeting should know whether the people it speaks for will eat.'}
 ]),
 field('release-amendment','The Reach release amendment','Recorded by Tamsin Cross',{x:17,z:109},[
  {heading:'Your testimony entered',text:'Six reports received. The northern draw broken. Local keepers authorized to isolate the Holdfast links while maintaining shelter fires and the monitored water release. The orchard report entered alongside them.\n\nA guest may leave. An absence is not a crime. A name is not a debt. The water below the road must have witnesses too.\n\nYou arrived without a place in our book. Today you helped us change what the book is for.'},
  {heading:'An enclosed copy for the road ahead',text:'The batch-seven invoice is preserved for a voluntary inquiry in Alderhaven. No traveler is ordered to follow it.\n\nBehind the old charter we found an earlier correction stamped RECEIVED, with no onward copy recorded. Someone tried to mend this before us. Our work here stands; theirs deserves a hearing elsewhere.'}
 ],{requiresQuest:'five_roads'})
];
export const readableAvailable=(p,r)=>!!p&&!!r&&(!r.requiresQuest||p.quests?.[r.requiresQuest]?.status==='complete');
// Existing quest pickups reveal their actual text after the one-second examination.
export const GATHER_READINGS={ledger:'courier',page0:'sanctuary-names',page1:'sanctuary-names',page2:'sanctuary-names'};
export function readingEvent(p,r){return {type:'reading',to:p.id,id:r.id,title:r.title,author:r.author,pages:r.pages};}
