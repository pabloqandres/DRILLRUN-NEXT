# V34 · M5 navegación / suelo / Catálogo de un solo edificio

## Problemas reportados por jugador
- Tras pulsar vista del Patio L1, avatar queda bloqueado al intentar caminar al noroeste.
- Piernas hundidas en desierto 3D y desplazamiento inconsistente.
- Patio L1, L2 y L3 aparecen como tres inmuebles del catálogo; las mejoras deben ser interiores al Patio L1.

## Causas y correcciones
1. `dist/mission5/patio-world.mjs`: el permiso `yardL1Open` se encendía recién al terminar M5. Se enciende al completar M4 y aparecer blueprint, para explorar a pie el terreno antes de pagar el edificio.
2. `dist/chapter/game.mjs`: `beginPlay()` llamaba `ensureSafe` antes de inicializar el Patio. Se inicializa la parcela antes de validar spawn. Al pulsar joystick/WASD después de `Ver terreno`, cámara deja inmediatamente el overview de 15 s y vuelve a seguir al avatar.
3. `dist/graphics/desert.mjs`: alturas del suelo de vértices e interpolación exacta del plano premium para colisión y pies. Se gradúa el patio y corredor a cero, con transición gradual; ridgelines escénicas alejadas del patio.
4. `dist/scene.mjs`: `sampleGround` consulta la altura del mismo mesh 3D en vez de regresar cero; el personaje no interpola bajo la superficie en el capítulo.
5. `dist/chapter/state.mjs`: posición guardada legítima dentro de Patio L1 o corredor no se reemplaza por spawn M1 al restaurar; las posiciones pre-M4 fuera de mapa siguen filtradas.
6. `dist/chapter/construction-catalog.mjs`: solo Patio L1 como tarjeta/edificio. L2 y L3 continúan bloqueadas dentro de la ficha de mejoras del mismo patio.

## QA
- Prueba directa en memoria del código efectivo de `World.isBlocked`, `World.sampleGround` y `reliefHeight`: acceso `(-15,-14) → (-24,-14) → (-50,-17)` sin bloqueo con M4 completada; región original protegida sin M4.
- Patio y corredor tienen altura 0 en geometría y colisión.
- Eliminadas las referencias `kind:'patioFuture'` del catálogo.
- Añadido `tests/m5-terrain-and-access-v34.test.mjs`.
- No se modifica inventario, economía, Cloud Save ni producción.

## Verificación pendiente
No se realizó prueba visual en un navegador Android real; validar joystick, cámara y pies en terreno después de recargar la versión V34. Si persiste un bloqueo, registrar posición y traza de `isBlocked` para depurar colisiones con el usuario. 
