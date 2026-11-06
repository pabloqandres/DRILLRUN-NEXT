# DRILL RUN NEXT GENERATION — Visual Overhaul V2

**Date:** 2026-11-06
**Owner:** ChatGPT (direct GitHub/Vercel implementation; no additional coding agent)
**Branch:** `chatgpt/full-visual-overhaul-v2`
**Approval:** User authorized a complete visual redesign of everything on screen, including HUD, controls, missions, icons, world beacons, buildings, paths and the current mining environment. Existing logic/saves must remain valid.

## Changes in the actual executable game

### HUD and all common screens
- New `dist/chapter/visual-overhaul-v2.css`, loaded **last** in `dist/index.html`, replaces the mismatched HUD treatment with a coherent premium navy/steel/gold/PUMA red accent design across the whole interface.
- Completely reworked positioning, shape, illumination and contrast of avatar/player profile, player progression, level badge, coin/energy/booster counters, settings gear/phone, objective panel, live contract countdown, geological card, camera button, interaction button and physical-looking analog joystick.
- All modal/screen classes share one design language: success rewards and cinematic mission complete overlays, mission/contract steps, pause/settings screens, character chooser, device/phone home/apps, builder/catalog, HSEC cards and construction placement.
- Mobile landscape responsive breakpoints scale navigation and preserve usable 3D world; prefers-reduced-motion respected.
- New six-button in-game dock: **Catálogo / Contratos / Equipos / Personal / HSEC / Zonas**; wired to actual existing UI entrypoints, with graceful fallbacks when a mission has not unlocked. Unlike the former UI, it stays visible in gameplay even after completing a mission; it disappears while Phone, Catalog, or Placement takes focus.
- No static mockup replaces actual interface nodes or disables click handlers.

### Real 3D world markers
- `dist/chapter/action-halo.mjs`: main mission beacons now include two glowing, animated concentric ground rings rendered as Three.js geometry; existing projected objectives keep distance labels with larger high-contrast icon badges and refined on-screen/off-screen treatment in CSS.
- No new object collision, terrain blockage, route changes or mission destinations. Real-world goal positions remain source-of-truth.

### Building upgrade tiers
- `dist/scene.mjs`: workshop **L1** is the originally approachable, functional maintenance building; high-tech rooftop solar and extraction equipment are in a named visual group whose visibility depends on the *actual* saved workshop level >= 2.
- Real **L2** extension receives PUMA-red structural fascia, gutters and LED service lights, without adding collision volumes or changing doors/pad footprints.
- `dist/chapter/product-preview.mjs`: catalog previews now render fresh real workshop geometry from the same runtime factory and correctly toggle premium roof for L1 vs L2; it does not mutate the live workshop model.
- Existing office PUMA® burgundy, identity, original layout, warehouse/shed and HSEC road graphics from earlier World Art V1 remain intact.

## Branding
- The official DRILLCO source image stays in the **office only**, not pasted across HUD/other buildings. The PUMA burgundy is a controlled architectural accent, not excessive logo placement.
- The supplied 2-page logo PDF was inspected; its second page contains the horizontal gray DRILLCO logo. This upgrade does not claim replacement of the existing office asset with that vector. Existing official office PNG remains, no invented branded mark elsewhere.

## Safety and compatibility
- `dist/chapter/game.mjs` changes only presentation/navigation routing; no changes to its save/load, progression calculations, mission rewards, inventory, economic model or Firebase.
- No changes to HSEC scoring, original collision wall definitions, workshop dimensions or avatar interactions.
- No external font or plugin dependencies.

## Tests/verification
- New `tests/full-visual-overhaul-v2.test.mjs` checks stylesheet priority, UI presence, six real navigation destinations, world marker geometry/disposal, correct building level gating and preserved state code.
- Isolated JS syntax parsing passed for changed `game.mjs`, `scene.mjs`, `product-preview.mjs`, `action-halo.mjs`, and test. CSS braces balanced; HTML references the stylesheet and 6 navigation tabs.
- Browser visual interaction and full `npm test` remain pending. Git/Vercel production commit match and HTTP source responses must be checked post-merge. No claim of pixel-identical real-time 3D to generated concept imagery.

## Follow-up
User evaluates the actual production game at its stable URL; fix camera/HUD overlaps or browser issues based on screenshots. If successful, continue targeted 3D asset quality upgrades and richer higher-level architecture in further commits.
