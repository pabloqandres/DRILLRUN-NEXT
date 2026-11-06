# DRILL RUN NEXT GENERATION

> **Estado del repositorio (6 de noviembre de 2026):** este repositorio ya se utiliza como fuente de código de DRILL RUN NEXT GENERATION. El párrafo histórico siguiente describe una etapa de desarrollo anterior y no debe interpretarse como el estado publicado actual. Para el estado vigente, misiones, commits y despliegue, consultar [AI_COLLABORATION/CURRENT_STATE.md](AI_COLLABORATION/CURRENT_STATE.md). Antes de modificar código, leer [CLAUDE.md](CLAUDE.md) o [AGENTS.md](AGENTS.md), según el asistente, y [AI_COLLABORATION/RULES.md](AI_COLLABORATION/RULES.md). El último deployment de producción verificado se generó mediante Vercel CLI; no asumir autodeploy desde GitHub hasta confirmar la integración.

Juego web 3D para mobile horizontal. Esta copia de desarrollo parte de la versión publicada 23, commit `af7bb50a802f255efbc1e2f222ae609fe1a265d5`, y contiene los cambios locales de Builder, UX/UI y hologramas de construcción de noviembre de 2026. Estos cambios todavía no están publicados y no tienen un número de versión publicado nuevo.

## Ejecutar localmente

Necesitas Python 3. Desde la carpeta del proyecto:

```sh
python3 -m http.server 8000 --directory dist
```

Abre `http://localhost:8000/`. No abras `index.html` con `file://`: los módulos JavaScript, modelos y videos necesitan un servidor HTTP. El juego no requiere compilación ni instalar paquetes para jugar; Three.js y sus cargadores están incluidos en `dist/vendor/`.

Usa el teléfono en horizontal. Para probar desde un teléfono conectado a la misma red, abre la IP local del computador y el puerto 8000. La reproducción de audio/video puede requerir un primer toque. WebGL2 utiliza la GPU; si no está disponible, el juego emplea el renderizador de compatibilidad por software, con acabado e iluminación simplificados.

## Código y recursos

- `dist/index.html`: entrada del juego.
- `dist/chapter/game.mjs`: coordinación de pantallas, controles, compras y progresión de la oficina.
- `dist/chapter/builder-ui.mjs`: conexión del catálogo con las acciones reales del juego.
- `dist/chapter/catalog-view.mjs`: tarjetas, resumen, ficha técnica y contraer/expandir.
- `dist/chapter/catalog.css`: diseño del catálogo y adaptación a tamaños mobile.
- `dist/chapter/construction-catalog.mjs`: datos visibles, categorías, costos y disponibilidad. Proyecta el estado existente sin efectuar compras.
- `dist/chapter/module-catalog.mjs`: niveles, requisitos, duración y equipamiento incluido de la oficina.
- `dist/chapter/state.mjs`: validación, cobros, temporizadores, aceleración y guardado de la oficina.
- `dist/chapter/world.mjs`: escena inicial y visualización de la oficina en obra.
- `dist/chapter/construction-hologram.mjs`: holograma 3D compartido, aristas, barrido, calidad y liberación de recursos.
- `dist/chapter/construction-callout.mjs` y `.css`: cartel anclado al edificio.
- `dist/chapter/product-preview.mjs`: miniaturas transparentes generadas a partir del modelo real.
- `dist/assets3d/office-shell.mjs` y `office-layout.mjs`: arquitectura, puertas y distribución física de la oficina actual. `office.mjs` es un modelo anterior; no es la oficina activa de esta etapa.
- `dist/hsec/catalog.mjs`: edificios y elementos HSEC, precios, dimensiones y requisitos.
- `dist/hsec/ui.mjs`: interfaz HSEC y colocación de elementos.
- `dist/hsec/state.mjs`: reglas y progreso HSEC.
- `dist/hsec/world.mjs`: modelos HSEC, obra, iluminación y personajes de apoyo.
- `dist/hsec/shed-model.mjs`: geometría del galpón de mantenimiento.
- `dist/hsec/network.mjs` y `layout.mjs`: conexiones, validaciones espaciales y ubicaciones sugeridas. El nuevo constructor de caminos y cierres sigue pendiente de definición.
- `dist/scene.mjs`: escena 3D, oficina, cámara y utilidades compartidas.
- `dist/graphics/`: terreno, atmósfera, materiales y perfiles de calidad.
- `dist/software-renderer.mjs`: compatibilidad sin WebGL2. Respeta el color y transparencia de las aristas de los hologramas.
- `dist/assets3d/*.glb`: cuatro avatares jugables y dos personajes HSEC.
- `dist/assets/`: texturas, retratos, branding y demás imágenes.
- `dist/cinematics/`: MP4 original, poster y recursos cinematográficos.
- `dist/camera/`: Cámara B, entrada cinematográfica y controles táctiles.
- `dist/config/auth.json`: configuración opcional de autenticación. El modo invitado funciona sin configurarla.

Los edificios actuales se generan con geometría JavaScript: no todos son archivos GLB. Cambiar una miniatura no cambia el edificio; para modificar su forma hay que editar su módulo 3D.

## Hologramas de construcción

Se activan después de confirmar una compra, durante la obra. El catálogo no los activa al navegar y no se añade un paso de previsualización en el terreno. La oficina y el galpón comparten el efecto cian. Al completarse la obra, el efecto se desvanece y libera su geometría y materiales temporales. No modifica los modelos originales, colisiones, precios, progreso ni duración de construcción.

`HOLOGRAM_STYLE` permite ajustar colores, velocidad de barrido, duración del desvanecido y presupuesto de aristas. El perfil bajo reduce el detalle del efecto; los perfiles equilibrado/alto añaden brillo alrededor de las aristas.

## Dependencias y comprobaciones de desarrollo

El runtime del juego está incluido en `dist/`. Para las herramientas de autoría y pruebas, se incluyen `package.json` y `package-lock.json`:

```sh
npm ci
npm test
```

`npm ci` necesita acceso al registro npm. Los paquetes de desarrollo son `@resvg/resvg-js` y `meshoptimizer`; no se necesitan para servir el juego. No se incluye `node_modules`, porque depende del sistema operativo y se reconstruye con el lockfile.

## Partidas guardadas y despliegue

Las partidas se guardan en el navegador, asociadas al origen donde juegas. Ejecutar esta copia en localhost crea un espacio distinto del juego publicado. El ZIP no incluye partidas, sesiones, cookies ni credenciales personales.

Mantén los identificadores de avatares, edificios, objetos y la clave de guardado al integrar cambios en el juego existente. No copies estados de prueba sobre una partida real. No publiques ni reemplaces la versión activa automáticamente: primero revisa el flujo en una copia de desarrollo.

`.openai/hosting.json` conserva la identidad y configuración del sitio como referencia. El ZIP no contiene credenciales de despliegue ni el historial interno de Git.

## Alcance y validación

Esta etapa mejora el catálogo, la ficha integrada y colapsable, el cartel ligado a la obra y el holograma. No implementa el nuevo diseño de caminos ni cierres perimetrales. La cinemática original, Cámara B, avatares y reglas económicas se conservan.

La revisión automatizada del navegador utiliza el renderizador de compatibilidad. El acabado de los shaders y el rendimiento WebGL2 en teléfonos físicos necesitan una validación adicional antes de considerar terminado el ajuste gráfico mobile.
