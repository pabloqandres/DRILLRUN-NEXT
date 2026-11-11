import * as T from '../vendor/three.module.js';
import {SoftwareRenderer} from '../software-renderer.mjs';
// Bake one portrait from the approved GLB at load time. No new character asset or animation.
export function renderPlayerPortrait(world,host,height=1.85){
 if(!world.worker.meshes?.length)return;
 const scene=new T.Scene();scene.background=new T.Color(0x718582);scene.add(new T.HemisphereLight(0xfff2d9,0x8a9d9b,2.6));const sun=new T.DirectionalLight(0xffedce,2.8);sun.position.set(-2,4,3);scene.add(sun);
 world.player.updateMatrixWorld(true);const inverse=world.player.matrixWorld.clone().invert(),v=new T.Vector3(),geometries=[];
 for(const original of world.worker.meshes){original.skeleton.update();const geometry=original.geometry.clone(),p=geometry.attributes.position;for(let i=0;i<p.count;i++){original.getVertexPosition(i,v).applyMatrix4(original.matrixWorld).applyMatrix4(inverse);p.setXYZ(i,v.x,v.y,v.z);}geometry.deleteAttribute('skinIndex');geometry.deleteAttribute('skinWeight');geometry.computeVertexNormals();geometry.computeBoundingSphere();geometries.push(geometry);scene.add(new T.Mesh(geometry,original.material));}
 const camera=new T.PerspectiveCamera(30,1,.01,5);const ratio=height/1.85;camera.position.set(.22*ratio,1.66*ratio,1.03*ratio);camera.lookAt(0,1.58*ratio,0);camera.updateProjectionMatrix();let renderer;
 try{renderer=world.renderer.isSoftwareRenderer?new SoftwareRenderer():new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(128,128);renderer.outputColorSpace=T.SRGBColorSpace;renderer.render(scene,camera);const img=new Image();img.alt='';img.src=renderer.domElement.toDataURL('image/png');host.replaceChildren(img);}catch{}finally{renderer?.dispose?.();geometries.forEach(g=>g.dispose());}
}


// V68 · One source-backed, static full-body reference from the SAME playable GLB.
// Render once per avatar and cache its PNG. This never adds a second active
// WebGL view or substitutes a generated/fabricated character illustration.
export function renderFullBodyPortrait(world,host,height=1.85){
 if(!world?.worker?.meshes?.length||!host)return false;
 const scene=new T.Scene();
 scene.background=null;
 scene.add(new T.HemisphereLight(0xe2f4ff,0x273549,2.8));
 const key=new T.DirectionalLight(0xffe0b3,3.7);
 key.position.set(-2.4,4.5,3.5);scene.add(key);
 const rim=new T.DirectionalLight(0x6ddaff,1.55);
 rim.position.set(3,2.8,-2);scene.add(rim);
 world.player.updateMatrixWorld(true);
 const inv=world.player.matrixWorld.clone().invert(),v=new T.Vector3(),geometries=[];
 for(const original of world.worker.meshes){
  if(!original.geometry?.attributes?.position)continue;
  original.skeleton?.update?.();
  const geometry=original.geometry.clone(),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   original.getVertexPosition(i,v).applyMatrix4(original.matrixWorld).applyMatrix4(inv);
   p.setXYZ(i,v.x,v.y,v.z);
  }
  geometry.deleteAttribute('skinIndex');
  geometry.deleteAttribute('skinWeight');
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  geometries.push(geometry);
  scene.add(new T.Mesh(geometry,original.material));
 }
 if(!geometries.length)return false;
 const camera=new T.PerspectiveCamera(28,280/540,.06,20);
 camera.position.set(height*.28,height*.91,height*2.30);
 camera.lookAt(0,height*.50,0);
 camera.updateProjectionMatrix();
 let renderer,success=false;
 try{
  renderer=world.renderer.isSoftwareRenderer?new SoftwareRenderer():new T.WebGLRenderer({
   alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'
  });
  renderer.setPixelRatio(1);
  renderer.setSize(280,540);
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.setClearColor(0x000000,0);
  renderer.render(scene,camera);
  const img=new Image();
  img.alt='Vista de cuerpo completo del personaje 3D seleccionado';
  img.decoding='async';
  img.src=renderer.domElement.toDataURL('image/png');
  host.replaceChildren(img);
  success=true;
 }catch(error){
  console.warn('[V68 GLB full-body preview]',error);
 }finally{
  renderer?.dispose?.();
  renderer?.forceContextLoss?.();
  geometries.forEach(g=>g.dispose());
 }
 return success;
}
