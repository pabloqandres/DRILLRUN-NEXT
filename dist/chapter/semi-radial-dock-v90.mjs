// V96 · Six-sector exact polar wheel with endless, softly fading endpoints.
// Navigation handlers remain the original game's source of truth.
import {icon} from './icons.mjs';

export const SEMI_RADIAL_ITEMS=Object.freeze([
 Object.freeze({id:'overview',label:'Centro de Faena',symbol:'dock-gauge'}),
 Object.freeze({id:'catalog',label:'Catálogo',symbol:'dock-package'}),
 Object.freeze({id:'production',label:'Producción',symbol:'dock-zones'}),
 Object.freeze({id:'logistics',label:'Inventario',symbol:'inventory'}),
 Object.freeze({id:'personnel',label:'Personal',symbol:'dock-users'}),
 Object.freeze({id:'safety',label:'HSEC',symbol:'dock-hsec'}),
 Object.freeze({id:'workshop',label:'Taller',symbol:'wrench'}),
 Object.freeze({id:'fleet',label:'Patio y flota',symbol:'machine'}),
 Object.freeze({id:'contracts',label:'Contratos',symbol:'dock-clipboard'}),
 Object.freeze({id:'headquarters',label:'Casa Matriz',symbol:'store'})
]);
export const semiRadialWrap=(n,size)=>((n%size)+size)%size;
export function semiRadialStep(itemIndex,centerIndex,total){
 if(!Number.isInteger(total)||total<5)return 'off';
 let delta=semiRadialWrap(itemIndex-centerIndex,total);
 if(delta>Math.floor(total/2))delta-=total;
 return delta>=-1&&delta<=4?String(delta):'off';
}
export const RADIAL_GEOMETRY=Object.freeze({
 cx:500,cy:465,
 outerRadius:365,innerRadius:244,itemRadius:304,
 slotAngles:Object.freeze([-82.5,-67.5,-52.5,-37.5,-22.5,-7.5]),
 // Every sector derives from the exact same polar center and pair of radii.
 // Six 15-degree sectors with slender 0.8-degree seams, spanning a true 90° arc.
 slotBounds:Object.freeze([[-90,-75.4],[-74.6,-60.4],
   [-59.6,-45.4],[-44.6,-30.4],[-29.6,-15.4],[-14.6,0]])
});
export function radialPoint(angle,radius,geometry=RADIAL_GEOMETRY){
 const a=angle*Math.PI/180;
 return {x:geometry.cx+radius*Math.sin(a),y:geometry.cy-radius*Math.cos(a)};
}
const point=p=>p.x.toFixed(2)+' '+p.y.toFixed(2);
export function radialSegmentPath(from,to,geometry=RADIAL_GEOMETRY){
 const outerA=radialPoint(from,geometry.outerRadius,geometry);
 const outerB=radialPoint(to,geometry.outerRadius,geometry);
 const innerA=radialPoint(from,geometry.innerRadius,geometry);
 const innerB=radialPoint(to,geometry.innerRadius,geometry);
 return 'M'+point(outerA)+
  ' A'+geometry.outerRadius+' '+geometry.outerRadius+' 0 0 1 '+point(outerB)+
  ' L'+point(innerB)+
  ' A'+geometry.innerRadius+' '+geometry.innerRadius+' 0 0 0 '+point(innerA)+' Z';
}
const arcPath=(from,to,r,g=RADIAL_GEOMETRY)=>
 'M'+point(radialPoint(from,r,g))+' A'+r+' '+r+' 0 0 1 '+point(radialPoint(to,r,g));
