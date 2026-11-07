# 2026-11-07 — Retratos de Personal en Catálogo

## Problema
La categoría Personal dibujaba el icono genérico de Seguridad para cada profesión porque el thumbnail no retornaba imagen. Los retratos originales existentes en `crew-portraits.mjs` solo se utilizaban en otras vistas.

## Cambio
Se conecta `crewPortrait(role)` con las tarjetas de `CatalogView` y con la ficha técnica expandida, exclusivamente cuando `kind==='personnel'`. El resto de categorías mantiene su imagen y fallback existente. Ajustes CSS de encuadre vertical.

## Alcance
Solo visual. Sin modificar contratación, requisitos, economía, inventario, save ni lógica de misión. Requiere prueba visual en navegador, particularmente tarjeta bloqueada y retrato expandido.
