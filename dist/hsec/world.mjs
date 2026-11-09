import {ConstructionHologram} from '../chapter/construction-hologram.mjs';
import * as T from '../vendor/three.module.js';
import {buildShed} from './shed-model.mjs';
import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {CandidateRig} from '../assets3d/worker-candidate.mjs';
import {refineAvatarMaterial} from '../graphics/materials.mjs';
import {ProductPreview,cutoutPNG} from '../chapter/product-preview.mjs';
import {renderPlayerPortrait} from '../chapter/portrait.mjs';
import {assetDefinition,HSEC_ANCHORS as A,HSEC_ZONE as Z,EMPLOYEES,HSEC_SHED_WALLS} from './catalog.mjs';
import {ensureHsec,active,coneZonePositions} from './state.mjs';
import {boxHit,footprint,segmentDistance} from './network.mjs';
const C={steel:0x374d59,silver:0xb9c5c7,red:0x762538,cream:0xe2d2b6,yellow:0xffbd24,black:0x192932,orange:0xf78424,white:0xedf3ed,green:0x339f8d};
export function assetModel(asset,{ghost=false}={}){
 const d=assetDefinition(asset.type),g=new T.Group(),mats=new Map(),colliders=[];g.name=d.name;
 const mat=c=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({
  color:c,roughness:c===0xffe8bf?.31:.76,
  metalness:[C.steel,C.silver].includes(c)?.45:.05,
  ...(c===0xffe8bf?{emissive:0xffc676,emissiveIntensity:1.25}: {})
 }));return mats.get(c);};
 const add=(geo,c,x,y,z,rot=0)=>{const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.rotation.y=rot;m.castShadow=m.receiveShadow=true;g.add(m);return m;};
 const box=(w,h,dep,x,y,z,c,rot=0)=>add(new T.BoxGeometry(w,h,dep),c,x,y,z,rot);
 const cyl=(r,h,x,y,z,c,top=r)=>add(new T.CylinderGeometry(top,r,h,10),c,x,y,z);
 const rail=(x,z,w=2)=>{for(const q of[-w/2+.1,w/2-.1])cyl(.035,1.05,x+q,.525,z,C.yellow);for(const y of[.5,1.02])box(w,.055,.055,x,y,z,C.yellow);};
 if(d.route==='linear'){// Linear barriers/railings/fences: repeat geometry along the route.
 add(new T.CircleGeometry(.01,4),0x374d59,0,.001,0);
 const pts=asset.points||[],lp=pts.map(p=>({x:p.x-(asset.x||0),z:p.z-(asset.z||0)})),unit=d.w;
 const localBox=(sg,w,h,dep,x,y,z,c,rot=0)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,dep),mat(c));m.position.set(x,y,z);m.rotation.y=rot;m.castShadow=m.receiveShadow=true;sg.add(m);return m;};
 const localCyl=(sg,r,h,x,y,z,c,top=r)=>{const m=new T.Mesh(new T.CylinderGeometry(top,r,h,10),mat(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;sg.add(m);return m;};
 for(let i=1;i<lp.length;i++){const p=lp[i-1],q=lp[i],len=Math.hypot(q.x-p.x,q.z-p.z),angle=Math.atan2(q.x-p.x,q.z-p.z);
  for(let j=unit/2;j<len+.01;j+=unit){const t=Math.min(.999,j/len),sx=p.x+(q.x-p.x)*t,sz=p.z+(q.z-p.z)*t;
   const sg=new T.Group();sg.position.set(sx,0,sz);sg.rotation.y=angle+Math.PI/2;
   if(d.id==='barrier'){localBox(sg,2,.18,.42,0,.09,0,C.orange);localBox(sg,1.94,.08,.38,0,.22,0,C.orange);localBox(sg,1.96,.35,.36,0,.435,0,C.orange);localBox(sg,1.92,.12,.3,0,.67,0,C.orange);for(const x of[-.75,-.25,.25,.75])localBox(sg,.22,.15,.22,x,.55,0,C.white);localBox(sg,1.96,.04,.32,0,.75,0,C.orange);for(const x of[-.7,.7])localCyl(sg,.03,.06,x,.78,0,C.steel);for(const x of[-.85,.85])localBox(sg,.2,.12,.44,x,.06,0,C.black);}
   else if(d.id==='railing'){for(const rx of[-.9,.9])localCyl(sg,.035,1.05,rx,.525,0,C.yellow);for(const y of[.5,1.02])localBox(sg,2,.055,.055,0,y,0,C.yellow);for(const rx of[-.9,.9]){localBox(sg,.22,.04,.28,rx,.02,0,C.steel);localCyl(sg,.04,.05,rx,.05,0,C.yellow);}localBox(sg,2,.08,.04,0,.08,0,C.yellow);}
   else if(d.id==='fence'){for(const rx of[-1,1]){localCyl(sg,.045,1.8,rx,.9,0,C.steel);localBox(sg,.18,.04,.18,rx,.02,0,C.steel);localCyl(sg,.055,.04,rx,1.82,0,C.silver);}for(const y of[.18,.55,1.2,1.72])localBox(sg,2,.035,.035,0,y,0,C.silver);for(let x=-.9;x<=.9;x+=.15){localBox(sg,.008,1.55,.008,x,.92,0,C.silver).rotation.z=.12;localBox(sg,.008,1.55,.008,x,.92,0,C.silver).rotation.z=-.12;}localBox(sg,2,.02,.02,0,1.78,0,C.silver);}
   g.add(sg);colliders.push({x:sx,z:sz,w:Math.abs(Math.sin(angle))*unit+Math.abs(Math.cos(angle))*d.d,d:Math.abs(Math.cos(angle))*unit+Math.abs(Math.sin(angle))*d.d});}}
 }else if(d.route){// Road surface + markings are painted on the decal canvas (see paintRoads).
 // Minimal anchor mesh for the asset system (invisible, just a flat disc at origin).
 add(new T.CircleGeometry(.01,4),d.id==='vehicle'?0x4a4f4a:0x7a8a82,0,.001,0);
 // Level-3 pedestrian railings are the only visible 3D geometry on routes.
 if(d.id==='pedestrian'&&asset.level>=3){const pts=asset.points||[],lp=pts.map(p=>({x:p.x-asset.x,z:p.z-asset.z}));
  for(let i=1;i<lp.length;i++){const p=lp[i-1],q=lp[i],len=Math.hypot(q.x-p.x,q.z-p.z),angle=Math.atan2(q.x-p.x,q.z-p.z);
   for(let j=.8;j<len-.5;j+=1.8){const t=j/len;for(const side of[-1,1]){const rx=p.x+(q.x-p.x)*t+Math.cos(angle)*.75*side,rz=p.z+(q.z-p.z)*t-Math.sin(angle)*.75*side;const rg=new T.Group();g.add(rg);const before=g.children.length;rail(0,0,1.6);const parts=g.children.splice(before);parts.forEach(m=>rg.add(m));rg.position.set(rx,0,rz);rg.rotation.y=angle+Math.PI/2;colliders.push({x:rx,z:rz,w:Math.abs(Math.sin(angle))*1.6+.08,d:Math.abs(Math.cos(angle))*1.6+.08});}}}}
 }else if(d.id==='shed'){
 buildShed({box,cyl,add,C,colliders,walls:HSEC_SHED_WALLS});
 }else if(d.id==='cone'){
  // Base plate with beveled edge
  box(.42,.03,.42,0,.015,0,C.black);box(.38,.015,.38,0,.035,0,C.black);
  // Cone body: stacked truncated cylinders for smooth taper
  cyl(.17,.18,0,.13,0,C.orange,.145);cyl(.145,.16,0,.3,0,C.orange,.115);
  cyl(.115,.14,0,.44,0,C.orange,.075);cyl(.075,.12,0,.56,0,C.orange,.03);
  // Reflective bands
  cyl(.148,.065,0,.2,0,C.white,.135);cyl(.1,.055,0,.45,0,C.white,.085);
  // Tip cap
  cyl(.032,.04,0,.64,0,C.orange,.015);
 }else if(d.id==='railing'){
  rail(0,0);
  // Floor mounting plates
  for(const x of[-.9,.9]){box(.22,.04,.28,x,.02,0,C.steel);cyl(.04,.05,x,.05,0,C.yellow);}
  // Kick plate at bottom
  box(2,.08,.04,0,.08,0,C.yellow);
 }else if(d.id==='barrier'){
  // Base slab with rounded profile
  box(2,.18,.42,0,.09,0,C.orange);box(1.94,.08,.38,0,.22,0,C.orange);
  // Main body - tapered jersey barrier shape
  box(1.96,.35,.36,0,.435,0,C.orange);box(1.92,.12,.3,0,.67,0,C.orange);
  // White reflective stripes
  for(const x of[-.75,-.25,.25,.75])box(.22,.15,.22,x,.55,0,C.white);
  // Top cap
  box(1.96,.04,.32,0,.75,0,C.orange);
  // Lifting eyes
  for(const x of[-.7,.7])cyl(.03,.06,x,.78,0,C.steel);
  // Base stabilizers
  for(const x of[-.85,.85])box(.2,.12,.44,x,.06,0,C.black);
 }else if(d.id==='fence'){
  // Posts with base plates and caps
  for(const x of[-1,1]){cyl(.045,1.8,x,.9,0,C.steel);box(.18,.04,.18,x,.02,0,C.steel);cyl(.055,.04,x,1.82,0,C.silver);}
  // Horizontal rails top and bottom
  for(const y of[.18,.55,1.2,1.72])box(2,.035,.035,0,y,0,C.silver);
  // Mesh wires (diagonal pattern)
  for(let x=-.9;x<=.9;x+=.15){const m=box(.008,1.55,.008,x,.92,0,C.silver);m.rotation.z=.12;}
  for(let x=-.9;x<=.9;x+=.15){const m=box(.008,1.55,.008,x,.92,0,C.silver);m.rotation.z=-.12;}
  // Tension wire at top
  box(2,.02,.02,0,1.78,0,C.silver);
 }else if(d.id==='bollard'){
  // Mounting plate
  box(.28,.03,.28,0,.015,0,C.steel);
  // Base cylinder
  cyl(.095,.12,0,.09,0,C.steel);
  // Main post with taper
  cyl(.09,.7,0,.45,0,C.yellow,.085);
  // Reflective band
  cyl(.092,.08,0,.6,0,C.white,.088);
  // Cap dome
  cyl(.088,.06,0,.78,0,C.black,.04);cyl(.085,.03,0,.82,0,C.black,.02);
  // Anchor bolts visual
  for(const [bx,bz] of [[.1,0],[-.1,0],[0,.1],[0,-.1]])box(.025,.015,.025,bx,.035,bz,C.silver);
 }else if(['tower','post'].includes(d.id)){
  // Foundation base plate
  box(.75,.08,.75,0,.04,0,C.steel);box(.6,.04,.6,0,.1,0,C.steel);
  // Main column
  if(d.id==='tower'){
   // Lattice tower structure: four corner columns + cross bracing
   for(const [cx,cz] of[[-.2,-.2],[-.2,.2],[.2,-.2],[.2,.2]])cyl(.035,d.h-.3,cx,d.h/2-.05,cz,C.steel);
   // Horizontal bracing rings
   for(let y=.6;y<d.h-.6;y+=.55){box(.44,.03,.03,0,y,-.2,C.silver);box(.44,.03,.03,0,y,.2,C.silver);box(.03,.03,.44,-.2,y,0,C.silver);box(.03,.03,.44,.2,y,0,C.silver);}
   // Diagonal bracing
   for(let y=.3;y<d.h-1;y+=1.1){const m1=box(.02,1.1,.02,0,y+.55,-.2,C.silver);m1.rotation.z=.35;const m2=box(.02,1.1,.02,0,y+.55,.2,C.silver);m2.rotation.z=-.35;}
  }else{
   // Simple pole
   cyl(.065,d.h-.3,0,d.h/2,0,C.yellow,.055);
   // Mounting bracket
   box(.18,.06,.06,0,d.h-.5,0,C.silver);
  }
  // Light head assembly
  const h=d.h-.15;
  box(.95,.06,.08,0,h-.05,0,C.steel); // crossbar
  for(const x of[-.32,.32]){
   // Housing
   box(.38,.28,.22,x,h,0,C.black);
   // Lens (slightly recessed)
   box(.32,.2,.02,x,h,.12,C.white);
   // Visor hood
   box(.38,.04,.12,x,h+.16,.06,C.black);
   // Heat fins
   for(const fz of[-.08,-.04,0,.04])box(.35,.24,.008,x,h,fz-.06,C.steel);
  }
  g.userData.light={y:h,range:d.range};
 }else if(d.id==='crossing'){
  // The finished crossing is painted ON the road canvas by paintRoads().
  // Do not stack a raised asphalt slab/striped boxes above the painted road.
  // During construction retain a visible holographic footprint only.
  if(ghost){
   box(3.8,.012,1.8,0,.012,0,C.silver);
   for(let x=-1.54;x<=1.55;x+=.46)box(.24,.006,1.46,x,.021,0,C.white);
  }else add(new T.CircleGeometry(.01,4),C.steel,0,.001,0);
 }else if(d.id==='sign'){
  // Base plate
  box(.24,.035,.24,0,.02,0,C.steel);
  // Post
  cyl(.022,1.5,0,.77,0,C.steel);
  // Sign panel (triangular hazard sign shape - approximated as diamond)
  box(.5,.5,.035,0,1.42,0,C.yellow);box(.44,.44,.015,0,1.42,.02,C.black);
  // Inner symbol area
  box(.06,.22,.018,0,1.42,.03,C.black); // exclamation body
  box(.06,.06,.018,0,1.24,.03,C.black); // exclamation dot
  // Reflective border
  for(const y of[1.17,1.67])box(.5,.03,.036,0,y,0,C.white);
  for(const oy of[-.23,.23])box(.03,.5,.036,0,1.42+oy*.02,0,C.white);
  // Mounting bracket
  box(.12,.06,.06,0,1.14,0,C.silver);
 }else if(d.id==='extinguisher'){
  // Cabinet box with depth
  box(.42,1.05,.26,0,.57,0,C.red);
  // Cabinet door with handle
  box(.38,.95,.03,0,.57,.15,0xdd3333);box(.04,.18,.04,.14,.57,.17,C.silver);
  // Glass panel (slightly lighter)
  box(.28,.6,.01,-.02,.57,.17,0xff8888);
  // Extinguisher cylinder visible through glass
  cyl(.075,.52,-.02,.57,.05,0xcc2222);
  // Hose on side
  cyl(.015,.25,.14,.72,.05,C.black);
  // Pressure gauge
  cyl(.03,.01,-.02,.86,.14,C.white);
  // Top label
  box(.32,.12,.02,0,1.02,.15,C.white);
  // Base shelf
  box(.4,.04,.24,0,.08,0,C.steel);
 }else if(d.id==='marking')box(2,.012,.13,0,.02,0,C.yellow);
 // Bake mesh transforms and batch by material: one draw call per asset color.
 g.updateMatrixWorld(true);for(const material of mats.values()){const meshes=[];g.traverse(o=>{if(o.isMesh&&o.material===material)meshes.push(o);});const geos=meshes.map(m=>m.geometry.clone().applyMatrix4(m.matrixWorld));if(geos.length){const merged=mergeGeometries(geos,false);geos.forEach(x=>x.dispose());meshes.forEach(m=>{m.geometry.dispose();m.removeFromParent();});const mesh=new T.Mesh(merged,material);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);}}
 g.userData.colliders=colliders;if(d.solid&&!colliders.length)colliders.push({x:0,z:0,w:d.w,d:d.d});
 if(ghost)g.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.color.set(0x59d9ff);o.material.emissive=new T.Color(0x2dccff);o.material.emissiveIntensity=0.4;o.material.transparent=true;o.material.opacity=.55;o.material.depthWrite=false;o.castShadow=false;}});
 else {const c=asset.condition||{physical:100,visual:100,functional:100};g.traverse(o=>{if(o.isMesh){o.material.color.lerp(new T.Color(0x79705e),(100-c.visual)/140);o.material.roughness=Math.min(1,.65+(100-c.visual)/160);}});}
 return g;
}
export function releaseModel(g){if(!g)return;if(g.userData.constructionHologram){g.dispose();return;}const mats=new Set();g.traverse(o=>{o.geometry?.dispose();if(o.material)mats.add(o.material);});mats.forEach(m=>m.dispose());g.removeFromParent();}
export class HsecWorld{
 constructor(w){this.w=w;this.group=new T.Group();w.scene.add(this.group);this.models=new Map();this.fadingHolograms=[];this.npcs=new Map();this.thumbs=new Map();this.colliders=[];this.draft=null;const baseGround=w.sampleGround.bind(w);this.baseGround=baseGround;w.sampleGround=(x,z)=>Math.max(baseGround(x,z),this.group.visible?this.surface(x,z):0);const blocked=w.chapterCollision,obstacles=w.cameraObstacles;w.chapterCollision=(x,z,r)=>blocked(x,z,r)||this.blocked(x,z,r);w.cameraObstacles=()=>[...obstacles(),...(this.group.visible?this.colliders:[])];this.originalSky=w.scene.background;this.nightSky=new T.Color(0x14253e);this.coverage=new T.Group();this.group.add(this.coverage);this.draftAnims=[];this.animTime=0;this.glowTex=null;
  // Road overlay: a transparent decal plane painted with built routes
  this.roadCanvas=document.createElement('canvas');this.roadCanvas.width=1024;this.roadCanvas.height=1024;
  this.roadTex=new T.CanvasTexture(this.roadCanvas);this.roadTex.minFilter=T.LinearMipmapLinearFilter;this.roadTex.magFilter=T.LinearFilter;this.roadTex.generateMipmaps=true;
  const roadGeo=new T.PlaneGeometry(30,24);roadGeo.rotateX(-Math.PI/2);
  this.roadMat=new T.MeshStandardMaterial({map:this.roadTex,transparent:true,alphaTest:.02,depthWrite:false,roughness:.92,metalness:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
  this.roadPlane=new T.Mesh(roadGeo,this.roadMat);this.roadPlane.position.set(1.5,.045,-1.5);this.roadPlane.receiveShadow=true;this.roadPlane.renderOrder=1;this.group.add(this.roadPlane);
  this.roadRevision=-1;
  // NPC status bubble (HTML overlay)
  this.npcBubble=document.createElement('div');this.npcBubble.className='npcBubble';this.npcBubble.hidden=true;(document.querySelector('#hud')||document.body).append(this.npcBubble);this.npcBubbleState='';
  // Maintenance ring (3D pulsing ring at the asset being repaired)
  this.maintRing=new T.Mesh(new T.RingGeometry(.6,.75,32),new T.MeshBasicMaterial({color:0xffbd24,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}));this.maintRing.rotation.x=-Math.PI/2;this.maintRing.visible=false;this.group.add(this.maintRing);
  this.lastConditionCheck=0;this.alertedAssets=new Set();
  // Asset info card (tap-to-inspect)
  this.assetCard=document.createElement('div');this.assetCard.className='assetCard';this.assetCard.hidden=true;(document.querySelector('#hud')||document.body).append(this.assetCard);this.assetCardId=null;}
 surface(x,z){let y=0;for(const a of this.state?.hsec?.assets||[]){if(a.status!=='built')continue;const d=assetDefinition(a.type);if(d.route&&a.points.slice(1).some((p,i)=>segmentDistance({x,z},a.points[i],p)<=d.w/2))y=Math.max(y,d.id==='vehicle'?.05:.04);if(a.type==='shed'&&boxHit({x,z},footprint(a)))y=Math.max(y,.08);if(a.type==='crossing'&&boxHit({x,z},footprint(a)))y=Math.max(y,.03);}return y;}
 blocked(x,z,r){return this.group.visible&&this.colliders.some(b=>boxHit({x,z},b,r));}
 hitTestAsset(worldX,worldZ){if(!this.state?.hsec)return null;const h=this.state.hsec;for(const a of h.assets){if(a.status!=='built')continue;const d=assetDefinition(a.type);if(d.route){if(a.points.slice(1).some((p,i)=>segmentDistance({x:worldX,z:worldZ},a.points[i],p)<d.w/2+.5))return a;}else{const fp=footprint(a),reach=Math.max(fp.w,fp.d)/2+.5;if(Math.abs(worldX-a.x)<reach&&Math.abs(worldZ-a.z)<reach)return a;}}return null;}
 showAssetCard(asset){if(!asset){this.assetCard.hidden=true;this.assetCardId=null;return;}
  this.assetCardId=asset.id;const d=assetDefinition(asset.type),h=this.state.hsec;
  const bar=(label,val,color)=>`<div class="acBar"><span>${label}</span><div class="acTrack"><div class="acFill" style="width:${val}%;background:${val>60?'#5fcfa0':val>30?'#ffbd24':'#ff5544'}"></div></div><b>${Math.round(val)}%</b></div>`;
  const worst=Math.min(asset.condition.physical,asset.condition.visual,asset.condition.functional);
  const orders=h.orders.filter(o=>o.assetId===asset.id&&o.status==='pending');
  let actions='';
  if(d.disposable){actions=`<span style="font-size:8.5px;color:#8ab4cc;padding:4px 0;display:block;text-align:center">Desechable · retirar y reemplazar</span>`;}
  else if(orders.length){actions=orders.map(o=>`<button class="acRepair" data-order="${o.id}">${o.component==='visual'?'🎨':'⚙️'} ${o.component==='visual'?'Repintar':o.component==='physical'?'Reparar':'Reparar'} · ${o.cost}</button>`).join('');}
  else if(worst<60){actions=`<button class="acInspect" data-asset="${asset.id}">🔍 Inspeccionar</button>`;}
  else if(worst>=60&&worst<90){actions=`<span style="font-size:8.5px;color:#5fcfa0;padding:4px 0;display:block;text-align:center">✓ En buen estado</span>`;}
  const canUpgrade=d.route&&asset.level<3;
  this.assetCard.innerHTML=`<div class="acHead"><b>${d.name}</b><span>N${asset.level}</span><button class="acClose">✕</button></div>${bar('🏗️ Estructura',asset.condition.physical)}${bar('🎨 Apariencia',asset.condition.visual)}${bar('⚡ Operación',asset.condition.functional)}<div class="acActions">${actions}${canUpgrade?`<button class="acUpgrade" data-asset="${asset.id}">⬆ Mejorar</button>`:''}<button class="acRemove" data-asset="${asset.id}">🗑 Retirar</button></div>`;
  this.assetCard.hidden=false;
  this.assetCard.querySelector('.acClose')?.addEventListener('click',()=>this.showAssetCard(null));
  for(const btn of this.assetCard.querySelectorAll('.acRepair'))btn.addEventListener('click',()=>{this.onRepair?.(btn.dataset.order);this.showAssetCard(null);});
  for(const btn of this.assetCard.querySelectorAll('.acInspect'))btn.addEventListener('click',()=>{this.onInspect?.(btn.dataset.asset);setTimeout(()=>{const updated=this.state.hsec?.assets.find(a=>a.id===asset.id);if(updated)this.showAssetCard(updated);},50);});
  for(const btn of this.assetCard.querySelectorAll('.acUpgrade'))btn.addEventListener('click',()=>{this.onUpgrade?.(btn.dataset.asset);this.showAssetCard(null);});
  for(const btn of this.assetCard.querySelectorAll('.acRemove'))btn.addEventListener('click',()=>{this.onRemove?.(btn.dataset.asset);this.showAssetCard(null);});}
 paintRoads(h){// V12: all route surfacing shares the SAME metric canvas space.
  // Previous V10 painted each chain (including edges + dashes) separately.
  // At T intersections a later chain laid its dark shoulder over the prior
  // route, creating hard seams/visually severed roads. Non-square world-to-
  // canvas mapping also made road widths depend on drawing direction.
  const cv=this.roadCanvas,ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  const wx=30,wz=24,ox=-13.5,oz=-13.5,sx=W/wx,sz=H/wz;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
  const routes=(h.assets||[]).filter(a=>
   (a.type==='vehicle'||a.type==='pedestrian')&&a.status==='built'&&
   a.points?.length>=2
  );
  const applyWorld=()=>ctx.setTransform(sx,0,0,sz,-ox*sx,-oz*sz);
  const grouped=kind=>routes.filter(a=>a.type===kind);
  const pathFor=assets=>{
   const path=new Path2D();
   for(const a of assets){
    for(let i=1;i<a.points.length;i++){
     const p=a.points[i-1],q=a.points[i];
     if(Math.hypot(q.x-p.x,q.z-p.z)<.005)continue;
     path.moveTo(p.x,p.z);path.lineTo(q.x,q.z);
    }
   }
   return path;
  };
  const paintNetwork=(kind)=>{
   const assets=grouped(kind);if(!assets.length)return;
   const d=assetDefinition(kind),veh=kind==='vehicle',path=pathFor(assets);
   // Every stroke pass covers ALL segments before another pass begins.
   // Round caps/joins now create contiguous pavement on L/T/X intersections,
   // no matter how individual assets were split or saved.
   ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash([]);
   const stroke=(width,color,opacity=1)=>{
    ctx.globalAlpha=opacity;ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke(path);
   };
   stroke(d.w+.76,veh?'#927f69':'#9c9783',.42);
   stroke(d.w+.40,veh?'#2a2d2a':'#3a4a42');
   if(veh)stroke(d.w+.10,'#d0d4d0');
   stroke(d.w,veh?'#535e63':'#9ba8a5');
   stroke(d.w*.35,veh?'#6f7a7b':'#cad0c5',.15);
   ctx.globalAlpha=1;
   if(veh){
    // The worn wheel tracks may be split, but cannot reintroduce an asphalt
    // seam because they are drawn on top of the consolidated road fill.
    ctx.strokeStyle='rgba(33,43,49,.22)';
    ctx.lineWidth=.105;
    for(const offset of[-d.w*.24,d.w*.24])for(const a of assets){
     for(let k=1;k<a.points.length;k++){
      const p=a.points[k-1],q=a.points[k],dx=q.x-p.x,dz=q.z-p.z,len=Math.hypot(dx,dz);
      if(len<.005)continue;
      const nx=-dz/len,nz=dx/len;
      ctx.beginPath();ctx.moveTo(p.x+nx*offset,p.z+nz*offset);
      ctx.lineTo(q.x+nx*offset,q.z+nz*offset);ctx.stroke();
     }
    }
   }else{
    // Footpath side line belongs just inside the path, not outside it:
    // previous d.w+.08 stroke at the end reintroduced a hard rim.
    stroke(d.w-.13,'#c8ccc8',.30);
   }
   ctx.setLineDash([.45,.45]);
   ctx.lineWidth=.06;
   ctx.strokeStyle=veh?'#f0c46b':'#e8efdf';
   ctx.stroke(path);ctx.setLineDash([]);
   ctx.restore();
  };
  applyWorld();
  paintNetwork('pedestrian');
  paintNetwork('vehicle');
  // Crosswalks are pedestrian connections painted ON the same uninterrupted
  // pavement. Clip them to the assembled roadway, not a second rectangle.
  const vehicle=grouped('vehicle'),crossings=(h.assets||[]).filter(a=>a.type==='crossing'&&a.status==='built');
  if(vehicle.length&&crossings.length){
   const vehicleFootprint=pathFor(vehicle);
   ctx.save();
   ctx.lineWidth=assetDefinition('vehicle').w;
   ctx.lineCap='round';ctx.lineJoin='round';
   // Canvas has no strokeClip. Fill a union of metric segment capsules with
   // the same cap geometry as the actual vehicle surface.
   const roadMask=new Path2D(),half=assetDefinition('vehicle').w/2;
   for(const a of vehicle)for(let i=1;i<a.points.length;i++){
    const p=a.points[i-1],q=a.points[i],dx=q.x-p.x,dz=q.z-p.z,len=Math.hypot(dx,dz);
    if(len<.005)continue;
    const nx=-dz/len*half,nz=dx/len*half;
    roadMask.moveTo(p.x+nx,p.z+nz);
    roadMask.lineTo(q.x+nx,q.z+nz);
    roadMask.lineTo(q.x-nx,q.z-nz);
    roadMask.lineTo(p.x-nx,p.z-nz);
    roadMask.closePath();
    for(const pt of[p,q]){roadMask.moveTo(pt.x+half,pt.z);roadMask.arc(pt.x,pt.z,half,0,Math.PI*2);}
   }
   ctx.clip(roadMask);
   for(const a of crossings){
    const fp=assetDefinition('crossing'),angle=a.rotation||0,c=Math.cos(angle),sn=Math.sin(angle);
    ctx.save();
    // Parent is still in metric world units. Apply rotation/translation in
    // that space, then stripes preserve their intended real-world dimensions.
    ctx.translate(a.x,a.z);ctx.rotate(angle);
    ctx.fillStyle='#f4f3e9';
    for(let x=-fp.w/2+.22;x+.26<fp.w/2;x+=.47)ctx.fillRect(x,-fp.d*.39,.26,fp.d*.78);
    ctx.fillStyle='#e8ba46';
    ctx.fillRect(-fp.w/2,-fp.d/2+.065,fp.w,.045);
    ctx.fillRect(-fp.w/2,fp.d/2-.11,fp.w,.045);
    ctx.restore();
   }
   ctx.restore();
  }
  ctx.setTransform(1,0,0,1,0,0);
  // Subtle deterministic texture on painted pixels (no rerender flicker).
  const img=ctx.getImageData(0,0,W,H),px=img.data;
  for(let i=0;i<px.length;i+=4){
   if(px[i+3]<10)continue;
   const grain=((Math.sin(i*.000041+73.1)*43758.5453)%1);
   const g=(grain-Math.floor(grain)-.5)*10;
   px[i]+=g;px[i+1]+=g;px[i+2]+=g;
  }
  ctx.putImageData(img,0,0);
  this.roadTex.needsUpdate=true;this.w.renderer.staticFrame=null;
 }
 setDraft(draft){if(JSON.stringify(draft)===this.draftKey)return;this.draftKey=JSON.stringify(draft);releaseModel(this.ghost);this.ghost=null;for(const child of [...this.coverage.children]){child.material?.dispose();child.geometry?.dispose();child.removeFromParent();}this.draftAnims=[];this.draft=draft;if(!draft)return;
 this.ghost=assetModel({...draft,level:1},{ghost:true});const ghostY=draft.points?.length?Math.max(...draft.points.map(p=>(this.baseGround?.(p.x,p.z)||0))):((this.baseGround?.(draft.x,draft.z)||0));this.ghost.position.set(draft.x,ghostY,draft.z);this.ghost.rotation.y=draft.rotation||0;this.group.add(this.ghost);
 this.ghost.traverse(o=>{if(o.isMesh)this.draftAnims.push({m:o.material,t:'ghost',ei:o.material.emissiveIntensity,op:o.material.opacity});});
 const def=assetDefinition(draft.type),DA=this.draftAnims,CV=this.coverage,gy=(x,z)=>(this.baseGround?.(x,z)||0);
 const addRing=(x,z,ri,ro,c,op,yOff=.04)=>{const m=new T.Mesh(new T.RingGeometry(ri,ro,64),new T.MeshBasicMaterial({color:c,transparent:true,opacity:op,side:T.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,gy(x,z)+yOff,z);CV.add(m);return m;};
 const addDisc=(x,z,r,c,op,yOff=.035)=>{const m=new T.Mesh(new T.CircleGeometry(r,64),new T.MeshBasicMaterial({color:c,transparent:true,opacity:op,side:T.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,gy(x,z)+yOff,z);CV.add(m);return m;};
 if(def.range){const x=draft.x,z=draft.z,r=def.range;
  addDisc(x,z,r,0xbe87ff,.06);DA.push({m:addRing(x,z,r-.06,r,0xbe87ff,.7).material,t:'pulse'});
  for(let p=0;p<2;p++){const ring=addRing(x,z,r*.35,r*.38,0xd4a0ff,.5,.045);DA.push({obj:ring,m:ring.material,t:'expand',ph:p*.5,r});}}
 if(def.route&&draft.points&&draft.points.length===1){const p=draft.points[0],py=gy(p.x,p.z);
  const wpMat=new T.MeshStandardMaterial({color:0x59d9ff,emissive:new T.Color(0x2dccff),emissiveIntensity:.9,transparent:true,opacity:.9,depthWrite:false});
  const wp=new T.Mesh(new T.BoxGeometry(.2,.04,.2),wpMat);wp.position.set(p.x,py+.1,p.z);wp.rotation.y=Math.PI/4;CV.add(wp);
  const startRing=addRing(p.x,p.z,.25,.35,0x2dccff,.7,.07);DA.push({obj:startRing,m:startRing.material,t:'endPulse'});
  DA.push({m:wpMat,t:'trace'});}
 if(def.route&&draft.points&&draft.points.length>=2){const pts=draft.points;
  const traceMat=new T.MeshStandardMaterial({color:0x59d9ff,emissive:new T.Color(0x2dccff),emissiveIntensity:.7,transparent:true,opacity:.85,depthWrite:false});
  const glowMat=new T.MeshBasicMaterial({color:0x2dccff,transparent:true,opacity:.15,depthWrite:false});
  for(let i=1;i<pts.length;i++){const p=pts[i-1],q=pts[i],len=Math.hypot(q.x-p.x,q.z-p.z);if(len<.01)continue;
   const angle=Math.atan2(q.x-p.x,q.z-p.z),cx=(p.x+q.x)/2,cz=(p.z+q.z)/2;
   const segY=Math.max(gy(p.x,p.z),gy(q.x,q.z),gy(cx,cz));
   const seg=new T.Mesh(new T.BoxGeometry(.2,.016,len),traceMat);seg.position.set(cx,segY+.08,cz);seg.rotation.y=angle;CV.add(seg);
   const glow=new T.Mesh(new T.BoxGeometry(.7,.005,len),glowMat);glow.position.set(cx,segY+.06,cz);glow.rotation.y=angle;CV.add(glow);}
  DA.push({m:traceMat,t:'trace'},{m:glowMat,t:'traceGlow'});
  const wpMat=new T.MeshStandardMaterial({color:0x59d9ff,emissive:new T.Color(0x2dccff),emissiveIntensity:.9,transparent:true,opacity:.9,depthWrite:false});
  for(const p of pts){const wp=new T.Mesh(new T.BoxGeometry(.15,.03,.15),wpMat);wp.position.set(p.x,gy(p.x,p.z)+.1,p.z);wp.rotation.y=Math.PI/4;CV.add(wp);}
  const last=pts[pts.length-1],endRing=addRing(last.x,last.z,.2,.28,0x2dccff,.6,.07);DA.push({obj:endRing,m:endRing.material,t:'endPulse'});}
 else if(!def.route){const radius=def.w?Math.max(def.w,def.d||def.w)/2+.3:.8;
  addDisc(draft.x,draft.z,radius,0x2dccff,.05);DA.push({m:addRing(draft.x,draft.z,radius-.05,radius,0x59d9ff,.6).material,t:'pulse'});
  const pulse=addRing(draft.x,draft.z,radius*.35,radius*.38,0x59d9ff,.4,.042);DA.push({obj:pulse,m:pulse.material,t:'expand',ph:0,r:radius});}}
 setConeZone(count){this.setDraft(null);for(const child of [...this.coverage.children]){child.material?.dispose();child.geometry?.dispose();child.removeFromParent();}this.draftAnims=[];if(!count)return;
  const positions=coneZonePositions(count),DA=this.draftAnims,CV=this.coverage;
  const hw=Z.w/2,hd=Z.d/2,cx=Z.x,cz=Z.z;
  const edges=[{a:{x:cx-hw,z:cz-hd},b:{x:cx+hw,z:cz-hd}},{a:{x:cx+hw,z:cz-hd},b:{x:cx+hw,z:cz+hd}},{a:{x:cx+hw,z:cz+hd},b:{x:cx-hw,z:cz+hd}},{a:{x:cx-hw,z:cz+hd},b:{x:cx-hw,z:cz-hd}}];
  const borderMat=new T.MeshStandardMaterial({color:0xff756c,emissive:new T.Color(0xff756c),emissiveIntensity:.5,transparent:true,opacity:.7,depthWrite:false});
  for(const e of edges){const len=Math.hypot(e.b.x-e.a.x,e.b.z-e.a.z),angle=Math.atan2(e.b.x-e.a.x,e.b.z-e.a.z),mx=(e.a.x+e.b.x)/2,mz=(e.a.z+e.b.z)/2;
   const seg=new T.Mesh(new T.BoxGeometry(.08,.012,len),borderMat);seg.position.set(mx,.05,mz);seg.rotation.y=angle;CV.add(seg);}
  DA.push({m:borderMat,t:'trace'});
  const fill=new T.Mesh(new T.PlaneGeometry(Z.w,Z.d),new T.MeshBasicMaterial({color:0xff756c,transparent:true,opacity:.04,side:T.DoubleSide,depthWrite:false}));fill.rotation.x=-Math.PI/2;fill.position.set(Z.x,.04,Z.z);CV.add(fill);
  for(const pos of positions){const ghost=assetModel({type:'cone',level:1,x:pos.x,z:pos.z},{ghost:true});ghost.position.set(pos.x,0,pos.z);CV.add(ghost);
   ghost.traverse(o=>{if(o.isMesh)DA.push({m:o.material,t:'ghost',ei:o.material.emissiveIntensity,op:o.material.opacity});});
   const ring=new T.Mesh(new T.RingGeometry(.25,.3,32),new T.MeshBasicMaterial({color:0x2dccff,transparent:true,opacity:.4,side:T.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(pos.x,.03,pos.z);CV.add(ring);DA.push({m:ring.material,t:'pulse'});}
  this.w.renderer.staticFrame=null;}
 thumbnail(type){if(this.thumbs.has(type))return this.thumbs.get(type);const host=document.createElement('div');host.style.cssText='position:fixed;left:-1000px;top:-1000px;width:640px;height:400px';document.body.append(host);const preview=new ProductPreview(host,this.w,{transparent:true}),a={type,level:1,x:0,z:0};if(assetDefinition(type).route)a.points=[{x:0,z:-2},{x:0,z:2}];preview.model=assetModel(a);preview.scene.add(preview.model);preview.draw();const png=cutoutPNG(preview.renderer.domElement);preview.dispose();host.remove();this.thumbs.set(type,png);return png;}
 async loadNpc(id){if(this.npcs.has(id))return this.npcs.get(id);this.pending??=new Map();if(this.pending.has(id))return this.pending.get(id);const promise=(async()=>{const def=EMPLOYEES.find(d=>d.id===id),asset=await new GLTFLoader().loadAsync(new URL('../assets3d/'+def.asset,import.meta.url).href),root=new T.Group(),body=asset.scene,meshes=[];root.add(body);root.visible=false;root.userData.isWorker=true;body.traverse(m=>{if(m.isMesh){m.material=m.material.clone();refineAvatarMaterial(m.material);m.castShadow=m.receiveShadow=true;m.frustumCulled=false;meshes.push(m);}});const rig=new CandidateRig(root,body,meshes,asset.animations,asset.parser.json.extras),entry={root,body,rig};this.w.scene.add(root);const host=document.createElement('span');renderPlayerPortrait({...this.w,player:root,worker:rig},host,1.85);entry.portrait=host.innerHTML;this.npcs.set(id,entry);return entry;})();this.pending.set(id,promise);try{return await promise;}finally{this.pending.delete(id);}}
 update(s,dt,phase){this.state=s;const h=ensureHsec(s),on=phase==='play'&&active(s);this.group.visible=on;this.w.hsecActive=on;for(const [id,e]of this.npcs)e.root.visible=on&&h.employee?.id===id;if(!on){this.w.sun.intensity=2.65;this.w.sun.color.set(0xffdfae);this.w.hemi.intensity=.95;this.w.hemi.color.set(0xc8e4ff);this.w.scene.background=this.originalSky;if(this.w.scene.fog)this.w.scene.fog.color.set(0xb8c2c9);return;}
 this.colliders=[];const keep=new Set();let lightCount=0;const hour=(10+h.time/600*24)%24,night=hour>=19||hour<6;const day=Math.max(.12,Math.min(1,(hour<12?hour-5:20-hour)/2));this.w.sun.intensity=2.65*day;this.w.hemi.intensity=.95*(.28+.72*day);this.w.scene.background=night?this.nightSky:this.originalSky;this.w.sun.color.set(night?0xabc2e0:0xffdfae);this.w.hemi.color.set(night?0x879bb9:0xc8e4ff);if(this.w.scene.fog)this.w.scene.fog.color.set(night?0x233449:0xb8c2c9);
 const sorted=[...h.assets].sort((a,b)=>(['tower','post'].includes(b.type)?1:0)-(['tower','post'].includes(a.type)?1:0));for(const a of sorted){keep.add(a.id);const key=[a.type,a.status,a.level,...Object.values(a.condition).map(v=>Math.floor(v/5))].join(':');let e=this.models.get(a.id);if(!e||e.key!==key){const justBuilt=e?.status==='building'&&a.status==='built';if(justBuilt&&e?.model.userData.constructionHologram){e.model.finish(performance.now()/1000);this.fadingHolograms.push(e.model);}else releaseModel(e?.model);let model=assetModel(a,{ghost:a.status==='building'&&a.type!=='shed'});if(a.status==='building'&&a.type==='shed'){const original=model;model=new ConstructionHologram(original,{software:this.w.renderer.isSoftwareRenderer,quality:this.w.quality,footprint:{width:6,depth:4.8}});releaseModel(original);}if(justBuilt)this.onBuilt?.(a);let modelY=0;const ad=assetDefinition(a.type);if(ad.route&&a.points?.length){for(let pi=0;pi<a.points.length;pi++){modelY=Math.max(modelY,this.baseGround(a.points[pi].x,a.points[pi].z));}if(a.points.length>1)for(let pi=1;pi<a.points.length;pi++){const pa=a.points[pi-1],pb=a.points[pi];modelY=Math.max(modelY,this.baseGround((pa.x+pb.x)/2,(pa.z+pb.z)/2));}}if(a.type==='crossing')modelY=.05;model.position.set(a.x,modelY,a.z);model.rotation.y=a.rotation||0;this.group.add(model);e={key,model,status:a.status};this.models.set(a.id,e);this.w.renderer.staticFrame=null;if(a.status==='building'&&a.type!=='shed'){const d=assetDefinition(a.type);for(const x of[-d.w/2,d.w/2])for(const z of[-d.d/2,d.d/2]){const pole=new T.Mesh(new T.CylinderGeometry(.025,.025,Math.max(1,d.h),6),new T.MeshBasicMaterial({color:0xffbd24}));pole.position.set(x,Math.max(1,d.h)/2,z);model.add(pole);}}if(model.userData.light){const info=model.userData.light,light=new T.PointLight(0xffd494,0,Math.hypot(info.range,info.y),1.1);light.position.set(0,info.y,0);model.add(light);e.light=light;
  if(!this.glowTex){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),grad=ctx.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'rgba(255,220,160,1)');grad.addColorStop(.25,'rgba(255,180,80,.6)');grad.addColorStop(.6,'rgba(255,140,40,.15)');grad.addColorStop(1,'rgba(255,100,20,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,64,64);this.glowTex=new T.CanvasTexture(c);}
  const glow=new T.Sprite(new T.SpriteMaterial({map:this.glowTex,color:0xffd494,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}));glow.scale.set(3,3,1);glow.position.set(0,info.y,0);model.add(glow);e.glow=glow;}
  if(a.type==='shed'&&a.status==='built'){
   // Actual low-cost workshop illumination, not only unlit decorative bulbs.
   // One warm entry pool and two interior fixtures; no dynamic shadow maps.
   e.shedLights=[
    [-1.3,2.48,0,7,5.4],
    [1.3,2.48,0,7,5.4],
    [0,2.82,2.83,5,4.3]
   ].map(([x,y,z,power,range])=>{
    const light=new T.PointLight(0xffddab,0,range,2);
    light.position.set(x,y,z);light.castShadow=false;
    model.add(light);return {light,power};
   });
  }
 }
 if(e.model.userData.constructionHologram)e.model.update(performance.now()/1000,(h.time-a.started)/(a.ends-a.started||1),{quality:this.w.quality,resolution:this.w.renderer.domElement});
 if(a.status==='building'&&a.type==='shed')this.colliders.push({x:a.x,z:a.z,w:6.2,d:5,minY:0,maxY:3.8});
 if(a.status==='built'){for(const b of e.model.userData.colliders||[]){const c=Math.cos(a.rotation||0),q=Math.sin(a.rotation||0);this.colliders.push({x:a.x+b.x*c+b.z*q,z:a.z-b.x*q+b.z*c,w:Math.abs(c)*b.w+Math.abs(q)*b.d,d:Math.abs(q)*b.w+Math.abs(c)*b.d,minY:0,maxY:assetDefinition(a.type).h});}const lightSlots=(e.shedLights?.length||0)+(e.light?1:0);
  const litOn=night&&a.condition.functional>=40&&lightCount+lightSlots<=16;
  if(litOn)lightCount+=lightSlots;
  if(e.light)e.light.intensity=litOn?7*a.condition.functional/100:0;
  if(e.glow)e.glow.material.opacity=litOn?.55+.15*Math.sin(this.animTime*1.5+a.x):0;
  for(const lamp of e.shedLights||[])lamp.light.intensity=litOn?lamp.power*a.condition.functional/100:0;}}
 for(const hologram of [...this.fadingHolograms])if(!hologram.update(performance.now()/1000,1,{quality:this.w.quality,resolution:this.w.renderer.domElement})){hologram.dispose();this.fadingHolograms.splice(this.fadingHolograms.indexOf(hologram),1);this.w.renderer.staticFrame=null;}
 for(const [id,e]of this.models)if(!keep.has(id)){releaseModel(e.model);this.models.delete(id);}
 // Repaint road overlay when assets change
 const rev=h.revision||0;if(rev!==this.roadRevision){this.roadRevision=rev;this.paintRoads(h);}
 if(h.employee){const n=h.employee;this.loadNpc(n.id).catch(()=>{});const e=this.npcs.get(n.id);if(e){if(n!==this.lastEmployee){e.rig.reset();this.lastEmployee=n;}e.root.visible=true;e.root.position.set(n.position.x,this.w.sampleGround(n.position.x,n.position.z),n.position.z);const delta=Math.atan2(Math.sin(n.yaw-e.root.rotation.y),Math.cos(n.yaw-e.root.rotation.y));e.root.rotation.y+=delta*(1-Math.exp(-dt*10));e.rig.update(dt,(x,z)=>this.w.sampleGround(x,z),h.time);e.root.userData.state=n.state;
  // Maintaining bob animation
  if(n.state==='maintaining'||n.state==='inspecting'){e.body.position.y=(e.body.position.y||0)+Math.sin(this.animTime*4)*.015;}
  // Maintenance ring at target asset
  const maint=n.task?.orderId&&h.orders.find(o=>o.id===n.task.orderId);const maintAsset=maint&&h.assets.find(a=>a.id===maint.assetId);if(maintAsset&&(n.state==='maintaining'||n.state==='walking')){this.maintRing.visible=true;this.maintRing.position.set(maintAsset.x,.05,maintAsset.z);const pulse=.35+.35*Math.sin(this.animTime*3);this.maintRing.material.opacity=pulse;this.maintRing.scale.setScalar(1+.15*Math.sin(this.animTime*2));}else{this.maintRing.visible=false;}
  // NPC status bubble
  const bubbleLabels={walking:'En recorrido',inspecting:'Inspeccionando',maintaining:'Reparando',blocked:'Detenido',resting:'Descansando',idle:'Disponible',routing:'Preparando ruta'};const bubbleIcons={walking:'🚶',inspecting:'🔍',maintaining:'🔧',blocked:'⚠️',resting:'😴',idle:'✓',routing:'📍'};
  const label=bubbleLabels[n.state]||'';if(label!==this.npcBubbleState){this.npcBubbleState=label;this.npcBubble.innerHTML=`<span>${bubbleIcons[n.state]||''}</span> ${label}`;this.npcBubble.className='npcBubble'+(n.state==='blocked'?' warn':n.state==='maintaining'?' fix':'');}
  const pt=new T.Vector3(n.position.x,this.w.sampleGround(n.position.x,n.position.z)+2.2,n.position.z).project(this.w.camera);const front=this.w.camera.getWorldDirection(new T.Vector3()).dot(new T.Vector3(n.position.x-this.w.camera.position.x,0,n.position.z-this.w.camera.position.z))>0;
  if(front&&pt.z>0&&pt.z<1){const sx=(pt.x*.5+.5)*innerWidth,sy=(-pt.y*.5+.5)*innerHeight;this.npcBubble.style.left=sx+'px';this.npcBubble.style.top=sy+'px';this.npcBubble.hidden=false;}else{this.npcBubble.hidden=true;}
  }}else{this.npcBubble.hidden=true;this.maintRing.visible=false;}
  // Asset degradation alerts
  if(h.time-this.lastConditionCheck>15){this.lastConditionCheck=h.time;for(const a of h.assets){if(a.status!=='built')continue;const worst=Math.min(a.condition.physical,a.condition.visual,a.condition.functional);const alertKey=a.id+':'+Math.floor(worst/20);if(worst<40&&worst>=20&&!this.alertedAssets.has(alertKey)){this.alertedAssets.add(alertKey);this.onAlert?.(assetDefinition(a.type).name+' necesita mantención','⚠️');}else if(worst<20&&!this.alertedAssets.has(alertKey)){this.alertedAssets.add(alertKey);this.onAlert?.(assetDefinition(a.type).name+' en estado crítico','🔴');}}}
 // Asset card tracking
  if(this.assetCardId){const a=h.assets.find(a=>a.id===this.assetCardId);if(a){const pt=new T.Vector3(a.x,this.w.sampleGround(a.x,a.z)+assetDefinition(a.type).h+.3,a.z).project(this.w.camera);const front=this.w.camera.getWorldDirection(new T.Vector3()).dot(new T.Vector3(a.x-this.w.camera.position.x,0,a.z-this.w.camera.position.z))>0;if(front&&pt.z>0&&pt.z<1){const sx=Math.max(110,Math.min(innerWidth-110,(pt.x*.5+.5)*innerWidth)),rawY=(-pt.y*.5+.5)*innerHeight,cardH=this.assetCard.offsetHeight||180,minTop=cardH+16,sy=Math.max(minTop,rawY);this.assetCard.style.left=sx+'px';this.assetCard.style.top=sy+'px';}else{this.showAssetCard(null);}}else{this.showAssetCard(null);}}
 this.animTime+=dt;for(const a of this.draftAnims){const t=this.animTime;if(a.t==='ghost'){a.m.emissiveIntensity=a.ei*(.55+.45*Math.sin(t*3));a.m.opacity=a.op*(.65+.35*Math.sin(t*2.5));}else if(a.t==='trace'){a.m.emissiveIntensity=.45+.45*Math.sin(t*4);a.m.opacity=.55+.35*Math.sin(t*3);}else if(a.t==='traceGlow'){a.m.opacity=.08+.14*Math.sin(t*2);}else if(a.t==='pulse'){a.m.opacity=.35+.4*Math.sin(t*2.5);}else if(a.t==='expand'){const ph=(t*.55+(a.ph||0))%1;a.obj.scale.setScalar(.3+.7*ph);a.m.opacity=.5*(1-ph);}else if(a.t==='endPulse'){const ph=(t*.8)%1;a.obj.scale.setScalar(1+.35*ph);a.m.opacity=.6*(1-ph);}}if(this.draftAnims.length)this.w.renderer.staticFrame=null;
 Object.assign(this.w.renderer.domElement.dataset,{hsecActive:'true',hsecAssets:String(h.assets.length),hsecHolograms:String([...this.models.values()].filter(e=>e.model.userData.constructionHologram).length),hsecNpc:h.employee?.state||'none',hsecHour:hour.toFixed(2),hsecNpcPosition:h.employee?[h.employee.position.x,h.employee.position.z].map(v=>v.toFixed(3)).join(','):'',hsecNpcClip:this.npcs.get(h.employee?.id)?.rig.state||'',hsecScore:String(this.evaluationScore||'')});
 }
}
