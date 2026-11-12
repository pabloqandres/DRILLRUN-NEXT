# Changelog — DRILL RUN NEXT GENERATION

## 2026-11-11 — V66 (preview): DrillTruck® personal y automática, sesión, NPC/HUD
- Ruedas en ambos vehículos: M5 liga giro a velocidad y ángulo delantero; M4 usa solamente el movimiento que ya realiza en su ruta de servicio, sin alterar la misión 4 ni mantenimiento.
- Conducción pickup tipo bicicleta, progresiva y de reversa/brake realista; motor original suave sin archivos externos.
- Al reanudar, unidad personal existente regresa a P01 y avatar tras 3,5 h a acceso oficina; respeta cash y Cloud Save.
- NPC M5 a altura adulta comparada al avatar; freno diagonal y dock escritorio; JUGAR sin sombra blanca pero logo conserva su sweep.
- Tests V66 + regresiones históricas, CI focal; no publicación en producción hasta aprobación. Ver `CHANGES/2026-11-11_v66-personal-automatic-truck-return-drive-ui.md`.


## 2026-11-11 — V65.1 Galpón holográfico respetando profundidad y polvo ambiental
- Mantiene barrido **exclusivamente sobre logo**, no sobre toda la pantalla. Construcción blueprint progresiva en 3 zonas con fases desfasadas, energía de líneas y nodos de instalación.
- Se recorta el galpón posterior izquierdo usando la silueta del módulo real de primer plano, tanto en trazos animados SVG como en brillo azul WebP, para impedir transparencias poco creíbles.
- Se añaden bancos de polvo y granos a ras del suelo que cruzan la parte baja y los pies de los personajes **detrás de JUGAR**, con movimiento reducido respetado; sin video ni costo WebGL.
- Prototipo sólo en rama de revisión; auth/guardados/M1–M5 sin modificaciones. Validación en Chromium 1280×720 y 832×384; pendiente Android. Ver `CHANGES/2026-11-11_v65-animated-blueprints-depth-dust.md`.


## 2026-11-11 — V64 Pantalla cinematográfica de bienvenida y logo aprobado
- Base visual aprobada: paisaje de faena en Atacama, dos operadores con casco/EPP, edificios reales y blueprints azules, DrillTruck® genérica y logo metálico DRILL RUN NEXT GENERATION extraído de los píxeles originales.
- Nueva vista liviana de entrada con parallax, polvo, escaneo/pulso hologramas, neón de botón JUGAR real, brillo del logo, accesibilidad para movimiento reducido; WebP + CSS, sin MP4 pesado.
- Reutilización del logo exacto en pantalla de login y carga. Flujo nuevo con puerta intermedia `login → carga → bienvenida → selector o continuar`; Cloud Save y lógica de juego sin cambios.
- Rama de prototipo sin publicar hasta aceptación, test V64 y QA en Android pendientes. Ver `CHANGES/2026-11-11_v64-cinematic-welcome.md`.


## 2026-11-11 — V63 Faros ámbar cálidos y reflejo tenue sobre pavimento
- Ajuste de temperatura percibida de faros de la DrillTruck® personal 02 al ámbar cálido de las capturas antiguas. Se conservan cono, intensidad, dirección y calidad.
- Añadidas dos manchas de luz ovales, breves y completamente difuminadas, adaptadas a arena/asfalto por altura real, sin volver al decal largo y blanco de V61. Solo de noche se ven plenamente, y se apagan con el HUD.
- Tests V63 y regresiones V52/V61/V62 adaptadas; preserva control, economía, misiones y guardados. QA visual Android pendiente. Ver `CHANGES/2026-11-11_v63-warm-amber-headlights.md`.


## 2026-11-11 — V62 Faros cálidos y botas correctamente apoyadas
- Se retira por completo el proyector blanco aditivo de 21 m de la V61 y se recuperan los faros originales V60 de tono cálido, con encendido, apagado y rumbo del vehículo sin cambios.
- Ajuste visual localizado del avatar sobre pavimento y senda elevada del Patio (+3–4 cm habituales, con transición de borde), sin levantarlo en arena ni tocar `sampleGround`, misiones, economía o guardados.
- Se conservan la protección de barandas V61, iluminación instalada del Patio y controles de conducción. Tests V52/V61 actualizados y nueva CI V62; referencia `CHANGES/2026-11-11_v62-natural-light-boot-clearance.md`. Validación visual Android pendiente.


## 2026-11-11 — V61 DrillTruck® antiatrapamiento y faros que iluminan camino
- Prevención de atravesar barandas finas a 30 km/h: huella con 21 muestras y barrido cada 12 cm durante aceleración, giro, deslizamiento; permite desenganchar una posición ya solapada mediante marcha atrás.
- Faros personales de luz cálida con proyección real y adaptada a la altura del suelo en dirección de avance, sin depender del eje visual GLB. Encendido/apagado coincide con HUD.
- Patio L1: luminarias más visibles, cobertura de vías interiores, herramientas, combustible y plazas abiertas y techadas, con calidad móvil.
- Mantiene conducción, M1–M5, HSEC y economía; nueva CI de colisiones/luz y regresiones V50–V61. Ver `CHANGES/2026-11-11_v61-collision-night-headlights.md`. QA visual Android pendiente.


## 2026-11-10 — V60 DrillTruck® personal 02: contacto de ruedas y salida segura
- Reemplaza soporte visual de terreno por máximo de 5 puntos por centro + mediana de 4 ruedas con ajuste limitado, eliminando el efecto de levitar al pasar cerca de un relieve.
- Al bajar, omite temporalmente solo el collider de la propia camioneta, y prueba lugares laterales y posteriores sin atravesar cercos/maquinaria. Se restaura el collider siempre, incluso si falla la comprobación.
- Conserva propiedades/guardado, física, M4/M5 y economía. CI V60 focal; QA Android visual pendiente. Ver `CHANGES/2026-11-10_v60-truck-ground-exit.md`.


## 2026-11-10 — V59 Patio: barrera lenta, DrillTruck® apoyada e iluminación real ampliada
- Barrera HSEC: animación de 1.6 segundos independiente de FPS, 1.7 segundos de espera después de perder sensor y apertura anticipada con vehículo a 15 m. Mantiene la colisión física hasta posición segura.
- DrillTruck® personal 02: altura visual calculada en función del asfalto bajo las ruedas y mínimo del GLB. Evita ruedas enterradas en Patio sin alterar física, guardados ni economía.
- Patio L1: plafones funcionales bajo estacionamiento de camionetas, galpón logístico y combustible; halos por encima de losas y cobertura mejorada de maquinaria/P01, con pocas luces dinámicas adaptadas a móvil.
- Tests específicos V59 y regresiones V50-V58. QA visual Android pendiente. Ver `CHANGES/2026-11-10_v59-patio-light-gate-grounding.md`.


