# V103 · Taller gráfico y acceso real al ala de ampliación

Fecha: 2026-11-13
Rama: `chatgpt/v103-workshop-world-access-visual`

## Dos defectos de V102
1. El usuario veía cabecera completamente invadida por textos y contadores. **Causa**: los `<header>` anidados en paneles del Taller recibían reglas CSS globales, posicionándose sobre el header de la ventana.
2. El ala nueva L2 tenía puerta y geometría, pero los eventos de la mano y toque del edificio solo consideraban el acceso/centro original de L1.

## Especificación implementada
1. Única instalación Taller niveles 1 y 2. Entrada base (-6.8,-5.4); entrada lateral L2 (-2.45,-6.05), derivada de puerta del modelo en `scene.mjs`. Ambas conducen a `openFaena('workshop')` y no generan negocio ni estructura adicional.
2. Tap en mesh real del ala L2 con raycast o suelo del volumen L2 desde jugador cercano; nunca activar desde lejos, mientras construye o está fuera de la misión. Mano disponible cerca de ambas puertas.
3. Modal PC más pequeño (~88vw × 86dvh, límite 1150×620); móvil horizontal se adapta a safe margins y permite scroll central, footer fijo y controles alineados.
4. Una sola cabecera visible `Taller técnico`, sin `<header>` internos; eliminar solapes de contadores.
5. Vista gráfica: imagen del edificio desde asset de catálogo, aro de capacidad libre, tres minindicadores iconográficos, CTA dorado solo cuando procede, franja discreta de estado al nivel máximo, tres estaciones táctiles (bits, martillos, kits) con contenido operativo bajo expansión, actividad y DTH compacto.
6. Progreso en obras permanece derivado de tiempos reales previos. Precio Nv.2 8.000, duración 05:00, stock real, kit y recuperación, contrataciones, misiones, Cloud Save y animaciones no cambian.
7. Quitar información redundante y la duplicidad del título de la sección que tenía V102.

## Archivos
- `dist/chapter/workshop-world-access-v103.mjs` nuevo, cálculo puro de puerta y área.
- `dist/chapter/game.mjs` mínimo enganche en eventos existentes (comunicado en DECISIONS).
- `dist/chapter/workshop-v103-view.mjs` nuevo, proyección read-only del Taller.
- `dist/chapter/faena-center.mjs` cambio de ruta a V103 y header aislado.
- `dist/chapter/workshop-visual-v103.css` nuevo, scoped.
- `dist/index.html` nuevo CSS último, query de JS incrementado para evitar caché.
- `tests/v103-workshop-access-graphic.test.mjs` y CI nueva; aserción legacy V102 actualizada para referir al renderer vigente.

QA: ejecutar node --check y suites V103/V102/V73 y colliders; verificar preview Vercel, PR a main y producción. Validación visual de usuario en dispositivo permanece posterior.
