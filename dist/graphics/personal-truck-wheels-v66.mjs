// V66 · visual-only wheels for personal M5 AND automatic M4 DrillTruck®.
// M4 animation reads rendered displacement only: NO writes to route/state/economy.
// Try the four dedicated GLB wheel objects first; some exported GLBs are a
// single fused mesh, so use understated moving hub overlays as a safe fallback.
import * as T from '../vendor/three.module.js';
const WHEEL_NAME=/(?:wheel|tyre|tire|rueda|neum[aá]tic|llanta)/i;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const wheelRotationDelta=(metres,radius)=>radius>0?metres/radius:0;

function namedWheels(root){
 const found=[];
 root.traverse(node=>{
  if(!node.isMesh||!WHEEL_NAME.test(node.name||''))return;
  const box=new T.Box3().setFromObject(node);
  if(box.isEmpty())return;
  const size=box.getSize(new T.Vector3());
  if(size.y>.95||Math.max(size.x,size.z)>1.25)return;
  // Exclude meshes grouped under other named wheels to avoid double spin.
  if(found.some(other=>{for(let p=node.parent;p;p=p.parent)if(p===other)return true;return false;}))return;
  found.push(node);
 });
 return found.length===4?found:[];
}
function geometryWheels(root,bounds){
 // Some GLBs export four tyre discs as anonymous meshes. Prefer their
 // physical geometry to guesswork on body bounds.
 const size=bounds.getSize(new T.Vector3()),mid=bounds.getCenter(new T.Vector3());
 const bins=new Map();
 root.traverse(node=>{
  if(!node.isMesh||WHEEL_NAME.test(node.name||''))return;
  const box=new T.Box3().setFromObject(node);
  if(box.isEmpty())return;
  const dims=box.getSize(new T.Vector3());
  const center=root.worldToLocal(box.getCenter(new T.Vector3()));
  if(dims.x<.06||dims.x>.80||dims.y<.64||dims.y>1.46||
     dims.z<.64||dims.z>1.46||Math.abs(dims.y-dims.z)>.24||
     center.y<bounds.min.y+.24||center.y>bounds.min.y+1.12||
     Math.abs(center.x-mid.x)<size.x*.29||
     Math.abs(center.z-mid.z)<size.z*.18)return;
  const key=(center.z>mid.z?'F':'R')+(center.x>mid.x?'R':'L');
  const score=Math.abs(dims.y-dims.z)+Math.abs(dims.y-.95)*.6;
  if(!bins.has(key)||score<bins.get(key).score)bins.set(key,{node,score});
 });
 return bins.size===4?[...bins.values()].map(v=>v.node):[];
}
function createNamedPivot(mesh,root){
 const parent=mesh.parent;
 const center=new T.Box3().setFromObject(mesh).getCenter(new T.Vector3());
 const localCenter=parent.worldToLocal(center.clone());
 const steer=new T.Group(),spin=new T.Group();
 steer.name='Wheel-steer-V66';spin.name='Wheel-spin-V66';
 steer.position.copy(localCenter);parent.add(steer);steer.add(spin);
 spin.attach(mesh);
 const modelBox=new T.Box3().setFromObject(root),modelCenter=modelBox.getCenter(new T.Vector3());
 const front=center.z>modelCenter.z;
 steer.userData.v66Front=front;spin.userData.v66WheelRadius=.39;
 return {steer,spin,front,radius:.39,generated:false};
}
// V67: physical axle proportions rather than the small V66 decorative points.
export function fallbackWheelPose(size,center,minY,side,front){
 const x=center.x+side*clamp(size.x*.49,.82,1.23);
 const z=center.z+(front?1:-1)*clamp(size.z*(front ? .31 : .34),1.35,1.90);
 const y=minY+clamp(size.z*.10,.43,.54);
 const radius=clamp(size.z*.097,.40,.53);
 return {x,y,z,radius};
}
function createHubOverlay(root,side,front,bounds){
 const size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 const {x,y,z,radius}=fallbackWheelPose(size,center,bounds.min.y,side,front);
 const steer=new T.Group(),spin=new T.Group();
 steer.name='Wheel-steer-V66';spin.name='Wheel-spin-V66';
 steer.position.set(x,y,z);root.add(steer);steer.add(spin);
 const graphite=new T.MeshStandardMaterial({color:0x34424b,roughness:.68,metalness:.25,
  depthWrite:false,transparent:true,opacity:.90});
 const steel=new T.MeshStandardMaterial({color:0x8b9fa6,roughness:.51,metalness:.43,
  depthWrite:false,transparent:true,opacity:.88});
 const r=radius;
 // Scaled wheel-face accents, never a second overlapping tyre.
 // Each axle-facing side is outward so spin is visible from either side.
 const rim=new T.Mesh(new T.TorusGeometry(r*.77,r*.073,8,24),graphite);
 rim.rotation.y=Math.PI/2;rim.position.x=side*.015;spin.add(rim);
 for(let i=0;i<5;i++){
  const a=i*Math.PI*2/5,spoke=new T.Mesh(new T.BoxGeometry(.032,r*.62,.036),steel);
  spoke.position.set(side*.028,Math.cos(a)*r*.26,Math.sin(a)*r*.26);
  spoke.rotation.x=a;spin.add(spoke);
 }
 const hub=new T.Mesh(new T.CylinderGeometry(r*.18,r*.18,.045,12),graphite);
 hub.rotation.z=Math.PI/2;hub.position.x=side*.032;spin.add(hub);
 steer.userData.v66Front=front;spin.userData.v66WheelRadius=radius;
 return {steer,spin,front,radius,generated:true,
  dispose:()=>{rim.geometry.dispose();hub.geometry.dispose();graphite.dispose();steel.dispose();
   spin.children.forEach(x=>{if(x!==rim&&x!==hub)x.geometry.dispose();});steer.removeFromParent();}};
}
export class PersonalTruckWheels{
 constructor(root){
  this.root=root;this.wheels=[];this.lastAutoPose=null;
  root.updateWorldMatrix(true,true);
  // M5 clones the already-decorated M4 model. Reuse the four rigs instead
  // of creating duplicated wheels or destroying any actual imported meshes.
  const inherited=[];
  root.traverse(node=>{
   if(node.name==='Wheel-spin-V66'&&node.parent?.name==='Wheel-steer-V66')
    inherited.push({steer:node.parent,spin:node,
     front:!!node.parent.userData.v66Front,
     radius:Math.max(.1,Number(node.userData.v66WheelRadius)||.39),
     generated:false,inherited:true});
  });
  if(inherited.length===4){
   this.wheels=inherited;this.mode='inherited';
  }else{
   const matched=namedWheels(root);
   // All coordinates must be LOCAL to the model. World AABBs cannot
   // be used as node positions when the truck is at a remote bay.
   const bounds=new T.Box3().setFromObject(root);
   if(!bounds.isEmpty())bounds.applyMatrix4(root.matrixWorld.clone().invert());
   const actual=matched.length===4?matched:geometryWheels(root,bounds);
   if(actual.length===4){
    for(const mesh of actual)this.wheels.push(createNamedPivot(mesh,root));
    this.mode=matched.length===4?'named':'geometry';
   }else{
    if(!bounds.isEmpty())for(const front of [true,false])for(const side of [-1,1])
     this.wheels.push(createHubOverlay(root,side,front,bounds));
    this.mode='hubs';
   }
  }
 }
 update(speed=0,steerAngle=0,dt=0){
  if(!this.root||!this.wheels.length)return;
  const dist=clamp(Number(speed)||0,-12,12)*clamp(Number(dt)||0,0,.08);
  for(const w of this.wheels){
   const delta=wheelRotationDelta(dist,w.radius);
   w.spin.rotation.x+=delta;
   w.steer.rotation.y=w.front?clamp(Number(steerAngle)||0,-.60,.60):0;
  }
 }
 // Automatic M4 is animated by the already-existing route. Never sets the
 // route position/heading; simply converts its actual 2D displacement to
 // wheel revolutions and a bounded visual front-wheel angle.
 updateFromPose(dt,active=true){
  const model=this.root;
  if(!model)return;
  const pos={x:model.position.x,z:model.position.z,heading:model.rotation.y};
  const prev=this.lastAutoPose;
  this.lastAutoPose=pos;
  if(!prev||!active){this.update(0,0,dt);return;}
  const dx=pos.x-prev.x,dz=pos.z-prev.z;
  const distance=Math.hypot(dx,dz);
  // Ignore discontinuous route initialization / teleportation on load.
  if(distance<.0001||distance>1.3){this.update(0,0,dt);return;}
  const direction=Math.sign(dx*Math.sin(pos.heading)+dz*Math.cos(pos.heading))||1;
  const yaw=Math.atan2(Math.sin(pos.heading-prev.heading),Math.cos(pos.heading-prev.heading));
  const visualSteer=clamp(Math.atan2(2.85*yaw,Math.max(.01,distance)),-.46,.46);
  this.update(direction*distance/Math.max(.001,dt),visualSteer,dt);
 }
 dispose(){
  for(const wheel of this.wheels)if(!wheel.inherited)wheel.dispose?.();
  this.wheels=[];this.lastAutoPose=null;this.root=null;
 }
}
