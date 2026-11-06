# HOTFIX 005 — revisión de Builder y galpón

Base: versión 22, commit `f3636bedd34097547c69660a02a9bb829acf6525`.

## Cambios

- Touch exterior de la oficina abre una ficha compacta con acceso a mejorar. El siguiente nivel se muestra construido en la ficha y como blueprint en la escena antes de comprar. El interior mantiene su navegación por touch.
- La construcción inicial se confirma desde el catálogo inferior, sin una segunda ventana de confirmación. Conserva las validaciones de estado y saldo de `startModule`.
- El catálogo HSEC abre directamente desde Construir al desbloquear Misión 2. Carrusel horizontal, miniaturas transparentes, categorías y precios con ícono de créditos; Personal accesible desde una categoría propia.
- La colocación usa una barra inferior con costo, validez, giro cuando corresponde, cancelar y construir. Confirmar devuelve al catálogo, sin abrir automáticamente el panel de activos.
- Arrastrar desde cualquier área libre de la escena gira la cámara en Builder; una pulsación corta sigue ubicando el elemento. Los gestos iniciados en UI no controlan la cámara.
- El preset C admite órbita y zoom. Su zoom es temporal y conserva la preferencia de exploración B. La proyección reserva espacio para el catálogo; el preview del galpón ajusta distancia y altura para incluir su volumen.
- Galpón reconstruido visualmente con revestimiento acanalado, cubierta a dos aguas, portal y cerchas trianguladas, estanterías, banco, gabinete, luminarias suspendidas y protecciones. Se agrupa en ocho materiales y menos de 8.000 triángulos.

## Compatibilidad y alcance

Se mantienen la clave y esquema de guardado, precios, temporizadores, recompensas, cuatro avatares, locomoción y Cámara B. No se migran posiciones de activos ni caminos. Las pruebas de navegador usan el origen local y muestras QA, sin tocar partidas del dominio publicado.

El galpón conserva su huella de **6 × 4,8 unidades** y accesos de la versión 22. Se toma la lámina como dirección arquitectónica y de detalle; **no se implementa aún el lote de 24 × 12 m de la ficha**, que requiere redimensionar la distribución y migrar conexiones existentes. Las curvas, texturas y edición de redes de caminos son trabajo posterior; no se presentan como resueltas en esta revisión.

## Verificación

- `npm test`: 98 pruebas, sin fallos, más comprobaciones de los cuatro rigs.
- Pruebas nuevas: órbita/zoom C sin sobrescribir B, arrastre izquierdo sin colocación accidental y presupuesto/volúmenes físicos del galpón.
- Revisión de UI en wrapper móvil de 844 × 390 y 568 × 320: mejora con precio y preview, compra/temporizador, catálogo y colocación del galpón. Arrastre real cambió el yaw de 0 a −0,9 sin cambiar el saldo ni la selección.
- El navegador de revisión no dispone de WebGL: se usa el renderizador Canvas de compatibilidad. No se afirma validación de calidad GPU o FPS en un teléfono físico.
