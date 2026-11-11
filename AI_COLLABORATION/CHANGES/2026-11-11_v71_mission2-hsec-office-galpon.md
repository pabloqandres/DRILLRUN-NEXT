# V71 — Misión 2: HSEC, Oficina compacta, Galpón segundo
Fecha: 2026-11-11 · ChatGPT · Rama: `chatgpt/v71-m2-hsec-office-galpon-layout`

## Solicitud del usuario y evidencia visual
- Usuario confirmó M1 terminada y cerrada; M2 en ejecución, 6/100 HSEC, checklist 2/7.
- Captura HSEC: pestañas superiores parcialmente ocultas por el área del checklist, con poco espacio de navegación.
- Captura Oficina: modal de vista/mejora N1 tan ancho que tapa el terreno y no se aprecia lo que mejorará.
- Captura Catálogo Edificios: aparece Taller y Patio entre Oficina y Galpón. Quiere Galpón inmediatamente después de Oficina para completar M2 fácilmente.

## Cambios
1. `dist/chapter/m2-layout-v71.css` nuevo archivo visual: modal HSEC con header/pestañas de altura protegida fuera del scroll vertical, row de tabs horizontal scrollable si no cabe; contenido checklist scrolleable. Modales cortos de paisaje soportados mediante CSS dinámico.
2. Modal `#modal.officeQuick` con ancho reducido de 610 CSS px a máximo ~410 / 43vw (360/42vw en paisajes cortos), preview real del edificio arriba, datos y acciones apiladas, scroll acotado sin ocultar botones de compra/upgrade ni entrar; muestra más superficie real de obra. No toca ProductPreview ni la geometría de la oficina.
3. `dist/chapter/construction-catalog.mjs`: reordena en la lista `products` la misma referencia `shed` después de `office` (segundo elemento de categoría infrastructure). Su definición está en `HSEC_ASSETS` con id, precio, lock/status y dimensiones intactos. Taller y Patio mantienen su orden relativo; flechas y tarjetas usan la misma matriz de productos.
4. `dist/index.html`: agrega `m2-layout-v71.css?v=71` al final de la cascada para no cambiar otras modales.
5. Test `tests/v71-m2-layout-galpon.test.mjs` + workflow V71. Corrige test V39 obsoleto de nombre de caché de `game.mjs`: valida módulo versionado, no la revisión vieja ya inexistente.

## Límites
No cambia M1/M2/M3+, estado de misión, HSEC 6/100 o 2/7, lógica/compra del galpón, costos, bonos, Google Cloud Save, inventarios, caminos, economía o equipo. Sin cambios en datos del jugador. Este trabajo es solo UI y orden read-only. Las capturas son del usuario; no se realizó prueba WebGL interactiva en Android por parte del agente.

## QA
El workflow específico V71 con regresiones de catálogo/office v39 y checklist v16 pasó. Preview branch Vercel READY. Validación visual de cada pestaña de HSEC y del panel sobre Android queda pendiente; la corrección se puede afinar después de la siguiente captura.