function wheelSvg(){
 const g=RADIAL_GEOMETRY;
 const classes=['dr90Sector--left','dr90Sector--center','dr90Sector--right','dr94Sector--far','dr95Sector--fifth','dr95Sector--sixth'];
 const sectors=g.slotBounds.map(([a,b],i)=>
  '<path class="dr90Sector '+classes[i]+'" '+
  (i===0?'mask="url(#dr96FadeLower)" ':i===5?'mask="url(#dr96FadeUpper)" ':'')+
  'd="'+radialSegmentPath(a,b)+'"/>').join('');
 const glass=g.slotBounds.map(([a,b],i)=>
  '<path class="dr92Glass '+(i===1?'dr92Glass--center':'')+'" '+
  (i===0?'mask="url(#dr96FadeLower)" ':i===5?'mask="url(#dr96FadeUpper)" ':'')+
  'd="'+radialSegmentPath(a,b)+'"/>').join('');
 const rims=g.slotBounds.map(([a,b],i)=>
  '<path class="dr92OuterRim '+(i===1?'dr92OuterRim--selected':'')+'" '+
  (i===0?'mask="url(#dr96FadeLower)" ':i===5?'mask="url(#dr96FadeUpper)" ':'')+
  'd="'+arcPath(a+.8,b-.8,g.outerRadius-3)+'"/>').join('');
 return '<svg class="dr90Ring" viewBox="0 0 550 470" aria-hidden="true" fill="none">'+
  '<defs>'+
  '<linearGradient id="dr90Side" x1="0" y1="0" x2=".1" y2="1"><stop stop-color="#21465b"/><stop offset=".53" stop-color="#102e43"/><stop offset="1" stop-color="#091c30"/></linearGradient>'+
  '<linearGradient id="dr90Selected" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="#74603e"/><stop offset=".46" stop-color="#3a4d60"/><stop offset="1" stop-color="#0b263a"/></linearGradient>'+
  '<linearGradient id="dr92Glass" x1="0" y1="0" x2=".28" y2="1"><stop stop-color="#c5f4fb" stop-opacity=".20"/><stop offset=".36" stop-color="#65bdd4" stop-opacity=".045"/><stop offset=".85" stop-color="#041c29" stop-opacity=".09"/><stop offset="1" stop-color="#00131c" stop-opacity=".35"/></linearGradient>'+
  '<linearGradient id="dr92Rim" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#dcf8fb" stop-opacity=".92"/><stop offset="1" stop-color="#4c9fb6" stop-opacity=".4"/></linearGradient>'+
  '<linearGradient id="dr96FadeLowerGradient" gradientUnits="userSpaceOnUse" x1="0" y1="350" x2="0" y2="493"><stop stop-color="white"/><stop offset=".40" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>'+
  '<linearGradient id="dr96FadeUpperGradient" gradientUnits="userSpaceOnUse" x1="394" y1="0" x2="535" y2="0"><stop stop-color="white"/><stop offset=".40" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>'+
  '<linearGradient id="dr96TailLowerGradient" gradientUnits="userSpaceOnUse" x1="0" y1="450" x2="0" y2="561"><stop stop-color="white"/><stop offset=".15" stop-color="white" stop-opacity=".78"/><stop offset="1" stop-color="black"/></linearGradient>'+
  '<linearGradient id="dr96TailUpperGradient" gradientUnits="userSpaceOnUse" x1="489" y1="0" x2="620" y2="0"><stop stop-color="white"/><stop offset=".20" stop-color="white" stop-opacity=".7"/><stop offset="1" stop-color="black"/></linearGradient>'+
  '<mask id="dr96FadeLower" maskUnits="userSpaceOnUse" x="0" y="0" width="680" height="630"><rect x="0" y="0" width="680" height="630" fill="url(#dr96FadeLowerGradient)"/></mask>'+
  '<mask id="dr96FadeUpper" maskUnits="userSpaceOnUse" x="0" y="0" width="680" height="630"><rect x="0" y="0" width="680" height="630" fill="url(#dr96FadeUpperGradient)"/></mask>'+
  '<mask id="dr96TailLower" maskUnits="userSpaceOnUse" x="0" y="0" width="680" height="630"><rect x="0" y="0" width="680" height="630" fill="url(#dr96TailLowerGradient)"/></mask>'+
  '<mask id="dr96TailUpper" maskUnits="userSpaceOnUse" x="0" y="0" width="680" height="630"><rect x="0" y="0" width="680" height="630" fill="url(#dr96TailUpperGradient)"/></mask>'+
  '</defs>'+
  '<path class="dr96FadeTail dr96FadeTail--lower" mask="url(#dr96TailLower)" d="'+radialSegmentPath(-103,-90)+'"/>'+
  '<path class="dr96FadeTail dr96FadeTail--upper" mask="url(#dr96TailUpper)" d="'+radialSegmentPath(0,17)+'"/>'+
  sectors+glass+rims+
  '<path class="dr92InnerRim" d="'+arcPath(-90,0,g.innerRadius+3.5)+'"/>'+
  '<path class="dr90CenterAccent" d="'+arcPath(-71,-64,g.outerRadius-6)+'"/>'+
  '</svg>';
}
const hubSvg='<svg class="dr90HubGlyph" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">'+
 '<rect x="10" y="10" width="7" height="7" rx="1.5"/>'+
 '<rect x="20.5" y="10" width="7" height="7" rx="1.5"/>'+
 '<rect x="31" y="10" width="7" height="7" rx="1.5"/>'+
 '<rect x="10" y="20.5" width="7" height="7" rx="1.5"/>'+
 '<rect x="20.5" y="20.5" width="7" height="7" rx="1.5"/>'+
 '<rect x="31" y="20.5" width="7" height="7" rx="1.5"/>'+
 '<rect x="10" y="31" width="7" height="7" rx="1.5"/>'+
 '<rect x="20.5" y="31" width="7" height="7" rx="1.5"/>'+
 '<rect x="31" y="31" width="7" height="7" rx="1.5"/></svg>';

