# Decisions Log — DRILL RUN NEXT GENERATION

## 2026-11-10 — V50 Segundo DrillTruck® conducible y M5 de seis objetivos

El usuario pidió una segunda unidad para manejo personal con joystick,
freno, cámara exterior elevada, ingreso por mano o tocando el modelo y
estacionamiento propio cerca de entrada; el DrillTruck® M4 seguirá
automático atendiendo la DTH. Compra pagada mediante Casa Matriz
(🪙 12.000 + 🪙 200 despacho), entrega 3 minutos y sexto objetivo
M5, sin recompensas extra y manteniendo bono único 🪙 12.000.
Se modifica solo M5, Casa Matriz, HUD y conducción; no alterar
automatización, desgaste ni ingresos M4.
Ver `CHANGES/2026-11-10_v50-personal-drilltruck-driving.md`.

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

## 2026-11-10 — V52 Iluminación real, focos, avatar y sonido de conducción
La misión M5 ya funciona y no debe cambiar. El usuario pidió postes de Patio
que iluminen el terreno realmente de noche y focos delanteros con botón en
DrillTruck® 02; detectó avatar visible y pasos durante conducción.
Se autoriza excepción visual/acotada en el bucle compartido `game.mjs` y
`worksite-audio.mjs`, solo para render correcto antes de `World.update()`,
control de luces y señal de audio. Sin intervención en economía, simulación
de DTH, HSEC, narrativas, pagos, compras o misión. Véase
`CHANGES/2026-11-10_v52-night-patio-personal-driving.md`.


## 2026-11-10 — V53: Una función, una interfaz
Centro de Faena pasa a ser puerta común de toda operación: navegación
por HUD, Catálogo o interacción física debe abrir el mismo módulo.
Bodega gestiona inventario, solicitudes, auditoría; Taller repara y
reafila con kits **pagados**, no duplica bodega; Patio administra vehículos,
plazas y accesos. Teléfono sigue siendo comunicación/Casa Matriz.
No alterar el progreso M1–M5, los productos reales ni economía de M4.

## 2026-11-10 — Catalog asset Wave 01, read-only staged integration
- Reuse HSEC cone/fence products at existing prices, no duplicates. New objects are locked until actual GLBs, physical placement, ledger and save compatibility are implemented.
- Do not create a misleading construction hologram for an undefined site; real GLB hologram using existing cyan ConstructionHologram is mandatory when building becomes constructible.
- M6+ content must reuse V53 unified Operations and recovered-tool workshop; no parallel operation screens. Change set remains independent of M1–M5.

## 2026-11-10 — V54 HUD de conducción sin texto
Faro (apagado gris/encendido amarillo) y freno (ícono rojo al presionar) quedan al borde derecho. Joystick horizontal y teclas se normalizan únicamente para el DrillTruck® personal mediante una transformación antes de llamar a la física. Sin duplicar controles ni modificar el DrillTruck® automático. Mantener los cambios concurrentes de catálogo.


## 2026-11-10 — V55 Tránsito y GPU en móvil
Los pasos pintados nunca actúan como muro. Conservar cercos, edificios, barandas y control HSEC como obstáculos, con una huella vehicular real y la posibilidad de deslizarse por cantos; no eliminar colisionadores. El Catálogo utiliza un contexto WebGL compartido para todas sus imágenes; mundo 3D conserva el contexto prioritario. Una falla de render puede reiniciar la vista solo con guardado preservado; no resetear economía/misiones.


## 2026-11-10 — V56 No perder jamás vehículos comprados
La unidad 02 está identificada por `s.mission5.personalTruck` y no puede desaparecer por falta temporal de GLB ni por cambio de save válido. Su propiedad solo puede reconstruirse de evidencia de compra/comisión M5 y recompensa cobrada; la localización no la teletransporta, pero Recuperar P01 es una acción explícita gratuita sobre la misma instancia. M4 automática permanece independiente.

## 2026-11-10 — V57 / Navegación: eliminar barreras invisibles, conservar colisiones reales (Usuario + ChatGPT; requiere coordinación Claude Code)

**Problema constatado en código:** `World.isBlocked` de `dist/scene.mjs` bloquea zonas no comprendidas por el rectángulo histórico ni las dos regiones M5, aun cuando allí existe terreno visible. `restore()` de `dist/chapter/state.mjs` usa otro conjunto de límites; `personalTruckAtPlayableLocation` / `repairPersonalTruckPose` tienen un tercero. Una ampliación aislada crearía posiciones jugables que desaparecen tras recargar.

**Criterio aprobado por usuario:** extender el terreno transitable de avatar y DrillTruck® personal; no seguir bloqueando áreas despejadas con cajas invisibles. Mantener sólidos de edificios, maquinaria, cercos HSEC, barreras y portones: la seguridad y las colisiones físicas siguen vigentes.

**Implementación coordinada para propietario funcional (Claude Code):**
1. Establecer un dominio de circulación compartido para el terreno visible de 240×240 m, con 8–12 m de margen antes del borde visual (p.ej. `|x|<=108 && |z|<=108`), sin caja especial tras los edificios; usar **la misma** regla para peatón, conducción y restauración de guardados.
2. Integrar `World.isBlocked` / `navigation-areas.mjs`, `state.restore` y `personal-drilltruck.mjs` sin mover la propiedad pagada al recuperar un guardado válido. No resetear al spawn un vehículo/operador legítimo dentro del mapa.
3. No tocar la colisión de paredes, portón dinámico, cercos físicos, rigs, NPC ni los controles, cámara, M4 automatización, economía o misiones.
4. Añadir pruebas de movimiento por detrás de Oficina/Taller, acceso y salida de Patio, continuidad entre cuadrantes, frenado en obstáculos reales, guardado-recarga en coordenadas ampliadas y bloqueo 10 m antes del borde de malla.
5. Inspeccionar en WebGL real, incluso de noche. No confundir límite invisible con una huella de colisión existente.

