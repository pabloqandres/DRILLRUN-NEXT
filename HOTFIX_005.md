# HOTFIX 005 · New Game & First Steps

El índice público del proyecto ahora abre el Capítulo 01. `visual-lab.html` conserva la muestra técnica del HOTFIX 004. La oficina abierta, el GLB del operador, su rig, sus animaciones y el controlador aprobado se reutilizan sin reconstruirlos.

## Tres etapas verificables

1. Inicio, invitado, idioma, selección Gaspar/Paula y llegada provisional al terreno vacío. La portada se intercambia desde `dist/chapter/config.mjs`. La introducción está descrita en ocho planos configurables, tiene omisión y termina con el mismo encuadre de entrada al gameplay. Paula utiliza temporalmente el asset existente, rotulado como provisional. No hay un modelo femenino definitivo ni un video externo.
2. Teléfono, mensaje del mentor, banco y misión de limpieza. Se retiran los 16 objetos mediante proximidad, botón de mano, energía y partículas. Una compra de 1.800 créditos inicia el mismo módulo de oficina del HOTFIX 004 en su punto predeterminado. Temporizador persistente de diez minutos y cinco aceleradores iniciales. La obra muestra estructura temporal; al finalizar aparece el módulo aprobado. Entrada por círculo y mano. El interior ya está precargado: se usa una transición visual breve, sin una falsa espera de carga.
3. OFFICE STORE, inventario y colocación. Tres productos provisionales funcionales: escritorio de 350, silla de 200 y computador de 650 créditos. Categorías y catálogo son datos extensibles. El editor permite tocar el suelo, mover con flechas, girar, confirmar, cancelar y reubicar. Rechaza muros, superposiciones y bloqueo del acceso; el computador requiere una superficie de escritorio. Al mover ese escritorio se transporta su computador. Los muebles de piso usan el mismo controlador y consulta de colisiones existentes. Instalar los tres completa el capítulo y habilita el computador, sin contratos ni perforación.

## Partida y economía

Guardado local versionado en la clave `drillrun-chapter-01-v5`, separado de las muestras anteriores. Se conservan idioma, protagonista, posición/orientación, energía y recuperación, saldos, operaciones, aceleradores, objetos retirados, obra, inventario, muebles y capítulo. Las transiciones son idempotentes: recargar no vuelve a cobrar la obra, regalar capital o consumir un acelerador. La recuperación elimina colocaciones corruptas para que el objeto pueda reubicarse desde inventario.

Capital de prueba: 5.000 en banco y 500 disponibles. El retiro sugerido de 2.500 deja 3.000 disponibles, suficientes para módulo y tres productos obligatorios. El inventario inicial limita duplicados hasta completar el capítulo, evitando gastar el capital en copias antes de las compras necesarias. La energía empieza en 20, consume una por objeto y recupera una cada 30 segundos; no exige esperar para las 16 limpiezas.

Todo este balance, los nombres y mensajes del mentor, la portada, puntos despejables, el catálogo y planos introductorios son configurables. La moneda es ficticia; no hay intereses, dinero real, rankings ni supuesta economía online.

## Localización

Claves y diccionarios completos para español, inglés, portugués, italiano y chino tradicional en `dist/chapter/i18n.mjs`. El primer idioma se toma del dispositivo y después se guarda la elección. Los nombres propios y marcas conservan su escritura.

## Google opcional mediante Firebase

`dist/chapter/auth.mjs` usa Firebase Authentication real y GoogleAuthProvider. La configuración distribuida en `dist/config/auth.json` tiene `firebase: null`: no fabrica usuarios, tokens ni sesiones y no bloquea el modo invitado. El SDK se importa sólo al existir configuración válida.

Para activarlo:

1. Registrar una aplicación web en tu proyecto Firebase y habilitar Google en Authentication.
2. Añadir el dominio real del juego a los dominios autorizados del proveedor.
3. Completar `firebase` en `auth.json` con el objeto de configuración web suministrado por Firebase: `apiKey`, `authDomain`, `projectId`, `appId` y los demás campos públicos que correspondan. Conservar `provider: "firebase"`.
4. Publicar la configuración y probar la vinculación desde Configuración. No incluir client secrets, claves de servicio o credenciales administrativas en archivos del navegador.

Referencias oficiales: https://firebase.google.com/docs/web/setup y https://firebase.google.com/docs/auth/web/google-signin .

Vincular una cuenta todavía no agrega guardado cloud ni rankings. Una futura economía online deberá validar operaciones en servidor, sin confiar en la partida local.

## Pruebas y límites

34 pruebas automáticas verifican recorrido económico completo, limpieza y recuperación, temporizador offline, aceleración única, reconstrucción del guardado, colocación, soporte del computador, colisiones de muebles, cinco idiomas y regresiones de movimiento/barandas/rig. El mobiliario provisional suma 1.260 triángulos en 20 mallas agrupadas por material, además de sus líneas de borde. La oficina se conserva en 6.158 triángulos.

La revisión `chapter-review.html` contiene el juego normal en un iframe de 844 × 390. `chapter-review.html?qa=1` activa las ayudas de prueba. Dos botones QA sólo en `?chapterqa=1` recorren la limpieza y se acercan al punto de obra con el controlador real; no conceden dinero, completan el capítulo ni saltan las compras. La validación de banco, obra, acelerador, tienda, colocación y computador se hizo con las interfaces reales. En el juego normal esos botones no aparecen.

El navegador remoto no dispone de WebGL: las capturas usan las mismas mallas con iluminación simplificada. No representan una medición de FPS de un móvil físico. La cinemática definitiva, el modelo femenino final y los modelos finales del mobiliario quedan preparados para sustitución posterior.
