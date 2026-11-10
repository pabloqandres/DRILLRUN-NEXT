# Decisions Log — DRILL RUN NEXT GENERATION

## 2026-11-10 — V48 Desfase traslado DTH y estado visual

Diagnóstico del usuario: la DTH figura «Cambiando de punto» sin
desplazarse. El reloj lógico dura 12 s pero el visual usa un lerp
exponencial que llega mucho antes. Reabrir partida durante el viaje
hace nacer el modelo ya en destino. Reparación acotada M4 en
`dist/mission4/production.mjs`, `rig-inspection.mjs`,
`dist/chapter/game.mjs` y nueva función de sólo lectura
`dist/mission4/dth-travel.mjs`. Solo sincronizar posición visual,
origen guardado y ETA; no tocar economía, producción, desgaste,
tiempos ni historial. Ver
`CHANGES/2026-11-10_v48-dth-transfer-visual-sync.md`.

## 2026-11-10 — V47 Home refleja la misión activa + HUD M5 compacto

**Solicitud directa del usuario:** realizar la corrección y publicarla
en el juego, no crear un prompt para otro agente. En la pantalla de
inicio M4 persistía aunque M5 estaba aceptada; la tarjeta checklist
interfería con joystick en móvil.
Se autoriza edición acotada de `dist/chapter/game.mjs` para integrar
`getCurrentMissionCard(s)` como fuente única de portada y estado
del jugador, y de CSS/renderer de misión para mostrar solo paso
actual y siguiente. Vista completa sigue en teléfono.
No modificar pagos, progreso, compras, producción, HSEC ni save schema.
Publicar V47 desde rama → PR → main → Vercel producción tras CI M5.
Detalle: `CHANGES/2026-11-10_v47-live-mission-home-compact-hud.md`.

## 2026-11-10 — V46 M5 checklist y bono de puesta en servicio

**Aprobación del usuario:** al ver M5 con progreso 0/5 sin objetivos visibles,
pidió pasos secuenciales y aprobó bono único de 🪙 12.000.
Excepción de propiedad acotada: ChatGPT realiza solo la UI de M5 en
`dist/chapter/game.mjs`, la declaración de recompensa en
`dist/chapter/narrative.mjs` y las guardas de orden en
`dist/mission5/patio-staff.mjs`; M1–M4 quedan intactas.
HUD y teléfono leerán `mission5Readout` como fuente única.
Inversión Patio y pagos actuales, M4, HSEC y guardado se conservan.
Bono exclusivo al confirmar cierre narrativo, con ledger único.
Implementación en `chatgpt/m5-checklist-reward-v46` y PR, no main
ni producción sin aprobación de publicación.
Ver `CHANGES/2026-11-10_m5-live-checklist-reward-v46.md`.

## 2026-11-09 — V25 first-cycle timer and persistent M4 machinery

**User reported:** M4 first cycle had no visible countdown, uncertain fate of DTH after completion, RC parked under raised terrain, cropped DrillTruck image, notification TypeError, and 3/6 zones despite three sites. The right-side counter now reads persisted zone.lastCycleAt/actual 900-second production period, never a fabricated countdown. On first income, M4 mission can be confirmed while DTH remains assigned and production/income cycles continue. Existing RC/DTH staging moved entirely into flat parcel; no M5 yard invented. Cross-owner targeted UI and production read-only helpers by ChatGPT under user's direct-build request. See CHANGES/2026-11-09_m4-visual-cycle-v25.md.

## 2026-11-09 — V24 direct M4 functional audit and user-requested operational repairs

**User direct instruction:** Audit and simplify M4 because even the game creator cannot navigate purchases, stock, DTH location, installation or deployment. Coordination scope: ChatGPT may modify targeted Claude-owned mission4/mission4-state.mjs, drills-dth.mjs, maintenance.mjs, phone-apps.mjs, mission3/phone-apps.mjs, chapter/phone-ui.mjs and game.mjs only for the specifically documented M4 workflow. New graphics and CSS remain ChatGPT-owned. Preserve M1–M3 economics, all purchases, save identities and M4 price values. Full GLB production assets are not used until mobile optimization and binary transfer are feasible; use branded-free generic provisional DTH. Future M5 secure equipment yard remains a specification, not a hidden auto-build or a replacement for real HSEC requirements. See CHANGES/2026-11-09_mission4-audit-operational-flow-v24.md.

