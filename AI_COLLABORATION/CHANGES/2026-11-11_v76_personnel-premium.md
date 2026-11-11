# V76 · Personal premium, 21 candidatos ilustrados y registro de habilidades
Fecha: 2026-11-11 · ChatGPT · Rama: `chatgpt/v76-personal-roster-premium`

## Decisiones aprobadas
- Personal es pantalla independiente del catálogo y debe ser compacta, profesional, altamente visual y navegable con touch/teclado.
- 7 roles operativos con 3 candidatos cada uno (21). Selección real por candidato, costo distinto, portrait propio e ID único.
- Ficción ilustrada cel shading de 3 bandas, cascos y uniformes industriales **sin ningún logo, texto o marca**. No añadir DRILLCO®, PUMA® u otras insignias salvo autorización expresa.
- Habilidades quedan en datos para futura progresión y posibles efectos aprobados. `effectsEnabled:false` por defecto: NO cambiar ingreso de contratos, perforación, tiempos, seguridad ni salarios de turno sin reglas.
- Slots visuales se expanden por misión (M2 1, M3 5, M4 6, M5 8), derivados de roles disponibles, sin bloquear contrataciones permitidas por las reglas actuales.

## Archivos creados
- `dist/chapter/personnel-candidates-v76.mjs`: siete definiciones de rol, 21 registros id/name/gender/hireCost/skills/portrait, mapa descriptivo de skills, funciones de progreso de slots e identidad.
- `dist/assets/npc-portraits-v76/*.svg`: 21 archivos SVG individuales, con dibujos originales estilizados, uniformes sin letras/emblemas y accesorios genéricos, guardados por ID; son **primera pasada de arte 2D**, no sustituyen a GLBs.
- `dist/chapter/personnel-premium-v76.mjs`: ventana funcional renderizada con misión contextual (selecciona rol requerido al tocar), roles, tres candidatos, ficha y habilidades, contratación y equipo activo derivado de estado real, con etiquetas disponible/bloqueado/contratado.
- `dist/chapter/personnel-premium-v76.css`: responsive compacto, carrusel navegable en paisaje Android, scroll en roles, CTA y slots.
- `tests/v76-personnel-premium.test.mjs` + workflow dedicado.

## Integración funcional acotada
- `dist/mission3/personnel.mjs`: `canHire(s,role,candidateId)` valida rol y saldo por candidato, sin crear estado paralelo; `hirePersonnel` guarda `candidateId`, nombre, costo real y `skillProfile` con effects desactivados. Rutas de hire legado sin candidato continúan cobrando costo histórico.
- `dist/mission5/patio-staff.mjs`: costo variable de guardia/técnico, guardado `candidateId`, `skillProfile` y nombre en el registro de NPC de M5 existente; world rigs y posiciones NO cambian.
- `dist/hsec/catalog.mjs`: tercer ID HSEC disponible (`hsec03`), GLB existente como fallback; prevencionistas 01 y 02 intactos.
- `dist/chapter/faena-center.mjs`: sustituye sólo la vista `personnel` por la pantalla nueva, reutiliza callbacks reales, sin cajas interminables ni función de contratación duplicada.
- `dist/chapter/game.mjs`: delega exclusivamente valores `role|candidateId` para contratar M3/M5; reutiliza `selectorFeedback.play` y guardado existente.
- `dist/audio/character-select-feedback-v68.mjs`: volumen UI global configurable en localStorage [0.5,3.5], default x2; afecta tanto selección de personajes como Personal y respeta Sonido y vibración.
- `dist/index.html`: un CSS V76 al final de la cascada.

## Validaciones y límites
- CI V76 aprobó sintaxis, 21 archivos, nombres/IDs únicos, skills 1–5, ausencia de logos/textos dentro del SVG, contratación real con precios y guardados, guardia/técnico M5, slots por misión, navegación, volumen; regresiones V75, V73 y V70.
- Preview Vercel READY y módulos/estilos/portadas individuales respondieron HTTP 200.
- El arte SVG es una primera versión vectorial jugable; los retratos de alta fidelidad y su eventual traducción a 3D deben ser aprobados visualmente por el usuario. No afirmar que ya existen 21 GLB únicos.
- Faltan inspección visual en Android y validación de interacción manual antes de considerar la versión definitiva.
- No modifica economía de contratos, misiones, Cloud Save, rutas de NPC, ni maquinaria o arte de faena.
