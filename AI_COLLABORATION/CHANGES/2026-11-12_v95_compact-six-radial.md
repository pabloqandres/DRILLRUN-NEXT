# V95: Menú radial compacto de seis sectores

Fecha: 2026-11-12. Rama: `chatgpt/v95-compact-six-radial`.

## Solicitud
El usuario probó V94 en el juego y validó el tamaño y la posición global, pero mostró un trazo cian sugiriendo reducir el arco y añadir más destinos en el mismo cuarto de círculo (idealmente seis). Una imagen conceptual posterior mostró seis categorías; el usuario ordenó explícitamente no generar más imágenes y realizar la modificación en código preservando la forma circular.

## Código
- `dist/chapter/semi-radial-dock-v90.mjs`: mismas referencias de acción y misión. Centro polar (500,465), radios 365 y 244, radio de iconos 304; seis gajos en 90° con junta de 0,8°. Equivalencia exacta para el movimiento y el sector visible; seis IDs originales, cuatro a través de giro infinito. Nueva selección directa en el primer toque sobre cualquier gajo.
- `dist/chapter/semi-radial-command-v90.css`: solo se agregan estilos localizados, dimensiones y tipografía de iconos/etiquetas. No se modifica la geometría de la base conjunta, joystick, panel misión ni botón de acción.
- `tests/v90-radial-command-wheel.test.mjs` y `tests/v92-radial-gestures.test.mjs` revisados para seis gajos, orden y selección directa.

## Criterios de aceptación
Seis sectores geométricamente concéntricos; iconos y etiquetas legibles; giro táctil continuo de velocidad moderada, sin flechas e infinito, ajuste a sector al soltar. Acción/interacción independiente, misma alineación inferior y márgenes seguros. Ninguna lógica de M1–M5, finanzas, HSEC, inventario, teléfono o Cloud Save puede alterarse.

## Estado de QA
Vercel preview es automática al empujar la rama, pero READY no demuestra un resultado visual aprobado en PC/Android. Se requieren pruebas de CI y revisión humana. No se mezcla ni se despliega a producción sin aprobación expresa de V95.
