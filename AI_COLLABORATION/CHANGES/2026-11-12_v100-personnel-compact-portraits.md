# V100 · Personal compacto e ilustraciones preservadas
Fecha: 2026-11-12
Rama: `chatgpt/v100-personnel-compact-portraits`

## Instrucciones visuales aprobadas, convertidas a contrato textual
1. **Ventana:** PC `min(1320px,85vw)` de ancho y `min(760px,84dvh)` de alto, adaptando móvil horizontal para no recortar; título «Personal», saldo, Volver y Cerrar.
2. **Roles:** 4 principales por misión/selección, con icono, rótulo y contador, y disclosure «Ver todos los roles» que conserva los 7 y sus bloqueos.
3. **Candidatos:** exactamente 3 tarjetas por rol, cada una con retrato original, nombre, estrellas, 3 habilidades iconográficas con cinco puntos, costo y disponible/bloqueado/contratado. La selección actualiza a la derecha, **sin CTA Contratar duplicado**.
4. **Ficha rápida:** retrato, nombre, rol, estrellas, descripción de dos líneas, 3 estadísticas y único botón contratar de siempre. Ficha/Desarrollo/Salario/Historial se encuentran bajo «Más detalles», conservando sus datos y eventos.
5. **Equipo activo:** una franja de tres plazas visibles en cada momento, desplazamiento horizontal nativo touch/scroll y flechas prev/next, contador `página/total`, fotos circulares y nombres/roles legibles. Gestionar equipo permanece accesible y su vista original se mantiene.
6. **Vacantes:** el contador y los slots siguen la capacidad real sin modificar el estado. El futura concesión de nuevas vacantes por misiones requeridas o recompensas es **fase funcional pendiente** por falta de cantidades/reglas; no inventar nuevas vacantes, límites ni premios.
7. **Fotografías:** conservar ilustraciones de identidad V80 de Administración (origen WebP 690×260, 230×260 por rostro) y SVG vectoriales originales de otros roles; no cambiar facciones. Quitar tamaños forzados, estiramientos, fondo atlas duplicado y zoom agresivo; `object-fit:contain`, centrado, proporción nativa, `image-rendering:auto`. Los 230×260 no son originales de alta resolución: una mayor nitidez real necesitará arte original más grande.
8. **Seguridad:** ninguna marca añadida; no tocar misiones, contratos, economía, precios, contratación, guardados o navegación.
9. **QA:** nueva suite de Personal V100 más regresión V76–V81, smoke Vercel preview/prod y aceptar QA de dispositivo como validación visual posterior.

## Archivos
- `dist/chapter/personnel-premium-v76.mjs` — marcado y datos visuales (render puro).
- `dist/chapter/personnel-v100-interactions.mjs` — UI únicamente, desplazamiento de tres plazas y contador.
- `dist/chapter/personnel-compact-v100.css` — estilos scoped exclusivamente a la ventana Personal, luego de todos los overrides anteriores.
- `dist/index.html` — único enlace CSS, coordinación anotada en DECISIONS.
- `tests/v100-personnel-compact-portraits.test.mjs`, `tests/v81-personnel-no-jitter.test.mjs`, `.github/workflows/v100-personnel-compact-portraits.yml` — QA.

## Resolución de fotos
CSS mantiene el aspect ratio, evita distorsión de fondo y amplificación innecesaria. No se afirma que una fuente raster pequeña pueda subir su resolución nativa. Se debe revisar visualmente en Android y computador con hardware real; pruebas de código no equivalen a prueba fotográfica final.
