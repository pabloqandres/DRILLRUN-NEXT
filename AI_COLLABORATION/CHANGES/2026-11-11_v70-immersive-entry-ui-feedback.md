# V70 — Android fullscreen de entrada + feedback de selector más audible
Fecha 2026-11-11 · ChatGPT · Rama `chatgpt/v70-immersive-entry-ui-feedback`

## Qué solicitó el usuario
Captura Android: después del login el selector de avatar continúa mostrando la URL / barra superior. En pantalla de navegador integrado la tarjeta y CTA «COMENZAR MI PROYECTO» quedan muy bajos. Los clicks / whoosh de interfaz son demasiado tenues.

## Qué ocurre técnicamente
- `#play` ya llamaba `requestImmersive()` antes de `await`, pero `#newGame` y su confirmación no, y `#startAdventure` solo lo solicitaba después de la posible sincronización asincrónica con Google.
- Navegadores integrados en otras aplicaciones, Chrome Custom Tabs o políticas de plataforma pueden denegar fullscreen. No existe API web capaz de eliminar forzosamente la barra de direcciones sin permiso. `dist/manifest.json` ya usa `display: fullscreen` y `orientation: landscape` para instalación independiente como PWA.
- No se inspeccionó WebGL interactivo del dispositivo del usuario; su captura es la evidencia visual. El preview debe validarse en Android.

## Corrección limitada
- Nuevo `dist/chapter/immersive-entry-v70.mjs`: solicita fullscreen desde interacción directa, informa true/false según resultado sin ocultar rechazos.
- `dist/chapter/game.mjs`: fullscreen **antes** de trabajo asincrónico en Continuar, Nueva partida, confirmar reemplazo y Comenzar; seguimiento de `fullscreenchange` y control de reintento manual sólo en selector cuando hay API y el navegador no aceptó.
- `dist/index.html`: botón accesible de fullscreen en el selector, no visible durante gameplay, y CSS V70.
- `dist/chapter/immersive-entry-v70.css`: contenedor con `100dvh`, margen inferior y compresión adaptativa para landscape con barra URL/teclado visible, dejando CTA accesible en navegadores que deniegan fullscreen.
- `dist/audio/character-select-feedback-v68.mjs`: aproximadamente 2–3 veces más audible sin convertirlo en arcade ni afectar sonido de la faena; teclado sigue muy suave, ninguna vibración por tecla; preferencia Sonido sigue apagando todo el canal.
- Pruebas `tests/v70-immersive-entry-sound.test.mjs` y CI `.github/workflows/v70-immersive-entry-ui-feedback.yml`.

## No modificar
Misiones M1–M5, narrativa, economía, física, avatares GLB, Cloud Save, datos persistidos, introducciones, contratos ni HSEC. Branch -> PR -> main requiere aprobación explícita, previo QA; el usuario está solicitando la corrección directa dentro del trabajo activo.

## Qué verificar en Android
1. Desde login en paisaje, pulsar «Continuar»: abrir partida en fullscreen cuando el navegador lo permita.
2. Desde login, pulsar «Nueva partida» y confirmar: selector a pantalla completa cuando sea permitido; el botón inferior nunca recortado aunque la URL no desaparezca.
3. Si el navegador integrado rechaza, pulsar botón de fullscreen del selector. Si también falla, usar PWA instalada desde Chrome para eliminar la barra de URL.
4. Audio selección, habilidades, foco/tecleo y confirmación perceptibles pero discretos.
