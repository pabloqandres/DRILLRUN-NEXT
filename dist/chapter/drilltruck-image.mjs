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
 // Purchased vehicle: use the EXACT GLB already visible in the world first.
 // A cloned mesh gets private geometry, so disposing the preview cannot break
 // the installed truck, its animation or its collision/route state.
 const live=world.scene?.getObjectByName?.('drilltruck-wrapper');
 let model=null;
 if(live?.children?.length){
  model=live.clone(true);
  model.position.set(0,0,0);model.rotation.set(0,0,0);model.visible=true;
  let meshes=0;
  model.traverse(node=>{
   node.visible=true;
   if(node.isMesh){meshes++;if(node.geometry)node.geometry=node.geometry.clone();}
  });
  if(!meshes)model=null;
 }
 if(!model){
  const draco=new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  const loader=new GLTFLoader();loader.setDRACOLoader(draco);
  let gltf;
  try{gltf=await loader.loadAsync(drillTruckAssetUrl());}
  finally{draco.dispose?.();}
  if(!gltf?.scene)throw new Error('DRILLTRUCK_optimized.glb returned no scene');
  // Same real 5m-scale geometry the game uses, including its rear mechanical arm.
  model=gltf.scene;
  const bounds=new T.Box3().setFromObject(model),size=new T.Vector3();
  bounds.getSize(size);
  const dimension=Math.max(size.x,size.y,size.z);
  if(!Number.isFinite(dimension)||dimension<=0)throw new Error('DrillTruck GLB has no measurable geometry');
  model.scale.setScalar(5/dimension);
  const grounded=new T.Box3().setFromObject(model);
  model.position.y-=grounded.min.y;
 }
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
  // A data URL from a blank transparent frame is still valid PNG text. Inspect
  // alpha coverage so a silent WebGL failure is never presented as a real photo.
  const probe=document.createElement('canvas');probe.width=canvas.width;probe.height=canvas.height;
  const context=probe.getContext('2d',{willReadFrequently:true});
  context.drawImage(canvas,0,0);
  const pixels=context.getImageData(0,0,probe.width,probe.height).data;
  let visiblePixels=0;
  for(let i=3;i<pixels.length;i+=32)if(pixels[i]>20)visiblePixels++;
  if(visiblePixels<12)throw new Error('DrillTruck model rendered a transparent/blank frame');
  const image=cutoutPNG(canvas);
  if(!image.startsWith('data:image/png;base64,')||image.length<150)throw new Error('DrillTruck preview PNG is empty');
  return image;
 }finally{
  preview?.dispose();
  host.remove();
 }
}
