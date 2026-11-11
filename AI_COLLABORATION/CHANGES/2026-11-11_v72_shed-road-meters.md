# V72 · Galpón 1 minuto y carretera vehicular por metros
Fecha: 2026-11-11 · ChatGPT · `chatgpt/v72-shed-minute-progress`

## Hallazgos
- Galpón usa actualmente duración predeterminada HSEC `buildSeconds=25`. Su construcción real se guarda como `asset.started`, `asset.ends` y se ejecuta con `hsec.time`, que avanza en juego. Durante el montaje el mundo ya muestra un holograma, pero la única cuenta regresiva estaba en texto de `HSEC > Activos`; no existe barra como en el Taller.
- El objetivo «Ruta vehicular conectada» dependía de `connectivity(h,'vehicle')` que exige alcanzar un punto de logística de oficina y otro del galpón sin informar las coordenadas; el jugador no podía saberlo.
- El trazado sugerido original mide 13,85 m, razón para seleccionar una meta amigable de **12 m** en vez de 15 m (que harían fallar la sugerencia).

## Cambios exactos
- `dist/hsec/catalog.mjs`: exclusivamente `shed.seconds=60`; el resto de construcciones mantiene 25. `vehicleRoadMeters=12`. Texto del Camino Vehicular y etapa M2 coherentes.
- `dist/hsec/state.mjs`: la evaluación `vehicle` es ahora `routeLength(h,['vehicle']) >= B.vehicleRoadMeters`, calculada sobre caminos finalizados. Se elimina de riesgos críticos la referencia a unir dos accesos desconocidos. La conectividad peatonal, cruces inseguros y control de riesgo siguen como antes, y se conserva puntuación 80/100; `tickHsec` usa el mismo requisito de e.vehicle sin dobles puertas ocultas.
- `restoreHsec`: extiende trabajos legacy de Galpón todavía `building` con registro exacto de 25 s a 60 s sin reiniciarlos ni cobrar dinero; no reabre construcciones `built`. Mantiene started/ends/h.time como única fuente.
- Nuevo `dist/hsec/shed-progress-v72.mjs`: utilitario puro de progreso y tiempo `MM:SS`, HUD pasivo que se muestra mientras se construye el Galpón; actualiza DOM con el tiempo real existente sin setInterval, Date.now ni almacenamiento adicional.
- `dist/hsec/world.mjs`: el holograma conserva su interpolación existente; añade HUD compacto tipo Taller, habilita tocar el Galpón en montaje para abrir tarjeta con la misma barra y al completar la sustituye por ficha construida.
- `dist/hsec/ui.mjs`: el checklist M2 muestra metros exactos y barra de avance vehicular; en la fila Galpón en construcción y la pestaña Activos se dibuja el progreso real y se actualiza en cada renderHUD sin regenerar el modal completo.
- `dist/hsec/shed-progress-v72.css`, `dist/index.html`: barra verde estilo Taller y texto de porcentaje + 01:00→00:00.
- Se actualizó el helper `tests/hsec.test.mjs` para duración de Galpón a 60, más `tests/v72-shed-road-meters.test.mjs` y workflow dedicado `v72-m2`.

## QA
- CI específica V72: 13/13 pruebas pasadas (V72+V71+V16). Comprobó: 25/59 segundos no termina; 60 segundos sí; migración de construcciones antiguas en curso; trabajo acabado intocable; lectura 10/12 y 13/12 m; dos caminos separados aceptados; peatones independientes; sin timers ni cobros nuevos.
- Test HSEC antiguo `tests/hsec.test.mjs` tiene fallos preexistentes por exigir boosters iniciales (`noBoost`), y presupone un máximo antiguo de 8 mallas para el Galpón. No modificar economía/3D para hacer pasar esas expectativas. Se actualizó sólo la duración del helper y se excluyó esa suite obsoleta del gate focal. Pruebas visuales Android pendientes.
- Vercel preview de rama confirmado READY; `main` requiere aprobación de publicación según RULES.

## Seguridad
Sin cambiar costos, M1/M3–M5, bonus, Cloud Save, perfil, modelos 3D, inventario ni las recompensas HSEC. Un Galpón completado antes del deploy sigue siendo completado; para observar el montaje de 60 s es necesario iniciar uno nuevo en una partida donde aún no esté construido.
