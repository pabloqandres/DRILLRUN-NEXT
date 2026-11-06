# DRILL RUN NEXT GENERATION
## NUEVO DESARROLLO — HSEC LIVING SAFETY SYSTEM V3
### Misión 2: «Prepara tu operación»
### Especificación maestra de infraestructura, seguridad, movilidad, NPC, mantenimiento e iconografía

**Proyecto:** DRILL RUN NEXT GENERATION  
**Plataforma:** Mobile horizontal  
**Dirección gráfica:** Premium 3D estilizado, iluminación cinematográfica e interfaz industrial neón  
**Prioridad:** Desarrollo de la segunda misión y del sistema HSEC persistente.

---

# 00. INSTRUCCIÓN PRINCIPAL

Implementar la Misión 2 «Prepara tu operación» como la introducción al sistema HSEC de DRILL RUN NEXT GENERATION.

El jugador ya cuenta con una oficina y debe convertir su terreno inicial en una pequeña operación preparada para trabajar.

Para ello necesitará construir infraestructura, conectar edificios, establecer circulación segura, instalar iluminación, delimitar áreas, contratar un prevencionista de riesgos y superar una inspección inicial.

El sistema debe continuar funcionando después de finalizar la misión.

**Los elementos de seguridad tendrán vida útil, estado de conservación, deterioro, mantenimiento y consecuencias sobre el índice HSEC.**

Los colaboradores NPC deberán interactuar realmente con estos sistemas.

No desarrollar objetos meramente decorativos para simular el cumplimiento de una misión.

No reconstruir los sistemas ya aprobados del HOTFIX 005.

No alterar la cámara B, locomoción, selector de avatares, cinemática ni sistemas gráficos premium existentes.

---

# 01. ARCHIVOS DE REFERENCIA — LECTURA OBLIGATORIA

Se adjuntan:

**ARCHIVO A — HSEC CONSTRUCTION KIT V2**

Imagen maestra de infraestructura y seguridad.

Contiene:

- Oficina.
- Galpón.
- Torres de iluminación.
- Caminos vehiculares.
- Caminos peatonales.
- Cruces seguros.
- Barandas.
- Conos.
- Barreras.
- Señalética.
- Equipos de emergencia.
- Elementos de protección.
- Detalles constructivos y materiales.

Analizar visualmente la lámina completa, identificar sus componentes y crear una matriz individual de activos.

La lámina define la dirección visual. No representa un plano técnico obligatorio ni autoriza construir toda la faena desde el comienzo.

**ARCHIVO B — HSEC ICON PACK V3**

Archivo ZIP:

`DRILLRUN_HSEC_Iconos_Minimal_V3_SVG_PNG.zip`

**ESTE PAQUETE ES LA REFERENCIA OFICIAL DE ICONOGRAFÍA HSEC.**

Contiene seis pictogramas individuales en variantes SVG y PNG, neón y blanco.

Importar directamente sus archivos.

NO recrearlos mediante IA.

NO extraer íconos de la lámina HSEC.

NO dibujar aproximaciones mediante emojis.

NO combinar elementos de diferentes familias de íconos.

NO agregar círculos, pines, fondos, sombras o formas permanentes al dibujo original del símbolo.

El efecto neón y los estados de interacción pueden aplicarse desde el componente UI que contiene el ícono, sin deformar su geometría.

**ARCHIVO C — ICON PACK V2**

Paquete de respaldo.

Utilizar únicamente si un archivo V3 presenta un problema técnico verificable y no puede resolverse mediante su implementación original.

No mezclar libremente V2 y V3.

**ARCHIVOS D y E — NPC HSEC**

- Prevencionista de riesgos mujer, GLB aprobado.
- Prevencionista de riesgos hombre, GLB aprobado.

Leer e integrar ambos archivos originales.

No volver a generar sus modelos ni sustituirlos por personajes genéricos.

---

# 02. MAPEO OFICIAL DE LOS SEIS ÍCONOS

Importar cada categoría desde los siguientes archivos SVG del paquete V3.

