# Biblioteca NPC · DRILL RUN NEXT GENERATION

Carpeta reservada para 5–6 personajes 3D independientes que se incorporarán progresivamente, **solo cuando su misión requiera contratarlos**.

## Entrega de archivos
- Formato: GLB con materiales y texturas integradas; escala humana (1 unidad = 1 metro), pies en y=0.
- Nombre de cada archivo: `npc-m5-guardia-acceso.glb`, `npc-m5-tecnica-bodega.glb`, `npc-m6-operador-maquinaria.glb`, etc. (único por personaje).
- Presentación: pose A neutra, brazos separados del torso, dedos legibles y botas visibles; orientación frontal consistente.
- Estética: cel shading premium, contornos definidos; **solo DRILLCO®/PUMA®** según aprobación, nunca marcas externas.
- EPP obligatorio: **casco industrial, chaleco reflectante, botas de seguridad**. Las gorras no sustituyen el casco en la faena.
- Ideal incluir clips `Idle`, `Walk`, `Interact` y `Work`; pueden agregarse después.

## Protocolo de integración
1. Registrar el GLB con identidad `npcId` única y un solo dueño/puesto lógico.
2. El asset se carga bajo demanda; ningún NPC aparece gratis ni automáticamente en M5.
3. La contratación crea **una única instancia**, enlazada a una plaza/rol; recargar Cloud Save no duplica el personaje.
4. Un NPC que trabaja no aparece simultáneamente en caseta, galpón ni en otro punto.
5. Los modelos históricos `hsec-npc1.glb` y `hsec-npc2.glb` quedan preservados como archivos legacy, **sin carga en escena ni retrato HSEC**. El profesional HSEC se mantiene como empleado virtual en las reglas de inspección M2.
6. Verificar rendimiento en Android horizontal y no usar `GLB` para mostrar un modelo inexistente.

## Reserva (sin assets asociados ni spawn automático)
- M5: guardia de acceso.
- M5: técnico/a de bodega.
- M6+: operador/a maquinaria pesada.
- M6+: mecánico/a de mantenimiento.
- Futuro: operador/a combustible.
- Futuro: supervisor/a de operaciones.

Nada de esta carpeta cambia el estado del jugador, los contratos, la economía o el HSEC.
