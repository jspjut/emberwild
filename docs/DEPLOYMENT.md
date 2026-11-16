# Install and deploy Emberwild

Emberwild requires the KithCore base engine. The world-only download cannot run by itself. Both packages are MIT licensed; retain each project's license and dependency notices. Use the intended [KithCore engine downloads](https://github.com/jspjut/kithcore/releases) and [Emberwild world/starter downloads](https://github.com/jspjut/emberwild/releases) once published.

## Choose a download

- **Starter** (`emberwild-starter-<world-version>-kithcore-<engine-version>.tar.gz`): includes the compatible engine, Meadow and Emberwild. Extract it, enter its folder and run `./start.sh` on Linux/macOS. It selects Emberwild automatically. With Docker, use `docker compose up --build` from that folder; its generated override selects the world.
- **World only** (`emberwild-world-<version>.tar.gz`): extract beside an engine or into its `worlds/` directory, producing `worlds/emberwild/world.json`. From the engine root run `./start.sh --world emberwild`. For another location use `npm start -- --world /absolute/path/to/emberwild` after installing production dependencies.
- **Assets**: an optional art resource, not a playable installation. Runtime visuals are built from source recipes; ordinary gameplay does not require exported models.

Verify `SHA256SUMS` before extracting (`sha256sum -c SHA256SUMS` on Linux; `shasum -a 256 -c SHA256SUMS` on macOS). Windows users can compare `Get-FileHash -Algorithm SHA256 <archive>` with the checksums. The release manifest records files, engine version and world version.

## Node, containers or your own host

On Windows install Node.js 22+, then run `npm ci --omit=dev` and `npm start -- --world emberwild` from the engine root. Linux/macOS can also use these npm commands. The shell launcher bootstraps a local checksum-verified Node runtime if needed; first setup needs internet access.

From a separate engine/world installation, start Docker with:

```sh
docker compose -f compose.yaml -f worlds/emberwild/compose.override.yaml up --build -d
```

The override mounts world files read-only. A starter uses plain `docker compose up --build -d`. The container listens locally by default; set `BIND_ADDRESS=0.0.0.0` deliberately for LAN access. Node listens on all interfaces by default; set `HOST=127.0.0.1` for local-only play. Open `http://localhost:3080` and verify `/ready`.

For a VPS, service manager or container platform, use the engine's documented Node command or Dockerfile, a writable persistent save mount and one writer per world. GitHub Pages serves informational previews and downloads; it cannot run the authoritative game server. For reverse proxies, TLS/WSS, backups, restore, environment variables, health checks and upgrades, use the engine's bundled `docs/DEPLOYMENT.md`. This alpha still needs account, moderation and public-service hardening for a public service.

Default saves are `data/emberwild/`. Stop before backing up the entire directory, including live updates. A live journal must stay with the characters that reference its additions. See [compatibility](COMPATIBILITY.md) and [live authoring](LIVE_UPDATES.md).