| ID | Categoría HSEC | Archivo neón |
|---|---|---|
| 01 | Infraestructura operativa | `01_Infraestructura_Operativa_Neon.svg` |
| 02 | Movilidad y tránsito seguro | `02_Movilidad_Transito_Seguro_Neon.svg` |
| 03 | Delimitación y control de riesgos | `03_Delimitacion_Riesgos_Neon.svg` |
| 04 | Iluminación y visibilidad | `04_Iluminacion_Visibilidad_Neon.svg` |
| 05 | Señalización y emergencias | `05_Senalizacion_Emergencias_Neon.svg` |
| 06 | Inspecciones y mantenimiento | `06_Inspecciones_Mantenimiento_Neon.svg` |

Cada categoría dispone también de su archivo `_Blanco.svg`.

### Regla visual

Utilizar:

- Versión neón en paneles de categorías y tarjetas destacadas.
- Versión blanca en botones compactos, estados neutros y menús donde corresponda.
- La misma geometría, proporciones y márgenes para las seis categorías.

Conservar colores:

01. Dorado.

02. Cian.

03. Coral.

04. Violeta.

05. Verde.

06. Naranja.

### Diferencia entre categorías y prioridades de misión

IMPORTANTE: no confundir ambos sistemas.

**Los colores de los seis íconos identifican categorías HSEC.**

Los pines de objetivos mantienen el sistema ya aprobado:

- Amarillo: objetivo principal.
- Cian: objetivo secundario.
- Magenta: objetivo opcional.

Por ejemplo:

Un objetivo principal de mantenimiento mostrará un pin amarillo con el símbolo de mantenimiento en blanco.

El panel HSEC mostrará la categoría Mantenimiento con su ícono naranja V3.

La prioridad de misión y la categoría profesional son atributos independientes.

### Implementación

Crear un registro único de íconos reutilizable entre:

- Panel HSEC.
- Builder.
- Tarjetas de misión.
- Inspecciones.
- Órdenes de mantenimiento.
- Fichas de activos.
- Indicadores contextuales.

No usar las seis categorías para crear seis aplicaciones nuevas en el teléfono.

El teléfono continúa limitado a Mensajes hasta que se autoricen otras funciones.

---

# 03. IDENTIDAD GRÁFICA

Respetar la nueva dirección artística premium ya implementada en el juego.

Características obligatorias:

- 3D estilizado de calidad.
- Materiales industriales detallados.
- Sombras e iluminación coherentes.
- Profundidad atmosférica del desierto.
- Paneles oscuros translúcidos.
- Neón controlado.
- Botones claros.
- Pictogramas reconocibles.
- Animaciones suaves.
- Buena visibilidad mobile.

La lámina HSEC V2 es una referencia de materiales, construcción y ambientación.

No transformar el mundo en una escena fotorrealista diferente del estilo jugable aprobado.

Los elementos deberán respetar la escala del avatar y de los edificios actuales.

---

# 04. INVENTARIO DE ACTIVOS DE LA LÁMINA

Crear una matriz de activos antes de implementarlos.

Cada elemento deberá disponer de:

- Identificador único.
- Nombre.
- Categoría Builder.
- Modelo o referencia 3D.
- Dimensiones del juego.
- Materiales.
- Requisitos de colocación.
- Costo de construcción.
- Nivel.
- Beneficio funcional.
- Estado de conservación.
- Reglas de deterioro.
- Tareas de mantenimiento.
- Reglas HSEC asociadas.
- Estado de implementación.

### Activos principales

1. Oficina nivel 2.
2. Galpón nivel 1.
3. Torres y postes de iluminación.
4. Caminos vehiculares.
5. Caminos peatonales.
6. Cruces peatonales.
7. Barreras New Jersey.
8. Barandas industriales.
9. Conos.
10. Bolardos.
11. Señalética.
12. Demarcación de piso.
13. Cercos y protecciones.
14. Caseta de control.
15. Lomo de toro.
16. Espejo convexo.
17. Extintor y gabinete.
18. Punto limpio.
19. Sistema básico de contención de derrames.
20. Ducha de emergencia.
21. Protecciones de cables y drenajes, cuando correspondan.
22. Pasamanos y elementos de protección peatonal.

No desarrollar todos los activos avanzados durante el tutorial.

Priorizar los necesarios para completar la Misión 2 y mantener los restantes registrados para futuras etapas.

---

# 05. BUILDER — INFRAESTRUCTURA HSEC

Utilizar el Builder existente.

No crear una tienda independiente.

Agregar o extender categorías necesarias:

- Edificios.
- Caminos y movilidad.
- Iluminación.
- Seguridad.
- Señalética y emergencias.

