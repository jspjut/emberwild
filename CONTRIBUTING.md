# Contributing to Emberwild

Emberwild requires a compatible KithCore engine. Install this world into `worlds/emberwild/` in that engine, then run all npm commands from the engine root. Run `npm ci`, `npm run world:check -- --world emberwild`, `npm run build:world-assets`, and `npm run test:emberwild`. Asset/browser checks need Playwright Firefox and working WebGL; see the engine's contribution and build guides. Use disposable saves for tests.

Keep world content, procedural source recipes, stories and presentation here. Shared simulation/client changes belong in the engine. Preserve unused/future asset source. Generated exports, websites, saves, credentials and test results stay out of Git. From this world repository install the source hook with `node tools/check-source.mjs --install-hook` and run `node tools/check-source.mjs` before committing.

Describe the user-visible change, exact engine/world versions and validation in issues/PRs. Disclose significant AI-generated contributions and credit external sources with their licenses. Contributions are offered under this repository's MIT license; submit only material you have rights to contribute. Read [provenance](PROVENANCE.md), [compatibility](docs/COMPATIBILITY.md) and [security](SECURITY.md). No contributor agreement is currently required. Be respectful, explain disagreements and avoid harassment in project discussions.
