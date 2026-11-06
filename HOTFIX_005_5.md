# HOTFIX 005.5 — UI industrial mobile y terreno variado

Complemento de HOTFIX 005. La oficina aprobada, el GLB, su rig, locomoción y cámara táctil siguen siendo los mismos assets/sistemas. No se amplía la perforación ni la economía online.

## Experiencia implementada

- HUD con retrato extraído del GLB, nombre personalizable, nivel 1 y progreso real del capítulo; tres recursos compactos; teléfono; joystick y mano. Objetivo compacto junto al joystick, detalle en la aplicación Objetivos. Configuración desde el perfil. Sin apps futuras ni monedas extra.
- Teléfono lateral de aproximadamente 35% del ancho a 844 px; adapta el ancho mínimo a móviles pequeños. Carcasa, identificador ficticio FIELD / 01, navegación común, estados leídos y apps Mensajes, Banco, Office Store, Inventario y Objetivos. La tienda se amplía para permitir un catálogo legible y vuelve al teléfono compacto al salir. Su panel bloquea acciones accidentales en el mundo.
- Lista de conversaciones y conversación del mentor configurable. El segundo mensaje se activa al terminar la oficina. Lecturas y eventos persisten; las notificaciones no se reemiten al recargar.
- Banco visual con los saldos y el registro de operaciones existentes. No se inventan fondos, interés ni autenticación.
- Office Store con categorías, selector de productos ampliable, producto 3D real giratorio por arrastre y botones, dimensiones, descripción, variantes y confirmación de compra. El preview y el objeto instalado usan la misma fábrica y materiales. Un único preview, con render bajo demanda y liberación al cerrar.
- Tres acabados de escritorio y tres tapizados de silla; el computador conserva su única versión básica. La variante se guarda en inventario y se recupera al cargar.
- Compra confirmada, gasto único, comprobante y acceso directo a colocación. Cancelar no descuenta dinero. Inventario diferencia objetos disponibles e instalados.
- Colocación con símbolos ✓ / ×, fantasma 3D y confirmación deshabilitada si invade muros, accesos u otros muebles. Sigue utilizando las mismas colisiones. Mover un escritorio transporta su computador.
- Notificaciones en cola, una a la vez. Presentaciones de misión completada muestran desbloqueos reales: zona de obra, oficina/tienda y computador interactivo. No se inventan recompensas monetarias.
- Carga ilustrada con progreso del asset real; transición breve al entrar/salir, sin espera de carga artificial para la oficina precargada.
- Claves y traducciones en español, inglés, portugués, italiano y chino tradicional. Tokens compartidos, SVG de iconos coherentes, contraste, safe areas y reduced motion. Burdeos tomado de la oficina aprobada; no se declara como especificación corporativa definitiva de PUMA®.

## Terreno

16 objetos con IDs anteriores `clear-0`…`clear-15`, repartidos a ambos lados y delante/detrás del lote. Se conservan los objetos ya limpiados en partidas anteriores.

- Vegetación: arbustos bajos, matas altas y pastos secos, tamaños y orientaciones diferentes.
- Rocas: masas irregulares y fragmentos, tres variantes y distintas escalas.
- Cajas: cerrada, abierta/rota y con tablas sueltas.
- Metal: tuberías abiertas, plancha corrugada y perfiles descartados.

Geometría total: 8.652 triángulos / 80 meshes, agrupados por material dentro de cada objeto. Sin texturas adicionales ni simulación de físicas. Todos los objetos son alcanzables usando la consulta de colisiones existente y la limpieza completa sigue consumiendo 16 de las 20 unidades iniciales.

## Selector y nombre — nueva decisión del usuario

Cuatro slots de avatar sustituyen los nombres predeterminados Gaspar/Paula. Pantalla con personaje 3D, desierto, set de maquinaria de fondo exclusivo del selector y polvo ligero. Nombre de 2–20 caracteres, editable después desde el perfil y persistente en HUD/teléfono.

Solo existe un GLB aprobado disponible: Avatar 01. Los slots 02–04 muestran **Modelo por integrar** y no se presentan como personajes terminados. Activarlos requiere los tres modelos definitivos y su integración de rig/animaciones; no basta con cambiar una ruta. No se altera el rostro o uniforme del asset aprobado. Las partidas antiguas migran al modelo disponible sin perder economía ni progreso.

## Arquitectura

- `chapter/config.mjs`: posiciones, catálogo, variantes, cuatro slots y mentor.
- `chapter/clearables.mjs`: cuatro familias de props deterministas, batching por material.
- `chapter/premium.css`: tokens/componentes visuales y tamaños mobile.
- `chapter/icons.mjs`, `portrait.mjs`: sistema de iconos y retrato del asset real.
- `chapter/phone-ui.mjs`: apps y catálogo; no duplica transacciones del estado.
- `chapter/product-preview.mjs`: preview 3D del mismo objeto.
- `chapter/ui-state.mjs`, `notifications.mjs`: mensajes, lecturas y eventos únicos.
- `chapter/selector-stage.mjs`: set visual exclusivo de selección, sin colliders ni propiedad del jugador.
- `chapter/state.mjs`: identidad y variantes añadidas a las transacciones/guardado existentes; mismo save key v5.
- `chapter/game.mjs`: integración. Corrección puntual del destino por toque: una orden ya no se cancela durante el giro previo al avance. El módulo de locomoción aprobado no cambia.

## Validación

41 pruebas automáticas y revisión de las animaciones/skin del GLB. Incluye presupuesto de geometría, accesibilidad física de los 16 props y recorrido completo del controlador, migración de partidas, eventos únicos, variantes y nombre personalizable.

Recorrido de navegador a 844×390: selección/nombre, mensaje, banco, 16 limpiezas, compra de oficina, acelerador, ingreso, mensaje de tienda, preview giratorio y variantes, cancelación de compra sin costo, compra/colocación de escritorio, silla y computador, rechazo de colocación inválida, capítulo completado, reubicación y recarga final. Revisión adicional de catálogo/HUD a 667×375 y 568×320.

La revisión automatizada de recorrido usa `chapter-review.html?qa=1`: sus ayudas caminan con el controlador y activan la mano real, sin otorgar progreso por teletransporte. La interfaz normal no contiene esas ayudas. `chapter-review.html` permite revisar los tres tamaños sin alterar el guardado.

## Límites

- Navegador de revisión sin WebGL: capturas mediante el renderer compatible Canvas2D sobre la misma geometría 3D, con iluminación simplificada. No valida shaders WebGL ni FPS en un teléfono físico.
- Quedan tres modelos de avatar definitivos pendientes. Los muebles siguen siendo props provisionales reemplazables por GLB del usuario.
- Google Sign-In continúa opcional y pendiente de la configuración real descrita en HOTFIX_005.md. El progreso sigue siendo local; no se promete sincronización cloud.