En Caminos y movilidad diferenciar:

- Vías vehiculares.
- Caminos peatonales.
- Cruces.
- Protecciones.
- Demarcaciones.

Las tarjetas conservarán el diseño premium del Builder y mostrarán:

- Miniatura.
- Nombre.
- Nivel.
- Precio.
- Tiempo de construcción.
- Función.
- Beneficio HSEC.
- Condiciones de colocación.
- Estado de desbloqueo.

No incorporar objetos sin funcionalidad y presentarlos como si estuvieran completamente operativos.

---

# 06. EDIFICIOS — OFICINA Y GALPÓN

### Oficina

Respetar la oficina nivel 1 existente.

Implementar mejora a nivel 2.

El nivel 2 debe:

- Mejorar visualmente el módulo.
- Habilitar capacidad para un segundo colaborador.
- Desbloquear el sistema de contratación HSEC.
- Permitir la gestión administrativa de personal.

No incorporar baños o dormitorios dentro de la oficina.

Estos espacios serán módulos independientes en futuras etapas.

### Galpón

Habilitar una nueva zona constructiva a cierta distancia de la oficina.

Construir un galpón pequeño de mantenimiento y almacenamiento.

Debe contener:

- Acceso peatonal.
- Acceso logístico.
- Espacio para herramientas y consumibles.
- Capacidad inicial de inventario.
- Materiales industriales.
- Iluminación interior coherente.
- Colisiones y accesos funcionales.

### Progresión

Preparar oficina y galpón para al menos 10 niveles.

Los niveles posteriores podrán:

- Aumentar capacidad.
- Reducir tiempos.
- Mejorar durabilidad.
- Ampliar funciones.
- Incorporar equipamiento.
- Desbloquear colaboradores adicionales.

No modelar ahora diez variantes completas innecesariamente.

Implementar los niveles requeridos para la Misión 2 y una estructura escalable.

---

# 07. MOVILIDAD VEHICULAR

Implementar caminos vehiculares funcionales.

El jugador deberá poder conectar áreas logísticas.

Permitir:

- Tramos rectos.
- Curvas.
- Empalmes.
- Conexión a accesos de edificios.
- Previsualización.
- Confirmación de construcción.
- Validación de continuidad.

La ruta será evaluada por conexión real, no por proximidad visual.

No exigir un trazado perfectamente recto.

Los caminos deberán tener condición, nivel y mantenimiento.

El sistema deberá estar preparado para vehículos NPC genéricos en etapas posteriores.

---

# 08. MOVILIDAD PEATONAL SEGURA — REQUISITO PRIORITARIO

Crear una red independiente para el tránsito de personas.

Los caminos peatonales son elementos fundamentales del HSEC.

No deben reducirse a una línea pintada sobre la arena.

Deben contar con:

- Superficie transitable.
- Conectividad real.
- Materiales diferenciados.
- Accesos coherentes.
- Protección donde se necesite.
- Iluminación.
- Señalización.
- Estado de conservación.
- Navegación NPC.

La red peatonal debe conectar los accesos de oficina y galpón.

### Niveles iniciales

Nivel 1: sendero básico regularizado.

Nivel 2: sendero mejorado y demarcado.

Nivel 3: sendero protegido y mejor equipado.

Niveles superiores: mejor durabilidad, superficie, iluminación y protección.

### Reglas de seguridad

Distinguir entre:

- Red peatonal.
- Red vehicular.
- Cruces autorizados.
- Áreas restringidas.

Los peatones NPC deben utilizar rutas seguras.

No deberán atravesar arbitrariamente zonas vehiculares cuando existan caminos habilitados.

Si una ruta segura se interrumpe, el sistema deberá buscar otra válida.

Si no existe, el NPC deberá detenerse o notificar la condición.

No hacer que los trabajadores atraviesen barreras o cercos mediante animaciones.

---

# 09. CRUCES, BARANDAS Y SEGREGACIÓN

Desarrollar pasos peatonales adecuados para los puntos donde sea necesario cruzar una vía vehicular.

Evaluar:

- Continuidad.
- Señalización.
- Visibilidad.
- Protección.
- Iluminación.
- Ausencia de obstáculos.
- Control de conflictos con vehículos.

Crear protecciones físicas:

- Barandas.
- Bolardos.
- Barreras.
- Cercos.
- Separadores.

Los elementos deberán afectar las rutas de navegación.

