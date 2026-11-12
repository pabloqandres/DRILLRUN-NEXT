# V84 · Corrección geometría verdadera del semirradial
Fecha: 2026-11-12
## Origen
El usuario comparó una captura real de V83 (tres botones cuadrados flotando sobre una mancha gris) con la referencia aprobada (arco bajo continuo, tres sectores curvos y botón excavadora). Rechazó que fueran semejantes. El fallo es **geométrico**, no de color, espaciado o datos.
## Corrección
- Se sustituyó el fondo rectangular de cada una de las 10 tarjetas por un SVG sectorial auténtico; el slot central tiene curvatura simétrica y marco dorado, los laterales una silueta de abanico curvada con reflejo horizontal según lado. Los tres sectores nítidos dibujan una sola unidad.
- Los slots extremos conservan una silueta anticipada con desenfoque + máscara radial, en lugar de ser tarjetas visibles.
- Se eliminó el grueso fondo gris de arco; queda como máximo una línea luminosa curvada de guía.
- Botón circular inferior: pictograma original de excavadora sin marca comercial, reemplazando el gauge de V83.
- Más bajo y menos ancho en paisaje Android; valores y texto permanecen en los mismos módulos/funciones.
- Sin lógica nueva, sin cambios de juego ni de sonidos. JS conserva rutas, swipe, tap, hold, atajos y feedback/volumen de V83. CSS de corrección al final de `index.html`: `semi-radial-geometry-v84.css`.
- V83 y V82 siguen disponibles como regresión; V84 no cambia misión, balances, guardados, vehículos, Personal ni compras.
## QA
Prueba de CSS estructural y 3+2, regresión V83–V81 por GitHub Actions. Comprobar en pantalla Android real que visualmente no hay rectángulos; los cuatro bordes compartidos tienen una curva coherente y las tarjetas fantasma se desvanecen. QA interactiva de dispositivo pendiente.
