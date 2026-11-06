import * as T from '../vendor/three.module.js';
import {solveLeg} from './movement.mjs';
const V=()=>new T.Vector3(),Q=()=>new T.Quaternion();
// Per-avatar IK posture. Discovers each skeleton's own bone chain and proportions
// at construction time. Protects the upper body (spine, neck, head) from IK leakage.
export class WalkingPosture{
 constructor(body){
  this.body=body;this.hips=body.getObjectByName('Hips');
  this.legs=['Left','Right'].map((side,i)=>({sign:i===0?1:-1,upper:body.getObjectByName(side+'UpLeg'),lower:body.getObjectByName(side+'Leg'),foot:body.getObjectByName(side+'Foot'),hip:V(),knee:V(),ankle:V(),target:V(),pole:V(),footQ:Q()}));
  this.valid=!!this.hips&&this.legs.every(l=>l.upper&&l.lower&&l.foot);
  // Discover upper-body bones to protect from IK side-effects.
  this.upperBones=[];
  if(this.hips){for(const child of this.hips.children){const isLeg=this.legs.some(l=>l.upper===child);if(!isLeg){child.traverse(b=>{if(b.isBone)this.upperBones.push({bone:b,q:Q()});});}}}
  // Store each avatar's rest-pose leg lengths for stable IK.
  if(this.valid){
   body.updateMatrixWorld(true);
   for(const leg of this.legs){
    leg.upper.getWorldPosition(leg.hip);leg.lower.getWorldPosition(leg.knee);leg.foot.getWorldPosition(leg.ankle);
    leg.restL1=leg.hip.distanceTo(leg.knee);leg.restL2=leg.knee.distanceTo(leg.ankle);
   }
  }
  this.forward=V();this.a=V();this.b=V();this.delta=Q();this.worldQ=Q();this.parentQ=Q();this.kneeTarget=V();this.local=V();this.bodyQ=Q();
 }
 apply(weight){
  if(!this.valid||weight<.0001)return;const body=this.body;
  body.getWorldQuaternion(this.bodyQ);this.forward.set(0,0,1).applyQuaternion(this.bodyQ);
  // Save upper-body quaternions before any IK modification.
  for(const entry of this.upperBones)entry.q.copy(entry.bone.quaternion);
  let lift=.035*weight;
  for(const leg of this.legs){
   leg.upper.getWorldPosition(leg.hip);leg.lower.getWorldPosition(leg.knee);leg.foot.getWorldPosition(leg.ankle);leg.foot.getWorldQuaternion(leg.footQ);
   body.worldToLocal(this.local.copy(leg.hip));const halfTrack=Math.max(.105,Math.abs(this.local.x)*.72);
   body.worldToLocal(leg.target.copy(leg.ankle));leg.target.x=T.MathUtils.lerp(leg.target.x,leg.sign*halfTrack,weight);body.localToWorld(leg.target);
   // Use this avatar's own rest-pose segment lengths for stable IK.
   leg.l1=leg.restL1||leg.hip.distanceTo(leg.knee);leg.l2=leg.restL2||leg.knee.distanceTo(leg.ankle);
   this.a.copy(leg.ankle).sub(leg.hip).normalize();leg.pole.copy(leg.knee).sub(leg.hip);leg.pole.addScaledVector(this.a,-leg.pole.dot(this.a)).normalize().lerp(this.forward,weight).normalize();
   const scale=body.getWorldScale(this.local).y,dx=leg.target.x-leg.hip.x,dz=leg.target.z-leg.hip.z,reach=leg.l1+leg.l2-.008*scale;
   lift=Math.min(lift,Math.max(0,(Math.sqrt(Math.max(0,reach*reach-dx*dx-dz*dz))-(leg.hip.y-leg.target.y))/scale));
  }
  this.hips.position.y+=lift;body.updateMatrixWorld(true);
  for(const leg of this.legs){
   leg.upper.getWorldPosition(leg.hip);
   const solved=solveLeg(leg.hip,leg.target,leg.l1,leg.l2,leg.pole);
   this.kneeTarget.set(solved.knee.x,solved.knee.y,solved.knee.z);
   this.aim(leg.upper,leg.lower,this.kneeTarget);this.aim(leg.lower,leg.foot,leg.target);
   leg.foot.parent.getWorldQuaternion(this.parentQ);leg.foot.quaternion.copy(this.parentQ.invert().multiply(leg.footQ));leg.foot.updateMatrixWorld(true);
  }
  // Restore upper-body bones — IK only affects legs.
  for(const entry of this.upperBones)entry.bone.quaternion.copy(entry.q);
  if(this.upperBones.length)this.hips.updateMatrixWorld(true);
 }
 aim(bone,child,target){
  bone.getWorldPosition(this.local);child.getWorldPosition(this.a);this.a.sub(this.local).normalize();this.b.copy(target).sub(this.local).normalize();
  this.delta.setFromUnitVectors(this.a,this.b);bone.getWorldQuaternion(this.worldQ);this.worldQ.premultiply(this.delta);bone.parent.getWorldQuaternion(this.parentQ);
  bone.quaternion.copy(this.parentQ.invert().multiply(this.worldQ));bone.updateMatrixWorld(true);
 }
}
