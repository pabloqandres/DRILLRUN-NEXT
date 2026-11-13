// V102 · Read-only workshop construction projection, shared by the operations
// dashboard and the world-space status tag. No timers, saves, or state writes.
import {workshopL1Progress,workshopUpgradeJob,workshopUpgradeProgress} from '../mission3/inventory.mjs';

export function workshopTimeLabel(milliseconds){
 const total=Math.max(0,Math.ceil((Number(milliseconds)||0)/1000));
 return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');
}
export function workshopConstructionReadout(s,now=Date.now()){
 const w=s?.workshop;
 if(w?.status==='building'){
  const p=workshopL1Progress(s,now);
  if(!p)return null;
  return {
   kind:'construction',label:'Construcción en curso',shortLabel:'EN CONSTRUCCIÓN',
   targetLevel:1,started:w.started,ends:w.ends,
   progress:p.percent,remainingMs:p.remaining,
   remainingLabel:workshopTimeLabel(p.remaining)
  };
 }
 const job=workshopUpgradeJob(s);
 if(!job||!Number.isFinite(job.started)||!Number.isFinite(job.ends))return null;
 return {
  kind:'upgrade',label:'Ampliación en curso',shortLabel:'AMPLIANDO TALLER',
  targetLevel:job.targetLevel,started:job.started,ends:job.ends,
  progress:Math.round(Math.max(0,Math.min(1,workshopUpgradeProgress(s,now)||0))*100),
  remainingMs:Math.max(0,job.ends-now),remainingLabel:workshopTimeLabel(job.ends-now)
 };
}
