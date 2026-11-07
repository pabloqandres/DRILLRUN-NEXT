// DRILL RUN · Instant static DrillTruck catalog image.
// This WebP was captured offline from the exact playable DRILLTRUCK_optimized.glb.
// Catalog/technical sheet/Phone share a small 2D asset: no GLB fetch, GPU renderer,
// decoder, or runtime screenshot is started for these UI views.
// The actual vehicle in the 3D world still uses the original GLB unchanged.
export const DRILLTRUCK_IMAGE_URL=new URL('../assets/catalog/drilltruck.webp',import.meta.url).href;
export const drillTruckImage=()=>Promise.resolve(DRILLTRUCK_IMAGE_URL);
