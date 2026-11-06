import * as T from '../vendor/three.module.js';
import {cameraSettings,ease} from './config.mjs';
const rad=Math.PI/180,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// A swept camera volume against the same oriented physical boxes used by the world.
export function segmentBoxDistance(from,to,box,padding=.12){
 const angle=box.angle||0,c=Math.cos(angle),s=Math.sin(angle),local=p=>{const x=p.x-box.x,z=p.z-box.z;return [x*c+z*s,p.y,-x*s+z*c];},a=local(from),b=local(to),lo=[-box.w/2-padding,(box.minY??0)-padding,-box.d/2-padding],hi=[box.w/2+padding,(box.maxY??3)+padding,box.d/2+padding];let enter=0,exit=1;
 for(let k=0;k<3;k++){const d=b[k]-a[k];if(Math.abs(d)<1e-9){if(a[k]<lo[k]||a[k]>hi[k])return null;}else{let u=(lo[k]-a[k])/d,v=(hi[k]-a[k])/d;if(u>v)[u,v]=[v,u];enter=Math.max(enter,u);exit=Math.min(exit,v);if(enter>exit)return null;}}
 if(exit<0||enter>1)return null;return Math.max(0,enter)*new T.Vector3().subVectors(to,from).length();
}
export class FollowCamera{
 constructor(camera,raw){this.camera=camera;this.settings=cameraSettings(raw);this.preset='B';this.mode='explore';this.target=new T.Vector3();this.position=new T.Vector3();this.ready=false;this.distance=5;this.heading=0;this.entrance=null;this.lastCollision=false;this.builderZoom=null;}
 setPreset(id){if(!this.settings.presets[id])return;this.preset=id;this.settings.zoom=1;}
 zoomBy(delta){const c=this.settings.controls;if(this.mode==='builder'){this.builderZoom=clamp((this.builderZoom??14)*Math.exp(-delta*c.zoomSpeed),6,22);return;}const p=this.settings.presets[this.preset];this.settings.zoom=clamp(p.distance*this.settings.zoom*Math.exp(-delta*c.zoomSpeed),c.minZoom,c.maxZoom)/p.distance;}
 reset(){this.preset='B';this.settings.zoom=1;this.entrance=null;this.ready=false;}
 startEntrance(){this.entrance=0;this.preset='B';this.settings.zoom=1;this.ready=false;}
 entranceAt(progress){this.entrance=clamp(progress,0,1);}
 finishEntrance(){const entering=this.entrance!==null;this.entrance=null;if(entering){this.preset='B';this.settings.zoom=1;}}
 update(dt,{position,ground=0,height=1.85,orbit={yaw:0,pitch:0},mode='explore',focus=null,obstacles=[],snap=false}={}){
  const selected=mode==='builder'?'C':this.preset,p={...this.settings.presets[selected]},controls=this.settings.controls;let distance=clamp(p.distance*(mode==='builder'?1:this.settings.zoom),controls.minZoom,controls.maxZoom),pitch=clamp(p.pitch*rad+(orbit.pitch||0),5*rad,55*rad),heading=orbit.yaw||0,targetHeight=height*.70+p.offsetVertical;
  if(this.entrance!==null){const q=ease(this.entrance),start=this.settings.transition;distance=T.MathUtils.lerp(start.startDistance,this.settings.presets.B.distance,q);pitch=T.MathUtils.lerp(start.startPitch*rad,this.settings.presets.B.pitch*rad,q);p.fov=T.MathUtils.lerp(start.startFov,this.settings.presets.B.fov,q);targetHeight=T.MathUtils.lerp(height*start.startHeightFactor,height*.70+this.settings.presets.B.offsetVertical,q);heading-=start.orbitDegrees*rad*(1-q);}
  if(mode==='interior'){distance=Math.min(distance,2.8);pitch=Math.max(pitch,24*rad);p.fov=Math.max(75,p.fov);targetHeight=height*.5+p.offsetVertical;p.height=Math.max(.3,p.height);
   if(this.mode!=='interior'&&!orbit.manual){let best=-1;const anchor=new T.Vector3(position.x,ground+targetHeight,position.z);for(const a of [heading,heading+Math.PI/2,heading-Math.PI/2,heading+Math.PI]){const end=anchor.clone().add(new T.Vector3(Math.sin(a)*Math.cos(pitch)*distance,Math.sin(pitch)*distance+p.height,Math.cos(a)*Math.cos(pitch)*distance));let free=anchor.distanceTo(end);for(const box of obstacles){const d=segmentBoxDistance(anchor,end,box);if(d!==null)free=Math.min(free,d);}if(free>best+.05){best=free;this.interiorHeading=a;}}}
   if(!orbit.manual)heading=this.interiorHeading??heading;
  }
  if(mode==='builder'){if(this.mode!=='builder'||this.builderFocusKey!==focus?.key){this.builderZoom=clamp(focus?.distance??14,controls.minZoom,18);this.builderFocusKey=focus?.key;}distance=this.builderZoom??14;pitch=clamp(78*rad,60*rad,85*rad);targetHeight=0;p.offsetHorizontal=0;p.height=0;p.fov=50;p.smoothing=12;p.followSpeed=10;}
  const base=focus||position,desiredTarget=new T.Vector3(base.x+Math.cos(heading)*p.offsetHorizontal,ground+targetHeight,base.z-Math.sin(heading)*p.offsetHorizontal),offset=new T.Vector3(Math.sin(heading)*Math.cos(pitch)*distance,Math.sin(pitch)*distance+p.height,Math.cos(heading)*Math.cos(pitch)*distance);
  const immediate=snap||!this.ready||this.entrance!==null;if(immediate)this.target.copy(desiredTarget);else this.target.lerp(desiredTarget,1-Math.exp(-p.followSpeed*dt));
  const requested=this.target.clone().add(offset);let allowed=offset.length(),hit=null;for(const box of obstacles){if(mode==='builder'&&box.owner==='office')continue;const d=segmentBoxDistance(this.target,requested,box);if(d!==null&&d<allowed){allowed=d;hit=box;}}
  const corrected=Math.max(.18,allowed-(hit?.05:0));this.lastCollision=!!hit;this.distance=immediate?corrected:hit&&corrected<this.distance?corrected:T.MathUtils.lerp(this.distance,corrected,1-Math.exp(-p.smoothing*dt));
  const result=this.target.clone().add(offset.normalize().multiplyScalar(this.distance));
  if(immediate||hit)this.position.copy(result);else this.position.lerp(result,1-Math.exp(-p.smoothing*dt));
  // Recheck the smoothed segment: a newly approached wall may never be crossed during interpolation.
  for(const box of obstacles){if(mode==='builder'&&box.owner==='office')continue;const d=segmentBoxDistance(this.target,this.position,box);if(d!==null&&d<this.target.distanceTo(this.position))this.position.copy(this.target).add(this.position.clone().sub(this.target).normalize().multiplyScalar(Math.max(.1,d-.05)));}
  this.camera.position.copy(this.position);this.camera.lookAt(this.target);this.camera.fov=p.fov+(mode==='interior'&&this.distance<1.5?10:0);this.camera.updateProjectionMatrix();this.ready=true;this.heading=Math.atan2(this.position.x-this.target.x,this.position.z-this.target.z);this.mode=mode;
  return {preset:selected,selectedDistance:distance,distance:this.target.distanceTo(this.position),pitch:pitch/rad,fov:this.camera.fov,collision:this.lastCollision};
 }
}
