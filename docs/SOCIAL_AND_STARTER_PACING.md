# Social play and the first roads

Implemented 4 November 2026. The later [starter region refinement](STARTER_REGION_REFINEMENT.md) supersedes the compact coordinates, town routing totals and level-11 campaign totals below, while retaining these social rules. This is a playable first pass at social progression, with original gestures, dialogue and faction names. All classes can complete the introduction alone; another player is an opportunity for expression rather than a requirement to progress.

## Emotes

Characters begin with **wave, bow, nod, cheer, laugh, sit, point, taunt, thank, shrug, applaud and yawn**. Quest rewards teach **soothe, dance and salute**. Press `/` from the world to open chat with the slash already entered, or use Enter and type a command. Autocomplete includes only learned gestures. Up/down selects, Tab or clicking completes, Enter performs, and Escape cancels. `/wave Full Name` addresses a player or NPC by name; otherwise a suitable selected character is the recipient. Missing, dead, self, obstructed and distant selections fall back to a public gesture. `/wave @nearby` explicitly addresses the area while preserving selection; `/wave @target` requires a valid selected recipient and reports an error if none is suitable. Named recipients also remain strict. The Emotes book has a persistent audience choice shared by book clicks, action slots and slash commands. The compact Audience dropdown stays visible above the ability grid. `/`, `/help` and `/emotes` open the emote book.

The chat header has a permanent **Emotes** button. All spellbook tabs use a fixed two-column, four-row page, with Previous/Next controls, mouse-wheel paging and Page Up/Page Down navigation. Search filters names, slash commands and descriptions in the current tab. Locked abilities are hidden by default; **Show unlearned** reveals future class skills and quest emotes and remembers that preference. Unlocked entries omit redundant Learned labels. Empty slots keep page dimensions steady, including an empty search result. Escape clears a focused search first and closes the book when the search is already empty. **P → Emotes** shows learned gestures and future quest rewards with their unlock names. Click to perform, Shift-click to fill an empty action slot, or drag onto a chosen slot. Action-slot keys and their optional second bindings are configured in Game menu → Keybindings. The action layout is retained per character in this browser. Bare `/` is reserved for opening emote chat; modified slash shortcuts remain bindable.

The server checks ownership, living status, a 1.2-second gesture interval, combat/casting, recipient range (15 paces) and line of sight. It broadcasts social text and reaction events only within 35 paces; snapshots also omit distant gesture state. Unlocks, faction reputation and one-time social claims live in the character save. Temporary gestures and creature peace do not survive reconnects.

Gestures have local continuous poses driven by replicated start/end timestamps. Humanoids also have thanks, shrugging, applause and yawning poses. Creature-only sniff/growl vocabulary shares replication and animation but cannot be learned or performed by players. Handheld equipment is temporarily concealed during gestures. Moving, jumping, casting, attacking or taking damage interrupts them. Reaction symbols are projected from the rendered character every frame; they fade after three seconds and respect building occlusion. Creature responses use small head/body movements and the same reaction symbols and local text. Friendly NPCs face visitors, reply after a short delay, then return to their authored heading.

## Encounters and reputation

**C → Reputation** lists only discovered groups. Talking, completing work or directing a gesture at an NPC discovers that NPC's group. Current groups are Hearthstead Neighbors, the Rootbound, Willowcross Compact, Rootsong Delegation, Stonepromise Delegation, Tideglass Crews and Ashen Hearth.

| Standing | Minimum reputation |
| --- | ---: |
| Wary | -600 |
| Neutral | 0 |
| Acquainted | 100 |
| Friendly | 300 |
| Trusted | 900 |
| Honored | 2,400 |

Completed quests usually grant 35 reputation; the peace introduction grants 100 Rootbound reputation. A new respectful NPC greeting grants 15 once per character per NPC. Repeating emotes does not repeat that gain. Sera's wave welcome grants one tonic once per character, only when it fits in the player's bags; otherwise the gift can be collected by returning with space. Rowan's response to pointing gives a trail hint. Lysa explains peaceful encounters and joins the dance. Friendly NPCs never enter combat in response to provocation.

