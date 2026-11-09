# 2026-11-09 — Crosswalk decal and operational shed lighting V9

## User symptoms
- Screenshot: a pedestrian crossing appears twice and forms a raised paved slab crossing separate road/pedestrian surfaces.
- Screenshot: lights on maintenance shed look switched off at night, even though lamp geometry is present.

## Root causes
- `assetModel(crossing)` built a solid 3.8×1.8 road base, stripes, thick yellow lines and tactile blocks at Y≈0.05 while `paintRoads()` independently drew a second crossing on the road texture plane.
- `paintRoads()` used `ctx.rotate(-r)` with unequal x/z mapping (30 world units in x versus 24 in z), distorting rotations.
- `buildShed` modelled lenses only. Workshop had no PointLight objects. HSEC update only created lights for tower and post assets.

## V9 visual correction
- `dist/hsec/world.mjs`: built crossing no longer adds raised road geometry; an outline hologram stays available during construction. The crossing is a single flush canvas decal, painted after road routes using a world-unit aware affine transform; finer zebra stripes, muted transparent road wash and narrow safety demarcations. Crossings draw even without an existing route.
- Real shed model gains two warm interior point lights and one forward entry light, parented to the existing model. Shadow maps disabled; intensity depends on existing nighttime/functional-condition rules and shares the 16-light pool. No new saved state, colliders, scoring, route geometry or gameplay triggers.
- `dist/hsec/shed-model.mjs`: four pendants and two canopy lenses use a discrete luminous material; no external brands, textures, glTF assets or dependencies.

## Verification
- Both ES modules re-fetched from GitHub feature branch and parsed with V8 (static import/export removed): PASS.
- Static geometry review confirms no physical crossing slab for built assets and no additional HSEC colliders.
- Full gameplay/browser WebGL screenshots, FPS, old-save restore and nighttime visual acceptance: **not run**.
