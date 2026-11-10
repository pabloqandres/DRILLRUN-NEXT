# V55 · Colisión vehicular en pasos peatonales y recuperación del render 3D

Fecha: 2026-11-10 · DRILL RUN NEXT GENERATION.
Responsable: ChatGPT · Rama `chatgpt/v55-vehicle-collision-render-recovery`

## Incidentes reportados
- El DrillTruck® personal puede quedar bloqueado junto a un paso peatonal
  y en accesos del Patio L1 incluso cuando parece haber espacio suficiente.
- Tras entrar al Catálogo durante una partida avanzada, el mundo 3D se
  convierte en pantalla blanca completa mientras el HUD permanece visible.
  Se puede seguir viendo el saldo y la navegación, pero no el juego.

## Análisis
1. El algoritmo anterior utilizaba cinco sensores con radio adicional
   de 0,38 m. A los 2,16 m de ancho de camioneta se le añadían 0,76 m
   de tolerancia invisible. Con cualquier contacto frenaba completamente,
   sin deslizamiento lateral ni salida de solapamientos previos.
2. HSEC considera el cruce peatonal y demarcaciones superficies no sólidas.
   Las barandas, bolardos y cercos sí tienen colisión y deben conservarla.
3. El Catálogo instanciaba un `WebGLRenderer` por miniatura del material
   físico. `renderer.dispose()` no garantiza liberar el contexto GPU del
   navegador. Al solicitar múltiples miniaturas de HSEC y edificios en
   Android, esto es una fuente plausible de agotamiento de contextos.
   No se puede afirmar un diagnóstico de la GPU sin registros del dispositivo.

## Implementación
- `personal-drilltruck.mjs`: 9 sensores de contorno, margen de 0,10 m,
  deslizamiento por ejes en contacto con obstáculo, fricción moderada y
  salida de superposición sin atravesar sólidos. Respeta velocidad,
  joystick y freno de V54. Sin cambio de ruta de la camioneta automática M4.
- `product-preview.mjs`: una instancia compartida de WebGLRenderer
  para miniaturas estáticas del Catálogo, en lugar de docenas de contextos.
  Miniaturas a DPR 1 para móviles. Vista interactiva mantiene su contexto
  privado, lo libera explícitamente con `forceContextLoss()` al cerrar.
- `hsec/world.mjs` y `drilltruck-image.mjs`: usan renderer compartido,
  limpieza segura en `finally` y fallback de ícono cuando una captura
  no puede renderizarse.
- `game.mjs`: detector de `webglcontextlost/restored` en el canvas
  PRINCIPAL, un solo reinicio automático por ventana de 90s, y opción
  visible para el jugador (Configuración > Restablecer vista 3D) que
  conserva los datos y vuelve a cargar la sesión. No auto-borra partidas.
- Bloqueo explícito del Catálogo mientras el jugador maneja
  el DrillTruck®; se indica que debe estacionarse y bajar.
- `render-recovery-v55.css`: panel de recuperación accesible.
- Test V55 y CI dedicado con regresiones M5, V54, V53, V52, V50, V49.

## Pruebas y límites
- Tests de colisión sobre paso pintado, esquina, muro firme y marcha atrás.
- CI focalizado V55 y paquetes de movilidad/M5.
- Regresión global M4 offline presenta dos fallos históricos sin relación
  (no se alteraron fórmulas de ingreso).
- La causa visual exacta de la pantalla blanca y la respuesta táctil de la
  camioneta requieren una reproducción confirmatoria en Android real.
- Lógica, misiones, stock, industria, HSEC y economía sin modificaciones.

## Regla de futuros cambios
La prioridad de contextos WebGL es la escena principal. Toda nueva
miniatura de Catálogo debe emplear el renderer offscreen compartido;
nunca crear un renderer por tarjeta sin límite ni liberación.
