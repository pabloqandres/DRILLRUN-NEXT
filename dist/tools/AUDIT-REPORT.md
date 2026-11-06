# DRILL RUN NEXT GENERATION — Informe de Auditoría Integral

## A. Resumen Ejecutivo

Se realizó una auditoría completa del sistema de misiones, economía, progresión y persistencia del juego, abarcando las misiones 1 a 4.

### Problemas encontrados y corregidos

1. **Recompensa M1 fantasma (CRÍTICO)**: `showMissionComplete` mostraba "+5,000" al jugador pero `useOfficeComputer()` nunca sumaba el dinero. El jugador iniciaba M2 con 800 en vez de 5,800.
   - **Fix**: Agregado `s.cash += 5000` + ledger entry en `useOfficeComputer()` (state.mjs)
   - **Migración**: Partidas existentes con M1 completada sin reward reciben 5,000 automáticamente en `restore()`

2. **M4 completada sin limpieza visual**: Al completar M4, el panel de objetivos seguía mostrando "MISIÓN 3" y el checklist activo.
   - **Fix**: Cambiado eyebrow a "MISIÓN COMPLETADA", título a "Operación automatizada", y subtítulo HUD a "Misión 3 · Completada"

3. **DrillTruck inmóvil tras restore**: Al cargar una partida con truck despachado, el modelo GLB cargaba asíncronamente y perdía la ruta.
   - **Fix**: Tras load del GLB, se lee el estado del truck y se reinicia la ruta si corresponde (dispatch/return)

4. **Zonas atascadas en mantenimiento**: Zonas en status 'maintenance' sin truck activo quedaban bloqueadas.
   - **Fix**: En `restore()` y `tickMission4`, zonas sin truck en mantenimiento se resetean a 'idle'

5. **Cards HSEC no auto-cerradas**: La card de activos HSEC (Galpón, cercas) no se cerraba al alejarse.
   - **Fix**: Auto-dismiss a >8 unidades en el frame loop

### Problemas NO encontrados (sistema correcto)

- **Protección contra recompensas duplicadas**: Todas las misiones ya tienen guards (`!s.chapterCompletedAt`, `!h.rewarded`, `status !== 'delivered'`)
- **Persistencia de activos**: Edificios, maquinaria e inventario se conservan correctamente entre misiones
- **Sistema de pedidos**: Ciclo solicitud→despacho→entrega→inventario funciona correctamente
- **Wear system**: Degradación de herramientas con auto-reemplazo funciona
- **Offline progress**: Cálculo de producción offline es correcto

---

## B. Balance Económico Completo

### Valores ANTERIORES vs CORREGIDOS

| Misión | Recompensa anterior | Recompensa corregida | Cambio |
|--------|---------------------|---------------------|--------|
| M1 | 0 (display-only 5,000) | **5,000 (real)** | +5,000 |
| M2 | 35,000 | 35,000 | Sin cambio |
| M3 | 60,000-73,000 | 60,000-73,000 | Sin cambio |
| M4 | Producción continua | Producción continua | Sin cambio |

### Balance por misión (escenario Normal)

| Misión | Inicio | Gastos | Recompensa | Final |
|--------|--------|--------|------------|-------|
| M1 | 5,000 | -4,200 | +5,000 | 5,800 |
| M2 | 5,800 (+10,500 grant) | -6,718 | +35,000 | 44,582 |
| M3 | 44,582 | -19,010 | +65,000 | 90,572 |
| M4 | 90,572 | -53,800 | (producción) | 36,772 |

### Margen económico

- Post-M1: 5,800 (86% del costo neto de M2)
- Post-M2: 44,582 (235% del costo de M3)
- Post-M3: 90,572 (168% del costo de M4)
- Post-M4: 36,772 + ingresos automáticos

### Viabilidad en 3 escenarios

| Escenario | Viable | Saldo final M4 |
|-----------|--------|----------------|
| Eficiente | ✓ | 47,238 |
| Normal | ✓ | 36,772 |
| Con errores | ✓ | 26,456 |

---

## C. Arquitectura del Sistema

### Archivos modificados

1. `dist/chapter/state.mjs` — Recompensa M1, migración M1 reward recovery, fix zonas atascadas
2. `dist/chapter/game.mjs` — M4 completion UI, DrillTruck restore, auto-dismiss cards HSEC, mission subtitles

### Archivos nuevos

1. `dist/chapter/mission-progression.mjs` — Sistema centralizado de progresión
   - Registry de misiones con checks de prerequisitos, activación y completación
   - Guards de transición y validación de rewards
   - Funciones de restore validation
   
2. `dist/tools/economy-simulator.mjs` — Simulador económico
   - Usa precios reales del juego
   - 3 escenarios: eficiente, normal, con errores
   - Detecta bloqueos de progresión
   
3. `dist/tools/progression-test.mjs` — Suite de pruebas (29 tests)
   - Viabilidad económica por escenario
   - Márgenes de seguridad
   - Consistencia de costos
   - Detección de regresiones

---

## D. Motor Reutilizable de Contratos

El sistema actual de contratos (`contracts.mjs`) ya funciona como motor reutilizable:

