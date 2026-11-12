# V101 · Ajustes aprobados de Personal: lista de habilidades y flechas centradas

**Fecha:** 2026-11-12
**Rama:** `chatgpt/v101-personnel-skill-list-pager`

## Alcance exacto
1. **Lista de habilidades (solo la ficha derecha).** En lugar de tres grandes tarjetas en columnas, presentar tres filas compactas, cada una con el mismo pictograma, nombre y cinco puntos de nivel. Altura base 26px por fila en PC y 23px en móvil horizontal pequeño. Los valores y habilidades siguen iguales; CSS no modifica datos.
2. **Paginación del equipo activo (franja inferior).** Reemplazar glifos de texto ‹ ›, cuya tipografía producía un centro óptico desigual, por dos SVG con caminos matemáticamente simétricos. Mantener los mismos dos botones, tamaños iguales, contador centrado `1 / n`, borde y glow discretos. Dimensiones adaptativas: 32×36 PC; 26×30 mobile horizontal. Usar flechas de color atenuado cuando deshabilitadas, sin desplazarlas.
3. **Elementos intocables:** fotografía y cara de cada personaje, tres plazas visibles, swipe horizontal, jerarquía de roles, precio y contratación, misiones, capacidad actual, saldo, guardado, menú radial y controles del juego.
4. **Arquitectura:** nuevo CSS `dist/chapter/personnel-tuning-v101.css` cargado al final tras V100 en `dist/index.html`; modificación mínima de dos etiquetas `button` en `dist/chapter/personnel-premium-v76.mjs`, sin cambiar sus eventos o condiciones. No editar `game.mjs`, `state.mjs`, `mission*.mjs` ni Cloud Save.
5. **Pruebas:** `tests/v101-personnel-skills-pager.test.mjs` + regresiones de Personal V76–V100 en workflow V101. Verificar status READY y URLs de JS/CSS servidos en producción antes de declarar online.

## Aceptación visual pendiente
La suite prueba estructura, CSS, DOM generado y comportamientos preexistentes; confirmar alineación óptica real y lectura en PC/Android con captura de una partida.