Si el diseño evita completamente un cruce peligroso mediante caminos separados, reconocerlo como una buena solución.

No obligar al jugador a crear cruces innecesarios para obtener puntos.

---

# 10. ÍNDICE HSEC GLOBAL — 0 A 100

Implementar un puntaje dinámico.

### Distribución oficial inicial del balance

| Categoría | Máximo |
|---|---:|
| Infraestructura operativa | 15 |
| Movilidad y tránsito seguro | 25 |
| Delimitación y control de riesgos | 20 |
| Iluminación y visibilidad | 15 |
| Señalización y emergencias | 10 |
| Inspecciones y mantenimiento | 15 |
| TOTAL | 100 |

Los pesos deben almacenarse en una configuración central modificable.

### Movilidad — 25 puntos

- Conectividad vehicular: 8.
- Red peatonal segura: 8.
- Cruces adecuados o conflictos evitados: 5.
- Segregación y protección: 4.

### Evaluación

El puntaje se calcula desde condiciones verificadas.

Ejemplos:

- Un camino que no llega al acceso no cumple conectividad completa.
- Una luminaria sin cobertura efectiva no entrega el beneficio completo.
- Una ruta peatonal sin protección donde se necesita puede perder puntos.
- Una barrera dañada pierde efectividad.
- Las inspecciones vencidas afectan el componente de gestión.

No permitir obtener puntos infinitos instalando objetos repetidos.

No sumar seguridad únicamente por cantidad comprada.

### Condiciones críticas

El índice general no reemplaza el control de riesgos específicos.

Mantener una evaluación separada de cumplimiento obligatorio por zona y actividad.

Una faena puede registrar 90 puntos y aun así tener una operación bloqueada si existe un requisito crítico incumplido.

No representar el índice como certificación legal real o validación oficial ISO.

---

# 11. VIDA ÚTIL Y DETERIORO

Todos los activos HSEC tendrán estado persistente.

Variables:

- ID.
- Tipo.
- Nivel.
- Ubicación.
- Condición física.
- Condición visual.
- Condición funcional.
- Última inspección.
- Último mantenimiento.
- Uso acumulado.
- Vida útil estimada.
- Necesidad de intervención.

### Rango de condición

80–100: buen estado.

60–79: desgaste leve.

40–59: mantenimiento recomendado.

20–39: estado deficiente.

0–19: condición crítica o fuera de servicio, según la naturaleza del activo.

Estos rangos son configurables por tipo de elemento.

### Importante

Diferenciar desgaste estético y funcional.

Una barrera despintada puede conservar su estructura.

Repintarla recupera su visibilidad y apariencia, pero no repara una fractura.

Una luminaria puede estar limpia y aun así presentar una falla funcional.

Un camino peatonal puede estar demarcado, pero tener la superficie deteriorada.

El sistema deberá evaluar estas condiciones por separado.

### Desgaste visual

Aplicar:

- Suciedad.
- Pintura descolorida.
- Desgaste de reflectantes.
- Rayaduras.
- Deterioro superficial.
- Óxido cuando corresponda.
- Pequeñas fallas visibles.

Utilizar materiales y parámetros eficientes para mobile.

No crear un modelo pesado diferente para cada estado.

### Tiempo

Actualizar deterioro mediante tiempo simulado y uso.

No calcularlo cada frame.

Evitar deterioro excesivo durante períodos en que el jugador no está conectado.

No generar fallas permanentes que obliguen a dedicar toda la partida a reparaciones.

---

# 12. SISTEMA DE MANTENIMIENTO

Cuando un objeto necesita intervención, debe generar una tarea vinculada a su identificador real.

Ejemplos:

- Repintar barrera.
- Limpiar cono.
- Reemplazar señalética.
- Reparar poste de luz.
- Mantener camino.
- Renovar demarcación peatonal.
- Sustituir bolardo.
- Reparar baranda.

Cada tarea incluirá:

- Problema detectado.
- Activo.
- Prioridad.
- Tiempo.
- Costo.
- Responsable.
- Materiales requeridos, cuando corresponda.
- Estado de ejecución.

### Estados

Detectada → Pendiente → Asignada → En ejecución → Verificación → Completada.

La reparación debe actualizar realmente el estado del activo.

Después se recalcula la categoría HSEC correspondiente.

No dar por completada una reparación si el problema no fue resuelto.

---

