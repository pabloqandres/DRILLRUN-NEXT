# V38 · Taller: tarjeta de estado funcional, legible y responsive

## Problema
La captura Android mostraba una ficha de taller angosta, textos RC/DTH intercalados y un gran botón naranja encima de las máquinas. La ficha mezclaba resumen, inventario y mantenimiento en una sola columna con reglas CSS viejas.

## Cambio
- `dist/chapter/workshop-card-view.mjs` contiene un render de estado **read-only**, basado exclusivamente en los datos actuales: ocupación, espacios, stock de bits y martillos (solo nuevos o usables), material usado de M8, RC, DTH y trabajo en curso.
- Estados RC/DTH en filas propias; zona activa, patio o servicio requerido, sin datos ficticios.
- «Instalar / reponer herramientas» solo cuando faltan consumibles o se solicitó servicio; en estado normal se muestran «Ver stock» y «Gestionar herramientas».
- «Máximo habilitado actualmente Nv.2» sin opción de comprar nivel 3.
- `dist/chapter/workshop-card-v37.css` se carga al final de la cascada y V38 añade para Android horizontal un layout de capacidad e inventario lado a lado, maquinaria en filas separadas, cabecera y botones fijos, centro desplazable, sin recortes ni solapes.
- `dist/chapter/game.mjs` mantiene los controladores existentes: stock, gestión DTH, confirmación de mejora y aceleradores. La lectura conserva el scroll interno y la tarjeta tiene título accesible.
- `dist/index.html`: cache bust de CSS ?v=38 y JS V38.
- `tests/workshop-card-v38.test.mjs`: valida 8/14 (57%), 6 espacios, 4 bits disponibles, 2 martillos, 1 descarte, estado M4, ausencia/presencia de CTA según necesidad, M3, no mutación y carga de hoja de estilos.

## Seguridad de partida
No cambian M1–M5, Cloud Save, dinero, inventario, desgaste, operación del DrillTruck ni lógica de taller; solo lectura, presentación y navegación hacia pantallas ya existentes.

## Verificación
Se evaluaron las funciones reales de estado/render en memoria para M4 sano, servicio solicitado y sin M4. Aprobados stock, estados, CTA contextual, lectura sin cambios de estado, enlaces a hoja CSS, sintaxis JS y versión.
**Pendiente** comprobar visualmente en navegador del usuario (Android en paisaje), dado que el conector no expone un navegador gráfico de la partida.
