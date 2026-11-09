# 2026-11-09 — V18 immersive Atacama audiovisual world upgrade

## User request
After finishing and publishing HSEC V17, perform a major visual/audio polish while user is away at lunch. Requested footstep differentiation (gravel vs concrete), live DrillTruck engine, running drill, workshop/office locality sounds and ambitious world detail. No external brands beyond authorized DRILLCO®/PUMA®; no gameplay/economic/mission changes.

## Changes
- `dist/audio/worksite-audio.mjs`: original procedural Web Audio sound engine (no third-party audio, no music, no downloads). Footstep impulse varies between gravel and built roads/concrete using current HSEC geometry and walk-surfaces. Proximity-weighted looping synthesis for workshop machinery, office building hum, RC/DTH drilling and moving DrillTruck, with occasional workshop metallic ticks. Source volume fades rather than abruptly toggles, respects existing game sound toggle and page lifecycle; no audio nodes created until user enables sound/enters play.
- `dist/graphics/site-cinematics.mjs`: state-aware visual overlay for only **real built structures and owned equipment**: two operating workshop entry lights and glows, rooftop rotating ventilation fan, office entrance glow, animated warning beacons for drilling rig and moving DrillTruck, low-poly truck dust trail, workshop welding-spark particles, and soft contact shadows for live RC and DrillTruck models. Max two small dynamic PointLights, no shadow-casting from them, no new colliders, routes, purchaseable assets or fake infrastructure. Cosmetic dust and sparks disabled on low graphics preset.
- `dist/graphics/atmosphere.mjs`: hand-drawn sun haze and fine high-altitude Atacama sky strata on the existing 512x256 canvas sky, no external downloads.
- `dist/graphics/desert.mjs`: 30 instanced low-poly mesas at far outer elevations; outside the playable build yard, one instanced draw-call.
- `dist/chapter/game.mjs`: narrow integration (only sound lifecycle, site FX scene creation and per-frame read-only state hooks) of new modules. Sound toggle and return-to-title silence worksite audio; no gameplay state mutations. DTH production rig is audibly active only when production drill state is `producing`.
- `tests/worksite-audio-v18.test.mjs`, `tests/site-cinematics-v18.test.mjs`: regression suites to preserve source-based sound gating, surface footsteps, building/equipment-driven visuals, low-quality mode.

## Restrictions/invariants
- Preserves V16 M2/M3 checklist approved by user and V17 top HUD HSEC status.
- No economy, contracts, mission predicates, saved objects, HSEC scoring, player positioning, patrol logic, machine routes, collision or game text changes.
- No downloadable media, no music (all original sound effects synthesized at runtime).
- No new unauthorized brands/logos on equipment. No GLB changes. Existing game `prefs.sound` controls everything.
- `dist/chapter/game.mjs` is Claude-owned; only narrow visual/audio integration hooks modified under user request; documented in `DECISIONS.md`.

## Tests actually executed
- V8 JS parser checks PASS for five modified/new modules and the worksite audio test.
- Mock Web Audio context smoke PASS: worksite/drill/truck mixers activate when near and running, mute fully with setting and dispose cleanly; gravel/road/concrete footstep classification PASS.
- Mock Three.js scene smoke PASS: lit office/workshop/rig/truck only when real assets present, dynamic dust and machine glow animate, low quality disables dust/sparks, dispose removes the scene elements.
- Node test files committed but not run against Node; full browser/WebGL screenshots, runtime performance and audible device QA not available in this session. Vercel build/deploy status will be checked separately.