## 2026-11-10 — V58 cámara libre de DrillTruck® personal (PR)
- La cámara fija de conducción reemplazada por cámara exterior con órbita relativa al heading del vehículo. El arrastre desde mitad derecha rota visión horizontal/vertical y pinza/rueda cambia distancia; cámara hogar restablece vista trasera.
- Joystick, freno, luces, movimiento físico, colisiones, economía, misiones, Cloud Save y control de DrillTruck® automática se mantienen idénticos.
- Componente en `dist/camera/personal-truck-free-look.mjs`, enlace visual limitado a `game.mjs`, test `v58-personal-truck-free-look.test.mjs` y workflow `v58-personal-truck-free-look.yml`. QA Android requerido; ver CHANGES/2026-11-10_v58-truck-free-look.md.


## 2026-11-10 — V57 Patio L1: cobertura de luz nocturna (rama para revisión)

- Ampliación del paño transitable sobre malla real de 240 × 240 m: límite de seguridad en ±108 m y una misma regla para peatón, vehículo personal y restauración de guardados. Se eliminan bloqueos rectangulares heredados sin eliminar cercos, portones ni colisiones de instalaciones.
- Regresiones V57 dedicadas para límites, saves, vehículo y obstáculos, además de tests M5 históricos actualizados; workflow `v57-terrain-lighting` agregado. Autorización directa del usuario para publicar tras validación.


- Corrige halos enterrados bajo pavimento y pintura (y=0.16 → y=0.295), amplía alcance e intensidad de iluminación existente y permite ver piscinas de luz aunque el presupuesto móvil desactive PointLights distantes.
- Añade cobertura ligera sin colisiones a plazas de maquinaria y P01. Repara los botones inertes Localizar y Recuperar de Centro de Faena: faltaba pasar sus callbacks por el constructor. Mantiene HSEC, M1–M5, economía, controles y guardados.
- La ampliación del límite transitable requiere cambio de lógica coordinado (`scene.mjs`, `state.mjs`, `personal-drilltruck.mjs`) y permanece pendiente.
- PR #76 en borrador. CI específica V52/V56/M5 y relacionadas aprobada; test genérico M4 offline falla también en `main` (preexistente). QA Android/WebGL y publicación pendientes. Ver `CHANGES/2026-11-10_v57-night-yard-visibility.md`.


## 2026-11-10 — V50 DrillTruck® 02 personal (PR)

- Nueva unidad personal adicional comprada en Casa Matriz con despacho
  de maquinaria real. La unidad 01 conserva servicio automático DTH.
- Misión 5 amplía de cinco a seis pasos: recepción del segundo vehículo
  como cierre anterior al SMS final y bono único.
- Vehículo 02 se estaciona en P01, se aborda por interacción o tap;
  joystick acelera, gira y retrocede; freno y cámara exterior elevada.
- Físicas de colisión para estructuras y barrera; datos persisten.
- Sin nuevas marcas, equipos gratuitos o ingresos falsos.
- Ver `CHANGES/2026-11-10_v50-personal-drilltruck-driving.md`.

## 2026-11-10 — V48 Traslado DTH: animación real sincronizada

- DTH recorre el trayecto completo durante los 12 segundos definidos
  en el sistema productivo, mostrando origen/destino y cuenta atrás
  en la ficha de consumibles.
- Al recargar la partida en mitad de un traslado, el modelo continúa
  desde la posición intermedia en lugar de aparecer en destino.
- Se mantienen 15 min/ciclo, ingresos, bit/martillo, DrillTruck y M5.
- Pruebas V48 aisladas y workflow M4 para detectar regresiones.
- Detalle: `CHANGES/2026-11-10_v48-dth-transfer-visual-sync.md`.

## 2026-11-10 — V47 misión activa en portada y dos pasos HUD M5

- La portada y el perfil HUD comparten un lector de misión narrativa
  aceptada; M5 aceptada desplaza a M4 aun sin Patio construido.
- Actualización al volver al menú, al aceptar/cerrar, y tras carga local
  o Google Cloud Save sin guardar snapshots del menú.
- El HUD de M5 muestra **actual + siguiente** (máximo dos);
  el teléfono conserva el detalle completo de cinco.
- Medidas y altura limitadas a viewport en landscape para dejar libre
  el joystick. Sin cambios de lógica, precios, producción ni reward.
- Tests V47 dedicados + ampliación de workflow M5. Ver
  `CHANGES/2026-11-10_v47-live-mission-home-compact-hud.md`.

## 2026-11-10 — V46 checklist M5 y bono de cierre (PR)

- Sincroniza cinco objetivos reales de M5 entre tarjeta HUD y app del Patio;
  resalta el paso actual, bloquea futuros y mantiene scroll en móvil.
- En el flujo nuevo, la técnica requiere guardia; revisión de portón requiere
  ambas contrataciones; inventario requiere portón verificado.
- Bono único de 🪙 12.000 al confirmar SMS final de Elena, con registro
  persistente en ledger; sin pago anticipado ni duplicado.
- Precio total previo de 🪙 49.000, obra de 20 minutos y M4 conservados.
- Pruebas de regresión nuevas y actualización V43. PR pendiente; sin despliegue.
- Detalle: `CHANGES/2026-11-10_m5-live-checklist-reward-v46.md`.

## 2026-11-09 — V25 M4 countdown, actual zone count, RC safe staging and DrillTruck UI

- Add compact first DTH cycle countdown to right HUD, anchored to real 15-minute production timestamps; M4 closing benefactor message auto-opens after first income and DTH continues producing after confirmation. Fix 3/6 fixed zone denominator to real sites, clip DrillTruck catalog/sheet image, move RC/DTH reserve pads to flat playable terrain, guard notification actions and repair drill localization. Rename $/hora as projected DTH income. See CHANGES/2026-11-09_m4-visual-cycle-v25.md.

## 2026-11-09 — V24 M4 guided procurement, workshop/3D deployment and reliable production

