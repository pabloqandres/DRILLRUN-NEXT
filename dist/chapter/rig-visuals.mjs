// DRILL RUN NEXT GENERATION — read-only 3D rig visuals.
// Machinery is generic and unbranded; only DRILLCO-approved drill tools may be
// represented as branded products. No economic/mission/save changes.
import * as T from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';

const RIGS=Object.freeze({
 rig_rc_compact:{mesh:'drill_rc_sondaje_optimized.glb',image:'drill_rc_sondaje_catalog.webp',type:'rc'},
 rig_rc_advanced:{mesh:'drill_rc_sondaje_optimized.glb',image:'drill_rc_sondaje_catalog.webp',type:'rc'},
 rig_dth_production:{mesh:'drill_dth_produccion_optimized.glb',image:'drill_dth_produccion_catalog.webp',type:'dth'}
});
const loads=new Map();
const loader=new GLTFLoader();

export const rigAssetSpec=id=>RIGS[id]||null;
export const rigCatalogImageUrl=id=>RIGS[id]?new URL('../assets/catalog/'+RIGS[id].image,import.meta.url).href:null;
export const rigGlbUrl=id=>RIGS[id]?new URL('../assets3d/'+RIGS[id].mesh,import.meta.url).href:null;

export async function loadRigVisual(id){
 const url=rigGlbUrl(id);
 if(!url)throw new Error('Unknown rig type: '+id);
 if(!loads.has(url))loads.set(url,loader.loadAsync(url).then(result=>{
  if(!result?.scene)throw new Error('Rig GLB has no scene: '+id);
  return result.scene;
 }).catch(err=>{loads.delete(url);throw err;}));
 const scene=(await loads.get(url)).clone(true);
 scene.name='optimized-unbranded-'+id;
 scene.traverse(child=>{
  if(child.isMesh){child.castShadow=true;child.receiveShadow=true;child.frustumCulled=true;}
 });
 return scene;
}

// Keep the legacy mission-3 rig wrapper and named animated head/shaft so
// animateDrill(), moving borehole coordinates and collider references survive.
// The old geometric chassis is removed ONLY after the real asset loads.
export async function upgradeRcRigVisual(wrapper,id){
 if(!wrapper||!RIGS[id]||RIGS[id].type!=='rc')return false;
 const scene=await loadRigVisual(id);
 if(!wrapper.parent)return false; // Player changed game / drill while loading.
 const head=wrapper.getObjectByName('carriage');
 const shaft=wrapper.getObjectByName('drillShaft');
 head?.removeFromParent();shaft?.removeFromParent();
 wrapper.clear();
 wrapper.add(scene);
 if(head){
  head.position.set(0,3.2,1.05);
  head.material=new T.MeshToonMaterial({color:0x728a96});
  wrapper.add(head);
 }
 if(shaft){
  shaft.position.set(0,1.7,1.05);
  shaft.material=new T.MeshStandardMaterial({color:0x54646f,metalness:.25,roughness:.65});
  wrapper.add(shaft);
 }
 wrapper.userData.optimizedRig=id;
 return true;
}
