// DRILL RUN · Asset Library Wave 01 · Visual-only catalog projection.
// Every asset is shown from a genuine render of the user's 3D model.
// Does not create or modify mission state, ledger, economy, save schema or purchases.
// Intended to ship separately from the subsequent functional purchase/placement work.

export const ASSET_LIBRARY_WAVE01=Object.freeze([
 {id:'contenedor-azul-reciclaje',title:'Contenedor · reciclaje',area:'circularity',cell:2,asset:'contenedor_azul_reciclaje.glb',w:.72,d:.81,h:1.22,benefit:'Separación de residuos recuperables · gestión ambiental',mission:6},
 {id:'contenedor-verde-reciclaje',title:'Contenedor · residuos segregados',area:'circularity',cell:3,asset:'contenedor_verde_reciclaje.glb',w:.82,d:.83,h:1.22,benefit:'Acopio segregado y retiro programado',mission:6},
 {id:'contenedor-oscuro-residuos',title:'Contenedor · residuos generales',area:'circularity',cell:4,asset:'contenedor_oscuro_residuos.glb',w:.76,d:.86,h:1.22,benefit:'Orden y segregación de residuos en faena',mission:6},
 {id:'montacargas-bodega',title:'Montacargas logístico',area:'equipment',cell:5,asset:'montacargas_bodega.glb',w:1.50,d:3.75,h:2.55,benefit:'Movimiento de pallets dentro del recinto logístico',mission:7},
 {id:'cargador-frontal-a',title:'Cargador frontal · compacto',area:'equipment',cell:6,asset:'cargador_frontal_a.glb',w:3.20,d:8.03,h:4.0,benefit:'Preparación y mantenimiento de superficies',mission:7},
 {id:'cargador-frontal-b',title:'Cargador frontal · pesado',area:'equipment',cell:7,asset:'cargador_frontal_b.glb',w:2.79,d:7.51,h:4.0,benefit:'Movimiento de materiales · ampliación de capacidad',mission:8},
 {id:'galpon-bodega',title:'Galpón logístico · expansión',area:'infrastructure',cell:8,asset:'galpon_bodega.glb',w:23.83,d:43.08,h:7.0,benefit:'Bodega de apoyo para stock y operaciones · futura misión',mission:6,building:true},
 {id:'edificio-industrial-49',title:'Edificio de servicios · expansión',area:'infrastructure',cell:9,asset:'edificio_industrial_49.glb',w:11.32,d:7.02,h:6.0,benefit:'Servicios industriales para expansión progresiva',mission:7,building:true}
]);
export const ASSET_WAVE_VISUAL_ONLY=true;
export const waveAssetBaseUrl=new URL('../assets3d/drillrun-pack/',import.meta.url);
// A compact sprite generated from the 14 ORIGINAL optimized GLB render previews.
// Embedding prevents a missing CDN binary or another agent's asset merge from breaking cards.
export const waveAtlasUrl='data:image/webp;base64,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';

const ATLAS_CELLS={
 cone:0,fence:1
};
export function waveCellForProduct(product){
 if(product?.assetWaveCell!==undefined&&product?.assetWaveCell!==null)return product.assetWaveCell;
 return product?.kind==='hsec'?ATLAS_CELLS[product.id]:undefined;
}
export function waveAtlasArtwork(product){
 const cell=waveCellForProduct(product);
 if(!Number.isInteger(cell)||cell<0||cell>=14)return '';
 const column=cell%4,row=Math.floor(cell/4);
 const x=(column*100/3).toFixed(4),y=(row*100/3).toFixed(4);
 // Sanitized fixed atlas URLs + numeric constants only (no user-supplied HTML).
 return '<span class="wave01ModelArtwork" role="img" aria-label="Vista del modelo 3D original" style="display:block;width:100%;height:100%;min-height:52px;background-image:url('+waveAtlasUrl+');background-size:400% 400%;background-position:'+x+'% '+y+'%;background-repeat:no-repeat"></span>';
}
export function waveProducts(s){
 // These entries are VISUAL previews only. Prices must come from the actual
 // economic model and placements must be saved before enabling the purchase CTA.
 // Never expose a false paid action or silently route to HSEC purchaseFixed().
 return ASSET_LIBRARY_WAVE01.map(p=>({
  id:'asset-'+p.id,kind:p.building?'building':'assetLibrary',
  category:p.area,title:p.title,level:1,description:p.benefit,
  benefit:p.benefit,price:null,seconds:null,w:p.w,d:p.d,h:p.h,
  capacity:null,status:'future',reason:'Expansión futura · misión '+p.mission,
  model:{id:p.id,asset:p.asset},assetWaveCell:p.cell,assetWavePath:p.asset,
  canStart:false,action:'preview',insufficient:false
 }));
}
export function wavePreviewModelUrl(product){
 const filename=ASSET_LIBRARY_WAVE01.find(x=>'asset-'+x.id===product?.id)?.asset;
 return filename?new URL(filename,waveAssetBaseUrl).href:null;
}