- Audit actual M4 engine. Unify Casa Matriz EXPLORA® RC and PUMA® DTH through visible category tabs, add five-stage/11-step operational checklist and remaining budget, restore useful DTH tool installation to Taller, display actual DTH rig and preserve RC in reserve bay, correctly activate DTH only after DrillTruck maintenance, keep completed truck-link check stable. M5 equipment-yard concept documented only. See CHANGES/2026-11-09_mission4-audit-operational-flow-v24.md.

## 2026-11-09 — V23 second-accurate order ETAs and Casa Matriz UI repair

- Orders and Casa Matriz display seconds below 60s for every equipment/material order via one shared ETA formatter, refresh each second. Correct Casa Matriz rig previews and purchasing rows with phone-scoped 2-column layout; scroll preservation untouched. See CHANGES/2026-11-09_order-eta-and-casa-matriz-v23.md.

## 2026-11-09 — V22 workshop acceleration consumes boosters

- Fix infinite free workshop accelerations: each valid boost subtracts one inventory booster, saves audit record and removes up to one minute. Button indicates balance and disables at zero; guard prevents repeat clicks and timer overrun. Existing completed builds unaffected. See CHANGES/2026-11-09_workshop-boost-v22.md.

## 2026-11-09 — V21 M3 closing SMS and phantom workshop posts

- M3 contract payout immediately delivers/opens Camila Reyes' closing message even when the phone shows Contract; previously paid saves with unread final message self-recover. No duplicate reward; explicit narrative confirmation still required for M4. Workshop upgrade no longer mislabels arbitrary 3D meshes as light poles: reads only real built HSEC assets and drops misleading auto-removal warning. See CHANGES/2026-11-09_m3-closing-workshop-posts-v21.md.

## 2026-11-09 — V20 M3 90/90 m completion and countdown correctness

- Fix M3 stuck at 11/13 after 3/3 physical boreholes due to 89.99999999999997 m floating-point precision. Normalize finished metres and recognize existing saves only when all real boreholes are complete. HUD timer shows PERFORACIÓN COMPLETA / LISTO instead of expiring after work finishes. Speed bonus uses drilling finish timestamp, not delayed phone delivery; no double payout. See CHANGES/2026-11-09_m3-meter-precision-v20.md.

## 2026-11-09 — V19 phone scroll, input reliability, catalog polish, shed lighting

- Fix same-app phone scroll resetting after bit/hammer purchases; native phone scroll restored. Release held PC controls when phone/modal takes focus or window blurs. Contain RC rig previews and use readable names in Casa Matriz. Reduce concrete/gravel steps by 31/38%; add two cold-white interior ceiling lights in completed shed. No mission/economy changes. See CHANGES/2026-11-09_phone-scroll-input-v19.md.

## 2026-11-09 — V18 immersive worksite sound and cinematic Atacama polish

- Add original Web Audio spatial sounds for gravel/concrete footsteps, operating RC/DTH drill, active DrillTruck, workshop metalwork and office hum. Add state-driven industrial lights, rotating rooftop extractor, machine warning beacons, welding sparks, moving vehicle dust and contact shadows. New mineral skyline mesas and cinematic sky sunlight. No game/economy/mission changes; optional effects honor audio preference and low graphics preset. See `CHANGES/2026-11-09_immersive-atacama-v18.md`.

## 2026-11-09 — V17 HSEC status integrated into top bar

- Relocate HSEC score chip from the standalone right-hand floating rail to the main HUD header directly before Phone, following money/energy/boosters. Responsive icon+number in compact landscape. Same score and click handler, no game logic changes. M2/M3 checklist from V16 confirmed approved by user. See `CHANGES/2026-11-09_hsec-top-header-v17.md`.

## 2026-11-09 — V16 live mission requirements shared by HUD and details

- M3 left mission card and phone details use identical next-pending check from mission3Objectives: if the rig is missing, request it rather than vague equipment wording. Both show 13 real checks and matching progress. M2 HSEC overview and left mission card use the same seven completion criteria. Read-only, no mission logic/save/economy modifications. See `CHANGES/2026-11-09_live-mission-checklists-v16.md`.

## 2026-11-09 — V15 camera navigation during construction

- Wider builder aerial zoom (10–70 m), 80° elevated entry outside nearby buildings, independent camera pan from existing joystick/touch-drag and arrow keys, and no zoom reset when choosing new placement points. Preserves character camera and all game-state mechanics. New targeted tests in `tests/builder-camera-v15.test.mjs`; mock camera checks passed; live WebGL QA pending. See `CHANGES/2026-11-09_builder-camera-navigation-v15.md`.

## 2026-11-09 — V14 universal M1–M4 mission card polish

- Rebuilt the shared mission HUD visually with a bounded flex layout, integrated collapse tab, contained “Ver detalles” footer/arrow, improved content spacing, progress and compact-screen sizing. CSS-only; no changes to mission data, input events or game state. See `CHANGES/2026-11-09_mission-card-v14.md`.

## 2026-11-09 — V13 compact HUD telemetry rail

- Independent, compact HSEC score chip moved outside the mission card and placed at top-right below resources; the geological analysis timer sits below it on the right. Eliminates the overlapping stack on left mission instructions. No mission, save, interaction, scoring or economy changes. See `CHANGES/2026-11-09_hud-right-rail-v13.md`.

## 2026-11-09 — V12 unified painted road junctions

- Repaired material-layer seams at HSEC road intersections, curves and T-junctions by painting every route in shared passes. Corrected metric road width under non-square terrain decal map. Zebra marks remain clipped to the actual vehicle pavement. No gameplay or saved-state changes. See `CHANGES/2026-11-09_road-junctions-v12.md`.

## 2026-11-09 — V10 continuous road junction rendering

- Vehicle road painting now stays continuous beneath pedestrian crossings; zebra stripes clipped to constructed roads instead of creating floating rectangular overlays. No HSEC logic or saved state changes. See `CHANGES/2026-11-09_road-junctions-v10.md`.

## 2026-11-09 — HSEC crossing / maintenance shed light V9

- Crosswalk uses a single flush painted decal aligned with route textures; removed double 3D elevated slab and corrected nonuniform canvas rotation scaling.
- Maintenance shed now has warm actual lamps at night, subject to operational condition and light budget; emissive lens materials reinforce the appearance. No HSEC scoring, saved-data, mission or collision changes. See `CHANGES/2026-11-09_hsec-crossing-shed-light-v9.md`.


