# Copia de desarrollo · Builder y holograma

Esta exportación incluye el juego completo y los cambios locales todavía sin publicar. No es una nueva versión publicada ni un commit nuevo.

## Incluido en esta etapa
- Catálogo horizontal con márgenes, imágenes del modelo real y resumen de compra.
- Ficha técnica integrada y botón para contraer/expandir sin perder selección.
- Corrección de títulos cortados en mobile horizontal.
- Compra directa de edificios con ubicación asignada, sin paso de previsualización.
- Cartel de construcción ligado a la posición del edificio, independiente del avatar.
- Holograma cian de oficina y galpón durante la obra, barrido suave y desvanecido al terminar.
- Perfiles de calidad y eliminación de recursos temporales del efecto.

## Verificado
110 pruebas aprobadas, 0 fallidas; validadores existentes de los cuatro avatares también aprobados. Compras y finalización revisadas en una partida local independiente. El MP4 y los seis GLB coinciden con los archivos originales de la base publicada.

El navegador de revisión no tiene WebGL2 disponible y usa el renderizador por software. Los shaders se incluyen, pero su acabado final y el rendimiento en un teléfono con WebGL2 siguen pendientes de validación. La captura incluida se tomó dentro del juego con el renderizador compatible.

## Integrar cambios externos sin perder progreso
Trabaja sobre una copia o rama y compara contra EXPORT_MANIFEST.json. Conserva identificadores, esquema y clave de guardado. Las partidas no están en este ZIP: permanecen en el almacenamiento del navegador de cada origen. El servidor localhost tiene un almacenamiento distinto del sitio publicado. Prueba los cambios y revisa el despliegue antes de reemplazar la versión activa.

## Pendiente de otra etapa
El nuevo trazado de caminos y cierres perimetrales sigue sin implementarse. No se añaden nuevas misiones, edificios, empleados ni reglas económicas.

## Contenido excluido
No se incluyen credenciales, cookies, partidas, historial interno .git, node_modules ni el arnés temporal usado para preparar estados de prueba. Las dependencias de runtime están en dist/vendor; las de desarrollo se instalan con npm ci a partir del lockfile. Ver README.md.
