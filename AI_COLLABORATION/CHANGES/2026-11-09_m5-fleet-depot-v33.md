# M5 · Patio L1 como base única de maquinaria (V33)

**Cambio solicitado:** al entregar M5, toda máquina libre debe quedar en un único patio; retirar estacionamientos obsoletos, mantener operación de perforadoras activas, rutas de acceso fijas y compatibilidad con M1–M4.

## Implementado

- `dist/mission5/fleet-base.mjs`: única fuente de ubicaciones de flota. DrillTruck® bajo techumbre (C03), RC/DTH a cielo abierto (D01/D02), tres espacios grandes reservados para CAEX menores y movimiento de tierras (H01–H03). No crea equipos inexistentes.
- `dist/mission5/fleet-routes.mjs`: RC y DTH sin asignación usan el mismo portón fijo en (-24,-14), con animación real hasta la bahía. La DTH asignada sigue en su zona productiva sin clon ni traslado forzado.
- `dist/chapter/game.mjs`: RC retorna después del contrato exploratorio entregado; DTH libre usa plaza abierta; DrillTruck® se traslada del estacionamiento M4 a C03 cuando L1 abre. Al inaugurar L1 desaparecen en el mundo la losa antigua del DrillTruck y los dos pads temporales RC/DTH; sus flags históricos de M4 se conservan. El acceso abre para los vehículos que se aproximan.
- `dist/mission4/truck-routes.mjs`: finalización `yard-arrived`, traslado por portón, ida/vuelta de mantenimiento desde el Patio y reanudación de traslados tras recarga.
- `dist/mission4/maintenance.mjs`: luego de M5 y traslado efectivo, la posición persistente del DrillTruck se escribe como plaza C03, nunca la ubicación temporal M4.
- `dist/mission5/patio-world.mjs`: corregidas intersecciones entre caseta, combustible, cubierta de camionetas y estacionamientos de perforadoras; se habilita acceso peatonal al patio solo cuando está operativo.
- `dist/mission5/patio-ui.mjs`: muestra las plazas realmente ocupadas y dónde está cada equipo: estacionado, en faena o en transferencia. Nunca muestra máquinas ficticias como reales.
- `dist/chapter/builder-ui.mjs`: selecciona Patio L1 automáticamente en Catálogo → Edificios al completar M4, incluyendo modo HSEC.
- `dist/chapter/construction-catalog.mjs` y `dist/mission4/phone-apps.mjs`: la ubicación principal del DrillTruck pasa a ser L1, sin eliminar los requisitos históricos de M4.
- `dist/index.html`: actualización de cliente V33 para evitar usar la versión de JS ya cacheada.
- Taller limitado a nivel 2; L3 sigue bloqueado para futuras misiones.

## Capacidad y flujo
- Patio fijo de 54 × 44 unidades; 20 min de construcción, coste 45.000 desde el balance del jugador.
- Seis plazas cubiertas ligeras, dos plazas de perforadoras a cielo abierto, tres plazas de maquinaria pesada a cielo abierto.
- Acceso principal único (−24,−14), HSEC, galpón, combustibles separados y dos terrenos de ampliación bloqueados.
- Hasta que M5 esté operativo, M4 conserva su parking y no cambia lógica/economía. Cuando L1 abre, se retiran las instalaciones temporales obsoletas sin borrar el progreso.

## Verificación
- Pruebas del motor en memoria con módulos reales: M5 cobra una vez, termina después de 1.200 s, RC pasa por portón y llega a D01, la DTH asignada permanece en BH-01, el DrillTruck llega a C03 con evento específico y regresa a C03 desde servicio.
- Pruebas de regresión agregadas en `tests/m5-fleet-depot-v33.test.mjs` y `tests/m5-return-to-yard-v33.test.mjs`.
- Sintaxis de módulos principales revisada sin errores.
- **Pendiente:** verificación de movimiento, escala de vehículos y colisiones con cámara en un navegador real (PC/móvil) y carga Cloud Save multidispositivo; el repositorio no dispone de un runner de navegador conectado a esta sesión.

## Política de compatibilidad
No reinicia partidas ni reemplaza ahorros, consumibles, producción ni contratos existentes. No acredita capital extra ni inventa compras. No introduce marcas externas.
