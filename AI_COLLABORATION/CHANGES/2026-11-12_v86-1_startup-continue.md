# V86.1 · Recuperar Continuar y sincronización bloqueados por startup
Fecha: 2026-11-12

## Incidente
Tras V86 el usuario no podía sincronizar la partida ni activar Continuar. Causa inmediata confirmada en `game.mjs`: V86 retiró correctamente el botón `#cameraHome` de `index.html`, pero `applyText()` continuaba ejecutando `$('#cameraHome').setAttribute('aria-label',...)` al inicializar el menú y después durante cambios de estado Google. Eso provoca TypeError porque el elemento ya no existe y aborta la inicialización del HUD antes de actualizar la UI de guardado / Continuar.

## Reparación mínima
- Se retira `['cameraHome','home']` de las etiquetas de controles activos en `applyText()`.
- Se protegen las etiquetas de accesibilidad de controles opcionales con `?.setAttribute` para evitar bloqueos futuros al retirar un componente.
- No modificar código de Firestore, Google Auth, `cloudSyncing`, `cloudLocked`, `localStorage`, misión, economía, PlayerRescue ni semirradial.
- CI dedicado verifica los IDs HTML frente a la lista de etiquetas en startup, sintaxis JS y regresión V86/V82/V81.

## Nota
Esta corrección elimina el error de inicio reproducible por inspección de código. Cualquier error independiente de red/Google puede seguir requiriendo diagnóstico; no prometer sincronización efectiva hasta prueba real con cuenta de usuario, inaccesible desde integración CI.
