// M5 single read-only mission checklist for HUD and phone.
// Never awards currency or advances objectives while rendering.
import {mission5Objectives} from './patio-staff.mjs';
import {patioProgress} from './patio-state.mjs';

export const M5_REWARD_CASH=12000;
const pad=n=>String(n).padStart(2,'0');
const clock=seconds=>pad(Math.floor(seconds/60))+':'+pad(seconds%60);
const hints={
 build:'Catálogo → Edificios → Patio L1. Confirma la obra y espera 20 minutos.',
 guard:'Teléfono → Patio de Maquinarias → Contratar guardia de acceso.',
 technician:'Teléfono → Patio de Maquinarias → Contratar técnica de bodega.',
 gate:'Teléfono → Patio de Maquinarias → Verificar portón HSEC.',
 inventory:'Teléfono → Patio de Maquinarias → Revisar stock de bits y martillos.'
};
const esc=x=>String(x).replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));

export function mission5Readout(s,now=Date.now()){
 const objectives=mission5Objectives(s);
 const done=objectives.filter(o=>o.done).length;
 const firstPending=objectives.findIndex(o=>!o.done);
 const building=s?.mission5?.status==='building';
 const remainingSeconds=building?patioProgress(s,now).remainingSeconds:null;
 const steps=objectives.map((o,i)=>({
  ...o,
  number:i+1,
  status:o.done?'done':i===firstPending?'current':'locked',
  hint:hints[o.id],
  remainingSeconds:i===0&&building?remainingSeconds:null
 }));
 return {steps,done,total:steps.length,progress:steps.length?done/steps.length:1,
  pending:firstPending<0?null:steps[firstPending],completed:firstPending<0,
  rewardCash:M5_REWARD_CASH};
}

export function renderMission5HudChecklist(readout){
 const rows=readout.steps.map(step=>{
  const marker=step.status==='done'?'✓':step.status==='locked'?'–':String(step.number);
  const suffix=step.remainingSeconds!==null?' · '+clock(step.remainingSeconds)+' restantes':'';
  const activity=step.status==='current'?' aria-current="step"':'';
  return '<span class="m5HudStep '+step.status+'" role="listitem"'+activity+'>'+
   '<span class="m5HudNumber" aria-hidden="true">'+marker+'</span>'+
   '<span class="m5HudLabel">'+esc(step.label)+esc(suffix)+'</span></span>';
 }).join('');
 const closure=readout.completed?'<span class="m5HudClosing">Revisa el mensaje final de Elena para cobrar el bono.</span>':'';
 return '<span class="m5HudChecklist" role="list" aria-label="Cinco objetivos de Misión 5">'+rows+'</span>'+
  closure+'<span class="m5HudReward">Bono por completar · 🪙 '+readout.rewardCash.toLocaleString('es-CL')+'</span>';
}
