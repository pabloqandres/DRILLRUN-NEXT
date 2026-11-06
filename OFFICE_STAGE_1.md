# Oficina nivel 1 · planta libre y límites físicos

La decisión vigente reemplaza las tres zonas anteriores por una oficina de planta libre de 6 × 2,5 m. Se retiraron tabiques, puerta interior, baño, instalaciones sanitarias y sectorización del dormitorio. Sólo quedan el acceso exterior, el piso continuo y la arquitectura perimetral. Baños y descanso se comprarán e instalarán como módulos independientes en una etapa posterior; todavía no se implementan sus precios o progresión.

El mobiliario se integrará con los modelos que suministre el usuario, como objetos separados y colocables. La oficina sigue instalada para esta prueba; la secuencia inicial de compra e instalación se desarrollará después.

## Colisiones corregidas

Las barandas registran un volumen sólido a lo largo de cada tramo completo, incluidos los huecos entre postes. El constructor visual y el registro físico comparten las coordenadas de los extremos. La U de la perforadora bloquea ambos costados y el fondo; su frente abierto permanece transitable.

Se registran también cercos, bases de conos y tambores creados por sus constructores, incluyendo la transformación de los grupos. Las barandas de la escalera siguen siendo sólidas. No se crean colliders para pintura de suelo o zonas de interacción. Las colisiones simplificadas no recorren la malla visual por triángulo. Las construcciones temporales conservan su footprint controlado por estado, sin acumular colliders de conos al reconstruirse.

## Validación

24 pruebas automáticas: caminar a velocidad máxima hacia las tres barandas desde ambos lados, cuadros variables de 16–80 ms, deslizamiento lateral, conos, tramos girados, acceso abierto, oficina libre de colliders residuales y conservación de los controles y del rig.

Oficina: 6.158 triángulos, 61 mallas de dibujo. El GLB, sus animaciones, el controlador de movimiento y los controles de cámara permanecen idénticos a la versión aprobada.

`office-review.html` muestra una vista de 844 × 390. Su panel de prueba permite recorrer la oficina y probar los límites de perforación usando el controlador real. Cada prueba de barrera coloca al actor en un punto de inicio identificado y luego camina con el controlador; no representa una ruta continua entre esos puntos. El panel no aparece en el juego normal.

El navegador de revisión no dispone de WebGL: las capturas usan las mismas mallas con iluminación simplificada. No es una medición de rendimiento en un teléfono físico.

La versión anterior con divisiones permanece recuperable en el commit 84945e3b9957f63e15f5b7884c2857ff9d287955.