export function installSemiRadialDock({
 anchor=typeof document!=='undefined'?document.getElementById('bottomNav'):null,
 onNavigate=()=>false,onFeedback=()=>{}
}={}){
 if(!anchor||typeof document==='undefined')return null;
 const old=document.getElementById('semiRadialDock');
 if(old)return old._semiRadialApi||null;
 const root=document.createElement('div');
 root.id='semiRadialDock';
 root.className='dr90Dock';
 root.setAttribute('aria-label','Menú radial de la faena');
 const orbital=SEMI_RADIAL_ITEMS.map(item=>
  '<div class="dr90Orbit" data-semi-id="'+item.id+'" data-step="off" aria-hidden="true">'+
   '<button type="button" class="dr90Option" data-semi-id="'+item.id+'" tabindex="-1">'+
   '<span class="dr90Icon">'+icon(item.symbol)+'</span>'+
   '<span class="dr90Label">'+item.label+'</span></button></div>').join('');
 root.innerHTML='<div class="dr90Stage">'+wheelSvg()+
  '<div class="dr90Choices" role="group" aria-label="Accesos de la faena">'+orbital+'</div>'+
  '<div class="dr94Base" aria-hidden="true"></div>'+
  '<button class="dr90Hub" type="button" aria-expanded="false" aria-label="Abrir menú de la faena" title="Menú de la faena">'+
  hubSvg+'<span class="dr90HubNotch" aria-hidden="true"></span></button></div>';
 anchor.insertAdjacentElement('afterend',root);
 const stage=root.querySelector('.dr90Stage');
 const hub=root.querySelector('.dr90Hub');
 const choices=root.querySelector('.dr90Choices');
 const nodes=Array.from(root.querySelectorAll('.dr90Orbit'));
 let centerIndex=1,open=false,destroyed=false,drag=null;
 let holdTimer=null,holding=false,longPressed=false,skipHubClick=false;
 let suppressChoiceClickUntil=0,lastWheelAt=0;
 const DRAG_STEP_DEG=15,DRAG_MIN_STEP_MS=160;
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const normalizeAngle=d=>((d+540)%360)-180;
 const feedback=kind=>{try{onFeedback(kind);}catch{}};
 const angleAt=e=>{
  const rect=stage.getBoundingClientRect();
  const scale=rect.width/550;
  const x=rect.left+RADIAL_GEOMETRY.cx*scale;
  const y=rect.top+RADIAL_GEOMETRY.cy*scale;
  return Math.atan2(e.clientX-x,y-e.clientY)*180/Math.PI;
 };
 const resize=()=>{
  if(destroyed)return;
  const vw=window.innerWidth||document.documentElement?.clientWidth||1280;
  const vh=window.innerHeight||document.documentElement?.clientHeight||720;
  const scale=clamp(Math.min(1.16,vh/870,(vw-225)/550),.65,1.16);
  root.style.setProperty('--dr94-scale',scale.toFixed(4));
  root.style.setProperty('--dr90-scale',scale.toFixed(4));
  root.style.setProperty('--dr94-dock-width',(550*scale).toFixed(2)+'px');
  root.style.setProperty('--dr94-dock-height',(470*scale).toFixed(2)+'px');
  root.style.setProperty('--dr94-center-offset',(95*scale).toFixed(2)+'px');
  root.style.setProperty('--dr94-bottom-offset',(78*scale).toFixed(2)+'px');
 };
 const render=(fractionalAngle=0)=>{
  for(let i=0;i<nodes.length;i++){
   const node=nodes[i],item=node.querySelector('button');
   let delta=semiRadialWrap(i-centerIndex,SEMI_RADIAL_ITEMS.length);
   if(delta>SEMI_RADIAL_ITEMS.length/2)delta-=SEMI_RADIAL_ITEMS.length;
   const visible=delta>=-1&&delta<=4;
   const ghost=false;
   const angle=visible?RADIAL_GEOMETRY.slotAngles[delta+1]+fractionalAngle:
    (delta<0?-108:14);
   node.dataset.step=visible||ghost?String(delta):'off';
   node.style.transform='rotate('+angle.toFixed(2)+'deg)';
   item.style.transform='rotate('+(-angle).toFixed(2)+'deg)';
   const active=open&&visible;
   item.tabIndex=active?0:-1;
   node.setAttribute('aria-hidden',String(!active));
   item.setAttribute('aria-label',(delta===0?'Abrir ':'Ir a ')+SEMI_RADIAL_ITEMS[i].label);
   item.setAttribute('aria-current',String(delta===0));
  }
 };
 const setOpen=(value,silent=false)=>{
  if(destroyed||(value&&anchor.classList.contains('hidden')))return;
  if(open===value)return;
  open=!!value;
  root.classList.toggle('is-open',open);
  hub.setAttribute('aria-expanded',String(open));
  hub.setAttribute('aria-label',open?'Cerrar menú de la faena':'Abrir menú de la faena');
  render();
  if(!silent)feedback(open?'select':'back');
 };
 const rotate=offset=>{
  if(!open||!Number.isFinite(offset)||!offset)return;
  centerIndex=semiRadialWrap(centerIndex+Math.trunc(offset),SEMI_RADIAL_ITEMS.length);
  render();feedback('skill');
 };
 const select=element=>{
  if(!open||!element)return;
  const orbit=element.closest('.dr90Orbit');
  if(!orbit)return;
  const step=Number(orbit.dataset.step);
  if(!Number.isInteger(step)||step< -1||step>4)return;
  // Each visible wedge is a real shortcut; one tap opens its destination.
  // Dragging is exclusively for rotating the infinite carousel.
  if(onNavigate(element.dataset.semiId)===false)return;
  feedback('confirm');setOpen(false,true);
 };
 render();resize();
 const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;
 if(ro)ro.observe(root);
 else window.addEventListener('resize',resize);
 hub.addEventListener('pointerdown',event=>{
  if(event.button!==0&&event.pointerType!=='touch')return;
  holding=true;longPressed=false;
  clearTimeout(holdTimer);
  holdTimer=setTimeout(()=>{if(holding){longPressed=true;setOpen(true);}},280);
 });
 const finishHub=()=>{
  clearTimeout(holdTimer);
  if(longPressed)skipHubClick=true;
  holding=false;
 };
 hub.addEventListener('pointerup',finishHub);
 hub.addEventListener('pointercancel',finishHub);
 hub.addEventListener('lostpointercapture',finishHub);
 hub.addEventListener('click',event=>{
  event.preventDefault();
  if(skipHubClick){skipHubClick=false;return;}
  setOpen(!open);
 });
 // Rotate continuously with the finger, but never with inertia on release.
 // One detent requires deliberate angular travel and at least 145ms.
 stage.addEventListener('pointerdown',event=>{
  if(!open||(event.pointerType==='mouse'&&event.button!==0))return;
  if(event.target.closest('.dr90Hub'))return;
  if(!event.target.closest('.dr90Sector,.dr90Option'))return;
  const sector=event.target.closest('.dr90Sector');
  const sectorStep=sector?.classList?.contains('dr90Sector--left')?-1:
   sector?.classList?.contains('dr90Sector--center')?0:
   sector?.classList?.contains('dr90Sector--right')?1:
   sector?.classList?.contains('dr94Sector--far')?2:
    sector?.classList?.contains('dr95Sector--fifth')?3:
    sector?.classList?.contains('dr95Sector--sixth')?4:null;
  drag={id:event.pointerId,lastAngle:angleAt(event),offset:0,sectorStep,
   moved:false,lastShiftAt:Date.now()-DRAG_MIN_STEP_MS};
  root.classList.add('is-dragging');
 });
 const moveDrag=event=>{
  if(!drag||!open||event.pointerId!==drag.id)return;
  const now=Date.now(),next=angleAt(event);
  const diff=clamp(normalizeAngle(next-drag.lastAngle),-18,18);
  drag.lastAngle=next;
  if(Math.abs(diff)<.3)return;
  drag.offset=clamp(drag.offset+diff,-DRAG_STEP_DEG,DRAG_STEP_DEG);
  if(Math.abs(drag.offset)>DRAG_STEP_DEG/2&&now-drag.lastShiftAt>=DRAG_MIN_STEP_MS){
   const direction=Math.sign(drag.offset);
   centerIndex=semiRadialWrap(centerIndex-direction,SEMI_RADIAL_ITEMS.length);
   drag.offset-=direction*DRAG_STEP_DEG;
   drag.lastShiftAt=now;
   feedback('skill');
  }
  drag.moved=true;
  suppressChoiceClickUntil=now+440;
  render(drag.offset);
  if(event.cancelable)event.preventDefault();
 };
 const finishDrag=(event,cancelled=false)=>{
  if(!drag||event.pointerId!==drag.id)return;
  if(!cancelled&&!drag.moved){
   const delta=normalizeAngle(angleAt(event)-drag.lastAngle);
   if(Math.abs(delta)>10){
    centerIndex=semiRadialWrap(centerIndex-Math.sign(delta),SEMI_RADIAL_ITEMS.length);
    feedback('skill');drag.moved=true;
   }
  }
  if(!cancelled&&!drag.moved&&drag.sectorStep!==null){
   // Whole painted wedge is a target, not only the small icon.
   const index=semiRadialWrap(centerIndex+drag.sectorStep,SEMI_RADIAL_ITEMS.length);
   const option=nodes[index].querySelector('button');
   drag=null;root.classList.remove('is-dragging');render();
   select(option);
   return;
  }
  if(drag.moved)suppressChoiceClickUntil=Date.now()+440;
  drag=null;root.classList.remove('is-dragging');render();
 };
 window.addEventListener('pointermove',moveDrag,{passive:false});
 window.addEventListener('pointerup',finishDrag);
 const cancelDrag=event=>finishDrag(event,true);
 window.addEventListener('pointercancel',cancelDrag);
 choices.addEventListener('click',event=>{
  if(Date.now()<suppressChoiceClickUntil){event.preventDefault();return;}
  select(event.target.closest('.dr90Option'));
 });
 root.addEventListener('wheel',event=>{
  if(!open)return;
  event.preventDefault();
  if(Date.now()-lastWheelAt<410)return;
  lastWheelAt=Date.now();
  rotate(event.deltaY>0||event.deltaX>0?1:-1);
 },{passive:false});
 const outside=event=>{if(open&&!root.contains(event.target))setOpen(false,true);};
 const keydown=event=>{
  if(!open)return;
  if(event.key==='Escape'){event.preventDefault();setOpen(false);hub.focus();return;}
  if(event.key==='ArrowRight'||event.key==='ArrowDown'){event.preventDefault();rotate(1);}
  else if(event.key==='ArrowLeft'||event.key==='ArrowUp'){event.preventDefault();rotate(-1);}
  else if(event.key==='Enter'&&document.activeElement===hub){
   event.preventDefault();select(nodes[centerIndex].querySelector('button'));
  }
 };
 document.addEventListener('pointerdown',outside);
 document.addEventListener('keydown',keydown);
 const watch=new MutationObserver(()=>{
  if(anchor.classList.contains('hidden')||
    ['faenaOpen','phoneOpen','builderOpen','placing'].some(name=>document.body.classList.contains(name)))
   setOpen(false,true);
 });
 watch.observe(anchor,{attributes:true,attributeFilter:['class']});
 watch.observe(document.body,{attributes:true,attributeFilter:['class']});
 const api={
  get isOpen(){return open;},
  get selected(){return SEMI_RADIAL_ITEMS[centerIndex].id;},
  open:()=>setOpen(true),close:()=>setOpen(false),rotate,
  select:()=>select(nodes[centerIndex].querySelector('button')),
  destroy:()=>{
   destroyed=true;clearTimeout(holdTimer);ro?.disconnect();watch.disconnect();
   window.removeEventListener('pointermove',moveDrag);
   window.removeEventListener('pointerup',finishDrag);
   window.removeEventListener('pointercancel',cancelDrag);
   if(!ro)window.removeEventListener('resize',resize);
   document.removeEventListener('pointerdown',outside);
   document.removeEventListener('keydown',keydown);
   root.remove();
  }
 };
 root._semiRadialApi=api;
 return api;
}
