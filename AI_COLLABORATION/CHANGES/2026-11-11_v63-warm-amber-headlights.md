# V63 · Faros ámbar y reflejo cálido difuso sobre pavimento

## Evidencia
El usuario confirma que la luz mejoró al regresar a V62, pero pide el tono cálido de la referencia anterior. En captura adicional observa que no se refleja la iluminación sobre el asfalto. Se solicita implementación directamente por ChatGPT, sin prompts externos.

## Implementación
- `dist/graphics/personal-drilltruck-headlights.mjs`: color de SpotLight ajustado a ámbar cálido `0xffd19a`, fill a `0xffbd7f`, lentes `0xffd7a5`. No se cambia cono de 35 m, intensidad, dirección ni el control del vehículo.
- Se agregan **solo dos manchas pequeñas ovales** (centros +3.8 y +7.1 m), con gradiente RGBA radial hasta alfa cero, mezcla `NormalBlending`, sin sombras adicionales ni el proyector/trapecio blanco de 21m que el usuario rechazó en V61.
- Cada una usa geometría 7x7 que sigue la pendiente real según `World.sampleGround`, y altura suficiente para reflejarse sobre el pavimento pintado; el rebote desaparece con faros apagados y en día reduce opacidad al 13% de la nocturna.
- `dist/chapter/game.mjs`: solo hook visual acotado para pasar `world` al crear faros, calcular hora HSEC (misma fórmula existente del patio) y actualizar geometría con posición/rumbo. Sin modificar física, misiones, HSEC, economía ni saves.
- Tests V52/V61/V62 actualizados a la nueva representación y nuevo test V63 + workflow focal.

## Riesgo y QA
V63 añade geometría mínima y una textura 96x96 solo en unidad personal 02; sin marcas externas ni GLB nuevos. Pruebas estáticas/CI no garantizan fidelidad cromática Android. Visual validación en partida del usuario después de publicar. El objetivo es una iluminación cálida creíble sin efecto láser.

## Estado
Branch `chatgpt/v63-warm-amber-personal-headlights`; PR, CI y publicación se documentan tras validación.
