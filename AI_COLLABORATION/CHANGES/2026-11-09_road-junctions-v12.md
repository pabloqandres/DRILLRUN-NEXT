# 2026-11-09 — V12 unified HSEC road-junction painting

## User-visible defect
Repeated screenshots after V9 and V10: roadway sections still appear disconnected where T-junctions, branches, and pedestrian crossings meet.

## Root cause and scope
`dist/hsec/world.mjs` painted each merged chain's dark shoulder, white edging, pavement, wear, and center line before painting the next chain. Subsequent shoulders/edging covered parts of earlier pavement at a T-junction, creating visible cuts. Canvas widths were in `tw()` pixels using the world X scale only, while X and Z world-to-texture scales differ.

## V12 implementation
- All built pedestrian routes rendered together as a single consolidated Path2D, then all built vehicle routes. Each material pass covers every segment in the same network before progressing to the next paint layer. Round caps and joins preserve visible material continuity at bends and intersections.
- World-space canvas transform converts actual world metres to the rectangular map dimensions; line widths and zebra placement remain consistent when rotated.
- Existing crossing marks are clipped to the union of constructed vehicle pavements, keeping one shared surface without slab geometry and preventing painted stripes from extending beyond the road.
- No modifications to HSEC state/network graph, actual road endpoints, snap tolerance, collisions, save games, money, missions or construction costs. If actual route endpoints are physically distant, they remain distinct; this release fixes painter-created seams.

## Checks
- Re-fetched JS module parsed successfully in V8.
- Fake Canvas2D/Path2D smoke test with two vehicle routes intersecting in a T, one pedestrian route and one crossing: all vehicle segments rendered in shared passes, one clip, 10 zebra/stop rectangles, canvas texture marked dirty.
- Full WebGL and user-save visual regression test not executed.
