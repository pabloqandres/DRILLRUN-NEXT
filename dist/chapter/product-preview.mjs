import * as T from '../vendor/three.module.js';
import {World} from '../scene.mjs';
import {SoftwareRenderer} from '../software-renderer.mjs';
import {moduleFixtures} from './module-catalog.mjs';
import {furnitureModel} from './furniture.mjs';
import {fitPreviewCamera} from './preview-framing.mjs';
// One demand-rendered view. Same mesh factory and variants as the installed object.
export class ProductPreview{
 constructor(host,world,{transparent=false}={}){
  this.host=host;this.world=world;this.transparent=transparent;this.scene=new T.Scene();this.scene.background=transparent?null:new T.Color(0x152c40);this.camera=new T.PerspectiveCamera(36,1,.01,60);this.angle=-.65;
  this.scene.add(new T.HemisphereLight(0xfff5e5,0x79746d,2.5));const sun=new T.DirectionalLight(0xfff0d7,2.8);sun.position.set(-3,5,4);this.scene.add(sun);
  if(world.renderer.isSoftwareRenderer)this.renderer=new SoftwareRenderer({alpha:transparent});else try{this.renderer=new T.WebGLRenderer({antialias:true,alpha:transparent,preserveDrawingBuffer:transparent,powerPreference:'low-power'});if(transparent)this.renderer.setClearColor(0,0);}catch{this.renderer=new SoftwareRenderer({alpha:transparent});}
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;host.prepend(this.renderer.domElement);
  this.renderer.domElement.setAttribute('aria-label',host.dataset.previewLabel||'3D');this.renderer.domElement.setAttribute('role','img');
  if(!transparent){const ground=new T.Mesh(new T.PlaneGeometry(30,30),world.mat(0x183044));ground.rotation.x=-Math.PI/2;ground.position.y=-.015;this.scene.add(ground);}
  this.observer=new ResizeObserver(()=>this.draw());this.observer.observe(host);let x=0,pointer=null;
  host.onpointerdown=e=>{if(e.target.closest('button'))return;pointer=e.pointerId;x=e.clientX;host.setPointerCapture(pointer);};host.onpointermove=e=>{if(pointer!==e.pointerId)return;this.angle-=(e.clientX-x)*.012;x=e.clientX;this.draw();};host.onpointerup=host.onpointercancel=()=>pointer=null;
 }
 set(product,variant){if(this.product?.id===product.id&&this.variant===variant)return;this.releaseModel();this.product=product;this.variant=variant;this.model=furnitureModel(this.world,product.id,variant);this.scene.add(this.model);this.draw();}
 setModule(module,interior=false){this.interior=interior;this.releaseModel();this.product={id:module.id,w:6,d:2.5,h:2.9};this.model=this.world.office.clone();this.model.position.set(0,0,0);this.model.scale.setScalar(1);this.model.rotation.set(0,0,0);this.model.visible=true;this.model.traverse(o=>{if(o.isGroup)o.visible=true;if(o.name.includes('Identificación de zonas'))o.visible=false;if(o.isLight)o.visible=false;if(o.geometry)o.geometry=o.geometry.clone();if(o.isLineSegments)o.material=o.material.clone();});if(interior){for(const f of moduleFixtures(module.level||1)){const mesh=furnitureModel(this.world,f.product,f.variant);mesh.position.set(f.x,f.host?1.17:.42,f.z);mesh.rotation.y=f.rotation;this.model.add(mesh);}}this.scene.add(this.model);this.draw();}
 rotate(delta){this.angle+=delta;this.draw();}
 draw(){if(!this.model)return;if(this.interior){this.model.traverse(o=>{if(o.isGroup&&o.name.startsWith('03 ·'))o.visible=false;if(o.isGroup&&o.name.startsWith('04 ·'))o.visible=Math.cos(this.angle)<0;if(o.isGroup&&o.name.startsWith('05 ·'))o.visible=Math.cos(this.angle)>=0;if(o.isGroup&&o.name.startsWith('06 ·'))o.visible=Math.sin(this.angle)>=0;if(o.isGroup&&o.name.startsWith('07 ·'))o.visible=Math.sin(this.angle)<0;});}const width=this.host.clientWidth,height=this.host.clientHeight;if(width<2||height<2)return;this.renderer.setSize(width,height);fitPreviewCamera(this.camera,new T.Box3().setFromObject(this.model),width/height,this.angle);this.renderer.staticFrame=null;this.renderer.last=0;this.renderer.render(this.scene,this.camera);}
 releaseModel(){if(!this.model)return;this.model.traverse(o=>{o.geometry?.dispose();if(o.isLineSegments)o.material.dispose();});this.model.removeFromParent();this.model=null;}
 dispose(){this.observer.disconnect();this.releaseModel();this.scene.traverse(o=>o.geometry?.dispose());this.renderer.dispose?.();this.renderer.domElement.remove();this.host.onpointerdown=this.host.onpointermove=this.host.onpointerup=this.host.onpointercancel=null;}
}

export function cutoutPNG(source){
 const sample=document.createElement('canvas');sample.width=source.width;sample.height=source.height;const ctx=sample.getContext('2d');ctx.drawImage(source,0,0);const {data}=ctx.getImageData(0,0,sample.width,sample.height);let left=sample.width,top=sample.height,right=-1,bottom=-1;
 for(let y=0;y<sample.height;y++)for(let x=0;x<sample.width;x++)if(data[(y*sample.width+x)*4+3]){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 if(right<left)return sample.toDataURL('image/png');const out=document.createElement('canvas');out.width=right-left+21;out.height=bottom-top+21;out.getContext('2d').drawImage(sample,left,top,right-left+1,bottom-top+1,10,10,right-left+1,bottom-top+1);return out.toDataURL('image/png');
}
export function officeThumbnail(world){const host=document.createElement('div');host.style.cssText='position:fixed;left:-1000px;top:-1000px;width:480px;height:300px;pointer-events:none';document.body.append(host);const preview=new ProductPreview(host,world,{transparent:true});preview.setModule({id:'office'});preview.draw();const url=cutoutPNG(preview.renderer.domElement);preview.dispose();host.remove();return url;}
