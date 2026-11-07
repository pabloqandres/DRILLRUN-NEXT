# Uploaded RC and DTH visuals — optimized asset staging

Date: 2026-11-07
Status: GitHub source plus **4 binary assets committed**, validated by GitHub Actions (pass). Preview deployment verified READY. Production pending.
Depends on: generic naming/layout PR #17.

## Original uploads
- RC: 82,732,740 B, 1,000,000 faces, 1,162,415 vertices.
- DTH: 70,801,468 B, 1,000,000 faces, 873,333 vertices.
- Single mesh each, 3 embedded 4096 × 4096 PNG textures per model; no animation hierarchy.

## Offline optimization
- RC: 2,748,264 B; 101,625 faces; 56,561 vertices; grounded 7.6 m high. SHA256 9020ec6f5116367767125398df7d75390d66bec6bbba40411441583d35180a2c.
- DTH: 1,985,828 B; 74,119 faces; 40,548 vertices; grounded 8.0 m high. SHA256 d00278ad379b3f9e06ed9b421e694cb9f4310cd7a8a175e5da7aa6a21e62759e.
- Texture atlases filtered to remove micro markings; user-provided visual colors neutralized and baked to glTF COLOR_0 vertex colors. Textures and unnecessary material maps removed.
- Catalog previews generated offline to transparent lightweight WebP. Real-world manufacturer model photographs were not embedded or imported into the runtime.

## Scope of code
- New `dist/chapter/rig-visuals.mjs` for local asset names and cached GLTFLoader scenes.
- M3 original procedural rig visible while GLB loads; after success a new generic RC body replaces the old chassis, retaining the moving carriage/shaft and the pre-existing game object/position/collider.
- M4 DTH GLB appears beside workshop at a static display location (-17.5, -9.3) once purchased/delivered; it moves to the real drill zone when assigned. Only real zone assignment creates collider; no parked ghost collider or save change.
- Catalog thumbnail check uses Image onload/onerror; no broken cards when assets have yet to be staged.
- No new branding. No change to purchase/contract logic, economy, save key, drill IDs, prices or mission progression.

## Remaining release gates
1. DONE: Two optimized GLB and two WebP files imported into GitHub with verified SHA256.
2. DONE: Asset and catalog tests all passed (6/6); browser GLTFLoader loaded both geometry and both thumbnails.
3. Browser-test real geometry and coordinates, desktop/mobile load/performance, 3D animations and collisions across missions.
4. Obtain explicit user approval of the visual result and PR merge; only then deploy.
