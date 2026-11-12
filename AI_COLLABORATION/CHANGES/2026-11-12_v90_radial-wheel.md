# V90 · Rehacer el semirradial desde geometría polar
Fecha: 2026-11-12

## Problema reportado
El usuario rechazó la V88: trazos gruesos, ausencia de profundidad, forma parecida a Paint, botón debajo fuera de centro, contador sobrepuesto e inútil, iconos con recorrido lineal, textos fuera de segmentos y parche visual. Solicitó investigar menús radiales profesionales e implementar bien la solución, conservando flechas y sonido.

## Investigación pública
- Steamworks radial menus: rueda de acciones con selección espacial, iconos legibles y callbacks reales: https://partner.steamgames.com/doc/features/steam_controller/radial_menus
- Gameface UI RadialMenu: separa segmentos, selección, contenido y rotación/contrarrotación de iconos: https://gameface-ui.coherent-labs.com/components/complex/radial-menu/
- GSAP Vault 2026 radial pie menu: SVG anular, click+drag, teclado, reducción de movimiento, snap angular: https://gsapvault.com/ui-elements/radial-pie-menu

## Implementación
1. Nuevo `dist/chapter/semi-radial-dock-v90.mjs`: geometría analítica de segmentos anulares. Centro (200,164), radio exterior 154, interior 89; 3 gajos sin superposiciones, 3 destinos legibles + 2 fantasmas. Alineación por centro y radio en lugar de Béziers independientes.
2. Movimiento de **órbita circular real**: un contenedor gira ±45° por paso alrededor del centro polar y el botón/texto contragira para permanecer horizontal. CSS 610 ms con aceleración/desaceleración suave, sin saltos lineales, rebotes ni animación inactiva. Flechas, rueda de ratón con compuerta anti-saltos, gesto y teclado conservados.
3. Interfaz de una sola fuente `semi-radial-command-v90.css`, bordes de 1.45px y seleccionado de 1.8px; diferenciación por capas y halo sutil en la selección, botón concéntrico de varias capas, centrado y elevado con margen al suelo. No mostrar contador; dos accesos laterales difuminados.
4. Eliminar de `dist/index.html` **cuatro CSS antiguos** que competían (V83, V84, V86, V88). No borrar su historial. Nuevo CSS V90 cargado último, sin superponer parches.
5. Cambio de una sola línea en `game.mjs` para importar el componente V90 desde la misma llamada original `installSemiRadialDock`. No modificar callbacks, rutas, bloqueo de HSEC, consumo, economía ni Google.
6. `ResizeObserver` escala todo el conjunto sin deformar el círculo, conservando forma y posiciones angulares en Android y PC; control de accesibilidad, Escape y `prefers-reduced-motion`.

## Límites
No se modifica ninguna lógica de misiones ni base de datos, ni se inventan logos. QA de código y pruebas de regresión antes del merge. La percepción estética final requiere validación en dispositivo real; evitar asegurar "igual que la referencia" sin capturas.
