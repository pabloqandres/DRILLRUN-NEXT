// DRILL RUN · One canonical, real-asset DrillTruck image for all catalog surfaces.
// This loads EXACTLY the GLB used by the in-world gameplay vehicle, then renders
// one transparent 3D snapshot. No generative likeness, stock image or placeholder.
// Global Promise cache prevents duplicate GLB downloads / WebGL renderers.
import * as T from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {DRACOLoader} from '../vendor/DRACOLoader.js';
import {ProductPreview,cutoutPNG} from './product-preview.mjs';
import {DRILLTRUCK_GLB} from '../mission4/drilltruck.mjs';

let imagePromise=null;
export const drillTruckAssetUrl=()=>new URL('../'+DRILLTRUCK_GLB,import.meta.url).href;

export function drillTruckImage(world){
 if(!world)return Promise.reject(new Error('World unavailable for DrillTruck preview'));
 if(!imagePromise)imagePromise=renderRealTruck(world).catch(error=>{
  imagePromise=null; // Permit retry if WebGL or decoder is briefly unavailable.
  throw error;
 });
 return imagePromise;
}

async function renderRealTruck(world){
 const draco=new DRACOLoader();
 draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
 const loader=new GLTFLoader();loader.setDRACOLoader(draco);
 let gltf;
 try{gltf=await loader.loadAsync(drillTruckAssetUrl());}
 finally{draco.dispose?.();}
 if(!gltf?.scene)throw new Error('DRILLTRUCK_optimized.glb returned no scene');

 // A measured model, with the same 5 m maximum dimension used by World.initM4Visuals.
 const model=gltf.scene;
 const bounds=new T.Box3().setFromObject(model),size=new T.Vector3();
 bounds.getSize(size);
 const dimension=Math.max(size.x,size.y,size.z);
 if(!Number.isFinite(dimension)||dimension<=0)throw new Error('DrillTruck GLB has no measurable geometry');
 model.scale.setScalar(5/dimension);
 const grounded=new T.Box3().setFromObject(model);
 model.position.y-=grounded.min.y;
 model.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});

 // Keep the canvas in the document with a real measurable viewport.
 // The offscreen transform is intentionally NOT visibility:hidden/display:none:
 // those can produce 0x0 or blank snapshots on some WebGL implementations.
 const host=document.createElement('div');
 host.className='drillTruckSnapshotStage';
 host.style.cssText='position:fixed;left:0;top:0;width:640px;height:392px;transform:translate(-200vw,-200vh);pointer-events:none;z-index:-9999;overflow:hidden';
 document.body.append(host);
 let preview;
 try{
  preview=new ProductPreview(host,world,{transparent:true});
  preview.model=model;
  preview.product={id:'drilltruck'};
  preview.angle=-.69;
  preview.scene.add(model);
  preview.draw();
  const canvas=preview.renderer.domElement;
  if(!canvas.width||!canvas.height)throw new Error('DrillTruck preview canvas is empty');
  const image=cutoutPNG(canvas);
  if(!image.startsWith('data:image/png;base64,')||image.length<150)throw new Error('DrillTruck preview PNG is empty');
  return image;
 }finally{
  preview?.dispose();
  host.remove();
 }
}
