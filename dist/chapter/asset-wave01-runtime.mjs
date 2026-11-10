// DRILL RUN NEXT GENERATION · Asset Wave 01: real 3D model loader.
// Visual-only adapter. Never changes mission, purchase, ledger, save or HSEC state.
// The 14 GLB binaries must be present in dist/assets3d/drillrun-pack/ before use.
import * as T from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {ConstructionHologram} from './construction-hologram.mjs';

const ROOT=new URL('../assets3d/drillrun-pack/',import.meta.url);
const MODELS=Object.freeze([
 {id:'cono_seguridad',kind:'hsec',height:.75},
 {id:'cerco_perimetral',kind:'hsec',height:2.4},
 {id:'contenedor_azul_reciclaje',kind:'circularity',height:1.22},
 {id:'contenedor_verde_reciclaje',kind:'circularity',height:1.22},
 {id:'contenedor_oscuro_residuos',kind:'circularity',height:1.22},
 {id:'pallet_bodega',kind:'scenery',height:.18},
 {id:'cajon_bodega',kind:'scenery',height:.9},
 {id:'montacargas_bodega',kind:'equipment',height:2.55},
 {id:'cargador_frontal_a',kind:'equipment',height:4},
 {id:'cargador_frontal_b',kind:'equipment',height:4},
 {id:'galpon_bodega',kind:'building',height:7},
 {id:'edificio_industrial_49',kind:'building',height:6},
 {id:'estructura_auxiliar',kind:'review',height:null},
 {id:'maquinaria_obra_auxiliar',kind:'review',height:null}
]);
export const WAVE01_MODELS=MODELS;
const IDS=new Map(MODELS.map(x=>[x.id,x]));
const loader=new GLTFLoader();
const cache=new Map();

export function wave01AssetUrl(id){
 if(!IDS.has(id))throw new Error('wave01: unknown asset '+String(id));
 return new URL(id+'.glb',ROOT).href;
}
export function wave01ThumbnailUrl(id){
 if(!IDS.has(id))throw new Error('wave01: unknown thumbnail '+String(id));
 return new URL('previews/'+id+'.jpg',ROOT).href;
}
export function wave01Definition(id){return IDS.get(id)||null;}
function validateModel(scene,id){
 if(!scene||!scene.isObject3D)throw new Error('wave01 '+id+': invalid GLB scene');
 const bounds=new T.Box3().setFromObject(scene),size=new T.Vector3();
 bounds.getSize(size);
 if(![size.x,size.y,size.z].every(Number.isFinite)||Math.max(size.x,size.y,size.z)<.001)
  throw new Error('wave01 '+id+': empty or invalid geometry');
 let meshes=0;scene.traverse(node=>{if(node.isMesh&&node.geometry?.attributes?.position)meshes++;});
 if(!meshes)throw new Error('wave01 '+id+': no renderable meshes');
 return {size:{x:size.x,y:size.y,z:size.z},meshes};
}
export function wave01Load(id){
 if(!IDS.has(id))return Promise.reject(new Error('wave01: asset not in approved batch'));
 if(!cache.has(id)){
  cache.set(id,loader.loadAsync(wave01AssetUrl(id)).then(gltf=>{
   const source=gltf.scene;
   const info=validateModel(source,id);
   source.updateMatrixWorld(true);
   return {source,info,id,animations:gltf.animations||[]};
  }).catch(error=>{cache.delete(id);throw error;}));
 }
 return cache.get(id);
}
// Clone a GLB, preserving the real geometry and original embedded textures.
// MeshToonMaterial is used only for display; original GLB remains untouched.
export async function wave01Instance(id,{toon=true,normalize=false,targetHeight=null}={}){
 const {source,info}=await wave01Load(id);
 const object=source.clone(true);object.name='DRILLRUN Wave 01 · '+id;
 if(toon){
  const materialCache=new Map();
  const convert=old=>{
   if(!old||!old.isMaterial)return old;
   if(materialCache.has(old))return materialCache.get(old);
   const m=new T.MeshToonMaterial({
    color:old.color?.clone?.()||new T.Color(0xffffff),
    map:old.map||null,
    emissive:old.emissive?.clone?.()||new T.Color(0x000000),
    emissiveMap:old.emissiveMap||null,
    transparent:!!old.transparent,opacity:Number.isFinite(old.opacity)?old.opacity:1,
    side:old.side??T.FrontSide,alphaTest:old.alphaTest||0,
    depthWrite:old.depthWrite!==false
   });
   materialCache.set(old,m);return m;
  };
  object.traverse(node=>{
   if(!node.isMesh)return;
   node.material=Array.isArray(node.material)?node.material.map(convert):convert(node.material);
   node.castShadow=true;node.receiveShadow=true;
  });
 }
 if(normalize){
  const height=targetHeight||IDS.get(id).height;
  if(Number.isFinite(height)&&height>0&&info.size.y>.001)
   object.scale.multiplyScalar(height/info.size.y);
  // Ground and center for local placement in the world.
  const box=new T.Box3().setFromObject(object),center=new T.Vector3();
  box.getCenter(center);
  object.position.x-=center.x;object.position.z-=center.z;object.position.y-=box.min.y;
 }
 object.userData.assetWave01=id;
 return object;
}
export async function wave01Blueprint(id,{quality='balanced',software=false}={}){
 const definition=IDS.get(id);
 if(!definition||definition.kind!=='building')throw new Error('wave01: hologram requires a building');
 const realModel=await wave01Instance(id,{toon:false,normalize:true});
 const hologram=new ConstructionHologram(realModel,{quality,software});
 hologram.name='DRILLRUN Wave01 · blueprint cyan · '+id;
 // ConstructionHologram snapshots its own geometry, so the staging model can be detached.
 return hologram;
}
export async function wave01Probe({all=true}={}){
 const ids=all?MODELS.map(x=>x.id):MODELS.filter(x=>!['review'].includes(x.kind)).map(x=>x.id);
 const result=await Promise.all(ids.map(async id=>{
  try{const {info}=await wave01Load(id);return {id,ok:true,meshes:info.meshes,dimensions:info.size};}
  catch(error){return {id,ok:false,error:String(error?.message||error)};}
 }));
 return {ready:result.every(x=>x.ok),checked:result.length,result};
}
export function wave01DisposeInstance(obj){
 if(!obj)return;
 // Instances share cached GLB geometry, maps and textures; dispose ONLY private
 // toon materials. Never dispose cached geometry or embedded textures.
 const mats=new Set();
 obj.traverse(node=>{
  if(!node.isMesh)return;
  for(const m of(Array.isArray(node.material)?node.material:[node.material]))
   if(m?.isMeshToonMaterial)mats.add(m);
 });
 mats.forEach(m=>m.dispose());
 obj.removeFromParent();
}
