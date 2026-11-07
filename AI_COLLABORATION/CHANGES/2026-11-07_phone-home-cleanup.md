# 2026-11-07 — Limpieza del inicio del celular (ChatGPT + usuario)

## Decisión aprobada
El celular no duplica acciones del HUD. Se retiran del inicio la tarjeta de misión, los accesos M3/M4 de objetivos, el acceso Construir/Catálogo, DrillTruck y DTH Supply. Se conserva Mensajes, necesario para el flujo narrativo, y la gestión operativa no duplicada.

## Integración
- DTH Supply deja de ocupar un icono propio en el inicio; se accede a sus controles desde Casa Matriz mientras M4 esté activa.
- No se eliminan rutas de aplicación ni modelos; los módulos M3/M4 pueden abrirse mediante navegación existente.
- Sin cambios en compras, efectivo, ahorros, misiones, progreso, GLB, datos guardados o producción.

## Propiedad compartida
Excepción acotada solicitada por el usuario: ChatGPT modifica solo el armado de botones de inicio de `dist/chapter/phone-ui.mjs`, `dist/mission3/phone-apps.mjs` y `dist/mission4/phone-apps.mjs`. Claude conserva el resto de la lógica. PR para revisión antes de integrar a main.

## Verificación
Revisión estática de cadenas y rutas; no se ejecutaron pruebas del navegador real ni despliegue. Requiere comprobar en juego apertura de Mensajes, Casa Matriz, acceso DTH, navegación atrás y estados M1-M4.
