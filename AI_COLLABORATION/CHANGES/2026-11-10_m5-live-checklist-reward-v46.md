# V46 · Checklist real M5 y bono único de Casa Matriz

Fecha: 2026-11-10. Rama: `chatgpt/m5-checklist-reward-v46`.

## Pedido aprobado
El usuario mostró la Misión 5 con tarjeta 0/5 sin instrucciones visibles.
Aprobó mostrar los cinco objetivos reales secuencialmente en HUD y teléfono,
y entregar un bono de 🪙 12.000 solo al confirmar el mensaje final de Elena.

## Alcance
- `dist/mission5/mission-readout.mjs`: lectura sin efectos secundarios de
  `mission5Objectives(s)`; numeración, etapa actual, tiempo de obra y
  recompensa. Fuente compartida para HUD y teléfono.
- `dist/chapter/game.mjs`: elimina ocultamiento del detalle M5,
  inserta las cinco casillas y preserva scroll entre refrescos de 150 ms.
  Las tarjetas M1–M4 no cambian.
- `dist/chapter/hud-reference-v4.css`: lista compacta, checks reales,
  próximo paso destacado y scroll móvil sin alterar colapso.
- `dist/mission5/patio-ui.mjs`: reemplaza las cinco pseudoetapas
  de construcción por los cinco objetivos funcionales, bloqueos,
  descripciones y bono anunciado.
- `dist/mission5/patio-staff.mjs`: orden obligatorio para nuevas acciones:
  construir → guardia → técnica → barrera HSEC → inventario.
  No revierte acciones ni contrataciones existentes al recargar partidas.
- `dist/chapter/narrative.mjs`: bono de 🪙 12.000 con ledger
  `m5CommissioningReward`, pagado solo en confirmación del SMS de cierre;
  la función devuelve monto realmente acreditado y no premios fantasmas.
- `dist/chapter/narrative-strings.mjs`: comunica el premio en los cinco idiomas.
- `tests/m5-stepwise-checklist-reward-v46.test.mjs`: objetivos, precios,
  timer, estricta secuencia, caja y ledger sin duplicidad.
- `tests/m5-staff-narrative-and-walk-v43.test.mjs`: expectativa de premio
  actualizada conforme a la nueva decisión.

## Economía y persistencia
El Patio L1 sigue costando 🪙 45.000 y demora 1.200 segundos.
Contratación: guardia 🪙 1.800, técnica 🪙 2.200. Total inversión 🪙 49.000.
La recompensa es independiente de los ingresos automáticos de M4 y no
otorga maquinaria ni inventario; la construcción y contratación siguen siendo
cargos únicos. No se modifica Cloud Save ni esquema de datos.

## Publicación y QA
Implementación en rama propuesta para PR. Sin merge a main ni deploy a producción.
Pruebas Node nuevas preparadas; no reportar un test como aprobado hasta que
GitHub Actions o runner lo haya ejecutado. Validación WebGL/Android pendiente.
