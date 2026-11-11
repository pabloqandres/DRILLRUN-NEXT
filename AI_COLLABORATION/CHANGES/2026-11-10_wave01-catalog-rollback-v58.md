# 2026-11-10 — V58 · Retiro de Wave 01 del catálogo (solicitado por usuario)

## Motivo
Usuario rechazó explícitamente la calidad visual de los modelos y previews aportados en Wave 01 y pidió retirarlos del catálogo. La eliminación afecta SOLO las fichas experimentales de los nuevos modelos, no el catálogo HSEC original.

## Archivos de producción
- `dist/chapter/construction-catalog.mjs`: elimina import/inyector `waveProducts`, categoría añadida `Circularidad` y textos de esa categoría.
- `dist/chapter/catalog-view.mjs`: elimina el atlas Wave 01; restaura los previews originales del Catálogo.
- Elimina `dist/chapter/asset-library-wave01.mjs` y `dist/assets3d/drillrun-pack/catalog-manifest.json` del árbol de `main`: no queda ninguna ficha ni manifiesto de Wave 01 en producción.
- Elimina test y workflow de integración Wave 01, y agrega guard de regresión de rollback.
- Conserva precios HSEC originales, blueprint previo, compras existentes y UI de personal; sin cambios en `state.mjs`, `game.mjs`, economía, save/cloud, misiones M1–M5, NPC, vehículos ni iluminación.

## Binarios y ramas no fusionadas
Los GLB cargados manualmente están sólo en `chatgpt/asset-wave01-runtime-v55` (PR #72, no fusionado) y NO en `main`. No pedir al usuario que borre archivos. Cerrar PR #72 y la propuesta duplicada PR #67 para impedir reintegración accidental; conservar sus ramas como archivo histórico hasta nueva instrucción.

## Validación y entrega
Ejecutar QA selectivo de catálogo y `node --check`; comprobar CI y que las fichas nuevas ya no aparezcan. La publicación a producción exige merge específico de esta reversión. Evitar cualquier colisión con rama activa V57.
