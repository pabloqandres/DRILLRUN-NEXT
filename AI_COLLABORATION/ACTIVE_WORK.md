# Active Work — DRILL RUN NEXT GENERATION

**Last updated:** 2026-11-06

## Currently Active

- **ChatGPT — V102 Taller técnico y avance real de construcción (2026-11-13):** rama `chatgpt/v102-workshop-dashboard-progress`. Rediseño exclusivo de la vista Taller de Centro de Faena con CTA dorado visible `Mejorar a nivel 2`, métricas compactas, actividades/kits y detalles plegables. Progreso L1 y upgrade L2 usando solo `workshop.started/ends` y `workshop.upgrade.started/ends`; una ficha de avance en la ventana y otro cartel anclado por proyección de cámara al Taller en el mundo 3D. No duplica compras, no reinicia timers ni modifica game.mjs, inventario, economía, misiones o saves. UI/Faena compartida e index solo con cambios mínimos; PR/CI antes de main, autorizado por usuario.

- **ChatGPT — V101 Personal: habilidades en lista + flechas del staff centradas (2026-11-12):** rama `chatgpt/v101-personnel-skill-list-pager`. Ajuste aprobado sobre V100, acotado: tres habilidades de ficha derecha en filas compactas con icono, nombre y cinco puntos; paginación inferior de tres plazas con SVG simétricos y contador centrado. No toca fotos, candidatos, contrataciones, economía, misiones, saves, estados, joystick ni geometría del resto del juego. CSS nuevo aislado cargado después de V100; renderer solo cambia contenido pictórico de flechas, no acciones. Pruebas V101 y anteriores antes de publicar a `main` y Vercel.

- **ChatGPT — V100 Personal compacto + fotografías sin deformación (2026-11-12):** rama `chatgpt/v100-personnel-compact-portraits`; diseño de pantalla aprobado aplicado en render exclusivo de Personal, CSS V100 último en index, y pager UI no intrusivo. Roles principales 4 + «Ver todos», tres candidatos con iconos/puntos, ficha rápida con detalles secundarios y footer de tres plazas visibles y scroll horizontal 1/n. Corrección de encuadre (object-fit:contain, ratio nativo, sin filtros de pixelado ni estiramiento); los tres retratos administrativos son raster 230×260 y requieren originales más grandes para sumar detalle genuino. Capacidad de contratación, premios, misiones y estado no se modifican hasta definir reglas de vacantes por misión y recompensas. CI V76–V81 + V100 aprobada; publicar a main tras PR y comprobar despliegue.

- **ChatGPT — V99 misión independiente + acción PUMA (2026-11-12):** rama `chatgpt/v99-independent-mission-puma-action`. Excluye interacciones dentro de `#objective` del cierre radial por clic externo (el movimiento sigue ocultando ambos). Sustituye icono retícula por mano existente; botón acción sólido con gradiente burdeo PUMA de volumen 3D, oscuro al estar inactivo y destacado al estar disponible, sin modificar `disabled`. Solo el componente visual radial, CSS, tests y documentos; no modifica motor, misiones, economía ni Cloud Save. Usuario aprobó integrar a `main` y producción tras pruebas.

- **ChatGPT — V98 burbuja doble y HUD inmersivo (2026-11-12):** rama `chatgpt/v98-bubble-dock-auto-hud`. Base SVG con dos círculos enlazados por curva ondulada y doble borde, fondo transparente seguro; el botón de acción inactivo conserva opacidad y prioridad visual sin habilitar su interacción. Al caminar con joystick o WASD/flechas, el módulo radial cierra únicamente la rueda y agrega `.collapsed` a la tarjeta de misión (sin cambios al progreso); el jugador la abre manualmente cuando quiera. Se detecta el movimiento en el propio módulo visual, sin editar `game.mjs`. Six sectors, joystick, economía, guardados intactos. Autorización del usuario para publicar a `main` tras pruebas.

