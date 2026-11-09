# Decisions Log — DRILL RUN NEXT GENERATION

## 2026-11-09 — M1 informational HUD before narrative acceptance

**User visual bug:** Fresh M1 game shows no objective card because `activeNarrativeMission` returns null while its start message is unread/unaccepted.

**Scoped visual exception:** In `dist/chapter/game.mjs`, display existing objective card for uncollected M1 before acceptance, without accepting mission, claiming rewards or altering narrative engine, existing M2–M4 gates or saved-state semantics. Keep the current rendered obstacle count from `s.cleared/CLEARABLES`. See `CHANGES/2026-11-09_m1-pending-hud-visibility.md`.

## 2026-11-09 — M1 HUD summary presentational exception (User + ChatGPT)

**Reported:** Opening mission summary lacked visible obstacle counts. The underlying game already computes the count; its explanatory element remained hidden from initial HTML and V4 HUD pushed the panel to the right.

**Scoped shared-file exception:** ChatGPT may change only the visual summary display block inside `dist/chapter/game.mjs` (read-only use of `s.cleared` and `CLEARABLES`, no state mutation), and restore presentational left-side layout in `dist/chapter/hud-reference-v4.css`. Preserve narrative gating, mission logic, purchases, save data, and existing objective ids. See `CHANGES/2026-11-09_m1-hud-summary-fix.md`.

## 2026-11-06 — Narrative Reward Deferral (Claude Code)

**Decision:** Mission rewards (M1: 5,000 cash, M2: 35,000 cash + booster) are no longer given immediately upon objective completion. Instead, they are deferred to narrative `confirmCompletion()`, triggered when the player reads the end-of-mission message and presses the confirm button.

**Rationale:** Creates a story-driven experience where rewards feel earned through character interaction rather than appearing automatically. The player must engage with the phone's message system to receive rewards.

**Impact:** `useOfficeComputer()` in state.mjs and `tickHsec()` in hsec/state.mjs no longer directly add cash/boosters. The narrative system handles reward delivery.

## 2026-11-06 — Mission Gating via Narrative (Claude Code)

**Decision:** M3 and M4 auto-start now requires `isMissionAccepted(s, 'mX')` to be true. Players must accept the mission via the narrative message before the mission systems activate.

**Rationale:** Prevents missions from starting before the player has context from the character's briefing message.

**Impact:** `game.mjs` mission start conditions now include narrative acceptance checks.

## 2026-11-06 — Road System: Option B (Claude Code + User)

**Decision:** Use predefined snap routes instead of a free waypoint editor for the road system.

**Rationale:** User-approved decision for simpler, more guided road placement.

## 2026-11-06 — AI Collaboration Structure (Claude Code + User)

**Decision:** Established dual-agent collaboration framework: Claude Code handles functional development, ChatGPT handles visual development. Shared files require coordination via DECISIONS.md.

**Rationale:** Clear ownership boundaries prevent merge conflicts and ensure each agent works within their expertise.

## 2026-11-06 — First ChatGPT Catalog V2 visual pass (User + ChatGPT)

**Decision:** Implement the user's approved visual language on the existing in-game Catalog using CSS-only presentation changes on branch `chatgpt/catalog-v2-visual-first-pass`. Prefer a full-width bottom carousel with category pills, a vertical Catalog identity rail, premium dark/cyan/gold cards and a contextual floating purchase/inspection surface. Preserve the real game renderer as the protagonist.

**Scope:** `dist/chapter/catalog.css` only for application code. Functional JavaScript, purchase events, prices, availability, missions, saves, navigation IDs, source data and the construction hologram behavior remain unchanged. No new product images or fictitious catalogue data. Responsive landscape layout and collapse states must remain usable.

**Integration:** Preview first; merge/deploy to production only after visual review/authorization.

## 2026-11-06 — Use main/production for DRILL RUN game testing (User approval)

**Decision:** The user explicitly chose `main` and the existing Vercel production domain for ongoing iterative tests, rather than temporary preview origins. This preserves browser-origin local save continuity and avoids temporary preview domains failing Firebase OAuth authorized-domain checks. User is the only active tester at this stage.

**Constraints:** Feature work still uses documented branches and commits, then merges to `main` for release after authorization. Verify effects of changes and avoid replacing save data; keep ability to roll back. **Production does not by itself create a Firebase session;** Google login must be functional on the stable domain. Current approval specifically covers deploying the Catalog V2 visual pass via PR #2 to main. No unreviewed gameplay or state migrations are authorized.

## 2026-11-06 — Catalog camera continuity + persistent horizontal category position (User + ChatGPT)

**Decision:** The visual Catalog V2 must not activate a separate builder camera while merely browsing, collapsing, expanding, or changing catalog categories. Preserve the player's current camera mode, framing/orbit and world perspective; the existing specialized overhead builder view remains active only for actual HSEC in-world drafting/placement or managing-office preview.

