# V43 · M5 SMS, dos NPC y caminata derivada de la dinámica de avatares

## Solicitud
Después del GLB de Guardia de Acceso y Técnica de Bodega, el jugador pide que **ambos caminen como los avatares**, sin gastar créditos en nuevas generaciones, y M5 tenga inicio y final por mensaje.

## Modelos recibidos y optimizados
- Original masculino `-i-m-a-g-e_-t-o_3-d-glb-3125f011-ff8c-4e1e-98e4-81f000466f57.glb`: 3.277.708 bytes; **sin skins, huesos ni clips**, 11.934 vértices.
- Original femenino `-i-m-a-g-e_-t-o_3-d-glb-12bf04c7-a2bf-4aed-815f-ae4d298e7693.glb`: 3.372.780 bytes; **sin skins, huesos ni clips**, 12.433 vértices.
- GLB optimizados localmente, texturas integradas 1024 px y geometría original intacta: `npc-m5-gate-security.glb` (1.006.040 B), `npc-m5-warehouse-tech.glb` (1.047.116 B).
- ZIP exacto en `/mnt/data/DRILLRUN_M5_NPCs_optimizados.zip`, con rutas destino `dist/assets3d/npc-library/`.
- **Bloqueo operativo**: el conector GitHub de esta sesión solo acepta contenido UTF-8 o una cadena base64 completa, sin transferencia directa de archivos binarios de las conversaciones. Los GLB todavía **no están en GitHub/Vercel**. No afirmar que ya se visualizan.

## Implementación en GitHub/main
1. `dist/mission5/npc-locomotion.mjs` genera automáticamente esqueleto humanoide y skin weights en GPU para los GLB de una sola malla. Reproduce el principio de marcha por distancia de los avatares: zancada sincronizada con traslado, oscilación alternada de piernas y brazos, giro, reposo; sin duplicar la identidad del asset. Se debe probar visualmente en Android después de publicar los GLB.
2. `dist/mission5/patio-npc-world.mjs`: carga un solo GLB por rol **después de contratarlo**; patrulla con puntos fijos en caseta o frente al galpón, evita colliders, muestra Idle/Walk, y elimina actores al cambiar de partida.
3. `dist/mission5/patio-staff.mjs`: guardia costo 🪙1.800, técnica 🪙2.200, sin cargos repetidos. Acciones útiles: verificar barrera/segregación HSEC y auditar el stock REAL del jugador sin crear consumibles.
4. `dist/chapter/narrative.mjs`, `narrative-strings.mjs`: SMS inicial de Elena luego de confirmar el cierre de M4; cinco objetivos. SMS final solo tras las verificaciones del guardia y la técnica, no al terminar la obra. Sin recompensa fantasma.
5. `dist/mission5/patio-ui.mjs`, `dist/chapter/phone-ui.mjs`, `dist/chapter/game.mjs`: contratación y operación desde aplicación del Patio; estado en HUD; interacción al acercarse al NPC; Catálogo mantiene preview y compra exige aceptar M5.
6. `dist/mission5/assets-ready.mjs`: **protección de partida**: consulta HEAD de ambos GLB en la misma ruta de producción. Si falta cualquiera, el inicio narrativo de M5 no se entrega ni habilita compras. Cuando estén ambos disponibles se desbloquea automáticamente al reingresar.
7. `dist/assets3d/npc-library/registry.mjs`: IDs únicos para los dos NPC aprobados y cuatro roles futuros (aún sin GLB).
8. `tests/m5-staff-narrative-and-walk-v43.test.mjs`: contratación, cinco objetivos, cobros, reentrada, cierre por SMS, no creación gratis ni duplicidad.

## QA
Validación sintáctica en JS de 11 módulos nuevos/modificados; simulación de datos comprobó:
- Sin GLB: M5 no se anuncia.
- Con ambos GLB: inicio `n:m5:start` después de M4.
- Precio base Patio 45.000 + dos contrataciones 1.800 y 2.200 = 49.000 en cargos separados.
- Obra termina tras 1200s pero NO dispara mensaje final.
- Dos empleados únicos, dos verificaciones funcionales, cinco objetivos verdaderos.
- Al finalizar: `n:m5:end` y confirmación sin dinero extra.
- **Pendiente** QA de GPU skinning, animación 3D, posición visual de actores y navegación real en Android.