## 2026-11-09 — V23 non-economic order ETA and Casa Matriz layout repair

User screenshots confirmed final-minute delivery ETA always said 1 minute, and Casa Matriz was distorted. Changed only shared read-only ETA formatting and phone-scoped CSS/markup plus one-second re-render in existing game loop; no actual dispatch durations, purchases, or saved data changed. Controlled scoping avoids changing unrelated phone applications. See CHANGES/2026-11-09_order-eta-and-casa-matriz-v23.md.

## 2026-11-09 — V22 workshop accelerator economy fix

**User issue:** Repeated workshop-acceleration clicks finish a 5-minute upgrade without consuming their single booster. ChatGPT applies tightly scoped user-requested economy bug fix in Claude-owned dist/mission3/inventory.mjs and workshop UI handler in dist/chapter/game.mjs. Every acceleration must atomically spend exactly one booster, reduce by up to 60 seconds and immediately update HUD; no balance means no time reduction. Existing save and already-finished upgrades unchanged. See CHANGES/2026-11-09_workshop-boost-v22.md.

## 2026-11-09 — V21 direct game-loop bug fix, M3 message + workshop obstruction UI

**User issue:** Paid M3 contract never auto-opened Camila's closing phone SMS; workshop expansion falsely reported many invisible light poles. Narrow Claude-owned game.mjs changes explicitly under user direct-implementation instruction: deliver/open only m3 end message immediately and recover unread already-delivered saves without a second payout; replace erroneous render-mesh classification with read-only real built HSEC positions. No modifications to mission economic predicates, gameplay scoring or saved data. See CHANGES/2026-11-09_m3-closing-workshop-posts-v21.md.

## 2026-11-09 — Cross-owner V20 floating point bug in mission engine

**User issue:** Screenshot shows 3/3 boreholes, 90/90 m, M3 11/13, stuck waiting for Validate Metrage, countdown at 00:00. Root cause reproduced: summing (3000/3600) across three boreholes can yield 89.99999999999997. ChatGPT narrowly updates Claude-owned dist/mission3/contracts.mjs to normalize physical completion, recognize legacy near-exact finished saves, and calculate speed bonus at physical drill completion. In dist/chapter/game.mjs the existing timer only changes display behavior to READY after true completion. No mission sequence, economy amounts, real drilling productivity or save migration altered. User previously authorized direct work in-game; coordinate merging this targeted fix before concurrent Claude mission changes. See CHANGES/2026-11-09_m3-meter-precision-v20.md.

## 2026-11-09 — V19 UI input ownership and same-app scroll restoration

**User request:** Direct repair of phone scroll blocking and resets after buying a bit, stuck keyboard controls, clipped Casa Matriz previews, loud footsteps and dark shed interior. ChatGPT modifies only rendering, UI input focus, art and audio code, including narrowly scoped input handling in Claude-owned dist/chapter/game.mjs. The same phone app preserves scrollTop on redraw; navigation resets it. V16 approved checklist and gameplay logic remain unchanged. See CHANGES/2026-11-09_phone-scroll-input-v19.md.

## 2026-11-09 — Procedural worksite audio/visuals, narrow game-loop integration

**User instruction:** After publishing V17 HSEC, implement a major original graphics and sound upgrade: footsteps on concrete/gravel, active rig and moving DrillTruck sound, contextual workshop/office acoustics. ChatGPT owns new `dist/audio/worksite-audio.mjs`, `dist/graphics/site-cinematics.mjs` and graphics sources; it adds narrowly scoped initialization, preference-toggle, and read-only per-frame calls into Claude-owned `dist/chapter/game.mjs`. No mission progression, saved data, economy, HSEC scoring, purchase asset or physics logic changes. No new third-party trademarks/audio assets. V16 checklists and V17 HSEC remain unchanged. See `CHANGES/2026-11-09_immersive-atacama-v18.md`.

## 2026-11-09 — Existing HSEC button relocation into header

