# Active Work — DRILL RUN NEXT GENERATION

**Last updated:** 2026-11-06

## Currently Active

- **ChatGPT — V50 DrillTruck® personal:** rama
  `chatgpt/v50-personal-drilltruck-driving`.
  Segundo vehículo comprado en Casa Matriz, entrega real, M5 seis pasos,
  estacionamiento P01 y conducción joystick/freno con cámara chase.
  Mantener M4 DrillTruck (01) y producción automática sin cambios.
  QA de flujo M5 y conducción en proceso, preview/PR antes de main.

- **ChatGPT — V47 portada M5 y HUD compacto:** rama
  `chatgpt/v47-live-mission-home-compact-hud`. Portada/estado del
  jugador leen la misión narrativa aceptada; checklist M5 en HUD
  muestra solo paso actual y siguiente, con altura que no toca joystick.
  Archivos `dist/chapter/game.mjs`,
  `dist/chapter/mission-display.mjs`,
  `dist/mission5/mission-readout.mjs` y
  `dist/chapter/hud-reference-v4.css`.
  Publicación a main aprobada por el usuario, sujeta a CI específico.

- **ChatGPT — V46 M5 checklist y bono:** rama
  `chatgpt/m5-checklist-reward-v46`. Cinco pasos reales sincronizados
  HUD/teléfono, orden funcional estricto y pago único de 🪙 12.000
  al SMS final. Bloquear cambios paralelos en
  `dist/chapter/game.mjs`, `dist/chapter/narrative.mjs`,
  `dist/mission5/patio-ui.mjs`, `dist/mission5/patio-staff.mjs`
  y `dist/chapter/hud-reference-v4.css` mientras se revisa el PR.
  Sin merge ni despliegue.

- **ChatGPT — V25 M4 production timer, staging/crops/notifications:** chatgpt/m4-visual-notifications-zones-v25. Timer from real first production cycle; DTH continues after M4; RC reserve moved to flat ground; real zone totals; direct DrillTruck UI fix; notifications safe. V8 source parse and isolated timer income test passed; browser QA pending.

- **ChatGPT — V24 Mission 4 operational overhaul:** chatgpt/m4-operations-audit-v24. Real five-stage/11-check mission path, Casa Matriz two category tabs, functional DTH workshop and tool installation, state-conditional DTH visual + RC staging, truthful startup after maintenance, budget and pending shipments. Isolated M4 end-to-end function tests pass; live mobile and GLB asset optimization pending.

- **ChatGPT — V23 ETA seconds + Casa Matriz layout:** chatgpt/order-eta-seconds-v23. ETA and two-column rig cards checked with static/runtime tests; real phone screenshot QA pending.

- **ChatGPT — V22 workshop booster accounting:** chatgpt/workshop-boost-economy-v22. Workshop speed-ups now spend booster inventory and reject zero stock; buttons show/disable current count and update HUD. JS smoke and parse checks passed; device QA pending.

- **ChatGPT — V21 M3 closing SMS + phantom posts:** chatgpt/m3-auto-closing-message-v21. Direct targeted closure UI and workshop obstacle reporting fixes; actual narrative + detector mock checks passed. Browser test pending.

- **ChatGPT — V20 Mission 3 metre precision and timer:** chatgpt/m3-meter-precision-deadline-v20. 90/90 physical completion now recognized, including saved sessions, timer freezes as ready for delivery, on-time drilling speed bonus independent of late phone submission. Targeted contract mock tests pass; Node and browser QA still pending.

- **ChatGPT — V19 scroll/input/catalog and workshop lighting:** chatgpt/phone-scroll-input-catalog-light-v19. Phone scroll retained on purchases, input released on UI focus, contained Casa Matriz previews, softer footsteps and two interior PointLights. Syntax/CSS and fake DOM scroll checks passed; real device QA pending.

- **ChatGPT — V18 immersive audiovisual worksite:** `chatgpt/atacama-immersive-av-v18`. New original procedural audio and graphical scene overlays with narrow game lifecycle integration, low-quality fallback. Parser and mock engine/scene checks passed; browser WebGL/audio device QA pending.

- **ChatGPT — V17 HSEC top-bar alignment:** `chatgpt/hsec-header-status-v17`, visual DOM reparent and scoped HUD CSS only. Structural checks 10/10 passed; browser rendering pending. V16 M2/M3 checklist approved by user; untouched.

