# V45 — Mensajería narrativa M1–M5: nombre del jugador y último mensaje visible

## Reporte
- Notificación emergente de mensajes de misión mostraba el literal `Hola, {name}` en lugar del nombre real de la partida; la conversación interna del teléfono sí interpolaba correctamente.
- Al abrir por notificación o desde contactos, se mostraba el primer mensaje histórico del narrador (especialmente Elena Torres, que envía M1/M4/M5) en vez del mensaje recién entregado.

## Cambios
- `dist/chapter/narrative-ui.mjs` expone `resolveNarrativeText(text,playerName)` reutilizado por mensaje, vista previa del contacto, texto animado y notificación; normaliza los `\\n` literales del guion M5.
- `dist/chapter/game.mjs` invoca la función compartida al crear `notices.push` y resume el texto a 60 caracteres. La notificación abre el mensaje exacto mediante `phoneUI.focusNarrativeMessage(msg)`.
- Mensaje inicial/final: `n:m1..m5:(start|end)` abre la burbuja entregada, también si hay historial y el narrador se repite. Los mensajes de cierre no confirmados previamente se recuperan por orden inverso sin cobrar/recompensar automáticamente.
- Atajo del botón teléfono: `pendingMissionReply()` prioriza el último mensaje no resuelto, no el primero de la historia.
- `dist/chapter/phone-ui.mjs` detecta nuevas entregas incluso si la conversación está abierta. Mide la posición del elemento real en `#phoneContent` y alinea el **principio** del mensaje más reciente; en renderizados habituales del HUD conserva el scroll anterior.
- Todas las acciones de aceptar/cobrar quedan MANUALES. Sin modificaciones de caja, inventario, ciclos M4, NPC, GLB o Cloud Save.

## QA
- Verificación de sintaxis JS real: `game.mjs`, `phone-ui.mjs`, `narrative-ui.mjs`.
- Evaluación real de `resolveNarrativeText` en 5 textos de apertura, nombres `Pablo Rubio`, `María José`, fallback `Operador`; sin `{name}`.
- Simulación con `PhoneUI.render` y `getBoundingClientRect` dinámico: en contacto Elena con M1/M4/M5, abre M5 en scroll 587; un rerender mantiene posición manual 333; recepción de M5 cierre enfoca en scroll 852; notificación dirigida a M1 enfoca exactamente M1 en 17. Todos coinciden con offsets esperados.
- Archivo de pruebas: `tests/narrative-message-focus-v45.test.mjs`.
- Prueba pendiente: comprobación visual final en Android apaisado.
