# DRILL RUN NEXT GENERATION — World Art V1 (real-model catalog)

**Date:** 2026-11-06
**Author:** ChatGPT, working directly in GitHub
**Branch:** `chatgpt/world-art-building-catalog-v1`
**Intent:** deliver the first production-capable implementation toward the full approved premium visual direction without representing concept images as playable assets. User specifically prioritized **real 3D building upgrades** and **real model images in the construction Catalog**, before future product/vehicle work.

## Implemented in actual game

### Real architecture
- `dist/assets3d/office-shell.mjs`: replaced prototype burgundy skeleton with DRILLCO graphite/charcoal and warm light cladding; added physical rooftop solar arrays, service ventilation, new LED/entry detailing and industrial trim. Same office mesh factory powers the real world; geometry batched as before.
- `dist/scene.mjs`: same existing workshop factory now builds 178 visual detail calls including upgraded façade, canopy, photovoltaic roof, technical extraction and access lighting. The original workshop wall collision coordinates, floors, access openings and upgrade state are retained.
- `dist/hsec/shed-model.mjs`: matching roof PV arrays, maintained sloped roof, logistics-friendly fascia and access lights. The existing HSEC footprints and mesh batching unchanged.

### Exact visual thumbnails, never disconnected renderings
- `dist/chapter/product-preview.mjs`: renders building cutout PNGs using **real Three.js models from the running game**. Deep clones geometry into the preview context so unloading snapshots does not dispose buffers used by live buildings. Full L2 office preview includes installed extension when available; L2 workshop adds the installed extension. Original HSEC asset previews already use their exact `assetModel` factory.
- `dist/scene.mjs`: `makeWorkshop(previewOnly=true)` uses the same model generation but does not insert a duplicate building into the world or change colliders, pads, walk surfaces, map labels, economy or save data.
- `dist/chapter/builder-ui.mjs` and `dist/chapter/game.mjs`: connect real world to the Catalog, lazily cache snapshots by actual level; do not modify purchase/placement callbacks.

### Environment/UI first art pass
- `dist/graphics/atmosphere.mjs`: richer blue-to-warm desert sky gradient.
- `dist/graphics/desert.mjs`: low-cost periodic wind/sediment color variation; no terrain geometry/collision changes.
- `dist/hsec/world.mjs`: constructed HSEC vehicle and pedestrian roads gain improved gravel shoulders, restrained asphalt shading and reflective markings; routes, points, score, cost and saved state untouched.
- `dist/chapter/world-art-v1.css` and `dist/index.html`: restrained compact HUD polish, less visually heavy resource chips, smaller objective and navigation controls, real-building cutout presentation with consistent dark navy/gold/cyan. Existing DOM buttons, collapse, availability, ordering and interaction logic unaffected.

## Save and logic safety
- NO new SKUs, costs, build times, mission logic, account/auth, Firebase configuration, save format or cash updates.
- No external-brand equipment or signage added. Original official DRILLCO logo preserved.
- Catalog images are generated on demand and cached, not continually re-rendered. Real geometry is cloned for thumbnail rendering.
- Original material model remains stylized premium cel shading; avoids switching to heavy photoreal/PBR engine dependencies.
- This release **does not claim** that all mockup buildings already exist as gameplay buildings. Only office, workshop and HSEC shed are updated; future buildings, drill products, and 3D machinery assets are out of scope of this first test.

## Verification actually performed
- Parsed changed .mjs files as JavaScript after stripping module import/export tokens (8 checks passed) and verified CSS brace balance.
- Executed the exact source of `World.prototype.makeWorkshop` with a lightweight Three.js class stub: 178 detail calls; catalog preview adds zero scene objects, zero collision bodies/pads/walk surfaces/labels. Live construction adds the existing 5 walls, 1 pad and 1 walk surface. PASS.
- Added Node regression tests in `tests/world-art-regression.test.mjs` for preview isolation, collision invariants, deep clone geometry and building thumbnail integration.
- Full `npm test`, actual WebGL-rendered screenshot comparison and on-device performance verification were NOT run through these repository connectors; browser smoke testing is required after deployment.

## Next release / approval
User should review architecture and true-product catalog renders on the **stable production domain** using the existing saved game. Only after approval expand scope to additional buildings, products, vehicles and full world art direction. No second-party handoff required.

## Production release verification

- PR #7 merged into `main` as `1b314880b20559aad2d7a46e7bc19af51e30e5c3`.
- Vercel `dpl_2QJ2CsffiSvTd8E59mEFpoaYb13C` READY, production, exact source SHA matching merged commit.
- Production `/`, `/index.html`, `/manifest.json` and the nine changed game art source/CSS paths each served HTTP 200 with expected markers and size.
- Pending visual review and live gameplay/performance smoke tests. Do not claim the image concept has been perfectly replicated.