- **ChatGPT — V16 synchronized M2/M3 checklists:** `chatgpt/live-mission-checklists-v16`. Shared read-only mission status adapters drive the left mission HUD and M3 phone details, plus seven M2 HSEC gates. JS syntax and isolated readout mock tests pass; browser and added Node suite still pending.

- **ChatGPT — V15 builder camera controls:** `chatgpt/builder-camera-navigation-v15` owns `dist/camera/follow-camera.mjs` and narrowly coordinated camera-only hooks in `dist/chapter/game.mjs`. Source/mocked camera checks passed; Node and browser regression QA pending. No builder state, economy, missions or save changes.

- **ChatGPT — Universal mission HUD V14:** `chatgpt/mission-card-polish-v14`; final-layer visual CSS in `dist/chapter/hud-reference-v4.css`. Targeted structural checks passed; browser/touch QA pending.

- **ChatGPT — V13 HUD right-side telemetry:** `chatgpt/hud-right-rail-v13`; visual-only HTML HSEC button reparent and final-layer CSS styling. HTML presence/unique ID and CSS structure checked; live layout QA pending.

- **ChatGPT — V12 road-junction render:** `chatgpt/hsec-unified-junction-paint-v12` corrects material pass order and metric widths on existing HSEC road canvas. Syntax and mock Canvas2D T-junction tests passed; live browser screenshot QA pending.

- **ChatGPT — V10 road junctions:** `chatgpt/hsec-road-junctions-v10`; cosmetic `dist/hsec/world.mjs`, JS syntax checked. Runtime render QA pending.

- **ChatGPT — HSEC V9 crossings and shed lights:** `chatgpt/hsec-crosswalk-shed-lights-v9`. Rendering-only `dist/hsec/world.mjs` and `dist/hsec/shed-model.mjs`. JS parses successfully; gameplay/WebGL screenshots and real-night lighting QA pending.


- **ChatGPT — Narrative phone + mission lifecycle V8:** `chatgpt/phone-narrative-readability-v8`, text contrast, portraits and M1–M4 start/finish SMS interaction. Scoped shared-file exception documented in DECISIONS; syntax/render-smoke tests passed, real-browser QA pending.

- **ChatGPT — M1 pending briefing HUD:** `chatgpt/m1-hud-pending-accept-fix`; render-only show condition in `dist/chapter/game.mjs`, no narrative acceptance or saved-state change. Syntax + static assertions passed; real browser acceptance pending.

- **ChatGPT — Mission 1 HUD summary fix:** `chatgpt/m1-objective-summary-v7`, small display-only update in `dist/chapter/game.mjs` and `dist/chapter/hud-reference-v4.css`; code parsed, browser verification pending. No save or mission logic changes.

- **ChatGPT — Office L1 V6:** `chatgpt/office-l1-detail-v6`, restricted to `dist/assets3d/office-shell.mjs` and collaboration documentation. Non-colliding entry-level office visual refinement; syntax checked, real-browser QA pending.

- **ChatGPT — World materials V5:** prepared on `chatgpt/world-materials-v5-release` after resolving parallel changelog edits with Atacama atmosphere V5. Only `dist/graphics/desert.mjs` and `dist/graphics/world-finish.mjs` changed in game; runtime visual QA pending.

**2026-11-09 — ChatGPT: Atacama atmosphere V5** — Branch `chatgpt/atacama-atmosphere-v5`, file `dist/graphics/atmosphere.mjs` exclusively. Visual update committed; awaiting PR review and real-browser QA. No production or main changes.


- **ChatGPT — Catalog visual correction / Equipment 02:** fix Vehicles identity-rail overlap (144px desktop, 101px compact); show one exploration RC and one production DTH with descriptive temporary labels pending user's express brand/name approval; legacy advanced RC save/order remains visible. Branch `chatgpt/catalog-vehicles-rail-two-rigs`; focused JS and responsive browser CSS geometry verified, awaiting PR/real-game visual acceptance. No product economics or saved identity changes.
- **ChatGPT — Category Audit 01 · Vehículos/DrillTruck:** canonical GLB snapshot shared by Catalog vehicle card, technical sheet, M4 Phone; visually balanced icons and category layout. Branch `chatgpt/drilltruck-real-glb-catalog-audit`, code complete pending PR/production and browser screenshot QA. No state/economy/model behavior changes.

## Files in Progress

- Audit scope: `dist/chapter/drilltruck-image.mjs`, `dist/chapter/builder-ui.mjs`, `dist/chapter/catalog-view.mjs`, `dist/chapter/phone-ui.mjs`, `dist/mission4/phone-apps.mjs`, `dist/chapter/drilltruck-catalog-audit.css`, `dist/index.html`, tests/documentation. Do not touch truck purchase, asset geometry or save data.