## 2026-11-09 — Narrative phone V8 and SMS-gated mission lifecycle

- High-contrast phone text, illustrated portraits of Elena/Marco/Camila and first-open, per-message typewriter (fixed premature read marking).
- Initial mission messages ring and open; accepted SMS starts missions; final SMS rings/glows until explicit completion and displays reward overlay. M1 HUD clearing/building and M2 HSEC scoring no longer start prior to narrative acceptance. M3 final overlay now on narrative confirmation, with real already-paid contract reward.
- No changes to core economy, state/save formats, existing narrative storage or third-party branding. V8 V8-syntax/static message-render checks pass; browser QA remains pending.
- See `CHANGES/2026-11-09_narrative-phone-lifecycle-v8.md`.

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

## 2026-11-10 — V52 Patio real nocturno y DrillTruck personal
Rama `chatgpt/v52-night-patio-drilltruck-audio`. Implementados
PointLights reales con presupuesto GPU y focos SpotLight orientados
hacia delante del DrillTruck 02, botón de luces, avatar oculto
antes del render y audio de motor con velocidad. No altera misiones,
guardado de progreso, costos o DTH automático. CI + Android QA pendientes.
Ver `CHANGES/2026-11-10_v52-night-patio-personal-driving.md`.


## 2026-11-10 — V53 Centro de Faena, Logística y Taller
UI operativa única, detalle de instalaciones, Taller de recuperación
con kits y despachos pagados, acceso contextual y teléfono simplificado
post M4. Integra V51 animación NPC/Patio y V52 iluminación nocturna/
conducción. Tests enfocados verdes; 2 regresiones preexistentes
M4 offline en CI global no resueltas. Biblioteca 3D PR68 sin binarios.

## 2026-11-10 — Wave 01 3D visual catalog (PR #68)
- Source-model miniatures for 14 optimised user assets embedded as compact WebP atlas; 8 additional future catalog cards, 3 in new Circularity tab; current HSEC cone/fence prices unchanged.
- Zero economy, mission, save, purchase or World changes. Visual assets full GLBs remain in the user's ZIP; C4D needs export. V53 Workshop and Operations controllers preserved.

## 2026-11-10 — V54 Dirección DrillTruck® 02 + botones icónicos
Corrección al giro del joystick/teclado; faros OFF neutros, ON amarillo; freno SVG sin texto y Catálogo oculto mientras se conduce. Sin cambios económicos, M4/M5 ni modelos. Aplicado sobre `main` actualizado con la biblioteca de catálogo.


## 2026-11-10 — V55 Colisiones y pantalla blanca
Corregido margen vehicular y movimiento en estrechamientos; unificación de contextos gráficos de miniaturas de Catálogo, limpieza del renderer, recuperación segura por pérdida de contexto y opción desde Configuración. Tests focalizados. Sin cambios en M1–M5 ni saldos.


## 2026-11-10 — V56 Recuperación DrillTruck® personal 02
Modelo visual independiente de carga M4, localizador de flota y recuperación en P01 sin compra extra, reparación de pose inválida en partidas guardadas, CI para propiedad y M5. Sin cambios en ingresos/misiones.

## 2026-11-11 — V68 selector cinematográfico real
- Rama `chatgpt/v68-cinematic-real-avatar-selector` desde main e9393305. Reencuadre cercano del GLB real, retratos/figura fuente del mismo asset, diseño responsive, bonos auténticos y campo de nombre, click/whoosh y vibración discreta. Ajustes acotados shared hooks con coordinación en DECISIONS. CI focal y preview, QA usuario pendiente; no producción.

## 2026-11-11 — V69 · Acceso directo, NPC de tamaño adulto y selector con bono real
- Corrige UI solicitada tras revisión de V68: elimina segundo botón JUGAR y portada intermedia; login -> selector (sin partida) o partida restaurada (con save), preservando Cloud Save e introducción de personaje.
- Guardia y técnica dejan de calibrarse con AABB skinned transitoria y usan la estatura adulta nominal del avatar. Sin rutas/compra/misiones modificadas.
- Selector: corrige detección `Number(undefined)!==0`, abre bono de cada avatar, reemplaza +/- porcentajes por barras de 4 áreas con 2 atributos visuales y +1 a especialidad. Primer plano GLB más cercano y key/rim siguen al personaje; gradiente central transparente.
- Tests V64/V66/V68 actualizados, nuevos V69 y workflow focal. Rama `chatgpt/v69-direct-entry-npc-selector-polish`. Ver CHANGES/2026-11-11_v69-direct-entry-npc-selector-polish.md.

## 2026-11-11 — V70 fullscreen de entrada + microsonidos audibles
- Rama `chatgpt/v70-immersive-entry-ui-feedback`; referencia captura Android con barra URL encima del selector. Solicita fullscreen desde los cuatro gestos de entrada, no después de promesas Google, y añade control manual de reintento en selección sólo si la API está disponible. El navegador puede denegar; PWA instalada mantiene modo fullscreen sin URL.
- CSS V70 usa alto `100dvh`, márgenes inferiores y CTA compacto para que «Comenzar mi proyecto» permanezca visible aun con barra de navegación. Volumen de clicks y whoosh V68 aumenta ~2.5×, teclado tenue y preferencias Sonido/vibración respetadas.
- Tests V70 + regresiones V69/V68/V64 superaron CI dedicada, preview Vercel READY. Sin Cloud Save, misiones, economía ni modelo 3D modificado. Ver `CHANGES/2026-11-11_v70-immersive-entry-ui-feedback.md`.

## 2026-11-11 — V71 · Mejoras visuales de misión 2
- Usuario confirmó M1 cerrada. En M2, pestañas de HSEC estaban cortadas por scroll, ficha de Oficina ocupaba mucho terreno y Galpón estaba detrás de Taller/Patio.
- Nuevo `dist/chapter/m2-layout-v71.css` (cargado al final de `dist/index.html`): tabs HSEC siempre visibles en cabecera con desplazamiento horizontal cuando proceda; checklist con scroll vertical propio. Ficha de Oficina estrecha con preview real y acciones de mejora accesibles, sin tapar la construcción.
- Catalog de Edificios muestra **Oficina → Galpón → Taller → Patio**; mueve la referencia existente `shed` sin cambiar datos, estado, economía ni condiciones.
- Test V71 y regresiones V39/V16 pasaron en CI focal. Preview READY; QA visual móvil pendiente. Documentación `CHANGES/2026-11-11_v71_mission2-hsec-office-galpon.md`.

