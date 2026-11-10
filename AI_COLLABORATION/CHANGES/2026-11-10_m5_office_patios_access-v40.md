# V40 · Acceso peatonal entre Oficina y Patio de Maquinarias L1

## Reporte
El usuario muestra el personaje junto a la oficina, mirando al suelo despejado con las líneas del nuevo terreno L1 a la derecha. Al caminar hacia el Patio L1 desde la oficina encuentra un muro invisible. Confirma que el problema NO es dentro del patio sino ENTRE la oficina y el espacio nuevo.

## Causa encontrada
`dist/scene.mjs` permitía, después de M4, un rectángulo de acceso extremadamente angosto: `x=-27..-6; z=-20..-7`. El tramo del antepatio junto a la oficina (por ejemplo `x=-19,z=5`) estaba fuera de ese rectángulo; el antiguo límite `x<-18` impedía avanzar aunque el suelo visible no mostrara barrera.

## Corrección
- `dist/chapter/navigation-areas.mjs` define dos zonas transitables predecibles cuando M4 concluyó: `OFFICE_PATIO_LINK: x=-34..-4, z=-23..14`; `M5_PLOT: x=-79..-22, z=-40..6`.
- `dist/scene.mjs` consulta `canWalkM5Area(x,z,this.yardL1Open)` antes de aplicar los antiguos límites de M1–M4. **No anula** `chapterCollision`, `this.colliders`, `physicalBoundaries` ni las colisiones reales de la oficina, el taller, los cercos HSEC y máquinas.
- `dist/chapter/state.mjs` utiliza la misma función para validar las posiciones restauradas del jugador, de modo que Guardado Cloud Save no teletransporte al usuario después de caminar por el nuevo pasillo.
- `tests/m5-office-patio-passability-v40.test.mjs` comprueba puntos desde `(-7,3)` hasta `(-51,-17)`, límites previos a M4, barreras reales, continuidad del guardado y altura de los pies igual al relieve visual.

## Verificación en memoria
Se evaluó el `isBlocked` real extraído de `World`, sin duplicar ni modificar su lógica: 12 puntos sucesivos libres; un punto de la antigua pared queda bloqueado antes de M4; la colisión de una estructura y la de HSEC siguen deteniendo al jugador. `World.sampleGround` coincide con `desertGroundHeight` en los puntos del trayecto. Confirmado que `restore` comparte la misma política de límites.

## Seguridad
Cambios sin cargo, sin compras, sin vehículos adicionales, sin reescribir progreso ni Cloud Save. Las barreras y edificios construidos permanecen sólidos.

## Pendiente
Verificar en el celular la posición exacta de usuario y cualquier colisión construida en ese punto; el juego no tiene una sesión remota de navegador para inspeccionar coordenadas de la partida en tiempo real.
