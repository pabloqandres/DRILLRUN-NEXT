# V42 · HSEC sin NPCs 3D + Biblioteca de nuevos personajes
- Se eliminó la carga de `hsec-npc1.glb` y `hsec-npc2.glb` desde `dist/hsec/world.mjs`; ninguna instancia se crea ni patrulla en la escena.
- `dist/hsec/ui.mjs` ya no carga retratos mediante los GLB de prevencionistas. El panel de HSEC mantiene el control virtual de contratación, inspecciones, puntuación, mantenimiento y órdenes.
- `dist/chapter/game.mjs` retira la interacción y la cámara de seguimiento de un prevencionista invisible.
- `dist/hsec/state.mjs` y `dist/hsec/catalog.mjs` no se alteran: **datos de HSEC y partidas guardadas intactos**. Los GLB legacy se conservan en el repositorio para no borrar arte original.
- Nueva carpeta `dist/assets3d/npc-library/`: guía de GLB + `registry.mjs` con 6 identidades reservadas únicas, sin archivos de personajes aún y sin importación al juego ni spawns gratuitos.
- Nuevo NPC de referencia en esta conversación: guardia de acceso de Patio L1, aún NO integrado como NPC 3D.
- Pruebas `tests/npc-library-hsec-virtual-v42.test.mjs`: sin carga ni interacción de escena HSEC, roles virtuales intactos, seis slots únicos, ningún asset asociado o instancia automática.
- Verificación in-memory de sintaxis e invariantes: pasó. Pendiente validación visual Android.