## Recently Completed

| Date | Agent | Task | Status |
|------|-------|------|--------|
| 2026-11-06 | Claude Code | Narrative Mission Flow System (M1-M4) | Done |
| 2026-11-06 | Claude Code | Touch Scroll Fix (all panels) | Done |
| 2026-11-06 | Claude Code | GitHub + Vercel Setup | Done |
| 2026-11-06 | Claude Code | AI Collaboration Infrastructure | Done |
| 2026-11-06 | ChatGPT | Collaboration protocol hardening (PR #1) | Merged in main |
| 2026-11-06 | ChatGPT | Catalog V2 visual design (PR #2) | Merged in main |
| 2026-11-06 | ChatGPT | Camera/category scroll + DrillTruck/economy hotfix (PR #3) | Merged in main; Vercel READY |
| 2026-11-06 | ChatGPT | Camera zoom, Catalog in-dock actions, iconography V3 (PR #5) | Merged in main; Vercel READY |
| 2026-11-06 | ChatGPT | World Art V1: upgraded real buildings, Catalog renders, HUD/terrain/roads (PR #7) | Merged in main; Vercel READY; awaiting visual acceptance |

## Blocked / Waiting

_Nothing blocked._

- **2026-11-10 ChatGPT — V52 Patio y conducción nocturna:** rama
  `chatgpt/v52-night-patio-drilltruck-audio`. Focos reales Patio,
  focos delanteros opcionales camioneta personal, motor con RPM, eliminar
  avatar/pasos durante conducción. Código preparado para PR, sin publicar;
  QA en navegador Android y CI pendientes. No tocar M5 misión ni M4.


- **V53 Centro de Faena integrado (2026-11-10)** — rama
  `chatgpt/v53-unified-faena-workshop-logistics`: nueva UI unificada,
  Taller de recuperación técnica, Bodega logística, rutas y accesos,
  V51+V52 incluidos. Revisar
  `CHANGES/2026-11-10_v53-centro-faena-taller-logistica.md`.
  PR68 biblioteca 3D no integrado: faltan GLB reales en GitHub.

- **ChatGPT — 3D Asset Library Wave 01:** branch `chatgpt/asset-library-wave01`, catalog preview additions rebased after V53. 14 source previews; 8 future cards + existing cone/fence cards. No new purchases, no GLB binaries in GitHub yet. Integration of prices, site holograms and real transactions awaits asset upload + QA.

- **V54 DrillTruck® 02 dirección e íconos (2026-11-10):** rama `chatgpt/v54-drilltruck-controls-main-synced`; joystick y teclas normalizados para girar visualmente a derecha/izquierda, faros iconográficos amarillos cuando están activos y freno iconográfico a borde derecho. Ver `CHANGES/2026-11-10_v54-drilltruck-steering-icons.md`. Preserva catálogo de activos de la actualización concurrente.


- **V55 (2026-11-10) — DriveTruck 02 y GPU:** rama `chatgpt/v55-vehicle-collision-render-recovery`. Corrige colisión invisible a 0,10m, 9 sensores, deslizamiento, retorno desde solapamiento; imágenes del Catálogo comparten un solo WebGLRenderer efímero, recuperación tras pantalla blanca sin borrar save. Registro en `CHANGES/2026-11-10_v55-vehicle-collisions-white-render.md`.


- **V56 (2026-11-10) DrillTruck® personal 02:** rama `chatgpt/v56-personal-drilltruck-recovery`; corrige desaparición visual durante carga del GLB automático, restaura solo la propiedad M5 ya pagada/probada y añade Localizar/Recuperar P01 sin costo en Centro de Faena. Ver `CHANGES/2026-11-10_v56-personal-truck-recovery.md`.

- **2026-11-10 — ChatGPT V57 Patio L1 nocturno:** rama `chatgpt/v57-night-yard-visibility`, cambios visuales en `dist/mission5/patio-world.mjs` y regresión V52. Halos recuperados por encima del asfalto, zonas de aparcamiento cubiertas. Se reparó además el cableado de Localizar/Recuperar P01 en `dist/chapter/faena-center.mjs`. Pendiente QA WebGL en Android; sin publicar ni tocar misión, guardados o lógica de conducción. Para la navegación ampliada consultar decisión V57 y coordinación con Claude Code.