- **ChatGPT — V97 bordes de luz y controles inset (2026-11-12):** rama `chatgpt/v97-soft-rim-controls-inset`; elimina los bloques sólidos V96 y los sustituye por trazos finos que se atenúan siguiendo los mismos radios exactos 365/244 fuera del viewport. Reduce hub a 68 (centro local 332,392), botón de acción a 10dvh (mismo centro) y base de apoyo a 248×111 totalmente dentro del círculo interior. No altera diámetro del arco, seis destinos visibles, joystick, arrastre, misiones ni guardados. Pruebas y despliegue de producción en `main` autorizados explícitamente por el usuario una vez pase CI.

- **ChatGPT — V96 continuidad radial (2026-11-12):** rama `chatgpt/v96-radial-infinite-fades`; conserva seis gajos V95 de radios 365/244 y la posición del joystick. Cola circular SVG no interactiva hacia abajo (-103°) y derecha (+17°), máscaras de difuminado solo en extremos, revierte desenfoque heredado en Inventario y demás cuatro accesos centrales, reduce controles manteniendo el mismo centro. Modifica únicamente menú JS/CSS + pruebas; sin cambios de misiones, guardado ni navegación. Pendiente revisión preview y CI antes de publicación.

- **ChatGPT — V95 (2026-11-12):** `chatgpt/v95-compact-six-radial`. Compacta el menú V94 a seis gajos de 15° en el **mismo círculo** (radios 365/244), conservando el eje de los dos botones y la ubicación junto al joystick. Seis accesos visibles en orden referencia: Centro de Faena, Catálogo, Producción, Inventario, Personal, HSEC; cuatro adicionales por giro infinito. Tap directo en cualquier gajo, snap controlado sin flechas. Cambios únicamente UI radial JS/CSS + tests/documentación. PR #115 abierto, CI focal V90/V92/V82/V86/V91 aprobada, preview Vercel READY. QA visual PC/Android y aprobación de producción pendientes.

- **ChatGPT — V94 menú radial esquina (2026-11-12):** rama `chatgpt/v94-corner-radial-safe-touch`. Archivos `dist/chapter/semi-radial-dock-v90.mjs` y `semi-radial-command-v90.css` más tests/documentación. Cuatro sectores compactos, base integrada con botón de acción diferenciado, margen seguro, centros alineados con joystick, giro circular infinito sin flechas y snap al soltar. Pruebas JS y DOM simulados; PR/CI y Android pendientes. No cambiar `game.mjs`, misiones, economía ni Cloud Save.


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

- **2026-11-10 — ChatGPT V57 Patio L1 nocturno:** rama `chatgpt/v57-night-yard-visibility`, cambios visuales en `dist/mission5/patio-world.mjs` y regresión V52. Halos recuperados por encima del asfalto, zonas de aparcamiento cubiertas. Se reparó además el cableado de Localizar/Recuperar P01 en `dist/chapter/faena-center.mjs`. CI específica V52/V56/M5 pasada, PR #76 en borrador; test genérico M4 offline falla también en main. Pendiente QA WebGL Android; sin publicar ni tocar misión, guardados o lógica de conducción. Para la navegación ampliada consultar decisión V57 y coordinación con Claude Code.

