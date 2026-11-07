# 2026-11-07 — HSEC: eliminar baliza sin interacción

## Solicitud
Un rombo amarillo con icono de carretera, distancia «1m» y un halo en el suelo sigue iluminado junto al taller. Da a entender que al acercarse habrá una acción, pero no tiene una.

## Diagnóstico
`dist/chapter/guidance.mjs` devolvía `missionGoal(s)` para toda partida con `chapterCompletedAt` (HSEC activa), sin considerar que la misión posterior ya estuviera activa ni si el destino admite interacción. El halo y el marcador se dibujaban continuamente aunque los pasos HSEC se realizan desde la construcción.

## Cambio
- `missionDestination(s)` devuelve `null` para objetivos de HSEC que no tienen interacción física.
- El HUD mantiene el checklist de HSEC y sus instrucciones; no se borra progreso.
- La rutina `ObjectiveGuide.update` existente elimina los marcadores y los halos obsoletos al siguiente update.
- Los marcadores del capítulo de despeje y de interacciones con entrada/computador permanecen.
- Ningún cambio a geometría, economía, colisiones, misiones ni guardado.

## Coordinación
Excepción de alcance UX en `guidance.mjs` autorizada por la solicitud explícita del usuario. Archivo habitualmente de responsabilidad funcional; alcance exclusivamente de visualización del destino. PR pendiente revisión.

## Verificación
Comprobación estática de código en la rama: condición de salida HSEC presente, retorno antiguo eliminado, interacciones de despeje conservadas, mecanismo de disposal conservado. No se corrió QA visual WebGL ni despliegue. Validar en la partida real M2/M3/M4 y verificar que se conserva el HUD de objetivos.
