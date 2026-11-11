# V69 · Entrada directa, NPC adultos y selector refinado
Fecha: 2026-11-11 · ChatGPT · Rama: chatgpt/v69-direct-entry-npc-selector-polish

## Diagnóstico y solicitud
- Usuario mostró un NPC aparentemente miniatura respecto al jugador y señaló que el paso cinematográfico de "JUGAR" posterior al login es redundante y se ve mal.
- En selector V68 observó las bonificaciones porcentuales (+4% / -4%) confusas; al seleccionar personajes se abría CONTRATOS con mensaje de bono inexistente, aunque el personaje tenía otra especialidad. Solicitó dos atributos independientes por habilidad, una barra adicional solo en la especialidad, y rostro de personaje GLB mucho más cercano y nítido.

## Causas verificadas
- El arranque tenía dos gestos secuenciales: `#play` cargaba el iframe `welcomeScreen`, cuyo JUGAR reenviaba `drillrun-welcome-enter-v64`. Se eliminó la pantalla del recorrido; logo de login permanece.
- `Number(undefined)!==0` devuelve `true`; así, la búsqueda del primer bono detectaba erróneamente categorías ausentes.
- V66 normalizaba el alto de NPC según `heightOf(world.player)`, caja de mallas skinned en pose, una referencia que podía subestimar su altura real.
- El foco de luces del selector V68 se situaba relativo al escenario inicial y no al GLB elegido; cámara y gradiente oscurecían la vista.

## Correcciones
- `dist/chapter/game.mjs`: clic de login va **directo** a `chooseCharacter(true)` o a `beginPlay(true)` con restore existente y mismo Cloud Save; fullscreen solicitado desde el toque real. Mantiene la vista QA `?selectorPreview=1` no destructiva. Cámara centrada en busto GLB (target -5.02 / 1.54 / 5.68; offset z1.56 con zoom transitorio).
- `dist/index.html`: retira `welcomeScreen` y `welcomeFrame`, incorpora CSS V69. `title-preview-v65.html` queda como arte histórico no invocado; `entry-cinematic-v64.css` mantiene identidad visual login/carga.
- `dist/mission5/patio-npc-world.mjs`: escala visual de guardia/técnica normalizada por `avatarDefinition(id).height` (1.66–1.88 m), no caja skinned; sin cambiar movimiento, contratación, posiciones, colliders ni estados.
- `dist/chapter/character-select-v68.mjs`: detección de bonus real con valores ausentes normalizados a 0; se activa automáticamente la única especialidad del personaje. En lugar de porcentajes visibles, cuatro áreas con niveles visuales 3/5 y 4/5 en especialidad; cada área tiene 2 stats iniciales independientes y el bono suma **solo 1 barra** al primero. Se indica que atributos son presentación para futuras mejoras, sin efecto de juego nuevo. Las bonificaciones originales de economía/tiempo permanecen en `avatars.mjs`.
- `dist/chapter/selector-stage.mjs`: luces key/rim siguen la posición del GLB real.
- `dist/chapter/selector-polish-v69.css`: despeja gradiente en el busto, resalta especialidad y dos atributos detallados.
- `tests/v64-cinematic-welcome-flow.test.mjs`, `tests/v68-cinematic-character-selector.test.mjs`, `tests/v66-personal-truck-drive-return-ui.test.mjs` actualizadas para los nuevos requisitos; nueva suite V69 y workflow focal.

## Reglas de integridad
No se toca schema de guardados, lógica de misiones, economía, HSEC, contratos, costos, tiempo de construcción, intro del avatar ni modelos binarios GLB. La imagen de referencia no reemplaza los avatares GLB reales. La escala es solo visual. Los tests de lógica se ejecutan en CI y se informa si hay fallos. Comprobación visual del encuadre, altura percibida con perspectiva y Android queda pendiente de revisión humana en producción.
