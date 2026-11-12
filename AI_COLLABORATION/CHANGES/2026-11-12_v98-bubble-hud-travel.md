# V98 · Base doble burbuja + HUD inmersivo al desplazamiento
Fecha: 2026-11-12. Rama: `chatgpt/v98-bubble-dock-auto-hud`.

## Confirmado con captura de V97
Los seis gajos de la rueda están bien. El usuario quiere que el botón de acción, incluso inactivo, no se vea detrás del fondo. Base común con dos círculos de borde grueso unidos mediante onda suave, no rectángulo o placa. Al mover joystick o WASD/flechas, cerrar rueda y retraer panel de misión hacia su pestaña izquierda para que se vea el mundo. Debe poder reabrirse manualmente.

## Archivos
- `dist/chapter/semi-radial-dock-v90.mjs`: sustituye `div.dr94Base` por SVG `dr98BubbleBase` con contorno continuo de dos lobos, vidrio interior y glow exterior; añade listeners no invasivos sobre el joystick existente y teclas de movimiento. Mantiene su estado local de rueda abierta y colapsa `#objective` visualmente sin tocar su contenido. Se ignora la mera pulsación neutra, formularios, teléfono, modales o modo constructor. Libera todos los listeners al destruir.
- `dist/chapter/semi-radial-command-v90.css`: estilo del contorno de 3.6px, doble borde e iluminación. Accionar deshabilitado preserva opacidad CSS 1 (sobrescribe la opacidad inline 0.45 del renderHUD) y z-index, sin modificar `disabled` real. Acordeón del panel con transición y soporte reduced motion.
- `tests/v90-radial-command-wheel.test.mjs`: condiciones estructurales y geométricas del contorno y action disabled.
- `tests/v92-radial-gestures.test.mjs`: emulación joystick, movimiento teclas, no-cierre al tocar centro, no-cierre al escribir, no-cierre de UI en teléfono, destrucción de listeners.

## Sin cambios
`game.mjs`, `state.mjs`, lógica de juego, misiones, economía, HSEC, fotos/modelos, Cloud Save, joystick y geometría de los seis sectores no se modifican. El menú cerrado conserva su botón visible; la misión queda retraída con pestaña para reabrir.

## Verificación
Se requiere CI focal V90/V92 y verificación de producción de código/estilos antes de declarar publicado. La aceptación óptica en dispositivo sigue a cargo de QA visual humana.
