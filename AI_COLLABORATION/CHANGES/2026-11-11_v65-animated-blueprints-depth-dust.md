# DRILL RUN NEXT GENERATION · V65.1 — Blueprints con perspectiva y polvo a ras de suelo

## Aprobaciones / usuario
Base de la bienvenida V64 ya aprobada en arte, logos y CTA. Para V65 el usuario pide **mantener el barrido SOLO en el logo**, quitar el barrido global, animar construcción progresiva. Después identifica solapamiento del brillo azul del galpón a la izquierda sobre la caseta del primer plano; solicita también partículas de polvo que corran abajo a los pies de los personajes y detrás de JUGAR.

## Cambios
- `dist/title-preview-v65.html` contiene WebP aprobado integrado, logo original, dos capas de hologramas y botón JUGAR real. Conserva `#logoShine` con `titleSweep 10s`; elimina `#scan`.
- SVG `#buildLines` hace dibujado progresivo de tres instalaciones, en fases diferentes, con trazos energéticos y nodos. Cada sitio respeta proyección 1672×941 de la imagen.
- `mask#galponDepthV65`: excluye el módulo prefabricado real del primer plano del dibujo holográfico posterior izquierdo. La capa WebP azul de pulso se recorta con **la misma silueta** en alfa; la construcción no se ilumina a través del módulo.
- `#groundDust`: cinco bancos de polvo radial, dos plumas cerca de pies, diez granos de arena con desplazamiento lateral de viento. Recortado en el tercio inferior y por debajo del botón (z7 frente a z20). Animación CSS de bajo costo, sin video.
- `dist/chapter/game.mjs`: solo cambia la carga del iframe de bienvenida a `title-preview-v65.html`. Permanece la ruta V64 de autenticación, carga, bienvenida, selección / Cloud Save.

## Validación
- En Chromium se abrieron vistas 1280×720 y 832×384; ninguna excepción JS; test de pulsación JUGAR y transición visual; logo sigue con titleSweep; sin fullscreen scan; máscara activa; 5 bandas + 2 plumas + 10 granos.
- Test V65 de estructura/ocultación/polvo/seguridad, CI focal; test V64 de continuidad.
- Validación manual en Android queda pendiente del usuario. El efecto de máscara es aproximación de oclusión 2.5D sobre arte final, no modelo 3D real.

## Release
Rama de preview `chatgpt/v65-blueprint-line-build-immersion` desde V64. NO merge ni Vercel producción sin aprobación expresa.
