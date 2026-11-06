# HOTFIX 005 — Builder modular y cuatro avatares

La actualización conserva la interfaz 005.5, el módulo abierto 004, las colisiones y el controlador aprobado. Reemplaza la compra y colocación individual de muebles por módulos completos.

## Recorrido

Jugar → elegir uno de cuatro avatares y escribir nombre → introducción provisional «Un nuevo comienzo» → Mensajes → limpiar 16 elementos → teléfono / CONSTRUIR → Administración → Oficina básica → seleccionar zona → confirmar → esperar o usar acelerador → entrar por el acceso luminoso → utilizar computador → próximo objetivo: preparar una faena segura.

Capital: 5.000 créditos; oficina L1: 3.000 / 10 min; cinco aceleradores. L1 incluye escritorio, silla, computador básico, archivador y lámpara, además de climatización e iluminación del módulo aprobado. Un solo espacio abierto, sin baño ni dormitorio. Los elementos despejables incluyen arbustos xerófitos bajos, pasto seco, rocas, cajas y chatarra; todas las mallas tienen contacto comprobado con el suelo, sin arbolitos con copa. L2 cuesta 1.500 / 5 min y sustituye el equipamiento por dos puestos modernos dentro del mismo exterior. El catálogo ofrece solamente módulos iniciales. Tocar la oficina instalada abre su gestión propia y desde allí se mejora a L2; los upgrades no son edificios adicionales del catálogo. Mejorar abre primero un blueprint azul del equipamiento futuro en el módulo real; el panel incluye además una vista 3D a color y girable de cómo quedará terminada. Solo Comprar mejora descuenta el costo. Cancelar conserva nivel, mobiliario y saldo. L3 y las demás categorías permanecen bloqueadas. No se implementan contratos ni perforación.

Por la decisión posterior de Pablo, el teléfono conserva su diseño y ofrece Mensajes y Construir. El HUD ya no muestra un botón de construcción permanente. Al abrir Construir, se cierra el teléfono y se muestra el catálogo inferior sobre el escenario; la lógica modular permanece igual. El saldo es directamente utilizable. Los sistemas anteriores de banco y edición quedan internos, sin accesos en este episodio.

## Configuración

- `dist/chapter/config.mjs`: capital, energía, aceleradores, retícula y textos configurables del mentor.
- `module-catalog.mjs`: categorías, módulos, zonas, precios, tiempos, capacidades, requisitos, componentes y equipamiento fijo.
- `avatars.mjs`: identidad, GLB, altura, radio y bonificaciones.
- `modular-strings.mjs`: textos de la actualización en español, inglés, portugués, italiano y chino tradicional.

La Constructora reduce 5% los tiempos (L1 09:30; L2 04:45). Las otras especialidades se guardan y se muestran; sus efectos se reservan para los sistemas futuros correspondientes. No se simulan ingresos o mantenimiento inexistentes.

## Modelos y locomoción

El GLB aprobado original permanece byte por byte. Los tres originales entregados por el usuario se conservan fuera del runtime sin sobrescribir. Las copias optimizadas mantienen superficie, UV y texturas del candidato: aproximadamente 30.000 triángulos por avatar, frente a 500.000 originales. Base color 2048 y mapas normal/PBR 1024; una malla/material por personaje. Rig humanoide de 21 huesos y clips Idle/Walk/Turn, mediante el pipeline ya existente; perfiles de proporciones en `tools/avatars/profile-0X.json`.

Las alturas son 1,85 / 1,83 / 1,88 / 1,66 m. Se reutilizan CandidateRig, controlador, joystick y cámara. La fase de caminata responde a distancia recorrida y escala de zancada; no existe doble desplazamiento por Root Motion. No se anclan pies en coordenadas del mundo. Corrección de suelo mediante sondas limitadas de las suelas, sin solver IK adicional.

