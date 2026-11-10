# V37 · Tarjeta Taller rediseñada

## Solicitud
Corregir tarjeta de Taller Nv.2 de captura Android: texto invadido por CTA naranja, estados de RC/DTH mezclados, métrica de descarte ambigua, información amontonada y tarjetas inadaptadas a orientación landscape.

## Implementación directa en main
- `dist/chapter/workshop-card-view.mjs`: nuevo modelo de estado y renderizador **solo lectura**, separado del controlador de juego. Resume capacidad real, ocupados/libres, stock *disponible* de bits/martillos (excluye herramientas instaladas), material descartado real vinculado a M8, RC y DTH según estado real, bahía del Patio L1 y zona de producción; alerta contextual solo si DTH necesita herramientas o servicio.
- `dist/chapter/game.mjs`: sustituye HTML anterior. `Ver stock` navega a `m3-inventory`; `Gestionar DTH` a `m4-workshop`; acciones contextuales conectadas a M4 taller o Casa Matriz DTH; mantiene mejoras, confirmación de compra, booster y demolición sin alterar su lógica. Preserva scroll interno durante actualización de timers.
- `dist/chapter/workshop-card-v37.css`: diseño específico, al final de la cascada; tarjeta 388px máximo y adaptable a 355px en teléfono horizontal; encabezado compacto, zona intermedia desplazable, botones siempre visibles en pie; estados separados, sin invasión de columnas ni botón naranja fijo. L2 se declara nivel máximo habilitado, no definitivo.
- `dist/index.html`: carga nueva hoja como último estilo y cambia versión del módulo `game.mjs` a v37 para evitar caché anterior.
- `tests/workshop-card-v37.test.mjs`: escenarios de capacidad 8/14, disponibilidad de 6, stock real descontando herramientas instaladas, descarte M8, DTH produciendo, RC en patio, mantenimiento con y sin repuestos, nivel máximo 2, mejora de L1, sanitización HTML y no mutación.

## Criterios de aceptación
- Se ve completa al girar el móvil; no hay textos tapados ni botones encima de estados. El contenido puede desplazarse sin ocultar el pie con las acciones.
- Stock real proviene de `s.toolInventory`, solo `new` / `worn`. El resumen `used` conserva exactamente `workshopUsed` de la economía.
- `spentMaterials` es solo informativo, no se mueve stock ni se contabiliza dinero.
- RC y DTH no se presentan falsamente estacionadas si aún están en faena o en traslado.
- Recambio automático de M4 sigue en el controlador de producción y DrillTruck, no se altera.
- Ninguna mejora L3, moneda inventada o nueva marca externa.

## QA realizado
- Parsing de `dist/chapter/game.mjs`, `dist/mission3/inventory.mjs`, `dist/chapter/workshop-card-view.mjs`.
- Ejecutados modelos y render real con caso sintético L2: 8/14, 6 libres, 57%, 4 bits y 2 martillos libres (además de uno instalado de cada tipo), descarte 1. RC Patio D01; DTH produciendo BH-02. Sin acción contextual cuando está sano.
- Caso con servicio pendiente revela acción real; caso pre-M4 no ofrece gestión DTH; no se modificó estado del simulador.
- Confirmados enlaces y carga CSS, sintaxis de eventos.

## Pendiente
Prueba visual de Android real (resolución landscape y tamaño de letra personalizado) e interacción en partida auténtica. No se ejecutó navegador autenticado a Cloud Save desde el conector.
