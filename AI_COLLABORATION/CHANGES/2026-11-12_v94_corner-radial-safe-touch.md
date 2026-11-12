# V94 · Menú radial en esquina, base integrada y giro circular
Fecha: 2026-11-12
Rama: `chatgpt/v94-corner-radial-safe-touch`
Estado: propuesto para PR/preview; no integrado a main ni liberado a producción.

## Referencia aprobada
El usuario aprobó expresamente la segunda propuesta visual de menú de esquina inferior derecha (“Tal cual”), y rechazó el posterior montaje más ancho. Pidió mantener el arco compacto y los dos botones inferiores integrados, garantizar margen de seguridad abajo y a la derecha, alinear verticalmente los centros de joystick, menú y botón de acción, y dar al botón de acción una identidad superior propia.

## Implementación
- Mantiene la integración existente con los diez destinos originales de la faena. El controlador del juego `game.mjs` sigue decidiendo permisos/rutas; no se alteran misión, pagos, stock, estado ni guardado.
- Módulo V90 actualizado: rueda de cuatro sectores anulares exactos dentro de la esquina; etiquetas originales e iconos de categorías, incluyendo `Inventario` como rótulo de la ruta logística. El menú no introduce marcas.
- Reemplaza la navegación mediante flechas por arrastre según ángulo polar sobre iconos o sectores; cambia gradualmente, permite vueltas ilimitadas por índice modular de 10 y al soltar hace snap sin velocidad/inercia remanente. Desktop conserva rueda de ratón y teclas por accesibilidad, sin flechas visibles.
- Base visual de cristal azul petróleo con aro fino y brillo dorado que integra dos controles. Hub del menú ahora representa una cuadrícula de nueve módulos; acción conserva retícula y lleva mayor tamaño, anillo dorado, contraste y feedback de disponibilidad.
- Tamaños responsivos mediante `ResizeObserver`, variables geométricas en píxeles y CSS `env(safe-area-inset-*)`. Centrado vertical común de joystick, hub y acción con márgenes proporcionales a la dimensión real y breakpoints Android landscape.
- Solo se han editado `dist/chapter/semi-radial-dock-v90.mjs` y `dist/chapter/semi-radial-command-v90.css` en el juego; pruebas V90/V92 adaptadas a la nueva UX. El HTML y `game.mjs` no se tocaron.

## Verificación realizada
- Se inspeccionó el `main` actual y el CSS y JS reales de rueda/joystick/acción antes de escribir.
- Parseo JavaScript en V8, invariantes de geometría anular y wrapping de 10 destinos, validación de llaves CSS.
- Harness de DOM simulado en V8: apertura, cuatro categorías accesibles, arrastre angular, snap sin navegación accidental, vuelta completa y selección real del ID.
- Sintaxis de pruebas V90 y V92 parseada. CI de GitHub, prueba WebGL en navegador y captura en Android siguen pendientes; no se afirma que estén aprobadas.
- Ninguna configuración de Vercel o producción modificada.
