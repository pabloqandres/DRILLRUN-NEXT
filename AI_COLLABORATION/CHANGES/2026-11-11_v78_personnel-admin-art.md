# V78 · Primer lote de retratos y espacios aireados
Fecha: 2026-11-11 · ChatGPT · rama `chatgpt/v78-admin-portraits-airy-personnel`

## Alcance
- Administración de Contrato: Camila Rojas, Matías Torres, Sofía Ibarra, cada persona distinta, semirrealista/cel shading, EPP genérico y sin emblemas. Fichas y IDs existentes intactos.
- Atlas WebP `dist/assets/npc-portraits-v78/admin-roster.webp`, tres rostros en una textura para menor transferencia y caché compartida. No es un GLB; las figuras 3D del mundo permanecen iguales.
- Nuevo componente visual `pvArtPortrait` para las tres cards, ficha ampliada y equipo activo. El resto de roles conserva placeholder sin imágenes.
- Márgenes, separación, tamaños y respiración visual adaptados a pantalla con altura; diseño sin números económicos inventados y sin alterar acciones.
- Historial V76/V77 y lógica intactos.

## QA y límites
- Test V78 asegura IDs y tres cartas con arte, placeholders para roles restantes, referencia CSS de atlas y que el proceso de contratación no sea modificado.
- Suite V76 y V77 deben conservarse.
- Inspección Android pendiente hasta que el usuario pruebe el dominio público de GitHub main.
- Próximos pasos: operador de perforación, ayudante, resto de roles; extensión de lenguaje visual a otras ventanas en entregas separadas.
