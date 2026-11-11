// V72 — Read-only, single-source shed construction progress.
// Timestamps come exclusively from HSEC assets.started/ends and hsec.time.
// No independent timers, localStorage, costs or mission state mutations.
export const timeLabel=seconds=>{
 const total=Math.max(0,Math.ceil(Number(seconds)||0));
 return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');
};
export function shedBuildProgress(asset,h){
 if(!asset||asset.type!=='shed')return null;
 const started=Number(asset.started),ends=Number(asset.ends),time=Number(h?.time);
 if(!Number.isFinite(started)||!Number.isFinite(ends)||!Number.isFinite(time)||ends<=started)return null;
 const duration=ends-started;
 const remaining=Math.max(0,ends-time);
 const fraction=Math.max(0,Math.min(1,(time-started)/duration));
 return {duration,remaining,fraction,percent:Math.round(fraction*100),remainingLabel:timeLabel(remaining)};
}
export function renderShedProgress(asset,h){
 const p=shedBuildProgress(asset,h);
 if(!p)return '';
 return `<div class="shedProgress" data-shed-progress="${asset.id}" role="group" aria-label="Progreso de construcción del galpón">
 <div class="shedProgressHeading"><span>MONTAJE EN PROGRESO</span><b data-shed-remaining>${p.remainingLabel}</b></div>
 <div class="shedProgressTrack" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.percent}" aria-label="Construcción de galpón"><i data-shed-fill style="width:${p.percent}%"></i></div>
 <div class="shedProgressFoot"><small>Galpón de mantenimiento</small><b data-shed-percent>${p.percent}%</b></div>
 </div>`;
}
export function updateShedProgressNodes(root,h){
 if(!root?.querySelectorAll)return;
 for(const element of root.querySelectorAll('[data-shed-progress]')){
  const asset=h?.assets?.find(a=>a.id===element.dataset.shedProgress);
  const p=shedBuildProgress(asset,h);
  if(!p)continue;
  const remaining=element.querySelector('[data-shed-remaining]');
  const percent=element.querySelector('[data-shed-percent]');
  const fill=element.querySelector('[data-shed-fill]');
  const track=element.querySelector('[role="progressbar"]');
  if(remaining)remaining.textContent=p.remainingLabel;
  if(percent)percent.textContent=p.percent+'%';
  if(fill)fill.style.width=p.percent+'%';
  if(track)track.setAttribute('aria-valuenow',String(p.percent));
 }
}
export class ShedProgressHud{
 constructor(parent){
  this.node=document.createElement('aside');
  this.node.className='shedBuildHud';
  this.node.hidden=true;
  parent.append(this.node);
  this.assetId=null;
 }
 update(h,visible=true){
  const asset=visible?h?.assets?.find(a=>a.type==='shed'&&a.status==='building'):null;
  if(!asset){this.node.hidden=true;this.assetId=null;return;}
  this.node.hidden=false;
  if(this.assetId!==asset.id){
   this.assetId=asset.id;
   this.node.innerHTML=renderShedProgress(asset,h);
  }
  updateShedProgressNodes(this.node,h);
 }
}