**User request:** Put the floating HSEC badge in the upper bar between resources and phone. ChatGPT moves the same `#hsecInline` element in shared `dist/index.html`, preserving ID and click bindings; CSS only in ChatGPT-owned `dist/chapter/hud-reference-v4.css`. No scripts changed. Read-only indicator appears after M2 completion as before. M2/M3 checklist V16 accepted by user; no checklist or gameplay edits. See `CHANGES/2026-11-09_hsec-top-header-v17.md`.

## 2026-11-09 — Shared mission status presentation, no progress logic changes

**User instruction:** Fix misleading M3 left mission panel and contradictory phone objectives; the left panel and details must reflect exactly the same live checklist and the next missing step (e.g. drilling rig not yet purchased). ChatGPT may modify only the M3 and M2 *rendering* sections in Claude-owned `dist/chapter/game.mjs`, and M3 objectives rendering in `dist/mission3/phone-apps.mjs`; source-of-truth engine `mission3-state.mjs`, M2 state, economy, asset purchases, and save files remain untouched. Shared pure readout modules avoid parallel duplicated progress logic. Full details `CHANGES/2026-11-09_live-mission-checklists-v16.md`.

## 2026-11-09 — Camera-only hookup in Claude-owned gameplay loop

**User authorization:** Directly fix limited construction zoom, strange aerial movement and camera entering buildings. ChatGPT modifies the camera renderer (`dist/camera/follow-camera.mjs`) and just the existing world gesture handler and existing game-frame camera dispatch in `dist/chapter/game.mjs`. This does not touch movement/mission logic beyond dispatching the same joystick to camera-only pan while HSEC placing is active; the joystick continues moving the character in ordinary exploration. Review in `CHANGES/2026-11-09_builder-camera-navigation-v15.md`. Any concurrent Claude changes to `game.mjs` must be reconciled before merge; no broad refactoring authorized.

## 2026-11-09 — Shared HTML visual HSEC relocation

**User instruction:** Compact the HSEC score and move geologic progress to the right to avoid mission-panel collisions. **Coordination scope:** ChatGPT moves only the existing `#hsecInline` DOM button one level out of `#objective` within `#hud` in `dist/index.html`, while retaining its ID and bound event handlers, and applies visual overrides in `dist/chapter/hud-reference-v4.css`. No change to HSEC scoring or mission logic; Claude Code integrations accessing `#hsecInline` by ID continue unchanged. See `CHANGES/2026-11-09_hud-right-rail-v13.md`.

## 2026-11-09 — HSEC visual crossing and maintenance light correction

**User report:** crossing asphalt and zebra geometry overlaps road markings, and maintenance shed luminaires do not illuminate at night.

**Visual implementation boundary:** Modify the rendering-only functions in `dist/hsec/world.mjs` and the shed appearance builder in `dist/hsec/shed-model.mjs`. Remove duplicated crossing mesh, keep built texture and orientation; add non-shadow-casting warm PointLights on existing shed model. No `dist/hsec/state.mjs`, road graph, HSEC scoring, saved state, economy or mission changes. See `CHANGES/2026-11-09_hsec-crossing-shed-light-v9.md`.


## 2026-11-09 — User-authorized ChatGPT mission-flow / phone component changes

**Decision:** User expressly requested ChatGPT to implement directly (not generate a Claude Code prompt) the narrative phone readability/typing changes and a strict four-mission SMS start–accept–completion–collect lifecycle. Therefore a scoped one-time cross-owner exception applies to `dist/chapter/game.mjs`, `dist/chapter/phone-ui.mjs`, `dist/chapter/narrative-ui.mjs`, `dist/chapter/narrative-strings.mjs`. The core state/saving, HSEC scoring algorithms and narrative engine were not modified.

**Desired player experience:** Start SMS rings and opens automatically; first reading animates with avatar, name and role. Mission objectives and actions begin only on explicit acceptance. On finishing, a new SMS rings and the phone icon glows until the final confirmation; only then display the official completion modal and reward. No early final modal from intermediate goals/contract delivery. See `CHANGES/2026-11-09_narrative-phone-lifecycle-v8.md`.

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
