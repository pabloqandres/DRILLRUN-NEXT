import * as T from '../vendor/three.module.js';
import {BUILD_ZONES,moduleDefinition,pendingConstruction} from './module-catalog.mjs';
import {workshopConstructionReadout} from './workshop-progress-v102.mjs';

// The construction site owns the anchor. The avatar only influences the gameplay camera.
export function constructionTarget(s,sampleGround=()=>0){
 const job=pendingConstruction(s),zone=job&&BUILD_ZONES.find(z=>z.id===job.slot),module=job&&moduleDefinition(job.module);
 if(!zone||!module)return null;
 return {id:zone.id,module:module.id,nameKey:module.nameKey,x:zone.x,y:sampleGround(zone.x,zone.z)+module.height+.22,z:zone.z};
}
export function projectConstructionTarget(target,camera,width,height){
 if(!target)return null;
 const point=new T.Vector3(target.x,target.y,target.z),view=point.clone().applyMatrix4(camera.matrixWorldInverse);
 if(view.z>=0)return null;
 point.project(camera);
 if(![point.x,point.y,point.z].every(Number.isFinite)||point.z< -1||point.z>1||Math.abs(point.x)>1||Math.abs(point.y)>1)return null;
 return {x:(point.x*.5+.5)*width,y:(.5-point.y*.5)*height};
}
export function constructionCalloutLayout(point,width,height,panelWidth,panelHeight){
 if(!point||panelWidth>width-24||panelHeight>height-90)return null;
 const above=point.y-panelHeight-16>=76;
 const left=Math.max(12,Math.min(width-panelWidth-12,above?point.x-panelWidth/2:point.x+16));
 const top=above?point.y-panelHeight-16:Math.max(76,point.y+16);
 if(top+panelHeight>height-12)return null;
 return {left,top,linkX:point.x-left,linkY:point.y-top};
}
export class ConstructionCallout{
 constructor(world,host){
  this.world=world;this.host=host;this.size={width:350,height:75};
  this.line=document.createElement('i');this.line.className='constructionTether';this.line.setAttribute('aria-hidden','true');host.append(this.line);
  this.name=document.createElement('strong');this.name.className='constructionTargetName';host.querySelector('div').prepend(this.name);
  host.classList.add('constructionWorldTag');host.hidden=true;
  // V102: a SECOND roof-anchored progress tag for the Taller. The original
  // office construction callout is untouched and remains independent.
  this.workshopTag=document.createElement('aside');
  this.workshopTag.className='ws102WorldTag';
  this.workshopTag.hidden=true;
  this.workshopTag.setAttribute('aria-label','Avance de obra del Taller');
  this.workshopTag.innerHTML='<div class="ws102WorldHead"><b data-ws102-world-title>EN CONSTRUCCIÓN</b><strong data-ws102-world-time>--:--</strong></div>'+
   '<div class="ws102WorldTrack" role="progressbar" aria-label="Avance real de obra del Taller" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i data-ws102-world-fill></i></div>'+
   '<div class="ws102WorldFoot"><span>Taller técnico</span><b data-ws102-world-percent>0%</b></div>';
  host.parentElement?.append(this.workshopTag);
  this.resize=new ResizeObserver(entries=>{const e=entries[0].borderBoxSize?.[0];this.size={width:e?.inlineSize||host.offsetWidth,height:e?.blockSize||host.offsetHeight};});this.resize.observe(host);
 }
 updateWorkshop(s,enabled,now=Date.now()){
  const data=enabled?workshopConstructionReadout(s,now):null;
  if(!data||!this.workshopTag){if(this.workshopTag)this.workshopTag.hidden=true;return;}
  // Workshop is at the actual scene-built anchor; no player-centric UI.
  const x=-7.6,z=-9.3,y=this.world.sampleGround(x,z)+5.0;
  const p=projectConstructionTarget({x,y,z},this.world.camera,innerWidth,innerHeight);
  if(!p||p.y<79||p.y>innerHeight-34||p.x<70||p.x>innerWidth-70){
   this.workshopTag.hidden=true;return;
  }
  this.workshopTag.hidden=false;
  this.workshopTag.style.left=Math.max(8,Math.min(innerWidth-224,p.x-112))+'px';
  this.workshopTag.style.top=Math.max(82,Math.min(innerHeight-95,p.y-84))+'px';
  const title=this.workshopTag.querySelector('[data-ws102-world-title]');
  const time=this.workshopTag.querySelector('[data-ws102-world-time]');
  const percent=this.workshopTag.querySelector('[data-ws102-world-percent]');
  const fill=this.workshopTag.querySelector('[data-ws102-world-fill]');
  const track=this.workshopTag.querySelector('[role="progressbar"]');
  if(title)title.textContent=data.shortLabel;
  if(time)time.textContent=data.remainingLabel;
  if(percent)percent.textContent=data.progress+'%';
  if(fill)fill.style.width=data.progress+'%';
  if(track)track.setAttribute('aria-valuenow',String(data.progress));
 }
 update(s,enabled,t){
  this.updateWorkshop(s,enabled);
  const target=constructionTarget(s,(x,z)=>this.world.sampleGround(x,z));
  if(!enabled||!target){this.host.hidden=true;return;}
  if(target.module!==this.module){this.module=target.module;this.name.textContent=t(target.nameKey);}
  const point=projectConstructionTarget(target,this.world.camera,innerWidth,innerHeight),layout=constructionCalloutLayout(point,innerWidth,innerHeight,this.size.width||350,this.size.height||75);
  this.host.hidden=!layout;if(!layout)return;
  const {left,top,linkX,linkY}=layout,w=this.size.width,h=this.size.height,cx=Math.max(0,Math.min(w,linkX)),cy=Math.max(0,Math.min(h,linkY)),dx=linkX-cx,dy=linkY-cy;
  this.host.style.left=left+'px';this.host.style.top=top+'px';
  this.line.style.left=cx+'px';this.line.style.top=cy+'px';this.line.style.width=Math.hypot(dx,dy)+'px';this.line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;
  Object.assign(this.host.dataset,{constructionTarget:target.id,worldX:String(target.x),worldY:String(target.y),worldZ:String(target.z)});
 }
}