An undisturbed, uninjured thornbound prowler responds to `/soothe` (including `/soothe @nearby`) with **45 seconds of peace toward that character**. Calming a different prowler grants 50 Rootbound reputation once per character for that encounter. Creature respawning and relogging do not reset these reputation claims. This cannot interrupt another player's fight or heal an injured creature. At Friendly standing, undisturbed prowlers stop acquiring that character as an aggression target. Other players keep their own relationships.

Taunting an enemy can provoke it. Taunting a Rootbound creature removes personal peace, reduces reputation by 75 and makes that creature hostile. Hurting a peaceful or personally friendly creature removes peace and costs 100 reputation. The creature can defend itself. Friendly NPCs answer provocation with restraint and cannot be made to attack players. These rules are visible in the emote book, quest text and Rootbound reputation entry.

## Nearby awareness and spontaneous gestures

Public gestures are visible within 35 paces. NPCs, creatures and players within **12 paces and line of sight** are recorded as having noticed; up to five NPCs/creatures respond, prioritizing relevant quest recipients and then proximity. Player characters remain under their owners’ control. Nearby responses can complete matching social objectives, grant the existing once-only greeting gift or trust, and soothe eligible creatures personally. Other players’ fights cannot be interrupted. Friendly NPCs remain harmless, including when publicly taunted.

The server performs an ambient perception pass once per second. NPCs can greet arrivals, have reciprocal nod/laugh/shrug exchanges with another nearby NPC, yawn, shrug or briefly sit while resting. They can applaud healing, thank their healer, cheer a level gained nearby or celebrate a witnessed victory. Unengaged creatures sniff at neutral/friendly travelers or warn with a growl. These are cosmetic observations: they do not acquire combat targets, cancel casts, pacify creatures, complete quests, discover factions, award reputation or produce loot.

Ambient initiations are limited to one every three seconds across the zone, with a 24–36 second per-actor interval. A conversation gets one delayed reply, with no recursive reply chain. Arrival greetings require leaving the area and a 90-second encounter cooldown before repeating. Conversations have a 60-second pair cooldown. Explicit player gestures take priority over pending ambient exchanges. Only areas with eligible nearby players produce ambience; inactive zones stay quiet. Ambient chat is visually muted. The usual event locality, character animations, projected symbols and line-of-sight checks apply.

## Starter route

The first quest remains Elowen's introduction to Sera. After it, the first batch is **meadow trouble + herbs**. The meadow's six kills and quest reward bring a new character to level 2, where Elowen offers **A greeting is a beginning**. Use `/wave @nearby` near Sera, or select her and `/wave`; turning it in rewards `/soothe`.

The western route now progresses **seed recovery → supplies → survey / Rowan breadcrumb → traces / quiet pool → ledger**. The class thread opens after the greeting. Elowen's eastern breadcrumb requires the ledger and greeting rather than opening alongside the initial errands. Local hubs generally introduce one to three tasks at a time; optional class work can overlap. Existing accepted quests remain accepted when their new prerequisites differ.

Briar's eastern grove introduces **A lantern beyond the grove**, a breadcrumb to the new **Lantern Rest** clearing east of the original play space. The later narrative pass gates this new offer on completing **Amber under the bark**, so the clean-amber report exists before Lysa receives it. Lysa teaches respect in **Listen before you speak** (`/bow`, reward `/dance`), then offers **Room for another path** (`/soothe` an undisturbed prowler). The northern sanctuary breadcrumb follows the grove work and peaceful encounter. Finishing the northern campaign rewards `/salute` through **Tomorrow has a road**.

Hearthstead's service NPCs stand farther apart at distinct work areas; Rowan and Briar have more breathing room along their respective trails. Willowcross's four mentors now occupy separate training spots instead of a close row. NPC home headings face the hearth, road, entrance or training area. The Lantern Rest branch includes a bench, lantern, listening stone, three woodland creatures and a continuous painted road. The illustrated atlas includes the clearing and new route.

