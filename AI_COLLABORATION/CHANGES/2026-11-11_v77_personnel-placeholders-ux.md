# V77 · Personal operativo con placeholders neutrales (sin arte final)
Fecha: 2026-11-11. Rama: `chatgpt/v77-personnel-placeholders-ux`.

## Objetivo
Continuar la pestaña Personal aprobada sin quedar bloqueados generando 21 retratos. Basado en las tres referencias visuales del usuario: misión/roles a la izquierda, tres candidatos y su comparativa en el centro, ficha a la derecha, slots del equipo activo al pie.

## Implementación
- `dist/chapter/personnel-premium-v76.mjs`: sustituye las referencias <img> del render por placeholder de silueta CSS original con texto «Retrato pendiente», manteniendo `portrait` en los datos para futura aprobación. Cada carta deja ver las tres skills registradas; ficha y slots usan el mismo estilo neutro.
- `dist/chapter/personnel-premium-v76.css`: refinamiento V77 acotado al panel Personal. Escalado landscape corto, portrait, controles keyboard focus y scroll táctil; sin añadir logotipos ni fotos.
- `dist/chapter/faena-center.mjs`: seleccionar desde Equipo activo recupera la identidad `candidateId` registrada, evitando mostrar por error el candidato número uno.
- `tests/v77-personnel-placeholders.test.mjs`: conserva los 21 registros, tres candidatos/skills por rol, no <img> de placeholder, placeholders en slots y conexión al ID de contratación real.
- Workflow V77 ejecuta pruebas específicas y V76 sobre PR y ramas de desarrollo.

## Fuera de alcance
Sin bonos de habilidades, crecimiento de nivel real, salarios mensuales, misiones, gastos de contrato, mecánica de contratación, datos Cloud Save o cambios de mundo 3D. Arte de los NPC del mundo no se sustituye. La calidad visual final debe revisarse en Android antes de un merge/deploy.

## QA
Pruebas de CI sujetas a resultado de GitHub Actions. No afirmar aceptación visual en dispositivo hasta realizarla.
