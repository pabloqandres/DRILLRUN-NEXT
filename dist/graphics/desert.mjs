import * as T from '../vendor/three.module.js';
const smooth=t=>t*t*(3-2*t),mix=(a,b,t)=>a+(b-a)*t;
function hash(x,z){const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);}
export function noise(x,z){const a=Math.floor(x),b=Math.floor(z),u=smooth(x-a),v=smooth(z-b);return mix(mix(hash(a,b),hash(a+1,b),u),mix(hash(a,b+1),hash(a+1,b+1),u),v);}
function periodicNoise(x,z,period){
 const a=Math.floor(x),b=Math.floor(z),u=smooth(x-a),v=smooth(z-b),ax=((a%period)+period)%period,az=((b%period)+period)%period,bx=(ax+1)%period,bz=(az+1)%period;
 return mix(mix(hash(ax,az),hash(bx,az),u),mix(hash(ax,bz),hash(bx,bz),u),v);
}
export function reliefHeight(x,z){const outside=Math.max(-13-x,x-30,-13-z,z-9,0),fade=smooth(Math.min(1,outside/12));return fade*(.45+noise(x*.06,z*.06)*2+noise(x*.17,z*.17)*.55);}
export function soilPixels(size=512){const data=new Uint8Array(size*size*4),normal=new Uint8Array(size*size*4),heights=new Float32Array(size*size),period=size-1,wrap=v=>((v%period)+period)%period;
 for(let y=0;y<period;y++)for(let x=0;x<period;x++){
  const u=x/period,v=y/period,broad=periodicNoise(u*7,v*7,7),stone=periodicNoise(u*36,v*36,36),grain=hash(x,y),ridge=Math.sin(u*Math.PI*60+periodicNoise(u*9,v*9,9)*9)*.5+.5;
  const h=broad*.5+stone*.3+ridge*.06+grain*.14;heights[y*size+x]=h;// Periodic, wind-shaped sediment adds fine Atacama strata without changing
  // the flat, navigable yard footprint or introducing collision geometry.
  const windBand=Math.sin(Math.PI*2*(u*28+v*5+periodicNoise(u*5,v*5,5)*.6));
  const pale=Math.max(0,broad-.53)*29,gravel=grain>.985?-43:grain>.96?18:0;
  // Multi-scale wind abrasion: muted deposits and thin striation lines
  // are colors only, keeping existing height and player navigation unchanged.
  const abrasion=Math.sin((u*51+v*8+periodicNoise(u*8,v*8,8)*.8)*Math.PI*2);
  const deposition=Math.max(0,periodicNoise(u*13,v*13,13)-.58);
  const shade=(stone-.5)*23+(grain-.5)*12+(broad-.5)*30+gravel+windBand*6+abrasion*3.2-deposition*17;
  const i=(y*size+x)*4;
  data[i]=Math.max(0,Math.min(255,192+shade+pale*.8));
  data[i+1]=Math.max(0,Math.min(255,150+shade*.92+pale*.7));
  data[i+2]=Math.max(0,Math.min(255,115+shade*.8+pale*.55));
  data[i+3]=255;
 }
 // Small embedded pebbles, warm highlights and cool contact edges; no photo texture.
 for(let stone=0;stone<Math.round(period*period/470);stone++){
  const cx=hash(stone,71)*period,cy=hash(stone,83)*period,rx=.65+hash(stone,91)*2.8,ry=rx*(.4+hash(stone,97)*.5),tone=hash(stone,101),base=[137+tone*48,112+tone*42,86+tone*35];
  for(let y=Math.floor(cy-ry-1);y<=Math.ceil(cy+ry+1);y++)for(let x=Math.floor(cx-rx-1);x<=Math.ceil(cx+rx+1);x++){
   const dx=(x-cx)/rx,dy=(y-cy)/ry,r=dx*dx+dy*dy;if(r>1.4)continue;const index=wrap(y)*size+wrap(x),i=index*4;
   if(r>1){for(let c=0;c<3;c++)data[i+c]*=.83;continue;}
   const lit=1-dx*.12-dy*.20;for(let c=0;c<3;c++)data[i+c]=Math.min(255,base[c]*lit+(r<.3?8:0));heights[index]=.62+(1-r)*.3;
  }
 }
 // Duplicate the periodic endpoints, including wrapped pebble footprints; normals use the same torus.
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const sx=wrap(x),sy=wrap(y),src=(sy*size+sx)*4,i=(y*size+x)*4;if(src!==i)data.set(data.subarray(src,src+4),i);
  const dx=heights[sy*size+wrap(sx+1)]-heights[sy*size+wrap(sx-1)],dy=heights[wrap(sy+1)*size+sx]-heights[wrap(sy-1)*size+sx];normal.set([128-dx*115,128-dy*115,248,255],i);
 }
 return {size,color:data,normal};
}
function tex(data,size,srgb=false){const t=new T.DataTexture(data,size,size,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(16,16);t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;if(srgb)t.colorSpace=T.SRGBColorSpace;t.needsUpdate=true;return t;}
export function createDesert(w){
 const group=new T.Group();group.name='Atacama · premium';const pixels=soilPixels(),map=tex(pixels.color,pixels.size,true),normalMap=tex(pixels.normal,pixels.size);
 const geo=new T.PlaneGeometry(240,240,96,96);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,col=[];
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,reliefHeight(x,z));const n=noise(x*.17,z*.17),c=new T.Color().setRGB(1-.09*n,1-.075*n,1-.06*n);col.push(c.r,c.g,c.b);}geo.setAttribute('color',new T.Float32BufferAttribute(col,3));geo.computeVertexNormals();
 // The high-frequency normal map adds granular definition without a
 // physically bumpy walk surface or expensive extra geometry.
 map.anisotropy=4;normalMap.anisotropy=4;
 const material=new T.MeshStandardMaterial({color:0xffffff,map,normalMap,normalScale:new T.Vector2(.57,.57),roughness:.99,metalness:0,vertexColors:true});material.userData.premiumSoil=true;const ground=new T.Mesh(geo,material);ground.name='terrain-ground';ground.receiveShadow=true;group.add(ground);w.soilMaterial=material;
 // Four staggered ridgelines. Far colours absorb the sky haze; near ridges retain warm strata.
 for(let layer=3;layer>=0;layer--){const depth=24+layer*5,g=new T.PlaneGeometry(210,depth,110,20);g.rotateX(-Math.PI/2);const a=g.attributes.position;
  for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getZ(i),v=(z+depth/2)/depth,ridge=Math.pow(Math.max(0,Math.sin(v*Math.PI)),1.2),peaks=2.5+Math.pow(noise(x*.045,layer*4+3),2)*9+Math.pow(noise(x*.16,layer*9+2),2)*4,clefts=Math.abs(Math.sin(x*.29+z*.35))*1.1;a.setY(i,.2+ridge*(peaks+layer*1.7-clefts));}
  const flat=g.toNonIndexed();g.dispose();flat.computeVertexNormals();const pos=flat.attributes.position,colors=[];
  for(let i=0;i<pos.count;i+=3){const h=(pos.getY(i)+pos.getY(i+1)+pos.getY(i+2))/3,n=noise(pos.getX(i)*.17,h*.4),base=new T.Color([0xb58c6c,0xb49887,0xaaa0a8,0xa8b4c4][layer]);const strata=Math.sin(h*1.65+pos.getX(i)*.07)*.065;base.multiplyScalar(.68+n*.36+strata+(h>12?.04:0));for(let j=0;j<3;j++)colors.push(base.r,base.g,base.b);}
  flat.setAttribute('color',new T.Float32BufferAttribute(colors,3));const m=new T.MeshLambertMaterial({color:0xffffff,vertexColors:true});const mountain=new T.Mesh(flat,m);mountain.name='ridge-'+layer;mountain.position.set(layer*7-6,-.2,-42-layer*20);group.add(mountain);
 }
 // V18 cinematic relief: faceted high-altitude mesas in the far world.
 // Entirely outside the playable parcel: no colliders, no traversable paths,
 // no mining equipment or false buildings. 30 instances, 1 draw call.
 const mesaGeometry=new T.CylinderGeometry(.74,1.1,1,7,4,false);
 mesaGeometry.translate(0,.5,0);
 const mesaMaterial=new T.MeshStandardMaterial({
  color:0xffffff,roughness:1,metalness:0,flatShading:true
 });
 const mesas=new T.InstancedMesh(mesaGeometry,mesaMaterial,30);
 const mesaColors=[0x987a65,0xae8f77,0x967f72,0xb69b83,0x897f7d];
 mesas.name='Atacama · monumental background mesas';
 let mesaIndex=0;
 const mesaDummy=new T.Object3D();
 for(let i=0;i<65&&mesaIndex<30;i++){
  const x=-100+hash(i,371)*200,z=-44-hash(i,373)*44;
  if(Math.abs(x)<20&&z>-51)continue;
  const width=3.5+hash(i,379)*8,height=2.8+hash(i,383)*10;
  mesaDummy.position.set(x,-.7,z);
  mesaDummy.rotation.set(0,hash(i,389)*6.28,0);
  mesaDummy.scale.set(width,height,width*(.42+hash(i,397)*.45));
  mesaDummy.updateMatrix();mesas.setMatrixAt(mesaIndex,mesaDummy.matrix);
  mesas.setColorAt(mesaIndex,new T.Color(mesaColors[Math.floor(hash(i,401)*mesaColors.length)]));
  mesaIndex++;
 }
 mesas.count=mesaIndex;mesas.instanceMatrix.needsUpdate=true;
 if(mesas.instanceColor)mesas.instanceColor.needsUpdate=true;
 mesas.castShadow=false;mesas.receiveShadow=false;
 group.add(mesas);
 // Non-interactive geological scatter stays outside the usable parcel.
 const rocks=new T.InstancedMesh(new T.IcosahedronGeometry(.12,1),new T.MeshStandardMaterial({color:0x9c8064,roughness:1}),400),dummy=new T.Object3D();let ri=0;
 for(let i=0;ri<400&&i<2000;i++){const x=(hash(i,12)-.5)*75,z=(hash(i,46)-.5)*60;if(x>-14&&x<17&&z>-14&&z<10)continue;dummy.position.set(x,reliefHeight(x,z)+.015,z);dummy.rotation.set(hash(i,4),hash(i,9)*6,hash(i,5));dummy.scale.set(.35+hash(i,6)*2,.25,.35+hash(i,7));dummy.updateMatrix();rocks.setMatrixAt(ri,dummy.matrix);ri++;}rocks.count=ri;rocks.receiveShadow=true;group.add(rocks);
 // V3 sediment dressing: deterministic, low-poly stones and windrows on the
 // outer Atacama rim. Instanced meshes make this cheap; no gameplay colliders.
 const perimeter=new T.InstancedMesh(
  new T.DodecahedronGeometry(.18,0),
  new T.MeshStandardMaterial({color:0xffffff,roughness:1,flatShading:true}),
  260
 );
 perimeter.name='Atacama · alluvial stone scatter';
 const palette=[0xae8c70,0xc2a084,0x957e6e,0xb89a79,0x82786f];
 let placed=0;
 for(let i=0;i<1800&&placed<260;i++){
  const x=(hash(i,107)-.5)*67,z=(hash(i,139)-.5)*52;
  if(x>-17.5&&x<20&&z>-16&&z<12)continue;
  const size=.5+hash(i,113)*2,flat=.19+hash(i,117)*.42;
  dummy.position.set(x,reliefHeight(x,z)+.04,z);
  dummy.rotation.set(hash(i,181)*.3,hash(i,191)*6.28,hash(i,199)*.22);
  dummy.scale.set(size,size*flat,size*(.7+hash(i,211)*.6));
  dummy.updateMatrix();perimeter.setMatrixAt(placed,dummy.matrix);
  perimeter.setColorAt(placed,new T.Color(palette[Math.floor(hash(i,163)*palette.length)]));
  placed++;
 }
 perimeter.count=placed;perimeter.receiveShadow=true;perimeter.castShadow=false;
 perimeter.instanceMatrix.needsUpdate=true;
 if(perimeter.instanceColor)perimeter.instanceColor.needsUpdate=true;
 group.add(perimeter);
 const windrows=new T.InstancedMesh(
  new T.SphereGeometry(.5,8,4),
  new T.MeshStandardMaterial({color:0xc0a181,roughness:1,flatShading:true}),
  48
 );
 windrows.name='Atacama · wind-deposited silt';
 let dunes=0;
 for(let i=0;i<170&&dunes<48;i++){
  const a=hash(i,333)*Math.PI*2,radius=27+hash(i,337)*10;
  const x=Math.cos(a)*radius+2,z=Math.sin(a)*radius*.78-1.5;
  if(x>-17.5&&x<20&&z>-16&&z<12)continue;
  dummy.position.set(x,reliefHeight(x,z)-.09,z);
  dummy.rotation.set(0,a+.55,0);
  dummy.scale.set(1.6+hash(i,331)*3,.17+hash(i,349)*.16,.7+hash(i,353)*1.25);
  dummy.updateMatrix();windrows.setMatrixAt(dunes,dummy.matrix);dunes++;
 }
 windrows.count=dunes;windrows.receiveShadow=true;windrows.castShadow=false;
 windrows.instanceMatrix.needsUpdate=true;group.add(windrows);
 w.scene.add(group);w.premiumTerrain=group;
 // Soft contact colour at the base of each existing clearable is supplied by its own mesh.
 return group;
}
