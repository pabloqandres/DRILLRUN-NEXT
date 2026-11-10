# V57 — Iluminación visible de Patio L1 (2026-11-10)

## Hallazgo en screenshots Android
- Aparcaderos completamente oscuros pese al ciclo nocturno HSEC y los faros encendidos.
- Causa verificada en fuente: los halos de los postes se dibujaban a y=0.16, por debajo del asfalto superior y=0.18 y de los trazos pintados (aprox. y=0.26). Los `PointLight` reales tenían rango limitado y el presupuesto móvil apagaba luminarias lejanas.
- Capturas adicionales muestran una DrillTruck® personal detenida junto a un edificio; la imagen no confirma si fue límite invisible o colisión sólida.

## Cambio visual propuesto en esta rama
- `dist/mission5/patio-world.mjs`: elevar los halos a y=0.295, ampliar la cobertura de PointLight sin sombras, mantener presupuesto dinámico por calidad y dejar halos tenues en los focos no prioritarios.
- Añadir cuatro piscinas de luz sobre aparcaderos pesados y P01 sin agregar geometría sólida, cobros, obstáculos ni fuentes dinámicas nuevas.
- `tests/v52-night-patio-driving.test.mjs`: adaptar aserciones existentes y añadir regresión que exige halos sobre pintura y cobertura en plazas.
- Compatibilidad: M1–M5, HSEC, Casa Matriz, precios, saves, DrillTruck® 01 automática y DrillTruck® 02 personal sin cambios.

## Limitación de verificación
- Inspección estática del código y aserciones actualizadas; todavía sin ejecutar `npm test` ni validar imagen WebGL/Android. No llamar corregida a la experiencia hasta probarla visualmente.
- Rama para PR, no publicar directo a `main`.

## Dependencia funcional separada — circulación nocturna
- `dist/scene.mjs` `World.isBlocked` impone cajas de movimiento invisibles cuando la posición está fuera de `M5_PLOT`/`OFFICE_PATIO_LINK`.
- `dist/chapter/state.mjs` `restore` devuelve a spawn posiciones fuera de sus cajas admitidas.
- `dist/mission5/personal-drilltruck.mjs` usa otro rango fijo en `personalTruckAtPlayableLocation`; `repairPersonalTruckPose` también reubica posiciones externas.
- Para ampliar tránsito se debe coordinar una misma región de mundo (malla de desierto 240×240m) aplicada al movimiento y a la restauración del avatar y camioneta, sin eliminar las colisiones físicas de cercos, edificios, portones, peatones y equipos.
- Esta rama **no cambia** la lógica de movimiento para no vulnerar ownership ni corromper guardados.

## HUD/UI
- Se registró deuda visual para rediseño incremental posterior: reducir altura de franjas, translucidez, iconos, agrupación de comandos por contexto (modo caminar/conducir), y mantener targets táctiles. Sin cambios de interfaz en V57.
