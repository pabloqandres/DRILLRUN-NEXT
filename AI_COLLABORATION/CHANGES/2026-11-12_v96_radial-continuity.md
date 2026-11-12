# V96 · Continuidad infinita y terminaciones de menú radial
Fecha: 2026-11-12.
Rama: `chatgpt/v96-radial-infinite-fades`.

## Solicitud
El usuario aprobó el tamaño del arco de seis botones V95 y pidió **no cambiarlo**. Quiso el primero (abajo-izquierda) y último (arriba-derecha) suavemente difuminados, con prolongaciones hacia los bordes de pantalla para comunicar giro infinito. El icono Inventario aparecía borroso sin motivo. Los dos botones de comando y acción estaban demasiado grandes y debían encogerse/recentrarse dentro del cuarto de rueda.

## Cambios ejecutados
- SVG de mismo centro (500,465), radios (365,244). Se añadieron gajos puramente decorativos en el mismo círculo de –103° a –90° (inferior) y de 0° a +17° (derecha), extendidos fuera del escenario y degradados con máscaras de luminancia. `pointer-events:none` para que no capturen input.
- Los sectores extremos, sus vidrios y aros se atenúan progresivamente con dos máscaras SVG. El aro interior se dividió solo a efectos de máscara: no se cambia radio o forma.
- Se eliminó por CSS el blur heredado de V90 que afectaba step 2 (Inventario). Todos los interiores (steps 0–3) quedan opacos y nítidos; solo las etiquetas de los extremos llevan máscara direccional.
- Hub del menú reducido 100→84 unidades del SVG conservando centro (305,392). Acción reducida por CSS 14dvh→11,6dvh, compensando right/bottom para conservar su centro anterior; se mantiene jerarquía dorada. Base interna ajustada, rueda y joystick intactos.
- Cambios funcionales externos: ninguno. `game.mjs`, compras, misiones, saves, economía y cámara permanecen iguales.

## Comprobación
- Prueba agregada a `tests/v90-radial-command-wheel.test.mjs` para máscaras, geometría, interactividad y alineación. Las pruebas CI y QA visual en móvil se verifican antes de release; no afirmar más allá de lo ejecutado.
