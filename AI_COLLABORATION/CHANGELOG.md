# Changelog — DRILL RUN NEXT GENERATION

## 2026-11-09 — M1 HUD panel shown before phone acceptance

- Corrects missing entire M1 objective card when start message hasn't yet been accepted; still shows true obstacle progress and requires narrative acceptance for mission rewards. No saved-state changes.
- V8 syntax and static assertions passed; browser visual verification pending. See `CHANGES/2026-11-09_m1-pending-hud-visibility.md`.

## 2026-11-09 — Mission 1 obstacle HUD summary restored

- M1 objective card now reveals live obstacle removal count/total and description; left-side position and legibility fixed without changing mission state/economy/save schema.
- Syntax and CSS balance checks passed; live browser test pending. See `CHANGES/2026-11-09_m1-hud-summary-fix.md`.

## 2026-11-09 — Office L1 visible detail V6

- Decorative, non-colliding fascia caps, rivets, rear air intake and service marker lenses added to real level-1 office. Preserves PUMA burgundy and original doors/geometry/upgrade gating.
- V8 module syntax checked, browser WebGL acceptance pending. See `CHANGES/2026-11-09_office-l1-v6.md`.

## 2026-11-09 — World materials V5 (ChatGPT)

- Enhanced procedural Atacama ground striation with muted wind abrasion and texture filtering; added flush concrete pad joints, mineral streaks and edge wear to actual 3D world surfaces.
- Visual-only; building footprints, HSEC, economy, collisions, saves and mission flow unchanged. Module syntax checked; live WebGL QA pending.
- See `CHANGES/2026-11-09_world-materials-v5.md`.


## 2026-11-09 — Atacama atmosphere V5 (ChatGPT)

- New high-resolution procedural sky gradient with subtle mineral horizon haze and broadly distributed deterministic ambient wind dust; visual-only in `dist/graphics/atmosphere.mjs`.
- Existing quality presets and game behavior unchanged; browser/WebGL acceptance pending. See `CHANGES/2026-11-09_atacama-atmosphere-v5.md`.


## 2026-11-07 — Avatar 02/03/04 intro videos (Claude Code)

### Added
- `dist/cinematics/avatar02-intro.mp4` (4.8 MB), `avatar03-intro.mp4` (15 MB), `avatar04-intro.mp4` (14 MB)
- All 4 avatars now have dedicated intro cinematics (no more shared fallback for Avatar 3)

### Changed
- `dist/chapter/config.mjs`: `AVATAR_INTRO_VIDEOS` maps operator03 to dedicated video
- `tests/new-game-stability.test.mjs`: Updated avatar intro test expectations

### Closed
- PR #33 (ChatGPT) superseded by PR #35 (Claude Code) which includes config changes + binary uploads
- PR #35 merged to main, deployed to Vercel production `dpl_7utw3MPTofuibqqBKbamztafD4RM`
- All 4 MP4s verified HTTP 200 on production

## 2026-11-06 — Vehículos identity rail + two-machine Equipment presentation

- Vehicles-specific CSS override formerly replaced the Catalog identity-rail 144px left inset with 14px, visually covering the side brand; preserve 144px and 101px in compact media queries, leaving the larger DrillTruck card intact.
- Equipment Catalog now presents two primary machines: **Perforadora RC · Sondaje** (exploration) and **Perforadora DTH · Producción** (production), without exposing internal camelCase keys. Existing RC high-capacity saves/orders show **Perforadora RC · Alta capacidad** in the same RC slot.
- RC and DTH catalog data definitions, economics, prices, purchase/management callbacks, inventory, missions and saves are unchanged. Rig design briefs contain no external manufacturer references, photos or logos.
- Focused regression tests passed; runtime data projection confirmed 2 equipment cards in new and advanced-owner/order states. Browser computed rail positioning matched Equipos at 1440×900, 800×480 and 375×700 (no overlap). Visual testing on real game still pending. See `CHANGES/2026-11-06_catalog-equipment-rigs-layout.md`.

## 2026-11-06 — Category audit 01: DrillTruck genuine 3D asset image

