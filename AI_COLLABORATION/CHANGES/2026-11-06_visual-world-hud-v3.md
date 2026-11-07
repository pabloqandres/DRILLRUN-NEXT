# DRILL RUN NEXT GENERATION — Visual World & HUD V3

Date: 2026-11-06
Owner: ChatGPT (direct implementation)
Branch: `chatgpt/world-art-v3-terrain-roads-workshop`
Goal: correct visual inconsistencies reported after V2, improve the actual desert/roads and show truthful equipment artwork while preserving existing saves.

## Delivered in executable code

- **HUD V3 structural redesign:** `dist/index.html` now nests the *live player avatar and level* into one coherent profile component, with portrait frame and online indicator. Mission panel has *real* header/status, glyph/title, goal/detail, progress and footer markup. `dist/chapter/game.mjs` binds the status to actual active/completed mission state. No old DOM IDs or gameplay events removed.
- **Simpler joystick:** `dist/chapter/visual-overhaul-v3.css` removes complex layered markings, dotted ring, compass/engraving and sphere effects; retains the same real pointer input and camera/movement handlers.
- **Mobile/landscape:** new CSS loaded last to override contradictory positioning from legacy styles. Fixes `.resources` from legacy `position:absolute;left:50%` to intended grid, and returns level into the profile.
- **World terrain:** `dist/graphics/desert.mjs` adds two deterministic low-cost instanced-mesh layers: alluvial stones and wind-shaped silt outside operational yard bounds, no new colliders or terrain height edits.
- **Roads:** `dist/hsec/world.mjs` paints soft tire-wear grooves over actual constructed vehicle routes, matching their points and corners. Road texture grain now deterministic and does not flicker when HSEC changes.
- **Real RC rig photos from playable 3D (not generative substitute):** `rcDrillThumbnail(world,drillId)` in `dist/chapter/product-preview.mjs` uses the same `createDrillModel()` factory as gameplay for transparent WebGL cutouts; cached per rig in `PhoneUI`. `dist/mission3/phone-apps.mjs` uses these true model renders in Casa Matriz's compact/advanced rig cards and owned-rig listing. Official DRILLCO/PUMA hammers/bits remain placeholders until the user supplies their actual GLBs. **Do not fake those.**
- **Hiring portraits:** new `dist/chapter/crew-portraits.mjs` produces distinct original vector worker headshots for admin, drilling operator, helpers, HSEC, temporary technical consultant, DRILLCO technician, all with proper white PPE helmets and orange reflective vests; integrated into Mission 3 staff and hiring cards. These are UI portraits, **not yet full new in-world 3D NPC models**.

## Prior emergency correction (already in production)

PR #12 `d529ceb96e51d4698828e025ac3333dd70fafc53` fixed the **invisible Mission 3 supply truck collider** created at (0,0) in the route between office and maintenance. This branch originated before the hotfix, but PR merge must preserve both the hotfix and V3; verify the final production `game.mjs` contains `truckPresent` AND `missionStage` markers.

## Safety

No changes to persistent save keys, cash, mission progression rules, purchasing logic, inventory, network HSEC scoring, avatar collision sizes or the actual workshop/office footprint. The previously approved PUMA office and L2 workshop art remain unchanged. Artwork remains authored assets within the game, not pixel-perfect recreation of an illustration.

## QA

- All changed JS modules plus new regression tests passed isolated JavaScript syntax checks.
- V3 CSS balanced; actual HTML links it after all previous design sheets.
- Static UI, level, mission state, 3D rig cutout, crew art, terrain scatter and road design checks passed.
- New `tests/world-art-v3-regression.test.mjs` provides regression coverage for these contracts.
- Full `npm test`, live browser WebGL/portrait rendering and user save camera screenshots not yet run in current connectors.
- Production Vercel deployment and code markers must be verified after merging.
