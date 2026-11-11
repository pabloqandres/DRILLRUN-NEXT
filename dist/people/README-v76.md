# Personal V76 — fuente de candidatos y arte

## Identidad y licencias de la interfaz
- 21 personajes ficticios originales: tres por cada uno de siete roles.
- Retratos en \`dist/assets/people/v76/<candidate-id>.svg\`: ilustraciones vectoriales cel shading con tres planos de sombra, contornos y EPP genérico.
- **Prohibición absoluta** de logos, letras comerciales, emblemas de fabricantes y marcas, incluidas las internas. No añadirlas salvo aprobación explícita del usuario.
- Los retratos son una **primera implementación vectorial** para revisión; no son fotografías ni modelos GLB. Los NPC en el terreno reutilizan los rigs actuales por rol, hasta que se construyan y aprueben los nuevos GLB individuales.
- No inferir origen, edad exacta ni identidad real de las personas a partir de los retratos ficticios.

## Contratación de la partida
- La única fuente de costos base y bloqueos sigue siendo \`mission3/personnel.mjs\` y \`mission5/patio-staff.mjs\`.
- \`people/personnel-candidates-v76.mjs\` añade \`coste de candidato - coste base\` como prima diferenciadora **después** de validar saldo total y ejecutar la contratación normal, con un único registro adicional \`candidatePremium\` en ledger.
- Contratar persiste \`candidateId\`, \`displayName\`, \`profileSkills\`, \`profileSkillsVersion=1\`, \`skillsGameplayActive=false\` y \`hireCost\` en la misma entidad contratada; sin reemplazar el schema global.
- Si se selecciona un personaje contratado en una partida antigua que no tiene \`candidateId\`, la interfaz presenta “Personal contratado” sin inventar su identidad.
- El prevencionista contratado en M2 se conserva y se cuenta en Equipo activo (no se cobra nuevamente).
- Las contrataciones M5 siguen asignándose a sus GLB de **rol** en las posiciones actuales. La identidad visual del retrato se conserva en el perfil del staff.

## Roles y candidatos
| Rol | Candidato 1 | Candidato 2 | Candidato 3 |
| --- | --- | --- | --- |
| Administrador | adm-camila · Camila Rojas · 800 | adm-matias · Matías Torres · 1.050 | adm-sofia · Sofía Ibarra · 1.250 |
| Operador | opr-diego · Diego Araya · 600 | opr-fernanda · Fernanda Soto · 750 | opr-tomas · Tomás Fuentes · 950 |
| Ayudante | aux-lucas · Lucas Medina · 250 | aux-valentina · Valentina Quiroga · 320 | aux-nicolas · Nicolás Paredes · 400 |
| Especialista HSEC | hsec01 · Ana Marín · 350 | hsec02 · Javier Ríos · 450 | hsec03 · Teresa Vidal · 550 |
| Técnico de Taller | tal-ignacio · Ignacio Salinas · 5.000 | tal-elena · Elena Valdés · 5.400 | tal-marcelo · Marcelo Muñoz · 5.900 |
| Guardia | grd-oscar · Óscar Fuentes · 1.800 | grd-daniela · Daniela Pizarro · 2.200 | grd-felipe · Felipe Contreras · 2.600 |
| Técnico del Patio | pat-rocio · Rocío Leiva · 2.200 | pat-andres · Andrés Vera · 2.600 | pat-paula · Paula Muñoz · 2.900 |

Los valores son costos únicos de contratación, mostrados en HUD como icono de moneda y separador de miles, nunca “CR/cr”. No existen salarios por turno en la economía original y **no se inventan**.

## Árbol de habilidades preparado, no activado
- Atributos base 1–5 por candidato, tres especialidades iniciales.
- Ruta de crecimiento con \`SKILL_CAP=5\`, \`SKILL_XP_REQUIREMENTS\` y \`ROLE_PATHWAYS\`.
- \`PLAYER_SKILL_BLUEPRINT\` prepara cinco ramas para el avatar jugador.
- \`GAMEPLAY_SKILL_EFFECTS.enabled=false\`; \`perShiftIncome\`, descuento de mantenimiento, reducción de riesgos y primas de contratos están en **cero** hasta balance explícito.
- Para habilitar efectos deberán definirse fórmula, evento que entrega XP, límite, salvaguardas de economía y migración de save. Ninguno se activa por crear esta pantalla.

## Capacidad de slots
- Es un **indicador que crece al avanzar**: M2 1, M3 4, M4 6, M5 8; nunca menor que las personas realmente contratadas.
- No cambia límites originales de cada rol ni impone cupos adicionales ocultos: los controles del juego son autoridad.

## Controles de UI
- La misión indica el próximo rol; al pulsarla, el panel navega a ese rol.
- Siete categorías y tres candidatos cada una; ficha de candidato con habilidades, costo, bloqueos y botón de contratar.
- Equipo activo muestra nombres/estatus reales y vacantes.
- Audio sintetizado con slider de 0–200%, compartido con el selector de avatares, opción general Sonido y vibración opcional.

## Validación necesaria
QA visual real Android/PC, elección de candidato, habilitación/bloqueo en M3, contratación y saldo exacto, guardar/restaurar, estado M5 genérico hasta nuevos GLB, sonido y orientación landscape. No fusionar con \`main\` antes de revisión/autoridad de despliegue.