- **Root cause fixed:** Catalog thumbnail callback previously ignored vehicle products, so DrillTruck card and technical sheet always showed icon fallback despite its 1.7 MB GLB already being in assets.
- New cached service loads `DRILLTRUCK_optimized.glb` with GLTF/DRACO exactly as the live vehicle does; 5 m standardized model, 3/4 transparent snapshot using existing ProductPreview. Reject blank images and retry transient errors.
- **Same image** in Vehicles card, expanded Ficha Técnica and M4 Phone management/purchase hero. Vehicle panel gains appropriately larger product/card hero and compact responsive layouts.
- Consistent icon-holder sizing in category tabs plus precise phone/settings SVG centering; no generic substitute images, no invented logos.
- No gameplay, inventory, economics, mission progression, real GLB, colliders or saved state changes.
- Regression suite `tests/drilltruck-real-asset-catalog.test.mjs`; details in `CHANGES/2026-11-06_drilltruck-real-asset-catalog.md`. Runtime screenshot to be confirmed post-deploy.

## 2026-11-06 — Cinematic World Art V4 (ChatGPT)

- Real 3D visual upgrades: shared concrete mineral wear maps, construction-pad joints, soft contact AO beneath office/workshop, warmer entry luminaires and workshop drainage/threshold details.
- Original PUMA-red office remains; advanced rooftop machinery now truly hidden at office L1 and shown at L2, including real-model Catalog thumbnails; roof batching keeps the two level appearances separate.
- Atacama terrain desaturated to natural mineral hues, richer micro-normal relief, low-poly instanced exterior yard stones, richer atmospheric dust. Low graphics disables decorative scatter.
- Day/night fog and environmental lighting harmonized with the existing HSEC clock, without changing safety score or timelines.
- No new collider, building, inventory, cash, save schema, mission or equipment brand assets.
- Static regression suite `tests/world-art-v4-regression.test.mjs` plus Vercel source validation required after merge. Full live WebGL/device visual testing still outstanding.
- Detail: `CHANGES/2026-11-06_cinematic-world-art-v4.md`.

## 2026-11-06 — Visual V3: true HUD components, roads, Atacama, rig imagery and crew portraits

- Replaced legacy profile/mission DOM grouping with actual joint avatar/level card and structured mission header/status/progress/footer. Added simplified joystick CSS and final cascade correction for previously absolutely positioned resources. Original input/movement logic intact.
- Added instanced sediment stones/windrows beyond operating boundary; true constructed HSEC roads now paint directional wheel wear and deterministic non-flickering grain.
- Casa Matriz's two RC rigs now display actual render snapshots of the in-world procedural 3D models; no fabricated DRILLCO hammer/bit previews.
- Personnel hiring and roster show original, differentiated illustrated PPE portraits for each worker role; complete 3D hired NPCs remain future scope.
- Parallel PR #12 eliminated invisible delivery-truck collision at (0,0) and is live. V3 must retain it.
- Regression suite: `tests/world-art-v3-regression.test.mjs`. Detailed change record: `CHANGES/2026-11-06_visual-world-hud-v3.md`. Browser acceptance pending.

## 2026-11-06 — Full visual overhaul V2 (ChatGPT)

- New `dist/chapter/visual-overhaul-v2.css` linked after older styles: complete consistent HUD, profile/level/resource/status design, physical-looking joystick, settings gear, interaction button, mission UI/overlays, phone/apps, placement, HSEC and Catalog.
- Six real functional bottom nav destinations shown throughout gameplay and correctly routed to current game/phone/HSEC actions, including completed missions. No purchases or saved state modified.
- Objective halos now include actual animated Three.js ground rings and upgraded HUD distance badges; all original goal positions preserved.
- Workshop L1 retains simple functionality; level-2 solar/extraction roof and new PUMA-red advanced-bay architectural details activate at real upgrade level. Catalog thumbnails render the correct real L1/L2 variant using isolated factory geometries.
- Regression tests `tests/full-visual-overhaul-v2.test.mjs`; JS syntax checks and stylesheet balance pass. Full browser/gamepad tests are a separate post-deploy gate.
- Full report: `CHANGES/2026-11-06_full-visual-overhaul-v2.md`.

## 2026-11-06 — Restore PUMA burgundy and remove invisible workshop parking wall (ChatGPT)

