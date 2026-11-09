# Misión 5 — Patio seguro de maquinaria y equipos (propuesta, NO IMPLEMENTADA)

**Contexto:** M4 pasa de exploración RC a producción DTH. Hasta que exista M5, las perforadoras conservan la propiedad y se ven en dos plazas de resguardo temporal, sin vallado ni puntuación HSEC ficticia. Esas plazas NO cuentan como patio seguro completado.

## Qué debe construir el jugador
Un **único pack de edificio/infraestructura** llamado Patio de Maquinaria DRILL RUN, huella orientativa 18 × 14 m o más según tamaño real de RC/DTH/DrillTruck; sin muebles ni props sueltos dentro del pack. Edificio exterior abierto con pisos compactados, portón operativo, cierre perimetral real, zonas de tránsito segregado, estacionamientos equipados y drenaje. No vender ningún equipo de terceros bajo marca DRILLCO®. Color de seguridad y señalética del mundo DRILLCO®.

## Misiones de 5 pasos, estrictamente lineales
1. **Reservar y preparar área:** comprobar espacio disponible real y acceso vial; elegir huella, pagar coste de nivel 1 y confirmar holograma de construcción (sin construcción instantánea).
2. **Construir superficie y acceso:** temporizador y tarjeta vinculada a la obra; accesos y maniobras reales, collider seguro; se exige conectividad vehicular y peatonal con HSEC.
3. **Cerrar perímetro:** instalar reja, portón y acceso delimitado. Deben existir y mantener estado funcional, no objetos inventados con puntaje por cantidad.
4. **Seguridad operativa:** conectar postes de iluminación funcional y señalética; validar cobertura y cruces; NPC/peatones con ruta segura.
5. **Guardar y preparar equipos:** mover RC de resguardo temporal a plaza definitiva, reservar plaza para DTH cuando regrese de zona y para DrillTruck en mantenimiento. Check de inventario realmente persistido y confirmación final.

## Persistencia y representación
- Introducir entidad de patio en la misión 5 y plazas de parking declarativas con `equipmentId`, `status`, `position`; no borrar `s.drill` ni `s.mission4.productionDrill`.
- Un equipo no se teletransporta al patio si está produciendo; primero debe parar/retornar y liberar su zona.
- Mantener RC/DTH y martillos/bits como inventarios distintos; herramientas instaladas via `installedHammer/installedBit`, equipo estacionado via plaza.
- El patio NO genera ingresos por sí solo; desbloquea almacenamiento seguro, mantenimiento, stock/rotación y eventualmente capacidad de maquinaria.
- HSEC se valida por conectividad, accesos, cobertura de luz y segregación, no número de postes.
- Temporizador/boosters deben consumir un recurso real (sin aceleradores infinitos).
- Prediseñado por nivel y con vistas reales del modelo construido, nunca miniaturas irreales.

## No hacer ahora
No conectar esta propuesta con `mission4Objectives()`, no adelantar M5 al estado de los jugadores, no construir automáticamente cercas o luminarias, no cobrar una construcción futura hasta que se apruebe la misión, geometría y costos.
