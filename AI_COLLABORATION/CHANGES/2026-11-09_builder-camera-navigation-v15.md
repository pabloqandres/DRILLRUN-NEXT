# 2026-11-09 — Builder camera navigation V15

## User-reported blockers
- Cenital construction zoom stops too close; cannot survey whole parcel.
- Camera drag feels erratic and shifts perspective instead of moving around the construction terrain.
- Opening construction near a building can trap the camera inside walls/roofs.
- Requested same existing joystick for moving overhead construction camera, with zoom independently controlled.

## Changes
- `dist/camera/follow-camera.mjs`: isolated builder distance 10–70 m; initial 22 m overhead at 80° pitch. Initial mode transition snaps safely high above roofs. Builder no longer applies on-foot collision sweep (which shortened distance to near zero when its focus was inside an existing building). Changing placement/draft focus does not reset zoom. New camera-only bounded `panBuilder(dx,dz)` offsets aerial target within x[-17,19]/z[-15,13]; leaves actual placement points unaffected. Explore/interior presets, zoom and collision logic remain unchanged.
- `dist/chapter/game.mjs`: scoped view-controller hook; while an HSEC asset/route/cone placement is active, the existing joystick and arrow/WASD controls pan the overhead camera, without moving player avatar, while canvas drag pans with zoom-dependent scale. Wheel/pinch zoom continues using the existing handler. Catalog browsing with no in-world placement is still UI-only and retains its normal view.
- `tests/builder-camera-v15.test.mjs`: four focused regression test cases for initial above-roof framing, full zoom / no reset on draft point, bounded pan without changing focus, and return to first-person camera.

## Cross-owner coordination
The user requested direct implementation of this camera control behavior. `game.mjs` is Claude-owned. The sole functional-file change is two narrowly scoped camera-view hookups; no mission progression, HSEC scoring, economy, assets, saving, player physics, objective or builder placement data changed. Existing joystick/touch handlers and camera controls remain the source of input; the modification dispatches to camera pan only during actual HSEC placement. Documented in DECISIONS.

## Verification
- GitHub branch source loaded and evaluated with a minimal Vector3/Canvas camera mock. All eight checks passed: explore camera baseline (3.8 m), high and collision-free initial builder framing, zoom to 70 m, preserved zoom on new draft point, pan, bounded pan, exit restoration, joystick + drag hooks.
- New Node regression tests are committed but not executed in Node/WebGL; device/browser rendering and full-game behavior unverified.
