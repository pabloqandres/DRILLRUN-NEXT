# V39 — Tarjeta Oficina L1/L2: vista 3D compacta y acciones siempre visibles

## Reporte visual
En Android horizontal al tocar la oficina construida, el modal de detalles se presentaba en una sola columna: la previsualización 3D ocupaba mucha altura, el nombre y la descripción quedaban comprimidos y el botón de entrada/mejora aparecía cortado al final.

## Solución
- `dist/chapter/game.mjs`: se conserva exactamente `ProductPreview` con el modelo 3D real y los mismos controladores de entrada y mejora; estructura de ficha reorganizada en `.officeQuickLayout`, `.officeQuickInfo`, `.officeQuickDetails` y `.officeQuickActions` (acciones independientes del texto).
- `dist/chapter/office-quick-v39.css`: estilo dedicado, encapsulado bajo `#modal.officeQuick`. Diseño 2 columnas (modelo 3D a la izquierda; nivel/nombre/descripción/acciones a la derecha) con máximo alto ajustado a `100dvh`, texto con desplazamiento interno y botones al pie. En móviles horizontales hay reglas específicas para pantallas compactas y se respetan las áreas seguras.
- Nivel máximo actual: aviso discreto junto a la información, no invade el botón Entrar.
- Se aplica también a la previsualización de mejora de oficina, sin alterar compras, precios, tiempos, guardados ni economía.
- `dist/index.html`: CSS de Oficina V39 cargado después de los anteriores y versión de entrada cache-busted.
- `tests/office-quick-card-v39.test.mjs`: verificaciones estructurales de las dos columnas, límites de altura, botón de entrada, compra de mejora y CSS acotado.

## Compatibilidad y validación
Se verificaron sintaxis JavaScript, existencia de los manejadores, continuidad de ProductPreview, CSS horizontal, máximo de altura y cache bust. No hay modificaciones a las misiones, inventario, Cloud Save ni vehículos.
Pendiente: inspección visual en Android real; no existe navegador gráfico de la partida conectado a esta sesión.
