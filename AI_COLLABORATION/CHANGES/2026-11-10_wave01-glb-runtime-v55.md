# 2026-11-10 — Wave 01 · cargador de GLB reales y fichas 3D (V55, rama aislada)

## Alcance confirmado

- Biblioteca cerrada a 14 modelos, `Digger.c4d` excluido.
- Nuevo `dist/chapter/asset-wave01-runtime.mjs`: carga lazy de GLB originales, caché por ID, verificación de geometría/limites, clonación, materiales toon opcionales, normalización de pivote, preview holográfico celeste de edificios mediante `ConstructionHologram`.
- `dist/chapter/builder-ui.mjs`: ficha ampliada de Wave 01 ahora crea un visor Three.js interactivo del GLB al abrir Detalles. La miniatura de atlas real permanece si el archivo falta o falla; no se crea WebGL al navegar tarjetas.
- Pruebas `tests/asset-wave01-runtime.test.mjs`: sintaxis del adaptador, IDs completos, exclusión C4D, estado de manifiesto, y validación binaria de cada GLB/JPG en cuanto se copien.
- Esta rama no altera precio, compra, HSEC, M1–M5, circulación, NPC, salvado, ledger, motor de producción, audio ni Vercel.

## Bloqueo conocido — subida binaria

Los 14 GLB (5,79 MB) y miniaturas están disponibles en el paquete de trabajo `DRILLRUN_PACK_3D_LOTE01.zip` de esta conversación, pero **no** en GitHub; el conector actual permite cambios de texto, no transferir los archivos del sandbox al servidor sin un puente binario. No afirmar despliegue real ni que los productos puedan comprarse. El manifest debe seguir bloqueando productos nuevos hasta que exista compra, coste, trazado, collider y guardado.

## Instalación

Extraer el ZIP y copiar `dist/assets3d/drillrun-pack/*.glb` + `previews/*.jpg` a la misma ruta en una rama basada en este PR; no reemplazar el `catalog-manifest.json` ya fusionado a main (el del ZIP utiliza otro esquema). Revisar `npm test` y verificación WebGL Android. Vista interactiva disponible sólo después de subir GLB reales.

## Progreso verdadero

Textos/visor: implementados en PR. Modelo binario remoto: pendiente. Compras y ubicación: pendientes. Blueprint de edificios: adaptador disponible, sin integrar al modo de construcción real hasta aprobar zonas y timer. PR y prueba móvil antes de merge y despliegue.
