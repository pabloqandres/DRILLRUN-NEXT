# 2026-11-09 — Continuous painted road junctions V10

## Scope
- `dist/hsec/world.mjs` only gameplay file: paint pedestrian paths before vehicle pavement to preserve continuous roads at intersections. Clip zebra crossing stripes and stop markings to actual vehicle road footprint. No separate painted rectangular slab.
- Correct world/canvas affine rotation for crossing stripes, including non-square texture map.
- Keep asset positions, crossings, HSEC route graph, collision, scoring and saved states unchanged.

## Validation
- Re-fetched source and parsed module body in V8: PASS.
- Static checks for paint order and road clipping: PASS.
- Browser/WebGL screenshot QA pending.
