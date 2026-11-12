// V90 · DRILL RUN precision radial command wheel.
// Visual-only navigation. Mission gates, economy and sound remain in game.mjs.
// Ten actions; three legible options + two low-contrast previews.
// Radial orbit and text counter-rotation use matching easing, not linear x/y motion.
import {icon} from './icons.mjs';

export const SEMI_RADIAL_ITEMS=Object.freeze([
 Object.freeze({id:'catalog',label:'Catálogo',symbol:'dock-package'}),
 Object.freeze({id:'production',label:'Producción',symbol:'dock-zones'}),
 Object.freeze({id:'logistics',label:'Logística',symbol:'inventory'}),
 Object.freeze({id:'workshop',label:'Taller',symbol:'wrench'}),
 Object.freeze({id:'fleet',label:'Patio y flota',symbol:'machine'}),
 Object.freeze({id:'contracts',label:'Contratos',symbol:'dock-clipboard'}),
 Object.freeze({id:'personnel',label:'Personal',symbol:'dock-users'}),
 Object.freeze({id:'safety',label:'HSEC',symbol:'dock-hsec'}),
 Object.freeze({id:'headquarters',label:'Casa Matriz',symbol:'store'}),
 Object.freeze({id:'overview',label:'Centro de Faena',symbol:'dock-gauge'})
]);
export const semiRadialWrap=(n,size)=>((n%size)+size)%size;
export function semiRadialStep(itemIndex,centerIndex,total){
 if(!Number.isInteger(total)||total<5)return 'off';
 let delta=semiRadialWrap(itemIndex-centerIndex,total);
 if(delta>Math.floor(total/2))delta-=total;
 return Math.abs(delta)<=2?String(delta):'off';
}