```javascript
CONTRACT_TEMPLATES = [{
  id: 'first-contract',
  type: 'exploration',
  totalMeters: 180,
  boreholeCount: 6,
  duration: 900,
  reward: 60000,
  bonusUnderBudget: 8000,
  bonusSpeed: 5000,
  requirements: ['admin','geoAnalysis','drill']
}]
```

Para agregar un nuevo contrato, agregar una entrada al array con parámetros diferentes (más metros, más profundidad, mayor recompensa).

---

## E. Guía de Ampliación — Cómo agregar una nueva misión

### 1. Crear el state machine

Archivo: `dist/missionN/missionN-state.mjs`

```javascript
export const PHASES = ['inactive','briefing',...,'complete'];

export function canStartMissionN(s) {
  return s.missionPrev?.phase === 'complete';
}

export function startMissionN(s, now) {
  s.missionN = { phase: 'briefing', startedAt: now, ... };
}

export function missionNObjectives(s) { ... }
export function updateMissionNPhase(s) { ... }
```

### 2. Agregar al estado inicial

En `state.mjs` → `newGame()`:
```javascript
missionN: null
```

En `restore()`:
```javascript
s.missionN = s.missionN || null;
```

### 3. Registrar en mission-progression.mjs

Agregar entrada al array `MISSIONS`:
```javascript
{
  id: 'mN',
  code: 'missionN',
  name: 'Nombre de la misión',
  narrativeIndex: N,
  startCheck: s => s.missionPrev?.phase === 'complete',
  activeCheck: s => s.missionN && s.missionN.phase !== 'inactive' && s.missionN.phase !== 'complete',
  completeCheck: s => s.missionN?.phase === 'complete',
  reward: AMOUNT,
  rewardKey: 'missionNReward',
  ...
}
```

### 4. Agregar al simulador económico

En `economy-simulator.mjs`:
- Agregar constantes de costos
- Agregar función `simulateMissionN()`
- Incluir en `runSimulation()`

### 5. Agregar transición en game.mjs

En el frame loop, después de la transición de la misión anterior:
```javascript
if(canStartMissionN(s) && (!s.missionN || s.missionN.phase === 'inactive')) {
  startMissionN(s);
  notices.push({title: 'Misión N desbloqueada'});
  save();
}
```

### 6. Ejecutar pruebas

```bash
node dist/tools/progression-test.mjs
```

### 7. Checklist de verificación

- [ ] Partida nueva → completar M1→MN sin intervención manual
- [ ] Guardar y cargar durante cada misión
- [ ] Verificar que recompensas se dan una sola vez
- [ ] Verificar que activos permanentes se conservan
- [ ] Verificar que elementos temporales se limpian
- [ ] Ejecutar simulador económico con nuevos precios

---

## F. Riesgos Residuales

1. **M1 "no puede costear durante la misión"**: El jugador tiene 5,000 pero gasta 4,200 antes de recibir la recompensa. Si intenta comprar algo extra antes de completar M1, podría quedarse sin dinero. Esto es intencional (dificultad media) pero vale monitorearlo.

2. **Workshop Nv.2 necesario para M2→M3**: HSEC ya requiere oficina L2 para completarse, así que esto es redundante en `canStartMission3`. Pero si se cambiara HSEC para no requerir L2, la transición se bloquearía sin aviso claro.

3. **Precios del simulador son constantes duplicadas**: Si se cambia un precio en el juego pero no en el simulador, el test no detectará la inconsistencia. Idealmente el simulador debería importar directamente los módulos del juego, pero esto requiere polyfills de Three.js para Node.

---

## G. Pruebas Ejecutadas

### Resultados: 29/29 aprobadas

| Categoría | Tests | Resultado |
|-----------|-------|-----------|
| Viabilidad económica | 3 | ✓ |
| Progresión M1→M4 | 5 | ✓ |
| Recompensas | 4 | ✓ |
| Margen económico | 3 | ✓ |
| Balance (no exceso) | 2 | ✓ |
| Safety nets | 4 | ✓ |
| Consistencia de costos | 6 | ✓ |
| Detección de regresiones | 2 | ✓ |

### Limitaciones

- Las pruebas validan la economía y la lógica de progresión, no la renderización 3D ni la interacción DOM
- La carga/restauración de partidas se valida a través de la migración en `restore()`, no mediante pruebas de serialización completas
- El DrillTruck y las animaciones de ruta requieren validación manual en el navegador

---

## H. Resumen Final

| Aspecto | Estado |
|---------|--------|
| Recompensa M1 | ✓ Corregida (5,000 reales) |
| Economía viable M1→M4 | ✓ 3 escenarios probados |
| Protección duplicación | ✓ Ya existía, verificada |
| Persistencia activos | ✓ Funciona correctamente |
| Limpieza estados temporales | ✓ Zonas atascadas corregidas |
| DrillTruck en restore | ✓ Re-inicializa rutas |
| M4 completion UI | ✓ Muestra "Completada" |
| Cards auto-dismiss | ✓ Incluyendo HSEC |
| Simulador económico | ✓ Implementado y ejecutable |
| Pruebas automatizadas | ✓ 29/29 aprobadas |
| Compatibilidad saves | ✓ Migración M1 reward |
| Guía de ampliación | ✓ Documentada |
