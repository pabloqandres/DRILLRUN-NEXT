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
