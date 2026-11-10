import {createAtmosphere} from './graphics/atmosphere.mjs';
import {createDesert,desertGroundHeight} from './graphics/desert.mjs';
import {finishConcretePad,softContactShadow,installMineralYard} from './graphics/world-finish.mjs';
import {applyQuality,loadQuality,RenderMetrics} from './graphics/quality.mjs';
import {footSupportHeight} from './animation/support-ground.mjs';
import {FollowCamera} from './camera/follow-camera.mjs';
import * as T from './vendor/three.module.js';
import {boundarySegment} from './animation/physical-boundaries.mjs';
import {circleHitsRect} from './assets3d/office-layout.mjs';
import {createOrbit,orbitOffset} from './animation/camera-controls.mjs';
import {SoftwareRenderer} from './software-renderer.mjs';
import {createOffice} from './assets3d/office-shell.mjs';
import {createWorker} from './assets3d/worker.mjs';
import {installCandidate} from './assets3d/worker-candidate.mjs';
const C={navy:0x233c53,dark:0x182c3b,cream:0xe3ddc9,white:0xf2efe1,orange:0xef8138,yellow:0xf6bc43,steel:0x607983,sand:0xcba47a,concrete:0x9faaa7,teal:0x67dfd0};
let seed=309;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
export class World{
 constructor(host,options={}){this.chapterMode=!!options.chapter;this.officeEnabled=!this.chapterMode;this.scene=new T.Scene();this.scene.background=new T.Color(0xb9d6e3);this.scene.fog=new T.Fog(0xb8c2c9,52,154);this.host=host;this.hemi=new T.HemisphereLight(0xc8e4ff,0x95724d,.95);this.scene.add(this.hemi);const sun=new T.DirectionalLight(0xffdfae,2.65);sun.position.set(-16,23,13);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-30;sun.shadow.camera.right=30;sun.shadow.camera.top=28;sun.shadow.camera.bottom=-26;sun.shadow.camera.near=1;sun.shadow.camera.far=90;sun.shadow.bias=-.0008;sun.shadow.normalBias=.018;sun.shadow.radius=3;this.scene.add(sun);this.sun=sun;
 try{this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{this.renderer=new SoftwareRenderer();}this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.02;host.append(this.renderer.domElement);
 this.camera=new T.PerspectiveCamera(43,innerWidth/innerHeight,.1,180);this.cameraRig=this.chapterMode?new FollowCamera(this.camera,options.cameraSettings):null;this.target=new T.Vector3(0,0,-1);this.camera.position.set(24,22,32);this.zoom=1;this.orbit=createOrbit();this.materials=new Map();this.colliders=[];this.physicalBoundaries=[];this.labels=[];
 this.gradient=new T.DataTexture(new Uint8Array([85,85,85,255,170,170,170,255,255,255,255,255]),3,1,T.RGBAFormat);this.gradient.magFilter=T.NearestFilter;this.gradient.minFilter=T.NearestFilter;this.gradient.needsUpdate=true;
 this.bevelCache=new Map();this.unit=new T.BoxGeometry(1,1,1);this.edges=new T.EdgesGeometry(this.unit);this.edgeMat=new T.LineBasicMaterial({color:0x213745,transparent:true,opacity:.48});this.makeTerrain();this.makeOffice();if(this.chapterMode)installMineralYard(this);if(!this.chapterMode){this.makeRig();this.makeMiniDetails();}this.makePlayer();this.makeConstruction();this.preview=new T.Group();this.scene.add(this.preview);this.preview.visible=false;this.grid=this.makeGrid();this.scene.add(this.grid);this.grid.visible=false;this.destinationRing=new T.Mesh(new T.RingGeometry(.45,.55,40),new T.MeshBasicMaterial({color:C.teal,side:T.DoubleSide,transparent:true,opacity:.85}));this.destinationRing.rotation.x=-Math.PI/2;this.destinationRing.position.y=.06;this.destinationRing.visible=false;this.scene.add(this.destinationRing);this.ray=new T.Raycaster();this.resize();addEventListener('resize',()=>this.resize());this.metrics=new RenderMetrics();applyQuality(this,loadQuality(),false);this.extensionKey='';this.constructionKey='';this.characterReady=new URLSearchParams(location.search).get('worker')==='legacy'?Promise.resolve():installCandidate(this).then(()=>{this.player.userData.validationCanvas=this.renderer.domElement;});
 }
 mat(c){if(!this.materials.has(c)){const metal=[0x607983,0x73858b,0x3c636e,0x233a46,0x536068,0x64737c].includes(c);this.materials.set(c,metal?new T.MeshStandardMaterial({color:c,roughness:.46,metalness:.38}):new T.MeshToonMaterial({color:c,gradientMap:this.gradient}));}return this.materials.get(c);}
 box(g,w,h,d,x,y,z,c,edge=false){let geo=this.unit;let beveled=false;if(edge&&Math.min(w,h,d)>.15){const key=[w,h,d].join(',');if(!this.bevelCache.has(key)){const b=Math.min(.045,Math.min(w,h,d)*.1),shape=new T.Shape();shape.moveTo(-w/2+b,-h/2+b);shape.lineTo(w/2-b,-h/2+b);shape.lineTo(w/2-b,h/2-b);shape.lineTo(-w/2+b,h/2-b);shape.closePath();const geometry=new T.ExtrudeGeometry(shape,{depth:d-2*b,bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:1,steps:1});geometry.translate(0,0,-d/2+b);this.bevelCache.set(key,geometry);}geo=this.bevelCache.get(key);beveled=true;}const m=new T.Mesh(geo,this.mat(c));if(!beveled)m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);if(edge){const e=new T.LineSegments(beveled?new T.EdgesGeometry(geo,35):this.edges,this.edgeMat);m.add(e);}return m;}
 cyl(g,r,h,x,y,z,c,r2=r,sides=12){const m=new T.Mesh(new T.CylinderGeometry(r2,r,h,sides),this.mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 beam(g,a,b,r,c){const mid=new T.Vector3().addVectors(new T.Vector3(...a),new T.Vector3(...b)).multiplyScalar(.5);const dir=new T.Vector3(...b).sub(new T.Vector3(...a));const m=this.cyl(g,r,dir.length(),...mid,c);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return m;}
 sign(g,text,w,h,x,y,z,bg=C.navy,fg='#f5f0df',rotation=0){const ca=document.createElement('canvas');ca.width=1024;ca.height=Math.round(1024*h/w);const ctx=ca.getContext('2d');ctx.fillStyle='#'+bg.toString(16).padStart(6,'0');ctx.fillRect(0,0,ca.width,ca.height);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`800 ${Math.min(ca.height*.68,ca.width/(text.length*.63))}px Arial`;ctx.fillText(text,512,ca.height*.54);const tex=new T.CanvasTexture(ca);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);m.rotation.y=rotation;g.add(m);return m;}
 pad(x,z,w,d){this.walkSurfaces??=[];this.walkSurfaces.push({x,z,w,d,y:.115});const g=new T.Group();this.scene.add(g);this.box(g,w,.15,d,x,.04,z,C.concrete);for(let i=-w/2+1.8;i<w/2;i+=1.8)this.box(g,.018,.006,d,x+i,.12,z,0x7f9396);for(let j=-d/2+1.8;j<d/2;j+=1.8)this.box(g,w,.006,.018,x,.12,z+j,0x7f9396);if(this.chapterMode)finishConcretePad(this,g,x,z,w,d);return g;}
 registerBoundary(g,ax,az,bx,bz,thickness=.09,kind='rail'){
  g.updateWorldMatrix(true,false);const a=new T.Vector3(ax,0,az).applyMatrix4(g.matrixWorld),b=new T.Vector3(bx,0,bz).applyMatrix4(g.matrixWorld);
  this.physicalBoundaries.push(boundarySegment(a.x,a.z,b.x,b.z,thickness,kind));
 }
 registerObstacle(g,x,z,width,depth,kind){
  // Construction is already blocked by its state-owned footprint; never accumulate stale props.
  if(g===this.construction)return;
  g.updateWorldMatrix(true,false);const p=new T.Vector3(x,0,z).applyMatrix4(g.matrixWorld),axis=new T.Vector3(x+1,0,z).applyMatrix4(g.matrixWorld),scale=new T.Vector3();g.getWorldScale(scale);
  this.physicalBoundaries.push({kind,x:p.x,z:p.z,w:width*scale.x,d:depth*scale.z,angle:Math.atan2(axis.z-p.z,axis.x-p.x)});
 }
 rail(g,x,z,w,d,front=true){
 this.registerBoundary(g,x-w/2,z-d/2,x+w/2,z-d/2);
 this.registerBoundary(g,x-w/2,z-d/2,x-w/2,z+d/2);
 this.registerBoundary(g,x+w/2,z-d/2,x+w/2,z+d/2);
 if(front)this.registerBoundary(g,x-w/2,z+d/2,x+w/2,z+d/2);
 const corners=[[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]];for(const [a,b]of corners){this.box(g,.25,.14,.25,x+a,.18,z+b,C.dark);this.cyl(g,.055,1.1,x+a,.75,z+b,C.yellow);}for(const h of [.6,1.18]){this.beam(g,[x-w/2,h,z-d/2],[x+w/2,h,z-d/2],.045,C.yellow);this.beam(g,[x-w/2,h,z-d/2],[x-w/2,h,z+d/2],.045,C.yellow);this.beam(g,[x+w/2,h,z-d/2],[x+w/2,h,z+d/2],.045,C.yellow);if(front)this.beam(g,[x-w/2,h,z+d/2],[x+w/2,h,z+d/2],.045,C.yellow);}}
 makeTerrain(){if(this.chapterMode){createDesert(this);createAtmosphere(this);this.renderer.premium=true;return;}const ca=document.createElement('canvas');ca.width=ca.height=512;const cx=ca.getContext('2d');cx.fillStyle='#bd946b';cx.fillRect(0,0,512,512);for(let i=0;i<18000;i++){cx.fillStyle=i%3?'#765d4936':'#e9c69a38';const x=rnd()*512,z=rnd()*512;cx.fillRect(x,z,.5+rnd()*2,.5+rnd()*1.5);}for(let i=0;i<120;i++){cx.fillStyle=['#a3836533','#e8c49655','#80664e22'][i%3];cx.beginPath();cx.ellipse(rnd()*512,rnd()*512,1+rnd()*4,.7+rnd()*2,rnd()*6,0,Math.PI*2);cx.fill();}const tex=new T.CanvasTexture(ca);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(18,18);tex.colorSpace=T.SRGBColorSpace;const groundMat=new T.MeshToonMaterial({color:0xf2e5d1,map:tex,gradientMap:this.gradient});const ground=new T.Mesh(new T.PlaneGeometry(240,240,24,24),groundMat);ground.name='terrain-ground';ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;this.scene.add(ground);
 // Flat-shaded mountain ranges made from irregular peaks.
 for(let layer=0;layer<3;layer++){const width=180,depth=26,geo=new T.PlaneGeometry(width,depth,120,20);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),u=(z+depth/2)/depth;const ridge=Math.pow(Math.sin(Math.PI*u),1.5);const peaks=3.5+Math.sin(x*.12+layer*1.7)*1.4+Math.sin(x*.31+2)*.9+Math.sin(x*.67+layer)*.35;const h=.2+ridge*(peaks+layer*1.4)+Math.sin(x*.91+z*.7)*ridge*.2;p.setY(i,h);}geo.computeVertexNormals();const mountain=new T.Mesh(geo,this.mat([0xbca28d,0xb4a5a1,0xa8a8b6][layer]));mountain.position.set(layer*5,0,-39-layer*19);this.scene.add(mountain);}
 const grainGeo=new T.IcosahedronGeometry(.08,0);const grains=new T.InstancedMesh(grainGeo,this.mat(0xa98869),800);const dummy=new T.Object3D();for(let i=0;i<800;i++){dummy.position.set((rnd()-.5)*68,.025,(rnd()-.5)*55);dummy.rotation.set(0,rnd()*6,0);dummy.scale.set(.3+rnd(),.25,.4+rnd());dummy.updateMatrix();grains.setMatrixAt(i,dummy.matrix);}this.scene.add(grains);
 for(let i=0;i<65;i++){let x=(rnd()-.5)*70,z=(rnd()-.5)*54;if(x>-15&&x<18&&z>-14&&z<13)continue;const r=.15+rnd()*.65;const rock=new T.Mesh(new T.DodecahedronGeometry(r,0),this.mat([0xaf8b70,0x927d73,0xbc9879][i%3]));rock.position.set(x,r*.32,z);rock.scale.y=.7;rock.rotation.set(rnd(),rnd(),rnd());rock.castShadow=true;this.scene.add(rock);}
 if(!this.chapterMode){
 // Pedestrian spine and paving divisions.
 this.pad(-2,5.2,17,1.7);this.pad(2.7,-.1,1.6,9);for(let x=-10;x<6;x+=1.2){this.box(this.scene,.6,.018,.045,x,.14,4.3,C.yellow);this.box(this.scene,.6,.018,.045,x,.14,6.08,C.yellow);}for(let z=-4;z<4;z+=1.2){this.box(this.scene,.04,.018,.5,1.85,.14,z,C.yellow);this.box(this.scene,.04,.018,.5,3.55,.14,z,C.yellow);}
 // A perimeter with an entrance, cables and posts.
 const fence=new T.Group();this.scene.add(fence);for(let x=-18;x<=18;x+=3){this.cyl(fence,.055,2,x,1,-15,C.steel);if(x<18){this.beam(fence,[x,.3,-15],[x+3,1.9,-15],.012,0x81928e);this.beam(fence,[x,1.9,-15],[x+3,.3,-15],.012,0x81928e);}}this.beam(fence,[-18,2,-15],[18,2,-15],.035,C.steel);for(let z=-15;z<=12;z+=3){for(const x of[-18,18]){this.cyl(fence,.05,2,x,1,z,C.steel);if(z<12){this.beam(fence,[x,.3,z],[x,1.9,z+3],.012,0x81928e);this.beam(fence,[x,1.9,z],[x,.3,z+3],.012,0x81928e);}}}for(const x of[-18,18])this.beam(fence,[x,2,-15],[x,2,12],.035,C.steel);this.registerBoundary(fence,-18,-15,18,-15,.11,'fence');for(const x of[-18,18])this.registerBoundary(fence,x,-15,x,12,.11,'fence');
 for(const x of[-14,-8,8,14]){this.box(this.scene,4.4,.02,.05,x,.02,10.8,C.white);for(let z=9;z<=12.6;z+=.6){this.box(this.scene,.045,.012,.27,x-2.2,.02,z,C.white);this.box(this.scene,.045,.012,.27,x+2.2,.02,z,C.white);}}
 }
 }
 makeOffice(){this.office=createOffice(this);this.office.position.set(-6,0,0);this.scene.add(this.office);this.office.visible=this.officeEnabled;if(!this.chapterMode)this.pad(-6,0,6.6,3.0);this.labels.push({id:'office',text:'OFICINA · MÓDULO 01',icon:'camp',point:new T.Vector3(-6,3.4,0),access:{x:-7.99,z:2.8}});}
 officeDoor(){return this.office.userData.api.nearDoor(this.player.position.x-this.office.position.x,this.player.position.z-this.office.position.z);}
 toggleOfficeDoor(id){return this.office.userData.api.toggle(id,this.player.position.x-this.office.position.x,this.player.position.z-this.office.position.z);}

 officeShell(g,w,d,title){this.box(g,w,.3,d,0,.3,0,C.navy,true);this.box(g,w,.16,d,0,.48,0,0xb5b6a8);this.box(g,w,2.55,.15,0,1.85,-d/2,C.cream,true);this.box(g,.15,2.55,d,-w/2,1.85,0,C.cream,true);this.box(g,.15,2.55,d,w/2,1.85,0,C.cream,true);
 // front wall with a real window opening and a separate door
 this.box(g,w,.63,.15,0,.86,d/2,C.cream);this.box(g,w,.5,.15,0,2.87,d/2,C.cream);this.box(g,.37,1.55,.15,-w/2+.18,1.9,d/2,C.cream);this.box(g,.75,1.55,.15,-.15,1.9,d/2,C.cream);this.box(g,1.5,1.55,.15,w/2-.75,1.9,d/2,C.cream);this.box(g,.25,1.55,.15,1.25,1.9,d/2,C.cream);
 this.window(g,-2,1.92,d/2+.02,2.45,1.35);this.window(g,2,1.95,d/2+.02,.95,1.25);this.box(g,1.04,2.15,.16,.6,1.57,d/2+.06,C.navy,true);this.box(g,.7,1.02,.04,.6,1.95,d/2+.16,0x8da7ae);this.box(g,.08,.08,.08,.94,1.35,d/2+.2,C.yellow);
 this.box(g,w+.3,.2,d+.25,0,3.25,0,C.navy,true);this.box(g,w+.12,.09,d+.12,0,3.39,0,C.white);for(const x of[-w/2,w/2]){this.box(g,.15,2.8,.18,x,1.85,d/2+.03,C.navy,true);this.box(g,.15,2.8,.18,x,1.85,-d/2,C.navy);}
 for(let x=-w/2+.45;x<w/2;x+=.45){this.box(g,.018,2.55,.02,x,1.85,-d/2-.08,0xb8b7a9);this.box(g,.018,.58,.025,x,.85,d/2+.09,0xb8b7a9);}this.sign(g,title,2.8,.43,-1.75,2.93,d/2+.09,C.cream,'#243c53');
 this.box(g,.65,.14,.15,.6,2.91,d/2+.19,C.yellow);this.box(g,.9,.6,.7,1.9,3.7,-.7,0xabb6ae,true);this.box(g,1,.1,.8,1.9,4.03,-.7,C.steel);this.cyl(g,.12,.35,-2.1,3.61,-.5,C.steel);
 // interior objects visible through the window
 this.box(g,2.4,.12,1.05,-1.9,1.25,1,C.orange,true);for(const x of[-2.9,-.9])this.box(g,.09,.75,.09,x,.85,1.2,C.dark);this.box(g,.65,.45,.08,-1.6,1.55,1.1,C.dark,true);this.box(g,.12,.3,.12,-1.6,1.23,1.1,C.steel);this.box(g,.55,.04,.25,-2.5,1.34,1.3,C.white);this.box(g,.8,.1,.8,-1.5,.8,-.15,C.dark);this.box(g,.8,.85,.12,-1.5,1.2,-.5,C.navy);this.box(g,1,1.7,.7,-2.7,1.35,-1.4,0xb6b5a6,true);
 }
 window(g,x,y,z,w,h){for(const side of[-1,1]){this.box(g,.08,h+.16,.1,x+side*(w/2+.04),y,z,C.navy);this.box(g,w+.16,.08,.1,x,y+side*(h/2+.04),z,C.navy);}const glass=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:0x8fbdc4,transparent:true,opacity:.34,side:T.DoubleSide}));glass.position.set(x,y,z+.055);g.add(glass);this.box(g,.05,h,.1,x,y,z+.06,C.navy);}
 pot(g,x,y,z){this.cyl(g,.23,.4,x,y+.2,z,0x727d77,.31);for(let i=0;i<7;i++){const leaf=new T.Mesh(new T.ConeGeometry(.12,.65,4),this.mat(i%2?0x6c8052:0x89915b));leaf.position.set(x+Math.sin(i)*.14,y+.5,z+Math.cos(i)*.14);leaf.rotation.z=Math.sin(i)*.55;leaf.rotation.x=Math.cos(i)*.5;g.add(leaf);}}
 makeWorkshop(previewOnly=false){const g=new T.Group();g.name='DR-BLD-002 · Taller de mantenimiento';g.position.set(-7.6,0,-9.3);
  if(!previewOnly){this.scene.add(g);this.workshopPad=this.pad(-7.6,-9.3,8.3,6.3);this.workshopModel=g;}softContactShadow(this,g,8.3,6.05,.143);this.box(g,7.2,.3,5.4,0,.3,0,C.steel);this.box(g,7.2,4.1,.16,0,2.3,-2.7,C.cream,true);for(const x of[-3.6,3.6])this.box(g,.15,4.1,5.4,x,2.3,0,C.cream,true);this.box(g,7.3,.8,.2,0,4.05,2.7,C.cream);this.box(g,1.2,3.4,.2,-3,2,2.7,C.cream);this.box(g,1.2,3.4,.2,3,2,2.7,C.cream);this.box(g,7.6,.22,5.9,0,4.55,0,C.navy,true);for(let z=-2.5;z<2.6;z+=.24){this.box(g,.035,3.7,.03,3.7,2.35,z,0xb6b8ad);this.box(g,.035,3.7,.03,-3.7,2.35,z,0xb6b8ad);}for(let x=-3.4;x<3.5;x+=.32)this.box(g,.027,.03,5.5,x,4.68,0,0x476272);this.box(g,6.9,.04,5.1,0,.47,0,0xb5b8a8);for(const x of[-3.7,3.7])this.box(g,.16,4.2,.18,x,2.3,2.76,C.navy);this.box(g,4.7,.65,.18,0,3.75,2.82,0x8c9999);for(let y=3.47;y<4.05;y+=.14)this.box(g,4.7,.025,.03,0,y,2.93,C.steel);this.sign(g,'TALLER',2.3,.47,0,4.15,2.83,C.navy);
  // Workshop V2: industrial facade, steel canopy, solar arrays and illuminated entry.
  // Original usable floor, roof, player door clearances and collision geometry stay unchanged.
  this.box(g,6.15,.13,.76,0,3.97,3.09,0x701e30,true);
  this.box(g,6.16,.035,.10,0,3.87,3.47,C.yellow);
  for(const x of[-2.89,2.89]){
   this.box(g,.075,.10,.68,x,3.83,3.18,0x708f97);
   this.box(g,.14,.14,.12,x,3.95,3.35,C.steel);
   for(let y=1.1;y<3.75;y+=.62)this.box(g,.04,.065,.065,x,y,2.90,0x648493);
  }
  // Advanced solar and extraction appear only after building Taller level 2.
  // This keeps the early-game building simple and makes future upgrades visible.
  const roofUpgrade=new T.Group();roofUpgrade.name='taller-nv2-premium-roof';roofUpgrade.visible=false;g.add(roofUpgrade);
  if(!previewOnly)this._workshopRoofUpgrade=roofUpgrade;
  for(const x of[-2.1,0,2.1])for(const z of[-1.22,1.22]){
   this.box(roofUpgrade,1.72,.09,1.01,x,4.81,z,0x344d5d,true);
   this.box(roofUpgrade,1.60,.025,.92,x,4.872,z,0x26526a);
   for(let n=-2;n<=2;n++)this.box(roofUpgrade,.014,.028,.84,x+n*.26,4.895,z,0x75a2b1);
   this.box(roofUpgrade,1.60,.021,.026,x,4.902,z+.40,0xb7d6d6);
  }
  // A modest maintenance extraction unit and rear weather gutter.
  this.box(roofUpgrade,.98,.31,.88,2.57,4.82,-2.02,0x687b84,true);
  for(let j=0;j<6;j++)this.box(roofUpgrade,.8,.019,.014,2.57,4.99,-2.34+j*.12,0x253745);
  this.box(g,7.75,.10,.12,0,4.44,-2.96,0x701e30);
  // L1 rainwater downpipes, recessed safety nosings and exterior warm light.
  // New details stay outside the entrance clear opening and have no colliders.
  for(const x of[-3.35,3.35]){
   this.cyl(g,.044,3.55,x,2.21,2.86,C.steel,.044,10);
   this.cyl(g,.071,.10,x,.49,2.84,0x4c636c,.071,10);
   this.box(g,.16,.07,.38,x,4.36,2.86,0x6e8587);
  }
  for(let x=-1.8;x<2.05;x+=.46)this.box(g,.35,.009,.05,x,.46,2.70,0xd3b96c);
  const entryLight=new T.PointLight(0xffd9a4,.62,7,2);
  entryLight.position.set(0,3.62,2.87);
  entryLight.castShadow=false;entryLight.name='Taller · warm entry light';g.add(entryLight);
  for(const x of[-1.9,1.9]){
   this.box(g,.68,.085,.085,x,3.84,2.91,C.steel);
   const led=this.box(g,.50,.029,.012,x,3.785,2.98,0xffe1a4);
   led.material=new T.MeshBasicMaterial({color:0xffe0a3});
  }
for(let x=-3.2;x<3.5;x+=.5){this.box(g,.025,3.6,.02,x,2.2,-2.8,0xb7b7a7);}this.shelf(g,-2.5,0,-1.7);this.shelf(g,2.5,0,-1.7);this.box(g,2.7,.16,.8,0,1.2,-2,C.orange,true);for(let x=-.9;x<=.9;x+=.6){this.cyl(g,.13,.7,x,1.65,-1.9,C.steel);}this.toolbox(g,-1.5,.3,1.6);this.box(g,1,.2,.7,1.6,.4,1.2,C.navy);for(let i=0;i<3;i++)this.box(g,.7,.1,.3,1.6,.58+i*.13,1.2,C.yellow);// Wall colliders instead of solid — allows player to walk inside
  // Back wall: world z = -9.3 + (-2.7) = -12.0
  if(!previewOnly)this.colliders.push({x:-7.6,z:-12.0,w:7.6,d:.4,_workshop:true,_wsWall:'back'});
  // Left wall: world x = -7.6 + (-3.6) = -11.2
  if(!previewOnly)this.colliders.push({x:-11.2,z:-9.3,w:.4,d:5.8,_workshop:true,_wsWall:'left'});
  // Right wall: world x = -7.6 + 3.6 = -4.0
  if(!previewOnly)this.colliders.push({x:-4.0,z:-9.3,w:.4,d:5.8,_workshop:true,_wsWall:'right'});
  // Front left pillar: world x = -7.6-3 = -10.6, z = -6.6
  if(!previewOnly)this.colliders.push({x:-10.6,z:-6.6,w:1.4,d:.4,_workshop:true,_wsWall:'frontL'});
  // Front right pillar: world x = -7.6+3 = -4.6, z = -6.6
  if(!previewOnly)this.colliders.push({x:-4.6,z:-6.6,w:1.4,d:.4,_workshop:true,_wsWall:'frontR'});
  // Interior floor walkSurface at visual floor height
  if(!previewOnly)this.walkSurfaces.push({x:-7.6,z:-9.3,w:7.0,d:5.2,y:.42});
  if(!previewOnly)this.labels.push({id:'workshop',text:'TALLER',icon:'wrench',point:new T.Vector3(-7.6,5.2,-8.5),access:{x:-7.6,z:-5.8}});return g;}
 shelf(g,x,y,z){this.box(g,1.6,2.6,.7,x,y+1.6,z,C.navy,true);for(const h of[.5,1.3,2.1]){this.box(g,1.7,.1,.85,x,y+h,z,C.yellow);for(let j=0;j<2;j++)this.box(g,.55,.5,.55,x-.4+j*.8,y+h+.3,z, j?0xb58f61:0x81949c,true);}}
 toolbox(g,x,y,z){this.box(g,1,.8,.6,x,y+.4,z,0xc85e39,true);for(let h=.2;h<.8;h+=.16){this.box(g,.85,.025,.03,x,y+h,z+.31,0x8f4a39);this.box(g,.3,.025,.04,x,y+h+.05,z+.33,0xc7c9b6);}for(const a of[-.38,.38])this.cyl(g,.08,.1,x+a,y+.02,z,C.dark);}
 makeRig(){const g=new T.Group();g.position.set(6,0,-4.6);this.scene.add(g);this.rig=g;this.pad(6,-4.6,7.8,7.5);this.rail(this.scene,6,-4.6,7.8,7.5,false);
 for(const x of[-1.15,1.15]){this.box(g,.67,.64,3.9,x,.55,0,C.dark,true);for(let z=-1.55;z<=1.6;z+=.64){const wh=this.cyl(g,.32,.72,x,.58,z,0x57616a,.32,12);wh.rotation.z=Math.PI/2;}for(let z=-1.85;z<=1.85;z+=.26){this.box(g,.77,.08,.13,x,.89,z,0x303d47);this.box(g,.77,.08,.13,x,.24,z,0x303d47);}}
 this.box(g,2.4,.4,3.5,0,1.12,0,C.steel,true);this.box(g,1.9,1.3,1.9,0,1.9,.7,C.yellow,true);this.box(g,1.85,.1,1.8,0,2.6,.7,0xffd06b);this.box(g,.9,1.2,1.6,-.7,1.95,-1,C.yellow,true);this.box(g,.8,.7,1.15,-.75,2.3,-1,0x7fabb4,true);this.box(g,.07,1.4,1.3,-1.15,2.1,-1,C.navy);this.box(g,1.1,.12,1.7,-.7,2.85,-1,C.yellow,true);for(let i=0;i<5;i++)this.box(g,.035,.65,.03,.2+i*.19,1.9,1.67,C.dark);this.sign(g,'DTH · 01',1.1,.32,0,2.05,1.68,C.yellow,'#24364a');this.cyl(g,.11,1.1,.6,2.9,1.1,C.dark);this.cyl(g,.18,.18,.6,3.5,1.1,C.steel);
 // two mast uprights with cross-members, carriage, piston and hoses
 for(const x of[.6,1.3])this.box(g,.18,7.5,.26,x,4.4,-1.6,C.navy,true);for(let y=1;y<8.2;y+=.7)this.box(g,.85,.12,.18,.95,y,-1.6,C.yellow);this.box(g,1.15,.32,.6,.95,8.25,-1.6,C.yellow,true);this.box(g,.85,.23,.55,.95,1.2,-1.6,C.yellow);this.cyl(g,.11,5.9,.95,4.25,-1.25,0xaab6b2);this.carriage=this.box(g,.75,.7,.75,.95,4,-1.6,C.yellow,true);this.drillShaft=this.cyl(g,.09,2.8,.95,1.9,-1.65,C.steel);this.cyl(g,.24,.35,.95,.42,-1.65,C.orange,.21,12);
 for(let i=0;i<3;i++){const points=[new T.Vector3(0,2.3,-.7),new T.Vector3(1.8+i*.1,3.5,-1.4),new T.Vector3(1.8+i*.1,6.6,-1.5),new T.Vector3(1.3,7.2,-1.6)];const tube=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),18,.045,5,false),this.mat(C.dark));g.add(tube);}this.beam(g,[-.6,1.2,-.4],[.7,3.8,-1.6],.11,C.steel);this.beam(g,[.95,3.8,-1.6],[.95,1.1,-2.4],.07,C.steel);
 for(const x of[-3.1,3.1])this.cone(g,x,.15,3.3);this.colliders.push({x:6,z:-4.6,w:3.4,d:4.2});this.labels.push({id:'rig',text:'PERFORACIÓN',icon:'drill',point:new T.Vector3(6,5.7,-4),access:{x:5.8,z:-.2}});
 }
 makeDepot(){const g=new T.Group();g.position.set(14,0,-9);this.scene.add(g);this.pad(14,-9,5,5.6);this.box(g,4.2,3.2,.14,0,1.9,-2,C.cream,true);for(const x of[-2.1,2.1])this.box(g,.14,3.2,4,x,1.9,0,C.cream,true);this.box(g,4.6,.23,4.5,0,3.7,0,C.navy,true);this.box(g,4.2,.55,.16,0,3.25,2,C.cream);this.sign(g,'BODEGA',1.8,.4,0,3.3,2.1,C.navy);this.shelf(g,-1,.05,-1.1);this.box(g,1,1,.8,1,.6,-.8,0xbd9564,true);this.box(g,.8,.6,.65,1,1.4,-.8,0xa28562,true);this.barrel(g,1.4,.2,1.4,C.orange);this.barrel(g,-1.2,.2,1.4,C.navy);this.colliders.push({x:14,z:-9,w:4.5,d:4.5});this.labels.push({id:'depot',text:'BODEGA',icon:'box',point:new T.Vector3(14,4.25,-8.5),access:{x:13,z:-5.5}});}
 barrel(g,x,y,z,c){this.registerObstacle(g,x,z,.63,.63,'barrel');this.cyl(g,.3,.85,x,y+.42,z,c);for(const h of[.1,.72])this.cyl(g,.315,.05,x,y+h,z,C.steel);this.cyl(g,.09,.02,x+.1,y+.86,z,C.dark);}
 cone(g,x,y,z){this.registerObstacle(g,x,z,.45,.45,'cone');this.box(g,.45,.06,.45,x,y,z,C.dark);this.cyl(g,.18,.65,x,y+.32,z,C.orange,.035,10);this.cyl(g,.12,.14,x,y+.35,z,C.white,.09,10);}
 makeDetails(){const g=new T.Group();this.scene.add(g);this.pad(11,2.8,6,3.2);for(let i=0;i<5;i++){for(let j=0;j<2;j++){const p=this.cyl(g,.14,4.6,11, .45+j*.29,2.3+i*.3,C.steel,.14,10);p.rotation.z=Math.PI/2;}}for(const x of[8.5,13.5])this.box(g,.15,.8,2,x,.5,2.8,C.navy);this.rail(g,11,2.8,6,3.2,false);this.colliders.push({x:11,z:2.8,w:6,d:3.2});this.box(g,1.2,1.2,1.1,15,.8,2.8,0xc9c8b1,true);this.barrel(g,15.2,.15,.9,C.navy);this.barrel(g,16,.15,1,C.orange);
 // Utility cabinet, pallets and safety signs.
 this.box(g,1.2,1.9,.7,-12,1.1,-3.8,C.yellow,true);this.box(g,.8,1.3,.03,-12,1.1,-3.43,0xe3ac43,true);this.sign(g,'⚡',.45,.45,-12,1.35,-3.4,C.yellow,'#24364a');for(let i=0;i<3;i++){this.box(g,1.4,.12,1,-13,.2+i*.16,-1.2,0xa9875f);for(let j=0;j<4;j++)this.box(g,.16,.06,1,-13.55+j*.35,.29+i*.16,-1.2,0xd6b385);}this.box(g,1.1,.8,.8,-13,.9,-1.2,0xb89a72,true);this.sign(g,'EPP',.7,.4,-15,1.55,4.4,C.navy);this.cyl(g,.04,1.8,-15,.9,4.35,C.steel);this.cone(g,-13,.05,4.4);
 for(const [x,z]of[[-14,-12],[1,-13],[16,-13],[-14,4],[16,8]]){this.box(g,.65,.2,.65,x,.1,z,C.concrete);this.cyl(g,.075,5.8,x,2.9,z,C.steel);this.box(g,1.5,.1,.25,x,5.8,z,C.navy);for(const a of[-.5,.5]){this.box(g,.43,.4,.23,x+a,5.6,z,C.dark);this.box(g,.35,.25,.03,x+a,5.6,z+.14,C.white);}}
 // a small service trolley
 this.box(g,1.3,.7,1.8,-12, .7,-6,C.yellow,true);this.box(g,1.4,.16,1.9,-12,1.1,-6,C.dark);for(const x of[-12.6,-11.4])for(const z of[-6.65,-5.35]){const wh=this.cyl(g,.25,.14,x,.35,z,C.dark);wh.rotation.z=Math.PI/2;}for(let i=0;i<4;i++)this.box(g,.15,.04,1,-12.4+i*.25,1.2,-6,C.steel);
 for(let i=0;i<12;i++){const x=-17+rnd()*33,z=10.7+rnd()*5;this.pot(g,x,0,z);} // occasional desert grasses at perimeter
 }
 makeMiniDetails(){const g=new T.Group();this.scene.add(g);
 // A working maintenance bench with a rack of service tools.
 const x=-10.2,z=1.4;this.pad(x,z,2,3.5);this.box(g,1.65,.14,.85,x,1.1,z,C.navy,true);for(const dx of[-.65,.65])for(const dz of[-.32,.32])this.box(g,.065,1,.065,x+dx,.6,z+dz,C.steel);this.box(g,1.65,1.05,.07,x,1.65,z-.48,C.navy,true);for(let i=0;i<5;i++){const xx=x-.55+i*.26;this.cyl(g,.035,.32,xx,1.65,z-.41,C.steel);this.box(g,.1,.08,.06,xx,1.82,z-.41,C.yellow);}const hammer=this.cyl(g,.1,1.25,x,.0+1.28,z,C.steel,.13,16);hammer.rotation.z=Math.PI/2;this.cyl(g,.16,.24,x+.7,1.28,z,C.orange,.14,14).rotation.z=Math.PI/2;this.sign(g,'PUMA® · SERVICE',1.45,.23,x,2.02,z-.43,C.navy,'#ffd16e');this.toolbox(g,x,.2,z+1.1);this.colliders.push({x,z,w:1.6,d:2.4});this.labels.push({id:'workshop',text:'MANTENIMIENTO',icon:'wrench',point:new T.Vector3(x,2.5,z),access:{x:-8.9,z:2.7}});
 // Air compressor and actual connecting hose, separate from the drilling machine.
 this.box(g,2.1,1.2,1.3,10.4,.9,-1.2,C.yellow,true);this.box(g,1.75,.1,1.25,10.4,1.55,-1.2,C.dark);for(let i=0;i<6;i++)this.box(g,.035,.6,.03,9.8+i*.23,.95,-.53,C.dark);for(const xx of[9.65,11.15]){const wh=this.cyl(g,.28,.16,xx,.32,-1.2,C.dark);wh.rotation.z=Math.PI/2;}const hose=new T.CatmullRomCurve3([new T.Vector3(10,.6,-1.8),new T.Vector3(9,.2,-2),new T.Vector3(8,.17,-1),new T.Vector3(7,.4,-2)]);g.add(new T.Mesh(new T.TubeGeometry(hose,24,.045,6,false),this.mat(C.dark)));this.sign(g,'AIRE',.6,.23,10.4,1.1,-.51,C.yellow,'#243c53');this.colliders.push({x:10.4,z:-1.2,w:2.3,d:1.5});
 // Organized pipe rack and a small stock of supplies.
 this.pad(10,3.6,4,2.3);for(let i=0;i<4;i++)for(let j=0;j<2;j++){const rod=this.cyl(g,.13,3.2,10,.42+j*.25,3.25+i*.27,C.steel,.13,12);rod.rotation.z=Math.PI/2;}for(const xx of[8.5,11.5])this.box(g,.13,.6,1.9,xx,.4,3.6,C.navy);this.box(g,.85,.9,.8,12.1,.55,3.5,0xc4a06c,true);this.barrel(g,12,.1,2,C.orange);this.labels.push({id:'depot',text:'SUMINISTROS',icon:'box',point:new T.Vector3(10.4,1.7,3.6),access:{x:9.8,z:5.1}});this.colliders.push({x:10,z:3.6,w:4,d:2.3});
 // Safety and perimeter props; enough detail to make this small area feel occupied.
 for(const[xx,zz]of[[-13,-5],[11,-10]]){this.box(g,.6,.2,.6,xx,.1,zz,C.concrete);this.cyl(g,.06,4.7,xx,2.45,zz,C.steel);for(const a of[-.35,.35]){this.box(g,.46,.3,.23,xx+a,4.8,zz,C.navy,true);this.box(g,.38,.2,.035,xx+a,4.8,zz+.14,C.white);}}
 this.sign(g,'EPP OBLIGATORIO',1.4,.55,-11.4,1.5,4.5,C.navy,'#f3e7ca');this.cyl(g,.035,1.8,-11.4,.9,4.45,C.steel);this.cone(g,-10.5,.12,4.1);this.cone(g,-9.9,.12,4.1);
 this.box(g,1.6,.12,1.1,-9.7,.2,-3.1,0x9d805d);for(let j=0;j<5;j++)this.box(g,.22,.08,1.1,-10.3+j*.3,.32,-3.1,0xc7a574);this.box(g,.8,.7,.7,-9.7,.72,-3.1,0xbca17b,true);
 for(const[xx,zz]of[[-12,5],[-11,7],[7,8],[13,-5],[-13,-3]]){const base=new T.Mesh(new T.DodecahedronGeometry(.25,0),this.mat(0xb28d69));base.position.set(xx,.13,zz);base.scale.y=.5;g.add(base);for(let i=0;i<5;i++){const leaf=new T.Mesh(new T.ConeGeometry(.045,.45,4),this.mat(i%2?0x7d8555:0x9b9b66));leaf.position.set(xx+Math.sin(i)*.1,.3,zz+Math.cos(i)*.1);leaf.rotation.z=Math.sin(i)*.5;leaf.rotation.x=Math.cos(i)*.5;g.add(leaf);}}
 }
 // Generic: hide/show scene objects within a world-space bounding box
 // Used by any building expansion to clear obstacles in the extension zone
 clearObstaclesInZone(zoneId,minX,maxX,minZ,maxZ,excludeGroup){
  this._zoneObstacles=this._zoneObstacles||{};
  // Restore previous if re-running
  if(this._zoneObstacles[zoneId]){for(const o of this._zoneObstacles[zoneId]){o.visible=o.userData._zoneWasVisible??true;delete o.userData._zoneWasVisible;}delete this._zoneObstacles[zoneId];}
  if(!excludeGroup)return;
  const hidden=[];
  this.scene.traverse(o=>{
   if(!o.isMesh&&!o.isLineSegments)return;
   if(excludeGroup.getObjectById(o.id))return;
   const wp=new T.Vector3();o.getWorldPosition(wp);
   if(wp.x>minX&&wp.x<maxX&&wp.z>minZ&&wp.z<maxZ&&wp.y>0.05&&wp.y<8){
    o.userData._zoneWasVisible=o.visible;
    o.visible=false;
    hidden.push(o);
   }
  });
  this._zoneObstacles[zoneId]=hidden;
 }
 restoreObstaclesInZone(zoneId){
  if(!this._zoneObstacles?.[zoneId])return;
  for(const o of this._zoneObstacles[zoneId]){o.visible=o.userData._zoneWasVisible??true;delete o.userData._zoneWasVisible;}
  delete this._zoneObstacles[zoneId];
 }
 // Workshop upgrade visuals: scaffold during construction + expanded structure at Nv.2+
 updateWorkshop(workshopState){
  if(!workshopState||workshopState.status==='building'){
   if(this._workshopBuilt){
    this.workshopModel?.removeFromParent();this.workshopPad?.removeFromParent();
    this._workshopExt?.removeFromParent();this._workshopScaffold?.removeFromParent();
    if(this._wsExtPadGroup)this._wsExtPadGroup.removeFromParent();
    this.colliders=this.colliders.filter(c=>!c._workshop&&!c._workshopNv2);
    this.walkSurfaces=(this.walkSurfaces||[]).filter(v=>!(v.z===-9.3&&v.x>=-12&&v.x<3));
    this.labels=this.labels.filter(l=>l.id!=='workshop');
    this.workshopModel=null;this.workshopPad=null;this._workshopExt=null;this._workshopScaffold=null;
    this._workshopBuilt=false;this._workshopKey=null;this._workshopRoofUpgrade=null;this._wsExtWalk=false;this._wsExtPad=false;this._wsExtPadGroup=null;
   }
   return;
  }
  if(!this._workshopBuilt){this.makeWorkshop();this._workshopBuilt=true;}
  const level=workshopState?.level||1;
  if(this._workshopRoofUpgrade)this._workshopRoofUpgrade.visible=level>=2;
  const upgrading=!!workshopState?.upgrade;
  const key=`ws-${level}-${upgrading}`;
  if(key===this._workshopKey)return;
  this._workshopKey=key;
  // Remove old extension/scaffold
  if(this._workshopExt){this._workshopExt.traverse(o=>{o.geometry?.dispose();});this._workshopExt.removeFromParent();this._workshopExt=null;}
  if(this._workshopScaffold){this._workshopScaffold.traverse(o=>{o.geometry?.dispose();});this._workshopScaffold.removeFromParent();this._workshopScaffold=null;}
  // Nv.2: extend workshop to the right (+x) with detailed bay + DrillTruck parking
  if(level>=2){
   const g=new T.Group();g.position.set(-7.6,0,-9.3);g.name='workshop-nv2';

   // === EXTENSION BAY (3.5m wider) ===
   // Ground pad (only create once to avoid duplication)
   if(!this._wsExtPad){this._wsExtPadGroup=this.pad(-7.6+5.35,-9.3,4.2,6.5);this._wsExtPad=true;}
   // Concrete floor with thickness
   this.box(g,3.5,.3,5.4,5.35,.3,0,C.steel);
   this.box(g,3.5,.06,5.4,5.35,.46,0,0xb5b8a8); // floor finish

   // Back wall (solid with corrugated texture lines)
   this.box(g,3.5,4.1,.16,5.35,2.3,-2.7,C.cream,true);
   for(let y=.8;y<4.2;y+=.24)this.box(g,3.3,.02,.03,5.35,y,-2.78,0xc4c4b8);

   // Right wall (with window)
   this.box(g,.15,4.1,5.4,7.1,2.3,0,C.cream,true);
   for(let z=-2.5;z<2.6;z+=.24)this.box(g,.035,3.7,.03,7.2,2.35,z,0xb6b8ad);
   // Window on right wall (X-facing, rotated 90° from standard window)
   {const wx=7.18,wy=2.2,wz=0,ww=1.4,wh=1.0;
   for(const side of[-1,1]){this.box(g,.1,wh+.16,.08,wx,wy,wz+side*(ww/2+.04),C.navy);this.box(g,.1,.08,ww+.16,wx,wy+side*(wh/2+.04),wz,C.navy);}
   const glass=new T.Mesh(new T.PlaneGeometry(ww,wh),new T.MeshBasicMaterial({color:0x8fbdc4,transparent:true,opacity:.34,side:T.DoubleSide}));glass.position.set(wx+.055,wy,wz);glass.rotation.y=Math.PI/2;g.add(glass);this.box(g,.1,wh,.05,wx+.06,wy,wz,C.navy);}

   // Roof extension (with slight overhang)
   this.box(g,3.9,.22,5.9,5.4,4.55,0,C.navy,true);
   // True level-2 architecture: PUMA red front fascia, drainage and service lighting.
   // No new collision volumes or route edits are introduced by these finish meshes.
   this.box(g,3.88,.18,.26,5.4,4.47,2.95,0x701e30,true);
   this.box(g,3.8,.034,.055,5.4,4.39,3.10,C.yellow);
   for(const xx of[4.14,6.66]){
    this.box(g,.12,.11,.55,xx,4.30,2.88,C.steel);
    const luminaire=this.box(g,.40,.035,.12,xx,4.24,3.05,0xffe7b9);
    luminaire.material=new T.MeshBasicMaterial({color:0xffe2a0});
   }
   for(const zz of[-1.98,-.97,.04,1.05]){
    this.box(g,.052,2.85,.05,7.19,2.0,zz,0x6a8391);
    this.box(g,.08,.06,.06,7.24,3.23,zz,C.steel);
   }
   // Roof beams
   for(let x=3.8;x<7.2;x+=.32)this.box(g,.027,.03,5.5,x,4.68,0,0x476272);
   // Gutter/fascia
   this.box(g,.08,.1,5.9,7.25,4.5,0,C.steel);

   // Front face: beam + door opening
   this.box(g,3.5,.8,.2,5.35,4.05,2.7,C.cream);
   // Front wall panels (left and right of door)
   this.box(g,.9,3.3,.14,3.95,2.05,2.7,C.cream,true);
   this.box(g,1.2,3.3,.14,6.5,2.05,2.7,C.cream,true);
   // Door frame
   this.box(g,.08,3.3,.12,4.45,2.05,2.72,C.navy);
   this.box(g,.08,3.3,.12,5.85,2.05,2.72,C.navy);
   this.box(g,1.48,.08,.12,5.15,3.72,2.72,C.navy);
   // Door (rolled-up corrugated type)
   this.box(g,1.4,.4,.08,5.15,3.48,2.75,C.steel,true);
   for(let y=3.26;y<3.48;y+=.06)this.box(g,1.3,.02,.04,5.15,y,2.76,0x8c9999);
   // Front window (right panel)
   this.window(g,6.5,2.2,2.78,1.0,.9);

   // Corner pillars (structural)
   this.box(g,.16,4.2,.18,7.1,2.3,2.76,C.navy);
   this.box(g,.16,4.2,.18,7.1,2.3,-2.76,C.navy);

   // === INTERIOR: detailed workshop equipment ===
   // Heavy-duty workbench with vise
   this.box(g,2.4,.16,.85,5.3,1.1,-1.8,C.navy,true);
   for(const dx of[-.95,.95])for(const dz of[-.32,.32])this.box(g,.065,1,.065,5.3+dx,.6,-1.8+dz,C.steel);
   // Vise on bench
   this.box(g,.35,.25,.2,4.6,1.35,-1.8,C.steel,true);
   this.box(g,.05,.18,.15,4.42,1.32,-1.8,C.dark);
   // Tool pegboard behind bench
   this.box(g,2.2,1.8,.06,5.3,2.1,-2.6,C.navy,true);
   for(let i=0;i<7;i++){const xx=4.4+i*.28;this.cyl(g,.025,.25,xx,2.1,-2.55,C.steel);this.box(g,.08,.06,.04,xx,2.25,-2.55,C.yellow);}
   // Storage shelf (right side)
   this.shelf(g,6.3,0,-1.2);
   // Rolling tool cabinet
   this.box(g,.7,.9,.5,6.4,.5,.8,C.orange,true);
   for(let i=0;i<4;i++)this.box(g,.55,.04,.08,6.4,.3+i*.18,.8+.26,0xd68040);
   for(const dz of[-.2,.2])this.cyl(g,.06,.06,6.05,.08,.8+dz,C.dark);
   for(const dz of[-.2,.2])this.cyl(g,.06,.06,6.75,.08,.8+dz,C.dark);
   // Extinguisher
   this.cyl(g,.08,.5,3.85,.55,2.3,0xcc2222);this.cyl(g,.03,.12,3.85,.85,2.3,C.dark);
   // Wall sign
   this.sign(g,'TALLER · Nv.2',2.4,.36,5.35,3.5,2.72,C.cream,'#243c53');

   // === EXTERIOR DECORATION ===
   // Steps/ramp at door
   this.box(g,1.6,.1,.4,5.15,.22,3.0,C.concrete,true);
   this.box(g,1.8,.06,.2,5.15,.12,3.25,C.concrete);
   // Potted plant next to entrance
   this.pot(g,6.9,0,3.3);
   // Safety barrel
   this.barrel(g,3.6,.12,3.2,C.orange);
   // Bollard (protective post)
   this.cyl(g,.08,.9,4.2,.45,3.15,C.yellow);this.box(g,.14,.06,.14,4.2,.92,3.15,C.dark);
   this.cyl(g,.08,.9,6.1,.45,3.15,C.yellow);this.box(g,.14,.06,.14,6.1,.92,3.15,C.dark);

   this.scene.add(g);this._workshopExt=g;
   // Update wall colliders for expanded workshop: remove base right wall, add extension walls
   const baseRight=this.colliders.find(c=>c._wsWall==='right');
   if(baseRight){baseRight.x=-0.5;baseRight.z=-9.3;baseRight.d=5.8;} // Extension right wall at x=-7.6+7.1=-0.5
   // Extend back wall to cover extension
   const backWall=this.colliders.find(c=>c._wsWall==='back');
   if(backWall){backWall.x=-5.85;backWall.w=11;}
   // Update front right pillar for extension
   const frontR=this.colliders.find(c=>c._wsWall==='frontR');
   if(frontR){frontR.x=-1.1;frontR.w=1.4;} // Extension front right panel at world x=-7.6+6.5=-1.1
   // Add extension front left panel (between base and extension doors)
   if(!this.colliders.some(c=>c._wsWall==='extFrontL'))
    this.colliders.push({x:-3.65,z:-6.6,w:1.0,d:.4,_workshop:true,_wsWall:'extFrontL'});
   // Extension interior walkSurface
   if(!this._wsExtWalk){this.walkSurfaces.push({x:-2.25,z:-9.3,w:4.0,d:5.2,y:.42});this._wsExtWalk=true;}
   // The paved parking bay is NOT a solid object. Previous code introduced a
   // phantom 3.8 x 2.6 m obstacle in the pedestrian approach to the workshop.
   // Keep walls/pillars solid; vehicles must register their own actual footprint.
   for(let i=this.colliders.length-1;i>=0;i--)if(this.colliders[i]._workshopNv2)this.colliders.splice(i,1);
   // Clear obstacles in extension zone
   this.clearObstaclesInZone('workshop-nv2',-4.2,-0.3,-12.2,-6.4,g);
  }else{
   this.restoreObstaclesInZone('workshop-nv2');
   // Remove parking collider if downgraded
   const pi=this.colliders.findIndex(c=>c._workshopNv2);
   if(pi>=0)this.colliders.splice(pi,1);
  }
  // Show scaffold during construction (right side extension area)
  if(upgrading){
   const g=new T.Group();g.position.set(-7.6,0,-9.3);g.name='workshop-scaffold';
   // Ground preparation
   this.pad(-7.6+5.35,-9.3,4.2,6.5);
   this.box(g,3.8,.08,5.6,5.35,.08,0,C.concrete,true);
   // Vertical scaffold poles (4 corners)
   for(const x of[3.6,7.1])for(const z of[-2.7,2.7])this.cyl(g,.045,5.2,x,2.6,z,C.steel);
   // Mid poles
   for(const x of[5.35])for(const z of[-2.7,2.7])this.cyl(g,.04,5.2,x,2.6,z,C.steel);
   // Horizontal bars (3 levels)
   for(const y of[1.5,3.0,4.5]){
    for(const z of[-2.7,2.7])this.beam(g,[3.6,y,z],[7.1,y,z],.035,C.steel);
    for(const x of[3.6,7.1])this.beam(g,[x,y,-2.7],[x,y,2.7],.035,C.steel);
   }
   // Diagonal braces (orange)
   this.beam(g,[3.6,.3,2.7],[7.1,4.5,2.7],.025,C.orange);
   this.beam(g,[7.1,.3,-2.7],[3.6,4.5,-2.7],.025,C.orange);
   // Walking planks
   this.box(g,3.5,.1,.7,5.35,1.5,2.8,0xc3a27a);
   this.box(g,3.5,.1,.7,5.35,3.0,2.8,0xc3a27a);
   // Partial walls going up (showing construction progress)
   this.box(g,3.5,1.2,.12,5.35,.9,-2.65,C.cream,true);
   // Foundation blocks
   for(const x of[4,5.35,6.7])this.box(g,.6,.4,.5,x,.2,0,C.concrete,true);
   // Construction sign
   this.sign(g,'EN CONSTRUCCIÓN',2.9,.42,5.35,1.8,2.85,C.yellow,'#253b49');
   // Safety cones
   this.cone(g,3.3,.15,3.2);this.cone(g,7.3,.15,3.2);
   this.cone(g,3.3,.15,-3.2);this.cone(g,7.3,.15,-3.2);
   // Stacked materials (pallets)
   this.box(g,1.2,.12,.8,7.5,.06,0,0xa9875f);
   for(let j=0;j<4;j++)this.box(g,.18,.06,.8,7.15+j*.28,.2,0,0xd6b385);
   this.box(g,.8,.5,.6,7.5,.5,0,C.cream,true);
   this.scene.add(g);this._workshopScaffold=g;
  }
  this.renderer.staticFrame=null;
 }
 makePlayer(){createWorker.call(this);}
 makeGrid(){const g=new T.Group();const lines=[];for(let v=-15;v<=33;v+=.6){lines.push(v,.14,-12,v,.14,12);}for(let v=-12;v<=12;v+=.6)lines.push(-15,.14,v,33,.14,v);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(lines,3));g.add(new T.LineSegments(geo,new T.LineBasicMaterial({color:0xf5e8c4,transparent:true,opacity:.23})));const zone=new T.Mesh(new T.PlaneGeometry(6,7.8),new T.MeshBasicMaterial({color:C.teal,transparent:true,opacity:.13,side:T.DoubleSide,depthWrite:false}));zone.rotation.x=-Math.PI/2;zone.position.set(.6,.15,0);g.add(zone);return g;}
 makeConstruction(){this.construction=new T.Group();this.scene.add(this.construction);this.extension=new T.Group();this.scene.add(this.extension);this.extension.visible=false;}
 setBuildPreview(p,valid){this.grid.visible=true;this.preview.visible=true;this.preview.position.set(p.x,0,p.z);if(!this.preview.children.length){const mat=new T.MeshBasicMaterial({color:C.teal,transparent:true,opacity:.22,depthWrite:false});const ghost=new T.Mesh(new T.BoxGeometry(3.6,3.3,4.2),mat);ghost.position.y=1.8;this.preview.add(ghost);const e=new T.LineSegments(new T.EdgesGeometry(ghost.geometry),new T.LineBasicMaterial({color:C.teal}));e.position.copy(ghost.position);this.preview.add(e);const f=new T.Mesh(new T.PlaneGeometry(3.9,4.5),new T.MeshBasicMaterial({color:C.teal,transparent:true,opacity:.2,side:T.DoubleSide}));f.rotation.x=-Math.PI/2;f.position.y=.16;this.preview.add(f);}for(const o of this.preview.children)o.material.color.setHex(valid?C.teal:0xf77862);}
 hidePreview(){this.grid.visible=false;this.preview.visible=false;}
 updateConstruction(state){const key=state.build?`${state.build.x},${state.build.z},${state.office}`:'';if(key===this.constructionKey)return;this.constructionKey=key;this.construction.clear();this.extension.clear();if(!state.build)return;const {x,z}=state.build;this.construction.position.set(x,0,z);this.extension.position.set(x,0,z);if(state.office>=2){this.extension.visible=true;const g=this.extension;this.box(g,3.6,.35,4.2,0,.3,0,C.navy,true);this.box(g,3.6,2.65,.16,0,1.85,-2.1,C.cream,true);for(const x of[-1.8,1.8]){this.box(g,.16,2.65,4.2,x,1.85,0,C.cream,true);this.box(g,.16,2.8,.18,x,1.9,2.15,C.navy);}this.box(g,3.9,.18,4.45,0,3.3,0,C.navy,true);this.box(g,3.7,.07,4.3,0,3.42,0,C.white);for(let z2=-1.9;z2<2;z2+=.25)this.box(g,.025,2.5,.025,1.89,1.85,z2,0xb3b7ad);this.box(g,1.8,.12,.9,-.5,1.25,1.2,C.orange,true);this.box(g,.6,.4,.08,-.5,1.5,1.2,C.dark,true);this.box(g,.6,.1,.6,-.5,.85,.1,C.navy);
 // correct small-module front: clean panels, one wide window and a side door
 this.box(this.extension,3.6,2.55,.2,0,1.85,2.2,C.cream);this.window(this.extension,-.5,1.95,2.32,1.6,1.25);this.box(this.extension,.65,2,.12,1.25,1.6,2.35,C.navy,true);this.sign(this.extension,'OPERACIONES',2.8,.36,0,2.91,2.33,C.cream,'#243c53');this.box(this.extension,.8,.15,1.5,-2.1,.5,0,C.steel);this.construction.visible=false;
 }else{this.construction.visible=true;this.box(this.construction,3.9,.2,4.5,0,.25,0,C.concrete,true);for(const a of[-2,2])for(const b of[-2.35,2.35]){this.cyl(this.construction,.045,3.9,a,2.1,b,C.steel);this.cone(this.construction,a,.1,b);}for(const y of[1.3,2.6,3.9]){for(const z2 of[-2.35,2.35])this.beam(this.construction,[-2,y,z2],[2,y,z2],.035,C.steel);for(const x2 of[-2,2])this.beam(this.construction,[x2,y,-2.35],[x2,y,2.35],.035,C.steel);}this.beam(this.construction,[-2,.3,2.35],[2,3.9,2.35],.025,C.orange);this.box(this.construction,3.6,.1,.65,0,2.7,2.45,0xc3a27a);for(let i=0;i<4;i++)this.box(this.construction,2.7,.12,.8,0,.5+i*.14,0,C.cream);this.sign(this.construction,'EN CONSTRUCCIÓN',2.9,.48,0,1.25,2.41,C.yellow,'#253b49');}
 }
 isBlocked(x,z,r=.32,state=null){
 // The M5 terrain is explorable immediately after M4, including during
 // blueprint preview. A continuous ~13m-wide ramp reaches the original site.
 // The fence/portón is still enforced by real boundaries once constructed.
 const yard=!!this.yardL1Open&&x>=-79&&x<=-22&&z>=-40&&z<=6;
 const approach=!!this.yardL1Open&&x>=-27&&x<=-6&&z>=-20&&z<=-7;
 if(!yard&&!approach&&(x<-18||x>35||z<-16||z>14))return true;if(this.chapterMode&&!this.hsecActive&&!this._workshopBuilt&&!(yard||approach)&&(x<-13||x>3||z<-6||z>9))return true;if(this.chapterMode&&!this.hsecActive&&this._workshopBuilt&&!(yard||approach)&&(x<-17||x>18||z<-14||z>9))return true;if(this.officeEnabled!==false&&this.office.userData.api.blocked(x-this.office.position.x,z-this.office.position.z,r))return true;if(this.chapterCollision?.(x,z,r))return true;const arr=state?.build?[...this.colliders,{x:state.build.x,z:state.build.z,w:4,d:4.8}]:this.colliders;return arr.some(c=>circleHitsRect(x,z,r,c))||this.physicalBoundaries.some(c=>circleHitsRect(x,z,r,c));}
 pick(clientX,clientY,height=0){const pt=new T.Vector2(clientX/innerWidth*2-1,-clientY/innerHeight*2+1);this.ray.setFromCamera(pt,this.camera);const p=new T.Vector3();return this.ray.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),-height),p);}
 project(pos){const p=pos.clone().project(this.camera);return{x:(p.x*.5+.5)*innerWidth,y:(-.5*p.y+.5)*innerHeight,visible:p.z<1};}
 setCharacter(name){this.player.userData.character=name;}
 sampleGround(x,z){let y=this.chapterMode?desertGroundHeight(x,z):0;y=Math.max(y,this.officeEnabled!==false?(this.office?.userData.api.ground(x-this.office.position.x,z-this.office.position.z)||0):0);for(const surface of this.walkSurfaces||[])if(Math.abs(x-surface.x)<surface.w/2&&Math.abs(z-surface.z)<surface.d/2)y=Math.max(y,surface.y);return y;}
 resize(){this.renderer.setSize(innerWidth,innerHeight);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();}
 update(state,dt,time,moving=false,drilling=false,lobby=false){this.animateAtmosphere?.(time);const terrainY=this.sampleGround(state.position.x,state.position.z);this.playerGround??=terrainY;
// The chapter avatar's feet align exactly with the desert mesh;
// camera movement is still smoothed independently.
this.playerGround=this.chapterMode?terrainY:
 this.playerGround+(terrainY-this.playerGround)*(1-Math.exp(-dt*14));this.player.position.set(state.position.x,this.playerGround,state.position.z);this.player.visible=!lobby;this.worker.update(dt,(x,z)=>footSupportHeight(terrainY,this.sampleGround(x,z),this.chapterMode&&this.isBlocked(x,z,.025)),time);if(this.carriage)this.carriage.position.y=4+Math.sin(time*(drilling?18:.6))*(drilling?.12:.015);if(drilling&&this.drillShaft)this.drillShaft.rotation.y+=dt*25;if(!this.chapterMode)this.updateConstruction(state);if(this.cameraRig&&!this.chapterCamera&&!this.inspect){const info=this.cameraRig.update(dt,{position:state.position,ground:this.cameraMode==='builder'?0:this.playerGround,height:this.avatarHeight||1.85,orbit:this.orbit,mode:this.cameraMode||'explore',focus:this.cameraFocus,obstacles:this.cameraObstacles?.()||[],snap:this.snapCamera});this.snapCamera=false;this.target.copy(this.cameraRig.target);this.cameraOffset=this.camera.position.clone().sub(this.target);Object.assign(this.renderer.domElement.dataset,{cameraYaw:this.orbit.yaw.toFixed(3),cameraPitch:this.orbit.pitch.toFixed(3),cameraPreset:info.preset,cameraDistance:info.distance.toFixed(3),cameraSelectedDistance:info.selectedDistance.toFixed(3),cameraPitchDegrees:info.pitch.toFixed(2),cameraFov:info.fov.toFixed(2),cameraCollision:String(info.collision),cameraPosition:this.camera.position.toArray().map(n=>n.toFixed(3)).join(','),cameraTarget:this.target.toArray().map(n=>n.toFixed(3)).join(',')});}else{this.camera.fov=43;this.camera.updateProjectionMatrix();const aspect=innerWidth/innerHeight;const distance=aspect>1.3?1:1.15;let off=(lobby?new T.Vector3(13,8.5,17):new T.Vector3(9,6.7,13)).multiplyScalar(distance*this.zoom);let focus=lobby?new T.Vector3(-1,1,-1):new T.Vector3(state.position.x*.35-2,1.25,state.position.z*.2-.6);if(this.inspect){focus=new T.Vector3(-6,1.4,0);const angles={three:new T.Vector3(5.4,3.1,6.7),front:new T.Vector3(.01,1.3,9),side:new T.Vector3(7.7,1.7,.01),back:new T.Vector3(-5.8,2.5,-7),plan:new T.Vector3(.001,7.0,.01)};off=(angles[this.inspectAngle]||angles.three).clone().multiplyScalar(this.zoom);if(this.inspectMode==='worker'){focus=new T.Vector3(state.position.x,1.58,state.position.z);const workerAngles={three:new T.Vector3(2.8,.8,3.8),front:new T.Vector3(0,.6,4.8),side:new T.Vector3(4.8,.6,0),back:new T.Vector3(0,.6,-4.8)};off=(workerAngles[this.inspectAngle]||workerAngles.three).clone().applyAxisAngle(new T.Vector3(0,1,0),this.player.rotation.y).multiplyScalar(this.zoom);}}if(!this.inspect&&!lobby){const rotated=orbitOffset(off,this.orbit);off.set(rotated.x,rotated.y,rotated.z);if(this.orbit.manual)focus.set(state.position.x,1.05,state.position.z);}if(this.chapterInterior){focus.set(-6,.9,0);const v=orbitOffset(new T.Vector3(3.4,4.8,5.4).multiplyScalar(this.zoom),this.orbit);off.set(v.x,v.y,v.z);}if(this.chapterCamera){focus.copy(this.chapterCamera.target);off.copy(this.chapterCamera.offset);}this.target.lerp(focus,1-Math.exp(-dt*(this.orbit.manual?6:3)));this.cameraOffset??=off.clone();this.cameraOffset.lerp(off,1-Math.exp(-dt*(this.orbit.manual?10:3)));this.camera.position.copy(this.target).add(this.cameraOffset);this.camera.lookAt(this.target);if(this.lockValidationCamera){this.validationCamera??={position:this.camera.position.clone(),target:this.target.clone()};this.camera.position.copy(this.validationCamera.position);this.camera.lookAt(this.validationCamera.target);}else this.validationCamera=null;this.renderer.domElement.dataset.cameraYaw=this.orbit.yaw.toFixed(3);this.renderer.domElement.dataset.cameraPitch=this.orbit.pitch.toFixed(3);}if(this.office.userData.premiumRoof)this.office.userData.premiumRoof.visible=(state.office?.level||1)>=2;this.office.userData.api.update(dt,this.chapterUpgradePreview?0:state.position.x-this.office.position.x,this.chapterUpgradePreview?0:state.position.z-this.office.position.z,this.camera.position,this.inspect&&this.inspectMode!=='worker'&&this.inspectAngle==='plan',this.inspect&&this.inspectMode==='office');if(this.chapterMode)this.office.getObjectByName('11 · Identificación de zonas').visible=false;const drawAt=performance.now(),frameBefore=this.renderer.frames;this.renderer.render(this.scene,this.camera);const endAt=performance.now();if(!this.renderer.isSoftwareRenderer||this.renderer.frames!==frameBefore)this.metrics?.record(endAt-drawAt,endAt);if(this.metrics&&endAt-(this.lastMetrics||0)>500){this.lastMetrics=endAt;const m=this.metrics.summary;Object.assign(this.renderer.domElement.dataset,{renderer:this.renderer.isSoftwareRenderer?'software':'webgl2',quality:this.quality,frameFps:m.fps.toFixed(1),renderP50:m.p50.toFixed(2),renderP95:m.p95.toFixed(2),renderSamples:String(m.samples),drawCalls:String(this.renderer.info?.render.calls||0),triangles:String(this.renderer.info?.render.triangles||0)});}}
}
