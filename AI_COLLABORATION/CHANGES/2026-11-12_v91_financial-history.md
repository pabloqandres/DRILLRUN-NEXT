# V91 · Historial financiero consultable y reutilizable
Fecha: 2026-11-12
Rama: chatgpt/v91-financial-history

## Solicitud
El usuario observó un saldo de aproximadamente 95.458, confirmó que podía deberse a recompensas y pidió un historial financiero central del juego para consultar y reutilizar después en otras pantallas.

## Solución
- **Lectura central** `dist/chapter/finance-ledger-v91.mjs`: función pura `financeHistory(s,{filter,limit})` y helpers `financeTitle`, `financeType`. Devuelve saldo actual de caja, banco y movimientos existentes, normalizados/ordenados y clasificados por ingresos, egresos, transferencias y eventos sin cargo. No escribe estado.
- **Precisión semántica**: `deposit`/`withdraw` son transferencias entre caja y cuenta bancaria, nunca ventas ni gastos netos. `contractAccepted` y otros asientos con 0 se muestran como eventos, no ganancias. Las cifras de resúmenes corresponden a movimientos *registrados*, no al balance contable total.
- **Limitaciones explícitas**: los guardados actuales recortan `ledger` a 100 últimos movimientos durante restore; algunas funciones antiguas descuentan sin registrar asiento. Por eso el historial **no** puede reconstruir balances históricos completos y **no** fabricará un asiento de compensación para cuadrar cifras. No cambia guarda, saldo ni cálculos.
- **Vista** `finance-view-v91.mjs` de solo lectura, HTML con balance caja, banco, ingresos y gastos registrados, lista fecha/concepto/monto, y filtros Todos/Ingresos/Gastos/Transferencias/Eventos. CSS de pantalla independiente.
- **Integración mínima**: `faena-center.mjs` añade ruta `finances`, botón «Historial financiero» en Centro de Faena y filtros internos; `game.mjs` redirige click de saldo HUD hacia `openFaena('finances')` en vez de notificación de saldo. El callback de guardado, Google Auth, Cloud Save, HSEC, Personal y misiones no cambia.
- **Futuro**: `financeHistory` puede reutilizarse después en Banco, informes de contratos y analítica sin reimplementar economía. Una segunda fase, con aprobación funcional, podría añadir registros faltantes a los gastos sin alterar transacciones existentes.

## QA
Pruebas de pureza, clasificación de transferencias, retención de 100 movimientos, historial incompleto, escape HTML y rutas reales. Regresiones V90, V86.1, V82. QA visual PC/Android pendiente al publicar.
