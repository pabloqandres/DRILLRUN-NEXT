# Visual hotfix: camera, catalog, iconography V3 + HUD design direction

**Date:** 2026-11-06
**Agent:** ChatGPT
**Branch:** `chatgpt/camera-distance-wheel-zoom`
**User requests:** closer player camera with working zoom; remove redundant floating Catalog summary (keep functional buttons inside Catalog); silence repetitive automatic-income toast; propose less crowded play HUD; replace old inconsistent vector iconography throughout game.

## Implemented code (existing game)
- `dist/camera/config.mjs`: preset B from 5m/60° to 3.8m/57° (18° pitch unchanged). Settings version 2; migration reads prior version 1 and only replaces untouched default B distance/FOV, retaining custom choices and saved zoom.
- `dist/camera/gestures.mjs`: add `wheel` handler to renderer canvas for mouse wheel/trackpad; zoom direction clamped, `preventDefault` and persist via existing `onEnd`. Preserves two-finger touch gesture.
- `dist/chapter/catalog.css`: remove Catalog's free-floating inspector by returning the existing summary to the bottom dock as a compact right action rail with real price/status and original Detalles/Comprar/Colocar/Gestionar buttons. Duplicate long title/description hidden; do not modify purchase callbacks, product categories or pricing.
- `dist/chapter/game.mjs`: remove **only** the `incomeGenerated` toast. Event still credits cash in `production.mjs`, updates ledger, saves and refreshes the game; other notices remain.
- `dist/chapter/icons.mjs`: replace 38 generic hand-drawn SVG glyphs and keep branded Google auth icon, same names/function signatures; unify 24×24, ~2px rounded stroke, original custom mine/build/safety pictograms. Preserve worker avatar and narrative characters.
- `dist/hsec/icons.mjs`: replace all 13 HSEC/builder pictograms with coordinated 32×32 icons, keep labels, IDs, category/scoring data, colors and function signatures.
- Added regression tests `tests/camera-zoom.test.mjs` and `tests/iconography-v3.test.mjs`.

## Concept visual only — NOT implemented in live HUD
A proposed more readable landscape screen was generated from the user's screenshot to discuss a redesigned HUD: one clear primary objective, compact top status, consistent icon navigation and more unobstructed 3D world. This is a visual proposal, not a claim that the actual HUD CSS and underlying interactions have been rebuilt. Do not implement the new HUD layout until approved.

## Constraints
- No state migrations, character changes, currency alterations, mission logic, Firebase changes, avatar model changes, or external fonts/icons/libraries.
- Respect user directive to ship approved functional fixes to `main`/stable production domain after PR, with verified Vercel provenance.
- New icon system includes meaningful original domain glyphs; the Google logo remains official.
- Verify all existing touch and button controls in browser; no interactive browser run performed from connector-only environment.

## Checks actually performed
- Ran original `camera/config.mjs` + `camera/gestures.mjs` functions in isolated JavaScript with five assertions: closer default, legacy preference migration, preservation of custom settings, wheel zoom/persistence and touch pinch. All PASS.
- Executed original updated `icons.mjs` + `hsec/icons.mjs` functions in isolated JS. All 39 core icon keys, 9 HSEC builder categories and three narrative avatars produced their SVG output; Google brand path preserved. PASS.
- Checked Catalog CSS brace balance (0) and that no original CSS was removed; appended override rules.
- Verified the `incomeGenerated` notice branch was removed in game.mjs, without changing the economic crediting modules.
- **Not run:** full `npm test`, screenshot visual QA in browser, physical device responsiveness, or production smoke test until the merge.

## Follow-up
1. Merge PR on user authorization.
2. Verify new production SHA and served source/manifest.
3. User reviews visual HUD concept before implementing broader layout; user tests wheel/pinch, camera framing, Catalog inline actions and icon legibility.

## Production deployment verified

- PR #5 merged into `main` as `ecd61a3e40586a9bfa690e21e1e11cd86951310d`.
- Vercel `dpl_B3tCwvYm7khDXaKApocH8RyoByQT` READY, production, exact matching SHA.
- All six changed production source files and `/manifest.json` served HTTP 200 with expected new markers; no browser smoke test or full npm suite.
- User still needs to review the **separate** overall HUD layout concept; only the SVG iconography and previously requested point fixes were released.
