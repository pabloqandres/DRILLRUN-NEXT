# V62 · Faros cálidos originales y botas sobre pavimento de Patio

## Evidencia enviada por usuario
Cuatro capturas comparativas: imagen nocturna nueva con haz rectangular blanco, brillante, de aspecto «sable láser» sobre el suelo; imagen antigua con dos faros cálidos más creíbles. El avatar presenta unos centímetros de hundimiento de suelas sobre asfalto del Patio. Solicitud explícita de responsabilidad de ChatGPT, sin prompts a otros agentes.

## Causa confirmada
- La V61 añadió un decal propio de 21 metros `makeRoadProjection` con `T.AdditiveBlending` y opacidad alta, superpuesto a los SpotLights, lo que crea franja falsa.
- `World.update` ajusta raíz e IK del avatar al `sampleGround` genérico (Patio `.19`), mientras el suelo visual usa losas `.18`, vía central `.21`, sendas elevadas `.315` y el GLB skinned tiene tolerancia en las suelas.

## Cambios concretos
1. `dist/graphics/personal-drilltruck-headlights.mjs`: reversión EXACTA a la implementación V60 aprobada como referencia cálida; sin mallas de proyección, sin material aditivo, con dos SpotLights y PointLight de proximidad.
2. `dist/chapter/game.mjs`: quitar únicamente el enlace del proyector V61 y restablecer llamada a los dos focos originales. No tocar ciclo, cash, misión, cámara, joystick, guardados o detección de colisiones.
3. `dist/animation/avatar-pavement-clearance.mjs`: soporte visual de botas (+3.2 cm sobre Patio general, +4 cm en vía central y altura precisa de senda peatonal elevada), transición suave cerca del borde. Cero fuera de Patio y en arena.
4. `dist/scene.mjs`: el avatar root y sus pruebas de suela/IK consultan la misma superficie VISUAL compensada. `sampleGround` y colisiones siguen intactas, sin escribir `state.position`.
5. Tests V52/V61 actualizados para impedir regresión del «láser» sin perder tests de colisiones y Patio; test V62 y CI especial añadidos.

## Límites
No modifica M1–M5, recursos, compras, HSEC, otras DrillTruck®, modelos GLB, sonido, navegación ni información en Cloud Save. No se publica como validación gráfica hasta ver la prueba en Android; CI sólo verifica reglas de código.

## Estado
Rama `chatgpt/v62-natural-headlights-avatar-boot-support`. PR y CI registrados tras ejecución.
