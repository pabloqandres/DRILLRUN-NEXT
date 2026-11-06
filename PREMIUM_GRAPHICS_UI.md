# DRILL RUN — Premium Graphics & UI

## Motor y criterio visual

Three.js r170, WebGL2; recursos GLB existentes de unos 30.000 triángulos por avatar, material con mapas de color, normales y metalicidad. El renderer anterior usaba suelo plano con una textura de grano uniforme, cordilleras muy bajas, luz hemisférica 2,05 y luz solar 3,05. El cel shading reemplazaba completamente la iluminación calculada por tres valores del color base. Esto debilitaba la separación de materiales y la profundidad.

La referencia maestra es una lámina de dirección artística, no una captura que el motor pueda reproducir de forma idéntica. Se adopta su luz cálida, sombras más frías, capas de paisaje, señales neón y UI azul carbón. No se agregan instalaciones por aparecer en la lámina.

## Render funcional

- Suelo procedural de 512², color + normal map, grava fina y variación tonal; material físico rugoso. El área transitable original queda exactamente a cota cero. El relieve nuevo está fuera de los límites jugables, sin alterar movimiento, colisiones ni ubicación de edificios.
- Cuatro cordilleras con geometría y color de estratos, variaciones de cresta y colores atmosféricos progresivos. Son geología de fondo, no construcciones.
- Sol cálido 2,65 / hemisferio frío 0,95, exposición 1,02 y sombras PCF. Mapa de sombras acotado a la zona activa.
- Materiales industriales con rugosidad y metalicidad moderadas. La geometría de la oficina no se reconstruye.
- Los cuatro avatares usan la misma función de cel shading refinado, que conserva parte de la iluminación y reflejos reales en lugar de aplanarlos completamente. Se conservan mapas, rostros, cuerpos, uniformes, rig y clips.
- Polvo ambiental con 8 / 16 / 24 puntos según calidad. No altera mecánicas ni visibilidad de objetivos.

## Interfaz

Paneles translúcidos azul carbón, borde fino cian, acentos ámbar / magenta y una familia de SVG outline. Perfil, créditos, energía y aceleradores conservan sus valores reales. No se añaden conocimiento, reloj de simulación, personal ni aplicaciones futuras. El acceso a Builder pasa a su botón dedicado. El teléfono abre solamente Mensajes; la infraestructura de inventario/tienda permanece conservada y sin exponer aplicaciones nuevas. Configuración incluye los ajustes gráficos existentes de esta entrega.

Mano sin etiqueta visible, estados suaves y márgenes que suman espacio interior a las safe areas. Cámara B, zoom, colisiones, introducción Seedance y economía conservados.

## Objetivos

Amarillo `#FFC83D`: principal. Cian `#2CDCF1`: secundario. Magenta `#FF5EC6`: opcional. Las siluetas y símbolos interiores distinguen tareas. Icono + metros; halo de suelo y pared de luz ascendente con alpha suave. El icono se retira al estar en rango y permanece el halo de interacción. Fuera de pantalla el marcador se coloca en el borde según la dirección relativa a la cámara. Sólo se muestran los objetivos realmente existentes del capítulo, sin inventar misiones para llenar los tres colores.

## Calidad y medición

| Preset | Pixel ratio máximo WebGL | Sombras | Polvo | Normal del suelo |
| --- | ---: | ---: | ---: | --- |
| Ahorro | 1 | 512² | 8 | Desactivada |
| Equilibrada | 1,35 | 1024² | 16 | Activa |
| Alta | 1,7 | 2048² | 24 | Activa |

Preferencia independiente del guardado, `drillrun-graphics-v1`. No hay reducción automática del modelo aprobado. En el renderer CPU de compatibilidad, la escala interna es 0,65 / 0,85 / 1 para que estos ajustes también tengan efecto.

`RenderMetrics` obtiene FPS de cuadros presentados, excluyendo llamadas omitidas por el renderer, por intervalos reales y p50/p95 de tiempo CPU de render; no es un temporizador GPU. El panel DEV muestra el renderer real, preset y métricas. Una sesión de navegador sin WebGL sólo sirve para medir esa ruta de compatibilidad. No certifica los FPS ni la iluminación/materiales GPU de un móvil físico.

## Comparación y alcance

Antes / después usan Avatar 01, posición (-5,5; 5,2), orientación π, Cámara B 5 m / 18° / FOV 60°, viewport 844×390 y terreno sin oficina. No se utiliza la imagen maestra como fondo ni como sustituto de gameplay. Las capturas y el video proceden de la escena funcional.

No se han recuperado HOTFIX 006–008 ni agregado misiones, edificios, empleados, economía, horarios o mecánicas. Esta entrega continúa la misma prueba privada.

## Verificación de esta demostración

`npm test`: 70 pruebas aprobadas, cero fallos, más los controles de geometría, rig y locomoción de los cuatro GLB. Después del ajuste final del rombo opcional se repitieron las 14 pruebas de gráficos y guiado, todas aprobadas. Los MP4 y modelos originales permanecen sin modificar.

La UI se comprobó a 844×390 y 568×320. En esta última resolución los controles mantienen al menos 14 px arriba, 20 px abajo y 22 px a ambos lados; el joystick mide 75 px, la mano 66 px y el acceso al Builder 48 px de ancho. Los cuatro avatares se cargaron en Cámara B mediante la escena reversible, y se restauró la partida después. El icono de construir se redibujó como martillo de uña, cabeza de acero claro y mango ámbar, tras la revisión del usuario.