**Ownership/release:** ChatGPT limita V57 a iluminación visual (`patio-world.mjs`). Claude implementa la ampliación funcional como cambio independiente; PR y CI antes de unir a `main`, sin despliegue no autorizado.

## 2026-11-10 — V57: autorización directa del usuario para implementación y publicación integrada

Tras confirmar que la V57 no estaba desplegada, el usuario solicitó explícitamente **«Dale con V57 y ampliación de terreno»**. Se autoriza a ChatGPT una excepción puntual de ownership para unificar el límite físico en `navigation-areas.mjs`, `scene.mjs`, `state.mjs` y `personal-drilltruck.mjs`, además de ajustar tests históricos del límite. La rama `chatgpt/v57-night-yard-visibility` integra V57 iluminación/recuperación con navegación.

- Implementación acotada al límite transitable y persistencia; no tocar progresión, economía, compras, M4 producción ni reglas de colisión sólida. Mantener margen dentro de malla 240×240 m.
- Bloqueo siempre en paredes reales/HSEC, no por fase M4/M5 ni rectángulos artificiales.
- Verificar test focalizado de caminos, vehículo, restauración y suite CI. Anotar limitaciones antes de merge.
- Solicitud se interpreta como aprobación para publicar este alcance una vez validado; la verificación de `main` y Vercel se informa separadamente. No incluye rediseñar todo el HUD.

## 2026-11-10 — V58 DrillTruck® personal: cámara giratoria libre (Usuario + ChatGPT)

**Pedido:** mientras el jugador conduce la unidad 02, la cámara debe girar con el dedo desde la mitad derecha de la pantalla, como la cámara del avatar. No usar giro de cámara para cambiar el rumbo ni bloquear el joystick.

**Excepción compartida acotada:** ChatGPT implementa la cámara visual en `dist/camera/personal-truck-free-look.mjs`; sólo ajusta los enlaces táctiles y la vista de `dist/chapter/game.mjs` (archivo compartido), sin modificar la física `drivePersonalTruck`, misión, economía o guardado.

- Cámara elevada exterior se mantiene detrás del vehículo al ingresar, y acompaña su dirección con un desplazamiento angular elegido por el jugador.
- Deslizamiento horizontal/vertical desde la superficie del juego, lado derecho (control existente `installWorldGestures`), controla únicamente azimut/inclinación de vista. Joystick en lado izquierdo conserva aceleración, marcha atrás, giro y freno sin interferencias.
- El modo de conducción no guarda ángulos en el estado de misión, no afecta la propiedad de la camioneta ni la cámara del avatar. `cameraHome` vuelve a vista detrás del vehículo; al salir y reingresar se reinicia el modo.
- El zoom táctil opcional de pinza y rueda actúa sobre cámara de vehículo, manteniendo distancia mínima/ máxima razonable.
- Tests sintéticos deben verificar vista predeterminada, giro libre, seguimiento dinámico al vehículo, retorno a inicio, límites de inclinación/zoom y código acoplado.
- Trabajo en rama `chatgpt/v58-personal-drilltruck-free-look`, PR antes de merge. Solicitud del usuario es para activar la función; validación de despliegue y cámara real Android deben informarse sin asumirlas.


## 2026-11-10 — V59: Corrección visual integral Patio, barrera y DrillTruck® personal

**Autorización directa:** el usuario compartió una captura nocturna del Patio y pidió «Hazlo todo» sobre tres fallos: barrera motorizada de apertura antinatural, DrillTruck® personal enterrada en asfalto, iluminación insuficiente de herramienta/vehículos/maquinaria.

**Ownership y alcance coordinado:** ChatGPT asume visuales y animación en `dist/mission5/patio-world.mjs`, nuevo módulo de animación de barrera y de corrección visual de contacto vehicular. Se autoriza la excepción **exclusivamente visual** en `dist/chapter/game.mjs` para alinear la altura del GLB personal con `World.sampleGround`, sin modificar `drivePersonalTruck`, sensores, collider, heading, guardados, stock, economía, misiones ni M4 automática.

- Barrera: interpolación 18%/frame se reemplaza por movimiento de 1.6 s dependiente de tiempo, con pausa segura antes de cerrar; la activación sigue leyendo el sensor y `barrierBlocksPlayer` existentes. No desbloquear colisión prematuramente.
- Vehículo: calcular mínimo vertical del modelo al crear o reemplazar GLB (antes de añadir luces), y al posicionarlo apoyar visualmente en altura máxima bajo la huella de ruedas; no guardar cambios de elevación ni alterar la física en X/Z.
- Iluminación: nuevas luminarias de tarea bajo techumbres y proyección de luz en pavimento de P01, flota cubierta, herramientas/logística y pads de maquinaria; presupuesto de luces dinámicas adaptado a Android, sin sombras nuevas, sin cuerpos sólidos ni marcas externas.
- QA: pruebas específicas de duración de barrera a FPS distintos, pausas, contact patch del vehículo, preservación de ruta/collider, cobertura nocturna y regresión M1-M5. Publicación sólo después de CI y comparación del commit Vercel `main`.

