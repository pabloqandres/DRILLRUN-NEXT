# 2026-11-07 — Edificios con mobiliario incluido

## Decisión del usuario
Office Store y la compra/colocación manual de muebles se retiran del flujo del juego. El builder vende módulos predefinidos, no muebles individuales. La oficina L1 trae de fábrica escritorio, silla, computador, archivo e iluminación; L2 incluye dos puestos.

## Código
- El catálogo deja de proyectar productos de mobiliario y se retira esa categoría de navegación.
- El celular deja de ofrecer Office Store y el inventario de muebles; elimina los flujos de compra, variantes y colocación.
- La definición y materialización de los muebles incluidos de L1/L2 permanece en `module-catalog.mjs` y `state.installModuleFixtures()`. Son parte del edificio y no una compra adicional.
- Misión inicial: construir oficina → entrar → usar computador incluido. El requisito no evalúa compra de escritorio/silla/PC por separado.
- Restaurar una partida ya completada no revierte `chapterCompletedAt` por muebles.
- Se elimina el mensaje antiguo del mentor que ordenaba comprar muebles, y la notificación queda ligada al flujo de la oficina.
- Se preserva la representación 3D de los muebles para las oficinas predefinidas, así como los datos históricos de partidas.

## Verificación y riesgos
Se comprobaron estáticamente rutas y secciones eliminadas y la existencia de `installModuleFixtures` y la interacción con PC. Sin QA WebGL end-to-end en una partida nueva. Validar M1 completa y la carga/migración de partidas previas antes de declararlo estable.
