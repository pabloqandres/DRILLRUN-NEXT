# V67 — portada responsive, pantalla inmersiva, marcha atrás y ejes de ruedas

Fecha: 2026-11-11 · Agente: ChatGPT · Rama: `chatgpt/v67-responsive-entry-wheel-axles`

## Evidencia
- Android en paisaje ancho: la portada V65 se deformaba por un override `@media(min-aspect-ratio: 1.9)` que asignaba 100vw × 100vh y eliminaba el `aspect-ratio`. No se cambia el arte aprobado ni las animaciones.
- Barra de URL visible antes de entrar. Los navegadores prohíben ocultar su chrome al navegar sin gesto del usuario; la PWA ya declara `display: fullscreen` y `orientation: landscape`. Se solicita fullscreen solo en el toque real de Continuar/JUGAR, con `catch` seguro. No hay promesa de fullscreen al abrir un URL en una pestaña del navegador.
- A 60 FPS, la primera marcha atrás valía 1.62/60≈0.027 m/s, menor al umbral de idle 0.035 que la anulaba en cada frame. Solo se anula ahora movimiento residual si sueltan acelerador o frenan.
- El fallback V66 ponía llantas pequeñas sobre puntos aproximados del modelo completo. Se reconocen primero 4 neumáticos físicos anónimos por geometría; si vienen fusionados, se amplían las caras de las llantas y se corrigen posiciones relativas a los ejes. El GLB y la ruta M4 no se alteran.

## Archivos
- `dist/title-preview-v65.html`: eliminar stretch ultrawide, fallback fullscreen bajo interacción del botón de bienvenida.
- `dist/chapter/game.mjs`: fullscreen antes del primer await de Continuar.
- `dist/index.html`: atributo fullscreen permitido al iframe same-origin.
- `dist/mission5/personal-drilltruck.mjs`: ajuste exclusivo a deadzone cuando el acelerador está presionado.
- `dist/graphics/personal-truck-wheels-v66.mjs`: mallas genéricas de 4 ruedas y fallback corregido para M4/M5.
- `tests/v67-responsive-entry-reverse-wheels.test.mjs` y `.github/workflows/v67-responsive-entry-reverse-wheels.yml`.

## Límites y verificación
- No se cambia guardado, economía, misiones, seguridad, compras, velocidades máximas, ruta de vehículo M4 ni contenido del GLB.
- Las pruebas automatizadas verifican lógica y geometría sintética; los puntos exactos de ruedas del GLB real, fullscreen en navegador Samsung y el letterbox cinematográfico requieren QA Android.
- No publicar a producción ni fusionar a `main` sin la aprobación de la versión y los checks.
