# MISIÓN 03 — TU PRIMER CONTRATO
## Arquitectura V2 Consolidada

**Fecha:** 3 de noviembre de 2026
**Base:** Segunda Instrucción a Claude Code + Auditoría de código
**Estado:** Pendiente de validación

---

## ÍNDICE

1. [Diagnóstico actualizado del código](#1-diagnóstico-actualizado)
2. [Correcciones respecto de la propuesta V1](#2-correcciones-vs-v1)
3. [Arquitectura funcional completa](#3-arquitectura-funcional)
4. [Esquemas de datos](#4-esquemas-de-datos)
5. [Dependencias entre sistemas](#5-dependencias)
6. [Archivos existentes reutilizables](#6-archivos-reutilizables)
7. [Módulos nuevos](#7-módulos-nuevos)
8. [Inventario de assets](#8-inventario-de-assets)
9. [Propuesta de ampliación del terreno](#9-ampliación-del-terreno)
10. [Reglas de temporizadores, progreso offline y minijuego](#10-temporizadores-y-progreso)
11. [Plan de implementación por etapas](#11-plan-de-implementación)
12. [Criterios de pruebas y aceptación](#12-criterios-de-prueba)
13. [Riesgos, preguntas y decisiones pendientes](#13-riesgos-y-decisiones)

---

## 1. DIAGNÓSTICO ACTUALIZADO

### 1.1 Estado actual del código

| Sistema | Archivo principal | Estado | Notas |
|---|---|---|---|
| Oficina L1-L2 | `assets3d/office-shell.mjs` (132 lín), `office-layout.mjs` (40 lín) | Funcional | L3 declarado en `module-catalog.mjs` línea 13 como placeholder (`price: null, capacity: null`) |
| Galpón | `hsec/shed-model.mjs` (100 lín), `hsec/catalog.mjs` lín 7 | Funcional | 6×4.8 m, capacidad 40, posición fija (6, −4). Interior con estanterías, banco de trabajo, contenedores. |
| Empleados HSEC | `hsec/catalog.mjs` lín 24, `hsec/state.mjs` lín 58-79 | Funcional | 2 empleados (hsec01 hombre, hsec02 mujer). Contratación requiere oficina L2, 350 cr. Un solo empleado simultáneo. |
| NPC IA | `hsec/state.mjs` lín 64-79 | Funcional | Estados: idle, walking, inspecting, maintaining, blocked, resting. A* pathfinding sobre red peatonal. Tareas: patrol, inspection, maintenance. |
| Avatares jugador | `chapter/avatars.mjs` (8 lín) | Funcional | 4 operadores: operator01 (negociador +4% ingresos), operator02 (mecánico −4% mantención), operator03 (analista −5% geología), operator04 (constructor −5% construcción). |
| Guardado | `chapter/state.mjs` lín 6 | Funcional | Schema v5 `modular-1`. localStorage clave `drillrun-chapter-01-v5` + Firebase Firestore. |
| Economía | `chapter/config.mjs`, `state.mjs` lín 50-54 | Funcional | Cash 5000 inicial + banco. Ledger con historial. HSEC grant 10500. |
| Misión 1 | `chapter/state.mjs` lín 96 | Completa | 5 pasos: limpiar → construir oficina → entrar → equipar → usar computadora. |
| Misión 2 | `hsec/state.mjs` lín 56-86 | Completa | 5 pasos: oficina L2 → galpón → caminos → iluminación/extintores → 80 pts HSEC. Recompensa: 35000 cr + 1 acelerador. |
| Teléfono/Computadora | `chapter/phone-ui.mjs` (51 lín) | Funcional | Apps: Home, Mensajes, Banco, Tienda, Inventario, Objetivos. |
| Cámara | `camera/follow-camera.mjs`, `camera/config.mjs` | Funcional | Presets A/B/C (4-6 m), builder mode (cenital 78°, hasta 22 m zoom). |
| Terreno | `graphics/desert.mjs` | Funcional | 240×240 unidades, 96×96 segmentos. Zona plana interior: x[−13,16], z[−13,9]. Relief fuera con noise. |
| 3D assets HSEC | `hsec/world.mjs` (~340 lín) | Funcional | 14 tipos construibles + 9 futuros. Road decal canvas, colliders, luces, glow. |

### 1.2 Límites del mundo actual

```
Límites duros (isBlocked):  x: [-18, +20]  z: [-16, +14]  = 38 × 30 m
Zona capítulo restringida:  x: [-13, +3]   z: [-6, +9]    = 16 × 15 m
Terreno plano (reliefHeight=0): x: [-13, +16]  z: [-13, +9]
```

**Posiciones de edificios existentes:**

| Edificio | Posición (x, z) | Dimensiones | Acceso |
|---|---|---|---|
| Oficina | (−6, 0) | 6.6 × 3.0 m | (−7.99, 2.8) |
| Galpón HSEC | (6, −4) | 6 × 4.8 m | (3.8, −1.05) |
| Rig (perforación) | (6, −4.6) | 7.8 × 7.5 m | (5.8, −0.2) |
| Taller | (−7.6, −9.3) | 8.3 × 6.3 m | (−6.8, −5.4) |
| Depósito | (14, −9) | 5 × 5.6 m | (13, −5.5) |
| Suministros | (10, 3.6) | 4 × 2.3 m | (9.8, 5.1) |

### 1.3 Minijuego Drill Run — Localizado

**Ubicación confirmada:** `/Volumes/DRILLCO 23/00_A DRILLCO/DRILLCO 2023/000A_AI PRUEBAS/DRILLRUN_NEXT/`

**Versión secundaria:** `/Volumes/DRILLCO 23/00_A DRILLCO/DRILLCO 2023/000A_AI PRUEBAS/DRILLCO GAME/`

Ambas versiones tienen mecánica idéntica. Es un juego HTML5 independiente (vanilla JS, sin Three.js).

**Mecánica actual del minijuego:**

| Parámetro | Valor |
|---|---|
| Profundidad máx | 37.000 px → escalado a 150 m display |
| Taps para completar | ~60 taps precisos |
| Sistema de calor | 8% por tap, enfriamiento pasivo 0.15/frame, overheat a 100% |
| Mini-juego enfriamiento | Aguja móvil con zonas roja/amarilla/verde (precisión) |
| Capas de roca | 37 capas: entry(1) + soft(10) + medium(10) + hard(10) + copper(6) |
| Fricción por capa | soft: 1.0, medium: 0.8, hard: 0.6, copper: 0.4 |
| Turbo boost | Coleccionable, ×1.8 velocidad por 4 seg |
| Boss | 5 golpes en zonas aleatorias al llegar al fondo |
| Score | Tiempo total (segundos, menor es mejor) |
| Firebase | Leaderboard en Firestore, soporta guest + auth |
| Archivos clave | `game.html`, `js/game.js`, `js/leaderboard.js`, `js/visuals.js` |
| Audio | `backgroundmusicgameplay.wav`, `startcountdown.wav`, `finalbattle.wav` |
| Personajes | Paula y Gaspar (selección previa) |

**El minijuego NO comparte arquitectura con THE DRILL RUN NEXT GENERATION.** Son proyectos separados sin código compartido.

### 1.4 Catálogos DRILLCO disponibles

| Catálogo | Archivo | Contenido clave |
|---|---|---|
| EXPLORA V3 | `Drillco_Catálogo ExploraV3.pdf` (11 MB) | Martillos EXPLORA 4.0, 4.5, 5.0, 5.1. Bits con 7 perfiles de agua. Matriz roca/herramienta. |
| DTH Bits 2025 | `Drillco_ Catálogo DTH Bits 2025.pdf` (5.4 MB) | Bits de 2" a 12". 4 tipos de inserto (domo, cara plana, balístico, cónico). 6 configuraciones de cuerpo. |
| DTH Hammers | `Drillco_ Catalogue DTH HAMMERS 2025.pdf` (17 MB) | Martillos DTH serie PUMA. |
| TopHammer | `CATALOGO TOPHAMMER 2025.pdf` (12 MB) | Equipos de perforación tophammer. |
| PUMEX | `CATALOGO PUMEX ESPAÑOL 2026.pdf` (11 MB) | Línea PUMEX completa. |

---

## 2. CORRECCIONES VS V1

### Corrección 01 — Sistema de Personal
**V1:** Extender NPC existente con más estados.
**V2:** Crear módulo PERSONAL completo con ficha por trabajador, roles diferenciados (Prevencionista, Administrador, Operador, Técnico visitante), y escalabilidad. Un empleado HSEC ya contratado en M2 debe conservarse.

### Corrección 02 — Análisis Geológico
**V1:** No contemplado.
**V2:** Sistema completo: solicitar técnico DRILLCO® → temporizador análisis (60-90 seg persistente) → informe geológico visual con datos suficientes para decidir (sin revelar respuesta directa). Acelerador de conocimiento reutilizable.

### Corrección 03 — Selección de Perforadoras
**V1:** Una sola perforadora genérica.
**V2:** Dos perforadoras con ventajas/limitaciones distintas. Compatibilidad técnica con martillos/bits. Comparador visual antes de comprar.

### Corrección 04 — Casa Matriz y Despacho
**V1:** Compra inmediata de herramientas.
**V2:** Proceso logístico: solicitar desde computadora → pedido registrado → temporizador despacho → llegada visual de vehículo → descarga → inventario actualizado. Sin marcas externas en vehículos.

### Corrección 05 — Minijuego Drill Run
**V1:** Desarrollar minijuego nuevo desde cero.
**V2:** Localizado el minijuego existente en `DRILLRUN_NEXT/`. Evaluar integración como iframe/módulo embebido. NO crear uno nuevo hasta confirmar estrategia de integración.

### Corrección 06 — Progreso Offline
**V1:** Límite de 8 horas offline, pausas por desgaste.
**V2:** Si el contrato tiene recursos suficientes, debe completarse en su tiempo programado (ej: 3 horas reales) sin límite artificial. Reconciliar estado al volver. Protección contra duplicaciones.

### Corrección 07 — Desgaste
**V1:** Durabilidades fijas (80-150 m bits, 400-600 m martillos).
**V2:** Sistema configurable por modelo/tipo de roca/dureza/abrasividad. Valores marcados como PROVISIONALES DE BALANCE. Herramientas agotadas → inventario de materiales usados (futuro reciclaje).

### Corrección 08 — Múltiples Sondajes
**V1:** Zona fija al este del galpón.
**V2:** 6 puntos distribuidos por sector ampliado. Perforadora se desplaza entre puntos con transición visual. Cada sondaje con datos independientes.

### Corrección 09 — Expansión del Mundo
**V1:** No contemplada.
**V2:** Prever ampliación horizontal, sectores geológicos, terreno modificable futuro, bancos y taludes. Primera implementación: mapa suficiente + posiciones persistentes + sistema de sectores.

### Corrección 10 — DrillTruck®
**V1:** No contemplado.
**V2:** No implementar en M3. Solo garantizar que la arquitectura no bloquee su incorporación futura como vehículo operativo de manipulación de componentes.

---

## 3. ARQUITECTURA FUNCIONAL

### 3.1 Secuencia de la Misión 3

```
MISIÓN 03 — TU PRIMER CONTRATO (5 objetivos, con checklists internas)

┌─ Obj 1: PREPARA TU EMPRESA
│   ├── Ampliar oficina a L3 (tercer puesto)
│   ├── Habilitar taller (evolución del galpón)
│   ├── Contratar administrador de contrato
│   └── Gestionar panel PERSONAL
│
├─ Obj 2: CONOCE TU TERRENO
│   ├── Aceptar contrato de exploración
│   ├── Solicitar técnico DRILLCO®
│   ├── Observar inspección en terreno
│   ├── Esperar análisis (temporizador persistente)
│   └── Revisar informe geológico
│
├─ Obj 3: EQUIPA TU OPERACIÓN
│   ├── Comparar perforadoras (2 opciones)
│   ├── Comprar perforadora
│   ├── Contratar operador
│   ├── Seleccionar productos EXPLORA® compatibles
│   ├── Solicitar a Casa Matriz
│   ├── Esperar despacho
│   └── Verificar inventario en taller
│
├─ Obj 4: EJECUTA LA EXPLORACIÓN
│   ├── Instalar perforadora en primer sondaje
│   ├── Iniciar perforación (avance automático)
│   ├── Jugar DRILL RUN (opcional, acelera)
│   ├── Gestionar consumo de bits/martillos
│   ├── Completar 6 sondajes (360 m total)
│   └── Registrar materiales usados
│
└─ Obj 5: ENTREGA TU CONTRATO
    ├── Validar metros perforados
    ├── Generar informe final
    ├── Completar contrato
    ├── Recibir pago
    └── Desbloquear siguiente etapa
```

### 3.2 Sistemas principales

#### A. PERSONAL (`personal.mjs` — NUEVO)

Módulo de gestión de trabajadores accesible desde el teléfono/computadora.

**Ficha de trabajador:**
- Avatar/retrato (generado desde modelo 3D, como ya se hace con retratos HSEC)
- Nombre, cargo, especialidad
- Habilidades (array de strings)
- Nivel de experiencia (1-5)
- Estado actual (disponible, trabajando, en terreno, operando, descansando)
- Lugar de trabajo / asignación
- Costo de contratación
- Costo recurrente (preparado, no activado en M3)

**Roles iniciales:**

| Rol | ID | Requisito | Costo | GLB | Modelo 3D |
|---|---|---|---|---|---|
| Prevencionista HSEC | `hsec01` / `hsec02` | Oficina L2 | 350 | `hsec-npc1.glb` / `hsec-npc2.glb` | EXISTENTE |
| Administrador contrato | `admin01` | Taller + puesto L3 | ~800 | Reutilizar rig existente | MODIFICACIÓN |
| Operador perforadora | `driller01` | Perforadora adquirida | ~600 | Reutilizar rig existente | MODIFICACIÓN |
| Técnico DRILLCO® | `techDrillco` | Solicitud activa | 0 (visita) | Reutilizar rig existente | MODIFICACIÓN |

**Empleado HSEC existente:** Si `s.hsec.employee` existe al iniciar M3, se migra al sistema PERSONAL automáticamente, conservando su ID, estado y posición.

#### B. OFICINA L3 (`office-shell.mjs` + `module-catalog.mjs` — MODIFICACIÓN)

Ampliar el módulo existente para 3 puestos de trabajo.

**Cambios arquitectónicos:**
- Extender el ancho de la oficina de 6.0 m a ~7.8 m (agregar sección lateral)
- Mantener acceso por la misma puerta
- Tercer puesto: estación de planificación/logística
- Reorganizar mobiliario interior sin romper L2
- Ajustar `officeGround()`, `officeBlocked()`, y colisiones
- Actualizar walkSurface pad correspondiente
- Nuevo precio: ~2500 cr upgrade

**Constraints:**
- No cambiar posición de la oficina (−6, 0)
- No romper saves existentes (L2 → L3 upgrade)
- No alterar apariencia exterior drásticamente (misma identidad visual)

#### C. TALLER (evolución del galpón — `shed-model.mjs` MODIFICACIÓN)

El galpón existente evoluciona a taller operativo al completar el Objetivo 1.

**Funciones nuevas:**
- Almacenamiento de herramientas (bits, martillos, componentes)
- Recepción de pedidos (zona de descarga)
- Preparación de componentes
- Inventario visual
- Apoyo a operaciones

**Implementación:**
- Agregar `shed.level` al estado (level 1 = galpón M2, level 2 = taller M3)
- Interior level 2: más estanterías, zona de herramientas, tablero de inventario
- Exterior level 2: zona de descarga marcada con señalización
- No crear otro galpón separado
- Mantener posición fija (6, −4)
- Compatibilidad total con saves existentes

#### D. CONTRATOS (`contracts.mjs` — NUEVO)

Sistema de contratos de exploración.

**Contrato de ejemplo M3:**
- Tipo: exploración
- 6 puntos de sondaje
- 60 m por punto
- 360 m acumulados
- Duración automática: 3 horas reales (10.800 seg)
- Recompensa: ~45.000 cr (PROVISIONAL)

#### E. ANÁLISIS GEOLÓGICO (`geology.mjs` — NUEVO)

**Flujo:**
1. Jugador solicita análisis desde computadora
2. Técnico DRILLCO® aparece caminando con maletín
3. Se dirige a zona de exploración
4. Animación de inspección/muestreo (~15 seg)
5. Inicia temporizador de análisis (60-90 seg, persistente)
6. Notificación al completar
7. Informe geológico accesible desde computadora

**Informe geológico:**
- Sector identificado con nombre y coordenadas
- Tipo(s) de roca: ej. "Andesita con intercalaciones de toba"
- Dureza: escala 1-10 (referencia Mohs simplificada)
- Abrasividad: baja / media / alta / muy alta
- Profundidad objetivo: 60 m por punto
- Estratos: representación visual (columna litológica simplificada)
- Observaciones: "formación competente, baja fracturación, presencia de cuarzo en vetas"
- **NO indica qué producto EXPLORA® usar**

**Escenario geológico M3 (PROVISIONAL):**

| Estrato | Profundidad | Roca | Dureza | Abrasividad |
|---|---|---|---|---|
| Superficie | 0-5 m | Regolito/suelo | 2 | Baja |
| Capa 1 | 5-20 m | Andesita | 6 | Media |
| Capa 2 | 20-40 m | Diorita | 7 | Alta |
| Capa 3 | 40-60 m | Granodiorita con cuarzo | 8 | Muy alta |

#### F. PERFORADORAS (`drills.mjs` — NUEVO)

Dos opciones genéricas sin marcas de terceros.

| Parámetro | Perforadora Tipo A | Perforadora Tipo B |
|---|---|---|
| Nombre | "Rotativa Compacta RC-200" | "Percusión DTH PD-350" |
| Método | Rotopercusión | DTH (Down The Hole) |
| Profundidad máx | 80 m | 120 m |
| Diámetros compatibles | 3½" a 5" | 4" a 6½" |
| Productividad base | 2.5 m/h (PROVISIONAL) | 3.0 m/h (PROVISIONAL) |
| Consumo operativo | Bajo | Medio |
| Precio | ~8.000 cr (PROVISIONAL) | ~12.000 cr (PROVISIONAL) |
| Ventaja | Económica, versatil en roca media | Mayor profundidad, mejor en roca dura |
| Limitación | Menor rendimiento en roca dura | Mayor costo operativo |
| Martillos compatibles | EXPLORA 4.0, 4.5 | EXPLORA 4.5, 5.0, 5.1 |

**Compatibilidad técnica:**
- Cada perforadora admite ciertos shanks/diámetros
- Los martillos EXPLORA tienen especificaciones que deben coincidir
- Un bit debe ser compatible con el martillo Y con las condiciones del terreno
- Incompatibilidad técnica → advertencia clara antes de comprar
- Combinación subóptima → funciona pero con penalización de eficiencia/desgaste

#### G. CATÁLOGO Y CASA MATRIZ (`headquarters.mjs` — NUEVO)

Pantalla en computadora de oficina: **CASA MATRIZ → SOLICITUD DE EQUIPOS Y PRODUCTOS**

**Secciones:**
1. Perforadoras (comparador lado a lado)
2. Martillos EXPLORA® (fichas técnicas con specs)
3. Bits compatibles (filtrados por martillo seleccionado)
4. Componentes y accesorios
5. Resumen de pedido + precio total
6. Confirmar

**Productos EXPLORA® en el juego (PROVISIONALES, basados en catálogo real):**

| Producto | Tipo | Diámetro | Roca recomendada | Vida útil (PROVISIONAL) | Precio (PROVISIONAL) |
|---|---|---|---|---|---|
| EXPLORA 4.0 | Martillo RC | 4" | Media a dura | 800 m | 3.500 cr |
| EXPLORA 4.5 | Martillo RC | 4½" | Media-dura a dura | 1.000 m | 4.200 cr |
| EXPLORA 5.0 | Martillo RC | 5" | Dura a muy dura | 1.200 m | 5.000 cr |
| Bit Domo 4" | Bit DTH | 4" | Dura, abrasiva | 120 m | 450 cr |
| Bit Balístico 4" | Bit DTH | 4" | Media, baja abrasividad | 100 m | 380 cr |
| Bit Cara Plana 4½" | Bit DTH | 4½" | Fracturada, regular | 110 m | 420 cr |
| Bit Domo 5" | Bit DTH | 5" | Muy dura, abrasiva | 130 m | 550 cr |
| Bit Cónico 5" | Bit DTH | 5" | Dura, muy abrasiva | 140 m | 600 cr |

> **Nota:** Todos los valores de vida útil, precios y rendimientos son PROVISIONALES DE BALANCE. Deben calibrarse con fichas técnicas reales de DRILLCO® antes de producción.

#### H. DESPACHO (`dispatch.mjs` — NUEVO)

**Flujo:**
1. Pedido confirmado → fondos reservados → orden registrada
2. Temporizador de despacho: ~120 seg (PROVISIONAL, persistente)
3. Al completar: vehículo genérico llega a zona de descarga del taller
4. Animación simplificada de llegada (vehículo entra por borde del mapa → se detiene → descarga)
5. Productos pasan al inventario del taller
6. Notificación al jugador
7. Vehículo se retira después de ~10 seg

**Persistencia:** Si el jugador cierra durante el despacho, al volver se reconcilia el tiempo. Si ya pasó, los productos aparecen directamente en inventario.

#### I. INVENTARIO (`inventory.mjs` — NUEVO)

Integrado con el taller. Fuente única de verdad para herramientas.

**Categorías:**
- Nuevas disponibles (en stock, sin usar)
- Instaladas (montadas en perforadora)
- En uso (actualmente perforando)
- Parcialmente desgastadas (% vida restante)
- Agotadas (0% vida, retiradas)
- Materiales usados (recuperados para futuro reciclaje)

**Reglas:**
- Un bit instalado se desgasta por metros perforados
- Al llegar a 0%, se retira automáticamente
- Si hay repuesto en stock, se instala automáticamente
- Si no hay repuesto, la perforación se detiene
- Martillos se desgastan más lentamente que bits
- Inventario accesible desde taller y desde computadora

#### J. SONDAJES (`boreholes.mjs` — NUEVO)

**Estructura por sondaje:**
- ID único
- Posición (x, z) en el mundo
- Profundidad objetivo (60 m)
- Metros perforados (0 → objetivo)
- Estado: pendiente / activo / completado
- Herramientas utilizadas (historial)
- Datos geológicos (vinculados al estrato)
- Timestamps inicio/fin

**Distribución M3 (PROVISIONAL):**

6 puntos en sector este-sureste del mapa:

| Sondaje | Posición (x, z) | Profundidad |
|---|---|---|
| BH-01 | (12, 6) | 60 m |
| BH-02 | (15, 3) | 60 m |
| BH-03 | (18, 0) | 60 m |
| BH-04 | (15, −3) | 60 m |
| BH-05 | (12, −6) | 60 m |
| BH-06 | (18, −6) | 60 m |

> Estas posiciones son provisionales. Se ajustarán según la ampliación del terreno.

**Movimiento de perforadora entre sondajes:**
- Al completar un sondaje, la perforadora se mueve al siguiente
- Animación simplificada: levantar → trasladar (lerp suave, ~8 seg) → posicionar → iniciar
- No aparece mágicamente — siempre hay transición visual
- Velocidad configurable

#### K. DESGASTE (`wear.mjs` — NUEVO)

**Variables:**

```
desgaste = f(modelo, tipoRoca, dureza, abrasividad, metrosPerforados, compatibilidad)
```

**Fórmula base (PROVISIONAL):**
```
vidaRestante -= metros × (dureza/10) × abrasividadMultiplier × compatibilidadPenalty

abrasividadMultiplier:
  baja: 0.8
  media: 1.0
  alta: 1.3
  muy alta: 1.6

compatibilidadPenalty:
  óptima: 1.0
  compatible: 1.2
  subóptima: 1.5
  incompatible: BLOQUEADO (no permite instalar)
```

**Recambio automático:**
- Cuando `vidaRestante <= 0`:
  1. Bit/martillo se retira
  2. Se registra como material usado con metros acumulados
  3. Se busca repuesto en inventario (mismo tipo o compatible)
  4. Si hay repuesto → se instala, perforación continúa
  5. Si no hay repuesto → perforación se detiene, notificación al jugador
- Animación breve de cambio cuando el jugador está observando
- Sin animación física durante progreso offline

#### L. PROGRESO AUTOMÁTICO Y OFFLINE

**Motor de progreso:**
```
Al abrir el juego:
  tiempoOffline = Date.now() - s.savedAt
  Si hay contrato activo con recursos suficientes:
    metrosAvanzados = productividad × (tiempoOffline / 3600000)
    Para cada metro avanzado:
      aplicar desgaste a bit/martillo actual
      si agotado: intentar recambio automático
      si no hay recambio: detener progreso, registrar momento de paro
    actualizar metros por sondaje
    si sondaje completado: mover al siguiente
    si todos completados: marcar contrato como terminado
```

**Protecciones:**
- No avanzar más allá del objetivo del contrato
- No duplicar metros
- No consumir herramientas que no existen
- Timestamp de referencia: `savedAt` del save (protección contra manipulación de reloj)
- Si el contrato tiene 3 horas de duración y pasaron 3+ horas offline → se completa
- Guardar inmediatamente después de reconciliar

#### M. INTEGRACIÓN DRILL RUN

**Estrategia de integración:**

El minijuego existe como proyecto HTML5 separado (`DRILLRUN_NEXT/`). Opciones:

| Opción | Pros | Contras |
|---|---|---|
| **A) Iframe embebido** | Mínima modificación, rápido | Comunicación limitada, UX de transición |
| **B) Copiar archivos al dist** | Control total, misma sesión | Hay que adaptar CSS/layout, mantener dos copias |
| **C) postMessage bridge** | Iframe + comunicación bidireccional | Complejidad media, pero robusto |

**Recomendación:** Opción C — iframe con postMessage.

**Flujo:**
1. Jugador accede a DRILL RUN desde panel de contrato o rig
2. Se abre iframe con el minijuego cargando desde subdirectorio
3. Al completar (boss derrotado), el minijuego envía `postMessage` con:
   ```json
   { "type": "drillrun-result", "time": 45.67, "meters": 150, "character": "paula" }
   ```
4. El juego principal recibe el mensaje
5. Convierte resultado en metros adicionales o reducción de tiempo:
   ```
   metrosBonus = min(resultMeters × bonusMultiplier, metrosRestantes)
   ```
6. Se marca la sesión como consumida (no se puede repetir para el mismo tramo)
7. Se actualiza el progreso del contrato

**Protecciones:**
- Cada sesión de DRILL RUN tiene un token único
- Un token solo puede aplicarse una vez
- Los metros bonus no pueden exceder los metros restantes del sondaje activo
- El resultado se valida contra rangos razonables

---

## 4. ESQUEMAS DE DATOS

### 4.1 Extensión del save state (schema v6)

```javascript
// Nuevos campos en el save state (compatibilidad hacia atrás garantizada)
{
  version: 6,
  schema: 'modular-2',
  // ... campos existentes de v5 se conservan ...

  // NUEVO: Personal
  personnel: [
    {
      id: 'hsec01',           // ID único
      role: 'hsec',           // hsec | admin | driller | techVisit
      name: 'Profesional HSEC · Candidato 01',
      gender: 'man',
      level: 1,               // 1-5 experiencia
      skills: ['inspection', 'maintenance'],
      state: 'idle',          // idle | working | field | operating | resting
      assignment: null,        // null | 'office' | 'shed' | 'drill-BH01'
      hireCost: 350,
      hiredAt: 1730000000000,
      position: { x: -7.99, z: 2.8 },
      yaw: 0
    }
  ],

  // NUEVO: Contrato activo
  contract: {
    id: 'contract-001',
    type: 'exploration',
    status: 'active',         // pending | accepted | active | completed | delivered
    acceptedAt: 1730000000000,
    duration: 10800,          // segundos reales (3 horas)
    totalMeters: 360,
    metersCompleted: 0,
    reward: 45000,
    boreholes: ['BH-01','BH-02','BH-03','BH-04','BH-05','BH-06'],
    activeBoreholeIndex: 0,
    deliveredAt: null,
    paidAt: null
  },

  // NUEVO: Sondajes
  boreholes: [
    {
      id: 'BH-01',
      position: { x: 12, z: 6 },
      depthTarget: 60,
      depthDrilled: 0,
      status: 'pending',      // pending | active | completed
      startedAt: null,
      completedAt: null,
      geology: {              // vinculado al informe geológico
        strata: [
          { from: 0, to: 5, rock: 'regolito', hardness: 2, abrasivity: 'low' },
          { from: 5, to: 20, rock: 'andesita', hardness: 6, abrasivity: 'medium' },
          { from: 20, to: 40, rock: 'diorita', hardness: 7, abrasivity: 'high' },
          { from: 40, to: 60, rock: 'granodiorita', hardness: 8, abrasivity: 'veryHigh' }
        ]
      },
      toolsUsed: [
        { type: 'bit', model: 'dome-4', metersStart: 0, metersEnd: 45.3, status: 'spent' },
        { type: 'bit', model: 'dome-4', metersStart: 45.3, metersEnd: 60, status: 'active' }
      ]
    }
  ],

  // NUEVO: Análisis geológico
  geoAnalysis: {
    requested: false,
    requestedAt: null,
    technicianArrived: false,
    samplingDone: false,
    analysisStartedAt: null,
    analysisDuration: 75,     // segundos
    completed: false,
    reportAvailable: false,
    accelerated: false        // si se usó acelerador de conocimiento
  },

  // NUEVO: Inventario de herramientas
  toolInventory: [
    {
      id: 'tool-001',
      type: 'hammer',         // hammer | bit | component
      model: 'explora-4.5',
      name: 'EXPLORA 4.5',
      status: 'new',          // new | installed | inUse | worn | spent
      lifeTotal: 1000,        // metros totales de vida
      lifeRemaining: 1000,    // metros restantes
      purchasedAt: 1730000000000,
      installedAt: null,
      spentAt: null,
      metersUsed: 0,
      boreholeId: null        // a qué sondaje está asignado
    }
  ],

  // NUEVO: Materiales usados (para futuro reciclaje)
  spentMaterials: [
    {
      id: 'spent-001',
      originalToolId: 'tool-001',
      model: 'dome-4',
      type: 'bit',
      metersUsed: 120,
      recoveredAt: 1730000000000
    }
  ],

  // NUEVO: Pedidos a Casa Matriz
  orders: [
    {
      id: 'order-001',
      items: [
        { model: 'explora-4.5', type: 'hammer', qty: 1, unitPrice: 4200 },
        { model: 'dome-4', type: 'bit', qty: 4, unitPrice: 450 }
      ],
      totalCost: 6000,
      status: 'delivered',     // pending | dispatched | delivered
      orderedAt: 1730000000000,
      dispatchDuration: 120,   // segundos
      deliveredAt: 1730000120000,
      consumed: false          // protección contra doble entrega
    }
  ],

  // NUEVO: Perforadora
  drill: {
    model: 'rc-200',          // null | 'rc-200' | 'pd-350'
    purchasedAt: null,
    position: { x: 12, z: 6 },
    state: 'idle',            // idle | drilling | moving | maintenance
    assignedOperator: 'driller01',
    currentBorehole: null,
    installedHammer: 'tool-001',
    installedBit: 'tool-003'
  },

  // NUEVO: DrillRun sessions (para integración minijuego)
  drillRunSessions: [
    {
      id: 'drs-001',
      boreholeId: 'BH-01',
      playedAt: 1730000000000,
      timeScore: 45.67,
      metersBonus: 25,
      applied: true            // ya se aplicó al contrato
    }
  ],

  // NUEVO: Estado de misión 3
  mission3: {
    step: 0,                   // 0-5 (objetivo actual)
    objectives: {
      1: { items: ['officeL3', 'workshop', 'admin', 'personal'], completed: [] },
      2: { items: ['contract', 'technician', 'inspection', 'analysis', 'report'], completed: [] },
      3: { items: ['compareDrills', 'buyDrill', 'hireOperator', 'selectTools', 'orderHQ', 'dispatch', 'checkInventory'], completed: [] },
      4: { items: ['installDrill', 'startDrilling', 'drillRunOptional', 'manageTools', 'completeBH', 'spentMaterials'], completed: [] },
      5: { items: ['validateMeters', 'generateReport', 'completeContract', 'receivePayment', 'unlockNext'], completed: [] }
    },
    completedAt: null,
    rewardPaid: false
  }
}
```

### 4.2 Migración v5 → v6

```javascript
function migrateV5toV6(s) {
  s.version = 6;
  s.schema = 'modular-2';

  // Migrar empleado HSEC existente al sistema Personnel
  s.personnel = [];
  if (s.hsec?.employee) {
    s.personnel.push({
      id: s.hsec.employee.id,
      role: 'hsec',
      name: EMPLOYEES.find(e => e.id === s.hsec.employee.id)?.name,
      gender: s.hsec.employee.gender || EMPLOYEES.find(e => e.id === s.hsec.employee.id)?.gender,
      level: 1,
      skills: ['inspection', 'maintenance'],
      state: s.hsec.employee.state || 'idle',
      assignment: 'hsec',
      hireCost: 350,
      hiredAt: s.hsec.employee.hiredAt || s.savedAt,
      position: { ...s.hsec.employee.position },
      yaw: s.hsec.employee.yaw || 0
    });
  }

  // Inicializar campos nuevos con defaults seguros
  s.contract = null;
  s.boreholes = [];
  s.geoAnalysis = { requested: false, completed: false, reportAvailable: false };
  s.toolInventory = [];
  s.spentMaterials = [];
  s.orders = [];
  s.drill = null;
  s.drillRunSessions = [];
  s.mission3 = null;

  return s;
}
```

---

## 5. DEPENDENCIAS ENTRE SISTEMAS

```
                    ┌─────────────┐
                    │  Oficina L3  │
                    └──────┬──────┘
                           │ requiere
                    ┌──────▼──────┐
              ┌─────│   Taller    │─────┐
              │     └──────┬──────┘     │
              │            │            │
     ┌────────▼───┐  ┌─────▼─────┐  ┌──▼──────────┐
     │  Personal  │  │ Inventario│  │  Despacho    │
     └────┬───┬───┘  └─────┬─────┘  └──────┬──────┘
          │   │            │               │
          │   │     ┌──────▼──────┐        │
          │   │     │  Catálogo   │◄───────┘
          │   │     │ Casa Matriz │
          │   │     └──────┬──────┘
          │   │            │
    ┌─────▼───▼────┐ ┌────▼─────┐
    │   Contrato   │ │Perforadora│
    └──────┬───────┘ └────┬─────┘
           │              │
    ┌──────▼──────┐ ┌─────▼──────┐
    │  Geología   │ │  Sondajes  │◄──── Desgaste
    └─────────────┘ └─────┬──────┘
                          │
                   ┌──────▼──────┐
                   │  DRILL RUN  │ (opcional, acelera)
                   └─────────────┘
```

**Orden de dependencia estricto:**
1. Oficina L3 → no depende de nada nuevo (solo office.level ≥ 2)
2. Taller → requiere galpón existente (shed built)
3. Personal → requiere oficina L3 + taller
4. Contrato → requiere personal (admin contratado)
5. Geología → requiere contrato aceptado
6. Catálogo → requiere informe geológico (para saber qué comprar)
7. Perforadora → requiere catálogo + fondos
8. Inventario → requiere taller + despacho completado
9. Sondajes → requiere perforadora + operador + herramientas
10. Desgaste → integrado con sondajes
11. DRILL RUN → requiere sondaje activo (opcional)
12. Entrega → requiere todos los sondajes completados

---

## 6. ARCHIVOS EXISTENTES REUTILIZABLES

| Archivo | Líneas | Qué reutilizar | Modificación necesaria |
|---|---|---|---|
| `chapter/state.mjs` | 98 | Save/restore, migración, economía | Agregar v6 migration, nuevos campos |
| `chapter/config.mjs` | 49 | Configuración base, precios | Agregar precios M3 |
| `chapter/phone-ui.mjs` | 51 | Estructura del teléfono, apps | Agregar apps: Personal, Contrato, Catálogo |
| `chapter/game.mjs` | ~200 | Game loop, HUD, misión flow | Agregar lógica M3, reconciliación offline |
| `chapter/avatars.mjs` | 8 | Definiciones de operadores | Agregar bonus M3 relevantes |
| `chapter/module-catalog.mjs` | 31 | Definición de módulos oficina | Activar L3, definir fixtures |
| `hsec/catalog.mjs` | 30 | Definiciones assets, EMPLOYEES | Agregar nuevos roles |
| `hsec/state.mjs` | 100 | Lógica HSEC, employee, eval | Referencia para M3 state |
| `hsec/world.mjs` | ~340 | Rendering 3D assets, NPC rendering | Agregar rendering perforadora, sondajes |
| `hsec/shed-model.mjs` | 100 | Geometría del galpón | Agregar interior nivel 2 (taller) |
| `assets3d/office-shell.mjs` | 132 | Geometría oficina | Extender para L3 |
| `assets3d/office-layout.mjs` | 40 | Layout y colisiones oficina | Ajustar para L3 |
| `assets3d/worker-candidate.mjs` | 30 | CandidateRig para NPC | Reutilizar para admin/driller/tech |
| `graphics/desert.mjs` | 51 | Terreno y reliefHeight | Ampliar zona plana si es necesario |
| `scene.mjs` | 127 | Motor de escena, sampleGround | Agregar walkSurfaces para zona sondajes |
| `camera/follow-camera.mjs` | ~150 | Sistema de cámara | Sin cambios significativos |
| `camera/config.mjs` | ~40 | Presets de cámara | Posible preset "drill" para observar perforación |

---

## 7. MÓDULOS NUEVOS

| Módulo | Archivo | Responsabilidad | Líneas estimadas |
|---|---|---|---|
| Personal | `chapter/personal.mjs` | Gestión de trabajadores, fichas, UI | ~200 |
| Contratos | `chapter/contracts.mjs` | Lógica de contratos, estado, validación | ~150 |
| Geología | `chapter/geology.mjs` | Análisis, informe, escenarios geológicos | ~180 |
| Perforadoras | `chapter/drills.mjs` | Definiciones, comparador, compatibilidad | ~120 |
| Casa Matriz | `chapter/headquarters.mjs` | Catálogo EXPLORA, pedidos, despacho | ~200 |
| Inventario | `chapter/inventory.mjs` | Herramientas, stock, desgaste tracking | ~150 |
| Sondajes | `chapter/boreholes.mjs` | Puntos de perforación, progreso, movimiento | ~180 |
| Desgaste | `chapter/wear.mjs` | Cálculo de desgaste, recambio automático | ~100 |
| Progreso offline | `chapter/offline-progress.mjs` | Reconciliación temporal, avance offline | ~120 |
| Misión 3 state | `chapter/mission3-state.mjs` | Pasos, objetivos, checklists, rewards | ~150 |
| Drill Run bridge | `chapter/drillrun-bridge.mjs` | postMessage, validación, conversión metros | ~80 |
| Modelos 3D M3 | `assets3d/drill-models.mjs` | Geometría procedural perforadoras | ~200 |
| Modelo vehículo | `assets3d/delivery-vehicle.mjs` | Geometría procedural camión genérico | ~100 |
| Marcadores sondaje | `assets3d/borehole-marker.mjs` | Marcadores 3D puntos de sondaje | ~60 |

**Total estimado nuevos:** ~1990 líneas en 14 módulos

---

## 8. INVENTARIO DE ASSETS

### Clasificación: EXISTENTE / REUTILIZABLE / MODIFICACIÓN / NUEVO / PENDIENTE

#### Infraestructura

| Asset | Estado | Archivo/Referencia | Notas |
|---|---|---|---|
| Oficina L1 | EXISTENTE | `office-shell.mjs` | Funcional |
| Oficina L2 | EXISTENTE | `office-shell.mjs` + `module-catalog.mjs` | Funcional |
| Oficina L3 | REQUIERE MODIFICACIÓN | `office-shell.mjs` + `module-catalog.mjs` lín 13 | Placeholder existe, geometría por crear |
| Tercer puesto trabajo | NUEVO | — | Escritorio + silla + computadora, estilo existente |
| Galpón nivel 1 | EXISTENTE | `shed-model.mjs` | Funcional |
| Taller nivel 2 | REQUIERE MODIFICACIÓN | `shed-model.mjs` | Interior expandido, zona descarga |
| Zona de recepción | NUEVO | — | Señalización + área marcada en taller |

#### Personal (modelos 3D)

| Asset | Estado | Archivo/Referencia | Notas |
|---|---|---|---|
| Prevencionista HSEC hombre | EXISTENTE | `hsec-npc1.glb` (4.2 MB) | Funcional |
| Prevencionista HSEC mujer | EXISTENTE | `hsec-npc2.glb` (4.4 MB) | Funcional |
| Administrador contrato | REUTILIZABLE | Adaptar `operator-02.glb` o `operator-03.glb` | Cambiar colores vestimenta |
| Operador perforadora | REUTILIZABLE | Adaptar `operator-candidate.glb` | Ya tiene casco y EPP |
| Técnico DRILLCO® | REUTILIZABLE | Adaptar uno de los operators | Agregar maletín como accesorio |
| Retratos/fichas | REUTILIZABLE | Función `renderPlayerPortrait` en `world.mjs` lín 308 | Ya genera retratos desde modelos 3D |

#### Maquinaria

| Asset | Estado | Archivo/Referencia | Notas |
|---|---|---|---|
| Perforadora Tipo A (RC-200) | NUEVO | `drill-models.mjs` | Geometría procedural cel-shading |
| Perforadora Tipo B (PD-350) | NUEVO | `drill-models.mjs` | Geometría procedural cel-shading |
| Animación perforación | NUEVO | — | Rotación de mástil + vibración |
| Plataforma de perforación | REUTILIZABLE | `scene.mjs` lín 77 `makeRig()` | Rig existente como referencia visual |

#### Productos DRILLCO®

| Asset | Estado | Archivo/Referencia | Notas |
|---|---|---|---|
| Martillos EXPLORA® (fichas UI) | NUEVO | — | Cards con specs, no 3D detallado |
| Bits (fichas UI) | NUEVO | — | Cards con specs e indicadores |
| Cajas/embalajes 3D | REUTILIZABLE | Contenedores naranja en `shed-model.mjs` lín 88 | Ya existen cajas en estanterías |
| Bits desgastados | PENDIENTE DE REFERENCIA | — | Modelo 3D futuro, por ahora solo registro de datos |

#### Logística

| Asset | Estado | Archivo/Referencia | Notas |
|---|---|---|---|
| Vehículo de despacho | NUEVO | `delivery-vehicle.mjs` | Camión genérico procedural, sin marcas |
| Animación llegada | NUEVO | — | Path simple desde borde del mapa |
| Stock en taller | REQUIERE MODIFICACIÓN | `shed-model.mjs` | Más cajas visibles en estanterías según inventario |

#### Geología y exploración

| Asset | Estado | Archivo/Referencia | Notas |
|---|---|---|---|
| Maletín técnico | NUEVO | — | Accesorio simple procedural |
| Puntos de sondaje 3D | NUEVO | `borehole-marker.mjs` | Marcador con banderín + anillo pulsante |
| Marcadores profundidad | NUEVO | — | UI overlay, no 3D |
| Columna litológica | NUEVO | — | UI para informe geológico |
| Informe geológico UI | NUEVO | — | Pantalla en computadora |

#### Interfaces

| Asset | Estado | Archivo/Referencia | Notas |
|---|---|---|---|
| Panel Personal | NUEVO | — | App en teléfono, fichas de trabajadores |
| Comparador perforadoras | NUEVO | — | Pantalla computadora, lado a lado |
| Informe geológico | NUEVO | — | Pantalla computadora con estratos |
| Pedidos Casa Matriz | NUEVO | — | Pantalla computadora, catálogo + carrito |
| Inventario herramientas | NUEVO | — | App en teléfono o pantalla taller |
| Panel de contrato | NUEVO | — | Estado del contrato, progreso sondajes |
| Progreso sondajes | NUEVO | — | Barra + lista de BH con estado |
| Estado herramientas | NUEVO | — | Desgaste visual con barras de vida |

---

## 9. PROPUESTA DE AMPLIACIÓN DEL TERRENO

### 9.1 Problema actual

El terreno plano útil es de aproximadamente 29 × 22 m (x: −13 a 16, z: −13 a 9). Los edificios existentes ocupan buena parte de este espacio. Para 6 sondajes distribuidos se necesita más área operativa.

### 9.2 Propuesta: Expansión Este

**Ampliar los límites del mundo:**

```
ACTUAL:  x: [-18, +20]  z: [-16, +14]   = 38 × 30 m
NUEVO:   x: [-18, +35]  z: [-16, +14]   = 53 × 30 m
                   ↑
            +15 m hacia el este
```

**Ampliar zona plana del terreno:**

```
ACTUAL reliefHeight plano:  x: [-13, +16]  z: [-13, +9]
NUEVO reliefHeight plano:   x: [-13, +30]  z: [-13, +9]
                                       ↑
                                +14 m hacia el este
```

### 9.3 Impacto

| Sistema | Cambio necesario |
|---|---|
| `scene.mjs` isBlocked | Cambiar x > 20 → x > 35 |
| `desert.mjs` reliefHeight | Cambiar x-16 → x-30 en la fórmula outside |
| `desert.mjs` createDesert | PlaneGeometry puede seguir en 240×240 (sobra) |
| Grid de planificación | Extender rango de grid |
| Cámara | Sin cambios (ya maneja zoom largo en builder mode) |
| Edificios existentes | Sin cambios (todos en x < 16) |
| HSEC colisiones | Sin cambios (ya usan coordenadas absolutas) |
| NPC pathfinding | Ampliar límites de red si NPC trabajan en zona nueva |
| Saves existentes | Sin impacto (posiciones guardadas siguen válidas) |
| Rendimiento | Bajo impacto — el terreno ya es 240×240, solo cambian vértices |

### 9.4 Distribución del espacio ampliado

```
         z = +9
    ┌────────────────────────────────────────────────┐
    │  OFICINA    │  PAD  │  SUMINISTROS  │          │
    │  (-6,0)     │       │  (10, 3.6)    │  ZONA    │
    │             │       │               │  SONDAJES│
    │─────────────┼───────┼───────────────│  (nuevo) │
    │             │ RIG   │  DETALLES     │          │
    │  TALLER     │(6,-4) │  (11, 2.8)    │  BH-01   │
    │ (-7.6,-9)   │       │               │  BH-02   │
    │             │ GALPÓN│  DEPÓSITO     │  BH-03   │
    │             │(6,-4) │  (14, -9)     │  BH-04   │
    │             │       │               │  BH-05   │
    │             │       │               │  BH-06   │
    └────────────────────────────────────────────────┘
    x = -18                                    x = +35
         z = -16
```

### 9.5 Futuro rajo abierto

La arquitectura debe preparar (NO implementar en M3):

- `terrain.sectors[]` — array de sectores geológicos con propiedades
- `terrain.elevation(x, z)` — función que en futuro podrá retornar alturas negativas (bancos)
- `terrain.modified` — flag para saber si el terreno fue excavado
- Colisiones con borde de talud (futuro)
- Cámara capaz de descender bajo nivel 0 (futuro)

**Para M3:** Solo zona plana. Los sondajes son verticales desde superficie. No hay excavación visible.

---

## 10. TEMPORIZADORES Y PROGRESO

### 10.1 Temporizadores del juego

| Temporizador | Duración (PROVISIONAL) | Persistente | Acelerador |
|---|---|---|---|
| Construcción oficina L3 | 300 seg (5 min) | Sí | Booster existente |
| Mejora galpón → taller | 180 seg (3 min) | Sí | Booster existente |
| Análisis geológico | 75 seg | Sí | Acelerador de conocimiento (nuevo) |
| Despacho Casa Matriz | 120 seg (2 min) | Sí | No (logística fija) |
| Contrato de exploración | 10.800 seg (3 horas) | Sí | DRILL RUN (opcional) |
| Movimiento perforadora | 8 seg (entre sondajes) | No | No |
| Recambio herramienta | 5 seg (visual) | No | No |

### 10.2 Progreso offline — Reglas

1. **Al cerrar el juego:** Se guarda `savedAt = Date.now()`
2. **Al reabrir:** Se calcula `elapsed = Date.now() - savedAt`
3. **Temporizadores:** Todos avanzan con `elapsed`. Si el tiempo supera la duración, se completan.
4. **Contrato activo:** Se simula avance metro a metro:
   - Cada metro consume durabilidad de herramientas
   - Herramientas agotadas se reemplazan automáticamente desde stock
   - Si no hay reemplazo, el avance se detiene en ese punto
   - El timestamp del paro se registra
5. **Protecciones:**
   - `elapsed` no puede ser negativo (protección reloj)
   - Si `elapsed` > 30 días, se limita a 30 días (anti-exploit)
   - Cada reconciliación se ejecuta una sola vez y guarda inmediatamente
   - No se aplica progreso si el contrato ya está completado

### 10.3 Integración DRILL RUN — Reglas

1. Solo disponible cuando hay un sondaje activo en progreso
2. Cada sesión de DRILL RUN genera un resultado: `{ time, meters }`
3. Los metros se convierten en avance adicional:
   ```
   metersBonus = min(drillRunMeters × 0.4, metrosRestantesEnSondajeActivo)
   ```
   (PROVISIONAL: factor 0.4 = 40% de los metros del minijuego se traducen)
4. El bonus se aplica UNA sola vez por sesión (token de sesión)
5. El jugador puede jugar DRILL RUN múltiples veces, pero cada sesión se aplica al tramo actual
6. Si el sondaje se completa durante el minijuego, el excedente se pierde (no se traslada al siguiente)
7. DRILL RUN es siempre **opcional** — el contrato se completa solo con tiempo

### 10.4 Acelerador de conocimiento

Recurso nuevo, diferente del booster de construcción.

- Se consume para reducir el tiempo de análisis geológico a la mitad
- En futuro: aplicable a laboratorio, I+D, mejoras tecnológicas
- Se obtiene como recompensa de misiones o compra
- No confundir con el turbo boost del minijuego DRILL RUN
- Almacenado en `s.knowledgeBoosters` (separado de `s.boosters`)

---

## 11. PLAN DE IMPLEMENTACIÓN POR ETAPAS

### Día 1 — Arquitectura y preparación

| Tarea | Entregable |
|---|---|
| Validar este documento con el usuario | Plan aprobado |
| Crear esqueleto de módulos nuevos (archivos vacíos con exports) | Estructura de proyecto |
| Implementar migración v5 → v6 | Save compatible |
| Ampliar terreno (reliefHeight + isBlocked) | Mundo expandido |
| Auditar minijuego DRILL RUN (confirmar URL deployment) | Reporte de integración |

**Test de aceptación:**
- [ ] Save v5 existente se abre correctamente en v6
- [ ] Empleado HSEC migrado aparece en `personnel[]`
- [ ] Zona este del mapa es accesible sin colisiones fantasma
- [ ] No se rompen misiones 1 y 2

### Día 2 — Infraestructura y Personal

| Tarea | Entregable |
|---|---|
| Oficina L3: geometría, layout, colisiones | Oficina ampliada |
| Taller: interior nivel 2, zona descarga | Galpón mejorado |
| Módulo Personal: datos, UI en teléfono | Fichas de trabajadores |
| Contratación de administrador y operador | Flujo de contratación |

**Test de aceptación:**
- [ ] Oficina L3 se construye (upgrade) sin romper L2
- [ ] Tres puestos de trabajo visibles y funcionales
- [ ] Taller muestra interior mejorado
- [ ] Panel Personal muestra todos los trabajadores con avatar
- [ ] Prevencionista HSEC existente aparece en Personal
- [ ] Administrador se contrata con requisitos cumplidos

### Día 3 — Geología y Técnico

| Tarea | Entregable |
|---|---|
| Sistema de contratos (aceptar primer contrato) | Contrato activo |
| Solicitar técnico DRILLCO® desde computadora | Visita técnica |
| NPC técnico: caminar, inspeccionar, muestrear | Animación completa |
| Temporizador de análisis (persistente) | Timer funcional |
| Informe geológico (UI completa) | Reporte visual |
| Acelerador de conocimiento | Mecánica base |

**Test de aceptación:**
- [ ] Contrato se acepta y aparece en estado
- [ ] Técnico camina hasta zona de exploración con maletín
- [ ] Temporizador persiste si se cierra el juego
- [ ] Informe muestra estratos, dureza, abrasividad
- [ ] Informe NO dice qué producto comprar
- [ ] Acelerador reduce tiempo de análisis

### Día 4 — Equipamiento y Catálogo

| Tarea | Entregable |
|---|---|
| Definiciones de perforadoras (2 tipos) | Modelos con specs |
| Comparador de perforadoras UI | Pantalla comparación |
| Catálogo Casa Matriz con productos EXPLORA® | Tienda funcional |
| Sistema de pedidos y despacho | Flujo completo |
| Inventario en taller | Tracking de herramientas |
| Modelos 3D procedurales (perforadoras) | Assets visuales |

**Test de aceptación:**
- [ ] Dos perforadoras con diferencias reales comparables
- [ ] Compatibilidad martillo-bit-perforadora validada
- [ ] Pedido se confirma, fondos se reservan
- [ ] Despacho tiene temporizador persistente
- [ ] Vehículo llega visualmente al taller
- [ ] Inventario muestra herramientas recibidas
- [ ] Incompatibilidad técnica se advierte claramente

### Día 5 — Sondajes y Perforación

| Tarea | Entregable |
|---|---|
| Marcadores de sondaje en mundo 3D | 6 puntos visibles |
| Instalación de perforadora en sondaje | Posicionamiento |
| Motor de perforación automática | Avance por tiempo |
| Movimiento entre sondajes | Transición visual |
| Progreso offline completo | Reconciliación |
| Contratación de operador | Requisito para operar |

**Test de aceptación:**
- [ ] 6 marcadores visibles en zona este
- [ ] Perforadora se posiciona en BH-01
- [ ] Metros avanzan automáticamente
- [ ] Al cerrar y reabrir, progreso se reconcilia
- [ ] Perforadora se mueve al siguiente sondaje al completar
- [ ] Sin operador, la perforación no inicia

### Día 6 — DRILL RUN, Desgaste y Materiales

| Tarea | Entregable |
|---|---|
| Integración DRILL RUN (iframe + postMessage) | Minijuego conectado |
| Sistema de desgaste (bits y martillos) | Consumo real |
| Recambio automático desde stock | Reposición |
| Registro de materiales usados | Inventario usado |
| Animaciones de perforación y cambio | Visual completo |

**Test de aceptación:**
- [ ] DRILL RUN se abre desde panel de contrato
- [ ] Resultado del minijuego acelera avance del sondaje
- [ ] Metros bonus se aplican una sola vez por sesión
- [ ] Bits se desgastan según metros y tipo de roca
- [ ] Al agotarse un bit, se reemplaza automáticamente
- [ ] Material usado aparece en inventario separado
- [ ] Sin stock de repuesto, perforación se detiene

### Día 7 — Integración, Economía y Pruebas

| Tarea | Entregable |
|---|---|
| Objetivo 5: entrega de contrato, pago, informe final | Cierre de misión |
| Celebración de misión completada | Pantalla WOW |
| Balance económico (costos vs recompensa) | Economía coherente |
| Pruebas end-to-end completas | QA pass |
| Correcciones y polish | Primera versión jugable |

**Test de aceptación:**
- [ ] Contrato se completa al alcanzar 360 m
- [ ] Informe final muestra resumen de sondajes
- [ ] Pago se recibe una sola vez
- [ ] Economía total es viable (no queda en negativo)
- [ ] Save funciona con M1 + M2 + M3
- [ ] No hay duplicaciones de metros, herramientas ni pagos

---

## 12. CRITERIOS DE PRUEBA (20 validaciones)

| # | Validación | Método |
|---|---|---|
| 1 | Ampliar infraestructura sin perder construcciones | Upgrade L3, verificar L2 intacta |
| 2 | Trabajadores en Personal con avatar | Abrir panel, verificar retratos |
| 3 | Contratación cumple requisitos | Intentar sin requisitos → falla |
| 4 | Técnico DRILLCO® visita diferenciada | Observar animación, no es operador |
| 5 | Análisis con temporizador persistente | Cerrar y reabrir, timer continúa |
| 6 | Informe permite decisiones técnicas | Leer informe, elegir herramientas |
| 7 | Perforadoras con diferencias reales | Comparar specs, elegir una |
| 8 | Casa Matriz: solicitar y generar despacho | Confirmar pedido, ver timer |
| 9 | Entregas actualizan inventario sin duplicar | Verificar stock antes/después |
| 10 | Sondajes avanzan offline | Cerrar 10 min, reabrir, metros avanzaron |
| 11 | Contrato se completa en tiempo programado | Esperar 3 horas (o acelerar en test) |
| 12 | Minijuego acelera avance | Jugar DRILL RUN, verificar metros bonus |
| 13 | Desgaste corresponde a metros | Verificar vida restante vs metros |
| 14 | Bits se reemplazan automáticamente | Agotar bit, verificar recambio |
| 15 | Herramientas agotadas → materiales usados | Verificar inventario de usados |
| 16 | Perforadora se desplaza entre sondajes | Observar transición BH-01 → BH-02 |
| 17 | Contrato se cobra una sola vez | Completar, verificar ledger |
| 18 | Save funciona con M1 + M2 | Cargar save antiguo, verificar migración |
| 19 | Economía coherente | Balance: costos totales < recompensa + capital |
| 20 | Mundo preparado para crecer | Zona este accesible, sectores definidos |

---

## 13. RIESGOS, PREGUNTAS Y DECISIONES PENDIENTES

### 13.1 Riesgos técnicos

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| 1 | Migración v5→v6 corrompe saves | Media | Crítico | Test exhaustivo con saves reales, backup automático |
| 2 | Integración DRILL RUN falla por CORS/sandbox | Media | Alto | Copiar archivos al mismo dominio si iframe falla |
| 3 | Oficina L3 rompe colisiones existentes | Baja | Alto | Test de pathfinding antes/después del upgrade |
| 4 | Progreso offline desbordado | Media | Medio | Cap de 30 días, validación de rangos |
| 5 | Rendimiento con 6 sondajes + perforadora + NPC | Baja | Medio | Los sondajes son marcadores simples, no meshes complejos |
| 6 | Desgaste demasiado rápido/lento | Alta | Medio | Todos los valores son PROVISIONALES, ajustar en playtesting |
| 7 | Economía desbalanceada | Alta | Medio | Spreadsheet de balance antes de implementar |
| 8 | Minijuego no encontrado en deploy | Baja | Alto | Ya localizado en filesystem, confirmar acceso en producción |

### 13.2 Preguntas pendientes (requieren respuesta del usuario)

| # | Pregunta | Impacto en implementación |
|---|---|---|
| **P1** | ¿Se aprueba la expansión del terreno +15 m hacia el este? | Define dónde van los sondajes |
| **P2** | ¿El minijuego DRILL RUN se integrará como iframe o se copian archivos al dist? | Define estrategia de integración |
| **P3** | ¿La URL de deploy del minijuego es accesible? ¿O solo existe en filesystem local? | Necesario para iframe |
| **P4** | ¿Los precios PROVISIONALES son un rango razonable? (perforadoras 8K-12K, martillos 3.5K-5K, bits 380-600) | Balance económico |
| **P5** | ¿El técnico DRILLCO® debe usar un modelo GLB existente adaptado, o se necesita uno nuevo? | Complejidad de assets |
| **P6** | ¿La duración del contrato (3 horas) se considera apropiada para testing? ¿Queremos un modo acelerado para pruebas? | Velocidad de desarrollo |
| **P7** | ¿Los nombres "RC-200" y "PD-350" para las perforadoras genéricas son aceptables? | Branding |
| **P8** | ¿El acelerador de conocimiento es un recurso separado del booster existente, o reutilizamos el mismo? | Diseño de recurso |
| **P9** | ¿Queremos que el DrillTruck® tenga un placeholder visual en M3, o solo preparar la arquitectura sin nada visible? | Alcance de M3 |
| **P10** | ¿El informe final de contrato (Obj 5) debe ser una pantalla elaborada o un resumen simple? | Esfuerzo de UI |

### 13.3 Decisiones tomadas (confirmadas en la instrucción)

| Decisión | Confirmada |
|---|---|
| No crear minijuego nuevo | ✓ |
| Galpón evoluciona a taller (no crear otro) | ✓ |
| Reutilizar modelos existentes para nuevos roles | ✓ |
| Máximo 5 objetivos con checklists desplegables | ✓ |
| Precios solo con ícono + número, sin CR | ✓ |
| Valores de desgaste son provisionales | ✓ |
| No implementar DrillTruck® en M3 | ✓ |
| No implementar rajo abierto en M3 | ✓ |
| No implementar planta de reciclaje en M3 | ✓ |
| Vehículos genéricos sin marcas externas | ✓ |
| Empleado HSEC de M2 se conserva | ✓ |

---

## RESUMEN EJECUTIVO

La Misión 3 introduce **10 sistemas nuevos** (Personal, Contratos, Geología, Perforadoras, Casa Matriz, Inventario, Sondajes, Desgaste, Progreso Offline, DRILL RUN bridge) y **modifica 4 existentes** (Oficina, Galpón/Taller, Save State, Economía).

Se reutilizan **16 archivos existentes** y se crean **14 módulos nuevos** (~2000 líneas estimadas).

El minijuego DRILL RUN **existe** en `DRILLRUN_NEXT/` como proyecto HTML5 independiente. Se integra vía iframe + postMessage sin reescribirlo.

El terreno se expande **+15 m al este** para alojar la zona de sondajes sin afectar construcciones existentes.

Todos los valores numéricos (precios, durabilidades, tiempos, rendimientos) están marcados como **PROVISIONALES DE BALANCE** y deben calibrarse durante playtesting.

La arquitectura está diseñada para admitir **futuras ampliaciones** (DrillTruck®, rajo abierto, precorte, laboratorio, reciclaje) sin refactoring destructivo.

---

*Documento generado el 3 de noviembre de 2026 — Pendiente de validación antes de iniciar implementación.*
