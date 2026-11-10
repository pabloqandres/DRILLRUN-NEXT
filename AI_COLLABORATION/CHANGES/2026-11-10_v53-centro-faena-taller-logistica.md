# V53 · Centro de Faena, Patio Logístico y Taller Técnico

Fecha: 2026-11-10. Rama: `chatgpt/v53-unified-faena-workshop-logistics`.

## Problema y diseño aprobado
El usuario completó M5 con éxito, pero las interfaces operativas se encontraban
dispersas entre celular, HUD, fichas de edificios y "Zonas"/"Geología".
El Taller L1 y el Galpón del Patio parecían duplicar funciones.

## Resultado implementado
- `chapter/faena-center.mjs` / `faena-center.css`: ventana única
  premium horizontal con Producción+Zonas, Galpón Logístico, Taller,
  Flota+Patio, HSEC, Contratos y accesos contextualizados.
- El botón Operaciones del HUD abre el nuevo Centro; el resto del dock
  continúa con Catálogo, Contratos, Equipos y Personal, pero siempre enlaza
  a este mismo controlador operativo cuando corresponde.
- Seleccionar físicamente el Taller, el Galpón o sus entradas del
  Catálogo abre el mismo panel. La Bodega muestra existencias, auditoría,
  pedidos y kits. El Patio mantiene flota, portón y estacionamientos.
- El teléfono tras M4 concentra Mensajes, Centro, Casa Matriz, Pedidos
  y Patio. Antes de M4 conserva el menú completo original por compatibilidad
  de las misiones 1–3. Las páginas internas antiguas siguen funcionando.
- Producción presenta Geología y Zonas en un solo recorrido sin tener que
  cerrar ventanas para cambiar de app.
- `mission5/workshop-recovery.mjs`: el Taller recupera parcialmente
  herramientas RC/DTH agotadas y desgastadas. Reafilado de bits y
  servicio de martillos exigen kits REALES pagados (🪙600 y 🪙1.000
  más 🪙200 de despacho por orden), comprados por Casa Matriz.
  Entrega de kits de 120 s; trabajos de 90/180 s; recuperación parcial
  y límites de 2/1 ciclos por herramienta. No hay inventario gratuito.
  Se guarda el trabajo dentro de `mission5.recovery`; Cloud Save existente
  lo conserva. `finishRecoveries` es idempotente.
- Se integran V51 (eje correcto de NPC y app Patio visible) y V52
  (8 luminarias + zonas de trabajo con luz real, piscinas de luz suaves,
  focos del vehículo personal controlables, audio de motor
  procedimental y avatar/pasos ocultos al conducir).
- Sin marcas de equipos externas a DRILLCO®. M4 DrillTruck automático
  y producción, HSEC score, compras y recompensas de M1–M5 sin cambios.

## Verificaciones
- GitHub Actions V53, V52, V50, V49, V48 y M5 checklist pasan en la
  revisión de rama previa a publicar.
- Flujo de Casa Matriz, kits, espera, límites, stock persistente,
  rutas de UI y completado de M5 cuentan con tests.
- Workflow global "New game regression checks" sigue fallando en
  dos tests históricos de la economía offline M4, igual que en la
  versión base e6331c3, y no se han alterado esos cálculos.
- La vista WebGL en Android y el brillo exacto de los faros requieren
  prueba directa en dispositivo; no afirmar QA visual completado.
- Biblioteca GLB Lote 01 (PR68) no contiene binarios en el repositorio:
  **no** se integró, para evitar un catálogo que venda activos inexistentes.

## Otras reglas
No volver a duplicar pantallas de Bodega/Taller en el celular.
Taller = recuperación/servicio; Galpón = stock y despacho;
Patio = estacionamientos, flota y control de acceso.
Toda futura operación nueva debe tener una ruta única de
`FaenaCenterUI` y poder abrirse desde el edificio.
