# Anexo del HOTFIX 005 — Cinemática y Cámara B

El MP4 entregado se publica como copia idéntica en `dist/cinematics/avatar01-seedance.mp4`: 13,056 s, 1280×720, H.264/AAC, 24 fps, 14.395.838 bytes. El hash y los metadatos están en `validation/hf005-cinematic-source.json`. No se alteraron montaje, audio ni fotogramas. El póster JPEG es solamente una imagen extraída para la espera nativa del reproductor. No se generaron películas adicionales con IA ni se utilizó Artlist.

## Experiencia

Nueva partida con cualquiera de los cuatro avatares → MP4 con audio según preferencia → fin real del holograma → barrido con máscara y 24 partículas leves → mundo 3D real → órbita de 6° e interpolación de 1,3 s → estabilización → HUD y controles. El avatar se mantiene idle en la misma posición durante el empalme. Por decisión actual del usuario, los avatares 02–04 también usan provisionalmente el mismo MP4 del Avatar 01 y la misma transición, hasta recibir sus videos propios. El avatar jugable seleccionado se conserva. Las rutas por avatar están en `AVATAR_INTRO_VIDEOS`; ya no se excluye el video según el personaje.

Omitir detiene y descarga el recurso del reproductor, establece B y habilita el capítulo. La secuencia puede repetirse desde desarrollo sin regenerar el MP4. La escena real conserva el terreno y los 16 objetos iniciales, sin minas ni edificios holográficos. La diferencia del paisaje original se disimula con la máscara, sin reproducir excavaciones en el mapa.

## Un solo sistema

`dist/camera/config.mjs` centraliza presets, límites y transición. `FollowCamera` opera sobre la cámara existente. A: 4 m / 12°. B: 5 m / 18° / FOV vertical 60°. C: 6 m / 25°. B es el valor predeterminado al cargar, incluso después de guardar ajustes desde A o C. La distancia seleccionada se conserva como preferencia de zoom en `drillrun-camera-v1`.

La exploración sigue al avatar con centro horizontal y encuadre de cuerpo completo, respetando estaturas 1,85 / 1,83 / 1,88 / 1,66 m. El arrastre derecho conserva el control de orientación. Joystick y teclado se calculan respecto a la cámara efectiva, incluida su adaptación interior.

Pinza: separar dedos acerca, juntarlos aleja. Los punteros deben empezar en el canvas; los iniciados sobre interfaces nunca se incorporan al gesto. Al terminar una pinza no se genera un toque de desplazamiento ni un giro residual. Límites iniciales 2,4–8 m, con suavizado. No cambia la posición del avatar.

La anticolisión usa una consulta de volumen contra los obstáculos físicos existentes: paredes, puertas, techo, muebles, límites, objetos despejables y obra en curso. Se aproxima ante un obstáculo y recupera suavemente la distancia. En interiores busca inicialmente una dirección con espacio dentro del módulo, centra el cuerpo y adapta FOV/distancia; el jugador puede retomar el giro manual. No se modificaron las colisiones ni el controlador de movimiento del personaje. En construcción se usa C con foco en el módulo y se recupera la preferencia de exploración al cerrar. El objeto enfocado se excluye del barrido desde su centro en esa vista de inspección.

El renderizador de compatibilidad recibió una corrección de terreno para evitar huecos por recorte cercano: evalúa el mismo plano, textura y profundidad. El renderizador WebGL conserva su terreno original.

## Panel de desarrollo

Abrir `camera-review.html`, o `index.html?chapterqa=1&dev=camera` para revisión directa. El juego normal no crea el panel. Permite distancia, altura adicional, pitch, FOV, offsets, seguimiento, suavizado, zoom, sensibilidad y parámetros de entrada. Incluye guardar, restablecer, comparar A/B/C, congelar posición, capturar el canvas, repetir solo órbita, repetir intro y grabar demostración visual.

«Terreno inicial» crea una escena de prueba en memoria con el avatar seleccionado. Conserva una copia de la partida y suspende su escritura. «Volver a mi partida» restaura el estado anterior. Recargar también recupera el guardado original, no la escena de prueba. Los ajustes de cámara tienen una clave independiente del progreso.

La grabación de desarrollo compone el MP4 reproducido y los fotogramas del renderer real. Es una demostración visual sin audio y no incluye el HUD HTML; las capturas de pantalla muestran el HUD. La reproducción de juego sí conserva el audio original y una continuidad leve de viento, respetando el ajuste de sonido. Los enlaces de descarga quedan disponibles al terminar. «Primer frame 3D» exporta el encuadre de empalme real para compararlo con el último fotograma original.

## Verificación y límites

Las pruebas automatizadas cubren encuadre de los cuatro cuerpos, presets, zoom/límites/restauración, recuperación tras obstrucción, caja orientada/techo, entradas táctiles, conservación del MP4 y secuencia/limpieza de recursos. Se mantienen las verificaciones de economía, guardado, Builder, oficina y locomoción.

