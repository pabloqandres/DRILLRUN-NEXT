# V88 · Menú radial en ordenador y Personal con retratos reales
Fecha: 2026-11-12
Estado: en revisión antes de integración

## Hallazgo
La captura del usuario muestra una línea de arco superpuesta, iconos fuera del centro de sus sectores y botón inferior demasiado pegado. Tres módulos visibles sin explicación ni controles en PC parecen un menú incompleto. La vista Personal solo había recibido retoques CSS, mientras la plantilla V76/V78 aún forzaba **18 retratos pendientes** pese a existir SVG originales V76 de los 21 candidatos en el repositorio.

## Correcciones
- Un solo SVG de fondo con **tres sectores continuos**, exactamente una curva perimetral superior, una inferior y dos separadores; se elimina el path extra `drSemiRim`, ocultando también todos los viejos adornos.
- Cinco posiciones de acceso recalculadas como porcentajes del SVG 400×112: iconos y rótulos centrales dentro de cada sector, 2 anticipos tenues en extremos. Más separación respecto a la rueda activadora.
- PC: dos controles clicables de navegación izquierda/derecha y una indicación de **10 secciones**, sin perder ratón, rueda, flechas, gestos táctiles, accesibilidad ni feedback de sonido; wheel recibe limitación para no saltar varios módulos por un solo gesto.
- Personal: se conecta el valor `candidate.portrait` del registro V76, ya existente para los 21 perfiles. Los tres Admin mantienen su ilustración posterior V80; los otros 18 muestran **su ilustración original individual**, no siluetas. Nuevo CSS de jerarquía limpia en PC y paisaje móvil, fotos sin deformar, pie de equipo fijo, controles de contratación originales.
- Se actualizan las pruebas legadas de marcadores sin imagen, ya obsoletas al usar assets previamente disponibles. No se generan nuevas marcas ni se cambia ninguna habilidad, contrataciones, misión, saldo, guardado o sincronización.

## QA
Pruebas de 3+2, 10 rutas, SVG y layout, retratos 21×1, repetición de render sin temblores, Google inicio y regresiones V77/V78/V80/V81/V83/V84/V86/V87. Las proporciones finales deben confirmarse en capturas reales de PC/Android después del despliegue; no confundir tests de HTML/CSS con validación visual.
