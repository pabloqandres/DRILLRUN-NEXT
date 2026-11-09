// DRILL RUN NEXT GENERATION · V18 operational cinematic surface.
// Decorative-only lights, exhaust, sparks and moving equipment dust.
// No collision, builder geometry, HSEC score, game state or save mutations.
import * as T from '../vendor/three.module.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const d2=(a,b)=>Math.hypot((a?.x||0)-(b?.x||0),(a?.z||0)-(b?.z||0));
function circleSprite(colors){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
 const ctx=canvas.getContext('2d');
 const g=ctx.createRadialGradient(32,32,1,32,32,32);
 for(const [at,color] of colors)g.addColorStop(at,color);
 ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
 const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;return t;
}
function billboard(map,color,size,opacity){
 const s=new T.Sprite(new T.SpriteMaterial({
  map,color,transparent:true,opacity,depthWrite:false,
  blending:T.AdditiveBlending,fog:false
 }));
 s.scale.set(size,size,1);
 s.renderOrder=5;return s;
}
export class SiteCinematics{
 constructor(world){
  this.world=world;this.clock=0;this.tick=0;this.particles=[];
  const scene=world.scene;
  const whiteGlow=circleSprite([[0,'rgba(255,248,202,.85)'],[.2,'rgba(255,220,159,.5)'],[.55,'rgba(255,176,107,.15)'],[1,'rgba(255,147,71,0)']]);
  const cyanGlow=circleSprite([[0,'rgba(215,255,248,.82)'],[.28,'rgba(86,221,240,.5)'],[.7,'rgba(55,175,190,.08)'],[1,'rgba(20,130,169,0)']]);
  this.mats={whiteGlow,cyanGlow};
  this.workshop=new T.Group();this.workshop.name='site-fx-workshop-live';this.workshop.visible=false;
  this.workshop.position.set(-7.6,0,-9.3);
  const stripM=new T.MeshStandardMaterial({color:0xd9eff0,emissive:0x84dae3,emissiveIntensity:1.7,roughness:.3,metalness:.12});
  const recessM=new T.MeshStandardMaterial({color:0x1d3949,roughness:.65,metalness:.35});
  for(const x of[-2.42,2.42]){
   const body=new T.Mesh(new T.BoxGeometry(1.22,.13,.24),recessM);
   body.position.set(x,3.54,2.73);this.workshop.add(body);
   const lamp=new T.Mesh(new T.BoxGeometry(1.08,.045,.20),stripM);
   lamp.position.set(x,3.49,2.86);this.workshop.add(lamp);
   const glow=billboard(cyanGlow,0xdafaff,1.42,.29);
   glow.position.set(x,3.50,2.97);this.workshop.add(glow);
  }
  const doorLight=new T.PointLight(0xb2f1fa,.6,8,2.4);
  doorLight.castShadow=false;doorLight.position.set(0,3.45,3.12);
  this.workshop.add(doorLight);this.workshopLight=doorLight;
  // Two actual interior ceiling luminaires illuminate the workshop floor,
  // shelves and toolbox (not just the facade). All are inside the real L1
  // building and become visible only after construction completes.
  this.workshopInteriorLights=[];
  const ceilingMaterial=new T.MeshStandardMaterial({
   color:0xe2f1ef,emissive:0xc8faff,emissiveIntensity:1.9,
   roughness:.27,metalness:.08
  });
  const rimMaterial=new T.MeshStandardMaterial({
   color:0x293f49,roughness:.54,metalness:.38
  });
  for(const x of[-1.85,1.85]){
   const holder=new T.Mesh(new T.BoxGeometry(2.25,.115,.42),rimMaterial);
   holder.position.set(x,4.05,-.38);this.workshop.add(holder);
   const lens=new T.Mesh(new T.BoxGeometry(2.08,.047,.30),ceilingMaterial);
   lens.position.set(x,3.98,-.38);this.workshop.add(lens);
   const light=new T.PointLight(0xe7f7ff,3.3,9,1.6);
   light.castShadow=false;
   light.position.set(x,3.84,-.15);
   this.workshop.add(light);
   this.workshopInteriorLights.push(light);
   const halo=billboard(cyanGlow,0xeaffff,1.65,.16);
   halo.position.set(x,3.97,-.38);this.workshop.add(halo);
  }
  // Powered rooftop extractor adds visible life to the maintenance facility,
  // strictly after the real workshop is built. Purely visual fan, no collision.
  const housingMat=new T.MeshStandardMaterial({color:0x273b43,roughness:.65,metalness:.43});
  const bladeMat=new T.MeshStandardMaterial({color:0xc5cdd0,roughness:.39,metalness:.61});
  const housing=new T.Mesh(new T.CylinderGeometry(.64,.64,.18,14),housingMat);
  housing.position.set(1.65,4.74,-.9);this.workshop.add(housing);
  const ventilator=new T.Group();
  ventilator.position.set(1.65,4.86,-.9);
  for(let b=0;b<5;b++){
   const blade=new T.Mesh(new T.BoxGeometry(.73,.024,.18),bladeMat);
   const a=b*Math.PI*2/5;
   blade.position.set(Math.cos(a)*.25,0,Math.sin(a)*.25);
   blade.rotation.y=-a;
   ventilator.add(blade);
  }
  const hub=new T.Mesh(new T.CylinderGeometry(.12,.12,.06,12),housingMat);
  hub.position.y=.025;ventilator.add(hub);
  this.workshop.add(ventilator);this.ventilator=ventilator;
  scene.add(this.workshop);
  this.office=new T.Group();this.office.position.set(-6,0,0);
  this.office.name='site-fx-office-live';this.office.visible=false;
  const officeGlow=billboard(whiteGlow,0xfff0c9,2.8,.17);
  officeGlow.position.set(0,2.43,1.57);this.office.add(officeGlow);
  const officeStrip=new T.Mesh(new T.BoxGeometry(1.12,.04,.10),new T.MeshStandardMaterial({
   color:0xffefd9,emissive:0xffba60,emissiveIntensity:1.2,roughness:.32
  }));
  officeStrip.position.set(0,2.8,1.48);this.office.add(officeStrip);
  scene.add(this.office);
  // Glowing personal-protection/worksite status only when real machine exists.
  this.rig=new T.Group();this.rig.name='site-fx-drilling-rig';this.rig.visible=false;
  const warning=new T.Mesh(new T.CylinderGeometry(.11,.11,.23,10),
   new T.MeshStandardMaterial({color:0xffb244,emissive:0xff8425,emissiveIntensity:1.45,roughness:.26}));
  warning.position.set(0,3.1,0);this.rig.add(warning);
  const rigGlow=billboard(whiteGlow,0xffb560,1.9,.23);
  rigGlow.position.set(0,3.16,0);this.rig.add(rigGlow);
  const rigLight=new T.PointLight(0xffa143,0,6,2.0);
  rigLight.castShadow=false;rigLight.position.set(0,3.12,.2);this.rig.add(rigLight);
  this.rigLamp=rigLight;this.rigGlow=rigGlow;scene.add(this.rig);
  this.truck=new T.Group();this.truck.name='site-fx-drilltruck-motion';this.truck.visible=false;
  const beacon=new T.Mesh(new T.CylinderGeometry(.09,.09,.15,10),
   new T.MeshStandardMaterial({color:0xffba5b,emissive:0xf88a26,emissiveIntensity:1.4}));
  beacon.position.set(0,2.3,0);this.truck.add(beacon);
  const truckGlow=billboard(whiteGlow,0xffae4e,1.65,.3);
  truckGlow.position.set(0,2.34,0);this.truck.add(truckGlow);
  this.truckGlow=truckGlow;
  scene.add(this.truck);
  // Grounded, soft contact under real machinery. No walk-surface geometry.
  const shadowCanvas=document.createElement('canvas');
  shadowCanvas.width=shadowCanvas.height=64;
  const sc=shadowCanvas.getContext('2d');
  const radial=sc.createRadialGradient(32,32,4,32,32,32);
  radial.addColorStop(0,'rgba(8,19,23,.58)');
  radial.addColorStop(.48,'rgba(12,25,29,.35)');
  radial.addColorStop(1,'rgba(16,33,39,0)');
  sc.fillStyle=radial;sc.fillRect(0,0,64,64);
  this.shadowTexture=new T.CanvasTexture(shadowCanvas);
  this.shadowTexture.colorSpace=T.SRGBColorSpace;
  const shadowMaterial=new T.MeshBasicMaterial({map:this.shadowTexture,
   transparent:true,opacity:.73,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1});
  this.rigShadow=new T.Mesh(new T.PlaneGeometry(4.8,5.9),shadowMaterial);
  this.rigShadow.rotation.x=-Math.PI/2;this.rigShadow.position.y=.035;
  this.rigShadow.visible=false;this.rigShadow.renderOrder=2;
  scene.add(this.rigShadow);
  this.truckShadow=new T.Mesh(new T.PlaneGeometry(3.6,6.4),shadowMaterial);
  this.truckShadow.rotation.x=-Math.PI/2;this.truckShadow.position.y=.037;
  this.truckShadow.visible=false;this.truckShadow.renderOrder=2;
  scene.add(this.truckShadow);
  // A tiny fixed-size GPU dust pool avoids allocating meshes per truck frame.
  const count=34;this.dustCount=count;this.pos=new Float32Array(count*3);
  for(let i=0;i<count;i++)this.pos[i*3+1]=-100;
  const geom=new T.BufferGeometry();
  geom.setAttribute('position',new T.BufferAttribute(this.pos,3));
  const dustMap=circleSprite([[0,'rgba(237,206,162,.45)'],[.5,'rgba(223,184,132,.13)'],[1,'rgba(218,174,121,0)']]);
  this.dust=new T.Points(geom,new T.PointsMaterial({size:.63,map:dustMap,color:0xd3b394,transparent:true,opacity:.6,depthWrite:false,sizeAttenuation:true}));
  this.dust.name='site-fx-truck-dust';this.dust.visible=false;this.dust.frustumCulled=false;scene.add(this.dust);
  this.particles=Array.from({length:count},()=>({life:0,vx:0,vy:0,vz:0}));
  this.next=0;
  // Small material flashes behind the existing workshop door (not fake equipment).
  this.sparkG=new T.BufferGeometry();this.sparkPos=new Float32Array(16*3);
  for(let i=0;i<16;i++)this.sparkPos[i*3+1]=-100;
  this.sparkG.setAttribute('position',new T.BufferAttribute(this.sparkPos,3));
  this.sparks=new T.Points(this.sparkG,new T.PointsMaterial({
   color:0xffc16a,size:.075,transparent:true,opacity:.9,
   depthWrite:false,blending:T.AdditiveBlending
  }));
  this.sparks.visible=false;this.sparks.name='site-fx-workshop-sparks';this.sparks.frustumCulled=false;scene.add(this.sparks);
  this.sparkLife=0;
 }
 update(s,dt,time,{drill=null,truck=null,drilling=false,truckMoving=false,playing=true}={}){
  if(!this.world||!s)return;
  const active=playing&&!document.hidden;
  this.clock+=Math.max(0,dt);
  const builtOffice=s.office?.status==='built';
  const builtWorkshop=!!s.workshop&&s.workshop.status!=='building';
  this.office.visible=active&&builtOffice;
  this.workshop.visible=active&&builtWorkshop;
  this.rig.visible=active&&!!drill;
  this.truck.visible=active&&!!truck;
  this.rigShadow.visible=this.rig.visible;
  this.truckShadow.visible=this.truck.visible;
  if(this.rigShadow.visible){this.rigShadow.position.x=drill.position.x;this.rigShadow.position.z=drill.position.z;}
  if(this.truckShadow.visible){
   this.truckShadow.position.x=truck.position.x;
   this.truckShadow.position.z=truck.position.z;
   this.truckShadow.rotation.z=-(truck.rotation?.y||0);
  }
  if(this.office.visible){
   const glow=this.office.children[0];glow.material.opacity=.14+.045*Math.sin(time*.7);
  }
  if(this.workshop.visible){
   this.workshopLight.intensity=.85+.10*Math.sin(time*.8);
   // Stable industrial ceiling light, independent of night-cycle graphics.
   for(const lamp of this.workshopInteriorLights)lamp.intensity=3.3;
   this.ventilator.rotation.y+=dt*3.3;
  }
  if(this.rig.visible){
   this.rig.position.copy(drill.position);
   const pulse=drilling?(.55+.45*Math.sin(time*11.4)):0;
   this.rigLamp.intensity=drilling?pulse*.9:0;
   this.rigGlow.material.opacity=drilling?.12+pulse*.30:.045;
  }
  if(this.truck.visible){
   this.truck.position.copy(truck.position);
   const pulse=truckMoving?(.5+.5*Math.sin(time*12)):0;
   this.truckGlow.material.opacity=truckMoving?.14+.34*pulse:.035;
  }
  const reducedQuality=this.world.quality==='low';
  const dustOn=active&&!reducedQuality&&truckMoving&&!!truck;
  this.dust.visible=active&&!reducedQuality&&(dustOn||this.particles.some(p=>p.life>0));
  this.tick+=dt;
  if(dustOn&&this.tick>.085){
   this.tick=0;
   for(let n=0;n<2;n++){
    const i=this.next++%this.dustCount,p=this.particles[i];
    p.life=.7+Math.random()*.8;
    p.vx=(Math.random()-.5)*1.1;p.vz=(Math.random()-.5)*1.1;p.vy=.12+Math.random()*.22;
    const angle=truck.rotation.y||0;
    this.pos[i*3]=truck.position.x-Math.sin(angle)*1.8+(Math.random()-.5);
    this.pos[i*3+1]=.20+Math.random()*.16;
    this.pos[i*3+2]=truck.position.z-Math.cos(angle)*1.8+(Math.random()-.5);
   }
  }
  for(let i=0;i<this.dustCount;i++){
   const p=this.particles[i];if(p.life<=0){this.pos[i*3+1]=-100;continue;}
   p.life=Math.max(0,p.life-dt);
   this.pos[i*3]+=p.vx*dt;this.pos[i*3+1]+=(.2+p.vy)*dt;this.pos[i*3+2]+=p.vz*dt;
  }
  if(this.dust.visible)this.dust.geometry.attributes.position.needsUpdate=true;
  const nearWorkshop=builtWorkshop&&d2(s.position,{x:-7.6,z:-9.3})<14;
  const sparkActive=active&&!reducedQuality&&nearWorkshop&&Math.sin(time*.43)>.92;
  this.sparks.visible=sparkActive;
  if(sparkActive){
   for(let i=0;i<16;i++){
    const a=i*2.399+Math.floor(time*4)*.33,r=.15+.38*((time*.9+i*.17)%1);
    this.sparkPos[i*3]=-9.15+Math.cos(a)*r;
    this.sparkPos[i*3+1]=1.65+Math.sin(a)*r+Math.sin(time*13+i)*.07;
    this.sparkPos[i*3+2]=-7.95+Math.sin(a)*r*.34;
   }
   this.sparks.geometry.attributes.position.needsUpdate=true;
  }
 }
 dispose(){
  const scene=this.world?.scene;
  for(const group of [this.workshop,this.office,this.rig,this.truck,this.dust,this.sparks,this.rigShadow,this.truckShadow])group?.removeFromParent();
  this.rigShadow.geometry.dispose();this.truckShadow.geometry.dispose();
  this.rigShadow.material.dispose();this.shadowTexture.dispose();
  this.dust.geometry.dispose();this.sparks.geometry.dispose();
  this.dust.material.dispose();this.sparks.material.dispose();
  for(const t of Object.values(this.mats))t.dispose();
  this.world=null;
 }
}
export function createSiteCinematics(world){return new SiteCinematics(world);}
