# V54 · DrillTruck® personal: dirección intuitiva, faros y freno

Fecha: 2026-11-10. Rama `chatgpt/v54-drilltruck-steering-controls`.

## Observación del usuario
Al mover joystick a la derecha en DrillTruck® 02 el vehículo gira a la izquierda. Además, quiere dos controles profesionales del HUD: faro solamente como pictograma junto al borde derecho, gris/apagado o amarillo/encendido; freno con icono en vez de texto, sin comandos extraños.

## Cambios
- `mission5/personal-drilltruck.mjs` añade mapeo de dirección visual puro `personalTruckVisualSteer`. Se aplica tanto al joystick como a A/D o flechas, en el único punto de entrada de `game.mjs`. No altera la física ni la autoanimación del DrillTruck 01.
- `icons.mjs`: íconos vectoriales nativos del juego `truck-headlamp` y `truck-brake`, no imágenes, bibliotecas ni logos externos.
- `index.html`: botones solo pictograma, conservando `aria-label`, tooltip y `aria-pressed`.
- `game.mjs`: nunca reemplazar `innerHTML` ni `textContent` del botón de luces al alternar; solo clases, accesibilidad y acción real. Clase de modo conducción para suprimir Catálogo.
- `drilltruck-controls-v54.css`: botones compactos, apilados en borde derecho, lejos de mano y joystick. Luz OFF neutra, ON amarilla con glow; freno rojo mientras está presionado. Diseño adaptable a pantalla horizontal móvil.
- `tests/v54-drilltruck-steering-controls.test.mjs`: normalización, claves, giro, botones SVG, semántica de estados.
- `v54-drilltruck-controls.yml`: regresiones de V50/V52/V53/M5.

## Garantías
- Sin cambios a contratos, M1–M5, economía, stock, animaciones, modelos, guardado y HSEC.
- No se aplican otros cambios al movimiento peatonal.
- Despliegue se considera verificado solo tras GitHub CI + Vercel Ready (además probar sentido en Android real).
