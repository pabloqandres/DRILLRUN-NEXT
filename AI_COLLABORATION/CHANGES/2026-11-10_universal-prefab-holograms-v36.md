# V36 · Hologramas de construcción universales

## Regla permanente de DRILL RUN NEXT GENERATION
Desde Oficina L1 (M1) hasta los edificios futuros:
- Catálogo → selecciona edificio prefabricado → aparece la geometría 3D real como holograma **en su lugar fijo** y se ve desde la **cámara normal del jugador**.
- Se puede inspeccionar andando por la faena con **Recorrer** y botón claro para cerrar la vista previa; opcionalmente alternar **Vista construcción** sin mover el avatar ni cambiar su ubicación guardada.
- La inspección nunca compra, inicia obra, toca Cloud Save, genera inventario ni consume recursos.
- La confirmación de compra desencadena el mismo **ConstructionHologram** de la Oficina L1: aristas cian, escaneo vertical, glow y progreso temporal. Al terminar se materializa el edificio real.
- Para edificios nuevos, registrar `previewSite` o `model.fixed` y geometría del modelo real. No usar imágenes de catálogo como sustituto del preview in-world.

## Integración
1. `dist/chapter/building-blueprint.mjs`: controlador universal compartido con ConstructionHologram; reconoce Oficina, taller, galpón HSEC, Patio L1 y futuros prefabs registrados con ancla fija. Lee modelos reales, no muta partidas.
2. `dist/chapter/catalog-view.mjs`: botones discretos `Recorrer` y `Vista construcción` separados de los controles de pago para que nunca desaparezca el botón de compra.
3. `dist/chapter/builder-ui.mjs`: todos los prefabs del Catálogo envían selección al mismo controlador.
4. `dist/chapter/game.mjs`: preview desde cámara del personaje por defecto; vista panorámica opcional; overlay `Cerrar vista previa` en modo recorrer. Obra del Taller L1/L2 también usa escáner holográfico, sin cambios en economía.
5. `dist/mission5/patio-world.mjs`: Patio 54×44 utiliza la misma clase exacta de holograma durante su construcción de 20 minutos. Fuente 3D estructural compartida y montaje progresivo de los módulos reales (terreno, marquesina de flota ligera, galpón, combustible, control HSEC).
6. `dist/graphics/desert.mjs`: reemplaza las falsas montañas truncadas por mesetas erosionadas asimétricas con estratificación y siluetas naturales; solo fondo, sin afectar la geometría transitable ni los límites de M5.
7. `dist/index.html` y `dist/chapter/hud-reference-v4.css`: nuevos controles de preview en vista horizontal del teléfono, sin tapar joystick ni botón de compra.
8. `tests/universal-building-blueprint-v36.test.mjs`: pruebas de sitio y cámara, no cobro, efecto homologado, M5 temporizado y montañas nuevas.

## QA de motor
- Sintaxis de módulos de UI, M5, holograma y terreno validada.
- Vista previa de Oficina L1 (-6,0), Taller (-7.6,-9.3), galpón HSEC (6,-4), Patio L1 (-51,-17).
- Estados M5: blueprint -> grading -> mounting -> commissioning, después de exactamente 1200 segundos, un solo cargo de 45000.
- **No verificado en dispositivo:** renderizado visual WebGL/Android de holograma de tamaño 54×44, jerarquía visual del catálogo y animación en teléfono. Requiere revisión en gameplay real para perfilar calidad y rendimiento, sin modificar guardado.

## No modificar
M1–M4, Cloud Save, compra de consumibles, precio de Patio L1, misión M4 en producción, flota del Patio ni rutas.