- User spotted an impassable, apparently empty approach between buildings; workshop level 2 had an unconditional 3.8×2.6m collider over an open parking bay. Remove this stale/phantom `_workshopNv2` blocker while preserving all real workshop/HSEC wall colliders.
- Restore the office's originally preferred PUMA burgundy and warm cladding; apply corresponding red accents to workshop and HSEC shed.
- New isolated regression test validates external approach, front door, retained real walls, old ghost AABB and no ghost re-addition. Actual World.isBlocked harness: 6/6 PASS. Full browser smoke test remains pending.
- **Architectural approvals:** newly generated visual reference concepts are *not* implemented meshes; extensive office stair/rack/railing and complete HUD redesign remain pending user visual approval.
- Report: `CHANGES/2026-11-06_puma-office-workshop-collider-hotfix.md`.

## 2026-11-06 — World Art V1: actual buildings and matching Catalog 3D cutouts (ChatGPT)

- The office, workshop and HSEC maintenance shed have physically upgraded 3D facades, roof/detail assemblies and industrial finish materials. Original world positions, footprints, doors, HSEC walls, missions and saves unchanged.
- Catalog thumbnails now render the **same model factory and, when present, L2 extensions** used by the playable world; workshop snapshot geometry is cloned to protect live renderer buffers.
- HUD first polish in `chapter/world-art-v1.css` loaded after existing styles. Warm desert sky, terrain sediment variation and softer road/shoulder decals improve overall coherence.
- Added Node regression suite `tests/world-art-regression.test.mjs`; direct isolated workshop-model checks PASS (preview creates no world/collider changes). Full live WebGL + mobile performance testing remains pending.
- This is a **first real-code art pass**, not a claim of exact pixel identity with the cinematic reference image or implementation of future catalog products.
- Detailed report: `CHANGES/2026-11-06_world-art-real-building-previews.md`.

## 2026-11-06 — Camera zoom + Catalog inline actions + iconography V3 (ChatGPT)

- Branch: `chatgpt/camera-distance-wheel-zoom`. Production release after user authorization and verification.
- Camera: closer 3.8m default preset B, preserved original zoom preferences, adds wheel/trackpad zoom and retains mobile pinch.
- Catalog: no floating duplicate selected-product inspector. The real action buttons/price/status now live inside the Catalog dock.
- M4: no repetitive "Ingreso automatizado recibido" toast; funds and history still credit as before.
- Iconography: new SVG path family for 39 core icon keys (including unchanged Google logo) and 13 HSEC categories; no external image/font dependencies, IDs/handlers unchanged.
- Tests added for zoom, settings migration and icon coverage; direct function-level checks passed. Full `npm test` and browser UX testing not run.
- **HUD layout:** a less crowded visual mockup was generated **for review only**; not integrated into game code.
- Full record: `CHANGES/2026-11-06_chatgpt_camera-icons-hud-concept.md`.

## 2026-11-06 — Hotfix Catálogo + DrillTruck + Economía M4 (ChatGPT)

- **Branch:** `chatgpt/catalog-camera-and-category-scroll-fix`.
- Files: `dist/chapter/game.mjs`, `dist/chapter/catalog-view.mjs`, `dist/mission4/production.mjs`, `dist/mission4/offline-progress.mjs`, `tests/mission4-economy.test.mjs`.
- Camera: preserve player view when opening, collapsing and switching Catalog. Special builder camera only for real HSEC placement and office management.
- Category tabs: preserve horizontal scroll and reveal selected category (e.g., Seguridad).
- DrillTruck: silence repeated automatic maintenance round toast without stopping truck operation.
- Passive income: max 500 per 15-minute zone cycle (formerly 2,500), cap catch-up to four cycles per zone per offline session, clamp geology/depth. **No retroactive changes to saved cash or ledger.**
- M4 completion now describes automation activated; historical passive income no longer masquerades as a new cash reward.
- Regression test file added. Direct execution of updated economic module functions in isolated JavaScript assertions **passed**; full `npm test` and interactive gameplay testing remain unexecuted.
- Detailed change record: `CHANGES/2026-11-06_chatgpt_catalog-camera-truck-economy-fix.md`.

## 2026-11-06 — Catálogo V2: first in-game visual pass (ChatGPT)

