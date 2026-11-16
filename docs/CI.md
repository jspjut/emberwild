# Emberwild CI

Routine verification uses the world-owned [test profiles](../tests/suites.json). Full verification runs nightly only after relevant default-branch changes, manually, and before release packaging. The scheduled workflow starts a small change gate on unchanged nights and skips expensive jobs. Failed nightly attempts with no new source need a manual retry.

See the engine's [CI policy, suite commands, caches and deadlines](https://github.com/jspjut/kithcore/blob/main/docs/CI.md). The complete suite remains available with `node tools/test-world.js --world emberwild`; `--suite fast` needs no generated exports. Network integration, geometry sweeps and exhaustive art/campaign/browser validation retain selected or full jobs.

Nightly runs occur at 07:23 UTC (02:23 EST / 03:23 EDT). The baseline is the previous completed scheduled attempt; a first run uses a 24-hour relevant-change lookback. Manual full verification and release verification always run.

Source and generated media caches include the engine pin. Changing `.github/engine.json` selects runtime, browser, network, geometry and art checks. Pure docs edits use only the source guard, plus a site build when public site/docs inputs change; existing verified images/videos are reusable. Pages deployment still needs its repository settings and deployment flag enabled.