## 2026-11-10 — V60: dos regresiones de conducción tras V59 (usuario, capturas Android)

Se reportan **ruedas visiblemente elevadas sobre arena** y botón de salida que responde `No hay espacio libre para bajar` en un sector abierto del Patio. Usuario espera reparación directa como continuación de V59.

**Hallazgos:** (1) `visualTruckGroundHeight` utiliza el **máximo** de suelo en cinco puntos sin nivelar la carrocería: un borde/relieve bajo una rueda eleva todos los contactos rígidos. (2) `togglePersonalTruck` ejecuta `world.isBlocked` con el **propio collider** de la camioneta aún registrado, y solo evalúa dos posiciones de salida, aun cuando puede haber espacio seguro detrás/delante. Ambas regresiones aparecieron después de cambios sucesivos visuales en modo de conducción.

**Autorización excepcional acotada a reparación:** ChatGPT puede modificar el controlador visual `dist/graphics/personal-truck-grounding.mjs`, un módulo de selección segura de punto de bajada `dist/animation/personal-truck-exit.mjs` y el enlace en `dist/chapter/game.mjs`. No se modifica `dist/mission5/personal-drilltruck.mjs` (propiedad/velocidad/estado) ni el contenido de saves.
- Altura basada principalmente en el terreno central y una estadística robusta de las cuatro ruedas; nunca elevar toda la camioneta para compensar un único punto alto. Mantener contacto correcto en superficies planas y pavimento.
- Al bajar (detenido), excluir únicamente el collider físico de **su propia** DrillTruck® de la evaluación del punto de salida; mantener cercos, equipos, otras camionetas, portones, HSEC y límites de terreno. Reponer exactamente el collider con `try/finally`.
- Buscar posiciones seguras laterales y, si están bloqueadas, alternativas alrededor del vehículo dentro de una distancia peatonal acotada. No teletransportar a través de cercos ni permitir salir si realmente no existe espacio.
- Pruebas específicas contra terreno irregular, autocolisión y colisiones reales; PR y validación automática antes de integrar. Los reportes de los testers en Android siguen siendo necesarios, sin afirmarlos antes de verlos.


## 2026-11-11 — V61: recuperación de colisiones y luz real de Patio/DrillTruck® (Usuario + ChatGPT)

**Evidencia Android:** DrillTruck® 02 quedó cruzada en barandas amarillas junto al edificio Taller/Oficina; el usuario confirma además que el Patio sigue oscuro y los faros encendidos no iluminan el camino. Es una continuación correctiva de las reparaciones V59–V60 previamente solicitadas.

**Diagnóstico confirmado en código:**
1. `drivePersonalTruck` revisa 9 puntos aislados del contorno únicamente en el destino. A 30 km/h y 80 ms puede avanzar ~0,66 m por paso, atravesando barandas delgadas entre fotogramas.
2. `installPersonalTruckHeadlights` crea únicamente dos focos `SpotLight` dependientes del GLB y sin decal de superficie visible. El botón HMI puede estar activo mientras el terreno no muestra luz legible, especialmente de noche.
3. En `patio-world.mjs`, el presupuesto nocturno apaga todas las luces dinámicas salvo las más cercanas. Los halos visuales existentes tienen baja cobertura/intensidad en las plazas y rutas de maquinaria.

**Excepción funcional acotada:** para reparar el defecto del usuario sin reescribir misiones, ChatGPT podrá mejorar el muestreo continuo de la colisión **solo de DrillTruck® 02** en `dist/mission5/personal-drilltruck.mjs`, incluyendo tests de barreras finas, caminos y escape de colisiones antiguas. El módulo no altera velocidad máxima, aceleración, joystick, precios, pedidos ni contadores de misión. Esta excepción queda documentada para coordinación con Claude Code.

**Control compartido:** `dist/chapter/game.mjs` podrá recibir exclusivamente un enlace visual desde la camioneta al proyector de faros; no cambios en estado/guardados/flujo de misión. `dist/graphics/personal-drilltruck-headlights.mjs` y `dist/mission5/patio-world.mjs` se modifican únicamente para iluminación más perceptible en suelo y trabajo nocturno, sin sombras nuevas en Android.

**Pruebas y release:** tests dedicados de barrera fina, paso rápido sin túnel, terreno despejado, recuperación de P01, proyección de luz y visibilidad del Patio; CI específica + regresiones anteriores. Integración/despliegue únicamente después de revisión. No afirmar comprobación visual Android no realizada.

## 2026-11-11 — V62: reversión estética de faros V61 y apoyo visual de botas en Patio

**Usuario:** rechaza el efecto de franja blanca («parece un sable láser») y señala que la luz cálida anterior se veía mejor. También adjunta captura del avatar con botas hundidas unos centímetros en Patio. Reitera que **ChatGPT es responsable de implementar**, no entregar prompts a Claude Code.

**Causa identificada:** V61 introdujo `makeRoadProjection` (mesh de 21 m, material `AdditiveBlending`) que sobreilumina en forma de franja artificial sobre asfalto. Para el avatar, `World.update` coloca los pies en `sampleGround` (Patio nivel .19 m), mientras algunas capas visibles del pavimento llegan a .21–.315 m y el modelo skinned tiene tolerancias de suela.

