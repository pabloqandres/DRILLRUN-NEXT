# V60 — DrillTruck® personal: anti-levitación y salida segura

## Reporte y evidencia (2026-11-10, Android)
La camioneta parece flotar en la arena junto a una perforadora y el operador ve «No hay espacio libre para bajar» mientras está detenido junto a una valla con espacio lateral libre. Son regresiones del mismo flujo de la V59; no afectan compra ni misión, pero sí la usabilidad.

## Causas verificadas
- El algoritmo V59 tomaba el **máximo** de suelo entre centro y cuatro esquinas bajo ruedas; el punto más alto podía levantar todas las ruedas por un desnivel que solo tocaba una.
- `game.mjs` preguntaba `world.isBlocked` para salir sin quitar el collider de la **misma** camioneta. Con el ángulo del collider, ambos puntos laterales antiguos podían ser clasificados como bloqueados. Solo se intentaban esas dos posiciones.

## Cambios
- `dist/graphics/personal-truck-grounding.mjs`: suelo de referencia en el centro de vehículo más ajuste de mediana de ruedas acotado ±3cm. Mantiene superficie en plano (pavimento) y seguimiento de malla del desierto; ninguna modificación de física, estado, precio o saves.
- `dist/animation/personal-truck-exit.mjs`: orden de opciones de puertas izquierda/derecha, lados algo más abiertos y alternativas traseras/delanteras hasta ~4m; validación de posiciones intermedias para no cruzar cercos ni obstáculos.
- `dist/chapter/game.mjs`: antes de comprobar la salida excluye solo `m5PersonalTruckCollider`, lo restaura con `try/finally` incluso si hay error. Todos los demás colisionadores permanecen activos.
- `tests/v59-yard-night-gate-grounding.test.mjs`: modifica la expectativa obsoleta de levantar el chasis por el punto más alto.
- `tests/v60-truck-ground-exit.test.mjs`: casos de terreno natural y bordes aislados, self-collision diagonal, salida con valla, alternativa trasera, no salida si no existe hueco, economía y estado intactos.
- `.github/workflows/v60-personal-truck-ground-exit.yml`: CI con pruebas V50–V60.

## Sin cambiar
M1–M5, compra/recompensas, Cloud Save, DriveTruck® 01 automática, luces, barrera, joystick, freno, velocidad, cabeceo y colisiones del mundo.

## Validación requerida
CI focal; revisar imagen WebGL Android en suelo irregular real al volver a probar, no atribuir QA humano ejecutado por pruebas unitarias.