El navegador de revisión carece de WebGL: usa las mallas reales con renderizado de compatibilidad y no sirve para certificar FPS o el acabado final del shader GPU. Los gestos de dos dedos se verifican con eventos del mismo manejador y pruebas del componente; falta el ensayo manual en un teléfono físico. La anticolisión utiliza cajas orientadas compartidas con el mundo, no una malla de detalle por cada tornillo o pieza decorativa. Los avatares 02–04 usan provisionalmente el MP4 compartido hasta recibir sus películas propias.

La revisión de esta entrega completó 56 pruebas automatizadas. En navegador se comprobó reproducción real del MP4, omisión, órbita sin repetir video, A/B/C, los cuatro avatares, Builder C, restauración de ajustes y recuperación de la partida (500 cr, 3 aceleradores, oficina nivel 2 y capítulo completo). Al orientar la cámara hacia un muro interior, el volumen redujo la distancia a 0,574 m sin mover al avatar y recuperó la distancia interior al liberar la dirección. Los espacios muy estrechos requieren revisar el encuadre final en un dispositivo real.

## Ajustes de lectura e inmersión — revisión del 30 de octubre

La Cámara B conserva sus parámetros aprobados. El reproductor ahora cubre el viewport completo (`object-fit: cover`) y solicita pantalla completa del documento al confirmar el personaje, si el navegador lo permite. No se usa el reproductor nativo en pantalla completa: la transición continúa en las mismas capas del juego. Las pantallas más anchas que 16:9 recortan un margen vertical del encuadre; el MP4 original permanece idéntico. El empalme usa una disolución con máscara suave y dos pequeños desplazamientos horizontales de registro (hasta 3 px), más tres franjas breves de bajo brillo. No hay flashes completos ni estroboscopia.

El selector tiene fondo oscuro propio, textos claros, iconos por especialidad, bono destacado y estado «activo» / «al desbloquear». La biografía resumida evita repetir el estado del bono. Se mantienen los bonos reales existentes; no se simulan contratos ni mantenimiento. El terreno y los props tienen una paleta de mayor contraste; los círculos interactivos llevan borde oscuro y color luminoso, y la mano disponible tiene un contorno contrastado.

`chapter/guidance.mjs` concentra la regla de orientación: cada misión resuelve un destino físico; la limpieza elige un objeto pendiente sin orden obligatorio y lo conserva hasta retirarlo. Construir, acelerar, entrar y usar el computador apuntan al acceso o al puesto real según corresponda. El marcador muestra únicamente un icono pequeño y los metros, sin tarjeta, nombre flotante ni flecha. En pantalla se proyecta sobre el destino; fuera de cámara se sitúa en el borde correspondiente al rumbo relativo a la cámara, incluidos los objetivos situados detrás. Los menús lo ocultan. Las futuras misiones deben añadir su destino a este mismo resolutor, sin crear otro navegador.

La puerta exterior queda bloqueada hasta «Ingresar», se abre mientras el jugador está dentro y se cierra al salir de la escalera. La ocupación se verifica con la geometría real: las partidas antiguas con un personaje ya dentro y `inside=false` se reparan sin trasladarlo, cobrar ni repetir recompensas. Las colisiones conservan el controlador y añaden 4,5 cm de margen. Los sondeos de las botas descartan apoyos detrás de paredes o desniveles mayores a 14,5 cm respecto al suelo bajo el cuerpo; los peldaños reales de 10–12 cm continúan utilizándose. Esto evita elevar todo el avatar cuando una bota se aproxima al piso elevado por fuera del módulo.

La validación automatizada de esta revisión completó 63 pruebas más los chequeos de los cuatro modelos. Se verificaron direcciones detrás de la cámara en cuatro orientaciones y pantallas de 844×390 y 568×320. La guía utiliza posición real y distancia del mundo; no es un recorrido automático ni modifica la locomoción.

La referencia final del usuario sustituye la tarjeta con flecha: `GUIDE_CATEGORIES` define amarillo/rombo para misión principal, magenta/estrella para misiones secundarias y eventos, y cian/localización para servicios. Color y silueta distinguen las categorías. `setAdditionalTargets` admite otros objetivos reales sin duplicar el sistema, con un máximo de tres indicadores simultáneos. El capítulo actual sólo muestra sus destinos existentes; no se han inventado eventos ni misiones secundarias. La descripción accesible conserva el nombre, aunque visualmente sólo se ve icono y distancia.

Tras integrar los iconos finales por categoría, la suite completa terminó con 64 pruebas aprobadas. Prueba visual adicional: puerta cerrada detiene el avance en z=1,7218 m, con velocidad y corrección vertical cero; Ingresar habilita el interior y el computador completa la misión. Las escenas de revisión no sobrescriben el guardado original.
