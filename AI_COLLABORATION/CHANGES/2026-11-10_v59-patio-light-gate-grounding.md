# V59 · Patio seguro y legible de noche: barrera + DrillTruck® + luces

## Solicitud y evidencia
Captura horizontal Android del Patio operando de noche: pluma de acceso con apertura muy abrupta, DrillTruck® 02 visible hundida en pavimento y zonas de vehículos/herramientas/equipos con iluminación insuficiente. Usuario ordena implementar todo.

## Diagnóstico en código existente
- `patio-world.mjs`: animación de barrera `angle += (desired-angle)*.18` por fotograma, extremadamente rápida y dependiente de FPS; el sensor de vehículo tenía un umbral de solo 10 m aunque la velocidad de 30 km/h es posible.
- `game.mjs`: la DrillTruck® personal utiliza `position.y=.12` en cada actualización, mientras el asfalto final de Patio tiene soporte a y=.19 y las losas logísticas llegan a y=.48.
- `patio-world.mjs`: los halos de iluminación de logística/combustible se dibujaban a y=.295, por debajo de losa de hormigón (superficie ≈ y=.48), y no había luminarias funcionales suficientes bajo el estacionamiento techado.

## Cambios
1. `dist/animation/patio-gate-motion.mjs`: animación independiente de FPS, apertura/cierre 1,6 s con easing, hold de 1,7 s tras última detección, reversa progresiva.
2. `dist/mission5/patio-world.mjs`: usa el módulo de barrera manteniendo bloqueador HSEC original, amplía 15 m de detección de camioneta, añade luminarias de tarea bajo techumbres de estacionamiento/logística/combustible con presupuestos dinámicos por calidad, halos sobre losas elevadas y mayor cobertura de plazas pesadas y P01.
3. `dist/graphics/personal-truck-grounding.mjs`: altura visual de apoyo de 4 ruedas y centro en suelo muestreado, ajusta automáticamente offset GLB medido.
4. `dist/chapter/game.mjs`: integración acotada de soporte vertical del vehículo personal, no en física.
5. `tests/v59-yard-night-gate-grounding.test.mjs`: regresiones de tiempo a 30/60/120fps, stop safe collider, pausa, ruedas y luz.
6. `tests/v52-night-patio-driving.test.mjs`, `tests/v56-personal-drilltruck-recovery.test.mjs`: adaptar aserciones visuales históricas a V59, sin cambiar comportamiento económico/guardado.
7. `.github/workflows/v59-yard-night-gate-grounding.yml`: CI focal con regresiones V50-V59.

## Exclusiones
No cambia M1-M5, guardado, economía, controles joystick/freno, automatización de M4, reparto de rutas de maquinaria, precios/stock ni puntuación HSEC. No se añade marca externa. QA WebGL Android pendiente de comprobar visualmente en dispositivo, incluso si CI resulta verde.
