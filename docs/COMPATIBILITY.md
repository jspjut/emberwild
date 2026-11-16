# Engine dependency and compatibility

Emberwild is a world pack, not a standalone server. It requires KithCore engine `0.1.0-alpha.3`, runtime API `1`, or another explicitly tested compatible engine. The release workflow uses the exact engine repository/commit in [`.github/engine.json`](../.github/engine.json); the repository is set to `jspjut/kithcore`, and the full commit SHA must be pinned before hosted CI or release builds. Use the combined starter for a matched engine/world installation. The world-only package contains no core simulation or launcher.

Both projects are experimental alpha software. Interface and save compatibility may change between releases. Read the bundled engine's `docs/COMPATIBILITY.md` and `docs/DEPLOYMENT.md`. Back up the entire stopped `data/emberwild/` directory, including its live journal. Keep the exact old artifacts for rollback. Do not run two writers against the same saves.

Linux is the primary development platform; Node.js 22+ and desktop WebGL are required. Broader Windows/macOS/browser coverage and sustained load testing remain pending. No support SLA is promised. Report world content/art issues here and shared simulation/client issues to the engine project, with exact versions and reproducible steps.
