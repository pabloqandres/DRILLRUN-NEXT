// M5 two unique physical staff members. Uses the same travel-based animation
// cadence as playable avatars, with an automatic GPU skeleton for unrigged GLB.
import * as T from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {PATIO_STAFF,hiredPatioStaff} from './patio-staff.mjs';
import {NPCWalkRig} from './npc-locomotion.mjs';
import {avatarDefinition} from '../chapter/avatars.mjs';
const ROUTES={
 'm5-gate-security':[[-28,-9],[-31,-10],[-32,-14],[-29,-14.8],[-27,-13],[-28,-9]],
 'm5-warehouse-tech':[[-69,-19],[-73,-19],[-73,-17],[-68,-16],[-66,-19],[-69,-19]]
};
export const npcWaypoints=id=>(ROUTES[id]||[]).map(([x,z])=>({x,z}));
// V66: compare visible character MESH bounds, never armature/helper extents.
// Some image-to-GLB NPC exports contain oversized invisible root helpers.
function visibleCharacterBox(object){
 const box=new T.Box3();
 object.updateWorldMatrix(true,true);
 object.traverse(node=>{
  if(!node.isMesh||!node.visible||!node.geometry)return;
  const b=new T.Box3().setFromObject(node,true);
  if(!b.isEmpty())box.union(b);
 });
 return box;
}
const heightOf=object=>{
 if(!object)return 0;
 const b=visibleCharacterBox(object);
 return b.isEmpty()?0:b.getSize(new T.Vector3()).y;
};
export const staffHeightRatio=(npcHeight,playerHeight,role)=>{
 if(!Number.isFinite(npcHeight)||npcHeight<.05)return 1;
 const player=Number.isFinite(playerHeight)&&playerHeight>1.2&&playerHeight<3.8?playerHeight:1.85;
 const target=player*(role==='security'?1.01:.94);
 return Math.max(.6,Math.min(3.5,target/npcHeight));
};

export class PatioNPCWorld{
 constructor(world){this.world=world;this.loaded=new Map();this.pending=new Map();this.failed=new Set();}
 async load(def){
  if(this.loaded.has(def.id))return this.loaded.get(def.id);
  if(this.pending.has(def.id))return this.pending.get(def.id);
  const p=(async()=>{
   const url=new URL('../assets3d/npc-library/'+def.asset,import.meta.url).href;
   const gltf=await new GLTFLoader().loadAsync(url);
   const root=new T.Group(),body=gltf.scene;
   root.name='M5 NPC · '+def.label;root.userData.npcId=def.id;root.add(body);
   const bounds=visibleCharacterBox(body),dims=bounds.getSize(new T.Vector3());
   const scalar=(def.role==='security'?1.82:1.74)/Math.max(.001,dims.y);
   body.scale.setScalar(scalar);
   body.position.y=-bounds.min.y*scalar;
   const rig=new NPCWalkRig(body);
   // V69: compare to the approved adult avatar stature, not the AABB of a
   // dynamically skinned player (whose idle pose can under-report height).
   // Normalization is visual-only; no route, collider or staff cost changes.
   const npcVisible=heightOf(rig.mesh||body);
   const avatarReferenceHeight=avatarDefinition(this.world.player.userData.character).height;
   const baseline=(def.role==='security'?1.82:1.74);
   const calibration=staffHeightRatio(npcVisible>0.2?npcVisible:baseline,avatarReferenceHeight,def.role);
   body.scale.multiplyScalar(calibration);
   body.position.y*=calibration;
   root.userData.visualHeight=heightOf(rig.mesh||body);
   root.userData.avatarReferenceHeight=avatarReferenceHeight;
   root.userData.npcTargetHeight=avatarReferenceHeight*(def.role==='security'?1.01:.94);
   // Align the sculpt's local forward axis (+X for the approved Z-wide
   // models) with the NPC root's movement heading (+Z), without altering
   // the scene route or the underlying GLB geometry.
   body.rotation.y+=rig.forwardCorrectionYaw||0;
   body.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});
   root.visible=false;this.world.scene.add(root);
   const npc={root,rig,def,path:npcWaypoints(def.id),next:1,wait:0,placed:false};
   this.loaded.set(def.id,npc);return npc;
  })().catch(err=>{this.failed.add(def.id);console.warn('[M5 NPC] GLB missing:',def.asset,err);return null;})
   .finally(()=>this.pending.delete(def.id));
  this.pending.set(def.id,p);return p;
 }
 update(s,dt,now=Date.now()){
  const enabled=s?.mission5?.status==='operational';
  for(const def of PATIO_STAFF){
   const active=enabled&&hiredPatioStaff(s,def.id),npc=this.loaded.get(def.id);
   if(!active){if(npc)npc.root.visible=false;continue;}
   if(!npc){if(!this.pending.has(def.id)&&!this.failed.has(def.id))this.load(def);continue;}
   npc.root.visible=true;
   if(!npc.placed){npc.root.position.set(def.site.x,0,def.site.z);npc.placed=true;}
   const delta=Math.min(.07,Math.max(0,dt||0)),p=npc.root.position,g=npc.path[npc.next],dx=g.x-p.x,dz=g.z-p.z,dist=Math.hypot(dx,dz);
   let moved=0;
   if(npc.wait>0)npc.wait=Math.max(0,npc.wait-delta);
   else if(dist<.35){npc.next=(npc.next+1)%npc.path.length;npc.wait=1.1+(npc.next%3)*.8;}
   else{
    const step=Math.min(dist,delta*.87),nx=p.x+dx/dist*step,nz=p.z+dz/dist*step;
    if(!this.world.isBlocked(nx,nz,.22,s)){
     p.x=nx;p.z=nz;moved=step;
     const yaw=Math.atan2(dx,dz),turn=Math.atan2(Math.sin(yaw-npc.root.rotation.y),Math.cos(yaw-npc.root.rotation.y));
     npc.root.rotation.y+=turn*Math.min(1,delta*6);
    }else{npc.next=(npc.next+1)%npc.path.length;npc.wait=1;}
   }
   p.y=this.world.sampleGround(p.x,p.z);
   npc.rig.update(delta,now,moved);
   npc.root.userData.state=moved>.002?'Walk':'Idle';
  }
 }
 near(x,z,r=2.4){
  let result=null,best=r;
  for(const [id,npc] of this.loaded){
   if(!npc.root.visible)continue;
   const d=Math.hypot(npc.root.position.x-x,npc.root.position.z-z);
   if(d<best){result={id,def:npc.def,position:npc.root.position};best=d;}
  }
  return result;
 }
 retry(){this.failed.clear();}
 dispose(){for(const n of this.loaded.values()){n.rig.dispose();n.root.removeFromParent();}this.loaded.clear();this.pending.clear();this.failed.clear();}
}