**Alcance visual acordado:** se revierte `dist/graphics/personal-drilltruck-headlights.mjs` al diseño de focos cálidos V60 (sin proyector/decal). Ajuste visual exclusivo en `dist/scene.mjs` de consulta de apoyo del avatar: aplicar una pequeña compensación solo dentro de Patio pavimentado y transiciones suaves de borde, usando helper `dist/animation/avatar-pavement-clearance.mjs`; alinear root/IK/cámara con el mismo soporte. No cambiar posición de guardado `state.position` ni colisiones, economías, conducción, materiales GLB, HUD, misiones ni su lógica.

**Excepción de archivo compartido:** `scene.mjs` es renderer/animación propiedad visual de ChatGPT, `game.mjs` solo retira el hook de V61 que llamaba a `project`; no se cambia tick, entrada, guardado ni controles. Regresiones V52/V61 actualizadas por la reversión; V62 con comprobación de altura sobre pavimento/arena y sin franja proyectada.

**Publicación:** branch `chatgpt/v62-natural-headlights-avatar-boot-support`, PR y CI antes de merge; no afirmar QA visual Android sin captura del usuario.

## 2026-11-11 — V63 DrillTruck® 02: temperatura cálida ámbar, sin cambiar haz ni lógica
**Usuario:** la luz V62 mejoró; solicita mantener forma suave y cobertura, pero obtener el tono **cálido como referencia anterior**. ChatGPT asume diseño/código y validación directamente; no delegar prompts.

**Cambio exclusivo visual:** en `dist/graphics/personal-drilltruck-headlights.mjs` ajustar los colores de ambos `SpotLight`, del `PointLight` de proximidad y del material emisivo de lentes a una paleta cálida 2900–3200 K aproximada, sin añadir nuevos meshes/decal ni reintroducir V61.
Se mantiene distancia, cono, dispersión, intensidad, encendido/apagado, calidad móvil, dirección del vehículo, memoria, M1–M5 y colisiones. Pruebas verifican color aprobado y no láser. Rama `chatgpt/v63-warm-amber-personal-headlights`; verificación CI antes de integrar. QA cromática Android queda pendiente del usuario.

### V63 — alcance ampliado por captura de reflejo en pavimento (usuario, mismo hilo)
El usuario aclara que no basta cambiar el color: **la luz no se refleja en el pavimento**. Esta precisión autoriza una iluminación de rebote sutil y localizada sobre la superficie del camino.

ChatGPT implementa en el módulo visual de faros dos manchas ovales muy difuminadas de 3–8 m, RGBA con borde 100% transparente y mezcla normal; no se autoriza retornar al proyector trapezoidal de 21m ni usar `AdditiveBlending`. Geometría de bajo costo adaptada al suelo por `world.sampleGround`, material visual dependiente de si es noche y faros encendidos. Se permite en `game.mjs` únicamente pasar el estado de noche y actualizar posición/heading del rebote. No se altera steering, velocidad, costo, lógica o guardados.

## 2026-11-11 — V64: portada cinematográfica aprobada, branding reutilizable y puerta de bienvenida
**Aprobación del usuario:** última ilustración 16:9 de DRILL RUN NEXT GENERATION, personajes de cuerpo completo con cascos/EPP, DRILLTRUCK® sin marcas externas, faena construida y blueprints azules. **El título ilustrado de DRILL RUN queda aprobado como logotipo del juego**, reutilizable en login, carga y portada. El botón neón estilizado JUGAR se conserva.

**Diseño y optimización:** ChatGPT extrajo los píxeles exactos del logo (no lo redibujó), comprimió el arte a WebP y generó un prototipo HTML interactivo con microanimación de desplazamiento/zoom, destello controlado en logo, hologramas azules pulsantes, polvo ambiental y neón táctil. Animaciones CSS con `prefers-reduced-motion`, sin loop de video pesado y sin bibliotecas externas.

**Integración explícitamente acotada:** flujo **login actual → carga actual → bienvenida V64 → selector o partida guardada**, sin reemplazar autenticación ni Cloud Save. La nueva vista se presenta como iframe mismo-origen cargado bajo demanda cuando termina `ensureWorld`; su CTA envía solo un `postMessage` same-origin `drillrun-welcome-enter-v64` al parent; el parent ejecuta exactamente las ramas previas `chooseCharacter` / `beginPlay`. No se alteran `state.mjs`, Firebase, saves, avatares, misiones, economía ni cámara. La instancia del mundo no vuelve a crearse para entrar.

**Archivos compartidos:** `dist/index.html` recibe sección mínima de bienvenida y referencia CSS; `dist/chapter/game.mjs` solo encapsula la transición visual anterior y el evento del iframe (excepción exclusiva de continuidad de UX solicitada por usuario). No tocar otros handlers de navegación, ni renderizado M1–M5. Los estilos visuales son exclusivos de ChatGPT. El prototipo directo `dist/title-preview-v64.html` puede abrirse sin autenticar para revisar en Android.

**Release gate:** rama `chatgpt/v64-cinematic-welcome-concept` → PR preview. **No publicar en main/producción hasta la aprobación explícita del usuario del comportamiento implementado.** Tests de estructura, eventos y no-regresión primero.

## 2026-11-11 — V65.1: perspectiva, oclusión de galpón y polvo a ras del suelo
**Aclaración explícita del usuario:** conservar el destello que recorre el logo DRILL RUN; quitar **solo** el efecto que barría toda la pantalla. Aumentar inmersión con secuencias progresivas de construcción y después corregir la perspectiva/oclusión especialmente en el galpón holográfico posterior izquierdo, donde trazos o pulsos azules se superponían sobre el módulo real del primer plano. Solicita polvo móvil en la parte baja, a los pies de ambos personajes y **por detrás de JUGAR**.

