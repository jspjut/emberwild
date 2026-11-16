# Equipment shapes across levels 1–100

The collection adds **ten physical looks for each armor material**, with eight pieces per look: head, shoulders, chest, hands, waist, legs, feet and back. The 40 new sets add 320 armor pieces. The original eight sets and 64 pieces remain, giving 48 full outfits. Eleven weapon/offhand families each add ten different shapes, for 110 new designs.

Shape and color are independent. Pick the level-band shape first, then apply any of the 15 regional palettes. The workshop's **Level band** filter chooses the planned range; **Regional palette** changes materials. Full-set and selected-piece try-on work on all five races. Early cloth uses draped mantles and soft leg/foot construction; leather uses straps and split panels; mail uses overlapping scales; plate uses rigid breastplates, faulds and greaves. Successive bands change heads, collars, hems, shoulders, capes, hands and leg/foot construction. Weapons change blades, guards, heads, bow limbs or shield outlines.

These are art/authoring additions. They do not place loot, change starter stats or extend the playable level cap beyond ten. Future level bands remain available in the source library for later content.

## Weapons and offhands

Sword, axe, hammer, staff, spear, dagger, bow, greatsword, shield, focus and wand each have ten shape tiers. Blade profiles include straight, leaf, hooked, crescent, split, fluted, winged, forked, crystal and crown forms. Staff/wand/focus heads have ten constructions, bows change limb paths and braces, hammers change head construction, and shields have ten outlines.

## Reusing art in content

Shape IDs use `tier01_cloth_armor`, `tier05_plate_shoulders`, `tier10_bow`, and so on. `itemRecipe(id, region)` from `shared/asset-library.js` returns the wearable appearance, including its shape tier. For example, `itemRecipe('tier05_sword', 'frostfell')` makes the level 41–50 sword shape with a frozen theme. New recipes use the engine's `client/equipment-progression.js`; retain that source when updating the engine.

All 430 new progression pieces also have dormant item templates with zero power/armor, their appearance and planned minimum level. Additive live bundles can clone a template and assign a new item name, stats and acquisition source. Validate with the engine's live update tooling before applying. Templates alone do not grant items or populate vendors or drops. Custom palette recipes can be authored in the world's item definitions; live bundles inherit their selected pre-shipped template appearance.

## Complete catalog and export coverage

The curated registry retains 792 designs. `shared/complete-assets.js` adds all 89 non-template game equipment appearances, producing 881 catalog entries: 208 creatures, five races, 637 equipment appearances and 31 props. Dormant templates are indexed through their curated art IDs rather than duplicated as game aliases. Both the workshop and printable catalog use this same complete index. The manifest includes every entry and all 48 assembled outfits.

Run `npm run build:world-assets` from the engine repository to generate all 929 GLBs/previews and 637 SVG icons. The build removes stale generated model/preview/icon files before exporting. No binary assets or Git LFS are needed in source repositories.

## Checks

`tests/equipment-tiers.test.js` checks all ten ranges, all eight slots, all eleven weapon families, original set retention, physical shape uniqueness, palette-independent geometry and live equipment coverage. The full asset suite checks every catalog entry across 15 palettes, rig sockets, animation, mesh budgets and GLB loader round trips. The workshop/browser and website checks verify complete counts, level filters and exports.

## Armor progression

| Levels | Cloth | Leather | Mail | Plate |
| --- | --- | --- | --- | --- |
| 1–10 | Hearthlinen | Trailpatch | Linked Pilgrim | Road Soldier |
| 11–20 | Wayfarer Poncho | Hedgerow Scout | River Scale | Ridge Cuirass |
| 21–30 | Scribe’s Wrap | Briar Duelist | March Brigand | Oathplate |
| 31–40 | Windreader | Ridge Tracker | Gate Hauberk | March Harness |
| 41–50 | Archive Keeper | Woolmantle | Iron Lamellar | Gateguard |
| 51–60 | Rain Cantor | Farroad Duster | Quarry Sentinel | Fluted Sentinel |
| 61–70 | Skyweave | Scalehide | Storm Harness | Winged Bastion |
| 71–80 | Moonfold | Night Prowler | Reefguard | Sunward Fauld |
| 81–90 | Star Scholar | Thorn Warden | Witness Mail | Rune Keeper |
| 91–100 | Dawn Hierophant | Wildcrown | Tempest Sovereign | Crownforged |
