# World atlas

The atlas has three levels: **Emberwild → region → zone/capital**.

| Region | Zones | Capital |
| --- | ---: | --- |
| Dawnlands | 9 | Alderhaven |
| Greenward Wilds | 9 | Sylvarin |
| Crownspine | 10 | Karndur |
| Lantern Marches | 10 | Veshkar |
| Saltwind Coast | 9 | Nereides |

Capitals are separate city charts. All 37 leveling zones and ten frontier zones remain allocated. The four leveling routes and lateral connections remain, with the early fan now surrounding Alderhaven. Dawnlands holds the starter and early branches; the other regions contain the later routes and frontiers.

## Geographic drawing

The world and regional charts fill adjoining polygon territories rather than using isolated oval washes. The coast is authored in `shared/continent-coast.js` and shared with terrain and movement boundaries. Zone provinces follow actual geographic ownership, with shared curved survey boundaries; the regional outlines are aggregates of their member provinces. Forests, ridges, lakes, craters, dunes, ice and ruins are drawn in the chart. Text is limited to short place names and level ranges; long descriptions remain in `CONTINENT.md`.

Local charts draw the built quest hubs and roads, with paired inn and flight badges. The legend distinguishes a bed/hearth, wings and a fortified capital. All five capitals are also marked on world and regional charts. The minimap has independent return-waypoint and flight/capital tracking toggles.

Canvas label placement measures text, keeps names clear of one another, and reserves space for the title and compass. A short leader connects a displaced label to its location. The same polygons drive map hit detection. Region charts fit their full geographic territory, including land between hubs.

World/region marker positions use an explicit geographic projection from world coordinates. This prevents a character marker from drifting when chart frames have margins or a region has a nonrectangular outline. Local zone/city charts retain their own authored bounds and detail. Clicking a chart changes the atlas view; it never moves the character.

## Authoring

- `shared/atlas-regions.js`: five region identities and zone membership.
- `shared/continent-atlas.js`: geographic polygons, terrain illustrations and chart hierarchy.
- `shared/continent-coast.js`: coastline, walkable mainland boundary and shoreline distance.
- `shared/atlas.js`: registry and original Cinderwood/Alderhaven chart details.
- Engine `client/cartography.js` / `client/atlas-labels.js`: rendering and text placement.

A chart uses `id`, `name`, `kind`, `parent`, `charted`, `survey` and optional terrain drawing arrays. Children have a `placement` rectangle and an `outline`, or multiple `outlines`, in parent paper coordinates. A world/region can specify `geographicProjection: {bounds, frame}` to locate live markers directly in its geographic paper frame. Zone/city `bounds` define their local projection. Map hit regions are independent of simulation subscriptions.

Run `npm run test:emberwild` for atlas membership, geographic projection and coastline coverage checks. The engine's `tools/atlas-browser.js` verifies measured labels and captures world, region and local charts using a real developer explorer. See the engine's `docs/DEVELOPER.md` for the opt-in developer URL.
