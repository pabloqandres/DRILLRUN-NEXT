# V83 · Menú semirradial bajo con sonido de interfaz
Fecha: 2026-11-12
Estado: propuesto en rama para PR y CI, posterior verificación en producción

## Qué se modifica
- `dist/chapter/semi-radial-dock-v83.mjs`: carrusel giratorio de diez accesos con ventanas de cinco posiciones, tres nítidas y dos difuminadas. Los accesos que no están en el arco se mantienen en DOM y se muestran al girar; el movimiento es por CSS transform y opacidad. No usa relojes para redibujar ni altera estado del juego.
- `dist/chapter/semi-radial-dock-v83.css`: diseño semirradial bajo y ancho; centrado entre joystick y acciones del lado derecho; CSS al final de la cascada para ocultar el dock rectangular V4 sin eliminar sus handlers; accesibilidad reduce-motion.
- `dist/chapter/game.mjs`: import y un único instalador después de `bottomNav`; el código original de navegación se conserva. Accesos `catalog/contract/fleet/personnel/safety/overview` llaman los botones existentes, los otros cuatro usan el controlador `openFaena`; sin duplicar controller.
- `dist/index.html`: nueva hoja V83 después de V82.
- `tests/v83-semiradial-dock.test.mjs`: pasos cíclicos, un único centro, rotación, gesto, selección, 3 + 2, conservación de rutas y audio.
- `.github/workflows/v83-semiradial-dock.yml`: pruebas V83 más regresión UI.

## Sonido
Reutiliza `CharacterSelectFeedback`: select al abrir, skill al rotar, confirm al entrar, back al cerrar; conserva `prefs.sound`, `prefs.haptics` y el multiplicador de sonido `drillrun-ui-volume-v76`. Ningún archivo de audio nuevo ni loop.

## QA manual recomendado
Android apaisado: abrir/cerrar por toque, abrir pulsando 300 ms, girar con swipe desde el botón y desde el abanico, tocar vecinos para girar, tocar centro para acceder, verificar 2 tarjetas laterales difuminadas; confirmar que joystick y freno no quedan cubiertos. Con audio desactivado no emite sonido. Teclado: flechas, Enter y Escape. La experiencia visual final debe contrastarse con capturas reales del usuario.
