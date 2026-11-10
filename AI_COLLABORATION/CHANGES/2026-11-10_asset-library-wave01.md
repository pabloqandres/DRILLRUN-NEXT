# Biblioteca 3D DRILL RUN — Lote 01 (preparación, NO publicación)

Fecha: 2026-11-10. Autor: ChatGPT (área visual, AGENTS.md).

## Recepción y tratamiento

- 15 fuentes recibidas: 8 GLB, 6 FBX y 1 C4D.
- 14 modelos GLB Y-up resultantes, con escala aproximada en metros, reducción selectiva de triángulos, texturas comprimidas/recolorizadas y miniaturas obtenidas del propio asset.
- Se validó mediante trimesh la lectura de los 14 GLB, sus bounds finitos y la integridad del ZIP (testzip sin errores).
- Entrega binaria y previsualizaciones disponibles en el ZIP `DRILLRUN_PACK_3D_LOTE01.zip` de la conversación donde se recibieron los originales. **Los binarios NO están añadidos todavía a este branch**.
- `Digger.c4d`: bloqueado por formato; necesita exportarse desde Cinema 4D a GLB o FBX.
- Importaciones FBX estáticas: NO se conservan rig, animación ni texturas originales. Requieren review de pivotes y piezas articuladas.
- Revisión artística de maquinaria/edificios pendiente. Lote inicial, no aprobación de look final.

## Clasificación propuesta

**Futuros productos de compra**: cono, cerco perimetral, tres contenedores para circularidad, montacargas, dos cargadores frontales, galpón logístico, edificio auxiliar (10 modelos). Mantener `available:false`, `price:null` hasta que haya operación y caja verificadas.

**Escenografía incluida en packs**: pallet de bodega, cajón de almacenaje (2 modelos). No vender como muebles individuales.

**En revisión de identidad**: estructura auxiliar y maquinaria auxiliar (2 modelos). No mostrar al jugador.

**Conversión pendiente**: excavadora C4D (1 archivo).

## Integración real: contrato de trabajo para equipo funcional

1. Adjuntar 14 GLB y miniaturas en `dist/assets3d/drillrun-pack/`; contrastar checksums con el ZIP entregado. Evitar agregar nombres o logos externos de terceros.
2. Conectar sólo productos visualmente aprobados a `catalogProducts(s,t)` de `dist/chapter/construction-catalog.mjs`; preservar categorías existentes. Mostrar previsualización de GLB real, no placeholder.
3. Conectar `CatalogView` y `BuilderUI` con compra/colocación explícitas; **no** enrutar nuevos `kind` al fallback `hsec.purchaseFixed(p.id)`: fallaría o afectaría la lógica HSEC. Usar nuevas acciones tipadas.
4. Definir precios por balance económico, validación de fondos, ledger, persistencia, colisiones y reglas para múltiples unidades (Claude Code / funcional). No fabricar compras gratis, ingresos o puntos HSEC sólo por adquisición. Conservar montos con ícono de moneda sin CR/cr.
5. Efectos propuestos para diseño futuro: HSEC por delimitación efectiva, circularidad por segregación/retirada real, logística ligada a capacidad y stock, maquinaria ligada a obra/costos. No implementados en este lote.
6. Probar Three.js r170 desktop/móvil, límite de memoria GPU, flujo catálogo→compra→colocación→save/restore antes de activar productos.
7. Preservar misiones M1–M5, M4 DrillTruck automático, M5 DrillTruck personal y sus estados de guardado. No cambiar precios o lógica existente.

## Estado de publicación

Sólo metadata en rama `chatgpt/asset-library-wave01`. La base `main`, producción Vercel y el guardado **no** se modifican. PR en borrador para coordinación visual/funcional. Este documento NO confirma compras disponibles dentro de la partida.