**User-reported defects:** (a) after collapsing the catalog, the camera shows a bad/new perspective instead of the view the player had, (b) tapping a distant horizontal category such as "Seguridad" resets category navigation scroll back to the beginning.

**Authorized scoped exception to file ownership:** ChatGPT may change only the camera-mode selection line in `dist/chapter/game.mjs` (normally Claude Code owned) as this is a visual-view integration bug directly associated with ChatGPT's catalog work; no other gameplay or business logic may be changed. ChatGPT may modify `dist/chapter/catalog-view.mjs` only to preserve the existing horizontal category scroll across DOM re-renders, without touching data/selection callbacks/purchases. Maintain the same FollowCamera instance; do not create a new camera.

**Rollout:** User explicitly requested direct production on the stable domain via a branch + reviewed PR -> `main`; keep save format, economy, stock, missions and Firebase unchanged. Register changes and actual test outcomes in shared logs.

## 2026-11-06 — Mission 4 economy and DrillTruck notification hotfix (User + ChatGPT)

**User-reported:** DrillTruck automated rounds announce the same toast repeatedly. The available cash becomes disproportionate to mission contract payments; M4 completion also shows all-time passive production income as if it were a new one-off reward.

**Approved exception to ownership:** For this requested hotfix, ChatGPT may change the *specific* M4 money-generation functions (`dist/mission4/production.mjs`, `dist/mission4/offline-progress.mjs`) and `dist/chapter/game.mjs` notification/completion display, with tests. Claude Code retains primary ownership of economy/mission systems and must consult the change log.

**Economic bounds:** passive zone income reduced from 2,500 to 500 per 15-minute cycle at perfect quality/30 m depth; offline catch-up limited to four cycles (one hour) per zone on each return; values from saves clamped to the valid geology/depth range. No historical cash, ledger, save format or rewards from other missions are altered automatically.

**UI:** Remove only the repetitive automatic truck-maintenance dispatch toast. M4 completion reports automation activated rather than treating already credited accumulated income as a brand-new reward. M3 contract payments and real mission cash awards unchanged.

**Safety:** Existing high balances are preserved, not silently recalculated; a retroactive correction would require auditing actual save-ledger entries. Continued tests and changes go to the stable `main`/production domain upon user's approval. Existing save key unchanged.

## 2026-11-06 — Camera distance/zoom and integrated Catalog actions (User + ChatGPT)

**User issues:** the player camera appears too distant and zoom does not work on desktop; automatic-income toasts repeatedly obstruct the game; a floating summary above the Catalog duplicates product cards and displaces the scene. The existing left HUD/panel warrants a separate layout review, but no redesign of unrelated menus is authorized in this scoped release.

**Decision:** Use the normal preset B closer to the player (3.8m, 57° FOV, 18° pitch) instead of the default 5m/60°, retaining prior custom camera preferences and zoom; allow wheel/trackpad scroll on the game canvas, keeping two-finger mobile pinch and camera persistence. Do not modify avatar/world geometry.

**Catalog V2.1:** remove the visual floating inspector from above the dock; present only price, status, and the original Detalles / Comprar / Colocar / Gestionar actions as a compact in-dock right action rail. Hide duplicate large selected-product title/description, while preserving the existing CatalogView DOM, event handlers and disabled/purchase/placement logic. Category selection and collapse behavior must remain intact; phone game world visibility prioritized.

**UI notice:** silence only `incomeGenerated` visual toast in the Mission 4 event loop of `dist/chapter/game.mjs`; keep cash crediting, income ledger, save, UI refresh and other notifications unchanged. Exception to Claude Code's gameplay ownership is limited to that one conditional notification branch, and recorded here for shared coordination.

**Delivery:** Branch `chatgpt/camera-distance-wheel-zoom`, PR to `main`, Vercel automatically deploys to the stable production domain per the user's explicit direction. No save key, mission economy or Firebase changes.

## 2026-11-06 — Iconography V3: mining-native coherent pictograms (User + ChatGPT)

**Feedback:** Current game view is visually overcrowded; user requested a cleaner HUD concept and replacement of the mismatched/generic vector iconography designed earlier. A fresh **visual mockup** was generated for the user's visual review; its layout is **not yet the live HUD** and must not displace existing gameplay controls without explicit design approval.

**Code change approved:** Recreate only the presentation-layer SVG path dictionaries in `dist/chapter/icons.mjs` and `dist/hsec/icons.mjs`, preserving all icon names/keys, helper signatures, CSS class names, 24×24/32×32 viewBoxes, app event bindings and visible text. Emphasize custom coherent 2px rounded-line symbols: hardhat/mining work, coins, cube/catalog, drills, roads, safety signage, barrier, lighting and other HSEC tools. Use the same white/chromatic tokens defined by the current design system, with no external brands, image downloads or additional dependencies. Native Google authentication logo remains untouched.

