# V41 · Patio de Maquinarias L1: imagen real del modelo 3D en Catálogo

## Fallo reportado
Después de V40 el Catálogo mostraba Taller y Galpón con sus imágenes, pero Patio de Maquinarias L1 aparecía con un ícono gris genérico, pese a que el mundo ya poseía holograma 3D del patio.

## Causa
`BuilderUI.renderStore` proporcionaba imágenes para Oficina, Taller, DrillTruck y módulos HSEC, pero omitía `p.kind==='patio'`. `CatalogView` recibe `null` y representa el icono de respaldo.

## Solución desarrollada
- `dist/chapter/product-preview.mjs`: `patioThumbnail(world,structuralSource)` renderiza una captura transparente del verdadero prefab 3D, compuesto por explanada, circulación, acceso fijo, cubierta para camionetas/DrillTruck, galpón, combustible y señalética HSEC. Generación puntual con el motor `ProductPreview` existente: no se crean edificios ni se toca economía/guardado.
- `dist/chapter/builder-ui.mjs`: `getPatioThumbnail()` recupera el prefab, renderiza una vez, conserva el resultado en `buildingThumbnails`; el mismo callback se utiliza en tarjeta y ficha técnica.
- `dist/chapter/game.mjs`: inyecta `getPatioPreviewSource` desde `m5World.structuralSource`, inicializando solo la visualización del mundo si M4 está terminada.
- `dist/index.html`: nueva versión de entrada `game.mjs?v=20261110-patio-thumbnail-v41` para invalidar caché JavaScript del navegador Android.
- `tests/patio-catalog-thumbnail-v41.test.mjs`: cobertura de cableado del render real, tarjeta/ficha, ausencia de mutación económica, reutilización de caché y geometría genuina.

## QA realizado
- Validación de sintaxis de módulos cambiados y catálogo.
- Prueba de `BuilderUI.getPatioThumbnail` ejecutada en V8 con proveedor de imagen 3D simulado: dos consultas retornan la misma imagen, renderiza una sola vez.
- Se confirmó que `CatalogView` utiliza `thumbnail(p)` para las tarjetas y `thumbnail(picked)` para la ficha técnica, sin paths alternativos de placeholder.
- No se modifica M1-M5, progreso, rutas, inventario, balance ni Cloud Save.
- No se ha podido confirmar visualmente el PNG WebGL en el teléfono del usuario; el render real queda sujeto a prueba con Android y su sesión del juego.

## Política
Cada edificio debe utilizar su imagen real del asset/prefab disponible, tanto en tarjetas como en fichas técnicas, y conservar el holograma 3D del mundo como una funcionalidad distinta.
