# 2026-11-07 — Ocultar panel M4 tras cierre narrativo

## Diagnóstico
El estado `mission4.phase==='complete'` activa permanentemente el panel de objetivo con etiqueta «MISIÓN COMPLETADA», aunque la confirmación final de narrativa ya esté registrada en `narrative.rewardsCollected`.

## Corrección
En `renderHUD()`, el panel `#objective` se oculta solamente cuando M4 está completada **y** `isMissionCollected(s,'m4')` es verdadero. Durante el mensaje de cierre pendiente continúa visible. El mismo renderHUD se ejecuta tras `confirmCompletion`, por lo que cambia sin recargar.

No altera misiones, recompensas, datos guardados, producción automatizada, puntuación HSEC ni panel de otras etapas.

## Verificación
Revisión estática: método `hidden` utiliza la clase `.hidden{display:none!important}`; `handleNarrativeAction('collect')` llama a `renderHUD()` después de confirmar. No se efectuó prueba end-to-end del navegador; revisar partida guardada y cierre narrativo M4.
