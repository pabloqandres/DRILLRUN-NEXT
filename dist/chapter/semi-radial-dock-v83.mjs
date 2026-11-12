// V83 · DRILL RUN compact semi-radial game dock.
// Presentation/navigation only: does not mutate state, cash, missions or save.
// The existing bottomNav stays the functional authority for legacy actions.
// All animation is event-driven (no idle loops, polling, audio or UI pulses).
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

export const semiRadialWrap=(number,size)=>((number%size)+size)%size;
export function semiRadialStep(itemIndex,centerIndex,total){
 if(!Number.isInteger(total)||total<5)return 'off';
 let delta=semiRadialWrap(itemIndex-centerIndex,total);
 if(delta>Math.floor(total/2))delta-=total;
 return Math.abs(delta)<=2?String(delta):'off';
}

/**
 * Mounts a rotating shallow fan above the existing game dock.
 * Tapping the center button toggles it, holding opens it, horizontal drag
 * rotates it, and selecting the sharp center slot performs the real action.
 * The neighbouring sharp slots rotate; the two faded edge slots are hints.
 */
export function installSemiRadialDock({
 anchor=typeof document!=='undefined'?document.getElementById('bottomNav'):null,
 onNavigate=()=>false,
 onFeedback=()=>{}
}={}){
 if(!anchor||typeof document==='undefined')return null;
 const prior=document.getElementById('semiRadialDock');
 if(prior)return prior._semiRadialApi||null;
 const root=document.createElement('div');
 root.id='semiRadialDock';
 root.className='drSemiDock';
 root.setAttribute('aria-label','Accesos rápidos de la faena');
 root.innerHTML='<div class="drSemiFan" role="group" aria-label="Rueda semirradial de navegación">'+
  '<div class="drSemiArc" aria-hidden="true"></div>'+
  // V88: one perimeter and two joins; do not overlay an inner guide stroke.
  '<svg class="drSemiRibbon" viewBox="0 0 400 112" preserveAspectRatio="none" aria-hidden="true">'+
   '<defs><linearGradient id="drSemiSideFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#193c50"/><stop offset="1" stop-color="#0d2537"/></linearGradient><linearGradient id="drSemiCenterFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#56432e"/><stop offset="1" stop-color="#263744"/></linearGradient></defs>'+
   '<path class="drSemiSegment drSemiSegmentLeft" d="M18 82 Q77 39 143 21 L153 72 Q95 80 40 105 Z"/>'+
   '<path class="drSemiSegment drSemiSegmentActive" d="M143 21 Q200 5 257 21 L247 72 Q200 59 153 72 Z"/>'+
   '<path class="drSemiSegment drSemiSegmentRight" d="M257 21 Q323 39 382 82 L360 105 Q305 80 247 72 Z"/>'+
   '<path class="drSemiOutline" d="M18 82 Q77 39 143 21 Q200 5 257 21 Q323 39 382 82"/>'+
   '<path class="drSemiBottom" d="M40 105 Q95 80 153 72 Q200 59 247 72 Q305 80 360 105"/>'+
   '<path class="drSemiCaps" d="M18 82 40 105 M382 82 360 105"/>'+
   '<path class="drSemiDividers" d="M143 21 153 72 M257 21 247 72"/>'+
   '</svg>'+ 
  SEMI_RADIAL_ITEMS.map(item=>
   '<button class="drSemiItem" type="button" data-semi-id="'+item.id+
   '" data-step="off" tabindex="-1" aria-hidden="true">'+
   '<svg class="drSemiWedge" viewBox="0 0 120 94" preserveAspectRatio="none" aria-hidden="true">'+
   '<path class="drSemiShape drSemiShapeCenter" d="M12 29 Q60 1 108 29 Q115 35 109 46 L92 81 Q60 94 28 81 L11 46 Q5 35 12 29 Z"/>'+
   '<path class="drSemiShape drSemiShapeSide" d="M9 42 Q54 12 110 19 L116 43 L94 86 Q47 82 9 70 Q2 66 9 42 Z"/>'+
   '</svg>'+ 
  '<span class="drSemiGlyph">'+icon(item.symbol)+'</span>'+
   '<span class="drSemiLabel">'+item.label+'</span></button>').join('')+
  '<div class="drSemiProgress" aria-hidden="true"></div>'+
  '</div>'+
  '<div class="drSemiBrowse" role="group" aria-label="Explorar diez secciones">'+
   '<button class="drSemiPrev" type="button" aria-label="Sección anterior">‹</button>'+
   '<span class="drSemiCount" aria-live="polite">1 / 10</span>'+
   '<button class="drSemiNext" type="button" aria-label="Sección siguiente">›</button>'+
   '</div>'+
  '<button class="drSemiTrigger" type="button" aria-expanded="false" aria-label="Abrir menú semirradial" title="Menú de la faena">'+
  '<svg class="drSemiHubIcon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+
   '<circle cx="24" cy="24" r="17"/><path d="M24 7v5m0 24v5M7 24h5m24 0h5"/>'+
   '<path d="M24 15l9 9-9 9-9-9 9-9z"/><circle cx="24" cy="24" r="3.2"/>'+
   '</svg>'+
  '<span class="drSemiTriggerMark" aria-hidden="true">⌃</span></button>';
 anchor.insertAdjacentElement('afterend',root);

 const trigger=root.querySelector('.drSemiTrigger');
 const fan=root.querySelector('.drSemiFan');
 const items=Array.from(root.querySelectorAll('.drSemiItem'));
 const progress=root.querySelector('.drSemiProgress');
 const prev=root.querySelector('.drSemiPrev'),next=root.querySelector('.drSemiNext'),count=root.querySelector('.drSemiCount');
 let centerIndex=0,open=false,closed=false;
 let triggerDown=false,triggerLong=false,triggerDragged=false;
 let touchX=0,longTimer=null,suppressTriggerClick=false,fanDrag=null,suppressItemClickUntil=0,lastDragRotationAt=0,lastWheelAt=0;
 const feedback=kind=>{try{onFeedback(kind);}catch{}};
 const render=()=>{
  const total=SEMI_RADIAL_ITEMS.length;
  for(let i=0;i<items.length;i++){
   const step=semiRadialStep(i,centerIndex,total),el=items[i];
   el.dataset.step=step;
   const canFocus=step==='0'||step==='-1'||step==='1';
   el.tabIndex=canFocus?0:-1;
   el.setAttribute('aria-hidden',String(!canFocus));
   el.setAttribute('aria-current',String(step==='0'));
   el.setAttribute('aria-label',step==='0'?'Abrir '+SEMI_RADIAL_ITEMS[i].label:'Girar hacia '+SEMI_RADIAL_ITEMS[i].label);
  }
  progress.textContent=(centerIndex+1)+' / '+total;
  if(count)count.textContent=(centerIndex+1)+' / '+total;
  root.style.setProperty('--dr-semi-index',String(centerIndex));
 };
 const setOpen=(next,quiet=false)=>{
  if(closed)return;
  if(next&&anchor.classList.contains('hidden'))return;
  if(open===next)return;
  open=next;
  root.classList.toggle('is-open',open);
  trigger.setAttribute('aria-expanded',String(open));
  trigger.setAttribute('aria-label',open?'Cerrar menú semirradial':'Abrir menú semirradial');
  if(!quiet)feedback(open?'select':'back');
 };
 const rotate=offset=>{
  if(!open||!offset)return;
  centerIndex=semiRadialWrap(centerIndex+offset,SEMI_RADIAL_ITEMS.length);
  render();
  feedback('skill');
 };
 const select=el=>{
  const id=el.dataset.semiId,step=Number(el.dataset.step);
  if(!Number.isInteger(step)||Math.abs(step)>2)return;
  if(step!==0){rotate(step<0?-1:1);return;}
  if(onNavigate(id)===false)return;
  feedback('confirm');
  setOpen(false,true);
 };
 render();

 // Standard tap and press-and-hold (unlike timed toggle, hold doesn't select).
 trigger.addEventListener('pointerdown',event=>{
  if(event.button!==0&&event.pointerType!=='touch')return;
  triggerDown=true;triggerLong=false;triggerDragged=false;
  touchX=event.clientX;
  clearTimeout(longTimer);
  longTimer=setTimeout(()=>{
   if(!triggerDown)return;
   triggerLong=true;
   setOpen(true);
  },320);
 });
 trigger.addEventListener('pointermove',event=>{
  if(!triggerDown)return;
  const dx=event.clientX-touchX;
  if(Math.abs(dx)>=58&&Date.now()-lastDragRotationAt>=310){
   lastDragRotationAt=Date.now();
   clearTimeout(longTimer);
   triggerDragged=true;
   if(!open)setOpen(true);
   rotate(dx<0?1:-1);
   touchX=event.clientX;
  }
 });
 const endHold=()=>{
  clearTimeout(longTimer);
  if(triggerLong||triggerDragged)suppressTriggerClick=true;
  triggerDown=false;
 };
 trigger.addEventListener('pointerup',endHold);
 trigger.addEventListener('pointercancel',endHold);
 trigger.addEventListener('lostpointercapture',()=>{clearTimeout(longTimer);triggerDown=false;});
 trigger.addEventListener('click',event=>{
  event.preventDefault();
  if(suppressTriggerClick){suppressTriggerClick=false;return;}
  setOpen(!open);
 });

 prev?.addEventListener('click',()=>rotate(-1));
 next?.addEventListener('click',()=>rotate(1));
 // Swipe on the fan; each detent rotates one destination.
 fan.addEventListener('pointerdown',event=>{
  if(!open)return;
  fanDrag={x:event.clientX,dragged:false};
 });
 fan.addEventListener('pointermove',event=>{
  if(!open||!fanDrag)return;
  const dx=event.clientX-fanDrag.x;
  if(Math.abs(dx)>=58&&Date.now()-lastDragRotationAt>=310){
   lastDragRotationAt=Date.now();
   fanDrag.dragged=true;
   suppressItemClickUntil=Date.now()+270;
   rotate(dx<0?1:-1);
   fanDrag.x=event.clientX;
  }
 });
 const endFan=()=>{fanDrag=null;};
 fan.addEventListener('pointerup',endFan);
 fan.addEventListener('pointercancel',endFan);
 fan.addEventListener('click',event=>{
  if(!open)return;
  if(Date.now()<suppressItemClickUntil){event.preventDefault();return;}
  const item=event.target.closest('.drSemiItem');
  if(item)select(item);
 });
 fan.addEventListener('wheel',event=>{
  if(!open)return;
  event.preventDefault();
  if(Date.now()-lastWheelAt<270)return;
  lastWheelAt=Date.now();
  const direction=event.deltaY>0||event.deltaX>0?1:-1;
  rotate(direction);
 },{passive:false});

 // Close when another UI takes control or the world is tapped.
 const outside=event=>{
  if(open&&!root.contains(event.target))setOpen(false,true);
 };
 const keydown=event=>{
  if(!open)return;
  if(event.key==='Escape'){setOpen(false);return;}
  if(event.key==='ArrowRight'){event.preventDefault();rotate(1);}
  else if(event.key==='ArrowLeft'){event.preventDefault();rotate(-1);}
  else if(event.key==='Enter'&&document.activeElement===trigger){event.preventDefault();select(items[centerIndex]);}
 };
 document.addEventListener('pointerdown',outside);
 document.addEventListener('keydown',keydown);
 const watch=new MutationObserver(()=>{
  if(anchor.classList.contains('hidden')||document.body.classList.contains('faenaOpen')||
   document.body.classList.contains('phoneOpen')||
   document.body.classList.contains('builderOpen'))setOpen(false,true);
 });
 watch.observe(anchor,{attributes:true,attributeFilter:['class']});
 watch.observe(document.body,{attributes:true,attributeFilter:['class']});
 const api={
  get isOpen(){return open;},
  get selected(){return SEMI_RADIAL_ITEMS[centerIndex].id;},
  open:()=>setOpen(true),
  close:()=>setOpen(false),
  rotate,
  select:()=>select(items[centerIndex]),
  destroy:()=>{
   closed=true;clearTimeout(longTimer);watch.disconnect();
   document.removeEventListener('pointerdown',outside);
   document.removeEventListener('keydown',keydown);
   root.remove();
  }
 };
 root._semiRadialApi=api;
 return api;
}
