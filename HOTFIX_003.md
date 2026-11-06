# DRILL RUN — HOTFIX 003

Integración reversible del GLB de Artlist adjunto. No se reconstruyó el personaje. La superficie optimizada reutiliza posiciones, normales y UV del original; conserva rostro, casco, vestimenta y proporciones del candidato. La escala global se normaliza a 1,85 m para el controlador existente.

## Activo

- Original: 52.847.892 bytes, 499.880 triángulos, 311.642 vértices, una malla, texturas PBR de 4096 px. Sin rig ni clips.
- Copia de juego: 29.998 triángulos, 25.406 vértices, 21 huesos, una malla/material. Aproximadamente 4,7 MB.
- Simplificación por colapso de aristas con preservación de atributos UV y normales mediante meshoptimizer; no es una retopología manual en quads. Error relativo estimado del simplificador: 0,0009296 de la extensión mayor. Este dato no sustituye la comparación visual.
- Color base reducido a 2048 px; normales y mapa metálico/rugosidad a 1024 px. El GLB original queda intacto en el archivo adjunto. La compresión y reducción de texturas pueden perder detalle fino.
- Material PBR basado en los mapas suministrados. Cel-shading provisional mediante cuantización tonal al final de la iluminación. `?cel=0` conserva la iluminación PBR sin esa cuantización.

## Rig y animación

Rig humanoide de prueba con pesos calculados por regiones anatómicas, separación de manos por conectividad y difusión sobre la superficie soldada para eliminar cambios bruscos de influencia. La cabeza/casco y las botas conservan una deformación rígida adecuada a su material. Los guantes no tienen huesos individuales de dedos.

Idle usa la pose original y una respiración mínima. Walk adapta el clip del ejemplo oficial Soldier de Three.js, cuya animación procede de Mixamo. Turn es una adaptación de amplitud reducida de esa marcha: no es una captura de pivote independiente.

Referencias de procedencia:
- https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf
- https://threejs.org/examples/webgl_animation_skinning_blending.html
- https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html

El controlador sigue siendo la única fuente de desplazamiento horizontal. El reloj de Walk consume distancia efectiva después de las colisiones: un ciclo corresponde a unos 1,390 m, calibrados mediante el movimiento de los pies en apoyo. Al bloquearse o detenerse no continúa avanzando ese ciclo. Los cambios de peso mezclan Idle/Walk/Turn. Una petición de dirección opuesta reduce el avance hasta orientar el cuerpo; no se suman Root Motion y movimiento por código.

352 vértices extremos de las suelas se usan como sondas económicas para ajustar solamente la altura del cuerpo. No hay anclajes mundiales de pies ni estiramiento de piernas durante los giros. Todavía no hay IK independiente por pierna para escalones o pendientes: en un borde, el apoyo de ambos pies puede requerir una corrección adicional. La sincronización por distancia reduce el patinaje, pero no se declara deslizamiento cero ni calidad de animación final.

## Reversibilidad y alcance

- El modelo anterior y su rig se mantienen en `worker.mjs` / `worker-geometry.mjs`. `?worker=legacy` permite revisarlo.
- La integración puede retirarse desde `installCandidate`; no altera edificios, distribución del escenario, economía, interfaz habitual ni parámetros de la cámara de juego.
- `hotfix003.html` es una página separada de validación móvil, con toma habitual y toma cercana fija. Usa el controlador y la escena reales.
- El original de Artlist permanece intacto; no se publica el archivo de 52 MB ni el modelo fuente Soldier completo.

## Validación técnica

`node tools/check-candidate.mjs` carga la malla, el skin y los tres clips del GLB real; prueba 900 frames con reposo, dos velocidades, detención y giros. Comprueba todos los 1.946 vértices bajos de las suelas y que las longitudes de los segmentos del esqueleto no cambian. Resultado en plano: sin separación o penetración numérica relevante; sin cambios de longitud de huesos. En 12 fases adicionales se comprobaron todos los vértices y las aristas; la expansión máxima de una arista fue de 17,2 mm (en zonas de deformación de ropa), sin las prolongaciones observadas en el primer ajuste del guante. Es una prueba geométrica, no una garantía de calidad perceptual.

La suite existente de 10 pruebas sigue pasando. Esas pruebas anteriores por sí solas no validan la nueva animación; se complementan con la comprobación del GLB y la grabación dentro del juego.

## Límites de esta sesión

El navegador remoto tiene WebGL deshabilitado. Las capturas y videos proceden del renderizador Canvas 2D de compatibilidad, que usa la misma malla, skin, texturas y clips, con iluminación simplificada. No validan compilación del shader WebGL ni FPS de un móvil físico. La página de prueba usa un reloj de captura de 30 Hz para evitar la limitación de requestAnimationFrame en el navegador remoto; la app habitual mantiene requestAnimationFrame.

La fidelidad visual y el movimiento requieren revisión de Pablo en su teléfono. No se presenta esta entrega como arte o animación final aprobada.

## Evidencia de la sesión

La toma cercana final registra 17,36 segundos, aproximadamente 9,97 m de recorrido total, 14 pasos de ciclo y visitas a Idle, Walk y Turn. Incluye dos tramos rectos, frenadas, giro de 180 grados, joystick circular y reposo final. La simulación de esa toma alcanzó unas 22,5 actualizaciones/s en el renderizador de compatibilidad del navegador remoto; no es una medición de FPS WebGL en móvil.

El original adjunto conserva SHA-256 `e3dd4d01acefcc21e136ca40e425facf77691b3542704f62aa4d1945bda8f5c2`.

## Preparación reproducible

Los scripts de `tools/` son herramientas offline; no se cargan en el juego. Requieren Node con meshoptimizer 1.3.0 y Python con numpy, scipy y Pillow. Sobre un directorio de trabajo externo, la secuencia es: `prepare-worker.py` (GLB original), `simplify-worker.mjs`, `segment-worker-arms.py`, `worker-sole-probes.py`, `build-worker-candidate.mjs` (primer skin), `smooth-worker-skin.py` y de nuevo `build-worker-candidate.mjs`. La referencia de animación se proporciona como segundo argumento de este último script. No se necesita el original de 52 MB para ejecutar o validar el juego ya empaquetado.