## 2026-11-11 — V72: Galpón 60 s con progreso y M2 vehicular 12 m
- Galpón de mantenimiento pasa de 25 s a **60 s**, con barra del estilo Taller y MM:SS real en HUD, ficha en mundo y HSEC, usando únicamente el estado actual. Se preservan Galpones terminados y se extienden sólo trabajos antiguos aún en construcción.
- Objetivo de camino vehicular ahora requiere **al menos 12 metros finalizados** (distancia en checklist + barra), sin conectividad invisible a puntos fijos. La ruta sugerida mide 13,85 m y lo satisface. Condición peatonal, cruces seguros y puntuación HSEC se mantienen.
- Nuevos tests V72 y CI focal 13/13 OK, con V71 y M2 V16. Legacy `hsec.test.mjs` no se usa en gate porque presupone boosters iniciales y un presupuesto de mallas ya desactualizados. QA Android pendiente. Véase `CHANGES/2026-11-11_v72_shed-road-meters.md`.

## 2026-11-11 — V73 Taller 90 segundos y 3 sondajes
- Taller Nivel 1 pasa a 90 s; barra verde/porcentaje/MM:SS en HUD anclados a timestamps de la obra; ampliación L2 sigue 300 s, precio igual. Migración idempotente sólo para obras antiguas aún en curso.
- Camila Reyes comunica 3 sondajes de 30 m en los 5 idiomas. El teléfono lee la cantidad real desde el contrato, sin fallback falso a 6.
- CI focal de V73 + regresiones de contratos y narrativa completó con éxito. Diseño de Personal sigue pendiente de aprobación; auditoría navegación de 8 categorías será un cambio aparte.

## 2026-11-11 — V74 navegación completa de Catálogo (M1–M5)
- Las ocho categorías ya existían, incluyendo **Seguridad** y **Personal**, pero las dos últimas quedaban fuera del área visible del panel horizontal sin indicador de navegación.
- Flechas visibles anteriores/siguientes con estado deshabilitado correcto, desplazamiento con gesto horizontal en Android, rueda de mouse en PC y flechas de teclado, sin perder la categoría activa al reconstruir UI.
- CSS con tamaños responsive y controles accesibles; sin tocar lista de productos, precios, restricciones, Cloud Save, campañas ni misiones.
- Suite V74 + regresiones V71/V58 pasó. La pantalla Personal premium sigue sin implementar hasta aprobación.

## 2026-11-11 — V75 Catálogo 7 categorías, Personal independiente
- Se elimina **Personal** del Catálogo: ahora Edificios / Equipos / Vehículos / Caminos / Delimitación / Iluminación / Seguridad. Se retiran los productos virtuales de personal y el acceso a contratación duplicado dentro de Builder.
- El botón **Personal** sigue abriendo su ventana propia en Centro de Faena, con contrataciones de M3/M4/M5, inventario de NPC y limitaciones de rol sin cambios. La futura interfaz premium queda pendiente de aprobación.
- Las siete categorías se validan en M1–M5 y se conserva la nueva navegación V74 (flechas, swipe y teclado). Pruebas V75 + V74 + V71 correctas, QA visual Android pendiente.

## 2026-11-11 — V76 Personal premium con 21 candidatos
- Ventana Personal compacta, independiente del Catálogo: 7 roles × 3 candidatos, carrusel de tarjetas con retrato ficticio, ficha ampliada, habilidades 1–5, contratación y equipo activo, orientación automática hacia requisito M3/M4/M5.
- Se añaden 21 retratos SVG originales sin marcas ni logos como primer pase de arte (sujetos a aprobación visual), nombres/IDs propios, precios por candidato y perfiles de habilidades persistentes con `effectsEnabled:false` (sin efectos nuevos de economía).
- La contratación usa las acciones de M3/M5 originales y conserva el guardado, modelos GLB existentes y posiciones de NPC. Slots del UI crecen con el avance de misión; no hay bloqueo adicional.
- Audio UI/selector ahora tiene control de volumen 0,5–3,5, valor inicial 2×, conserva mute y háptica mínima.
- CI V76 focal y regresiones V75/V73/V70 aprobadas. Preview Vercel READY; revisar Android y aprobar calidad del arte antes de dar versión final. Ver `CHANGES/2026-11-11_v76_personnel-premium.md`.

## 2026-11-11 — V77 Personal · placeholders neutros sin retratos finales
- Se difiere el lote de 21 retratos definitivos según decisión del usuario; se mantiene identidad, rutas de arte en datos y retratos V76 almacenados, pero la interfaz muestra sólo placeholders CSS originales sin logotipos.
- Cards incluyen tres habilidades 1–5 con pips informativos. La ficha y el Equipo activo muestran el mismo placeholder; al pulsar un contratado se abre su ID real y no el primer candidato de ese rol.
- Conserva contratación M3/M5, costos, capacidad por misión, guardado/restore, GLB y misiones. Los atributos siguen sin bonificaciones gameplay (`effectsEnabled:false`).
- Rama `chatgpt/v77-personnel-placeholders-ux`; QA automatizado focal y regresiones en CI, revisión visual Android pendiente. Registro detallado en `CHANGES/2026-11-11_v77_personnel-placeholders-ux.md`.

## 2026-11-11 — V78 arte Personal: 3 administradores y UI más aireada
- Camila/Matías/Sofía con retratos originales, CSS atlas optimizado y Ficha/Equipo activo sincronizados; 18 retratos restantes siguen pendientes con placeholders.
- Mayor espacio en panels, roles, skills y cards donde cabe sin cortar Android horizontal.
- Sin modificaciones de contratación, misiones, economía, GLB ni Cloud Save. Pruebas V78/V77/V76 sujetas a CI. Registro en CHANGES/2026-11-11_v78_personnel-admin-art.md.

## 2026-11-11 — V79 · Personal Gestión de Equipo, habilidades base y propuesta salarial
- Fondos de misión exclusivos SVG para M1, M2, M3, M4, M5 y juego libre (sin marcas).
- Se ajustan las tres habilidades iniciales de cada uno de los 21 candidatos a 1–3; los contratados preexistentes mantienen su perfil guardado. `salaryPerShift` propuesto por candidato, sin activar débitos ni efectos en ingresos.
- Vista de Gestión de Equipo con ficha del empleado, progresión registrada, reclutamiento, remuneración propuesta y total del equipo, todo informativo. Personal continúa independiente del Catálogo, con el primer lote de imágenes V78.
- Contrataciones, costos reales, misiones y guardados se preservan. Pendiente aprobación de reglas económicas para el cobrador futuro.