- **V57 Patio iluminado + circulación libre integrada:** en `chatgpt/v57-night-yard-visibility` (PR #76). Usuario aprobó explícitamente integrar y publicar iluminación, botones Localizar/Recuperar y ampliación a ±108 m con margen seguro. Excepción de ownership funcional registrada en DECISIONS. Se preservan colisiones reales y saves; workflow focal `v57-terrain-lighting` aprobado. Pendiente verificar checks totales y deploy de `main` antes de marcar completo.
- **2026-11-10 — ChatGPT V58 cámara DrillTruck® personal:** rama `chatgpt/v58-personal-drilltruck-free-look`. Cámara externa de seguimiento con giro táctil independiente desde mitad derecha, zoom de pinza/rueda y reinicio al entrar/salir/cámara hogar. Alcance: `dist/camera/personal-truck-free-look.mjs`, enlace visual en `dist/chapter/game.mjs`, pruebas/CI. No modificar dirección del vehículo, M4, M5, dinero ni guardados. Pendiente PR, pruebas y aceptación Android.

- **2026-11-10 — ChatGPT V59 Patio nocturno y DrillTruck®:** rama `chatgpt/v59-yard-light-ground-gate`. Correcciones: barrera 1.6s+1.7s hold (animación visual, sensor HSEC original), modelo personal apoyado sobre pavimento real a altura de ruedas y luces bajo techumbres/herramientas/equipos. Tests y CI propios, sin lógica de misiones/economía. Autorización expresa del usuario «Hazlo todo». Pendiente PR/validación/producción.

- **2026-11-10 ChatGPT V60 — DrillTruck® 02 apoyo y salida:** rama `chatgpt/v60-truck-ground-exit-fix`. Corrige el muestreo máximo de terreno que elevaba la carrocería y el autocolisionador que impedía bajar (nuevo selector de salidas seguras). Tests V60 + CI, documentación en CHANGES. Sin cambiar M1–M5, economía, guardados o conducción. PR y QA Android pendientes.

- **2026-11-11 — ChatGPT V61 barreras y luces:** rama `chatgpt/v61-collision-headlights-yard-light`. Ajusta exclusivamente conducción personal para evitar tunneling entre probes, proyector visual de faros hacia camino y luz nocturna en patio/maquinaria/herramientas. Excepción funcional en `dist/mission5/personal-drilltruck.mjs` y visual compartido en `game.mjs` documentada en DECISIONS. Sin cambios de M1–M5 ni guardados; pendiente CI, PR y aceptación Android.

- **2026-11-11 · ChatGPT V62 naturalidad faros/apoyo de botas:** rama `chatgpt/v62-natural-headlights-avatar-boot-support`. Se revierte proyección aditiva «sable láser» de V61 al foco cálido original V60, y se corrige soporte visual de botas sobre Patio sin modificar física ni saves. `game.mjs` queda tocado únicamente para retirar hook de proyector; `scene.mjs` consulta nuevo helper de suelas. Regresión V52/V61 + V62 y CI dedicada; QA Android pendiente.

- **2026-11-11 — ChatGPT V63 tono y pavimento DrillTruck®:** rama `chatgpt/v63-warm-amber-personal-headlights`. El usuario solicita faros ámbar de referencia y reflejo suave en asfalto, sin «sable láser». Se ajusta sólo color del sistema existente y rebote oval radial muy difuminado con blending normal, altura de suelo, 13% de luminosidad en día. Se documentó excepción compartida exclusivamente visual en `game.mjs`; tests específicos y CI V63. Validación visual Android pendiente.

- **2026-11-11 — ChatGPT V64 bienvenida aprobada animada (preview):** rama `chatgpt/v64-cinematic-welcome-concept`. Logo extraído exactamente del arte aprobado e introducido en login y carga; nuevo módulo de inicio CSS/WebP autoincluido con polvo, cámara lenta, pulsos blueprint, brillo logo y CTA JUGAR. Solo gate visual en `dist/chapter/game.mjs` que preserva rutas de `chooseCharacter` / `beginPlay` y Cloud Save. Sin cambios M1–M5. Pendiente CI, PR preview, prueba Android, y **aprobación expresa antes de main/producción**.

- **2026-11-11 — ChatGPT V65 animación blueprints / V65.1 oclusión + polvo:** rama `chatgpt/v65-blueprint-line-build-immersion` derivada de V64. Mantiene logo animado, elimina solo barrido global; dibujo progresivo desfasado de 3 blueprints. En galpón izquierdo máscara de profundidad aplicada tanto a trazo vectorial como brillo WebP para evitar superposición sobre caseta real. Cinco bancos de polvo bajos, dos a los pies y granos, detrás de JUGAR. Integración solo visual de iframe en `game.mjs`. QA navegador hecha, PR/CI pendiente. **No publicar en main sin aprobación del usuario.**


- **2026-11-11 — ChatGPT V66 DrillTruck® 02 / regreso / conducción / NPC + HUD:** rama `chatgpt/v66-truck-return-drive-npc-ui`. Solicitud usuario: vehículo personal al P01 en próxima sesión, avatar frente oficina tras 3h30, dirección tipo bicycle y freno gradual, ruedas visuales, sonido menos tractor, mando freno separado, botones sin superposición en escritorio, JUGAR sin sombra blanca pero logo animado, guardia/técnica a escala adulta. Tocar `dist/mission5/personal-drilltruck.mjs` solo dinámica, `dist/chapter/game.mjs` solo hooks, `dist/audio/worksite-audio.mjs` solo canal personal; otros archivos visuales independientes. Sin M4, economía, HSEC ni cambios de misión. **Pendiente CI, preview y aceptación antes de producción.**

- **2026-11-11 — V66 ampliación ruedas camioneta automática:** el usuario solicita explícitamente animación de ruedas para el vehículo M4 también. Rama `chatgpt/v66-truck-return-drive-npc-ui`, animador escucha recorrido M4 sin alterarlo, con test específico para confirmar que el visual no mueve ni despacha la unidad. Pendiente QA de GLB con pantalla real y aprobación de merge de esta versión.

- **2026-11-11 · ChatGPT V68 (preview disponible, QA Android pendiente):** `chatgpt/v68-cinematic-real-avatar-selector` — selección premium 3D con avatares GLB reales, panel de ventajas correctas, nombre editable, feedback sonoro/háptico opcional. Solo hooks visuales acordados en game.mjs; sin partidas, economía ni misiones. Ver `CHANGES/2026-11-11_v68-cinematic-real-avatar-selector.md`. **NO fusionar a main hasta validar visualmente en teléfono.**

- **2026-11-11 · ChatGPT V69 lista para revisión/merge:** rama `chatgpt/v69-direct-entry-npc-selector-polish`. Eliminar segundo JUGAR/pantalla intermedia; login -> sesión o selector, mejorar escala adulta de guardia/técnica, hacer legibles dos stats visuales por habilidad y seleccionar automáticamente el bono real, acercar/iluminar GLB en primer plano. `game.mjs` coordinación acotada en DECISIONS. CI V69 focal superada; preview Vercel READY; pendiente validación visual y comprobación post-merge en main. Proteger Cloud Save, economía y M1–M5.

- **2026-11-11 · ChatGPT V70 (CI focal superada, preview listo):** `chatgpt/v70-immersive-entry-ui-feedback`. Solicitud fullscreen desde los gestos de Continuar / Nueva partida / confirmar nueva partida y botón opcional dentro del selector si el navegador la rechaza; selector compacto seguro para viewport con barra URL y audio de interacción ~2–3× más audible. Sin alterar saves, Cloud Save, misiones ni dinámica. CI focal V70 superada, preview Vercel READY; QA Android y publicación main sujetas a verificación; ver CHANGES/2026-11-11_v70-immersive-entry-ui-feedback.md.

- **2026-11-11 · ChatGPT V71 CI completa, preview listo:** `chatgpt/v71-m2-hsec-office-galpon-layout`. M1 aprobada/cerrada por usuario; en M2 se deben mostrar todas las pestañas HSEC, reducir la ficha de mejora de Oficina sin tapar edificio ni CTA y posicionar Galpón inmediatamente después de Oficina en Edificios. CI V71 y regresiones V39/V16 pasaron; preview Vercel READY, QA visual dispositivo pendiente. Exclusivamente CSS/orden de presentación, sin tocar lógica HSEC, dinero, compras, estado, contratos ni misiones. Coordinación en DECISIONS.

- **2026-11-11 · ChatGPT V72 CI focal superada, preview listo:** rama `chatgpt/v72-shed-minute-progress`: galpón HSEC M2 pasa de 25 a 60 s con barra + MM:SS visible como Taller, sin duplicar timer; cambio del requisito vehicular de conectar accesos invisibles a **12 metros terminados medidos y visibles** (el trazado predefinido mide ~13,85 m). Mantener intactos peatones, cruces, 80 HSEC, economía, save y misiones ajenas. Coordinación funcional específica en DECISIONS. CI focal V72+V71+V16 13/13 pasó y preview Vercel READY. QA visual Android y merge sujetos a aprobación.

- **2026-11-11 · ChatGPT V73 completada y V74 (CI focal OK):** Taller 90 s con barra y SMS M3 de 3 sondajes fusionados en main PR #94, producción READY. V74 categoría Seguridad/Personal siempre existente pero escondida; flechas y controles de navegación para 8 categorías en M1–M5, tests completados, producción sujeta a merge PR. Rediseño de Personal pausado hasta visto bueno del usuario.

- **2026-11-11 · ChatGPT V75:** Por decisión del usuario el catálogo contiene sólo 7 categorías; Personal deja de estar duplicado ahí y permanece en su ventana independiente con contratación real intacta. Pruebas focales V75+V74+V71 pasaron, preview READY; siguiente fase será rediseño visual de Personal tras visto bueno. Rama `chatgpt/v75-personnel-outside-catalog`.

- **2026-11-11 · ChatGPT V76:** personal premium implementado en rama `chatgpt/v76-personal-roster-premium`: 21 candidatos únicos, SVGs cel shading preliminares sin logos, siete roles, tres candidatos por rol, selección y contratación real, habilidades persistidas sin bonos económicos activos, y slots automáticos. Control de volumen compartido con selector de avatar. CI focal aprobado; preview Vercel READY. **Pendiente revisión estética y de experiencia Android; no prometer 21 GLBs únicos.** Documentación `CHANGES/2026-11-11_v76_personnel-premium.md`.

- **2026-11-11 — ChatGPT V77 Personal sin retratos finales:** rama `chatgpt/v77-personnel-placeholders-ux`. Se sustituyen únicamente imágenes visibles de la pestaña por siluetas CSS sin marca; tarjetas presentan las tres skills, y Equipo activo enfoca el ID realmente contratado. Código para PR, sin producción ni cambios a bonos, contratación, costos o guardados. Archivos de trabajo: `dist/chapter/personnel-premium-v76.mjs`, `dist/chapter/personnel-premium-v76.css` y hook de selección UI en `dist/chapter/faena-center.mjs`. Pendiente CI focal y QA móvil.

- **2026-11-11 — ChatGPT V78 Personal Ilustraciones 01:** rama `chatgpt/v78-admin-portraits-airy-personnel`. Primer lote Administración (Camila, Matías, Sofía) en WebP optimizado; paddings/gaps adaptativos más abiertos. Los 18 demás usan placeholders. Sin lógica/saves/economía. Archivos: `dist/chapter/personnel-premium-v76.mjs`, `dist/chapter/personnel-premium-v76.css`, atlas imagen, test CI. Diseño transversal de ventanas se aplicará gradualmente. PR/QA después.

- **2026-11-11 · V79 · Personal Gestión de Equipo** — rama `chatgpt/v79-personnel-career-payroll`: seis fondos originales de misión, 21 empleados con habilidades iniciales 1–3 y `salaryPerShift` sugerido, navegación a ficha de equipo con resumen de nómina. Ningún pago o bono activo. Test + PR antes de merge, QA Android pendiente. No tocar mecánica, saldo, Cloud Save ni modelos 3D.

- **2026-11-11 — V80 Premium Personal (visual)**: rama `chatgpt/v80-premium-personnel-title-audio`. Revisado tras capturas del Android: rediseño artístico de Personal fiel a referencia aprobada, logos izquierdo en inicio/carga, sonido UI solamente en Configuración, tres retratos sin distorsión y pestañas informativas reales. Archivos de estilo V80, módulos UI Personal/Faena, settings markup de `game.mjs` delimitado, `index.html`, tests. No economía/misiones/Cloud Save. PR + CI + autodeploy `main` tras QA técnica.

- **2026-11-11 · V81 Personal sin saltos y layout referencia:** rama `chatgpt/v81-personnel-no-jitter-compact-ui`. Archivos `dist/chapter/faena-center.mjs` (solo cache visual sin cambios de lógica), `dist/chapter/personnel-premium-v76.mjs` (iconos/hero), CSS exclusivo `dist/chapter/personnel-polish-v81.css`, link de CSS en `dist/index.html`, tests. Dejar pasar CI y revisar en Android producción tras merge autorizado.

- **2026-11-11 · V82 Centro de Faena — implementación total:** rama `chatgpt/v82-faena-command-center`. 8 WebP categoría + 14 SVG pictogramas, home sin duplicación y CSS scoped. No afecta lógica M1–M5 ni economía/guardados; tests de overview/rutas/estabilidad y regresiones V53/V81 en CI. Pendiente verificación de deploy Git main Vercel y QA visual Android.

- **2026-11-12 · V83 menú inferior semirradial animado** — rama `chatgpt/v83-semiradial-dock`. Solo sustituye presentación/navegación inferior; 3 accesos, 2 difuminados, toque y hold, rotación táctil, audio del sistema existente y 10 destinos reutilizados. Los botones del dock original permanecen con sus handlers y condiciones como fuente de verdad. `game.mjs` intervención mínima. CI focal y QA en Android antes de cierre.

- **2026-11-12 · V84 geometría real de semirradial** — rama `chatgpt/v84-true-semiradial-arc`. Rehacer solo las piezas visuales del dock V83 porque la captura en Android muestra tarjetas cuadradas en lugar de 3 sectores curvos y 2 anticipos radiales. No modificar sonido, misiones ni pantallas del juego. CI y revisión Android pendientes.

- **2026-11-12 · V85 restablecer vista:** rama `chatgpt/v85-reset-view-control`. Ícono actual de foto se reemplaza por retorno orbital/mira y se aleja del joystick en Android landscape. Archivos únicamente `dist/index.html`, `dist/chapter/reset-view-control-v85.css`, tests y documentación; sin modificar `game.mjs`. Validación CI y captura Android pendientes.

- **2026-11-12 · V86 corrección transversal focal**: rama `chatgpt/v86-premium-semiradial-player-rescue-personnel`, PR #107. El usuario descartó la reversión a la barra anterior: esa rama temporal NO DEBE INTEGRARSE. V86 corrige el semirradial visual de modo continuo (3+2, sonido y 10 destinos), quita `cameraHome`, agrega rescue seguro en Configuración, asegura que los puestos Personal queden completos dentro del móvil. Sin cambios de misiones/caja/contratos. V86–V81 tests focales success; confirmar Vercel production READY y solicitar captura Android real para pulido de proporciones.

- **2026-11-12 · V87 marca blanca/naranja**: `chatgpt/v87-classic-white-orange-brand`. Sustituir exclusivamente acabado del logotipo DRILL RUN (inicio, carga, selector, puente, favicon). Retirar logo metálico base64 V64; preservar partida/Google/funcionalidad. CI y verificación Vercel antes de confirmar.

- **2026-11-12 — V90 radial command wheel:** `chatgpt/v90-radial-command-wheel`. Reemplazo completo de V83/V88 como UI (nuevo módulo+CSS único), import compartido de `game.mjs` y enlace `dist/index.html`, sin cambios económicos. Pruebas y previsualización pendientes antes de publicar. **Finanzas V89** es una tarea separada, rama `chatgpt/v89-financial-history`, no mezclar estados ni tocar saldo.

- **2026-11-12 — V91 historial financiero:** `chatgpt/v91-financial-history`. Read-model central sobre `s.ledger` + vista Centro Faena y saldo, sin pagos nuevos ni mutaciones de `state.mjs`. CI propio y QA de producción pendientes.

- **2026-11-12 — V92 radial touch y acabado:** rama `chatgpt/v92-radial-touch-finish`. Cambio focal al JS/CSS V90, sin tocar import, HUD, economía ni financiera V91. Resolver bloqueo gestual sobre sectores SVG, altura y terminación de gajos + hub. CI gesto touch real simulado y regresiones; revisar capturas Android después de publicar.
