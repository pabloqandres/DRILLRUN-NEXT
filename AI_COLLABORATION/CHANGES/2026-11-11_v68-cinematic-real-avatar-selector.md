# V68 — selector cinematográfico con avatares GLB reales y feedback táctil

Fecha: 2026-11-11 · Agente: ChatGPT · Rama: `chatgpt/v68-cinematic-real-avatar-selector`

## Objetivo aprobado
Convertir la maqueta premium de selección en un flujo funcional, real y responsive, sin bajar calidad intencionalmente ni sustituir modelos por ilustraciones. El nombre lo escribe el jugador. Cuatro personajes originales siguen siendo los únicos jugables.

## Cambios
- `dist/chapter/avatar-roster.mjs`: los cuatro GLB existentes conservan IDs/rigs. En la selección, el elegido es el modelo 3D protagonista en primer plano; las cuatro tarjetas siguen permitiendo elegir, y el toque directo al modelo sigue cableado.
- `dist/chapter/portrait.mjs`: figura de cuerpo completo transparente obtenida UNA vez por avatar de los vértices y materiales de su mismo GLB; no genera otro personaje, no agrega un WebGL permanente.
- `dist/chapter/selector-stage.mjs`: iluminación cinematográfica ámbar/cian sobre el modelo real; suelo/ring sin alterar la faena.
- `dist/chapter/character-select-v68.css`: diseño premium original: carril vertical de retratos GLB, foco principal a cámara, panel de identidad y nombre editable, indicadores de bono verificados, selector de cuatro categorías de especialidad, figura de cuerpo completo y CTA. Breakpoints 500px alto / 900px ancho, paisaje.
- `dist/chapter/character-select-v68.mjs`: presentación pura y verificable de `AVATARS[].bonuses`. Sin porcentajes de habilidades inventados del boceto. La única bonificación aplicable es la que realmente figura en el estado del avatar.
- `dist/audio/character-select-feedback-v68.mjs`: clicks y whoosh muy suaves sintetizados con Web Audio, sin muestras ni librerías externas; vibración 8ms al seleccionar y 12ms al comenzar si `navigator.vibrate` está disponible. No vibrar por cada letra.
- `dist/chapter/game.mjs` (hook compartido autorizado/documentado en DECISIONS): conserva `selectAvatar`, `setPlayerIdentity`, Google Cloud Save, `chooseCharacter` e introducción original; añade cámara closeup y suave acercamiento al cambiar personaje; nombre se valida sin reconstruir tarjetas a cada tecla; feedback para seleccionar, nombre, confirmar y volver. Nuevo ajuste local `prefs.haptics`, por defecto true, configurable en Settings.
- `dist/index.html`: incorpora stylesheet V68, sin reestructurar el formulario funcional.
- `tests/v68-cinematic-character-selector.test.mjs`, workflow V68.

## QA y dependencias
- Referencia de calidad: boceto cinematográfico aprobado por usuario. La calidad del modelo depende de los GLB realmente importados; **la foto del mockup no se inyecta a la pantalla**.
- Se mantiene la relación entre los cuatro GLB y cuatro videos de intro, sin cambiar assets ni rutas.
- Regresión antigua `avatars.test.mjs`/`cinematic.test.mjs` asume aún un único intro compartido, mientras `main` ya contiene los archivos diferenciados; `navigation-selector-hotfix.test.mjs` supone navegación inferior anterior. Se excluyeron del workflow focal V68; se reportan como desactualizadas, no se cambia la lógica para hacerlas pasar.
- El URL de la misma Vercel preview con `?selectorPreview=1` permite entrar al selector por Continuar sin una partida nueva. El botón Comenzar valida nombre y reproduce feedback, pero abre una confirmación visual y **no llama Cloud Start, save, ni crea generación de partida**. El URL normal mantiene el flujo de partida completo.
- Sin cambios de misiones, perfiles persistidos, economía, HSEC, contrato ni compras. Sin merge a main/prod sin QA del usuario y aprobación expresa.
- QA Android pendiente: verificar vista cercana GLB, vista corporal, 4 cards, nombre con teclado visible, habilidades y gestos/vibración admitidos por navegador.
