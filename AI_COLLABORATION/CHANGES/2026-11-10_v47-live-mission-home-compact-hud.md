# V47 · Misión activa en portada + HUD M5 compacto

Fecha: 2026-11-10 · Rama: `chatgpt/v47-live-mission-home-compact-hud`.

## Problemas mostrados por el usuario
- Portada de «Continuar partida» seguía mostrando MISIÓN 4 tras aceptar M5.
- La tarjeta de Misión 5 tenía cinco casillas desplegadas y chocaba con
  el joystick en Android horizontal.
- Las dos vistas no leían la misma misión activa.

## Cambios
- Nuevo `dist/chapter/mission-display.mjs`: consulta pura y unificada
  `getCurrentMissionCard(state)`. Prioriza la **última misión aceptada y
  aún no confirmada**; en ausencia de narrativa usa progreso real para
  compatibilidad de partidas antiguas. No muta partida ni economía.
- `dist/chapter/game.mjs`: portada `updateStartCard` y subtítulo de
  perfil HUD comparten el adaptador; actualizan al aceptar/completar, al
  cargar/restaurar partida local o Cloud Save y al volver a la portada.
  `renderHUD` refleja los cambios sin reiniciar sesión.
- `dist/mission5/mission-readout.mjs`: modo compacto de dos pasos
  (actual+siguiente); cuando avanza cambia la ventana automáticamente.
  Preserva modo completo de cinco pasos para detalles.
- `dist/chapter/hud-reference-v4.css`: tarjeta de M5 más compacta
  (ancho, altura, paddings y tipografía), con límite relativo a la
  altura de viewport para no invadir el joystick izquierdo.
- La vista completa del teléfono «Patio de Maquinarias» y «Ver detalles»
  conservan los cinco objetivos, costos e instrucciones.
- `tests/v47-live-mission-and-compact-hud.test.mjs`: casos de M1–M5,
  M5 aceptada antes de construir, recuperación cloud y ventana de
  objetivos; workflow M5 ampliado para ejecutar regresiones V47.

## Conservado
No cambia precios ni tiempos, M1–M5 reglas de progreso, contrato,
recompensa única de 🪙 12.000, producción de M4, modelos, colisiones,
Cloud Save ni balances. Ningún logo o marca externa nueva.

## QA / publicación
Validación CI dedicada y visual móvil pendiente de resultados en
el PR. El pipeline general previo presenta dos fallas históricas
de economía offline M4 (constaban en V46).
Publicación a `main` y verificación del alias estable autorizadas
expresamente por el usuario para esta corrección, una vez revisadas
las pruebas específicas.
