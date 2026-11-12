# V81 · Personal sin parpadeos y fiel a la referencia gráfica
Fecha: 2026-11-11

## Problema real
El loop central `game.mjs` invoca `faenaCenter.render()` cada 2600 ms mientras esté visible; la función reconstruía por completo la ventana mediante `this.host.innerHTML`. Al eliminar los <img> originales, se forzaba un nuevo layout y una decodificación SVG/WebP, provocando el salto/achatamiento reportado y pérdida de posición de scroll. La solución es visual: `FaenaCenterUI.render()` compara el cuerpo HTML y no reconstruye DOM si es idéntico; si solo cambia `s.cash` actualiza exclusivamente `.pvHeaderFunds.textContent`. Las otras rutas continúan refrescando igual.

## Modificaciones visuales
- 3 cards Administración con retratos 230×260 sin escala forzada ni animaciones; imagen `object-fit:cover`, caja de retrato con altura estabilizada.
- Nueva jerarquía: icono de planilla cian grande en encabezado, tarjetas estrechas, bordes cian reforzados y seleccionado amarillo intenso.
- 22 habilidades del registro agrupadas en 11 pictogramas originales, dibujados directamente en el DOM, tanto en cartas como en detalle. Pestañas de la ficha también incorporan pictogramas.
- La ficha derecha recibe retrato a la izquierda y bloque de nombre, rol, estrellas y descripción a la derecha; tabs con minmax(0,1fr), contenidos desplazables y ancho restringido, precio y CTA siempre dentro del panel.
- CSS aislado `dist/chapter/personnel-polish-v81.css` con reglas Android horizontal/vertical y pantallas pequeñas.

## Exclusiones y QA
No cambiar lógica de misiones, contratación/costos, Cloud Save, estado, economía, bonuses ni salarios. V80 retratos originales quedan intactos. Ejecutar regresión V76–V80 y pruebas V81 en Actions, después merge a GitHub main y comprobar Vercel source=git target=production READY. Revisión física Android por el usuario pendiente.