**Solución implementada (preview únicamente):**
- Se preserva `#logoShine` con `animation:titleSweep 10s`; se elimina `#scan` de pantalla completa.
- Cada blueprint usa una cadena SVG con estructura alineada a la foto aprobada en coordenadas 1672×941, secuencias foundation → columns → roof → details desfasadas por sitio, trazos de energía y puntos de anclaje.
- El galpón trasero izquierdo usa máscara SVG `galponDepthV65` que recorta su dibujo donde el módulo/cabina real se ubica en primer plano. **La misma máscara de profundidad se aplica a los píxeles alfa del WebP de brillo azul** para evitar que incluso el resplandor pulse por encima de la construcción.
- Se agregan cinco bancos suaves de arena de desplazamiento horizontal (gradientes radiales, sin video/canvas), dos pequeñas nubes de polvo cerca de los pies y diez granos movidos por viento. Están recortados a la zona inferior 67–100% y el layer z-index 7 queda **detrás** de JUGAR z-index 20. Se desactivan completamente bajo `prefers-reduced-motion`.
- No se usa IA de re-generación del arte, ni marcas externas, ni se cambian posiciones de personajes, botón, identidad, auth, guardados, HSEC, misiones o economía. CSS + SVG + textura WebP comprima, sin librerías nuevas.

**Estado:** rama `chatgpt/v65-blueprint-line-build-immersion`, derivada de V64 (también sin publicar). **No fusionar ni desplegar en producción sin aprobación explícita** del usuario. Pruebas de navegador Chromium horizontal y tests automáticos; usuario debe validar la percepción visual en Android.

## 2026-11-11 — V66 personal DrillTruck® / sesión / UI y personal M5 (coordinación de archivo compartido)
**Petición explícita del usuario:** después de salir y volver a la partida, DrillTruck® personal 02 propiedad del jugador retorna al estacionamiento P01 (sin cobro ni segundo vehículo); tras 3–4 horas de ausencia, avatar aparece frente a la oficina; conducir con ruedas girando, sonido realista, dirección progresiva, freno NO instantáneo, respuesta intuitiva al cambiar a reversa; botón freno de tamaño similar desplazado diagonal a izquierda, luces/mano intactas. Adicionalmente el usuario muestra capturas de botones colapsados en ordenador, extraña sombra blanca en JUGAR y dos NPC M5 desproporcionadamente pequeños.

**Decisión funcional acotada y autorizada por el usuario:** ChatGPT prepara la V66 en rama aislada y documenta esta excepción coordinada sobre `dist/chapter/game.mjs` (solo imports + hooks pequeños en `beginPlay(true)`, fábrica de ruedas y audio/UI, sin editar otros caminos). `dist/mission5/personal-drilltruck.mjs` modifica EXCLUSIVAMENTE dinámica cinemática personal, mantiene la integración y barrido de colisiones V61, propiedad/entrega/costos y M4 automática. Se introduce helper `dist/mission5/personal-session-return.mjs` llamado **solo al reanudar** partida guardada: compara fecha `savedAt` anterior a guardar, devuelve la camioneta **existente** a P01, y tras 3.5 horas desplaza al operador al acceso de oficina; si el jugador cerró mientras conducía, evita dejarlo sin vehículo desplazándolo a P01. Se garantiza idempotencia, evita crear duplicados y no afecta partidas nuevas.

**Gráfica/UI/sonido:** módulo de rueda visual en `dist/graphics/` sobre clon de camioneta de M5, sin modificar camioneta M4. Motor sintetizado suavizado independiente de worksite industrial, sin marcas ni audios licenciados. CSS nuevo y aislado para freno, colisiones UI en escritorio; la animación del logo se mantiene mientras la sombra BLANCA accidental del botón JUGAR se suprime del HTML de V65. Personal M5: escala corregida en su propio módulo GLB sin cambiar rutas ni contrataciones.

**Release gate:** esta nueva funcionalidad NO entra a main hasta preview/QA y aprobación expresa. Se registra información de pruebas (CI dirigida, modelo de rueda GLB si no se puede inspeccionar, además de las dos fallas antiguas de M4 en CI general).

**Ampliación confirmada por el usuario (misma V66):** la camioneta automática de M4 también debe girar ruedas. Implementado mediante `PersonalTruckWheels.updateFromPose(dt,truckRouteActive)` en el loop gráfico posterior al `updateTruckRoute`. La función del recorrido M4 y sus estados no se tocan. El clone de M4 destinado a la camioneta personal reconoce rigs V66 heredados para no producir ruedas duplicadas. Se agregan tests de lectura M4 sin mutación de posición/rumbo/route.

## 2026-11-11 — V68: selector cinematográfico 3D y feedback UI bajo solicitud directa

El usuario autorizó implementar y desplegar para probar el mockup aprobado de selección: primer plano **real GLB** del avatar elegido (no sustitución con arte generado), retratos/figura 3D del mismo asset, carril lateral de cuatro opciones, presentación vertical de habilidades reales y campo para escribir el nombre. Además aprobó efectos sonoros minimalistas y vibración compatible y voluntaria. ChatGPT crea CSS + módulos independientes de presentación, retrato GLB y audio, y realiza **únicamente** hooks visuales acotados en `dist/chapter/game.mjs` y referencia CSS en `dist/index.html`; no modifica `state.mjs`, bonos, creación de personaje, misión, guardados ni intro. La selección 3D por toque y tarjetas conserva la llamada `selectAvatar`; las fichas de habilidades usan exclusivamente `AVATARS[].bonuses`, nunca porcentajes inventados del mockup. Los cambios en archivos compartidos quedan registrados aquí para coordinación con Claude Code. Rama `chatgpt/v68-cinematic-real-avatar-selector`, PR y preview separado hasta QA. Las imágenes previas aprobadas son referencia de calidad, no assets que reemplacen GLB.

