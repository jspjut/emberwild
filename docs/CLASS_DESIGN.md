# Emberwild class design

The four starter disciplines have separate jobs and combat patterns. The playable slice covers levels 1–10, with six abilities unlocked at levels 1, 1, 2, 4, 7 and 9. Race training choices, class IDs, ability IDs, existing quest progress and equipment ownership are preserved.

| Class | Role / armor | Combat pattern | Recovery |
| --- | --- | --- | --- |
| Dawnwarden | Melee fighter / plate | Stay close; alternate Sunstrike and a braced Sundering Slash, sweep packs and finish with Radiant Verdict. Damage skills reach at most six paces; basic attacks reach 3.6. | Long-cooldown Second Wind heals self; Dawn Aegis shields self. |
| Pathfinder | Bow ranger / leather | Aimed shots require standing still; Quickshot and Bramble Snare work while moving. Long bow range, targeted Volley and a heavy Predator Arrow. Bow attacks render actual arrows. | Field Dressing bandages self on a long cooldown. |
| Arcanist | Damage caster / cloth | Cinderbolt and Starfall reward uninterrupted casts. Frost Needle and Frost Ring buy distance; Arc Cascade punishes clusters. | Prismatic Barrier absorbs damage; the kit has no healing spell. Use tonics, rest or a healer for health recovery. |
| Stormcaller | Healer / mail | Lightning Bolt and mobile Storm Spark provide solo damage. The other four abilities heal or protect allies. | Frequent single-target healing, nearby party recovery, a targeted player shield and an instant emergency heal. |

## Ability progression

| Level | Dawnwarden | Pathfinder | Arcanist | Stormcaller |
| --- | --- | --- | --- | --- |
| 1 | Sunstrike — instant melee | Piercing Shot — aimed bow | Cinderbolt — cast damage | Lightning Bolt — cast damage |
| 1 | Sundering Slash — braced melee | Quickshot — mobile bow | Frost Needle — instant slow | Storm Spark — mobile damage |
| 2 | Second Wind — self heal | Field Dressing — self heal | Prismatic Barrier — self absorb | Healing Rain — friendly heal |
| 4 | Sweeping Blade — nearby damage | Volley — target-centered arrows | Starfall — target-centered damage | Mending Tide — nearby party heal |
| 7 | Dawn Aegis — personal defense | Bramble Snare — ranged slow | Frost Ring — nearby damage/slow | Rain Shelter — friendly player shield |
| 9 | Radiant Verdict — melee finisher | Predator Arrow — heavy aimed shot | Arc Cascade — chained damage | Life Surge — instant friendly heal |

The source registry in `shared/adventurers.js` defines exact costs, cooldowns, ranges, cast times and damage/heal/absorb values. Every skill owns its tooltip description. Normal class restrictions, the shared 1.5-second global cooldown, cast interruption, authoritative range/line-of-sight checks and enemy evasion still apply. Basic attacks pause during casts. No class can use another class’s techniques.

## Support targeting

- **Second Wind and Field Dressing:** always affect the caster, regardless of selected target. They cannot heal another player or NPC.
- **Prismatic Barrier and Dawn Aegis:** personal absorbs. A barrier is not health restoration.
- **Healing Rain / Life Surge:** select a living friendly player or NPC. An enemy or no target means self. Healing Rain retains its original recipient and rechecks life, range and line of sight on completion.
- **Rain Shelter:** select a living player within 24 paces and line of sight; an enemy or no target means self. NPC shields are not supported. The shield absorbs damage for eight seconds and expires on the recipient.
- **Mending Tide:** heals the caster and living party members within 12 paces and line of sight. It excludes strangers, NPCs, dead members and remote members. It also works solo. One cast grants one skill-practice credit, regardless of how many party members it heals.

Personal recovery and support casts do not enable autoattack. Friendly units cannot be harmed by offensive techniques. Tonics and out-of-combat health recovery remain available to every class. Stormcaller solo damage deliberately comes from its two offensive skills and ranged basic attacks; solo quests do not require another player. The final shared campaign capstone grants at least enough XP to reach level 10, so practicing support skills does not force a healer to farm the incidental kills earned by damage-based practice. It retains its base reward for characters already above that threshold; completed quests still cannot be repeated.

## Tutorials, saves and authoring

The three early practice quests resolve to class-specific lessons: follow-up attack, personal sustain or ally healing, then area damage or party recovery. The two later mentor quests name the actual level-7 and level-9 techniques. Healer mastery practices Life Surge on friends or self, rather than asking for damage against enemies.

Existing ability IDs remain stable for action bars and quest records. For example, `lance` now means the Dawnwarden’s melee Sundering Slash; `mend` is self-only Second Wind; `sigil` is Prismatic Barrier; `thunder` is Mending Tide; `stormchain` is Life Surge. Existing characters receive these definitions on the next server/client update. This is a code/static-world update requiring a server restart; it is not an additive live bundle. No saved characters are rewritten or removed.

Engine support is data-driven: `selfOnly`, `partyHeal` and `friendlyTarget` extend the existing heal/shield behavior. Worlds without those flags keep their existing mechanics. `projectile: 'arrow'` on a class selects arrow visuals. The internal `skillForRole(..., 'heal')` name remains a compatibility alias for the level-2 sustain slot; that slot does not imply every class heals. New content may use the equivalent `sustain` alias.

## Validation and limits

`tests/class-design.test.js` covers distinct role boundaries, personal recovery targeting, barrier behavior, party-only healing, friendly shields and tutorial accuracy. Existing combat, casting, networking and progression suites verify the shared rules. Full starter campaigns exercise all four classes against actual quests and boss encounters. Those bots relocate between objectives; they demonstrate progression feasibility, not human leveling time or final multiplayer balance. Group healing potency and damage pacing still benefit from human party playtests.

With Firefox/Playwright installed, `HEADED=1 xvfb-run -a node tools/class-design-browser.js --world emberwild` checks all four spellbooks and actual support/arrow behavior on disposable saves.
