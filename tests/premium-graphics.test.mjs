import {test} from 'node:test';import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {reliefHeight,soilPixels} from '../dist/graphics/desert.mjs';
import {QUALITY,qualityName,applyQuality,RenderMetrics} from '../dist/graphics/quality.mjs';
import {haloTextures,ActionHalo} from '../dist/chapter/action-halo.mjs';
import {refineAvatarMaterial} from '../dist/graphics/materials.mjs';
import {GUIDE_CATEGORIES} from '../dist/chapter/guidance.mjs';
test('all playable parcel coordinates remain exactly flat; outside relief stays finite',()=>{for(let x=-13;x<=3;x+=.5)for(let z=-6;z<=9;z+=.5)assert.equal(reliefHeight(x,z),0);for(let x=-120;x<=120;x+=3)for(let z=-120;z<=120;z+=5)assert(Number.isFinite(reliefHeight(x,z)));assert(reliefHeight(40,40)>.1);});
test('soil has deterministic tonal detail and bounded normal maps within a mobile texture budget',()=>{const a=soilPixels(64),b=soilPixels(64);assert.deepEqual(a.color,b.color);assert(a.color.byteLength+a.normal.byteLength<40000);const colors=new Set();for(let i=0;i<a.color.length;i+=4){assert.equal(a.color[i+3],255);colors.add(a.color[i]);assert(a.normal[i+2]>200);}assert(colors.size>25);});
test('soil colour and normal maps meet on every opposing edge, including pebbles crossing the repeat boundary',()=>{
 for(const size of[64,512]){const maps=soilPixels(size);assert.equal(maps.color.byteLength+maps.normal.byteLength,size*size*8);
  for(const map of[maps.color,maps.normal])for(let i=0;i<size;i++)for(let c=0;c<4;c++){
   assert.equal(map[(i*size)*4+c],map[(i*size+size-1)*4+c],`horizontal seam at ${size}:${i}:${c}`);
   assert.equal(map[i*4+c],map[((size-1)*size+i)*4+c],`vertical seam at ${size}:${i}:${c}`);
  }
 }
});
test('three quality presets affect resolution, shadows and texture detail without moving the player or camera',()=>{
 assert.equal(qualityName('malformed'),'balanced');assert(QUALITY.low.shadows<QUALITY.high.shadows);
 const position={x:1,z:2},camera={fov:60},world={player:{position},camera,renderer:{isSoftwareRenderer:true,setPixelRatio(v){this.pixelRatio=v;}},sun:{shadow:{mapSize:{set(x,y){this.x=x;this.y=y;}}}},soilMaterial:{normalScale:new T.Vector2()},resize(){}};
 applyQuality(world,'low',false);assert.equal(world.renderer.renderScale,.65);assert.equal(world.sun.shadow.mapSize.x,512);assert.equal(world.soilMaterial.normalScale.x,0);applyQuality(world,'high',false);assert.equal(world.renderer.renderScale,1);assert.equal(world.sun.shadow.mapSize.x,2048);assert.equal(world.soilMaterial.normalScale.x,.45);assert.deepEqual(position,{x:1,z:2});assert.equal(camera.fov,60);
});
test('neon halos fade to transparent at their upper edge, have no collider, and stay inexpensive',()=>{
 const t=haloTextures(),data=t.rise.image.data,w=t.rise.image.width,h=t.rise.image.height;assert(data[3]>50);assert.equal(data[((h-1)*w)*4+3],0);for(const tex of Object.values(t))tex.dispose();
 const halo=new ActionHalo();let triangles=0;halo.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count||0)/3;assert.equal(o.material.depthWrite,false);}});assert(triangles<150);assert.equal(halo.userData.collider,undefined);halo.animate(1);halo.dispose();
 assert.equal(GUIDE_CATEGORIES.main.color,'#ffc83d');assert.equal(GUIDE_CATEGORIES.secondary.color,'#2cdcf1');assert.equal(GUIDE_CATEGORIES.optional.color,'#ff5ec6');
});
test('the same refined cel shading preserves original textures and material identity for every avatar',()=>{
 const map=new T.Texture(),normalMap=new T.Texture(),m=new T.MeshStandardMaterial({map,normalMap});refineAvatarMaterial(m);assert.equal(m.map,map);assert.equal(m.normalMap,normalMap);assert(m.userData.premium);const shader={fragmentShader:T.ShaderLib.standard.fragmentShader};m.onBeforeCompile(shader);assert(shader.fragmentShader.includes('float rim='));assert(shader.fragmentShader.includes('outgoingLight=mix'));assert(!shader.fragmentShader.includes('undefined'));m.dispose();map.dispose();normalMap.dispose();
});
test('interaction glow has a circular footprint and a fully transparent gutter around every texture edge',()=>{
 for(const color of[0x42efbd,0x47decf,0xee8866,0xffc83d]){
  const textures=haloTextures(color),{data,width,height}=textures.floor.image;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const radius=Math.hypot(x/(width-1)-.5,y/(height-1)-.5)*2;
   if(radius>=.96)assert.equal(data[(y*width+x)*4+3],0,'visible alpha at the cutout border');
  }
  assert(data[(Math.round(height/2)*width+Math.round(width*.83))*4+3]>150,'ring remains luminous');
  Object.values(textures).forEach(t=>t.dispose());
 }
 for(const objective of[false,true]){
  const halo=new ActionHalo(0x42efbd,{objective});assert.equal(halo.floor.geometry.type,'CircleGeometry');
  const p=halo.floor.geometry.attributes.position;for(let i=0;i<p.count;i++)assert(Math.hypot(p.getX(i),p.getY(i))<=.976);
  let triangles=0;halo.traverse(o=>{if(o.isMesh)triangles+=o.geometry.index.count/3;});assert(triangles<150);halo.animate(1);halo.setColor(0xee8866);halo.dispose();
 }
});
test('performance summary uses observed frame intervals and percentiles rather than invented target FPS',()=>{const m=new RenderMetrics();for(let i=0;i<120;i++)m.record(i%10===0?20:5,100+i*40);const r=m.summary;assert(Math.abs(r.fps-25)<.01);assert.equal(r.p50,5);assert.equal(r.p95,20);assert.equal(r.samples,119);});