## 2026-11-11 — V80 · Rediseño visual de Personal según referencia aprobada
- Revisión a fondo a partir de cuatro capturas reales del usuario y referencia visual. Panel Personal pasa a estilo cinematográfico: cabecera propia, misión ilustrada, tarjetas altas con ilustración dominante, bordes marcados, seleccionado dorado, pestañas funcionales de información y barra de equipo.
- Corrección del aspecto de tres retratos V78 (Camila Rojas, Matías Torres, Sofía Ibarra) mediante recortes individuales SVG autocontenidos del WebP original, mostrados sin deformación (`object-fit:cover`).
- Slider «Volumen de interfaz» trasladado a Configuración, manteniendo persistencia anterior. Inicio/carga: alineación izquierda de logo, rótulo y texto.
- Sin cambios a contratación, economía, misiones ni Cloud Save. Incluye pruebas focales y documentación de QA.

## 2026-11-11 · V81 · Personal sin microparpadeo; layout compacto de referencia
- Diagnóstico exacto: render automático cada 2,6 s reconstruía completamente el DOM de Personal. La comparación de markup ahora omite el reemplazo cuando nada cambia y puede refrescar saldo in situ.
- Iconografía incorporada a Administrador de Contrato en encabezado y 22 habilidades (11 trazados semánticos compartidos) en tarjetas/ficha. El retrato se muestra como imagen con relación nativa, `object-fit:cover`, sin animación ni transiciones de dimensiones.
- CSS V81 cargado al final: tres tarjetas más angostas con seleccionado dorado, jerarquía compacta, ficha derecha sin overflow horizontal ni pestañas cortadas, retrato y descripción de personaje reordenados y adaptabilidad a Android apaisado.
- Ningún cambio en producción, misiones, contratación, economía, salario, Cloud Save o assets GLB. PR/CI focal y revisión visual Android pendientes.

## 2026-11-11 — V82 · Centro de Faena cinematográfico
- Vista overview completamente rediseñada, no un mockup: misión con escena propia, resumen operativo real, 4 operaciones con fotos, 4 accesos de gestión, recursos en cabecera, sin texto redundante ni dock inferior repetido.
- Ocho imágenes WebP independientes optimizadas (~116 KiB), más 14 pictogramas vectoriales originales sin marcas, bajo `dist/assets/faena-v82/`.
- Cada botón abre la ruta original: producción, logística, taller, patio/flota, contratos, Personal V81, seguridad HSEC, Casa Matriz. Misión 5 Patio continúa accesible desde Patio/Flota; no desaparecen funciones.
- `faena-hub-v82.css` presenta marcos pronunciados, brillos cian/amarillo, fondo de faena, desplazamiento táctil y layout para Android apaisado; no afecta a Personal.
- Vista estable en actualizaciones periódicas sin cambios del contenido. Sin modificar compras, contratos, dinero, XP, HSEC, misiones, GLB ni Cloud Save.
- Proceso: rama `chatgpt/v82-faena-command-center`, PR y CI focal; QA visual Android a cargo del usuario después del autodeploy a producción.

## 2026-11-12 — V83 · Dock semirradial interactivo
- Un botón circular inferior reemplaza visualmente la botonera extensa. Tocar abre/cierra; mantener abre tras 290 ms; arrastrar horizontalmente, tocar los laterales o usar flechas gira un ícono por paso.
- Arco deliberadamente bajo, 3 accesos destacados y 2 anticipo difuminado con gradiente radial; transición de rotación por transform/opacity, sin recalcular el DOM ni refrescos periódicos, responsive Android landscape.
- Diez rutas reales conectadas a menús existentes, sin duplicación de acciones, economía ni misión. Compatibilidad: los botones legados permanecen en DOM para gatillos/permiso de catálogo/HSEC.
- Feedback de audio y háptico ya existente; volumen y estado de sonido desde Configuración, sin muestras externas ni efectos en bucle.
- `semi-radial-dock-v83.mjs`, `semi-radial-dock-v83.css`, import/call acotados en `game.mjs`, link en `index.html`, pruebas focales. Validación visual en Android tras desplegar.

## 2026-11-12 — V84 · Arco semirradial de geometría real
- Captura de usuario V83 contradijo su referencia: secciones cuadradas flotantes, no una rueda. V84 reemplaza cada sección por path SVG curvo, simetría central gold / segmentos cyan inclinados, guías sin fondo gris.
- Dos sectores fantasma laterales con blur/gradiente radial; botón inferior pictograma excavadora. Forma adaptativa paisaje Android, más baja que tarjetas anteriores.
- CSS aislado al final; la lógica de rotación, navegación, sonidos y hápticos V83 permanece sin modificaciones. Tests de estructura SVG 3+2 y regressiones V83–V81.

## 2026-11-12 — V85 · Icono Restablecer vista y espacio al joystick
- Cambiado solo ícono de `#cameraHome`: flecha circular más retícula (no cámara fotográfica); accesibilidad `Restablecer vista`.
- Nuevo `reset-view-control-v85.css` posterior a V84: botón independiente con mayor distancia horizontal del joystick, dimensión táctil de 46 px escritorio / 42 px landscape / 38 px estrecho, contraste cian y foco visible, sin animación ociosa.
- Función JS original de reinicio de cámara intacta. Ningún cambio de lógica, navegación, misiones, saldo o Cloud Save. Test focal V85 y regresión UI.

## 2026-11-12 · V86 · Semirradial continuo, rescate seguro y Personal sin recorte
- **No se restaura el menú viejo**: se mantiene `installSemiRadialDock` y los diez destinos V83. Sustituido visualmente el montaje tosco por una sola cinta SVG de tres sectores, seleccionador central dorado, bordes cian discretos, dos anticipos difuminados, icono abstracto de comando, giro ~.58 s con desaceleración y límites de frecuencia de arrastre.
- Eliminado completamente el control HUD `cameraHome` demasiado cercano al joystick, incluido el CSS V85 y pruebas exclusivas ya obsoletas.
- Configuración: nueva acción `Desatascar jugador`. Emplea la función pura `officeRescueTarget` y comprobaciones de colisión en oficina/acceso, resetea movimiento/cámara y guarda solo la posición; al bajarse del DrillTruck personal, queda estacionado en su posición.
- Personal: filas main/roster con altura garantizada; fija el pie visible y desplazamiento horizontal de plazas, más contención vertical del panel derecho y jerarquía visual.
- Tests V86 y regresiones V83/V84/V82/V81 en Actions; dos fallos legados de economía offline M4 ajenos al cambio persisten en workflow genérico.

