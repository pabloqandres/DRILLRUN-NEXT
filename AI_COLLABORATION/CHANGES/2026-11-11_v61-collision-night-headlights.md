# V61 — Antiatrapamiento de DrillTruck® 02 y luz nocturna real

## Evidencia
Captura Android: camioneta personal 02 queda superpuesta con la baranda amarilla de acceso junto a instalaciones, sin poder avanzar. Usuario añade «las luces del patio aún no funcionan, DrillTruck no ilumina el camino».

## Causas comprobadas en fuente
- `drivePersonalTruck`: contorno comprobado con nueve puntos únicamente en origen/destino, permitiendo saltar una baranda de 13 cm cuando el vehículo avanza ~0,66 m entre fotogramas a 30 km/h.
- `personal-drilltruck-headlights.mjs`: solo SpotLight de orientación local GLB y sin proyección visual sobre el suelo. Luces figuraban encendidas mientras el recorrido podía permanecer completamente oscuro.
- `patio-world.mjs`: ocho postes dinámicos y seis piscinas de luz, pero solo los más próximos se encendían realmente; halos de suelo de baja opacidad, insuficientes para observar toda la zona.

## Reparaciones
1. `dist/animation/personal-truck-swept-collision.mjs`: contorno ampliado a 21 puntos con barrido de máximo 12cm por paso y verificación del movimiento original y deslizamiento por ejes.
2. `dist/mission5/personal-drilltruck.mjs`: integra la detección continua solo en conducción personal; velocidad, precios, joystick, dirección y restores intactos. Permite retroceder para salir de una superposición previa sin atravesar nuevas barreras.
3. `dist/graphics/personal-drilltruck-headlights.mjs`: luz SpotLight más baja y un proyector cálido sobre superficie real del terreno, con geometría adaptada en tiempo real al heading y pendiente (decal de bajo costo, sin sombras ni compras).
4. `dist/chapter/game.mjs`: integra proyector visual ligado al GLB; al apagar faros desaparece y se elimina completamente al desmontar modelo. Sin modificar loop de misión.
5. `dist/mission5/patio-world.mjs`: iluminación nocturna reforzada de postes, techumbres, herramientas, patios de maquinaria y vías centrales; halos de alta visibilidad y bajo presupuesto para Android.
6. Tests V52/V59 adaptados, nuevos tests V61 de baranda fina, marcha atrás, conducción libre, faros y Patio; CI propia.

## Restricciones
No alterar M1–M5, HSEC score, precio de DrillTruck®, inventario, estado de nube, producción automática M4, avatares, botonería ni marcas de terceros. Corrección autorizada como continuidad de «Hazlo todo» V59–V60, registrada en DECISIONS. No afirmar QA real WebGL/Android sin comprobar.

## Validación
Estado de CI y PR se agregará después de ejecución. No se considera solución gráfica aprobada hasta el test visual del usuario en Android.
