# Live authoring in Emberwild

Use the base engine's `docs/LIVE_UPDATES.md` for the full developer API, field constraints, receipts, revision checks and journal maintenance. All commands here run from the installed **engine root**. Emberwild bundles must set `worldId` to `emberwild`; the Meadow example targets a different world and will be rejected.

```sh
# Discover source templates and inspect their complete definitions:
node tools/content-catalog.js --world emberwild --section enemyTypes
node tools/content-catalog.js --world emberwild --section items --search blade
node tools/content-catalog.js --world emberwild --section assets --search fox
# Read current accepted live additions (server must be running):
curl http://localhost:3080/live-content.json
# Inspect revision, validate, then submit a reviewed bundle:
node tools/live-update.js --data-dir data/emberwild --status
node tools/live-update.js --data-dir data/emberwild --file my-update.json --check
node tools/live-update.js --data-dir data/emberwild --file my-update.json
```

The source catalog includes dormant art designs; an art ID is not necessarily an enemy/item template. Live updates clone existing gameplay definitions, preserving art/mechanics. Browse the built asset workshop at `/asset-library.html` on the game server or on the informational Pages site, and see [creature ecology](CREATURE_ECOLOGY.md). New art generators, collision and geography need a maintenance build.

The unapplied [continental example](../examples/continental-live-update.json) demonstrates shipped templates. Review positions and balance on disposable saves first. Additive changes persist, including across restarts; there is no live undo. Dialogue, quest wording, announcements and vendor stock are the supported replacement exceptions. Retain accepted bundles with world source and back up the full save directory/journal. A baseline change needs the engine's documented migration process.

For Docker, stream a reviewed file to `node tools/live-update.js --data-dir /app/data/emberwild --check` using `docker compose exec -T game`, then submit without `--check`, as shown in the engine guide. Use the same Compose files as the running deployment. Operator access is filesystem/container access; no HTTP write API is exposed.
