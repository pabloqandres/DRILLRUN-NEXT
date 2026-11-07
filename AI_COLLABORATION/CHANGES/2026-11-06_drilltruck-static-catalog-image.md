# DrillTruck — static catalog image optimization

**Date:** 2026-11-06  
**Owner:** ChatGPT (visual assets)  
**Release:** Feature branch / PR only; no production change without approval.

## User request
The DrillTruck image in Catálogo takes too long to appear. Use a regular image, not a live 3D model/preview, while preserving the original 3D truck during gameplay.

## Implementation
- Captured the **original** `dist/assets3d/DRILLTRUCK_optimized.glb` using the existing Three.js ProductPreview render in an isolated offline browser; exported a transparent 387 × 383 WebP (`dist/assets/catalog/drilltruck.webp`, 15,746 bytes).
- Replaced `dist/chapter/drilltruck-image.mjs` with a constant URL and already-resolved Promise to preserve the existing caller API. No GLTFLoader, DRACOLoader, renderer, decoder or screenshot generation runs when opening the catalog or technical sheet.
- The existing Builder UI and Phone UI consume that same image URL unmodified. The real 3D model in the world, purchase flow, inventory, economy, missions, and saves stay untouched.
- Replaced the prior tests of GLB-at-runtime generation with static asset/API and gameplay-boundary tests.

## Verification
- Headless browser captured the real truck successfully and WebP file validated (RIFF/WEBP, nonzero image and alpha).
- Node syntax and focused regression tests: 3/3 passed.
- No pixel inspection on the user's device. Functional QA in preview and user's visual acceptance remain required.
