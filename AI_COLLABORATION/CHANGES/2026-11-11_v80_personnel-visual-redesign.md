# V80 · Personal cinematográfico, retratos proporcionales y sonido en Configuración
Fecha: 2026-11-11. Rama: `chatgpt/v80-premium-personnel-title-audio`.

## Diagnóstico de pantalla real del usuario
En Android, la V79 aparecía demasiado plana y compacta: cabecera de Personal con control de sonido ocupando espacio, candidatos con el arte comprimido en filas de altura variable, ficha a la derecha sin jerarquía épica, login y pantalla de carga con logo DRILL RUN demasiado centrado. El usuario aprobó la referencia cinematográfica con personajes grandes, marcos de trazos gruesos, contorno dorado, azul cian, barra de equipo activa, y botones de ficha/desarrollo/salario/historial.

## Cambios implementados
- `dist/chapter/visual-polish-v80.css`: última capa de estilo de 27 KB exclusiva para Personal e identidad de inicio/carga. Modal más alto en landscape, título propio con barra roja/ícono, saldo real visible, paneles con bordes de juego, retratos dominantes, separación entre tarjetas, botón de contratar dorado, pestañas estilo consola y equipo activo horizontal. Layout adaptativo para móviles landscape de menos de 500px de alto, retratos con `object-fit:cover`. Login y carga tienen anclaje izquierdo estable para logo y texto asociado.
- `dist/chapter/personnel-premium-v76.mjs`: cuatro pestañas reales de ficha, desarrollo, salario e historial, todos de solo lectura salvo contratación original. Las tres imágenes V78 se muestran en wrappers individuales V80 de aspect-ratio 230×260; los otros 18 personajes conservan placeholders.
- `dist/assets/npc-portraits-v80/`: tres SVG autocontenidos con WebP codificado del atlas V78, cada uno recortado a su propio frame, sin logos ni textos.
- `dist/chapter/faena-center.mjs`: cabecera de Personal y pestañas manejadas con los eventos existentes; retirado volumen UI de esa ventana, sin modificar contratación real.
- `dist/chapter/game.mjs`: el slider UI se inserta en Configuración junto al control general de sonido, persistiendo bajo la misma clave previa. No se tocan audio ambiental ni música.
- `dist/index.html`: hoja V80 cargada después de la V76, sin alterar scripts o auth.

## Validación / fuera de alcance
No cambian costos, progreso, guardado, salarios propuestos, transacciones, misión M1–M5 ni animaciones mundo/GLB. Los 18 retratos pendientes permanecen neutros. CI de V80 y regresiones V75–V79; revisión final Android después del autodespliegue desde `main`. Cualquier error preexistente M4 offline queda fuera de este cambio.
