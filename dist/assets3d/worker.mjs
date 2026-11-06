import * as T from '../vendor/three.module.js';
import {makeWorkerGeometry,makeSkeleton,B,BODY} from './worker-geometry.mjs';
import {solveLeg,angleDelta,WALK_SPEED} from '../animation/movement.mjs';
const UP=new T.Vector3(0,1,0),clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
export function createWorker(){
 const g=new T.Group();g.name='Operador adulto · HOTFIX 001 / 002';g.userData.isWorker=true;this.scene.add(g);this.player=g;const body=new T.Group();body.name='Malla articulada';g.add(body);this.playerBody=body;
 const {geometry,stats}=makeWorkerGeometry(),{bones,root}=makeSkeleton();body.add(root);body.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones);skeleton.calculateInverses();
 const gradient=new T.DataTexture(new Uint8Array([88,88,88,255,172,172,172,255,255,255,255,255]),3,1,T.RGBAFormat);gradient.minFilter=gradient.magFilter=T.NearestFilter;gradient.needsUpdate=true;
 const meshes=[];for(const[key,geo]of geometry){let material;if(key==='lens')material=new T.MeshPhongMaterial({color:0xffffff,vertexColors:true,transparent:true,opacity:.18,shininess:100,depthWrite:false,side:T.DoubleSide});else material=new T.MeshToonMaterial({color:0xffffff,vertexColors:true,gradientMap:gradient,side:['vest','reflect'].includes(key)?T.DoubleSide:T.FrontSide});material.name=key;const m=new T.SkinnedMesh(geo,material);m.name='Operador · '+key;m.castShadow=key!=='lens';m.receiveShadow=true;m.frustumCulled=false;body.add(m);m.bind(skeleton,new T.Matrix4());m.normalizeSkinWeights();meshes.push(m);}
 this.vest=meshes.find(m=>m.material.name==='vest');this.worker=new WorkerRig(g,body,bones,skeleton,meshes,stats);this.arms=[bones[B.shoulderL],bones[B.shoulderR]];this.forearms=[bones[B.elbowL],bones[B.elbowR]];this.legs=[bones[B.hipL],bones[B.hipR]];this.knees=[bones[B.kneeL],bones[B.kneeR]];
 this.playerRing=new T.Mesh(new T.RingGeometry(.27,.286,48),new T.MeshBasicMaterial({color:0xc9ede4,transparent:true,opacity:.32,side:T.DoubleSide,depthWrite:false}));this.playerRing.rotation.x=-Math.PI/2;this.playerRing.position.y=.006;g.add(this.playerRing);this.worker.ring=this.playerRing;
}
export class WorkerRig{
 constructor(root,body,bones,skeleton,meshes,stats){this.root=root;this.body=body;this.bones=bones;this.skeleton=skeleton;this.meshes=meshes;this.stats=stats;this.phase=.28;this.walk=0;this.last=null;this.groundY=0;this.lastYaw=0;this.idleTime=0;this.turnFoot=0;this.clearing=0;this.feet=[-1,1].map(side=>({side,anchor:new T.Vector3(),world:new T.Vector3(),stance:true,swingStart:new T.Vector3(),pitch:0,settle:null}));this.metrics={distance:0,steps:0,maxContactError:0,clampedFrames:0,phaseTravel:0};}
 reset(){this.last=null;this.walk=0;this.phase=.28;this.metrics={distance:0,steps:0,maxContactError:0,clampedFrames:0,phaseTravel:0};for(const f of this.feet)f.settle=null;}
 localPoint(x,y,z){return new T.Vector3(x,y,z).applyMatrix4(this.root.matrixWorld);}
 orientBone(id,childId,target){const bone=this.bones[id],child=this.bones[childId];bone.parent.updateWorldMatrix(true,false);const start=bone.getWorldPosition(new T.Vector3()),parentQ=bone.parent.getWorldQuaternion(new T.Quaternion()).invert();const direction=target.clone().sub(start).normalize().applyQuaternion(parentQ);bone.quaternion.setFromUnitVectors(child.position.clone().normalize(),direction);bone.updateWorldMatrix(false,true);}
 update(dt,sampleGround,time){const root=this.root,b=this.bones;root.updateMatrixWorld(true);const pos=root.position.clone();const dx=this.last?pos.x-this.last.x:0,dz=this.last?pos.z-this.last.z:0,travel=Math.hypot(dx,dz),speed=travel/Math.max(dt,.001),moving=speed>.025;
 this.groundY=sampleGround(pos.x,pos.z);if(!this.last){root.position.y=this.groundY;root.updateMatrixWorld(true);for(const f of this.feet){const p=this.localPoint(f.side*.107,0,0);p.y=sampleGround(p.x,p.z);f.anchor.copy(p);f.world.copy(p);}this.lastYaw=root.rotation.y;}
 const yawStep=angleDelta(this.lastYaw,root.rotation.y);this.lastYaw=root.rotation.y;this.last=pos;this.metrics.distance+=travel;
 const targetBlend=clamp(speed/.75);this.walk+=(targetBlend-this.walk)*(1-Math.exp(-dt*(moving?10:12)));
 const cycleDistance=mix(.68,1.28,clamp(speed/WALK_SPEED));if(moving){const advance=travel/cycleDistance;this.phase=(this.phase+advance)%1;this.metrics.phaseTravel+=advance;this.idleTime=0;}else this.idleTime+=dt;
 const phaseRad=this.phase*Math.PI*2;
 // Vertical motion belongs to the hips; the root stays exclusively under controller control.
 b[B.pelvis].position.set(Math.sin(phaseRad)*.007*this.walk,mix(.99,.925,this.walk)+Math.cos(phaseRad*2)*.006*this.walk,0);
 b[B.pelvis].rotation.set(0,Math.sin(phaseRad)*.025*this.walk,Math.sin(phaseRad)*.017*this.walk);
 b[B.spine].rotation.set(.018*this.walk,0,-Math.sin(phaseRad)*.009*this.walk);
 b[B.chest].rotation.set(.009*this.walk,-Math.sin(phaseRad)*.036*this.walk,0);
 b[B.neck].rotation.set(-.012*this.walk,Math.sin(phaseRad)*.01*this.walk,0);
 for(const[id,side]of[[B.shoulderL,-1],[B.shoulderR,1]])b[id].rotation.set(-side*Math.cos(phaseRad)*.29*this.walk,0,side*.035);
 for(const id of[B.elbowL,B.elbowR])b[id].rotation.set(-.12-Math.abs(Math.sin(phaseRad))*.12*this.walk,0,0);
 // Clearing action overlay: swing arms down repeatedly
 if(this.clearing>0){const ct=time*6,swing=Math.sin(ct)*.45;b[B.shoulderL].rotation.x=-.6+swing;b[B.shoulderR].rotation.x=-.6-swing;b[B.elbowL].rotation.x=-.8-Math.abs(swing)*.3;b[B.elbowR].rotation.x=-.8-Math.abs(swing)*.3;b[B.spine].rotation.x=.15+Math.sin(ct*2)*.04;}
 root.updateMatrixWorld(true);const forward=new T.Vector3(0,0,1).applyQuaternion(root.getWorldQuaternion(new T.Quaternion()));const yaw=root.getWorldQuaternion(new T.Quaternion());
 for(let i=0;i<2;i++){const f=this.feet[i],p=(this.phase+i*.5)%1,stance=p<.55;
  if(moving){f.settle=null;if(stance){if(!f.stance){f.anchor.copy(f.world);f.anchor.y=sampleGround(f.anchor.x,f.anchor.z);this.metrics.steps++;}f.world.copy(f.anchor);const heel=clamp((.13-p)/.13),toe=clamp((p-.43)/.12);f.pitch=-heel*.12+toe*.17;}
   else{if(f.stance){f.swingStart.copy(f.world);}const t=(p-.55)/.45,front=.55*cycleDistance/2;const landing=this.localPoint(f.side*.107,0,(1-p)*cycleDistance+front);landing.y=sampleGround(landing.x,landing.z);f.world.copy(f.swingStart).lerp(landing,smooth(t));f.world.y+=Math.sin(Math.PI*t)*mix(.035,.065,clamp(speed/WALK_SPEED))*Math.min(1,this.walk*1.7);f.pitch=-.14*Math.sin(Math.PI*t);}
   f.stance=stance;
  }else{const neutral=this.localPoint(f.side*.107,0,0);neutral.y=sampleGround(neutral.x,neutral.z);f.pitch*=Math.exp(-dt*14);
   if(!f.stance){f.stance=true;f.anchor.copy(f.world);f.anchor.y=sampleGround(f.anchor.x,f.anchor.z);}if(f.settle){f.settle.t=Math.min(1,f.settle.t+dt/ .24);f.settle.end.copy(neutral);const t=smooth(f.settle.t);f.world.copy(f.settle.start).lerp(f.settle.end,t);f.world.y+=Math.sin(Math.PI*f.settle.t)*.027;if(f.settle.t>=1){f.anchor.copy(neutral);f.world.copy(neutral);f.settle=null;this.turnFoot=1-i;}}
   else{f.world.copy(f.anchor);const offset=f.anchor.distanceTo(neutral);if(offset>.035&&!this.feet[1-i].settle&&(i===this.turnFoot||this.idleTime>.35||Math.abs(yawStep)>.02)){f.settle={t:0,start:f.world.clone(),end:neutral.clone()};}}
  }
 }
 // A small pelvis correction keeps both legs within reach when one boot is on a raised pad.
 root.updateMatrixWorld(true);let requiredDrop=0;
 for(let i=0;i<2;i++){const f=this.feet[i],hipId=i===0?B.hipL:B.hipR,kneeId=i===0?B.kneeL:B.kneeR,ankleId=i===0?B.ankleL:B.ankleR;const hip=b[hipId].getWorldPosition(new T.Vector3()),length=b[kneeId].position.length()+b[ankleId].position.length()-.003;const horizontal=Math.hypot(hip.x-f.world.x,hip.z-f.world.z),lift=(f.pitch>0?.18:.075)*Math.abs(Math.sin(f.pitch));const maxHip=f.world.y+.063+lift+Math.sqrt(Math.max(.01,length*length-horizontal*horizontal));requiredDrop=Math.max(requiredDrop,hip.y-maxHip);}
 this.hipDrop=Math.max(clamp(requiredDrop,0,.16),(this.hipDrop||0)*Math.exp(-dt*10));b[B.pelvis].position.y-=this.hipDrop;root.updateMatrixWorld(true);
 for(let i=0;i<2;i++){const f=this.feet[i];
  const hipId=i===0?B.hipL:B.hipR,kneeId=i===0?B.kneeL:B.kneeR,ankleId=i===0?B.ankleL:B.ankleR;const hip=b[hipId].getWorldPosition(new T.Vector3()),l1=b[kneeId].position.length(),l2=b[ankleId].position.length();const lift=(f.pitch>0?.18:.075)*Math.abs(Math.sin(f.pitch));const ankle=f.world.clone();ankle.y+=.063+lift;
  const solved=solveLeg(hip,ankle,l1,l2,forward);if(solved.clamped)this.metrics.clampedFrames++;
  const knee=new T.Vector3(solved.knee.x,solved.knee.y,solved.knee.z);this.orientBone(hipId,kneeId,knee);this.orientBone(kneeId,ankleId,ankle);
  const desired=yaw.clone().multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),f.pitch));const parentQ=b[ankleId].parent.getWorldQuaternion(new T.Quaternion()).invert();b[ankleId].quaternion.copy(parentQ.multiply(desired));b[ankleId].updateWorldMatrix(false,true);
  if(f.stance&&moving){const actual=b[ankleId].getWorldPosition(new T.Vector3());this.metrics.maxContactError=Math.max(this.metrics.maxContactError,actual.distanceTo(ankle));}
 }
 root.updateMatrixWorld(true);this.skeleton.update();
 if(this.ring)this.ring.position.y=.006;
 }
}
