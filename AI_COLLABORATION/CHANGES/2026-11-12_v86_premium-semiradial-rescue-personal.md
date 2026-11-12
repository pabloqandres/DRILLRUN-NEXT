# V86 · Recuperar calidad sin regresar al menú clásico
Fecha: 2026-11-12
Rama: chatgpt/v86-premium-semiradial-player-rescue-personnel
PR: 107

## Decisión del usuario y alcance
La intención es **innovar bien, no retroceder**. Se descartó completamente integrar la rama anterior que revertía el menú semirradial. V86 mantiene el dock semirradial actual pero corrige su calidad. Se elimina botón innecesario de centrar cámara y se sustituye por una acción de emergencia en Configuración. La vista Personal no puede volver a ocultar sus puestos inferiores.

## Menú
- El SVG de la banda se dibuja como **un solo fondo de tres sectores contiguos** con divisiones sutiles. Los botones de V83/V84 ahora son hit-targets transparentes sobre esa pieza. El nuevo icono central es un mando geométrico vectorial sin marcas.
- Se ven 3 destinos legibles + 2 extremos difuminados (sin fondo gris tosco); el botón circular queda debajo.
- Animación CSS por transform/opacidad de 580ms con desaceleración sin rebote, arrastre de 58px por paso con umbral temporal de 310ms y pulsación prolongada de 320ms, sonido por evento solo con preferencias habilitadas.
- Se mantienen las rutas de Catálogo, Producción, Logística, Taller, Flota, Contratos, Personal, HSEC, Casa Matriz, Centro de Faena, y sus restricciones/handlers.

## Rescate
- Se retira `#cameraHome` del HUD por completo y su control asociado.
- Nuevo botón `Desatascar jugador · volver a la oficina` en Configuración solo en la partida.
- Modo seguro: calculadora pura `officeRescueTarget` busca oficina interior si está habilitada o acceso exterior; verifica `world.isBlocked`. Si la camioneta está siendo conducida, se detiene y queda estacionada en su lugar antes de trasladar al personaje. No mueve vehículo ni pierde la compra.
- Se guarda solo nueva posición/orientación sin reescribir economía, misiones ni datos de Cloud Save.

## Personal
- Nuevo CSS final `personnel-layout-v86.css`: el contenido ocupa `minmax(0,1fr)` y el footer una fila incondicional de 57px en paisaje móvil; la lista de hasta 5 plazas cabe o desplaza horizontalmente sin cortarse; Gestonar equipo conserva su botón.
- Conserva portraits, habilidad, contratación, costes y flujo actual. El panel derecho permite scroll solo interno y no invade el pie.

## Validación
Pruebas UI estructurales y de interacción V86–V81 satisfactorias en Actions; los dos fallos genéricos previos del motor offline M4 siguen aislados. **No se ha probado visualmente en el teléfono del usuario** antes del deploy. La validación visual final debe hacerse con capturas reales de Android para evitar falsas equivalencias con propuestas gráficas.
