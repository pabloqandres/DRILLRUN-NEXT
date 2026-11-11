# V57 — Iluminación visible de Patio L1 (2026-11-10)

## Hallazgo en screenshots Android
- Aparcaderos completamente oscuros pese al ciclo nocturno HSEC y los faros encendidos.
- Causa verificada en fuente: los halos de los postes se dibujaban a y=0.16, por debajo del asfalto superior y=0.18 y de los trazos pintados (aprox. y=0.26). Los `PointLight` reales tenían rango limitado y el presupuesto móvil apagaba luminarias lejanas.
- Capturas adicionales muestran una DrillTruck® personal detenida junto a un edificio; la imagen no confirma si fue límite invisible o colisión sólida.

## Cambio visual propuesto en esta rama
- `dist/mission5/patio-world.mjs`: elevar los halos a y=0.295, ampliar la cobertura de PointLight sin sombras, mantener presupuesto dinámico por calidad y dejar halos tenues en los focos no prioritarios.
- Añadir cuatro piscinas de luz sobre aparcaderos pesados y P01 sin agregar geometría sólida, cobros, obstáculos ni fuentes dinámicas nuevas.
- `tests/v52-night-patio-driving.test.mjs`: adaptar aserciones existentes y añadir regresión que exige halos sobre pintura y cobertura en plazas.
- `dist/chapter/faena-center.mjs`: corrige el constructor que OMITÍA guardar los callbacks `onLocatePersonalTruck` y `onRecoverPersonalTruck`. Los botones aparecían activos pero nunca ejecutaban las acciones del controlador. Se reconectan sin alterar propiedad, velocidad, costo, estado, cámara o save de la unidad.
- `tests/v56-personal-drilltruck-recovery.test.mjs`: prueba real de handlers para localizar y recuperar, además de los tests existentes sobre propiedad/economía.
- Compatibilidad: M1–M5, HSEC, Casa Matriz, precios, saves, DrillTruck® 01 automática y DrillTruck® 02 personal sin cambios en datos o lógica de movimiento.

## Limitación de verificación
- CI de PR #76 ejecutada: `v52-night-driving`, `v56`, `m5-focused`, `v53`, `v55`, `v49-patio`, `v50-personal-truck`, `v54`, `dth-relocation` pasaron. `test` general falla en dos aserciones de economía offline M4, también fallidas en el commit `main` de partida (problema preexistente ajeno a esta rama). Validación visual WebGL/Android aún pendiente.
- PR de revisión borrador #76: `https://github.com/pabloqandres/DRILLRUN-NEXT/pull/76`; no publicado a `main`.

## Dependencia funcional separada — circulación nocturna
- `dist/scene.mjs` `World.isBlocked` impone cajas de movimiento invisibles cuando la posición está fuera de `M5_PLOT`/`OFFICE_PATIO_LINK`.
- `dist/chapter/state.mjs` `restore` devuelve a spawn posiciones fuera de sus cajas admitidas.
- `dist/mission5/personal-drilltruck.mjs` usa otro rango fijo en `personalTruckAtPlayableLocation`; `repairPersonalTruckPose` también reubica posiciones externas.
- Para ampliar tránsito se debe coordinar una misma región de mundo (malla de desierto 240×240m) aplicada al movimiento y a la restauración del avatar y camioneta, sin eliminar las colisiones físicas de cercos, edificios, portones, peatones y equipos.
- Esta rama **no cambia** la lógica de movimiento ni la recuperación subyacente; repara solamente el cableado de los dos botones y el render visual del patio.

## HUD/UI
- Se registró deuda visual para rediseño incremental posterior: reducir altura de franjas, translucidez, iconos, agrupación de comandos por contexto (modo caminar/conducir), y mantener targets táctiles. Sin cambios de interfaz en V57.

## V57 integrated open-terrain scope (explicit user authorization, 2026-11-10)
- `dist/chapter/navigation-areas.mjs`: canonical `isPlayableTerrain` bounds ±108 m (12 m in from 240×240 m desert).
- `dist/scene.mjs`: remove three old invisible area/mission-phase rectangles and preserve actual HSEC/office/physical colliders.
- `dist/chapter/state.mjs`: retain valid saved player poses anywhere on displayed terrain, independent of M4 gate; corrupt/outside mesh positions still return to spawn.
- `dist/mission5/personal-drilltruck.mjs`: reuse canonical bound for paid truck location and pose recovery; old valid farther positions no longer forcibly returned to P01.
- `tests/m5-office-patio-passability-v40.test.mjs`, `tests/m5-patio-navigation-v34.test.mjs`: update historical locked-area assertions per new user requirement.
- `tests/v57-open-terrain-and-save.test.mjs`: new regression for traversal, solid collisions, P01 ownership, finance preservation, save restoration, vehicle travel and edge probes.
- `.github/workflows/v57-open-terrain-and-night-visibility.yml`: dedicated CI to run V57 and linked V52/V56/movement regressions independently of an existing pre-V57 offline economy failure in generic tests.

No changes to mission acceptance, HSEC scoring, balance, timing, purchase pipeline, automatic M4 vehicle, existing build footprints or third-party brands. PR #76 includes these changes, user authorized implementation and release contingent on checks.