// Shared concentric-circle geometry: all sector edges and item positions are
// derived from one polar centre, rather than hand-drawn Bezier coordinates.
export const RADIAL_GEOMETRY=Object.freeze({
 cx:200,cy:164,outerRadius:154,innerRadius:89,itemRadius:121,
 left:[-68,-23.5],center:[-22.5,22.5],right:[23.5,68]
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
const arcPath=(from,to,r,geometry=RADIAL_GEOMETRY)=>
 'M'+point(radialPoint(from,r,geometry))+' A'+r+' '+r+' 0 0 1 '+point(radialPoint(to,r,geometry));
function wheelSvg(){
 const g=RADIAL_GEOMETRY;
 return '<svg class="dr90Ring" viewBox="0 0 400 165" aria-hidden="true" fill="none">'+
  '<defs>'+
   '<linearGradient id="dr90Side" x1="0" y1="0" x2=".1" y2="1"><stop stop-color="#21465b"/><stop offset=".53" stop-color="#102e43"/><stop offset="1" stop-color="#091c30"/></linearGradient>'+
   '<linearGradient id="dr90Selected" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="#74603e"/><stop offset=".46" stop-color="#3a4d60"/><stop offset="1" stop-color="#0b263a"/></linearGradient>'+
   '<linearGradient id="dr92Glass" x1="0" y1="0" x2=".28" y2="1"><stop stop-color="#c5f4fb" stop-opacity=".20"/><stop offset=".36" stop-color="#65bdd4" stop-opacity=".045"/><stop offset=".85" stop-color="#041c29" stop-opacity=".09"/><stop offset="1" stop-color="#00131c" stop-opacity=".35"/></linearGradient>'+
   '<linearGradient id="dr92Rim" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#dcf8fb" stop-opacity=".92"/><stop offset="1" stop-color="#4c9fb6" stop-opacity=".4"/></linearGradient>'+
  '</defs>'+
  '<path class="dr90Sector dr90Sector--left" d="'+radialSegmentPath(...g.left)+'"/>'+
  '<path class="dr90Sector dr90Sector--center" d="'+radialSegmentPath(...g.center)+'"/>'+
  '<path class="dr90Sector dr90Sector--right" d="'+radialSegmentPath(...g.right)+'"/>'+
  '<path class="dr92Glass dr92Glass--left" d="'+radialSegmentPath(...g.left)+'"/>'+
  '<path class="dr92Glass dr92Glass--center" d="'+radialSegmentPath(...g.center)+'"/>'+
  '<path class="dr92Glass dr92Glass--right" d="'+radialSegmentPath(...g.right)+'"/>'+
  '<path class="dr92OuterRim" d="'+arcPath(-67.4,-24, g.outerRadius-3.2)+'"/>'+
  '<path class="dr92OuterRim dr92OuterRim--selected" d="'+arcPath(-21.8,21.8,g.outerRadius-3.2)+'"/>'+
  '<path class="dr92OuterRim" d="'+arcPath(24,67.4,g.outerRadius-3.2)+'"/>'+
  '<path class="dr92InnerRim" d="'+arcPath(-67.4,67.4,g.innerRadius+3.7)+'"/>'+
  '<path class="dr90CenterAccent" d="M'+point(radialPoint(-12,g.outerRadius-6))+
   ' A'+(g.outerRadius-6)+' '+(g.outerRadius-6)+' 0 0 1 '+point(radialPoint(12,g.outerRadius-6))+'"/>'+
  '</svg>';
}
const hubSvg='<svg class="dr90HubGlyph" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+
 '<circle cx="24" cy="24" r="15.5" stroke-width="1.6" opacity=".9"/>'+
 '<path d="M24 5.5v7m0 23v7M5.5 24h7m23 0h7" stroke-width="2"/>'+
 '<path d="M24 16.5 31.5 24 24 31.5 16.5 24Z" stroke-width="2"/>'+
 '<circle cx="24" cy="24" r="2.5" fill="currentColor" stroke="none"/>'+
 '</svg>';
const arrowSvg=left=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+
 '<path d="'+(left?'M14.5 5 7.5 12l7 7':'m9.5 5 7 7-7 7')+'"/></svg>';

export function installSemiRadialDock({
 anchor=typeof document!=='undefined'?document.getElementById('bottomNav'):null,
 onNavigate=()=>false,
 onFeedback=()=>{}
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
 root.innerHTML='<div class="dr90Stage">'+
  wheelSvg()+
  '<div class="dr90Choices" role="group" aria-label="Accesos de la faena">'+orbital+'</div>'+
  '<div class="dr90Arrows" role="group" aria-label="Girar menú">'+
   '<button class="dr90Prev" type="button" aria-label="Acceso anterior" tabindex="-1">'+arrowSvg(true)+'</button>'+
   '<button class="dr90Next" type="button" aria-label="Acceso siguiente" tabindex="-1">'+arrowSvg(false)+'</button>'+
  '</div>'+
  '<button class="dr90Hub" type="button" aria-expanded="false" aria-label="Abrir menú de la faena" title="Menú de la faena">'+
   hubSvg+'<span class="dr90HubNotch" aria-hidden="true"></span></button>'+
  '</div>';
 anchor.insertAdjacentElement('afterend',root);
 const stage=root.querySelector('.dr90Stage');
 const hub=root.querySelector('.dr90Hub');
 const prev=root.querySelector('.dr90Prev'),next=root.querySelector('.dr90Next');
 const choices=root.querySelector('.dr90Choices');
 const nodes=Array.from(root.querySelectorAll('.dr90Orbit'));
 let centerIndex=0,open=false,destroyed=false;
 let pointerDown=false,holdOpened=false,moved=false,startX=0;
 let holdTimer=null,skipHubClick=false,drag=null,suppressChoiceClickUntil=0,lastDragAt=0,lastWheelAt=0;
 const SWIPE_PX=30, SWIPE_DETENT_MS=165;
 const feedback=kind=>{try{onFeedback(kind);}catch{}};
 const visibleStep=step=>step==='0'||step==='-1'||step==='1';
 const resize=()=>{
  if(destroyed)return;
  const scale=Math.min(1,Math.max(.65,root.getBoundingClientRect().width/400));
  root.style.setProperty('--dr90-scale',scale.toFixed(4));
 };
 const render=()=>{
  const total=SEMI_RADIAL_ITEMS.length;
  for(let i=0;i<nodes.length;i++){
   const node=nodes[i],item=node.querySelector('button');
   const step=semiRadialStep(i,centerIndex,total);
   let delta=semiRadialWrap(i-centerIndex,total);
   if(delta>Math.floor(total/2))delta-=total;
   const angle=step==='off'?(delta<0?-111:111):Number(step)*45;
   node.dataset.step=step;
   node.style.transform='rotate('+angle+'deg)';
   item.style.transform='rotate('+(-angle)+'deg)';
   const visible=open&&visibleStep(step);
   item.tabIndex=visible?0:-1;
   node.setAttribute('aria-hidden',String(!visible));
   item.setAttribute('aria-label',(step==='0'?'Abrir ':'Ir a ')+SEMI_RADIAL_ITEMS[i].label);
   item.setAttribute('aria-current',String(step==='0'));
  }
  prev.tabIndex=next.tabIndex=open?0:-1;
 };
 const setOpen=(value,silent=false)=>{
  if(destroyed||value&&anchor.classList.contains('hidden'))return;
  if(open===value)return;
  open=!!value;
  root.classList.toggle('is-open',open);
  hub.setAttribute('aria-expanded',String(open));
  hub.setAttribute('aria-label',open?'Cerrar menú de la faena':'Abrir menú de la faena');
  render();
  if(!silent)feedback(open?'select':'back');
 };
 const rotate=offset=>{
  if(!open||!offset)return;
  centerIndex=semiRadialWrap(centerIndex+Math.sign(offset),SEMI_RADIAL_ITEMS.length);
  render();
  feedback('skill');
 };
 const select=element=>{
  if(!open||!element)return;
  const orb=element.closest('.dr90Orbit');
  if(!orb)return;
  const step=Number(orb.dataset.step);
  if(!Number.isInteger(step)||Math.abs(step)>1)return;
  if(step!==0){rotate(step);return;}
  if(onNavigate(element.dataset.semiId)===false)return;
  feedback('confirm');setOpen(false,true);
 };
 render();resize();
 const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;
 if(ro)ro.observe(root);
 else addEventListener('resize',resize);

 // Tap opens/closes; long-press opens and holds; lateral swipe scrolls one step
 // per deliberate detent. The game feedback callback owns all UI sounds.
 hub.addEventListener('pointerdown',event=>{
  if(event.button!==0&&event.pointerType!=='touch')return;
  pointerDown=true;holdOpened=false;moved=false;startX=event.clientX;
  clearTimeout(holdTimer);
  holdTimer=setTimeout(()=>{if(pointerDown){holdOpened=true;setOpen(true);}},280);
 });
 hub.addEventListener('pointermove',event=>{
  if(!pointerDown)return;
  const dx=event.clientX-startX;
  if(Math.abs(dx)<SWIPE_PX||Date.now()-lastDragAt<SWIPE_DETENT_MS)return;
  lastDragAt=Date.now();clearTimeout(holdTimer);moved=true;
  if(!open)setOpen(true);
  rotate(dx<0?1:-1);
  startX=event.clientX;
 });
 const finishHub=()=>{
  clearTimeout(holdTimer);
  if(holdOpened||moved)skipHubClick=true;
  pointerDown=false;
 };
 hub.addEventListener('pointerup',finishHub);
 hub.addEventListener('pointercancel',finishHub);
 hub.addEventListener('lostpointercapture',()=>{clearTimeout(holdTimer);pointerDown=false;});
 hub.addEventListener('click',event=>{
  event.preventDefault();
  if(skipHubClick){skipHubClick=false;return;}
  setOpen(!open);
 });
 prev.addEventListener('click',()=>rotate(-1));
 next.addEventListener('click',()=>rotate(1));
 // All three painted sectors AND the icon buttons are touch surfaces.
 // Pointer events continue on window after the finger leaves the original icon.
 // CSS touch-action:none on the arc stops the world camera from stealing a swipe.
 stage.addEventListener('pointerdown',event=>{
  if(!open||(event.pointerType==='mouse'&&event.button!==0))return;
  if(event.target.closest('.dr90Hub,.dr90Arrows'))return;
  if(!event.target.closest('.dr90Sector,.dr90Option'))return;
  drag={id:event.pointerId,x:event.clientX,startX:event.clientX,turned:false};
 });
 const moveDrag=event=>{
  if(!drag||!open||event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x;
  if(Math.abs(dx)<SWIPE_PX||Date.now()-lastDragAt<SWIPE_DETENT_MS)return;
  lastDragAt=Date.now();
  drag.turned=true;
  suppressChoiceClickUntil=Date.now()+460;
  rotate(dx<0?1:-1);
  drag.x=event.clientX;
  if(event.cancelable)event.preventDefault();
 };
 const finishDrag=(event,cancelled=false)=>{
  if(!drag||event.pointerId!==drag.id)return;
  // Fast gestures can have only down/up events; don't lose their last detent.
  const dx=event.clientX-drag.startX;
  if(!cancelled&&!drag.turned&&open&&Math.abs(dx)>=SWIPE_PX){
   rotate(dx<0?1:-1);
   suppressChoiceClickUntil=Date.now()+460;
  }
  drag=null;
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
  if(event.key==='ArrowRight'){event.preventDefault();rotate(1);}
  else if(event.key==='ArrowLeft'){event.preventDefault();rotate(-1);}
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
  open:()=>setOpen(true),
  close:()=>setOpen(false),
  rotate,
  select:()=>select(nodes[centerIndex].querySelector('button')),
  destroy:()=>{
   destroyed=true;clearTimeout(holdTimer);ro?.disconnect();watch.disconnect();
   window.removeEventListener('pointermove',moveDrag);
   window.removeEventListener('pointerup',finishDrag);
   window.removeEventListener('pointercancel',cancelDrag);
   if(!ro)removeEventListener('resize',resize);
   document.removeEventListener('pointerdown',outside);
   document.removeEventListener('keydown',keydown);
   root.remove();
  }
 };
 root._semiRadialApi=api;
 return api;
}
