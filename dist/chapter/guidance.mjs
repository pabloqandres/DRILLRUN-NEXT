import {active as hsecActive} from '../hsec/state.mjs';
import {hsecIcon} from '../hsec/icons.mjs';
import {ActionHalo,OBJECTIVE_COLORS} from './action-halo.mjs';
import {icon} from './icons.mjs';
import * as T from '../vendor/three.module.js';
import {CONFIG,CLEARABLES} from './config.mjs';
import {objective} from './state.mjs';
const names={bush:'clearBush',rock:'clearRock',crate:'clearCrate',metal:'clearMetal'};
const symbols={bush:'leaf',rock:'rock',crate:'inventory',metal:'metal'};
// Every playable mission resolves to a real destination. Clearing has no mandatory order.
export function missionDestination(s,previous=null,random=Math.random){
 // HSEC tasks are completed through the construction/HUD interface, not by standing on a floor marker.
 // Never show an inert HSEC beacon (including when a later mission is already active).
 if(hsecActive(s))return null;
 const mission=objective(s),entrance={id:'office-entry',x:CONFIG.officeSlot.access.x,z:CONFIG.officeSlot.access.z,y:.1,icon:'camp',label:'enter',mission};
 if(mission==='clear'){
  const remaining=CLEARABLES.filter(o=>!s.cleared.includes(o.id));if(!remaining.length)return null;
  const o=remaining.find(o=>o.id===previous)||remaining[Math.min(remaining.length-1,Math.floor(random()*remaining.length))];
  return {...o,y:.8,mission,label:names[o.kind],icon:symbols[o.kind]};
 }
 if(mission==='build'||mission==='speed')return {...entrance,id:'office-site',label:mission==='build'?'buildAction':'accelerate',icon:mission==='build'?'build':'boost'};
 if(mission==='enter'||!s.inside)return entrance;
 const f=s.furniture.find(f=>s.inventory.find(i=>i.id===f.id)?.product==='computer');
 return f?{id:f.id,x:-6+f.x,z:f.z,y:1.65,icon:'computer',label:'useComputer',mission}:entrance;
}
// Project bearing onto the edge of the usable world viewport, including targets behind the camera.
export function edgeBearing(dx,dz,heading,width,height){
 const right=dx*Math.cos(heading)-dz*Math.sin(heading),forward=-dx*Math.sin(heading)-dz*Math.cos(heading);
 let x=right,y=-forward;if(Math.hypot(x,y)<.001)y=-1;
 const halfW=Math.max(30,width/2-54),halfH=Math.max(30,height/2-94),k=1/Math.max(Math.abs(x)/halfW,Math.abs(y)/halfH);
 return {x:width/2+x*k,y:height/2+y*k,angle:Math.atan2(x,-y)*180/Math.PI,behind:forward<0};
}
export function markerClearance(x,y,width,height,rects){
 // V2 objective markers include a 60px icon, distance pill and glowing halo.
 // Reserve their full area, not the old 22px/54px glyph size.
 const half=39,tall=97,pad=10,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),candidates=[{x,y}];
 for(const r of rects)candidates.push({x:r.left-half-pad,y},{x:r.right+half+pad,y},{x,y:r.top-pad},{x,y:r.bottom+tall+pad});
 const valid=p=>p.x>=half+12&&p.x<=width-half-12&&p.y>=tall+12&&p.y<=height-14&&!rects.some(r=>p.x+half>r.left-pad&&p.x-half<r.right+pad&&p.y>r.top-pad&&p.y-tall<r.bottom+pad);
 const clear=candidates.map(p=>({x:clamp(p.x,half+12,width-half-12),y:clamp(p.y,tall+12,height-14)})).filter(valid);
 clear.sort((a,b)=>(a.x-x)**2+(a.y-y)**2-((b.x-x)**2+(b.y-y)**2));return clear[0]||{x,y};
}
export const GUIDE_CATEGORIES={
 main:{color:'#'+OBJECTIVE_COLORS.main.toString(16),shape:'main'},
 secondary:{color:'#'+OBJECTIVE_COLORS.secondary.toString(16),shape:'secondary'},
 optional:{color:'#'+OBJECTIVE_COLORS.optional.toString(16),shape:'optional'}
};
export function markerIcon(category='main'){
 const shape=GUIDE_CATEGORIES[category]?.shape||'main';
 const paths=shape==='main'?'<path d="m12 2 10 10-10 10L2 12Z"/><path class="markerInk" d="M11 6h2v8h-2zm0 10h2v2h-2z"/>':shape==='optional'?'<path d="m12 2 10 10-10 10L2 12Z"/><path class="markerInk" d="m12 7 5 5-5 5-5-5Z"/>':'<path d="M12 2a8 8 0 0 1 8 8c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 8-8Z"/><circle class="markerInk" cx="12" cy="10" r="3"/>';
 return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
}
// Additional real objectives use the same renderer. Callers supply their category and coordinates.
export function guidanceTargets(primary,additional=[]){
 const result=[],ids=new Set();for(const goal of [primary,...additional]){
  if(!goal||goal.completed||goal.available===false||ids.has(goal.id)||!Number.isFinite(goal.x)||!Number.isFinite(goal.z))continue;
  const category=goal.category==='service'?'secondary':GUIDE_CATEGORIES[goal.category]?goal.category:'main';
  result.push({...goal,category,y:Number.isFinite(goal.y)?goal.y:.8});ids.add(goal.id);if(result.length===3)break;
 }return result;
}
export class ObjectiveGuide{
 constructor(world,host,translate){Object.assign(this,{world,translate});this.node=document.createElement('div');this.node.id='missionGuide';this.node.setAttribute('aria-live','off');host.append(this.node);this.point=new T.Vector3();this.direction=new T.Vector3();this.delta=new T.Vector3();this.markers=new Map();this.halos=new Map();this.additional=[];}
 setAdditionalTargets(goals){this.additional=goals||[];}
 update(s,enabled){
  this.node.hidden=!enabled;for(const halo of this.halos.values())halo.visible=enabled;if(!enabled)return;
  this.goal=missionDestination(s,this.goal?.id);const goals=guidanceTargets(this.goal,this.additional),ids=new Set(goals.map(g=>g.id));
  for(const [id,node]of this.markers)if(!ids.has(id)){node.remove();this.markers.delete(id);this.halos.get(id)?.dispose();this.halos.delete(id);}
  this.node.hidden=!goals.length;const t=this.translate(),width=innerWidth,height=innerHeight,layoutKey=width+':'+height+':'+document.body.className;
  if(layoutKey!==this.layoutKey){this.layoutKey=layoutKey;this.uiRects=[...document.querySelectorAll('#menuButton,#objective,#phoneButton,#settingsButton,#builderButton,#handButton,#joystick,#buildHud,#bottomNav,.resources')].map(el=>el.getBoundingClientRect()).filter(r=>r.width&&r.height);}
  for(const goal of goals){
   let node=this.markers.get(goal.id);if(!node){node=document.createElement('span');node.className='worldObjective';node.innerHTML=markerIcon(goal.category)+'<span class="pinTask">'+(goal.hsecCategory?hsecIcon(goal.hsecCategory,true):icon(goal.mission==='clear'?'hand':goal.icon))+'</span><small></small>';this.node.append(node);this.markers.set(goal.id,node);const halo=new ActionHalo(parseInt(GUIDE_CATEGORIES[goal.category].color.slice(1),16),{objective:true});this.world.scene.add(halo);this.halos.set(goal.id,halo);}
   const distance=Math.hypot(goal.x-s.position.x,goal.z-s.position.z);node.querySelector('small').textContent=Math.round(distance)+'m';const halo=this.halos.get(goal.id);const isOfficeGoal=goal.id==='office-entry'||goal.id==='office-site';const hideHalo=isOfficeGoal&&s.office.status==='built';halo.visible=enabled&&!hideHalo;halo.floor.visible=halo.rise.visible=!hideHalo;halo.position.set(goal.x,this.world.sampleGround(goal.x,goal.z)+.025,goal.z);if(!hideHalo)halo.animate(performance.now()/1000);node.classList.toggle('arrived',distance<1.6);node.style.setProperty('--guide-color',GUIDE_CATEGORIES[goal.category].color);node.setAttribute('aria-label',t(goal.label)+' · '+Math.round(distance)+' m');
   const p=this.point.set(goal.x,Math.max(goal.y,this.world.sampleGround(goal.x,goal.z)+1.9),goal.z).project(this.world.camera),forward=this.world.camera.getWorldDirection(this.direction),front=forward.dot(this.delta.set(goal.x-this.world.camera.position.x,goal.y-this.world.camera.position.y,goal.z-this.world.camera.position.z))>0;
   let x=(p.x*.5+.5)*width,y=(-p.y*.5+.5)*height;const onScreen=front&&p.z>-1&&p.z<1&&x>44&&x<width-44&&y>89&&y<height-98;
   let bearing=0;if(!onScreen){const edge=edgeBearing(goal.x-s.position.x,goal.z-s.position.z,this.world.cameraRig.heading,width,height);x=edge.x;y=edge.y;bearing=edge.angle;}
   ({x,y}=markerClearance(x,y,width,height,this.uiRects));node.style.left=x+'px';node.style.top=y+'px';node.classList.toggle('edge',!onScreen);Object.assign(node.dataset,{target:goal.id,category:goal.category,mission:goal.mission||'',onScreen:String(onScreen),distance:distance.toFixed(2),bearing:bearing.toFixed(0)});
   if(goal===goals[0])Object.assign(this.node.dataset,node.dataset);
  }
 }
}
