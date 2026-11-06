# HSEC — Misión 2 integrada

Estado: versión jugable conectada al capítulo 1. Validación funcional y visual realizada; rendimiento GPU en dispositivos móviles físicos pendiente.

## Recorrido

Completar el capítulo 1 habilita el panel HSEC y entrega una sola vez 14.000 cr de capital configurable. La misión requiere oficina L2, galpón L1, redes vehicular y peatonal continuas, cruces resueltos, iluminación, perímetro delimitado, señal y extintor, contratación e inspección aprobada. Se requieren al menos 80/100 y ausencia de riesgos críticos. La recompensa de 1.000 cr se entrega una sola vez. No se habilitan contratos ni perforación.

## Sistemas conectados

- Builder existente con categorías V4 aprobadas, miniaturas PNG transparentes del modelo real, previsualización 3D, polilíneas editables, rotación y ubicación de props. Galpón restringido a su lote asignado.
- Construcción de prueba de 25 s, estado temporal, acelerador compartido, polvo y sonido de finalización. Parámetros configurables en catálogo.
- Colisiones y soporte de suelo incorporados al controlador y cámara existentes. Red peatonal con intersecciones, validación de obstáculos y cruces seguros. El NPC se detiene ante rutas cortadas.
- Puntaje limitado por categoría: 15/25/20/15/10/15. La movilidad diferencia vehículos, peatones, cruces y segregación. Las cantidades por sí solas no suman puntos.
- Cobertura de luz basada en radios y muestras de accesos/rutas. Ciclo compartido de diez minutos por día de prueba; luces puntuales nocturnas sin sombras individuales, máximo ocho activas. El renderizador Canvas de compatibilidad no reproduce toda la iluminación WebGL.
- Activos con condición estructural, visual y funcional, desgaste por tiempo y uso peatonal, detección local, órdenes, reparación y verificación. Sin desgaste offline. Conservación y tareas guardadas junto al progreso.
- NPC hombre/mujer con idénticas competencias/costo. Modelos originales preservados, copias de 30.000/29.998 triángulos, 21 huesos y clips Idle/Walk/Turn. Rondas, inspección, mantenimiento visual elegible, aviso de ruta bloqueada y turno/descanso.
- Panel real con seis categorías V4, activos, personal, órdenes e historial. Paridad informativa separada del puntaje. Teléfono conserva solamente Mensajes.
- Datos para diez niveles; solamente variantes implementadas expuestas. Las piezas de etapas posteriores permanecen cerradas.

## Validación

- 95 pruebas automáticas, incluyendo el primer capítulo, cuatro avatares, locomoción y Cámara B.
- Construcción individual confirmada por UI, costo y temporizador observados.
- Muestra del capítulo 2 montada mediante las funciones reales de construcción, con tiempo acelerado exclusivamente en herramientas QA.
- Contratación por UI y recorrido de inspección dentro del motor. Misión completa observada: 100/100, sin riesgos críticos, saldo 8.751 cr tras recompensa única.
- Guardado separado de revisión y recuperación después de recargar: 100/100 y el mismo saldo 8.751 cr.
- Desgaste visible de baranda al 35 %, inspección y orden de reparación de 35 cr completada por UI. La visibilidad se recuperó; el desgaste ordinario siguió activo.
- Video real de caminata de 11,8 s: validation/hsec-npc-walk.webm. Captura del panel: validation/hsec-mission-complete.jpg.
- El navegador de nube carece de WebGL y usa Canvas/CPU. Sus 4–8 FPS no constituyen una medición de rendimiento en un teléfono. Se necesita la prueba de GPU móvil antes de cerrar el ajuste de calidad.

## Herramientas de revisión

`hsec-review.html` inicia una muestra aislada, monta infraestructura de prueba, permite seguir/grabar al NPC, probar desgaste, noche y guardar/recuperar una copia separada. No sustituye ni sobrescribe la partida normal. Los controles QA solo se crean con `chapterqa`; el juego público normal no los muestra.

## Límites actuales

- El módulo HSEC está en español; algunas etiquetas comunes tienen traducción inglesa y las demás usan fallback español. La localización completa HSEC a los cinco idiomas queda pendiente.
- Construcción y conservación HSEC usan el reloj activo de simulación, con pausas al cerrar; la oficina conserva su temporizador original.
- El inventario registra la capacidad disponible (20 base +40 del galpón operativo). Los futuros consumibles/equipos no se incorporan en esta misión.
- El acabado de props procedurales y las animaciones de los dos NPC admiten revisión visual adicional; no se alteraron los cuatro avatares del jugador.