## 2026-11-12 — V86.1 arreglo de inicio y botón Continuar
- Fix crítico: referencia a `cameraHome` inexistente tras V86 causaba excepción al cargar `applyText()`; retirado de etiquetas y añadido encadenamiento opcional para elementos UI opcionales.
- Recupera flujo normal de actualización de `Continuar` y estados de sincronización Google (sin modificar políticas de Cloud Save).
- Prueba inicialización de accesibilidad / IDs, regresiones de Personal, Faena y semirradial.

## 2026-11-12 — V87 DRILL RUN vuelve a blanco/naranjo
- Restaurado logo tipográfico clásico DRILL blanco / RUN naranja en inicio y loading, sin textura futurista, relieve ni brillo.
- Unificada la identidad en selección del avatar, puente del minijuego, favicon y manifiesto PWA.
- Retirada del código la imagen WebP metálica incrustada V64 (no solo oculta), CSS simple V87 final.
- Pruebas focales y regresiones de inicio V86.1; no se modifica `game.mjs`, Auth, Cloud Save, misiones o economía.

## 2026-11-12 — V88 · Arco y Personal: corrección visible en PC
- Arco con tres secciones, una sola línea perimetral, iconos y textos alineados al sector, botón principal separado.
- Navegación PC visible mediante flechas y leyenda «10 secciones», sin perder soporte táctil ni sonido.
- Personal muestra retratos originales individuales para 21 candidatos, no placeholders en 18; mantiene datos y permisos originales. CSS de PC + Android con pie no cortado.
- Regresiones focales y CI; no alterar Cloud Save ni misiones.

## 2026-11-12 — V90 · Rueda radial de geometría real
- Sectores definidos por un mismo centro y radios precisos, bordes finos, núcleo con profundidad y margen inferior.
- Botones orbitan realmente en curva y mantienen sus íconos/textos derechos por contrarrotación. 3 destinos definidos + 2 difusos, flechas y sonido preservados, contador eliminado.
- Eliminados los cuatro CSS radiales anteriores de la carga; un CSS V90 único. Sólo cambió el import correspondiente en `game.mjs`.
- CI V90 y regresiones de Google/inicio, Personal y Centro de Faena; QA visual Android/PC posterior.

## 2026-11-12 — V91 · Historial financiero
- Consulta pura de movimientos `ledger`, con fecha, concepto, tipo e importe; ingresos, gastos, transferencias y eventos sin cargo. Totales de solo movimientos guardados, caja y banco reales. No se reescriben saldos, payouts ni guardados.
- Centro de Faena añade acceso «Historial financiero»; tocar el saldo HUD abre la consulta. Filtros Todos, Ingresos, Gastos, Transferencias, Eventos.
- Historial conservado limitado a 100 registros y posibles operaciones antiguas faltantes, informados dentro de la pantalla. Módulo exportable para futuras apps.
- Tests de pureza, filtros, clasificación y arranque. Producción sujeta a verificación.

## 2026-11-12 — V92 · Radial touch y detalle premium
- Corregido swipe sobre superficies SVG circulares, continuado por window pointermove y fallback en pointerup; ahora el dedo puede recorrer el arco fuera del icono. Menor umbral con detents controlados; flechas/tap/sonido siguen operativos.
- Menú desplazado hacia arriba, con margen visible respecto al borde del teléfono, sin cambiar la forma del arco.
- Tres gajos con glass/reflejos de borde precisos, centro resaltado y hub con aro más trabajado, sin incorporar capas CSS extra o pictogramas nuevos.
- Solo `semi-radial-dock-v90.mjs`, `semi-radial-command-v90.css`, pruebas y documentación; código financiero y de misión intactos.

## 2026-11-12 — V94 · Menú radial de esquina aprobado
- Adaptado el semirradial V90 a cuatro sectores geométricos compactos alineados con el botón de acción y joystick, márgenes seguros y base compartida; botón acción es más protagonista y conserva su comportamiento.
- Sin flechas visibles: drag angular continuo con freno intencional (145 ms por categoría), ciclo infinito de diez destinos y snap preciso al soltar, sin inercia. Cuadrícula en hub independiente de retícula de acción.
- Sin cambios a `game.mjs`, misiones, HSEC, economía, modelos, Google o Cloud Save. JS/geométrico y DOM simulado comprobados; CI y QA visual Android pendientes.
- Rama `chatgpt/v94-corner-radial-safe-touch`, registro `CHANGES/2026-11-12_v94_corner-radial-safe-touch.md`.

## 2026-11-12 — V95 · Seis accesos radiales compactos, círculo matemáticamente correcto
- Revisión solicitada tras captura V94 y referencia de seis iconos: radio exterior de 465 a 365, interior de 296 a 244, con seis sectores polares de 15° en el mismo centro (500,465), sin módulos rectangulares ni reubicar botones base.
- Orden inicial visible: Centro de Faena, Catálogo, Producción, Inventario, Personal, HSEC. Taller, Patio y flota, Contratos y Casa Matriz siguen en los 10 accesos mediante giro infinito, sin crear rutas nuevas.
- Íconos y etiquetas adaptados a sectores más estrechos; giro con ajuste a 15° y freno intencional, clic/touch directo sobre cualquier gajo. Fondo y botón de acción permanecen independientes y alineados, sin cambios de joystick, misiones, economía, Cloud Save ni game.mjs.
- Rama `chatgpt/v95-compact-six-radial`; pruebas focales V90/V92 actualizadas, QA en navegador/Android pendiente.

## 2026-11-12 — V96 · Extremos radiales infinitos, botones centrados
- Implementación directamente sobre V95 en `dist/chapter/semi-radial-dock-v90.mjs` y `semi-radial-command-v90.css`: dos continuaciones anulares matemáticamente congruentes más allá del viewport (–103° y +17°) con máscaras SVG, no interactivas.
- Solo se difuminan el gajo inferior (step –1) y superior (step 4); Inventario y los otros cuatro accesos interiores quedan nítidos pese al filtro heredado de V90.
- Reducción del hub 100→84 unidades CSS locales y del botón acción ~16–18%; centros conservados exactamente en la línea inferior aprobada, con base ligeramente más pequeña y márgenes intactos. Tamaño del arco, giro táctil, destinos, joystick, misiones y saves sin cambios.
- Prueba de regresión visual estructural V96 añadida al test V90, PR/preview antes de merge; QA de dispositivo pendiente.