Willowcross stages its welcome **inn → market → southern survey**, then introduces the delegations one at a time: **human → Sylvren → Cairnkin → Brinefolk → Emberkin**. Each return breadcrumb opens the next delegation. Class quests still unlock by level. This preserves the existing encounters while reducing the number of simultaneous destinations.

Road signs point toward authored destinations. Hover a sign to read its directions and location names. Noncommercial buildings no longer carry large name boards; inns, shops and other public services retain identifying signs. Sign posts have shared collision. Social quests have their own minimap objective filter and guide players to their recipient or an undisturbed creature.

## Verification and further authoring

`npm run test:emberwild` covers ownership, target/range/line-of-sight checks, interrupt/spam handling, one-time gifts and trust, personal versus shared aggression, save migration, reputation discovery, social map guidance, network locality, named targets, persistence, and every class's complete campaign. The updated northern route has **28 quests**; the whole region has **71 definitions / 65 applicable quests per class**. Campaign bots reach level 11 at **15,179 XP** with real combat and loot. They relocate between tasks, so those results establish reachability and reward totals, not human travel duration or leveling speed. Human pacing still needs playtesting.

`npm run test:emotes` uses a disposable server and three prepared characters, with two browser clients observing the same gestures. It checks slash/chat completion, NPC response, unlocking, action-slot use, reputation visibility, peaceful encounters, sit interruption, saved progress, road-sign hover and a 1280×720 viewport. Prepare fixtures with `DATA_DIR=... EMOTE_FIXTURES=... node tests/emotes-fixture.js`; start the server with that DATA_DIR, then run with EMOTE_FIXTURES and TEST_URL. Never point fixture generation at live saves.

The registries and reaction system leave room for cooperative greeting rituals, faction-specific gestures, festivals, optional diplomatic quest solutions and hints that respond to party context. These are future content ideas, not implemented mechanics. New content should favor reciprocal expression and meaningful encounters, preserve solo onboarding, and keep repeatable material rewards bounded.

Initial social release validation: **164 automated tests passed**, including four full class campaigns and real WebSocket checks. The social browser workflow, existing camera/autorun browser checks and all-eight-directions locomotion browser checks passed without page/shader errors. The social workflow also checks the book at 1280×720. Live character data was saved gracefully, backed up to `data/backups/characters-before-emotes-and-reputation-20261104T182655Z.json`, and compared exactly after the live server restarted: seven profiles and one roster retained. No characters were wiped.

The subsequent nearby-awareness update adds tests for invalid/self/corpse fallback, strict named/selected recipients, area listeners and multiple peaceful creatures, wall occlusion, player agency, arrival greetings, reciprocal conversations, creature warning/sniff behavior, event-driven gestures, idle gestures, cleanup and 64-player traffic bounds. Network checks also exercise explicit audience commands. The two-browser workflow verifies the audience choice, persistence, nearby delivery, self-selection fallback and unsolicited NPC gestures.

Nearby-awareness release validation: **175 automated tests passed**, including the complete class campaigns and network audience checks. The expanded two-browser emote workflow passed without page/shader errors, including a 1280×720 view. A focused browser check also verified the sticky audience selector, performing a public gesture while scrolling, and Escape after changing the audience. The live server was saved and restarted with all seven profiles and one roster unchanged; backup: `data/backups/characters-before-nearby-and-ambient-emotes-20261104T190439Z.json`.

The streamlined spellbook browser check (`npm run test:spellbook`, using the same disposable fixture setup) covers the fixed 2×4 geometry across tabs/pages/filter states, hidden locked abilities, search case/slash handling, focus and empty results, page limits, locked-entry guards, drag/Shift-click binding, keyboard paging, preference/action-bar persistence, and the 1280×720 layout. The full multiplayer emote browser workflow also uses the new pages and search.

Spellbook validation: all **175 automated tests** passed, along with the spellbook browser check and the full two-player emote browser regression, without page/shader errors. Frontend sources were verified on the live service; this update needed no server restart or character migration.


