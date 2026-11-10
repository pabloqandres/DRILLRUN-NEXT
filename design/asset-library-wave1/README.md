# Asset Library Wave 01 — 2026-11-10

Paquete de primera pasada gráfica para DRILL RUN NEXT GENERATION.

## Estado real

- Recibidos: **15 archivos** (6 FBX, 8 GLB y 1 C4D).
- Procesados: **14 GLB**; análisis geométrico y reexportación validados de forma automatizada.
- Peso acumulado de GLB: **5,79 MB**, frente a originales mucho más pesados.
- Pendiente: **Digger.c4d** requiere exportación externa a FBX/GLB.
- 14 miniaturas reales y catálogo de revisión incluidos en el ZIP entregado al usuario en conversación.
- **Los archivos binarios NO están incluidos en esta rama de GitHub.** La copia del ZIP en `dist/assets3d/drillrun-pack/` es el paso pendiente antes de importar modelos en el juego.

## Seguridad funcional

Esta rama contiene **solo metadatos y especificación**: no modifica precios, fichas activas del catálogo, lógica de compra, progresión, inventarios, HSEC, estados de guardado, misiones 1–5 ni Vercel.

El archivo `catalog-proposal.json` enumera los 14 modelos y su clasificación propuesta. Sus `archivo_esperado` son destinos FUTUROS. No apuntar el catálogo publicado a estas rutas sin subir los GLB y validar el navegador.

Las compras sugeridas corresponden a caminos/cierres HSEC, contenedores, maquinaria y nuevos edificios. Los pallets y cajones serán parte automática de packs de mobiliario de galpones/bodegas, no productos de compra individual.

## Dependencia de integración

El catálogo actual y la economía pertenecen a Claude Code y tienen cambios simultáneos activos en V50/M5. Para habilitar ventas se requiere aprobación del precio y alcance, configuración de colocación, ahorro/carga, colisiones y revisión de misión. ChatGPT puede trabajar GLB/materiales/previews, sin cambiar el contrato económico.

## Tests y revisión visual

Se han verificado 14 GLB mediante carga con `trimesh`, geometría no vacía, límites finitos, suma de triángulos, previsualizaciones existentes y ausencia de etiquetas externas conocidas en los binarios nuevos. **No** se han ejecutado QA en Three.js/WebGL real, perfilado móvil ni `npm test` del juego.

No mezclar ni desplegar a producción hasta completar el paso de carga binaria, smoke visual e integración funcional autorizada.

