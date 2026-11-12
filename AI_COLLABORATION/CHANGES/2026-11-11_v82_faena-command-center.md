# V82 — Centro de Faena, interfaz real basada en la propuesta gráfica
Fecha: 2026-11-11. Rama `chatgpt/v82-faena-command-center`.

## Qué se evaluó
La portada existente mostraba 3 métricas, 6 cards planas, vínculos de Personal/Casa Matriz/Patio y un dock de 4 accesos repetidos. Tampoco distinguía Operación y Gestión. Se eliminaron de **overview** el texto introductorio largo, el dock duplicado, los accesos sueltos redundantes y el estado “Operación estable” sin evidencia. No se borraron controladores ni vistas.

## Nueva distribución
- Cabecera Centro de Faena, saldo y energía; cierre.
- Rail izquierdo: misión actual enlazada a su continuación, resumen de personal activo, pedidos despachados, nivel del taller y entrada al panel de Seguridad; botón/acción siguiente.
- Board con cuatro grandes módulos operativos: Producción y zonas, Galpón logístico, Taller técnico, Patio y flota.
- Una segunda familia visual más compacta para Contratos, Personal, Seguridad HSEC y Casa Matriz.
- Cada módulo tiene fondo WebP único, SVG dedicado, un texto y badge de estado leído de datos del juego. Entradas originales intactas. Patio M5 se alcanza desde Patio y flota.
- Landscape Android: dos columnas de operaciones y 2×2 de gestión con scroll vertical propio, rail independiente, sin panel lateral recortado.

## Activos
`dist/assets/faena-v82/{production,logistics,workshop,fleet,safety,contracts,personnel,headquarters}.webp`
(432×172; total ~116 KiB), creados de la composición minera generada en esta conversación con recortes de la escena y sin texto de botones. `dist/assets/faena-v82/icons/` contiene 14 SVG individuales de pictogramas diseñados para el centro de faena. No hay marcas externas ni fotos descargadas de terceros.

## Integración funcional
Se cambia únicamente el renderer de overview y la cabecera de FaenaCenterUI, sin alterar rutas, acciones de compra, timers de producción, contratos, dinero, personal, misiones, ahorro o autosave. La portada compara HTML y conserva DOM si no varió en refresco de 2,6 s; recursos actualizan in situ. Los subpaneles M3/M4/M5 y Personal V81 no se modifican.

## Pruebas y límites
Workflow V82 ejecuta `node --check` del renderer y tests V82, V53 y V81. No se afirma QA visual en teléfono sin revisión del usuario. M4 offline tiene dos fallos de regresión históricos previos a esta versión y no se tocan aquí.
