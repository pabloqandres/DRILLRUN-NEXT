# Ajuste de marcha y cámara

- Velocidad máxima: 2,0 m/s (antes 1,45 m/s), sin cambiar aceleración, frenado ni colisiones.
- Walk retargetea directamente las direcciones de muslo y tibia y atenúa la inclinación del torso. Separación lateral media entre tobillos en el clip: 24,4 cm (antes 47,4 cm). La malla, el rostro, las texturas y la postura de reposo no se reconstruyen.
- La fase de marcha sigue consumiendo distancia real; se recalibró el ciclo a 1,395 m.
- Arrastrar sobre la mitad derecha de la escena rota la cámara horizontalmente y ajusta la inclinación con límites. El joystick izquierdo conserva su propio puntero. Los toques cortos en el terreno siguen creando destinos; un arrastre de cámara no crea un destino.
- Al rotar la vista, el joystick se transforma a la nueva orientación de cámara. El botón de restablecer recupera orientación, inclinación, zoom y encuadre iniciales.
- Prueba manual en navegador: arrastre de 130 px y -40 px produjo yaw -0,65 rad y pitch -0,12 rad, sin desplazamiento del personaje. El joystick produjo desplazamiento tras ese giro.
- Pasan 13 pruebas de controles y lógica, más la comprobación de malla, skin, longitudes de huesos y suelas. La verificación geométrica conserva el apoyo en plano. La prueba física multitáctil y el rendimiento WebGL en teléfono siguen pendientes.

No cambian edificios, terreno ni economía. La grabación de esta revisión usa la escena y el controlador reales en el renderizador de compatibilidad del navegador remoto.

## Revisión de postura y halos · 2026-10-31

- Corrección compartida de pose para los cuatro avatares: apoyos más próximos al eje de cada cadera y flexión de rodilla en el plano de avance. El ajuste entra y sale con la mezcla de Walk/Turn; conserva la postura Idle aprobada.
- La pelvis se eleva como máximo 3,5 cm en la escala del rig, limitada por la longitud de ambas piernas. No se estiran huesos, no se fijan pies al mundo y se conservan la trayectoria vertical/longitudinal de los tobillos, la fase por distancia y el controlador existente.
- Los GLB originales no se modifican. Las pruebas rotan el avatar y cambian escala para comprobar que los apoyos no dependan de los ejes del mundo.
- Los halos de proximidad conservan el color de categoría del objetivo, incluso cuando falta energía; el botón comunica el bloqueo. El halo principal sigue amarillo al entrar en rango.
- El selector, portada e introducción ocultan interacciones y marcadores del escenario. El estado del capítulo solo se actualiza en gameplay; no se ejecutan acciones al seleccionar un avatar.
- Validación: 80 pruebas automáticas aprobadas y los cuatro controles completos de malla, suelas y longitudes. Se conserva el límite de 3 cm de expansión de aristas; máximos: 1,60 / 2,76 / 1,88 / 2,51 cm para avatares 01–04.
- Navegador: recorrido real con reposo, ida de 4 m, parada, giro y vuelta, incluyendo intensidad reducida; revisión visual de 01, 03 y 04. Selección de ambas mujeres: mano deshabilitada, guía oculta y piedra sin halo.
- Evidencia: `qa-evidence/walking-posture-20261031/`. El navegador remoto utiliza renderizado por software; estas pruebas no certifican FPS en GPU mobile. La exportación del WebM no estuvo disponible; se conservan capturas del juego real.
