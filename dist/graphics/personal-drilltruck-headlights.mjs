// DRILL RUN NEXT GENERATION · V63 warm automotive headlights, personal 02.
// Small, feathered amber pavement bounce — no long laser wedge, no AdditiveBlending.
// No shadows, new colliders, gameplay state or changes to M4 service vehicle.
import * as T from '../vendor/three.module.js';

const WARM_BEAM=0xffd19a;
const WARM_FILL=0xffbd7f;
const WARM_LENS=0xffd7a5;
const GRID=7;
const BOUNCES=[
 {forward:3.8,halfWidth:2.6,halfLength:3.2,nightOpacity:.52},
 {forward:7.1,halfWidth:3.4,halfLength:3.7,nightOpacity:.30}
];
function bounceTexture(){
 const canvas=document.createElement('canvas');
 canvas.width=canvas.height=96;
 const ctx=canvas.getContext('2d');
 const glow=ctx.createRadialGradient(48,48,0,48,48,47);
 glow.addColorStop(0,'rgba(255,231,190,.58)');
 glow.addColorStop(.25,'rgba(255,219,167,.32)');
 glow.addColorStop(.60,'rgba(255,202,145,.09)');
 glow.addColorStop(1,'rgba(255,202,145,0)');
 ctx.fillStyle=glow;ctx.fillRect(0,0,96,96);
 const tex=new T.CanvasTexture(canvas);
 tex.name='DrillTruck® · reflejo ámbar difuso de faros';
 return tex;
}
function makeBounce(scene,texture,spec){
 const geometry=new T.PlaneGeometry(1,1,GRID,GRID);
 geometry.rotateX(-Math.PI/2);
 const material=new T.MeshBasicMaterial({
  map:texture,color:0xffca94,transparent:true,opacity:0,
  depthWrite:false,depthTest:true,side:T.DoubleSide,
  // Standard source-over blend; NOT the additive laser effect from V61.
  blending:T.NormalBlending
 });
 const mesh=new T.Mesh(geometry,material);
 mesh.name='DrillTruck® · reflejo suave sobre pavimento';
 mesh.frustumCulled=false;mesh.renderOrder=8;mesh.visible=false;scene.add(mesh);
 return {geometry,material,mesh,spec};
}
// Refit two short, elliptical glow patches to real paving and uneven sand.
// The texture fades fully to transparency at every edge, unlike V61's wedge.
export function updatePersonalTruckWarmBounce(bounces,position,heading,sampleGround){
 if(!Array.isArray(bounces)||!position||!Number.isFinite(heading)||
   typeof sampleGround!=='function')return false;
 const x=position.x,z=position.z;
 if(!Number.isFinite(x)||!Number.isFinite(z))return false;
 const sn=Math.sin(heading),cs=Math.cos(heading);
 for(const bounce of bounces){
  const {geometry,spec}=bounce;
  const positions=geometry.getAttribute('position');
  for(let iz=0;iz<=GRID;iz++)for(let ix=0;ix<=GRID;ix++){
   const i=iz*(GRID+1)+ix;
   const lateral=(ix/GRID*2-1)*spec.halfWidth;
   const forward=spec.forward+(iz/GRID*2-1)*spec.halfLength;
   const px=x+sn*forward+cs*lateral;
   const pz=z+cs*forward-sn*lateral;
   const height=sampleGround(px,pz);
   // Pavement markings are drawn above the nominal .19m collision height.
   const lift=Number.isFinite(height)&&height>=.16?.107:.045;
   positions.setXYZ(i,px,(Number.isFinite(height)?height:0)+lift,pz);
  }
  positions.needsUpdate=true;
  geometry.computeBoundingSphere();
 }
 return true;
}
export function installPersonalTruckHeadlights(root,world=null){
 const lights=new T.Group();
 lights.name='DRILLTRUCK personal 02 · warm headlights';
 root.add(lights);
 const sources=[];
 for(const side of [-1,1]){
  const x=side*.73;
  const lamp=new T.SpotLight(WARM_BEAM,0,35,Math.PI/7,.65,1.3);
  lamp.position.set(x,1.10,2.18);
  lamp.target.position.set(x*1.7,-.35,17);
  lamp.castShadow=false;
  lamp.name='Faro delantero '+(side<0?'izquierdo':'derecho');
  lights.add(lamp,lamp.target);
  sources.push(lamp);
  const lens=new T.Mesh(new T.BoxGeometry(.35,.17,.055),
   new T.MeshBasicMaterial({color:0x554f42}));
  lens.name='Faro DRILLTRUCK sin marca externa';
  lens.position.set(x,1.10,2.27);lights.add(lens);
  sources.push(lens);
 }
 const frontFill=new T.PointLight(WARM_FILL,0,9,2);
 frontFill.position.set(0,1.02,2.35);
 frontFill.castShadow=false;lights.add(frontFill);
 const tex=world?.scene?.add?bounceTexture():null;
 const bounces=tex?BOUNCES.map(spec=>makeBounce(world.scene,tex,spec)):[];
 let isOn=false;
 return {
  set(enabled,quality='balanced',night=true){
   isOn=!!enabled;
   for(const item of sources){
    if(item.isSpotLight)item.intensity=isOn?(quality==='low'?17:27):0;
    else item.material.color.setHex(isOn?WARM_LENS:0x554f42);
   }
   frontFill.intensity=isOn?3:0;
   for(const bounce of bounces){
    bounce.mesh.visible=isOn;
    bounce.material.opacity=isOn?bounce.spec.nightOpacity*(night?1:.13):0;
   }
  },
  updateGround(position,heading,sampleGround){
   if(!isOn||!bounces.length)return;
   updatePersonalTruckWarmBounce(bounces,position,heading,sampleGround);
  },
  dispose(){
   lights.removeFromParent();
   lights.traverse(o=>{o.geometry?.dispose?.();if(o.isMesh)o.material?.dispose?.();});
   for(const bounce of bounces){
    bounce.mesh.removeFromParent();
    bounce.geometry.dispose();
    bounce.material.dispose();
   }
   tex?.dispose();
  }
 };
}