# 13. NPC HSEC — MUJER Y HOMBRE

Integrar los dos GLB aprobados.

No crear nuevos personajes.

Ambos deben mantener:

- Rostro.
- Proporciones.
- Uniforme.
- Casco blanco.
- Chaleco naranja DRILLCO®.
- Ropa azul marino.
- Mangas completas.
- Guantes.
- Botas.
- Identificación HSEC.

Optimizar copias para mobile conservando los originales.

### Selección

Al alcanzar oficina nivel 2:

Mostrar dos candidatos profesionales.

El jugador elige a cuál contratar.

Ambos tendrán iguales capacidades iniciales, oportunidades de progresión y funciones.

No establecer diferencias profesionales por género.

### Comportamiento autónomo

El NPC no debe permanecer inmóvil esperando instrucciones.

Implementar:

- Caminar.
- Revisar instalaciones.
- Utilizar rutas peatonales.
- Inspeccionar activos.
- Registrar hallazgos.
- Notificar problemas.
- Realizar mantenimiento ligero.
- Verificar reparaciones.
- Regresar a oficina.
- Descansar según turno.
- Interactuar con el jugador.

Las rutinas deben responder al estado real del mundo.

No crear conversaciones que inventen problemas inexistentes.

### Responsabilidades

El prevencionista se especializa en:

- Inspeccionar.
- Detectar riesgos.
- Priorizar hallazgos.
- Verificar medidas.
- Guiar al jugador.
- Supervisar condiciones operacionales.

Inicialmente podrá hacer mantenimiento sencillo, como limpieza, repintado menor o sustitución de conos.

Las reparaciones complejas quedarán reservadas para futuros empleados de mantenimiento.

No convertir al prevencionista en mecánico de todas las instalaciones.

---

# 14. ÍNDICE DE PARIDAD

Agregar una métrica de representación de mujeres y hombres dentro de la gestión de Personal.

Debe ser informativa y separada del índice HSEC.

No modificar automáticamente el rendimiento, salario o competencia de un colaborador por género.

No impedir contrataciones.

Cuando la dotación sea demasiado pequeña para una interpretación significativa, indicarlo en la interfaz.

Mantener el sistema preparado para futuras ampliaciones de gestión de colaboradores.

---

# 15. ILUMINACIÓN Y CICLO DÍA/NOCHE

Aprovechar el reloj del juego existente.

No reconstruirlo si ya funciona.

Las luminarias deberán:

- Encenderse al oscurecer.
- Proyectar luz real en el motor.
- Tener cobertura medible.
- Disponer de condición funcional.
- Poder deteriorarse.
- Requerir mantenimiento.
- Influir en operaciones nocturnas.

La evaluación debe considerar la cobertura real de caminos, cruces y zonas operacionales.

No entregar puntaje completo por instalar postes lejos de las áreas necesarias.

Mostrar una previsualización de cobertura durante su colocación.

Mantener efectos compatibles con rendimiento mobile.

---

# 16. PANEL HSEC PREMIUM

Integrar un panel HSEC dentro de la arquitectura actual del juego.

No crear aplicaciones innecesarias en el teléfono.

Este panel deberá mostrar:

- Índice general 0–100.
- Estado operacional.
- Seis categorías.
- Seis SVG oficiales V3.
- Puntaje por categoría.
- Problemas detectados.
- Riesgos críticos.
- Inspecciones pendientes.
- Órdenes de trabajo.
- Historial de cambios.
- Prevencionista contratado.

### Identidad

Utilizar:

- Fondo oscuro translúcido.
- Bordes finos.
- Íconos neón V3.
- Barras de progreso.
- Indicadores de condición.
- Tarjetas compactas.
- Tipografía consistente.

Los íconos deben verse nítidos a tamaño pequeño.

No redibujarlos desde la lámina.

### Historial

Cada cambio significativo debe poder explicarse.

Ejemplo:

Día 4: 86 puntos.

Día 5: 82 puntos por deterioro de señalización.

Día 6: 77 puntos por luminaria fuera de servicio.

Día 6: 85 puntos después de reparación.

No disminuir puntajes sin causa identificable.

---

# 17. MISIÓN 2 — PREPARA TU OPERACIÓN

### Objetivo central

«Cumple las condiciones mínimas para comenzar a operar».

### Etapa 1 — Oficina

Subir oficina existente a nivel 2.

