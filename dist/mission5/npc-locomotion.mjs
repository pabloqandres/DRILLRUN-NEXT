// M5: procedural skeletal locomotion for single-mesh unrigged GLBs.
// Shares the avatars' distance-driven walk/idle/turn cadence. It generates a
// lightweight humanoid joint hierarchy at runtime; never replaces the
// approved model mesh/material/identity. No Blender or paid re-generation.
import * as T from '../vendor/three.module.js';

const mix=(a,b,k)=>a+(b-a)*Math.max(0,Math.min(1,k));
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const S=(sign)=>sign<0?'Left':'Right';
export class NPCWalkRig{
 constructor(model){
  this.model=model;this.body=model;
  let src=null;model.traverse(o=>{if(!src&&o.isMesh&&!o.isSkinnedMesh&&o.geometry?.attributes?.position)src=o;});
  this.skinned=false;this.phase=0;this.last=null;this.walkWeight=0;this.cycleDistance=.95;this.baseHipY=0;
  if(!src)return;
  // Don't alter original asset or shared geometry. A temporary local rig
  // supports the same GPU skinning as the avatar rigs on mobile WebGL2.
  const mesh=new T.SkinnedMesh(src.geometry.clone(),src.material);
  mesh.name='M5 · Auto-rig NPC '+(src.name||'');
  mesh.position.copy(src.position);mesh.rotation.copy(src.rotation);mesh.scale.copy(src.scale);
  mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;
  const geo=mesh.geometry;geo.computeBoundingBox();
  const bounds=geo.boundingBox,size=new T.Vector3();bounds.getSize(size);
  // GLBs from image-to-3D are normalized to a 1m high, Y-up mesh; choose
  // whether the sculpt's shoulders run along X or Z from observed bounds.
  const wideZ=size.z>size.x*1.22;
  const wide=wideZ?'z':'x';
  // Both approved M5 GLBs have shoulder width along local Z. Walk joints
  // must then swing in their X/Y sagittal plane (rotation.z), not around X.
  this.sideAxis=wide;
  this.forwardCorrectionYaw=wideZ?-Math.PI/2:0;
  const p=geo.attributes.position,min=bounds.min.y,max=bounds.max.y,h=Math.max(.001,max-min);
  const center=(bounds.min[wide]+bounds.max[wide])*.5;
  const hipY=min+h*.43,shoulderY=min+h*.76,neckY=min+h*.86;
  const joint=(name,par,x,y,z)=>{
   const b=new T.Bone();b.name=name;
   b.position.set(x,y,z);par.add(b);return b;
  };
  const hip=new T.Bone();hip.name='Hips';hip.position.set(0,hipY,0);this.baseHipY=hipY;
  const torso=joint('Spine',hip,0,shoulderY-hipY-.04,0);
  const neck=joint('Neck',torso,0,neckY-(shoulderY-.04),0);
  const head=joint('Head',neck,0,h*.045,0);
  const bones=[hip,torso,neck,head],arm={},leg={};
  const sideVec=(d)=>wideZ?[0,d]:[d,0];
  for(const sign of[-1,1]){
   const side=S(sign);
   let [cx,cz]=sideVec(sign*Math.max(size[wide]*.23,.045));
   const up=joint(side+'Arm',torso,cx,h*.025,cz);
   [cx,cz]=sideVec(sign*Math.max(size[wide]*.11,.016));
   const low=joint(side+'ForeArm',up,cx,-h*.17,cz);
   arm[side]={up,low};bones.push(up,low);
   [cx,cz]=sideVec(sign*Math.max(size[wide]*.14,.025));
   const ul=joint(side+'UpLeg',hip,cx,0,cz);
   const knee=joint(side+'Leg',ul,0,-h*.21,0);
   const foot=joint(side+'Foot',knee,0,-h*.17,0);
   leg[side]={ul,knee,foot};bones.push(ul,knee,foot);
  }
  const indices=[],weights=[];
  const index=name=>bones.findIndex(x=>x.name===name);
  const add=(id1,w1,id2=0,w2=0)=>{
   indices.push(id1,id2,0,0);weights.push(w1,w2,0,0);
  };
  const shoulderWidth=size[wide]*.30;
  for(let i=0;i<p.count;i++){
   const y=p.getY(i),v=wide==='z'?p.getZ(i)-center:p.getX(i)-center;
   const av=Math.abs(v),side=v<0?'Left':'Right';
   // Side-mounted arm regions are segmented independently of the torso;
   // face, chest, badges, radio and tool pouch remain visually intact.
   const armEnvelope=y>hipY-h*.12&&y<shoulderY+h*.055&&av>shoulderWidth&&
    (y<shoulderY-h*.02||av>shoulderWidth*1.26);
   if(y>neckY+h*.015){add(index('Head'),1);continue;}
   if(y>=neckY-h*.055&&av<shoulderWidth*1.10){
    const k=clamp((y-(neckY-h*.055))/(h*.07));add(index('Spine'),1-k,index('Head'),k);continue;
   }
   if(armEnvelope){
    const bend=clamp((shoulderY-h*.105-y)/(h*.13));
    add(index(side+'Arm'),1-bend,index(side+'ForeArm'),bend);
   }else if(y<hipY){
    if(y<min+h*.07){add(index(side+'Foot'),1);}
    else if(y<min+h*.26){const t=clamp((min+h*.29-y)/(h*.075));add(index(side+'Leg'),t,index(side+'UpLeg'),1-t);}
    else add(index(side+'UpLeg'),1);
   }else if(y>shoulderY-h*.12) add(index('Spine'),1);
   else{
    const t=clamp((y-(hipY+h*.06))/(h*.17));
    add(index('Hips'),1-t,index('Spine'),t);
   }
  }
  geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));
  geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  // Skeleton hierarchy must be in the skinned mesh's coordinate space.
  mesh.add(hip);
  mesh.bind(new T.Skeleton(bones));
  const parent=src.parent;
  parent.add(mesh);src.visible=false;
  this.original=src;this.mesh=mesh;this.bones={hip,torso,head,arm,leg};
  this.skinned=true;
 }
 update(dt,time,travel=0,heading=0){
  if(!this.skinned)return;
  const desired=travel>.0001?1:0;
  this.walkWeight=mix(this.walkWeight,desired,1-Math.exp(-Math.min(.08,dt)*(desired?10:13)));
  if(travel>0)this.phase+=(travel/this.cycleDistance)*Math.PI*2;
  const w=this.walkWeight,phase=this.phase;
  const {hip,torso,head,arm,leg}=this.bones;
  hip.position.y=this.baseHipY+Math.sin(phase*2)*.003*w;
  hip.rotation.x=Math.sin(phase*2)*.022*w;
  torso.rotation.y=Math.sin(phase)*.042*w;
  head.rotation.y=Math.sin(time*.00042)*.06*(1-w);
  for(const [side,mult] of[['Left',1],['Right',-1]]){
   const stride=Math.sin(phase+(mult<0?Math.PI:0))*w;
   // For Z-wide meshes the previous X-rotation spread limbs sideways like
   // jumping jacks. Use Z flexion for forward/back walking instead.
   const axis=this.sideAxis==='z'?'z':'x';
   leg[side].ul.rotation[axis]=stride*.42;
   leg[side].knee.rotation[axis]=Math.max(0,-stride)*.34;
   leg[side].foot.rotation[axis]=-stride*.09;
   arm[side].up.rotation[axis]=-stride*.24;
   arm[side].low.rotation[axis]=-.10+Math.max(0,stride)*.10;
  }
 }
 dispose(){
  if(!this.skinned)return;
  this.mesh?.parent?.remove(this.mesh);
  this.mesh?.geometry?.dispose();
  this.original.visible=true;
 }
}
