export const GRAPHICS_KEY='drillrun-graphics-v1';
export const QUALITY={low:{pixelRatio:1,shadows:512,dust:8,normal:false},balanced:{pixelRatio:1.35,shadows:1024,dust:16,normal:true},high:{pixelRatio:1.7,shadows:2048,dust:24,normal:true}};
export function qualityName(value){return Object.hasOwn(QUALITY,value)?value:'balanced';}
export function loadQuality(){try{return qualityName(localStorage.getItem(GRAPHICS_KEY));}catch{return 'balanced';}}
export function applyQuality(world,name,persist=true){const id=qualityName(name),p=QUALITY[id];world.quality=id;if(world.renderer.isSoftwareRenderer)world.renderer.renderScale={low:.65,balanced:.85,high:1}[id];world.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,p.pixelRatio));if(world.sun){world.sun.shadow.mapSize.set(p.shadows,p.shadows);world.sun.shadow.map?.dispose();world.sun.shadow.map=null;world.sun.shadow.needsUpdate=true;}if(world.soilMaterial){world.soilMaterial.normalScale.setScalar(p.normal?.45:0);world.soilMaterial.needsUpdate=true;}if(world.dust)world.dust.geometry.setDrawRange(0,p.dust);world.renderer.staticFrame=null;world.resize();if(persist)try{localStorage.setItem(GRAPHICS_KEY,id);}catch{}return id;}
export class RenderMetrics{
 constructor(){this.samples=[];this.last=0;}
 record(renderMs,now){if(this.last&&now-this.last<400)this.samples.push({frame:now-this.last,render:renderMs});this.last=now;if(this.samples.length>120)this.samples.shift();}
 get summary(){if(!this.samples.length)return {fps:0,p50:0,p95:0,samples:0};const render=this.samples.map(s=>s.render).sort((a,b)=>a-b),frame=this.samples.reduce((s,n)=>s+n.frame,0)/this.samples.length;return {fps:1000/frame,p50:render[Math.floor(render.length*.5)],p95:render[Math.min(render.length-1,Math.floor(render.length*.95))],samples:render.length};}
}
