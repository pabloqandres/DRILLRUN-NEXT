# V48 · Traslado DTH visible y sincronizado con el ciclo

Fecha: 2026-11-10. Rama: `chatgpt/v48-dth-reposition-animation`.

## Síntoma real
El usuario observó en la ficha DTH «CAMBIANDO DE PUNTO»,
37 ciclos acumulados, punto BH-01 y la máquina sin traslado visible.

## Causa auditada
- `dist/mission4/production.mjs` cambia `assignedZone` y
  `d.position` inmediatamente, mientras conserva `travelUntil=now+12000`.
- El modelo visual en `dist/chapter/game.mjs` se acerca al destino
  con `position+=(target-position)*min(1,dt*3)`; se detiene visualmente
  en ~2–3 segundos y sigue mostrando «Cambiando» hasta el segundo 12.
- Al recargar durante el viaje, el modelo nacía en la nueva zona
  (`assignedZone`) en vez de retomar la posición intermedia del traslado.

## Solución
- `dist/mission4/dth-travel.mjs`: cálculo puro de la posición 3D
  con interpolación de 12 s desde origen real y reloj persistido.
- `production.mjs`: conserva `travelFrom` y `travelStartedAt`;
  registra en `d.position` el origen hasta la llegada y recién al
  terminar fija la posición de destino. Se mantiene el timer de 12 s.
- `game.mjs`: tanto al crear como al actualizar la máquina
  utiliza la misma posición de traslado; orienta la DTH según dirección;
  el collider acompaña el modelo, sin crear objetos invisibles.
- `rig-inspection.mjs`: devuelve `travel` de solo lectura;
  la ficha indica «Punto de destino» y «Traslado BH-0X → BH-0Y · 00:SS».
- Para guardados anteriores en tránsito sin `travelFrom`, el
  cálculo visual infiere un sitio anterior entre las zonas con ciclos;
  no reescribe partidas, ledger ni historial de producción.
- Validación aislada en `tests/v48-dth-relocation.test.mjs` y workflow
  dedicado `.github/workflows/v48-dth-relocation.yml`.

## Límites
No cambiar duración de producción (15 min/ciclo), tramo de traslado
(12 s), ingresos, selección de la zona, consumo de bit/martillo,
mantenimiento DrillTruck, M5, Cloud Save ni animación NPC.
La DTH continúa siendo maquinaría genérica sin marcas de terceros.

## Estado
CI y QA pendientes de verificación; no afirmar éxito sin pruebas.
