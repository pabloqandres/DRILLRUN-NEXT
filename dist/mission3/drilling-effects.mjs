// Mission 3 — Visual effects during drilling (dust column, debris particles)
// Lightweight particle system using instanced meshes for performance.
import * as T from '../vendor/three.module.js';

const DUST_COUNT=40;
const DEBRIS_COUNT=16;

/**
 * Creates the drilling effects group (dust plume + rock debris).
 * Attach to the active borehole position during drilling.
 * @returns {T.Group}
 */
export function createDrillingEffects(){
 const g=new T.Group();g.name='drilling-effects';g.visible=false;

 // === Dust particles (instanced small spheres rising upward) ===
 const dustGeo=new T.SphereGeometry(.08,4,3);
 const dustMat=new T.MeshBasicMaterial({color:0xcba47a,transparent:true,opacity:.45});
 const dust=new T.InstancedMesh(dustGeo,dustMat,DUST_COUNT);
 dust.name='dustCloud';dust.frustumCulled=false;
 g.add(dust);

 // === Rock debris (instanced small boxes falling/spraying) ===
 const debrisGeo=new T.BoxGeometry(.06,.06,.06);
 const debrisMat=new T.MeshBasicMaterial({color:0x927d73,transparent:true,opacity:.7});
 const debris=new T.InstancedMesh(debrisGeo,debrisMat,DEBRIS_COUNT);
 debris.name='rockDebris';debris.frustumCulled=false;
 g.add(debris);

 // Initialize particle state
 g.userData._particles={
  dust:Array.from({length:DUST_COUNT},()=>({x:0,y:0,z:0,vy:0,life:0,maxLife:0})),
  debris:Array.from({length:DEBRIS_COUNT},()=>({x:0,y:0,z:0,vx:0,vy:0,vz:0,life:0,maxLife:0})),
  elapsed:0
 };

 return g;
}

/**
 * Update drilling effects each frame.
 * @param {T.Group} fx - the effects group
 * @param {number} dt - delta time in seconds
 * @param {boolean} active - whether drilling is happening
 */
export function updateDrillingEffects(fx,dt,active){
 if(!fx)return;
 if(!active){fx.visible=false;return;}
 fx.visible=true;

 const p=fx.userData._particles;
 p.elapsed+=dt;
 const dummy=new T.Object3D();

 // Update dust (rises upward in a column)
 const dustMesh=fx.getObjectByName('dustCloud');
 for(let i=0;i<DUST_COUNT;i++){
  const d=p.dust[i];
  d.life-=dt;
  if(d.life<=0){
   // Respawn at ground level
   const angle=Math.random()*Math.PI*2;
   const radius=Math.random()*.3;
   d.x=Math.cos(angle)*radius;
   d.z=Math.sin(angle)*radius;
   d.y=.1+Math.random()*.2;
   d.vy=.4+Math.random()*.6;
   d.maxLife=1.5+Math.random()*1.5;
   d.life=d.maxLife;
  }
  d.y+=d.vy*dt;
  // Drift outward as it rises
  const drift=.15*dt;
  d.x+=d.x*.3*dt;
  d.z+=d.z*.3*dt;

  const t=1-d.life/d.maxLife; // 0→1 progress
  const scale=.5+t*1.5; // grows as it rises
  dummy.position.set(d.x,d.y,d.z);
  dummy.scale.setScalar(scale);
  dummy.rotation.set(t*2,t*3,0);
  dummy.updateMatrix();
  dustMesh.setMatrixAt(i,dummy.matrix);
 }
 dustMesh.instanceMatrix.needsUpdate=true;
 dustMesh.material.opacity=.35+Math.sin(p.elapsed*3)*.1;

 // Update debris (small rocks spraying outward)
 const debrisMesh=fx.getObjectByName('rockDebris');
 for(let i=0;i<DEBRIS_COUNT;i++){
  const d=p.debris[i];
  d.life-=dt;
  if(d.life<=0){
   const angle=Math.random()*Math.PI*2;
   const speed=1+Math.random()*2;
   d.x=0;d.y=.15;d.z=0;
   d.vx=Math.cos(angle)*speed*.3;
   d.vy=1.5+Math.random()*2;
   d.vz=Math.sin(angle)*speed*.3;
   d.maxLife=.5+Math.random()*.5;
   d.life=d.maxLife;
  }
  d.vy-=5*dt; // gravity
  d.x+=d.vx*dt;
  d.y+=d.vy*dt;
  d.z+=d.vz*dt;
  if(d.y<0){d.y=0;d.vy=0;d.vx*=.5;d.vz*=.5;}

  dummy.position.set(d.x,d.y,d.z);
  dummy.scale.setScalar(.6+Math.random()*.4);
  dummy.rotation.set(d.life*5,d.life*7,0);
  dummy.updateMatrix();
  debrisMesh.setMatrixAt(i,dummy.matrix);
 }
 debrisMesh.instanceMatrix.needsUpdate=true;
}