Se grabó un clip de 11,73 segundos del canvas real, con desplazamiento y cambio de dirección mediante el controlador existente. El clip excluye el HUD HTML y audio; las capturas muestran la interfaz completa. La escena de comparación conserva terreno sin construir, Avatar 01 y Cámara B. El objetivo aleatorio de limpieza puede señalar un objeto diferente entre capturas, sin cambiar la distribución del terreno.

Las mediciones del navegador remoto corresponden únicamente al renderer software: Ahorro 19,3 FPS observados / p50 50,90 ms / p95 76,50 ms, Alta 18,8 FPS / p50 51,00 ms / p95 75,20 ms (ventanas de 120 cuadros presentados, capturas de diagnóstico). No son mediciones comparativas de un teléfono ni una garantía de fluidez: el coste de skinning CPU domina en esta ruta. Los contadores WebGL de draw calls y triángulos no están disponibles aquí; sus ceros no significan que el modelo no se dibuje. El GLB renderizado tiene 29.998 triángulos.

Pendiente de validación en un dispositivo con WebGL2: compilación y aspecto final del shader GPU, normal maps, polvo, sombras GPU y presupuesto de rendimiento por preset. La ruta CPU muestra el suelo y montañas, pero no reproduce los efectos GPU ni todo el relieve exterior. Esta entrega es una demostración funcional para revisión visual, no una certificación de equivalencia con la lámina maestra.

## Revisión de legibilidad y acabado

Corrección a partir de las capturas mobile del usuario: el botón Construir pasa a 68 px (64 en pantalla estrecha), con etiqueta contenida. Builder separa cabecera y categorías; las seis etiquetas permanecen visibles dentro de sus celdas. La tarjeta usa un único PNG de fondo transparente del mismo modelo 3D, sin suelo ni fondo de render. Se encuadra mediante las ocho esquinas de su volumen completo, incluyendo climatización y acceso, y se recortan únicamente los píxeles vacíos del PNG, conservando margen transparente. El tamaño se adapta con `object-fit: contain`, también en las imágenes de gestión. No se sustituye el edificio por un dibujo generado.

El renderer de compatibilidad admite alpha sólo para el render de producto; el mundo jugable sigue siendo opaco. El panel de desarrollo puede exportar ese mismo PNG para inspección. Los paneles y controles comparten bordes cian claros, volumen interior y glow moderado. Los objetivos aparecen más altos, con símbolos de tarea de 29–34 px, metros, haz central y aro luminoso; no se crean objetivos adicionales para exhibir colores.

El suelo conserva la escala y geometría jugable. Se aumenta moderadamente la separación de tonos y se añade grava procedural integrada, con luz y contacto pintados en los mapas de color y normales, sin nuevas texturas fotográficas ni más draw calls.

Validación de regresión: 72 pruebas aprobadas, incluidos 25 encuadres de miniatura (cinco proporciones y cinco ángulos) que comprueban todas las esquinas dentro del cuadro. La revisión de escritorio/mobile verifica por separado la ausencia de texto horizontal fuera de sus contenedores. Siguen pendientes las mediciones y aprobación visual finales en un móvil físico con WebGL2.

Los marcadores reservan espacio frente al HUD para no superponerse al panel de misión. La exportación PNG se verificó como RGBA de 252×217, con alpha de 0 a 255 y margen transparente de 10 px, sin recortar el modelo.

## Corrección del halo de interacción

La base del halo se cambia de un plano rectangular a un disco de 64 segmentos. El brillo llega a alpha cero antes de alcanzar el borde de la textura (radio UV 0,96), con un margen transparente y filtrado limitado al borde. Se conserva el mismo tamaño, color y animación del efecto; los materiales siguen sin escribir profundidad ni producir colisiones. El halo de interacción tiene 128 triángulos y el objetivo con haces, 132; no se añaden draw calls.

El botón de mano desactiva únicamente el destello táctil nativo de Android, que puede aparecer como una caja de color. Se mantiene el foco visible de teclado. Una prueba nueva recorre todos los píxeles de borde y comprueba su transparencia, la geometría circular y el presupuesto de triángulos para los colores de interacción, acceso, bloqueo y objetivo.

## Introducción compartida y terreno continuo

Por decisión posterior del usuario, los cuatro avatares reproducen provisionalmente el MP4 original y pasan por la misma transformación y órbita hasta Cámara B. Se conserva el avatar seleccionado durante el gameplay. `AVATAR_INTRO_VIDEOS` contiene los cuatro slots: al recibir los videos propios se reemplaza sólo la ruta del slot correspondiente. El MP4 existente permanece byte a byte igual. Esta decisión sustituye la restricción anterior de limitar el video al Avatar 01.

El mapa de color y el normal map del suelo siguen siendo de 512². El ruido es ahora periódico; las vetas completan ciclos enteros y la grava que cruza un borde continúa por el opuesto. Las normales se calculan sobre el mismo dominio periódico. Todos los píxeles de los bordes opuestos coinciden exactamente en ambos mapas. Se conserva el relieve físico, la cámara y el coste de memoria de las texturas. No se añaden paños ni materiales por parcela.