## 2026-11-12 — V97 · Corrección de continuidad óptica y botones internos
- Los gajos de extensión V96 ahora son tres finos trazos SVG con centro y radios matemáticamente iguales a la rueda; `fill:none`, máscaras de degradado y sin captura de eventos. Desaparecen los bloques oscuros sólidos que invadían la imagen.
- Base inferior más discreta (x290, y352, 248×111) contenida dentro del agujero circular. Hub 68×68 centrado en (332,392) sin sobresalir sobre ningún gajo; botón de acción reducido a 10dvh y recentrado manteniendo su propio icono dorado.
- Los seis gajos V95, giro infinito V95/V96, joystick, panel de misión y lógica de juego permanecen sin cambios.
- PR de V97 con tests estructurales V90; el usuario ordenó subir a main siempre tras las pruebas.

## 2026-11-12 — V98 · Burbuja dual del HUD y cierre automático al moverse
- Se sustituyó la placa decorativa rectangular detrás de los dos controles por un único SVG ondulado con lóbulo circular para menú y otro para acción, unión suave y contorno de 3,6px más borde de vidrio interior; ambos botones mantienen identidad independiente.
- Se mantiene visible y por encima el botón de acción aunque el juego establezca su opacidad inline en .45 al no haber acciones disponibles; el estado `disabled` no se altera.
- Al detectar intención de marcha por joystick (umbral al salir del centro) o WASD/flechas, se cierra radial y se aplica el colapso existente a `#objective`, conservando la pestaña manual. No se vuelve a abrir automáticamente al detenerse. No se cierra por tocar el centro del joystick ni por escribir en un formulario o consultar el teléfono.
- Transición de acordeón de misión respetando prefers-reduced-motion. Ningún cambio a `game.mjs`, estado, misiones, Cloud Save ni geometría de los seis sectores.
- Pruebas V90/V92 extendidas; rama `chatgpt/v98-bubble-dock-auto-hud` para validar antes de integrar a main.

## 2026-11-12 — V99 · Panel de misión independiente y botón de acción burdeo PUMA
- Se corrigió el handler de clic exterior del menú radial para excluir tanto el contenedor `#objective` como sus hijos (incluido `#objToggle`). Expandir/retraer manualmente la misión ya no cierra la rueda, pero tocar otra zona externa sí conserva el cierre preexistente.
- El movimiento con joystick o WASD/flechas conserva íntegra la V98: cierra rueda y retrae misión por presentación, sin auto-reapertura al detenerse.
- El ícono de acción anterior `interact-focus` se sustituyó por la mano del set original, en el mismo botón y sin modificar listeners de juego.
- Diseño de botón en burdeo PUMA sólido con gradiente 3D, inactivo oscuro y legible, disponible luminoso con brillo; `disabled` se mantiene controlado por game.mjs.
- Pruebas V92 ampliadas para independencia de panel, movimiento, selección de icono y estilos. No cambia rueda de seis segmentos, plinto de doble burbuja, misiones, save, estado ni HUD restante.

## 2026-11-12 — V100 · Personal compacto aprobado, retratos sin estiramiento
- Ventana desktop al 85vw × 84dvh (responsive en celular), encabezado minimalista, cuatro roles principales con divulgador de restantes; se conserva acceso a los 7 roles y sus bloqueos existentes por misión.
- Centro: 3 candidatos, retrato, nombre, estrellas, 3 habilidades con pictogramas y puntos, costo y estado; sin duplicar Contratar. Ficha derecha: cabecera breve, 3 habilidades y botón único; «Más detalles» incluye Ficha/Desarrollo/Salario/Historial sin pérdida de datos.
- Staff inferior: solo 3 plazas visibles, nombres de dos líneas y retratos circulares sin corte, desplazamiento horizontal nativo por touch/ratón, flechas pequeñas con contador 1/n, acceso a Gestionar; capacidad y empleados reales provenientes del estado original.
- Las ilustraciones utilizan su ratio intrínseco, object-fit:contain y image-rendering:auto, sin transformar ni estirar. Las 3 imágenes V80 de Administración son 230×260 raster por persona; no se inventa un nuevo diseño facial ni se promete recuperar resolución ausente. El resto se basa en SVG vectoriales.
- Archivos: renderer `personnel-premium-v76.mjs` (solo presentación), `personnel-v100-interactions.mjs` (pager), CSS nuevo `personnel-compact-v100.css`, carga última en `dist/index.html`, tests V100/V81 y workflow V100. Se mantiene V81 no redraw, se preservan hires, roles, economía, M1–M5 y Cloud Save.
- **Fase funcional de vacantes por misión/recompensas pendiente:** para no inventar premios ni romper saves, se conserva `personnelCapacity` y se deberá acordar el nuevo contrato de progreso con el propietario del estado antes de escribirlo.

## 2026-11-12 — V101 · Habilidades compactas y paginador perfectamente centrado
- Corregida la desalineación óptica de flechas inferiores: sustituidas las dos entidades tipográficas ‹/› por SVG chevrons matemáticamente simétricos con `viewBox 24`, mismo tamaño y grosor, centrados por flex en botones de dimensiones idénticas. Contador `1/n` con alineación vertical y cifras tabulares.
- Habilidades clave de la ficha derecha: las tres tarjetas sobredimensionadas pasan a lista de tres filas finas (ícono, etiqueta y cinco puntos en la misma línea), sin duplicar información ni cambiar `skills` o el estado del candidato. Se compacta el alto y se acerca «Más detalles».
- CSS nuevo `personnel-tuning-v101.css` con reglas scoped a Personal, cargado después de V100 en `dist/index.html`. En `personnel-premium-v76.mjs` cambia solo el SVG dentro de botones de navegación; conserva los mismos `data-pv-team-scroll`, discapacidades, fotos, tarjetas, vacantes y acciones existentes.
- Suite `tests/v101-personnel-skills-pager.test.mjs`, workflow V101 y regresiones V76–V100; no modificaciones a `game.mjs`, `state.mjs`, Cloud Save ni progresión de misiones.