Desbloquear contratación.

### Etapa 2 — Galpón

Habilitar sector constructivo.

Construir galpón nivel 1.

### Etapa 3 — Conectividad vehicular

Construir la ruta logística entre oficina y galpón.

Verificar conexión.

### Etapa 4 — Conectividad peatonal

Construir senderos peatonales entre accesos de ambos edificios.

Validar que el personaje y los NPC puedan recorrerlos.

### Etapa 5 — Segregación segura

Resolver cruces y protecciones necesarias.

No exigir cruces si existe una separación segura de redes.

### Etapa 6 — Iluminación

Instalar luminarias.

Cubrir accesos, rutas y zonas requeridas.

### Etapa 7 — Delimitación

Entregar un kit inicial de conos.

Delimitar la zona indicada por la misión.

### Etapa 8 — Contratación

Elegir uno de los dos prevencionistas HSEC.

Incorporarlo físicamente al juego.

### Etapa 9 — Inspección

El NPC recorre la operación y revisa:

- Edificios.
- Caminos vehiculares.
- Rutas peatonales.
- Cruces.
- Iluminación.
- Señalética.
- Delimitación.

Genera hallazgos reales si existen problemas.

### Etapa 10 — Habilitación inicial

Alcanzar el umbral inicial de 80/100.

Resolver incumplimientos críticos.

Registrar la inspección como aprobada dentro de la simulación.

Completar la misión.

Desbloquear la siguiente etapa.

Si el puntaje baja en el futuro, aplicar restricciones a las operaciones afectadas, sin borrar automáticamente la misión ya completada ni duplicar recompensas.

---

# 18. PINES Y EXPERIENCIA DE USUARIO

Mantener el sistema neón aprobado.

Amarillo: principal.

Cian: secundario.

Magenta: opcional.

Utilizar los SVG V3 de las categorías cuando corresponda mostrar el tipo de tarea.

No usar el color de categoría como sustituto de la prioridad.

### Ejemplos

Construir galpón: pin sobre lote habilitado.

Crear camino vehicular: origen y destino.

Crear sendero: accesos peatonales conectables.

Instalar iluminación: indicar áreas sin cobertura.

Delimitar zona: mostrar perímetro esperado.

Inspeccionar: pin sobre el prevencionista o activo.

Reparar: pin sobre el elemento deteriorado.

El jugador debe saber dónde ir, qué hacer y qué recompensa funcional obtiene.

Evitar misiones excesivamente difíciles o con requisitos ambiguos.

---

# 19. ECONOMÍA Y PROGRESIÓN

Utilizar el sistema de créditos, energía y experiencia existente.

No crear nuevas monedas.

Las construcciones y reparaciones tendrán costos y tiempos configurables.

Las recompensas pueden incluir:

- Créditos.
- Experiencia.
- Conocimiento.
- Desbloqueos.
- Mejoras de infraestructura.

Los valores deberán equilibrarse con la economía existente.

La Misión 2 debe poder completarse con recursos razonables, sin compras externas ni esperas excesivas.

El índice HSEC es una evaluación operacional, no una moneda.

---

# 20. ARQUITECTURA TÉCNICA

Implementar los sistemas mediante componentes reutilizables.

Entidades recomendadas:

- AssetDefinition.
- PlacedAsset.
- AssetCondition.
- RoadSegment.
- PedestrianPathSegment.
- ControlledCrossing.
- TrafficSeparation.
- HsecZone.
- HsecRule.
- Inspection.
- Finding.
- MaintenanceWorkOrder.
- Employee.
- EmployeeAssignment.
- HsecScoreSnapshot.
- MissionProgress.

Adaptar los nombres a la estructura real del proyecto.

No duplicar clases existentes innecesariamente.

### Principios técnicos

- Guardar condición individual por activo.
- Actualizar deterioro según reloj y uso.
- Calcular puntajes por reglas.
- Ejecutar navegación NPC separada.
- Mantener estados persistentes.
- Utilizar eventos para actualizar resultados.
- Evitar cálculos globales por frame.
- Centralizar parámetros de balance.

---

# 21. ORDEN DE IMPLEMENTACIÓN

Trabajar por fases verificables.

### Fase A — Auditoría y extracción

Leer lámina y paquetes.

Validar archivos SVG V3.

Validar GLB.

Generar matriz de activos.

