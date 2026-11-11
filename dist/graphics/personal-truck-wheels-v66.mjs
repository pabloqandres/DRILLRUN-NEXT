// V66 · visual-only wheels of the paid DrillTruck® personal (never M4).
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
function createNamedPivot(mesh,root){
 const parent=mesh.parent;
 const center=new T.Box3().setFromObject(mesh).getCenter(new T.Vector3());
 const localCenter=parent.worldToLocal(center.clone());
 const steer=new T.Group(),spin=new T.Group();
 steer.name='Wheel-steer-V66';spin.name='Wheel-spin-V66';
 steer.position.copy(localCenter);parent.add(steer);steer.add(spin);
 spin.attach(mesh);
 const modelBox=new T.Box3().setFromObject(root),modelCenter=modelBox.getCenter(new T.Vector3());
 return {steer,spin,front:center.z>modelCenter.z,radius:.39,generated:false};
}
function createHubOverlay(root,side,front,bounds){
 const size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 const x=center.x+side*clamp(size.x*.425,.64,1.18);
 const z=center.z+(front?1:-1)*clamp(size.z*.285,1.0,1.6);
 const y=bounds.min.y+clamp(size.y*.20,.29,.48);
 const steer=new T.Group(),spin=new T.Group();
 steer.name='Personal truck rim steer';spin.name='Personal truck rim rotation';
 steer.position.set(x,y,z);root.add(steer);steer.add(spin);
 const graphite=new T.MeshStandardMaterial({color:0x34424b,roughness:.68,metalness:.25,
  depthWrite:false,transparent:true,opacity:.90});
 const steel=new T.MeshStandardMaterial({color:0x8b9fa6,roughness:.51,metalness:.43,
  depthWrite:false,transparent:true,opacity:.88});
 const r=clamp(size.y*.17,.23,.36);
 // Small moving hub accents only: do NOT insert another full-size wheel.
 // Each axle-facing side is outward so spin is visible from either side.
 const rim=new T.Mesh(new T.TorusGeometry(r*.58,r*.092,6,18),graphite);
 rim.rotation.y=Math.PI/2;rim.position.x=side*.015;spin.add(rim);
 for(let i=0;i<5;i++){
  const a=i*Math.PI*2/5,spoke=new T.Mesh(new T.BoxGeometry(.025,r*.37,.028),steel);
  spoke.position.set(side*.028,Math.cos(a)*r*.16,Math.sin(a)*r*.16);
  spoke.rotation.x=a;spin.add(spoke);
 }
 const hub=new T.Mesh(new T.CylinderGeometry(r*.18,r*.18,.045,12),graphite);
 hub.rotation.z=Math.PI/2;hub.position.x=side*.032;spin.add(hub);
 return {steer,spin,front,radius:clamp(size.y*.245,.33,.48),generated:true,
  dispose:()=>{rim.geometry.dispose();hub.geometry.dispose();graphite.dispose();steel.dispose();
   spin.children.forEach(x=>{if(x!==rim&&x!==hub)x.geometry.dispose();});steer.removeFromParent();}};
}
export class PersonalTruckWheels{
 constructor(root){
  this.root=root;this.wheels=[];
  root.updateWorldMatrix(true,true);
  const matched=namedWheels(root);
  if(matched.length===4){
   for(const mesh of matched)this.wheels.push(createNamedPivot(mesh,root));
   this.mode='named';
  }else{
   const bounds=new T.Box3().setFromObject(root);
   if(!bounds.isEmpty())for(const front of [true,false])for(const side of [-1,1])
    this.wheels.push(createHubOverlay(root,side,front,bounds));
   this.mode='hubs';
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
 dispose(){
  for(const wheel of this.wheels)wheel.dispose?.();
  this.wheels=[];
  this.root=null;
 }
}
