// DRILL RUN NEXT GENERATION · V61
// Truck 02 headlights: dynamic warm SpotLights + a terrain-following projection.
// The projection is separate from GLB axes, so it always lights the ROAD in
// the direction of travel. Visual-only: no collisions, mission or saved state.
import * as T from '../vendor/three.module.js';

const PROJECTION_LENGTH=21;
const CROSS_SEGMENTS=8,LENGTH_SEGMENTS=22;
function roadLightTexture(){
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;
 const ctx=canvas.getContext('2d'),img=ctx.createImageData(128,256);
 for(let y=0;y<256;y++)for(let x=0;x<128;x++){
  const u=(x+.5)/128*2-1,v=(y+.5)/256;
  const width=Math.exp(-3.3*u*u);
  // Bright from 2–15 m ahead; gradually disappear at the edge. No hard box.
  const fadeIn=Math.min(1,v*8),fadeOut=Math.min(1,(1-v)*4);
  const center=Math.pow(Math.max(0,1-Math.abs(u)),.35);
  const glow=width*fadeIn*fadeOut*(.70+.30*center);
  const i=(y*128+x)*4;
  img.data[i]=255;img.data[i+1]=238;img.data[i+2]=193;
  img.data[i+3]=Math.round(185*glow);
 }
 ctx.putImageData(img,0,0);
 return new T.CanvasTexture(canvas);
}
function makeRoadProjection(scene){
 if(!scene?.add)return null;
 const count=(CROSS_SEGMENTS+1)*(LENGTH_SEGMENTS+1);
 const geo=new T.BufferGeometry();
 const xyz=new Float32Array(count*3),uv=new Float32Array(count*2),indices=[];
 for(let iz=0;iz<=LENGTH_SEGMENTS;iz++)for(let ix=0;ix<=CROSS_SEGMENTS;ix++){
  const i=iz*(CROSS_SEGMENTS+1)+ix;
  uv[i*2]=ix/CROSS_SEGMENTS;uv[i*2+1]=iz/LENGTH_SEGMENTS;
  if(iz<LENGTH_SEGMENTS&&ix<CROSS_SEGMENTS){
   const a=i,b=i+1,c=i+CROSS_SEGMENTS+1,d=c+1;
   indices.push(a,c,b,b,c,d);
  }
 }
 geo.setAttribute('position',new T.BufferAttribute(xyz,3));
 geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.setIndex(indices);
 const tex=roadLightTexture();
 const material=new T.MeshBasicMaterial({
  map:tex,transparent:true,opacity:.95,depthWrite:false,depthTest:true,
  blending:T.AdditiveBlending,side:T.DoubleSide
 });
 const mesh=new T.Mesh(geo,material);
 mesh.name='DrillTruck® · proyección de faros sobre camino';
 mesh.renderOrder=12;mesh.frustumCulled=false;mesh.visible=false;
 scene.add(mesh);
 return {mesh,geo,tex,material};
}
export function projectPersonalTruckRoadLight(projector,position,heading,sampleGround){
 if(!projector||!position||typeof sampleGround!=='function')return false;
 const {x,z}=position;
 if(!Number.isFinite(x)||!Number.isFinite(z)||!Number.isFinite(heading))return false;
 const out=projector.geo.getAttribute('position');
 const si=Math.sin(heading),co=Math.cos(heading);
 for(let iz=0;iz<=LENGTH_SEGMENTS;iz++){
  const t=iz/LENGTH_SEGMENTS,forward=2.2+PROJECTION_LENGTH*t;
  const spread=1.65+4.10*t;
  for(let ix=0;ix<=CROSS_SEGMENTS;ix++){
   const lateral=(ix/CROSS_SEGMENTS*2-1)*spread;
   const wx=x+si*forward+co*lateral;
   const wz=z+co*forward-si*lateral;
   const ground=sampleGround(wx,wz);
   const wy=(Number.isFinite(ground)?ground:0)+.055;
   out.setXYZ(iz*(CROSS_SEGMENTS+1)+ix,wx,wy,wz);
  }
 }
 out.needsUpdate=true;
 projector.geo.computeBoundingSphere();
 return true;
}
export function installPersonalTruckHeadlights(root,world=null){
 const lights=new T.Group();
 lights.name='DRILLTRUCK personal 02 · headlights';
 root.add(lights);
 const sources=[];
 for(const side of [-1,1]){
  const x=side*.73;
  // Aim downward at the actual work road instead of nearly horizontal sky.
  const lamp=new T.SpotLight(0xfff2d4,0,32,Math.PI/5,.72,1.35);
  lamp.position.set(x,1.10,2.18);
  lamp.target.position.set(x*1.55,-1.0,14);
  lamp.castShadow=false;
  lamp.name='Faro delantero '+(side<0?'izquierdo':'derecho');
  lights.add(lamp,lamp.target);
  sources.push(lamp);
  const lens=new T.Mesh(new T.BoxGeometry(.35,.17,.055),
   new T.MeshBasicMaterial({color:0x554f42}));
  lens.name='Faro DRILLTRUCK sin marca externa';
  lens.position.set(x,1.10,2.27);
  lights.add(lens);sources.push(lens);
 }
 const frontFill=new T.PointLight(0xffeac7,0,11,2);
 frontFill.position.set(0,1.02,2.35);
 frontFill.castShadow=false;lights.add(frontFill);
 const projector=makeRoadProjection(world?.scene);
 let illuminated=false;
 return {
  set(enabled,quality='balanced'){
   illuminated=!!enabled;
   for(const item of sources){
    if(item.isSpotLight)item.intensity=illuminated?(quality==='low'?24:40):0;
    else item.material.color.setHex(illuminated?0xfff4d9:0x554f42);
   }
   frontFill.intensity=illuminated?5:0;
   if(projector)projector.mesh.visible=illuminated;
  },
  project(position,heading,sampleGround){
   if(!illuminated||!projector)return;
   projectPersonalTruckRoadLight(projector,position,heading,sampleGround);
  },
  dispose(){
   lights.removeFromParent();
   lights.traverse(o=>{o.geometry?.dispose?.();if(o.isMesh)o.material?.dispose?.();});
   if(projector){
    projector.mesh.removeFromParent();projector.geo.dispose();
    projector.material.dispose();projector.tex.dispose();
   }
  }
 };
}