Revisar sistemas actuales de Builder, misiones, tiempo y personal.

### Fase B — Infraestructura

Oficina L2.

Galpón L1.

Caminos vehiculares.

Senderos peatonales.

Cruces y protecciones.

Iluminación.

Conos y delimitación.

### Fase C — Seguridad dinámica

Puntaje 0–100.

Reglas.

Deterioro.

Vida útil.

Inspecciones.

Mantenimiento.

Historial.

### Fase D — NPC

Selección mujer/hombre.

Contratación.

Rigging e integración.

Navegación.

Rutinas.

Inspecciones.

Mantenimiento ligero.

### Fase E — Interfaz HSEC

Importación directa de los seis íconos SVG V3.

Panel.

Tarjetas.

Indicadores.

Órdenes de trabajo.

### Fase F — Misión y validación

Integración completa de la Misión 2.

Pruebas funcionales.

Persistencia.

Optimización mobile.

No reemplazar implementaciones funcionales sin motivo técnico.

---

# 22. PRUEBAS DE ACEPTACIÓN

Verificar:

1. Los seis SVG V3 se importan correctamente.
2. Ningún símbolo ha sido redibujado o deformado.
3. Las versiones blancas y neón mantienen la misma forma.
4. El color de categoría no se confunde con la prioridad de misión.
5. Oficina L2 habilita contratación.
6. Galpón L1 tiene accesos diferenciados.
7. Camino vehicular se conecta correctamente.
8. Camino peatonal es independiente y transitable.
9. Los NPC utilizan rutas peatonales.
10. Cruces y protecciones modifican la navegación.
11. Un camino incompleto no obtiene puntaje total.
12. Una ruta correctamente construida mejora el índice.
13. La iluminación cubre efectivamente las zonas requeridas.
14. Los conos delimitan un área real.
15. Los dos GLB HSEC se pueden contratar en partidas separadas.
16. El NPC contratado no aparece duplicado.
17. Un activo se deteriora visualmente.
18. Ese deterioro modifica su condición.
19. El prevencionista detecta el problema.
20. Se genera una orden de trabajo.
21. La reparación modifica el activo.
22. El puntaje se recalcula correctamente.
23. Un riesgo crítico puede bloquear una actividad aunque el índice global sea alto.
24. El índice nunca supera 100.
25. Guardar y cargar conserva puntajes, activos, empleados y tareas.
26. No existen regresiones en la Cámara B, HUD, locomoción o misiones anteriores.
27. El rendimiento es adecuado para mobile horizontal.

---

# 23. ENTREGABLES OBLIGATORIOS

Entregar:

**A. Matriz de extracción visual**

Todos los activos reconocidos en la lámina HSEC V2, categorizados.

**B. Confirmación de importación de íconos**

Mostrar los seis SVG V3 originales renderizados en el panel real del juego.

No basta con una captura de la lámina original.

**C. Escenario jugable**

Oficina L2, galpón L1, red vehicular, red peatonal, iluminación y delimitación.

**D. Prueba NPC**

Prevencionista caminando por rutas seguras e inspeccionando activos.

**E. Prueba de deterioro**

Estado inicial → desgaste → inspección → mantenimiento → recuperación.

**F. Panel HSEC**

Seis categorías, puntaje dinámico e historial.

**G. Misión 2 completa**

Desde mejora de oficina hasta inspección inicial y desbloqueo.

**H. Validación técnica**

Persistencia, colisiones, rendimiento y ausencia de regresiones.

---

# 24. RESULTADO FINAL ESPERADO

DRILL RUN NEXT GENERATION debe convertirse en una operación minera viva y administrable.

El jugador construye instalaciones y redes seguras.

Los trabajadores utilizan realmente la infraestructura.

Los activos envejecen, se deterioran y necesitan mantenimiento.

El prevencionista realiza inspecciones y genera tareas.

El puntaje HSEC sube o baja según condiciones verificables.

La interfaz utiliza los seis íconos minimalistas SVG V3 de forma uniforme, limpia y reconocible.

La seguridad debe aportar profundidad al juego sin hacerlo excesivamente difícil.

**Principio de diseño:**

«Construir una faena segura es el primer desafío. Mantenerla segura es parte de hacerla crecer».

Esta instrucción sustituye completamente las especificaciones anteriores de HSEC y debe integrarse conservando la calidad gráfica premium y las funcionalidades ya aprobadas.