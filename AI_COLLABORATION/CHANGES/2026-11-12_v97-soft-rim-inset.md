# V97 · Continuidad luminosa sin bloques y controles inset
Fecha: 2026-11-12
Rama: `chatgpt/v97-soft-rim-controls-inset`

## Diagnóstico con captura real
La V96 mostraba sus dos prolongaciones (hacia abajo y a la derecha) como superficies sólidas grandes. Los mandos de menú y acción, aunque reducidos previamente, se apreciaban superpuestos a la rueda y a la base ornamental. El usuario pidió estelas degradadas en vez de bloques y controles internos más pequeños, sin modificar la rueda.

## Solución
- `dist/chapter/semi-radial-dock-v90.mjs`: reemplaza las superficies anulares externas por solo trazos externo, interno y halo en ambas prolongaciones, todos hechos con `arcPath` desde el mismo centro y radios del menú actual y máscaras de desvanecimiento; no interactivos.
- `dist/chapter/semi-radial-command-v90.css`: `fill:none`, stroke bajo, halo suave y máscara; hub local (298,358) de 68×68 (centro 332,392), base local (290,352) 248×111; acción 10dvh con compensación de offsets para conservar centro. Ambos controles dentro del radio interno 244 del arco, sin taparlo.
- `tests/v90-radial-command-wheel.test.mjs`: nuevos invariantes de ausencia de bloque sólido, forma del trazo, presencia de extremos difuminados y posición de botones.

## Límites y verificación
No se modifican `game.mjs`, `state.mjs`, economía, guardado, compra, joystick ni rutas. Mantener seis gajos 15° y el gesto táctil infinito existente. Revisión visual real en PC/Android sigue siendo necesaria para aprobación estética, separada de pruebas de código.
