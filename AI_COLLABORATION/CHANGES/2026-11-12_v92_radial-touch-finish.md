# V92 · Menú radial: tactilidad real, altura y acabado
Fecha: 2026-11-12
Rama: chatgpt/v92-radial-touch-finish

## Captura y pedido del usuario
V91 en Android landscape muestra la forma del arco y los textos bien, pero el control pegado al borde inferior, imposible deslizar por touch (solo las flechas operan), y tres sectores/botón central demasiado planos, sin biseles ni glows sutiles comparables al concepto aprobado. Mantener forma, iconografía y flechas, corregir funcionalidad y pulir sin sobrecargar.

## Causa del gesto táctil
La V90 registraba `pointerdown` exclusivamente en `.dr90Choices` y las opciones. El SVG de los tres segmentos `.dr90Ring` tenía `pointer-events:none`, por lo que deslizar el dedo sobre las superficies grandes se enviaba al mundo 3D; el dedo también salía enseguida del rectángulo pequeño del icono. Además, el umbral de arrastre era de 44px y esperaba 320ms.

## Implementación
- Reutiliza el módulo activo `dist/chapter/semi-radial-dock-v90.mjs`, sin crear otra rueda ni sumar estilos extra.
- Los tres SVG sectores se convierten en zonas hit-test `pointer-events:visiblePainted` con `touch-action:none`. Sus detalles visuales (glass, líneas y bisel) son transparentes a los eventos.
- Un solo controlador de gesto inicia en icono o sector, continúa en `window.pointermove` aunque el dedo salga del icono y acepta swipe de 30px en lugar de 44px, con limitación de 165ms por detent. Se contempla el gesto rápido `pointerdown/pointerup` sin eventos intermedios. Las opciones siguen siendo seleccionables con tap; se bloquea click accidental tras girar. Los event listeners se limpian en `destroy()`.
- El hub conserva toque/pulsación mantenida y swipe, con el mismo umbral. Flechas, teclado, rueda de ratón y feedback de sonido original se mantienen.
- Elevación del control ~26–35px respecto de V90: `bottom:clamp(46px,7dvh,66px)`, versiones responsive 38/34px para evitar controles del sistema.
- Misma geometría circular, ahora con capas anulares transparentes de cristal, biseles finos .7px, realce del centro en dorado controlado, cian difuso y hub 56px con aro interno, relieve y glow puntual.
- Se actualizan las pruebas estéticas V90 para el nuevo margen, biseles y easing; tests V92 simulan touch sobre sector, icono, swipe rápido y toque, además de comprobar que existen y luego se eliminan los listeners de captura.

## Fuera de alcance
No se modifica `game.mjs`, `index.html`, finanzas V91, Cloud Save, Personal, misiones, economía ni saldo. No crear logos ni marcas.
