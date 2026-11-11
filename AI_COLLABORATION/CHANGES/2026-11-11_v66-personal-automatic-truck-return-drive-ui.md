# DRILL RUN NEXT GENERATION — V66 · conducción + retorno de sesión + ruedas automáticas

## Alcance autorizado por usuario
- DrillTruck® 02 personal: regresar automáticamente a P01 al **reanudar** partida guardada, y si estuvo dentro/cuando quedó cerca del vehículo remoto, avatar se reubica al patio para evitar quedar abandonado.
- Jugador tras **3,5 horas** sin jugar reaparece frente a acceso oficina. Misiones y cash intactos.
- Frenado progresivo, aceleración dosificada, dirección tipo bicicleta con batalla 2,85 m, reversa que primero desacelera y luego entra, joystick intacto.
- Ruedas visuales que giran y dirección del eje delantero, en modelo personal y **también DrillTruck® 01 automática** (solicitud posterior); M4 debe preservar servicio automático y sus rutas.
- Sonido menos tractor; motor procedural con armónicos suaves y rodadura, sin muestras de audio externo y sin copyright de competidores.
- Freno se separa en diagonal a la izquierda de la mano y faros; botones escritorio no colapsados; eliminar sombra blanca de JUGAR sin quitar el barrido propio del logo.
- Guardia/técnica de M5 a escala adulta comparable al avatar.

## Diseño técnico
- `dist/mission5/personal-session-return.mjs`: helper funcional puro, llamado solo en `beginPlay(true)`. Comprueba `savedAt` capturado **antes** de autosave y reconciliación de Google. No altera M4, ledger, cash, asignaciones, compras ni premios.
- `dist/mission5/personal-drilltruck.mjs`: dinámica cinemática bicycle sin motor físico nuevo, conserva V61 barrido de colisiones de 21 puntos. Velocidad máx previa 8,3 m/s; freno 5,7m/s², reversa controlada. Queda independiente de rutas M4.
- `dist/graphics/personal-truck-wheels-v66.mjs`: ruedas animadas en GLB por nombres cuando es seguro; si exportación tiene neumáticos fusionados, utiliza pequeños acentos de llanta. Se basan en distancia real/speed. La unidad M4 solo observa su desplazamiento del `updateTruckRoute` y no cambia esa función, coordenadas, timers ni rutas. La M5 reaprovecha rigs animados al clonar GLB de M4 sin duplicarlos.
- `dist/audio/worksite-audio.mjs`: canal personal suave (triangular+seno+rodadura filtrada), sin cambiar audio de M4.
- `dist/mission5/patio-npc-world.mjs`: normalización geométrica visible post rig contra avatar; no reemplaza GLB, roles, rondas o economía.
- `dist/chapter/drilltruck-cockpit-v66.css`: freno diagonal y dock escritorio compacto, responsivo.
- `dist/title-preview-v65.html`: reemplaza blanco puro de pseudo-gradiente del botón JUGAR con rojo y disminuye brillo, preserva logo titleSweep.
- `dist/chapter/game.mjs`: importa helpers y agrega hooks cortos de inicialización visual en M4/M5, `returnToWorksite` solo en reanudación, y captura fecha previa a Cloud Save. No reescribir otros handlers.

## Pruebas y publicación
- `tests/v66-personal-truck-drive-return-ui.test.mjs`: P01, reanudación larga/corta, guardado sin duplicación, conducción, no regresiones.
- `tests/v66-automatic-drilltruck-wheel-visual.test.mjs`: recorrido M4 no mutado por animación de ruedas, clon M5 sin doble rig.
- Workflow `.github/workflows/v66-vehicle-return-drive-wheel-ui.yml` incluye tests antiguos V50/V54/V56/V61/V65.
- Branch `chatgpt/v66-truck-return-drive-npc-ui`: **preview y revisión primero**. No publicar a main sin autorización explícita del usuario para esta versión; la aprobación V65.1 no se extiende automáticamente.
- Limitación: los nombres/nodos de rueda del GLB real y ajuste visual exacto de escala requieren prueba 3D en Android/PC; fallback evita alterar geometría importada. La CI de M4 economy en main tiene dos fallos conocidos no relacionados.
