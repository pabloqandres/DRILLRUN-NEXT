// V73 · Taller Nivel 1 visible construction bar.
// Pure readout of persisted WORKSHOP_L1_SECONDS and workshop.started/ends.
// No timer, callback, expenditure or game state writes.
import {workshopL1Progress} from '../mission3/inventory.mjs';
import {timeLabel} from '../hsec/shed-progress-v72.mjs';

export class WorkshopL1BuildHud{
 constructor(parent){
  this.node=document.createElement('aside');
  this.node.className='shedBuildHud workshopL1BuildHud';
  this.node.hidden=true;
  this.node.setAttribute('aria-label','Avance de construcción del Taller Nivel 1');
  this.node.innerHTML=`<div class="shedProgress">
   <div class="shedProgressHeading"><span>CONSTRUCCIÓN · TALLER N1</span><b data-ws-time>01:30</b></div>
   <div class="shedProgressTrack" role="progressbar" aria-label="Progreso de construcción del taller" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i data-ws-fill style="width:0%"></i></div>
   <div class="shedProgressFoot"><small>Montaje del taller</small><b data-ws-percent>0%</b></div>
  </div>`;
  parent.append(this.node);
  this.time=this.node.querySelector('[data-ws-time]');
  this.fill=this.node.querySelector('[data-ws-fill]');
  this.percent=this.node.querySelector('[data-ws-percent]');
  this.track=this.node.querySelector('[role="progressbar"]');
 }
 update(state,now,visible=true){
  const p=visible?workshopL1Progress(state,now):null;
  this.node.hidden=!p;
  if(!p)return;
  this.time.textContent=timeLabel(p.remaining/1000);
  this.fill.style.width=p.percent+'%';
  this.percent.textContent=p.percent+'%';
  this.track.setAttribute('aria-valuenow',String(p.percent));
 }
}
