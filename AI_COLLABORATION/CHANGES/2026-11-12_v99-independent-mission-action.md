# V99 · Misión independiente + botón de acción PUMA burdeo
Fecha: 2026-11-12. Rama `chatgpt/v99-independent-mission-puma-action`.

## Reporte reproducible
Con el radial abierto y el panel de misión retraído, al abrir el acordeón del objetivo la rueda se cerraba; no debiera porque son componentes independientes. La regla V98 de cerrar ambos al iniciar movimiento ya funcionaba y debe preservarse.

## Diagnóstico y reparación
El handler `outside` en `semi-radial-dock-v90.mjs` cerraba al recibir cualquier `pointerdown` fuera del menú; el clic de `#objToggle` también pertenece a ese caso. Ahora se considera explícitamente el nodo `#objective` y todos sus descendientes como interacción independiente que no descarta el radial. El resto de clics exteriores continúan cerrándolo como antes. No se altera el control de movimiento ya probado ni su detección de teclado/joystick.

## Acción contextual
El botón original `#handButton` usaba `interact-focus`, retícula que el usuario encontró confusa. El componente visual sustituye el contenido del `span[data-icon]` por `icon('hand')` del propio juego, sin tocar `icons.mjs`, `game.mjs` ni el botón/evento nativo. CSS: volumen 3D burdeo, inactivo apagado pero sólido; `.available:not(:disabled)` intensifica rojo, bordes y glow, sin habilitar acciones desactivadas ni añadir marcas gráficas.

## Archivos
- `dist/chapter/semi-radial-dock-v90.mjs`: exclusión de misión en clic externo; icono de mano reutilizando set existente.
- `dist/chapter/semi-radial-command-v90.css`: esquema sólido burdeo PUMA de acción deshabilitada/disponible.
- `tests/v92-radial-gestures.test.mjs`: pruebas DOM simulado para independencia radial/objetivo, movimiento que cierra ambos y render del icono, estilos.
- Documentación de coordinación en ACTIVE_WORK y CHANGELOG.

## Reglas
Seis sectores y continuidad de aro V97, base de doble burbuja V98, misiones M1–M5, economía, guardar, joystick y destinos sin cambios. Publicación autorizada a `main` tras tests focales + smoke de producción.