### Preview verified; user subsequently authorized production testing
- Branch: `chatgpt/catalog-v2-visual-first-pass` (based on `main` `77c4c33`).
- `dist/chapter/catalog.css`: CSS-only design update, preserving original catalog handlers and economy.
- Layout: bottom horizontal asset dock, left identity rail, dark blue/cyan/gold tabs, floating selected product panel, responsive landscape and collapse states.
- CSS code commit: `03f3e672`; Vercel preview `dpl_98Sdej3RypL5i1T1p3CmUes8YKCf` READY.
- Validated: HTTP 200 preview stylesheet, visual CSS marker present, original CSS remains unchanged as prefix, braces balanced.
- **Not independently tested:** rendered UI in a browser or purchase/gameplay interactions.
- Detailed report: `CHANGES/2026-11-06_chatgpt_catalog-v2-visual.md`. User authorized merge to main for testing on stable production domain; browser interaction smoke test remains pending.

## 2026-11-06 — Collaboration protocol documentation hardening (ChatGPT)

### Documentation-only, pending review
- Branch: `chatgpt/collaboration-protocol-hardening`
- Changed: `CLAUDE.md`, `AGENTS.md`, `AI_COLLABORATION/RULES.md`, `AI_COLLABORATION/CURRENT_STATE.md`, `AI_COLLABORATION/CHANGELOG.md`, `AI_COLLABORATION/ACTIVE_WORK.md`, `README.md`; added `AI_COLLABORATION/CHANGES/2026-11-06_chatgpt_collaboration-audit.md`.
- Clarified mandatory pre-edit reading, protected branches and approval gate, safer local instructions, actual deployment provenance and versioned audit trail.
- Verification: inspected GitHub repository/docs/commits and Vercel project/deployment metadata; **no gameplay tests run** because no runtime source files were changed.
- No Vercel deployment or production edit performed. Commit and PR references are available through the branch history and PR once opened.

## 2026-11-06 — Narrative Mission Flow System (Claude Code)

### Added
- **Narrative engine** (`narrative.mjs`): Declarative mission narratives with characters, message delivery, acceptance, reward confirmation, save migration
- **Narrative UI** (`narrative-ui.mjs`): Phone conversation rendering with contact list, message threads, typing animation (25ms/char, tap to skip)
- **Narrative strings** (`narrative-strings.mjs`): All narrative i18n strings for 5 languages (es, en, pt, it, zh-Hant)
- **Character avatars** in `icons.mjs`: Elena Torres (briefcase/gold), Marco Salazar (shield/mint), Camila Reyes (clipboard/warm)
- **Narrative CSS** in `premium.css`: Contact cards, conversation threads, message bubbles, action buttons, typing cursor

### Changed
- **state.mjs**: Added narrative field to `newGame()`, narrative migration in `restore()`, deferred M1 reward in `useOfficeComputer()`
- **game.mjs**: Added narrative tick in frame loop, narrative action handlers, mission gates behind narrative acceptance, deferred M1/M2 completion modals
- **phone-ui.mjs**: Rewrote `renderMessages()` for narrative contact list + conversation UI with typing animation
- **ui-state.mjs**: Added `totalUnread()` combining legacy + narrative unreads
- **hsec/state.mjs**: Deferred M2 reward (35,000 + booster) to narrative confirmation
- **i18n.mjs**: Integrated narrative strings

## 2026-11-06 — Touch Scroll Fix (Claude Code)

### Fixed
- Touch scrolling broken across entire game due to `body { touch-action: none }` inheritance
- Added `touch-action: pan-y` / `pan-x` to all scrollable containers across 6 CSS files:
  - `premium.css`, `premium-v2.css`, `builder-refresh.css`, `catalog.css`, `hsec.css`

## 2026-11-06 — GitHub + Vercel Setup (Claude Code)

### Added
- Git repository initialized and pushed to https://github.com/pabloqandres/DRILLRUN-NEXT
- Vercel deployment configured
- `.gitignore` with node_modules, .env, .DS_Store, macOS resource forks

## 2026-11-06 — AI Collaboration Infrastructure (Claude Code)

### Added
- `AI_COLLABORATION/` directory with RULES.md, CURRENT_STATE.md, CHANGELOG.md, COMPONENT_OWNERSHIP.md, DESIGN_SYSTEM.md, ACTIVE_WORK.md, DECISIONS.md, CHANGES/
- `CLAUDE.md` — Claude Code entry point
- `AGENTS.md` — ChatGPT entry point