**Coordination exception:** `dist/chapter/icons.mjs` is Claude Code-owned; user explicitly asked ChatGPT to replace its *drawn SVG paths only*. No game logic, mission state, phone navigation, save formats, purchase prices or UI event handlers may be changed.

**Separate future HUD design review:** Prioritize playable world visibility by reducing duplicated status panels, consolidating top resources, clustering core actions and using progressive disclosure of objectives. Do not claim the newly proposed HUD mockup is already implemented.

## 2026-11-06 — Real-model buildings and faithful 3D Catalog thumbnails (User + ChatGPT)

**User instruction:** implement the complete premium visual direction directly in ChatGPT/GitHub (no other coding agent), prioritizing **actual improved 3D buildings** and thumbnail images that depict the same objects players will really build. Products, machinery and future building SKUs come later after evaluation.

**Scoped implementation:** office shell, workshop, HSEC shed, in-game 3D-to-PNG preview, HUD art stylesheet, desert material/sky and HSEC road decals. The separate world-art report lists exact files. These are visual-only changes; keep original building sizes, footprints, door collisions, mobile inputs, mission states, costs, purchases, available SKUs and existing save format intact.

**Preview integrity:** construct workshop preview from the very same factory with `previewOnly=true` and no world/collider side effects; clone mesh buffers before disposing snapshot contexts; use existing HSEC `assetModel` thumbnails; include actual built level-2 extensions when available rather than substituting AI concept renders.

**Release procedure:** create branch + PR and publish approved visuals to stable `main`/Vercel production, since user is testing the real saved game on that origin. Browser visual acceptance and performance checks remain necessary; do not represent the 2D mockup as guaranteed pixel-perfect 3D output.

## 2026-11-06 — Full visual-overhaul V2 is directly authorized (User + ChatGPT)

The user explicitly directed ChatGPT to rebuild **everything visible in the game**, not only color palettes, including persistent player HUD, name/profile/level, resources, joystick, settings gear, phone, mission objectives/complete overlays, navigation, catalog, world waypoints and 3D lighting halos, plus improved current buildings and future tier distinction. No handoff to another coding agent; push via branch -> PR -> `main` -> stable Vercel production for continued saved-game testing. No further intermediate approvals required for this UI implementation.

**Design:** preserve a consistent high-quality navy/gold/cyan industrial UI with restrained PUMA-red architecture; retain office-original form and existing DRILLCO brand image only in office. Taller L1 must stay a simple credible structure; premium solar/extraction/architecture appears at true level 2.

**Safety:** application logic, saved data/schema, Firebase, purchase/mission/economic calculations, interaction IDs, real colliders and roads unchanged. `dist/chapter/game.mjs` UI-only modification authorized. Any untested visual details remain subject to browser validation and later correction, not false claims of pixel-perfect concept parity.

**Delivery report:** `AI_COLLABORATION/CHANGES/2026-11-06_full-visual-overhaul-v2.md`.

## 2026-11-06 — Vehicle rail correction and visual-only Equipment card consolidation (User + ChatGPT)

**User request:** Restore the left CATÁLOGO rail in Vehículos; use two distinct types of perforadoras in Equipment (exploration/sondaje RC vs production DTH), with short, attractive names. Research real-world 3D reference imagery.

**Scoped shared-file exception:** ChatGPT may adjust the display-only mapping and visibility of rig cards in `dist/chapter/construction-catalog.mjs` without changing drill definitions, product pricing, purchase permission, missions, delivery, contract, save data or state. Existing high-capacity RC owners/pending orders retain visibility via the RC card slot. Other agents should not replace these display names with internal translation keys.

**Brand protection:** In-game machines remain generic unbranded third-party rigs. Manufacturer photos are external modeling references only; DRILLCO® is not represented as selling drill rigs. Equipment nicknames Perforadora RC · Sondaje and Perforadora DTH · Producción are fictional interface names.

**Release:** Feature branch and PR only, production merge requires explicit approval. New GLBs and drilling-data realism review are separate tasks; never infer that DTH production blast holes have an 800 m real-world specification.

## 2026-11-06 — Mandatory brand-approval correction (User)

**Overrides the earlier equipment naming and research proposal:** Never introduce outside manufacturer names, product names, logos, photos, distinctive machine livery or outside product references in DRILL RUN gameplay, user-facing UI, visual mockups, technical sheets, design briefs or assets. Only explicitly user-approved DRILLCO®-associated brand assets may appear. The previously proposed fictional rig nicknames were not approved and are withdrawn. Use neutral descriptive labels for generic unbranded machinery until the user approves names and original appearance. DRILLCO® does not sell the drilling machines, only its authorized drill tools.

**Scope:** Retain a two-type Equipment catalog and the Vehicles identity-rail CSS fix; replace invented nicknames with «Perforadora RC · Sondaje», legacy «Perforadora RC · Alta capacidad» and «Perforadora DTH · Producción». Remove outside-branded modeling references, preserving IDs, orders, economy, missions and state. Production release still requires approval.
