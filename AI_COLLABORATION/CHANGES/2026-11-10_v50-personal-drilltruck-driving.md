# V50 · Segunda unidad DrillTruck® y conducción personal

Fecha: 2026-11-10. Rama `chatgpt/v50-personal-drilltruck-driving`.

## Decisión aprobada
El usuario propuso añadir un sexto paso a la Misión 5: comprar
un segundo DrillTruck® y conducirlo. El primero sigue destinado a la DTH
automática, con todas sus rutas y recambios sin modificar.
Se acepta el uso del GLB DRILLTRUCK_optimized.glb ya proporcionado,
una vista exterior elevada y joystick con acelerador/dirección/freno,
sin cabina interior por ahora.

## Arquitectura
- `mission5/personal-drilltruck.mjs`: unidad `drilltruck-personal-02`
  totalmente independiente de `mission4.drillTruck`. Manejo con volante
  analógico, aceleración, reversa, velocidad máxima 8.3m/s (versus caminar
  2m/s), frenado y detección en cinco puntos del chasis. Posición, ángulo
  y modo persisten en la misma partida y Cloud Save.
- `mission5/fleet-base.mjs`: estacionamiento nuevo P01 en el acceso
  (-31,-20.2), independiente de C03 (servicios automáticos).
- `mission5/patio-world.mjs`: demarcación física de P01 y sensor de
  barrera que abre también al aproximarse el vehículo personal.
- `mission3/headquarters.mjs`: tipo de pedido `drillTruckPersonal`
  con costo vigente de 🪙 12.000 + despacho de 🪙 200.
  Mantiene entrega real de maquinaria a 180 segundos.
  `tickDeliveries` crea el segundo vehículo únicamente al entregarse
  un pedido pagado. Pedidos duplicados están bloqueados y restaurables.
- `mission4/phone-apps.mjs`: nueva ficha en Casa Matriz DTH con CTA
  para compra, requisitos, ETA y estado; sección DrillTruck distingue
  servicio automático (01) y personal (02).
- `mission5/patio-staff.mjs`: sexto objetivo «Recibir segundo DrillTruck®
  personal»; `commissionPatio` se activa tras su entrega.
  La recompensa previa M5 (🪙 12.000) sigue siendo una sola acreditación
  al confirmar el SMS final, sin bonificaciones por compra.
  Partidas con recompensa M5 ya cobrada conservan la misión terminada
  en vez de perder su historia/recompensa.
- `mission5/mission-readout.mjs` y `patio-ui.mjs`: avance /6 y paso
  Casa Matriz, estado de P01, sin ocultar los cinco anteriores.
- `chapter/game.mjs`: instancia visual independiente por clon del GLB
  oficial optimizado, collider propio, uso con botón de interacción o
  tocando la camioneta (modal «Ingresar»). Al subir se oculta el avatar
  y se usa cámara elevada que sigue al vehículo. Al frenar, puede
  bajarse. El joystick vertical acelera o retrocede, lateral gira.
- `dist/index.html` y CSS: botón FRENO táctil y velocímetro contextual
  solo mientras se conduce. Las barras del resto del juego siguen intactas.

## Garantías
- M4 DrillTruck automático y su lógica de mantenimiento, ruta y consumibles
  no se tocan. No se compra, mueve ni modifica esa unidad al crear la nueva.
- El nuevo vehículo no genera ganancias, no perfora ni hace recambios;
  no se entregan elementos ni monedas gratis.
- Lógica de conducción no cambia caminata, colisiones en personaje,
  edificios del patio, NPC ni save schema; campos de personalTruck son
  opt-in dentro del objeto M5 existente.
- Limitación consciente: para recorrer tramos futuros habrá que extender
  las áreas de navegación al ampliar mapas; esta versión se circunscribe
  al terreno transitable actual.

## QA
`tests/v50-personal-drilltruck-driving.test.mjs`, workflows V43/V46/V47/V49
revisados para 6 pasos y guardado. Validación gráfica WebGL Android
pendiente de verificación.
