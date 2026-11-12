# V87 · Restauración de la primera identidad DRILL RUN
**Fecha:** 2026-11-12

## Aprobación
El usuario rechaza el logo futurista/metálico de estilo Blade Runner y solicita volver a la base **original sencilla, DRILL blanco / RUN naranjo**, y aplicar el estilo de forma transversal al juego. No se replica la imagen generada recientemente que rechazó.

## Cambio
- Inicio (`#startScreen .startBrand h1`): se conserva el título HTML original DRILL RUN y se restaura su renderización de texto, blanca y naranja, con una fuente industrial limpia, sin barras rojas ni imagen metálica.
- Loading (`#loading .loadCard .wordmark`): mismo renderizador de texto y color. También se retiran los elementos de presentación que competían con la marca.
- Selección de personaje (`#characterScreen`): se sustituye la marca que antes nacía de pseudo-elementos V68 por una marca real, blanca/naranja, y una subtitulación NEXT GENERATION.
- Pantalla minijuego puente (`dist/mission3/drillrun-launcher.html`): misma variante tipográfica.
- Favicon/PWA: monograma D blanco / R naranjo, sin acabado futurista. Nueva referencia versionada para bust de caché.
- Se retira **el bloque entero de ~80 KB del WebP base64** anterior dentro de `entry-cinematic-v64.css`, conservando solo las reglas de bienvenida, para impedir que vuelva a mostrarse el logo viejo.
- Nuevo `drillrun-classic-brand-v87.css` cargado después de los estilos V86; CSS única fuente de verdad de color, peso y escala para soportes de marca. No añadimos logos DRILLCO/PUMA ni marcas ajenas.

## Sin cambios
No se toca `game.mjs` ni `cloud-save.mjs`, ni las misiones, cash, Google Auth, la navegación semirradial ni las pantallas de gestión. CI propio comprueba presencia de marca y ausencia de embedded image, además de regresión de inicio/sincronización V86.1.

## Control de calidad
Pruebas estructurales y regresiones de startup + Personal. La apariencia final en distintos teléfonos debe validarse con captura de usuario. Este trabajo **no reconstruye exactamente un archivo histórico de logo** que no se ha recuperado; utiliza el título tipográfico HTML original del juego y la dirección aprobada de blanco/naranjo.
