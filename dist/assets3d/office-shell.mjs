import * as T from '../vendor/three.module.js';
import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';
import {OFFICE,officeBlocked,insideOffice,officeGround,doorShape,circleHitsRect} from './office-layout.mjs';
import {softContactShadow} from '../graphics/world-finish.mjs';
// Preserve the originally approved PUMA burgundy office, with upgraded technical detailing.
// Architectural redesigns beyond this reversible palette restoration require visual approval.
const P={red:0x701e30,edge:0x461b28,panel:0xe6d5bc,trim:0xc4b6a1,inside:0xeee4d2,steel:0x68747b,dark:0x313e45,yellow:0xf4ba28,bolt:0xb9bfc0,floor:0x9b9c91};

// Static pieces are batched within their architectural component; doors stay independent.
function batch(group){
 group.updateMatrixWorld(true);const inv=group.matrixWorld.clone().invert(),sets=new Map(),remove=[];
 group.traverse(o=>{if(!o.isMesh||o.material.transparent)return;const geo=o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));for(const key of Object.keys(geo.attributes))if(!['position','normal'].includes(key))geo.deleteAttribute(key);const flat=geo.index?geo.toNonIndexed():geo,items=sets.get(o.material)||[];items.push(flat);sets.set(o.material,items);remove.push(o);});
 for(const o of remove)o.removeFromParent();
 for(const [material,geometries]of sets){const mesh=new T.Mesh(mergeGeometries(geometries,false),material);mesh.castShadow=mesh.receiveShadow=true;mesh.name=group.name+' · '+material.color.getHexString();group.add(mesh);for(const geo of geometries)geo.dispose();}
}
export function createOffice(w){
 const root=new T.Group();root.name='DR-BLD-001 · Oficina nivel 1';root.userData={kind:'office',...OFFICE,stage:'architecture',furniture:[]};
 // Soft ambient contact is a real, translucent ground mesh, not a decal
 // outside of the model. The same detail appears in the game and Catálogo.
 softContactShadow(w,root,7.3,3.7,.018);
 const part=name=>{const g=new T.Group();g.name=name;root.add(g);return g;};
 const chassis=part('01 · Chasis y piso'),frame=part('02 · Estructura burdeos'),roof=part('03 · Techo desmontable');
 const elevations={front:part('04 · Acceso'),back:part('05 · Panel posterior'),west:part('06 · Servicios'),east:part('07 · Lateral oficina')};
 const partitions=part('08 · Zócalos interiores'),services=part('09 · Instalaciones'),access=part('10 · Escalera y seguridad'),plan=part('11 · Identificación de zonas');
 const doors=new Map(),angles={entry:0},opened={entry:false};
 const box=(g,a,b,c,x,y,z,color)=>w.box(g,a,b,c,x,y,z,color);
 const bevel=(g,a,b,c,x,y,z,color)=>{const m=w.box(g,a,b,c,x,y,z,color,true);for(const ch of [...m.children])ch.removeFromParent();return m;};
 const cyl=(g,r,h,x,y,z,c,s=16)=>w.cyl(g,r,h,x,y,z,c,r,s);
 const beam=(g,a,b,r,c)=>w.beam(g,a,b,r,c);
 const bolt=(g,x,y,z)=>{const m=cyl(g,.021,.018,x,y,z,P.bolt,8);m.rotation.x=Math.PI/2;};

 // Steel chassis, ISO-style corner blocks and continuous usable floor.
 for(const x of[-2.76,2.76])for(const z of[-1.05,1.05]){bevel(chassis,.33,.13,.30,x,.18,z,0x8c9693);bevel(chassis,.25,.13,.23,x,.29,z,P.dark);}
 for(const z of[-.91,.91])bevel(chassis,5.92,.14,.14,0,.28,z,P.dark);
 bevel(chassis,6.02,.17,2.51,0,.335,0,P.red);box(chassis,5.83,.042,2.29,0,.399,0,P.floor);
 box(chassis,5.78,.008,2.25,0,.427,0,0xaaa99b);
 for(const x of[-1.5,0,1.5])box(chassis,.006,.002,2.28,x,.433,0,0x888d84);

 // Tessellated wall panels with true apertures: no window images over opaque walls.
 const lo=.42,hi=2.79;
 function wall(g,axis,fixed,start,end,holes=[]){
  const xs=[...new Set([start,end,...holes.flatMap(h=>[h.a,h.b])])].sort((a,b)=>a-b),ys=[...new Set([lo,hi,...holes.flatMap(h=>[h.lo,h.hi])])].sort((a,b)=>a-b);
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){const u=(xs[i]+xs[i+1])/2,y=(ys[j]+ys[j+1])/2;if(holes.some(h=>u>h.a&&u<h.b&&y>h.lo&&y<h.hi))continue;const length=xs[i+1]-xs[i],height=ys[j+1]-ys[j];box(g,axis==='x'?length:.10,height,axis==='x'?.10:length,axis==='x'?u:fixed,y,axis==='x'?fixed:u,P.panel);}
 }
 wall(elevations.front,'x',1.20,-2.94,2.94,[{a:-2.50,b:-1.48,lo,hi:2.57},{a:-1.25,b:.12,lo:1.22,hi:2.24}]);
 wall(elevations.back,'x',-1.20,-2.94,2.94,[{a:-2.10,b:-.65,lo:1.24,hi:2.22},{a:.65,b:2.38,lo:1.24,hi:2.22}]);
 wall(elevations.west,'z',-2.95,-1.15,1.15);
 wall(elevations.east,'z',2.95,-1.15,1.15,[{a:-1.03,b:-.25,lo:1.25,hi:2.20}]);
 for(const g of[elevations.front,elevations.back])for(const x of[-1.45,.30,1.49])box(g,.014,2.27,.009,x,1.62,g===elevations.front?1.258:-1.258,P.trim);
 for(const g of[elevations.west,elevations.east])box(g,.009,2.27,.014,g===elevations.west?-3.007:3.007,1.62,.10,P.trim);
 for(const x of[-2.96,2.96])for(const z of[-1.21,1.21]){
  bevel(frame,.14,2.57,.14,x,1.60,z,P.red);
  for(const y of[.43,2.77]){bevel(frame,.27,.22,.17,x,y,z+(z>0?.022:-.022),P.red);bolt(frame,x-.061,y,z+(z>0?.12:-.12));bolt(frame,x+.061,y,z+(z>0?.12:-.12));}
 }
 for(const z of[-1.23,1.23]){bevel(frame,6.12,.14,.14,0,2.82,z,P.red);bevel(frame,6.10,.12,.13,0,.37,z,P.red);}
 for(const x of[-2.99,2.99]){bevel(frame,.14,.14,2.49,x,2.82,0,P.red);bevel(frame,.13,.12,2.49,x,.37,0,P.red);}
 box(partitions,5.75,.075,.016,0,.465,-1.139,0x747c78);box(partitions,.35,.075,.016,-2.71,.465,1.139,0x747c78);box(partitions,4.27,.075,.016,.70,.465,1.139,0x747c78);

 const glassMat=new T.MeshBasicMaterial({color:0xb5c8cf,transparent:true,opacity:.12,side:T.DoubleSide,depthWrite:false});
 const reflectionMat=new T.MeshBasicMaterial({color:0xeaf4f2,transparent:true,opacity:.13,side:T.DoubleSide,depthWrite:false});
 function glazing(g,width,height,x,y,z,rotation=0){
  const unit=new T.Group();unit.position.set(x,y,z);unit.rotation.y=rotation;g.add(unit);
  for(const s of[-1,1]){bevel(unit,width+.15,.065,.105,0,s*(height/2+.033),0,P.red);bevel(unit,.065,height,.105,s*(width/2+.033),0,0,P.red);box(unit,width,.017,.013,0,s*(height/2-.014),.058,P.dark);box(unit,.017,height,.013,s*(width/2-.014),0,.058,P.dark);}
  box(unit,.032,height,.08,0,0,.015,P.edge);bevel(unit,width+.20,.045,.18,0,-height/2-.07,.015,P.trim);
  const glass=new T.Mesh(new T.PlaneGeometry(width,height),glassMat);glass.position.z=.025;unit.add(glass);
  const streak=new T.Mesh(new T.PlaneGeometry(width*.08,height*.91),reflectionMat);streak.position.set(-width*.33,0,.027);streak.rotation.z=-.16;unit.add(streak);
 }
 glazing(elevations.front,1.37,1.02,-.565,1.73,1.265);glazing(elevations.back,1.45,.98,-1.375,1.73,-1.265,Math.PI);glazing(elevations.back,1.73,.98,1.515,1.73,-1.265,Math.PI);glazing(elevations.east,.78,.95,3.015,1.725,-.64,Math.PI/2);

 // Open-plan office: no partitions, wet-room fittings, bedroom zoning or internal door.

 function makeDoor(spec){
  const pivot=new T.Group();pivot.name='Puerta · '+spec.name;pivot.position.set(spec.hinge.x,.42,spec.hinge.z);pivot.rotation.y=-spec.axis;root.add(pivot);const width=spec.width;
  if(spec.id==='entry'){
   bevel(pivot,width,.92,.065,width/2,.46,0,P.red);bevel(pivot,width,.25,.065,width/2,2.025,0,P.red);bevel(pivot,.24,.98,.065,.12,1.41,0,P.red);bevel(pivot,width-.63,.98,.065,(width+.63)/2,1.41,0,P.red);
   for(const s of[-1,1])box(pivot,.39,.026,.085,.435,1.41+s*.49,0,P.edge);for(const xx of[.24,.63])box(pivot,.027,1.0,.085,xx,1.41,0,P.edge);
   const pane=new T.Mesh(new T.PlaneGeometry(.36,.95),glassMat);pane.position.set(.435,1.41,.008);pivot.add(pane);box(pivot,width-.08,.033,.074,width/2,.08,.002,P.steel);
  }else bevel(pivot,width,2.12,.052,width/2,1.06,0,0xd2d2c3);
  for(const y of[.24,1.88])cyl(pivot,.021,.115,.015,y,.045,P.bolt,10);
  bevel(pivot,.045,.17,.026,width-.10,1.0,.052,P.steel);beam(pivot,[width-.11,1.04,.085],[width-.24,1.04,.085],.014,P.bolt);
  const lock=cyl(pivot,.014,.012,width-.10,.96,.07,P.dark,10);lock.rotation.x=Math.PI/2;doors.set(spec.id,pivot);
 }
 for(const spec of OFFICE.doors)makeDoor(spec);
 for(const x of[-2.54,-1.44])bevel(access,.065,2.23,.13,x,1.52,1.25,P.edge);bevel(access,1.16,.065,.13,-1.99,2.61,1.25,P.edge);box(access,1.08,.018,.20,-1.99,.431,1.25,P.steel);

 // Architecture V2: realistic roof protection, solar arrays and rooftop services.
 // These are only render meshes; the original office footprint, entry collider,
 // liftable roof group, interior slots and animations are never modified.
 const design=new T.Group();design.name='11 · Industrial finishes and roof equipment';design.visible=false;roof.add(design);
 root.userData.premiumRoof=design; // Shown by World.update only after office Lv.2.
 for(const side of[-1,1])for(let j=0;j<3;j++){
  const x=side*1.88,z=-.73+j*.72;
  bevel(design,1.14,.045,.52,x,3.03,z,P.dark);
  bevel(design,1.06,.018,.47,x,3.063,z,0x244b64);
  for(let n=-1;n<=1;n++)box(design,.012,.019,.41,x+n*.245,3.078,z,0x5791a8);
  box(design,1.08,.016,.025,x,3.082,z-.19,0x9acbd8);
 }
 // Contained ventilation and guarded service equipment.
 bevel(design,.88,.2,.54,.02,3.06,-.60,P.steel);
 for(let j=0;j<5;j++)box(design,.72,.017,.017,.02,3.18,-.81+j*.093,P.dark);
 for(const x of[-2.80,2.80]){
  bevel(design,.16,.16,.16,x,3.04,-1.10,P.steel);
  cyl(design,.034,.29,x,3.27,-1.10,P.dark);
 }
 // Premium satin-metal corner details and floor-line safety band.
 for(const x of[-2.83,2.83]){
  box(chassis,.09,.035,2.36,x,.40,0,P.yellow);
  for(const y of[.72,1.05,1.38,1.71,2.04,2.37])box(frame,.035,.018,2.34,x, y,0,0x56717c);
 }
 // Liftable roof and low-cost LED panels visible from the window views.
 bevel(roof,5.94,.075,2.37,0,2.866,0,0xc5c7bc);for(let x=-2.76;x<2.8;x+=.24)box(roof,.018,.012,2.30,x,2.909,0,0xb2b8af);box(roof,5.77,.024,2.23,0,2.788,0,P.inside);
 for(const x of[-1.35,1.0]){bevel(roof,.86,.035,.28,x,2.767,0,P.trim);const diffuser=box(roof,.76,.012,.22,x,2.743,0,0xffe5b3);diffuser.material=new T.MeshBasicMaterial({color:0xffe5b3});}
 bevel(access,.48,.15,.11,-1.99,2.69,1.32,P.dark);const led=box(access,.39,.083,.014,-1.99,2.69,1.383,0xffdf99);led.material=new T.MeshBasicMaterial({color:0xffdf99});
 const light=new T.PointLight(0xffd29b,1.3,3.2,2);light.position.set(-1.2,2.35,.3);root.add(light);
 // Physical exterior wash under the office fascia, especially readable at dusk.
 const entryGlow=new T.PointLight(0xffdfb2,.55,5.2,2);
 entryGlow.position.set(-1.95,2.40,1.65);entryGlow.castShadow=false;
 entryGlow.name='Oficina · warm porch lighting';root.add(entryGlow);

 // Grated treads, stringers, yellow nosings, rail posts and a curved continuous handrail.
 for(const [top,z,depth]of[[.42,1.53,.49],[.32,1.925,.31],[.22,2.235,.31],[.12,2.51,.24]]){
  bevel(access,1.25,.066,depth,-1.99,top-.033,z,P.steel);for(let x=-2.53;x<-1.45;x+=.085)box(access,.019,.008,depth-.055,x,top+.004,z,P.dark);box(access,1.25,.022,.025,-1.99,top-.012,z+depth/2,P.yellow);
 }
 for(const x of[-2.64,-1.32]){
  beam(access,[x,.16,2.59],[x,.39,1.43],.032,P.dark);
  for(const [z,base]of[[1.48,.42],[2.55,.12]]){bevel(access,.16,.025,.15,x,base+.015,z,P.steel);beam(access,[x,base+.02,z],[x,base+.89,z],.026,P.yellow);}
  const path=new T.CatmullRomCurve3([new T.Vector3(x,1.0,2.61),new T.Vector3(x,1.06,2.35),new T.Vector3(x,1.29,1.62),new T.Vector3(x,1.31,1.40)]);access.add(new T.Mesh(new T.TubeGeometry(path,16,.028,8,false),w.mat(P.yellow)));beam(access,[x,.58,2.55],[x,.87,1.48],.020,P.yellow);
 }

 // AC carcass, fan rotor, wire guard, coil slats and wall brackets.
 const ac=new T.Group();ac.position.set(-3.31,.92,-.42);ac.rotation.y=-Math.PI/2;services.add(ac);
 bevel(ac,.91,.66,.43,0,0,0,0xc5c9c0);bevel(ac,.86,.59,.025,0,0,.225,0xe1e1d4);const disk=cyl(ac,.234,.018,-.13,0,.248,P.dark,32);disk.rotation.x=Math.PI/2;
 const guard=new T.Mesh(new T.TorusGeometry(.238,.012,5,32),w.mat(P.steel));guard.position.set(-.13,0,.27);ac.add(guard);
 for(let i=0;i<3;i++){const blade=bevel(ac,.085,.29,.012,-.13,0,.259,0x88938e);blade.position.x=-.13+Math.sin(i*Math.PI*2/3)*.07;blade.position.y=Math.cos(i*Math.PI*2/3)*.07;blade.rotation.z=-i*Math.PI*2/3-.3;}
 for(let i=-3;i<=3;i++){const q=i*.055,len=2*Math.sqrt(.218*.218-q*q);beam(ac,[-.13-len/2,q,.276],[-.13+len/2,q,.276],.0055,P.bolt);beam(ac,[-.13+q,-len/2,.277],[-.13+q,len/2,.277],.0055,P.bolt);}
 for(let i=0;i<8;i++)box(ac,.16,.012,.022,.302,-.22+i*.06,.258,P.steel);
 for(const x of[-.33,.33]){bevel(ac,.055,.06,.56,x,-.37,-.03,P.steel);bevel(ac,.055,.25,.06,x,-.28,-.23,P.steel);}
 const conduit=new T.CatmullRomCurve3([new T.Vector3(-3.04,1.03,-.23),new T.Vector3(-3.04,1.26,-.05),new T.Vector3(-3.04,2.24,-.05)]);services.add(new T.Mesh(new T.TubeGeometry(conduit,8,.025,7,false),w.mat(0xb4b8ad)));
 bevel(services,.24,.37,.12,-3.045,1.19,.60,0xb7c0ba);beam(services,[-3.10,.42,.60],[-3.10,1.0,.60],.016,P.steel);box(services,.012,.026,.045,-3.114,1.19,.64,P.dark);
 bevel(elevations.front,.32,.23,.045,2.28,2.35,1.272,P.trim);for(let i=0;i<5;i++)box(elevations.front,.26,.016,.026,2.28,2.27+i*.034,1.303,P.dark);

 // Raised DRILLCO service band above the entry, and low-glare work lamps.
 // All additions stay above the door clearance and do not affect navigation.
 bevel(elevations.front,2.18,.12,.07,.88,2.58,1.33,P.dark);
 for(const x of[.04,1.73]){
  const fixture=bevel(elevations.front,.22,.075,.11,x,2.57,1.42,P.steel);
  const diffuser=box(elevations.front,.17,.031,.016,x,2.535,1.48,0xffecb0);
  diffuser.material=new T.MeshBasicMaterial({color:0xffe9af});
 }
 for(const z of[-.86,-.60,-.34,-.08,.18,.44,.70,.96])box(elevations.west,.018,.055,.12,-3.045,2.35,z,0x57707c);
 // Exact original PNG: white paper is masked and its original shapes rendered in grey ink.
 const logoMap=new T.TextureLoader().load(new URL('../assets/branding/drillco-original.png',import.meta.url).href,()=>{w.renderer.staticFrame=null;});logoMap.colorSpace=T.SRGBColorSpace;
 const logoMat=new T.MeshBasicMaterial({map:logoMap,color:0x4a4c4b,transparent:true,depthWrite:false,side:T.DoubleSide});logoMat.userData.brandInk=true;
 logoMat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 float paper=min(sampledDiffuseColor.r,min(sampledDiffuseColor.g,sampledDiffuseColor.b));
 diffuseColor.a*=1.0-smoothstep(0.82,0.99,paper);
 diffuseColor.rgb=vec3(0.068,0.072,0.070);`);};
 const logo=new T.Mesh(new T.PlaneGeometry(.83,.83),logoMat);logo.position.set(.87,1.64,1.267);logo.name='DRILLCO® · PNG original · tinta gris';elevations.front.add(logo);
 for(const [text,width,x,z]of[['OFICINA · PLANTA LIBRE',3.2,0,0]]){const sign=w.sign(plan,text,width,.24,x,.446,z,0xaaa99b,'#31464b');sign.rotation.x=-Math.PI/2;}plan.visible=false;
 // Empty furnishing anchors are separate from the shell, for the initial game's buy/place flow.
 for(const zone of OFFICE.zones){const anchor=new T.Group();anchor.name='Zona editable · '+zone.id;anchor.position.set(zone.x,.42,zone.z);anchor.userData={zone:zone.id,furnishable:true};root.add(anchor);}
 for(const g of[chassis,frame,roof,...Object.values(elevations),partitions,services,access,...doors.values()])batch(g);
 let visibility='';
 root.userData.api={angles,opened,blocked:(x,z,r)=>officeBlocked(x,z,r,angles),ground:officeGround,
  nearDoor(x,z){let best=null,distance=1.4;for(const spec of OFFICE.doors){const cx=spec.hinge.x+spec.width/2,cz=spec.hinge.z,d=Math.hypot(x-cx,z-cz);if(d<distance){best=spec;distance=d;}}return best;},
  toggle(id,x,z,r=.33){const spec=OFFICE.doors.find(d=>d.id===id);if(!spec)return false;const end=opened[id]?0:spec.openAngle;for(let i=0;i<=20;i++)if(circleHitsRect(x,z,r,doorShape(spec,angles[id]+(end-angles[id])*i/20)))return false;opened[id]=!opened[id];return true;},
  update(dt,x,z,camera,showPlan=false,exteriorReview=false){let dirty=false;
   for(const spec of OFFICE.doors){const target=opened[spec.id]?spec.openAngle:0,prior=angles[spec.id],next=prior+Math.sign(target-prior)*Math.min(Math.abs(target-prior),dt*2.8);if(next!==prior&&!circleHitsRect(x,z,.34,doorShape(spec,next))){angles[spec.id]=next;doors.get(spec.id).rotation.y=-spec.axis+next;dirty=true;}doors.get(spec.id).rotation.y=-spec.axis+angles[spec.id];}
   const indoors=insideOffice(x,z)&&!exteriorReview,key=[showPlan,indoors,camera.x>root.position.x,camera.z>root.position.z].join(',');
   if(key!==visibility){visibility=key;dirty=true;roof.visible=!showPlan&&!indoors;plan.visible=showPlan;for(const [side,g]of Object.entries(elevations))g.visible=!(indoors&&!showPlan&&((side==='front'&&camera.z>root.position.z)||(side==='back'&&camera.z<root.position.z)||(side==='east'&&camera.x>root.position.x)||(side==='west'&&camera.x<root.position.x)));}
   if(dirty)w.renderer.staticFrame=null;
  }
 };
 return root;
}
