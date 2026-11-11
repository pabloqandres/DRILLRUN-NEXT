# V79 · Gestión de Equipo, habilidades y salarios propuestos
Fecha: 2026-11-11. Rama: `chatgpt/v79-personnel-career-payroll`.

## Objetivo
Extender la pestaña Personal que el usuario aprobó en V77–V78. Mantener las tres tarjetas de administración y dar un poco más de aire en pantallas grandes, con acceso real a las fichas del equipo.

## Entregado
- Seis banners SVG originales, uno para cada M1–M5 y juego libre. Sin logos ni rótulos y contrastados para textos.
- Veintiún candidatos con habilidades iniciales reducidas (1–3 de 5) y salarios sugeridos por turno entre 🪙 60 y 310, según rol y clasificación de precio. Los costos únicos de contratación no cambian.
- Pantalla «Gestionar equipo» desde la franja inferior o pulsando un trabajador. Muestra identidad e ilustración si existe, habilidades de su `skillProfile` (no sustituye partidas anteriores), nivel y puntos existentes, estado de nómina, remuneración sugerida, total propuesto del equipo y regreso a contratar.
- Slots del equipo con desplazamiento horizontal futuro; preserva tres candidatos por categoría y paisajes V78.

## Propuesta futura: un turno productivo
Cuatro ciclos DTH efectivamente completados (nominalmente 1 hora de operación) definen un turno. Cargo automático y anotación en ledger sólo al finalizar el cuarto ciclo para empleados activos; notificación única y registro de pagos. Para M3 usar gatillo a entrega del primer contrato, sin cobro repetido. No cobrar por tiempo real sin producción ni por inactividad. Probar insumos y recuperación antes de aprobar.

## Límites y riesgo
`PERSONNEL_PAYROLL_POLICY` mantiene todos los débitos desactivados. El apartado de habilidades no otorga XP ni bonos y no cambia guardados. Sin editar misiones, cash, producción DTH, Cloud Save ni mundo GLB. El usuario debe validar la interfaz Android y la economía antes de activar el sistema real de turnos.
