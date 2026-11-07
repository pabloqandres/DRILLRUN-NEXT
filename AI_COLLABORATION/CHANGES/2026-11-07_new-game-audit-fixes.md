# Auditoría para nueva partida — correcciones 2026-11-07

## Alcance aplicado
- Los pedidos de maquinaria se materializan en el estado persistente ANTES de cerrar la orden; no dependen de un callback visual activo. Se repara además un pedido histórico pagado, marcado como entregado pero sin máquina presente.
- Los pedidos de herramientas PUMA DTH utilizan despacho de Casa Matriz (en lugar de aparecer instantáneamente). Inventario y costos de taller siguen gobernando la recepción.
- La Misión 1 no acredita automáticamente su recompensa al recargar si la narrativa aún está pendiente. Confirmar el cierre es idempotente (una sola transferencia) y la migración narrativa no auto-confirma guardados modernos sin mensajes.
- HSEC requiere superar el umbral y no tener riesgos críticos de seguridad antes de completar.
- El cierre inicial de automatización requiere una primera zona productiva y un ciclo de ingresos; convertir los seis sondajes queda como expansión posterior, sin bloquear la misión.
- El HUD utiliza numeración M1–M4 coherente y el menú inferior respeta la clase hidden.
- Los marcadores de sondajes leen los campos reales depthDrilled/status completed.
- Se agregaron pruebas de regresión y un workflow CI. No se cambió la cinemática: las cuatro selecciones de avatar usan el video disponible de Avatar 1.
- Office Store permanece eliminado y mobiliario de oficina L1/L2 es de fábrica.

## Límites explícitos
- El contrato de seis sondajes permanece en la ventana jugable actual de 15 minutos. Restituir las 3 horas requiere implementar y probar primero la aceleración real mediante minijuego; alargar un temporizador sin esa función sería regresivo.
- No se cambiaron las ponderaciones del score HSEC de cinco categorías; el bloqueo por riesgos críticos es la corrección de seguridad implementada. Un rebalanceo de seis categorías se trata como diseño independiente.
- Se validó sintaxis estática de los módulos editados y smoke tests de negocio desde el código fuente; no existe aquí navegador WebGL para un playthrough real. El workflow en GitHub se añadió como gate de regresión, sujeto a disponibilidad de GitHub Actions.

## Test de partida nueva
1. Elegir avatar 1–4: video de Avatar 1 y modelo seleccionado para el mundo.
2. Limpiar parcela, construir oficina L1 amoblada y utilizar PC.
3. Guardar antes de confirmar misión 1; recargar y confirmar una vez.
4. Construir HSEC hasta lograr puntuación objetivo SIN riesgos críticos.
5. Recibir recompensa HSEC; comprar perforadora RC, cerrar durante el despacho y volver.
6. Verificar materialización, martillo, bits, seis sondajes y cierre del contrato.
7. Desbloquear M4, recibir DTH y sus herramientas por Casa Matriz.
8. Poner una zona en producción, verificar un ciclo, cierre narrativo y retiro del panel.