## 2026-11-11 — V69 retirar bienvenida redundante, calibrar NPCs y perfeccionar selector V68

El usuario reporta que la portada V64/V65 entre login y juego es redundante y presenta diagramación errática; solicita **eliminarla del flujo**, manteniendo login Google, selección de personaje, intro e historial intactos. También reporta NPCs Guardia/Técnica visualmente enanos frente al operador; V66 usaba `heightOf(world.player)` obtenido de un SkinnedMesh animado como calibración y podía reducir indebidamente su altura. La nueva calibración utiliza la estatura nominal aprobada de los cuatro GLB del juego, y normaliza cada NPC por su malla visible; no altera recorridos ni HSEC. En selector V68 se corrige el bug `Number(undefined)!==0`, se activa por defecto su especialidad, y se sustituyen +/- porcentajes por barras de habilidades **puramente visuales** de 2 atributos por área, con +1 barra en el área de su bono real. Se acerca la cámara, se ilumina el GLB y se elimina la superposición opaca del fondo sobre el avatar.

**Excepción acotada:** ChatGPT edita `dist/chapter/game.mjs` sólo para eliminar la pasarela `welcome`, redirigir `#play` a los destinos originales, y ajustar la cámara del selector. El ownership funcional permanece en Claude Code; ChatGPT no cambia `state.mjs`, Cloud Save, recompensas, M1–M5 ni las intro diferenciadas. Rama `chatgpt/v69-direct-entry-npc-selector-polish`, CI y revisión antes del merge. Solicitudes del usuario corresponden al mensaje de auditoría/captura y comentarios adicionales del selector.

## 2026-11-11 — V70 pantalla completa en entrada y efectos audibles

**Solicitud del usuario:** el selector de personaje queda demasiado cerca del borde inferior cuando Android muestra barra de URL, y los sonidos de selección/interacción son demasiado tenues. Corrección acotada de ChatGPT: se solicita pantalla completa en cada gesto explícito de `Continuar`, `Nueva partida` y confirmación de reemplazo, con fallback manual en el selector y CSS sensible a altura del viewport. El navegador/Custom Tab puede denegar `requestFullscreen`: no se promete ocultación forzosa ni se intenta esquivar sus permisos; la PWA instalada puede iniciarse sin barra de direcciones. En `dist/chapter/game.mjs` sólo se coordinan gestos de entrada y controles de presentación; no cambios de guardado, Google auth, misiones, lógica de avatar ni economía. Ajuste aislado de amplitudes suaves en `dist/audio/character-select-feedback-v68.mjs`, respetando el apagado de sonido y el háptico independiente. Implementar en rama `chatgpt/v70-immersive-entry-ui-feedback` con PR, pruebas y despliegue sujeto a QA.

## 2026-11-11 — V71 misión 2: pestañas HSEC, ficha de oficina y prioridad visual Galpón

Solicitud del usuario sobre su partida nueva (M1 ya cerrada; M2 en curso): tabs de la ventana HSEC parcialmente ocultos, panel de mejora de oficina tan ancho que cubre la escena, y Galpón de mantenimiento ubicado demasiado lejos de Oficina en la categoría Edificios. ChatGPT interviene SOLO la presentación y el orden de catálogo: CSS nuevo `dist/chapter/m2-layout-v71.css` al final de los estilos (HSEC nav de altura fija + body scrolleable; oficina quick compacta con preview y acciones legibles); `dist/index.html` únicamente carga ese CSS. **Excepción acotada en archivo funcional `dist/chapter/construction-catalog.mjs`**: mover únicamente el producto existente `shed` al segundo puesto de la matriz `products`, justo detrás de `office`, sin cambiar objetos, identidad, selección, atributos, precio, desbloqueo, propiedad, economía ni reglas HSEC. Se preservan todas las demás posiciones relativas. Claude Code mantiene ownership funcional; se documenta la modificación para evitar conflictos. Rama `chatgpt/v71-m2-hsec-office-galpon-layout`; PR/CI antes de main.

## 2026-11-11 — V72: temporizador de galpón y objetivo vehicular por metros

Durante auditoría de M2 el usuario pidió dos cambios funcionales específicos: (1) Galpón dura exactamente 60 s de juego y muestra barra de avance como Taller; (2) carretera vehicular se valida por **mínimo de metros construidos**, sin exigir unir puntos invisibles. En `dist/hsec/catalog.mjs` se fija exclusivamente `shed.seconds=60` y `HSEC_BALANCE.vehicleRoadMeters=12`. Se escogen 12 m porque la ruta sugerida actual mide ~13,85 m y debe poder satisfacer el objetivo sin construir un segmento extra invisible. En `dist/hsec/state.mjs` se sustituye la condición de conectividad *vehicular* del evaluador M2 por `routeLength(h,['vehicle'])>=12`; la conectividad peatonal, cruces protegidos, iluminación y seguridad restantes no cambian. `dist/hsec/mission-readout.mjs`, `HSEC_STEPS` y la descripción del catálogo explican la cantidad mínima. Migración protectora: galpones de 25 s todavía `building` se extienden a 60 s al restaurar; edificaciones `built` no se vuelven a abrir. El HUD visual, la ficha del galpón en mundo y la pestaña Activos usan `started,ends,hsec.time` existentes y muestran barra tipo Taller y MM:SS sin simular timers. No duplicar créditos/acciones/compra. **Excepción acotada** a archivos funcionales de Claude Code exclusivamente para lo aprobado por usuario; conservar Cloud Save, contratos, M1/M3–M5 y estado de misiones. Rama `chatgpt/v72-shed-minute-progress`, pruebas + PR antes de cualquier release.

