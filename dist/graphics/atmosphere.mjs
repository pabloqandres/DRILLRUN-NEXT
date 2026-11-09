import * as T from '../vendor/three.module.js';

// Atmospheric dressing only. No collisions, mission state, economy or save writes.
export function createAtmosphere(w){
 const canvas=document.createElement('canvas');
 canvas.width=512;canvas.height=256;
 const ctx=canvas.getContext('2d');
 const gradient=ctx.createLinearGradient(0,0,0,256);
 gradient.addColorStop(0,'#4288be');
 gradient.addColorStop(.28,'#75b4db');
 gradient.addColorStop(.62,'#a7c7d2');
 gradient.addColorStop(.84,'#dfc3a6');
 gradient.addColorStop(1,'#eec6a0');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,512,256);
 // V18 cinematic low-altitude Atacama sunlight: a painted sky layer,
 // not a scene light/flare that could add glare to the player HUD.
 const sunGlow=ctx.createRadialGradient(400,79,3,400,79,115);
 sunGlow.addColorStop(0,'rgba(255,252,230,.95)');
 sunGlow.addColorStop(.09,'rgba(255,238,197,.57)');
 sunGlow.addColorStop(.34,'rgba(250,207,151,.22)');
 sunGlow.addColorStop(1,'rgba(248,196,149,0)');
 ctx.fillStyle=sunGlow;ctx.fillRect(285,0,227,195);
 // Thin ice crystals at altitude: wind-stretched clear desert sky rather
 // than opaque clouds. Very low opacity avoids flat blue gradients.
 for(let j=0;j<24;j++){
  const x=(j*147.9)%520-10,y=40+(j*23.9)%97;
  ctx.fillStyle='rgba(240,252,250,'+(.012+(j%4)*.006)+')';
  ctx.beginPath();ctx.ellipse(x,y,37+(j%7)*7,1.8+(j%3),-.055,0,Math.PI*2);ctx.fill();
 }

 // Thin, mineral-tinted inversion layers suggest the dry Atacama horizon.
 // Deterministic strokes avoid image downloads, texture flicker and dependencies.
 for(let i=0;i<14;i++){
  const y=174+i*4.6;
  const alpha=.014+(i%4)*.005;
  ctx.fillStyle='rgba(255,231,200,'+alpha+')';
  ctx.fillRect(0,y,512,1+(i%3)*1.2);
 }
 const haze=ctx.createLinearGradient(0,166,0,256);
 haze.addColorStop(0,'rgba(249,224,194,0)');
 haze.addColorStop(.55,'rgba(255,225,190,.055)');
 haze.addColorStop(1,'rgba(252,219,182,.12)');
 ctx.fillStyle=haze;ctx.fillRect(0,166,512,90);
 const sky=new T.CanvasTexture(canvas);
 sky.colorSpace=T.SRGBColorSpace;
 sky.magFilter=T.LinearFilter;
 sky.minFilter=T.LinearFilter;
 w.scene.background=sky;

 const count=64,positions=new Float32Array(count*3),seeds=new Float32Array(count*3);
 for(let i=0;i<count;i++){
  const a=i*2.399963229728653;
  const r=3+Math.sqrt((i+.5)/count)*18;
  seeds[i*3]=Math.cos(a)*r;
  seeds[i*3+1]=.24+(i*.379%1.65);
  seeds[i*3+2]=Math.sin(a)*r*.78;
  positions[i*3]=seeds[i*3];
  positions[i*3+1]=seeds[i*3+1];
  positions[i*3+2]=seeds[i*3+2];
 }
 const dustGeometry=new T.BufferGeometry();
 dustGeometry.setAttribute('position',new T.BufferAttribute(positions,3));
 const spriteCanvas=document.createElement('canvas');
 spriteCanvas.width=spriteCanvas.height=32;
 const c=spriteCanvas.getContext('2d');
 const g=c.createRadialGradient(16,16,0,16,16,16);
 g.addColorStop(0,'rgba(255,234,204,.34)');
 g.addColorStop(.45,'rgba(250,217,179,.18)');
 g.addColorStop(1,'rgba(240,195,147,0)');
 c.fillStyle=g;c.fillRect(0,0,32,32);
 const map=new T.CanvasTexture(spriteCanvas);
 const dust=new T.Points(dustGeometry,new T.PointsMaterial({
  color:0xf2c79b,size:.21,map,transparent:true,opacity:.2,
  depthWrite:false,blending:T.NormalBlending,sizeAttenuation:true
 }));
 dust.name='wind-dust';
 dust.userData.isWorker=true;
 dust.frustumCulled=false;
 w.scene.add(dust);
 w.dust=dust;
 w.animateAtmosphere=time=>{
  const a=dust.geometry.attributes.position;
  const drift=time*.12;
  for(let i=0;i<a.count;i++){
   const x=seeds[i*3],y=seeds[i*3+1],z=seeds[i*3+2];
   a.setXYZ(i,
    -18+((x+18+drift+i*.17)%36+36)%36,
    y+Math.sin(time*.35+i*1.71)*.055,
    z+Math.sin(time*.15+i*.43)*.12);
  }
  a.needsUpdate=true;
 };
}
