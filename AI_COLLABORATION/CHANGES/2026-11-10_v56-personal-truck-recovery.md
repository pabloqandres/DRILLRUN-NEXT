# V56 · Recuperación del DrillTruck® personal 02

Fecha 2026-11-10. Motivo: jugador completó M5 y había conducido el vehículo, pero luego informó que la unidad personal desapareció y no tiene forma de localizarla.

## Diagnóstico en código
- La existencia persistente depende de `s.mission5.personalTruck`, pero la representación 3D estaba sujeta a una dependencia visual diferente: `if(!m4DrillTruckModel)return` dentro de `syncPersonalTruckVisual()`. Un retraso/fallo de carga del GLB de M4 deja invisible el vehículo personal aunque exista en save.
- El Centro de Faena mostraba el estado de flota, pero no tenía botón de localización ni regreso a estacionamiento P01.
- En Cloud/Local Save, una M5 ya comisionada y cobrada permite constatar que la unidad 02 se recibió. No se debe duplicar ni cobrar nuevamente.

## V56 implementado
1. `game.mjs`: visual de unidad 02 independiente del M4 GLB: vehículo provisional si el modelo original aún se carga y sustitución por el GLB DRILLCO® oficial cuando queda disponible. Su collider propio se crea una sola vez.
2. `personal-drilltruck.mjs`: `restoreMissingPersonalTruck` solo reconstruye unidad si la M5 está operativa, comisionada, tiene bonificación final cobrada y la unidad falta (idempotente). El pedido entregado también puede rehabilitarla mediante la conciliación previa de Casa Matriz. No modifica caja, ledger, stock ni recompensa.
3. `repairPersonalTruckPose`: si coordenadas guardadas son inválidas/fuera de la zona jugable se repara la posición a P01 una vez en restore/inicio, conservando posiciones válidas del mundo.
4. `recoverPersonalTruckToBay`: servicio explícito al jugador con mismo objeto, misma propiedad, sin costo, sin duplicación, sin recuento de misión, solo detenido. Cuando hay un conductor en la unidad al confirmar, lo deja en un punto contiguo seguro.
5. Centro de Faena → Patio y flota / detalle Patio: botones **Localizar unidad 02** (cámara temporal de 10 segundos, sin teleport) y **Recuperar en plaza P01 · sin costo**. La camioneta siempre conserva la propiedad real en el guardado.
6. Tests V56 + suites V50-V55 y M5; el CI global M4 puede seguir fallando dos tests históricos de offline no relacionados.

## Reglas
No auto-crear camionetas para un usuario que no las pagó o no acreditó el cierre M5. No resetear la campaña. No introducir marcas de maquinaria de terceros. No usar el DrillTruck de mantenimiento M4 como reemplazo de propiedad del 02; compartir únicamente el modelo gráfico.