## 2026-11-11 — V73 · Taller Nivel 1 01:30 con barra y SMS M3 preciso

Solicitud directa: Taller L1 debe tardar 1 minuto 30 segundos y mostrar una barra visible durante montaje, idéntica al patrón aprobado para el Galpón. La ampliación L2 permanece en 300 segundos. El SMS de Camila Reyes al comienzo de M3 debe anunciar 3 sondajes de 30 m y no seis, en los cinco idiomas. Corrección de fallback en celular para mostrar datos reales del contrato. Se permite editar únicamente `dist/mission3/inventory.mjs`, `dist/chapter/narrative-strings.mjs`, `dist/mission3/phone-apps.mjs`, hooks de visualización acotados en `dist/chapter/game.mjs` y nuevos módulo/CSS de progreso, sin tocar estados económicos ni guardados. Los trabajos antiguos L1 en curso se extienden de 30 a 90 s sin reiniciar ni cobrar; los ya terminados se respetan. El HUD lee `workshop.started/ends` con reloj real, no crea un temporizador independiente. Se deja en pausa diseño de Personal hasta aprobación; a continuación auditar navegación de las 8 categorías existentes del catálogo sin inventar categorías o productos. Rama `chatgpt/v73-workshop-90sec-progress-m3-sms` con QA antes de main.

## 2026-11-11 — V74 navegación consistente de 8 categorías de Catálogo en M1–M5

El usuario reporta que en catálogo sólo se ven Edificios, Equipos, Vehículos, Caminos, Delimitación e Iluminación, sin poder encontrar Seguridad y Personal. Auditoría de `HSEC_CATEGORIES` y `catalogCategories`: las 8 categorías originales permanecen definidas; las dos últimas quedan fuera del viewport horizontal, que oculta scrollbar. Se modifica **únicamente** `dist/chapter/catalog-view.mjs` (dos flechas accesibles, desplazamiento táctil existente, scroll vertical del mouse convertido a horizontal sobre la franja, teclas de dirección, restaurar categoría seleccionada visible) y CSS independiente `catalog-navigation-v74.css`, cargado último desde `dist/index.html`. No se agregan categorías ni se trasladan productos; se mantienen todos los `locked`, costes, requisitos HSEC, economía, Cloud Save y reglas M1–M5. Test V74 valida categorías y proyecciones en estados de las 5 misiones, acceso a Seguridad/Personal y ausencia de mutación al consultar el catálogo. El rediseño premium de Personal queda pausado a petición del usuario hasta que apruebe la propuesta visual. Rama `chatgpt/v74-catalog-all-categories-navigation`.

## 2026-11-11 — V75 · Catálogo no incorpora Personal

**Decisión expresa del usuario:** la navegación inferior ya incluye `Personal`, por lo que duplicar selección/contratación de NPCs en el catálogo de productos/edificios no tiene lógica. El catálogo debe tener exactamente **siete pestañas de productos físicos y seguridad**: Edificios, Equipos, Vehículos, Caminos, Delimitación, Iluminación y Seguridad. Eliminar la octava pestaña `management` sólo del `catalogCategories()` público y retirar cards `role-*` y acciones de compra de `dist/chapter/construction-catalog.mjs` / `builder-ui.mjs`. **No** eliminar `management` del catálogo HSEC interno, ni las definiciones/skills/precios de `mission3/personnel.mjs`; conservar `m3-personnel`, `FaenaCenterUI` y los manejadores de contratación, incluyendo guardia y técnica de M5. Confirmado que el catálogo HSEC no dispone de assets `management`, por lo que ninguno queda oculto. La nueva pantalla Personal premium se diseñará/implementará sólo con visto bueno posterior. Rama `chatgpt/v75-personnel-outside-catalog`, test de las 7 categorías en M1–M5 y CTA independiente de Administrador en Personal.

## 2026-11-11 — V76 · Personal premium, 21 NPC ficticios y registro de habilidades

Usuario aprobó el rediseño Personal: **compacto**, navegable por 7 roles y 3 candidatos por rol (21), con imágenes propias semirrealistas cel shading, **sin un solo logo, marca o texto de uniforme**; banner contextual M3/M4/M5 enfoca siguiente contratación, candidatos comparables, ficha seleccionada, costos distintos, contrataciones reales y equipo activo con slots derivados por misión. Habilidades registradas por candidato y persistidas con `progressionVersion:1`, `skillPoints:0`, `effectsEnabled:false`; NO aplicar bonos económicos ni alterar misiones por stats hasta acordar reglas. La tabla de costos se ajusta dentro de valores ya existentes del juego, preservando costo predeterminado por rol y alternativas próximas; no se inventan sueldos recurrentes. Los NPC de mundo siguen usando GLB, comportamiento y posiciones actuales; el retrato 2D es identidad visual sin marcas. El personal M5 permanece registrado en `mission5.staff` con `candidateId` adicional, sin duplicar contratos. Los roles desbloquean cantidad visual de plazas M2=1, M3=5, M4=6, M5=8 derivada de misión; `canHire` y reglas de misión siguen siendo autoridad. El diseño nuevo se conecta desde `FaenaCenterUI` ruta personnel y el menú inferior; control audio UI con slider compartido (volumen moderado), microinteracciones con vibración mínima y respeta preferencia Sonido. Ediciones funcionales mínimas en `dist/mission3/personnel.mjs`, `dist/mission5/patio-staff.mjs`, dos callbacks en `dist/chapter/game.mjs`, UI compartida `dist/chapter/faena-center.mjs` e inclusión CSS en `dist/index.html`. Mantener HSEC de M2, M1-M5, Cloud Save y economía principal. Rama `chatgpt/v76-personal-roster-premium`; pruebas y preview antes de producción.

