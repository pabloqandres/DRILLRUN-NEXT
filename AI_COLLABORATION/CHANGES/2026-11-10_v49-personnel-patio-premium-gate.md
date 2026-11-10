# V49 · Personal centralizado y acabado premium del Patio L1

Fecha: 2026-11-10 · Rama: `chatgpt/v49-m5-personnel-yard-finish-gate`.

## Solicitudes
1. Trasladar la contratación del guardia y técnica de bodega a **Personal**:
   la app de Patio no aparece en home tras construir; la sección Personal
   es la fuente única de contratación.
2. Usar burdeo PUMA, quitar letreros geométricos con nombres por todo
   el patio y mejorar arquitectura, barandas, mallas, cubiertas y acabados.
3. Caseta, galpón, combustible y postes techados necesitan collider.
   Barrera con apertura por proximidad bidireccional de jugador y
   cierre tras cruzar, sin interferir con animaciones automatizadas existentes.

## Alcance implementado
- `dist/mission3/phone-apps.mjs`: tarjetas de guardia y técnica en
  Personal, costo y habilitación desde `canHirePatioStaff`, reutilizando
  `hirePatioStaff` que conserva ahorro, ledger y NPC asignado.
- `dist/chapter/phone-ui.mjs`: botón `data-hire-patio` enlazado
  al callback original de M5; no hay duplicidad de lógica.
- `dist/mission5/patio-ui.mjs`: solo gestión física, supervisión de
  accesos/inventario, estado y botón para abrir Personal. Ya no contrata.
- `dist/mission5/mission-readout.mjs`: pistas M5 pasos 2/3 apuntan a Personal.
- `dist/chapter/game.mjs`: clic interactivo en NPC lleva a Personal,
  actualiza el móvil y HUD al contratar, errores de prerequisito claros.
- `dist/mission5/patio-world.mjs`: burdeo PUMA `0x701e30`, perfiles,
  detalles de puertas/ventanas/galpón y combustible, malla metálica
  triangulada en un solo mesh eficiente, barandas y drenajes.
  Retiradas las llamadas a `w.sign` del prefab.
- `dist/mission5/gate-control.mjs`: sensor simétrico de 5.3 m
  y liberación a 6.4 m, conserva gatilladores de rutas vehículo;
  collider del brazo activo cuando está cerrado, se retira tras elevarse
  y vuelve al cerrar. Colliders reales de módulos y postes.
- Prueba `tests/v49-patio-personnel-gate-finish.test.mjs` y workflow
  `v49-patio-personnel-gate.yml`.

## Reglas preservadas
- Costos actuales de guardia 🪙 1.800 y técnica 🪙 2.200, inversión
  de patio 🪙 45.000 y premio M5 de 🪙 12.000.
- La contratación no se duplica ni crea NPC gratis; no se migra save.
- Una sola entrada física este, vehículos siguen rutas ya aprobadas
  y flota/producción DTH mantienen sus algoritmos.
- No añadir marcas externas, construir otros patios o alterar M1–M4.

## Validación
GitHub Actions y testeo de colisiones visuales en Android pendientes.
