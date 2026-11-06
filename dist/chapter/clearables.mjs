import * as T from '../vendor/three.module.js';
import {batchModel} from './furniture.mjs';
// Four original, deterministic prop families. No textures, per-frame animation or physics system.
export function clearableModel(w,o){
 const g=new T.Group(),size=o.size||1,v=o.variant||0;
 let seed=42+Number(o.id.split('-')[1])*187;const rnd=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 const box=(a,b,c,x,y,z,color)=>w.box(g,a,b,c,x,y,z,color),beam=(a,b,r,c)=>w.beam(g,a,b,r,c);
 const stone=(r,x,y,z,color,stretch)=>{const geo=new T.IcosahedronGeometry(r,1),p=geo.attributes.position;for(let i=0;i<p.count;i++){const a=p.getX(i),b=p.getY(i),c=p.getZ(i),n=1+.12*Math.sin(a*31+b*17+c*13+v);p.setXYZ(i,a*n,b*n,c*n);}geo.computeVertexNormals();const m=new T.Mesh(geo,w.mat(color));m.position.set(x,y,z);m.scale.set(...stretch);m.rotation.y=rnd()*6;g.add(m);return m;};
 if(o.kind==='rock'){
  const colors=[0x70665e,0x967d68,0x565d59],r=.34;stone(r,0,.24,0,colors[v%3],[1.2,.77,.92]);
  stone(.18,.27,.11,.07,0xc4ac90,[.9,.7,1]);stone(.10,-.26,.055,.20,0xa48f7b,[1,.8,1.4]);
  if(v===1){stone(.16,-.18,.30,-.06,0xa18d7e,[.8,1,1]);stone(.08,.33,.05,.26,0xbfa58a,[1,.65,1.1]);}
 }else if(o.kind==='bush'){
  if(v===1){ // Desert tussock, bent blades with a broad base and fine tips.
   const positions=[];for(let i=0;i<27;i++){const a=rnd()*Math.PI*2,h=.30+rnd()*.43,r=.20+rnd()*.21,x=Math.sin(a)*.07,z=Math.cos(a)*.07,tipx=Math.sin(a)*r,tipz=Math.cos(a)*r,side=.022+rnd()*.018;positions.push(x-side,0,z,x+side,0,z,tipx*.6,h*.65,tipz*.6,x+side,0,z,tipx,h,tipz,tipx*.6,h*.65,tipz*.6);}
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.computeVertexNormals();const material=w.mat(0x7b7840).clone();material.side=T.DoubleSide;g.add(new T.Mesh(geo,material));
   for(let i=0;i<7;i++){const a=i*2.4;beam([0,0,0],[Math.sin(a)*.21,.55+rnd()*.20,Math.cos(a)*.21],.009,0x8b754e);}
  }else{
   // Multi-stem xeric scrub: broad, low and irregular, without a tree trunk/canopy.
   const dry=v===2,height=dry?.49:.37,spread=dry?.45:.39;
   for(let i=0;i<11;i++){
    const a=i*2.399+rnd()*.25,h=height*(.55+rnd()*.45),r=spread*(.60+rnd()*.40),x=Math.cos(a)*r,z=Math.sin(a)*r;
    const root=[Math.cos(a)*.07,0,Math.sin(a)*.07],fork=[x*.50,h*.55,z*.50],tip=[x,h,z];
    beam(root,fork,.009,0x85745b);beam(fork,tip,.006,0x9a8869);
    const other=[x*.8+Math.sin(a)*.11,h*.77,z*.8-Math.cos(a)*.11];beam(fork,other,.005,0xa69572);
    if(!dry||i%3!==0)for(let j=0;j<2;j++){
     const t=.68+j*.23,leaf=stone(.052,x*t,h*(.61+j*.25),z*t,[0x536743,0x687c4b,0x3d5744,0x80633d][(i+j)%4],[1.35,.40,1.10]);leaf.rotation.y=a;
    }
   }

  }
 }else if(o.kind==='crate'){
  const width=.73,depth=.60,height=v===1?.43:.65;
  for(let i=0;i<4;i++)box(width,.075,.12,0,.055,-.225+i*.15,0x704c31);
  for(let row=0;row<4;row++){
   const y=.14+row*(height-.12)/4;
   for(const z of[-depth/2,depth/2])if(!(v===1&&row>1&&z>0))box(width,.102,.045,0,y,z,(row+v)%2?0x98653a:0xb48043);
   for(const x of[-width/2,width/2])box(.045,.102,depth,x,y,0,row%2?0xaa8054:0xc5a376);
  }
  for(const x of[-.32,.32])for(const z of[-.27,.27]){box(.055,height,.055,x,height/2,z,0x896649);box(.075,.06,.075,x,.12,z,0x6a6d65);}
  for(const z of[-.327,.327]){const brace=box(.065,height*.94,.034,0,height*.49,z,0xd2ab78);brace.rotation.z=-.9;}
  if(v===0)for(let i=0;i<4;i++)box(width,.035,.14,0,height,-.225+i*.15,0xb59062);
  if(v===2){const board=box(.87,.045,.14,.03,height*.7,.11,0xd3ae79);board.rotation.y=-.4;board.rotation.z=.22;}
  if(v===1){const loose=box(.6,.035,.11,.02,.045,.40,0xc39a67);loose.rotation.y=.3;}
 }else if(o.kind==='metal'){
  const steel=0x3c636e,rust=0x9f4e2e,dark=0x233a46;
  if(v===0){ // Discarded pipe offcuts; open bores, readable from the game camera.
   for(let i=0;i<3;i++){const pipe=new T.Mesh(new T.CylinderGeometry(.095,.095,.82-i*.14,12,1,true),w.mat(i===1?rust:steel));pipe.rotation.z=Math.PI/2;pipe.position.set(-.05+i*.06,i===2?.28:.12,i===2?0:(i===0?-.10:.10));g.add(pipe);for(const x of[-1,1]){const ring=new T.Mesh(new T.TorusGeometry(.087,.013,4,12),w.mat(dark));ring.rotation.y=Math.PI/2;ring.position.set(pipe.position.x+x*(.82-i*.14)/2,pipe.position.y,pipe.position.z);g.add(ring);}}
   box(.55,.025,.38,.07,.02,.1,0x987958);
  }else if(v===1){ // Corrugated sheet and a short I section.
   for(let i=0;i<9;i++){const strip=box(.90,.018,.08,-.06,.07+(i%2)*.035,-.32+i*.08,i%2?steel:0x5d7c83);strip.rotation.z=.045;}
   for(const y of[.08,.27])box(.85,.035,.16,.12,y,.29,rust);box(.85,.19,.035,.12,.175,.29,dark);
  }else{
   for(const x of[-.21,.21]){box(.045,.055,.92,x,.06,0,steel);box(.13,.025,.92,x,.032,0,0x56696f);}
   for(const z of[-.34,.34])box(.57,.045,.06,0,.08,z,rust);
   const plate=box(.45,.035,.37,.04,.135,.08,0x92a0a0);plate.rotation.y=.25;
   for(const x of[-.1,.14])w.cyl(g,.024,.018,x,.165,.1,dark,.024,8);
  }
 }
 // Embed the lowest contact point slightly into the actual flat terrain, for every prop family.
 const model=batchModel(g),bounds=new T.Box3().setFromObject(model),shift=-bounds.min.y-.008;model.traverse(o=>{if(o.isMesh)o.geometry.translate(0,shift,0);});
 model.userData.grounded=true;model.name=o.id;model.scale.setScalar(size);model.rotation.y=o.angle||0;model.userData.clearableKind=o.kind;return model;
}