## 2026-11-11 — V77 Personal · placeholders sin arte definitivo y ficha compacta

El usuario aprobó detener generación de retratos y continuar la implementación funcional/visual sin imágenes de personas: placeholder neutro (silueta abstracta sin marcas) en cards, ficha y equipo activo. Se conservan los 21 IDs/nombres/roles/costos/skills V76 y las rutas portrait del registro para un reemplazo posterior por lotes; ningún retrato V76 se elimina. La pestaña sigue la composición de las tres referencias de interfaz de Personal aportadas por el usuario: misión y roles / tres tarjetas / ficha / equipo activo. Cada tarjeta muestra sus tres habilidades registradas 1–5 sin interpretar bonos como ingresos o cambios reales. La ficha del empleado seleccionado desde Equipo activo debe abrir ese candidato concreto. Alcance exclusivamente de presentación en módulo y CSS de Personal, más selección local UI en FaenaCenter; sin tocar M1–M5, contratación, saldo, economía, Cloud Save ni GLB. Rama: `chatgpt/v77-personnel-placeholders-ux`. PR y revisión/QA Android antes de main.

## 2026-11-11 — V78 Personal: primer lote ilustrado y aire visual (autorizado)
Se mantiene V77 y se cambia únicamente la presentación de la tríada de Administración de Contrato: Camila Rojas, Matías Torres y Sofía Ibarra (los IDs y candidatos reales de V76); arte original cel shading minero semirrealista, casco y EPP liso, sin insignias ni marcas. Se usa atlas WebP liviano de tres retratos individuales (690×260) en cards, detalle y slots. Se conservan placeholders neutros para restantes 18 NPCs. Mejoras CSS responsive por tamaño: más padding, separación entre tarjetas y habilidades cuando existe altura/anchura suficiente; ajuste leve también en landscape compacto, sin sacrificar visibilidad de botones. No se cambia el sistema real de contratación, los costos, el saldo, las misiones, la economía, los efectos reservados de habilidades ni Cloud Save. Basado en la misma interfaz de Personal aprobada por el usuario y la petición expresa de extender progresivamente esa dirección visual a otras ventanas en futuras iteraciones. Rama chatgpt/v78-admin-portraits-airy-personnel; revisión CI y publicación via GitHub main/autodeploy, sin CLI Vercel.

## 2026-11-11 — V79: equipo con carrera visual y nómina futura (sin descuentos)
El usuario aprueba la dirección de interfaz de Personal, pide más aire y seis fondos originales (M1–M5 y juego libre), y solicita habilidades de entrada más bajas para subirlas por experiencia. Pide estudiar dos costos separados: reclutamiento y salario no excesivo por turno. Se introduce `salaryPerShift` de solo lectura para los 21 candidatos según rango de precio, en torno a 60–310; las skills base 1–3 se diferencian en tres niveles [2,2,1] / [3,2,2] / [2,1,1]. Para perfiles guardados se usa el `skillProfile` persistente, sin migraciones ni reset.
Propuesta económica futura: un turno tras cuatro ciclos DTH acreditados (15 minutos cada uno si hay herramientas), pago automático único con ledger + aviso resumen, sin cobro por reloj real ni por inactividad/offline; M3 requeriría gatillo explícito al entregar contrato. Evaluar el desgaste/insumos, recuperaciones, deudas, guardados e impacto M1–M5 antes de escribir cobrador. `PERSONNEL_PAYROLL_POLICY.automaticDebitsEnabled=false` y `trainingEffectsEnabled=false`: no se descuentan sueldos ni se suben habilidades en V79.
La pestaña Personal mantiene la contratación real y agrega Gestión de Equipo con datos actuales y nómina estimada, sin botones que simulen pago ni experiencia. Las seis imágenes SVG son paisajes ficticios de faena sin logos ni marcas. Cambios únicamente en presentación y datos de candidato; nada en estado, game loop, misiones, contratos, ledger, Cloud Save o GLB. Rama `chatgpt/v79-personnel-career-payroll`.

## 2026-11-11 — V80 · Corrección artística aprobada por el usuario
El usuario rechaza estética compacta V79 en Android y selecciona imagen de referencia premium de Personal. Ordena a ChatGPT implementar (no briefs ni prompts). Se aprueba mejorar exclusivamente la capa visual y flujos de pestañas informativas, recuperar retratos sin deformación usando WebP V78 embebido por personaje y aumentar la presencia de la imagen principal, cambiar cabecera y mover slider de sonido a Configuración, más alinear logo DRILL RUN a izquierda en login/carga. Se conserva el valor y función real de contratación y perfiles de V79, sin reescribir misiones ni costos. GitHub main → autodeploy Vercel, sin publicación manual. Rama: `chatgpt/v80-premium-personnel-title-audio`.