## Ranged chat and conversational replies (4 November 2026)

| Command | Audience |
| --- | --- |
| `/say`, `/s` | Players within 35 paces in the same zone; eligible NPCs hear within 12 paces and line of sight |
| `/yell`, `/y` | Players within 120 paces in the same zone |
| `/1`, `/general` | All players in the same zone |
| `/p`, `/party` | Actual members of the speaker's current party, at any distance |
| `/g`, `/guild` | Reserved; explains that guilds are not implemented |

Plain text uses the chat header's selected channel, initially Say. Explicit channel commands select that channel for subsequent text; emotes continue to work independently. Server-side routing selects recipients at send time and never trusts a client-provided member list. Chat is limited to one message per second per speaker; unavailable guild and missing-party explanations still appear. Entering chat continues to stop movement.

NPCs answer every supported player gesture with an authored line and a complementary or occasional matching gesture. Repeated replies vary. Sera's one-time welcome gift, Lysa's teaching and Rowan's trail hint remain. Nearby `/say` chooses one NPC: an addressed full name, then a selected eligible NPC, then the nearest eligible neighbor. Questions about work, the inn/waypoint, roads/capital, local people, emotes, and greetings have authored responses. Replies share a short NPC cooldown to keep crowded hubs readable; dialogue does not grant repeat XP, gifts, or reputation. Friendly NPCs remain peaceful. Say and emote replies show local speech bubbles that follow character anchors, as well as chat lines. Private party text never creates a world bubble. No LLM or external service is used.

## Quest and window conveniences

The atlas uses the minimap's quest-tooltip formatter for numbered pins and overlapping objective regions. A pin takes priority over a region; clicking cycles the quests at that pin. Region/world charts show active quest counts by zone, including ready turn-ins, with a badge that opens the next chart level. Only active quests count; completed or abandoned quests do not. New quest content can declare `mapId` to associate its count with another registered zone.

Abandon Quest in the journal requires confirmation and works away from the quest giver. It removes that active record, dedicated quest loot, and its tracked selection; ordinary harvested trade goods stay. Completed records and earned rewards are retained. The quest can be accepted again if its current prerequisites permit, starting at zero. State persists through logout.

Open game windows fade to 45% opacity during locally predicted movement, including falling/jumping, and restore shortly after stopping. HUD frames and chat remain opaque. Spellbook wheel paging is clamped to valid pages, throttled for trackpads, and does not zoom the world camera. The visible option is now “Show unlearned”; its saved preference remains compatible with the former label.

Validation: `npm run test:emberwild` covers chat delivery, membership/range restrictions, NPC replies, abandonment/persistence and atlas hit/count logic. The real-protocol network suite checks four clients at different distances and a remote party member. `npm run test:social-upgrade` uses two browser players and disposable profiles created with `DATA_DIR=... SOCIAL_FIXTURES=... node tests/social-upgrade-fixture.js`; start a server against that DATA_DIR and pass SOCIAL_FIXTURES and TEST_URL to the browser suite. It covers real party invites, all channels, dialogue bubbles, atlas tooltips/counts, window opacity, abandonment confirmation/relogging, and wheel paging. Artifacts are written to `test-results/social-*`, `atlas-quest-tooltip.png`, `atlas-zone-quest-count.png`, `moving-window-transparency.png`, `quest-abandon-confirmation.png` and `spellbook-unlearned-wheel.png`.


Verified on 4 November 2026: **194/194 automated tests passed**, including four-client real-protocol chat routing and private party membership. The social-upgrade, existing spellbook, and existing emote browser suites passed without page or shader errors. The final confirmation screenshot verifies that both abandonment choices are visible without manual scrolling. The detached shared server was restarted and checked through loopback, the LAN address, and a WebSocket handshake. All seven character profiles and two browser rosters were preserved byte-for-byte immediately after restart. Backup: `data/backups/characters-before-social-channels-20261104T204833Z.json`.
