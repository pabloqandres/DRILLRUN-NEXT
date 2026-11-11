# V64 — Inicio cinematográfico DRILL RUN NEXT GENERATION (prototipo integrado)

## Aprobación e intención
Usuario aprueba arte conceptual con título metálico DRILL RUN / NEXT GENERATION, personajes con casco y EPP en los márgenes, entorno norte de Chile con instalaciones construidas y edificios holográficos blueprint azul, DrillTruck® genérica y botón rojo neón JUGAR estilizado. Solicita conservar **exactamente ese logotipo** para toda aparición del branding, animar la vista sin video pesado y revisar avances antes de producción.

## Implementación
1. Prototipo CSS autónomo `dist/title-preview-v64.html`: imagen aprobada convertida a WebP (<200 KB en 1440p, ~95 KB mobile); logo extraído de píxeles originales a WebP transparente (~30 KB); overlay azul del blueprint (~62 KB). El HTML completo se mantiene autocontenido en base64 para sortear infraestructura de assets del runtime. Animación con lenta deriva de cámara, partículas ambientales deterministas, halo solar sutil, pulso de construcciones blueprint, destello controlado en logo y CTA táctil real con borde neón. Sin recodificación de video, WebGL adicional, fuente externa o marca ajena.
2. CSS `dist/chapter/entry-cinematic-v64.css` reutiliza el LOGO APROBADO en login `startBrand h1` y carga `loadCard .wordmark` y define la capa aislada del welcome.
3. `dist/index.html`: agrega referencia a CSS y vista `#welcomeScreen` que contiene iframe same-origin en modo embebido.
4. `dist/chapter/game.mjs`: después de login/Cloud Save y de `ensureWorld`, se muestra bienvenida. Al pulsar JUGAR el iframe despacha `postMessage` same-origin validado contra `location.origin` y `iframe.contentWindow`. A continuación se ejecuta la misma rama anterior de `chooseCharacter(true)` o `beginPlay(true)`. iframe se descarga al continuar para recuperar memoria Android. No se modifica el estado ni la persistencia, las misiones, controles, calidad gráfica ni interacción de personajes.
5. Tests estáticos de estructura/seguridad UI y CI V64, además de regresiones previas.

## Entrega
- Prototipo descargable autónomo: `DRILLRUN_V64_PANTALLA_ANIMADA.html` (con imagen incorporada).
- Paquete local `DRILLRUN_V64_PROTOTIPO_COMPLETO.zip`, con assets separados WebP y CSS.
- Web-preview de rama a través de Vercel, PR pendiente de aprobación.
- El botón del prototipo directo simula transición; la pantalla embebida del juego usa ruta real de nuevo/continuar.

## Límites y estado
No fusionar a `main` ni desplegar a dominio de producción sin revisión explícita del usuario. La CI valida fuente, no sustituye prueba manual Google login/Android. No se ha alterado ningún guardado ni la economía M1–M5.
