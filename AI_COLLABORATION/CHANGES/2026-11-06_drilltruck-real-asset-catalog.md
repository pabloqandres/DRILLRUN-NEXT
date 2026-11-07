# Catalog Audit — Category 01 · Vehículos → DrillTruck

**Date:** 2026-11-06
**Owner:** ChatGPT, direct implementation in original GitHub repository
**Scope:** Display the exact DRILLTRUCK_optimized.glb in the vehicle catalog, technical sheet and management Phone screen; fix category/HUD icon geometry. No other categories touched for content.

## Root cause
- `dist/assets3d/DRILLTRUCK_optimized.glb` already exists in the repository (1,695,040 bytes).
- `dist/chapter/game.mjs` loads this asset with `GLTFLoader` + `DRACOLoader` to display the purchased DrillTruck in the actual world.
- `dist/chapter/builder-ui.mjs` defined the catalog's `thumbnail` callback only for office modules, workshop and HSEC assets — **not `kind:'vehicle'`**. Accordingly, `CatalogView` fell back to a generic HSEC/vehicles glyph both in the card and in the inline technical sheet.
- `dist/mission4/phone-apps.mjs` rendered a text-only DrillTruck management/purchase screen without any truck photo.
- Category tabs were bare SVGs with varying viewbox optical centers; phone/settings UI carried older contradictory padding/geometry.

## Implementation
1. **One canonical real-asset image service:** New `dist/chapter/drilltruck-image.mjs` loads `DRILLTRUCK_GLB` as defined in the existing `mission4/drilltruck.mjs`, using the same GLTF/DRACO loader pipeline and physical 5m dimension as the gameplay vehicle. The model is rendered at a deliberate three-quarter angle through the existing Three.js `ProductPreview` infrastructure into a transparent PNG, then memoized by one Promise for all UIs. Only a real model is accepted; reject all-transparent frames, never substitute a fake truck. On transient failure, reset cache to allow retry.
2. **Catálogo Vehículos:** `BuilderUI.getDrillTruckThumbnail()` lazily resolves the snapshot on category entry; `CatalogView.render` refreshes in place when the image is ready, preserving category, selected vehicle and horizontal scroll. Loading state is explicit.
3. **Ficha Técnica:** Same `thumbnail(picked)` is used for the expanded technical sheet; visible large hero panel and existing real product facts, no separate forged image.
4. **Phone → DrillTruck:** `renderDrillTruck` now includes a branded-neutral visual hero; `PhoneUI.render('m4-drilltruck')` fills that with the **same cached GLB image**, whether truck is owned or pending.
5. **Icon alignment:** Category icons have equal fixed-width centering boxes. Phone and settings share precise 45px/37px/31px frames at desktop/tablet/compact breakpoints, `display:grid;place-items:center` and fixed SVG size. CSS loaded after V3 and scoped to existing icons and vehicle category, with responsive controls.
6. **Category-specific vehicle layout:** Larger single vehicle card and technical image, aligned summary/CTA, readable labels and consistent mobile handling.

## Safeguards and verified boundaries
- No changes to purchase callbacks, vehicle economic price, existing truck position, save schema, mission progress, inventory, HSEC, collision or game scene asset.
- No official DRILLCO consumable models synthesized. User will provide those as true 3D assets when moving to their categories.
- Isolated JavaScript syntax checks passed for all affected modules. CSS braces balanced. Static regression coverage added in `tests/drilltruck-real-asset-catalog.test.mjs`.
- Live GPU/browser inspection of the rendered vehicle image and final responsive layout is **not yet performed** in this connector workflow. Source-delivery deployment verified after merge, but pixel-quality outcome remains subject to user screenshot acceptance.

## Next category
Only after DrillTruck appearance is accepted, audit Equipo → machinery, with its own real asset source, card/technical sheet/management image and CTA consistency. Avoid generic cross-category cosmetics.
