# V52 · Iluminación Patio y experiencia nocturna DrillTruck® personal

Fecha: 2026-11-10 · Rama `chatgpt/v52-night-patio-drilltruck-audio`.

## Reportes del usuario
- Patio de Maquinarias L1 totalmente oscuro de noche pese a ocho postes decorativos.
- Falta botón para encender focos delanteros cuando conduce el DrillTruck® 02.
- El avatar aparece sobre o dentro de la camioneta en la cámara exterior, y suenan pasos en lugar de motor.
- La misión 5 ya se completó satisfactoriamente; no intervenir en narrativa, pagos ni progresión.

## Alcance
- `dist/mission5/patio-world.mjs`: los ocho postes ahora contienen PointLights reales; se agregan cuatro zonas con luces de trabajo. Las luminarias siguen el reloj nocturno de HSEC y un límite dinámico según calidad gráfica (3/4/6 postes y 1/2 luces de trabajo simultáneos). Sin sombras dinámicas adicionales.
- `dist/graphics/personal-drilltruck-headlights.mjs` (nuevo): par de SpotLights orientados hacia delante del vehículo y un relleno corto; luces agregadas exclusivamente al clon conducible. Faros apagables/encendibles; no cambian modelo original ni DrillTruck de M4.
- `dist/index.html` y `dist/chapter/hud-reference-v4.css`: botón táctil `LUCES ON/OFF` visible solo al conducir, separado de FRENO y joystick.
- `dist/chapter/game.mjs`: integra el componente, cambia estado de focos guardado en el vehículo y enciende por defecto durante el primer abordaje nocturno. Corrige avatar reactivado por `World.update()` antes de pintar. Proporciona indicador de conducción al audio.
- `dist/audio/worksite-audio.mjs`: motor procedimental independiente con variación de RPM según velocidad real, sin samples ajenos; suprime pasos durante conducción. M4 mantiene sus fuentes.
- `tests/v52-night-patio-driving.test.mjs` y workflow dedicado: checks estáticos + CI con regresiones M5 históricas.

## Garantías
- No se alteran el estado, HSEC score, verificación de portón/bodega, la compra/entrega de los dos DrillTruck®, economía, recompensas ni Cloud Save.
- Estado opcional `headlightsOn` dentro del vehículo personal existente, sin migración obligatoria; primeros ingresos nocturnos encienden luces.
- Luz operacional se habilita con el horario nocturno real, solo después de terminar la construcción.
- El laboratorio no se publica en producción sin revisión/aprobación.

## QA
- Comprobación de estructuras en código y workflow añadido; CI remoto y prueba visual WebGL/Android reales **pendientes** al momento de esta preparación.
- Confirmar orientación de faros y nivel de luminosidad en un recorrido real de noche antes de aprobar producción.
