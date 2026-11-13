# V102 · Taller técnico, upgrade protagonista y avance de construcción real

**Fecha:** 2026-11-13
**Rama:** `chatgpt/v102-workshop-dashboard-progress`

## Instrucción aprobada
1. Rediseño completo de la vista Taller del Centro de Faena, actualmente plana y sobrecargada. Mantener cabecera y navegación existentes, reorganizar en cabecera técnica, 4 KPIs, acción contextual, 2 paneles y detalles plegables.
2. CTA dorado de gran contraste **MEJORAR A NIVEL 2** con costo real de 8.000 y duración real de 05:00, usando el mismo botón de acción `data-faena-workshop-upgrade` y su flujo de confirmación original.
3. En construcción: sustituir el CTA por etiqueta de estado, barra 0–100 %, porcentaje y `MM:SS` reales calculados del job; nunca ofrecer compra duplicada. Aplica a construcción L1 de 90 s y ampliación a L2 de 300 s.
4. En el mundo: cartel breve encima del techo real del Taller, posicionado desde coordenadas de mundo `(-7.6,-9.3)`, cámara y terreno. Muestra título, progreso y restante, no intercepta controles y desaparece fuera de cámara o al terminar.
5. Trabajos, kits, compras originales de Casa Matriz, herramientas para recuperar y controles de DTH siguen accesibles. El resto del juego y sus modales no cambian.

## Implementación
- `dist/chapter/workshop-progress-v102.mjs` — proyección read-only desde `workshopL1Progress` y `workshopUpgradeProgress`, devuelve label, porcentaje y tiempo restante.
- `dist/chapter/workshop-v102-view.mjs` — marcado Taller premium con CTA original, estados verdadero y plegables.
- `dist/chapter/faena-center.mjs` — ruta Taller delegada a renderer, ticker visual 1 s únicamente con ruta visible, cleanup al cerrar/navegar, clase visual `ws102Dialog`. No edita función M3 de upgrade.
- `dist/chapter/construction-callout.mjs` — segunda etiqueta independiente de mundo, reutiliza proyección Three y actualización de render preexistentes, sin tocar proyección de oficinas.
- `dist/chapter/workshop-dashboard-v102.css`, `dist/index.html` — CSS aislado y un enlace último; evita afectar Personal/radial.
- `tests/v102-workshop-dashboard-progress.test.mjs`, `.github/workflows/v102-workshop-dashboard.yml` — regresión L1/L2, duración, precio, DOM de timer, proyección, smoke de Taller legado/Misión 4.

## Exclusiones
Ninguna alteración a `game.mjs`, `mission3/inventory.mjs`, misión, HSEC, economía, Cloud Save, saldo, boosters, precios, recompensas, ni modelos de perforadoras. No se fingen fases internas de obra no modeladas.

## QA
Verificar GitHub Actions focal + Vercel preview y después publicación a main; comprobación visual final dentro del juego aún requiere usuario en pantalla PC/móvil.
