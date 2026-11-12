# V85 — Restablecer vista, no fotografía
**Fecha:** 2026-11-12

## Origen
El usuario ve el ícono de fotografía junto al joystick y lo interpreta erróneamente como «tomar foto». El control real de `#cameraHome` sirve para `world.zoom=1`, `resetOrbit`, `cameraRig.reset`, `truckFreeLook.reset`, `snapCamera` y `persistCamera`.

## Cambios
1. El mismo botón HTML con id `cameraHome` usa un SVG de trazo original: flecha de retorno orbital y punto de mira, no cámara fotográfica. `title` y `aria-label` explican «Restablecer vista». Eliminado atributo `data-icon="camera"` **solo en este botón**, sin cambiar íconos del resto del juego.
2. `reset-view-control-v85.css` se carga después de V84 para desplazar el botón a la derecha del joystick con distancias diferentes según altura y ancho de pantalla; borde cian, fondo oscuro, visible sin competir con el semirradial. Se conserva accesibilidad por foco y control táctil.
3. No se modifican rutas, ajustes de audio, datos, JS de cámara, economía, misiones ni el estado persistente.

## QA
Test de marcado, iconografía, CSS responsive y `game.mjs` intacto; regresión de semirradial V83/V84 y Centro Faena V82. Inspección real Android tras despliegue para afinar margen, en caso de diferencia entre tamaños de viewport.