`validation/avatars-source-manifest.json` conserva hashes y tamaños. Los perfiles y scripts offline permiten repetir adaptación y pruebas; los GLB originales no se publican como descarga adicional. El script de medición es una propuesta inicial: los perfiles comprobados incluyen las correcciones finales de pesos y deben usarse al reconstruir.

## Guardado y migración

Se conserva la clave de guardado v5. La migración `modular-1` suma una sola vez banco y efectivo antiguos. Guarda avatar, nombre, especialidad, saldo, limpieza, nivel, capítulo y temporizadores absolutos. Antes de migrar, se conserva copia local `-before-modular`. Una oficina antigua construida se convierte al equipamiento prediseñado de su nivel; la distribución manual anterior deja de ser el modo activo. Las operaciones de construcción, gasto y finalización son idempotentes al cargar.

El guardado sigue siendo local al navegador/dispositivo. Google Sign-In está preparado mediante proveedor real, pero necesita configuración Firebase del proyecto para vinculación y futura sincronización. No se inventa una cuenta online.

## Revisión y límites

`npm test` comprueba economía/migración, construcción, fixtures, traducciones, avatares y controlador/colisiones. Las verificaciones de malla animada evalúan vértices finitos, longitud ósea, deformación y contacto de suelas; no equivalen a aprobación artística ni prueba de rendimiento físico.

`chapter-review.html?qa=1` permite revisar 844×390, 667×375 y 568×320. Sus ayudas recorren el terreno usando el controlador real y pueden grabar una prueba de caminata de 4 m, giro, regreso y repetición con intensidad reducida. Estas ayudas no aparecen en el juego normal.

El navegador en la nube carece de WebGL y usa el renderizador de compatibilidad sobre las mallas reales. No permite validar la apariencia final del shader GPU ni certificar FPS en teléfonos. Deben revisarse en un dispositivo con WebGL. La cinemática y mobiliario son provisionales; la calidad final requiere aprobación visual.

## Marca

Se revisaron textos y elementos visibles de la escena activa. Se conserva el archivo oficial DRILLCO; no se agregan logos de fabricantes externos. La maquinaria ambiental es geometría procedural genérica, sin identificadores comerciales. No se presenta como producto fabricado por DRILLCO. Los candidatos humanos conservan el uniforme entregado sin introducir marcas externas.

Próximos alcances reservados: 006 desarrollo de parcela/HSEC, 007 primer contrato de exploración, 008 ciclo de herramientas/RAISE.

## Fondo de carga

La pantalla de carga usa `dist/assets/loading-atacama-v1.webp`, fondo generado con la herramienta integrada de imágenes y optimizado a WebP. Prompt: paisaje amplio del Atacama, montañas rosadas y lavanda, terreno vacío, arbustos xerófitos bajos, polvo sutil y luz cinematográfica cálida, acabado 3D estilizado; sin texto, logos, edificios ni maquinaria. Sustituye la ilustración geométrica provisional. El progreso corresponde a recursos preparados, sin esperas artificiales.

## Validación de esta entrega

Prueba real en el navegador de revisión: cuatro avatares en el selector, nombre Pablo; caminatas con el controlador original y dos intensidades; mentor y teléfono; limpieza completa de 16 objetos; compra L1 (saldo 5.000 → 2.000), temporizador 09:30 con Constructora, recuperación durante obra sin nuevo cobro, acelerador (5 → 4), acceso, mobiliario automático y computador; capítulo completado. Gestión separada del edificio, preview azul y panel 3D a color, cancelación manteniendo saldo 2.000; compra L2 (2.000 → 500), temporizador 04:45 y segundo acelerador (4 → 3). Revisión de HUD/catálogo en 844×390, 667×375 y 568×320. Guardado sigue siendo local; rendimiento GPU y teléfonos físicos pendientes de medición.

Orientación física: el archivador L2 gira hacia el interior, con espacio libre delante de los cajones. Se comprueba también que sillas y pantallas enfrenten sus puestos de trabajo. La corrección se aplica al recuperar módulos ya guardados.
