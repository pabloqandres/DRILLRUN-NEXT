# 2026-11-07 — Separación física de DrillTruck® y perforadoras

## Error observado
DrillTruck® atravesaba la perforadora RC en un sondaje: el recorrido de mantenimiento acababa exactamente en el centro del punto de perforación. También se mostraba la leyenda incorrecta «EXPLORA® RC» en una perforadora genérica.

## Solución
- La ruta de DrillTruck® termina en una franja de servicio al oeste (x=15 m), sin ocupar las coordenadas de los seis pozos (x>=20 m).
- Se preserva el modelo comprado, ruta ida/vuelta, fases y estados guardados.
- Se retira «EXPLORA® RC» del modelo de perforadora procedimental, ya que EXPLORA® es una herramienta de DRILLCO® y no la marca de la perforadora.
- No se modifican precios, contratos, recompensas, inventario ni datos guardados.

## Chequeo geométrico estático
Distancias mínimas desde la ruta completa hasta el punto de sondaje correspondiente (BH01..BH06): 4.98, 7.92, 10.67, 7.07, 4.47, 10.20 m. La comprobación usa segmentos 2D de la trayectoria; falta validación visual 3D con orientación del GLB, dimensiones reales y otras máquinas.
