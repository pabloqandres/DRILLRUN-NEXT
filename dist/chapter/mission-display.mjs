// V47 — Single read-only mission presentation for the title screen and player HUD.
// State is authoritative (including narrative acceptance before any M5 purchase).
// Never writes to saves, grants rewards, or progresses missions.
const DEFS=Object.freeze([
 Object.freeze({id:'m1',number:1,title:'Tus primeros pasos',summary:'Prepara tu faena'}),
 Object.freeze({id:'m2',number:2,title:'Prepara tu operación',summary:'Seguridad HSEC'}),
 Object.freeze({id:'m3',number:3,title:'Tu primer contrato',summary:'Exploración RC'}),
 Object.freeze({id:'m4',number:4,title:'Automatiza tu operación',summary:'Producción DTH automatizada'}),
 Object.freeze({id:'m5',number:5,title:'Una base para crecer',summary:'Patio de Maquinarias L1'})
]);

function inferredProgress(s){
 if(s?.mission5&&s.mission5.status!=='locked')return 'm5';
 if(s?.mission4&&s.mission4.phase!=='inactive')return 'm4';
 if(s?.mission3&&s.mission3.phase!=='inactive')return 'm3';
 if(s?.hsec)return 'm2';
 return 'm1';
}

function finished(s,id,collected){
 if(collected.has(id))return true;
 switch(id){
  case 'm1':return !!s?.chapterCompletedAt;
  case 'm2':return !!s?.hsec?.completedAt;
  case 'm3':return s?.mission3?.phase==='complete';
  case 'm4':return s?.mission4?.phase==='complete';
  case 'm5':return !!s?.mission5?.commissionedAt;
  default:return false;
 }
}

export function getCurrentMissionCard(s){
 const accepted=new Set(Array.isArray(s?.narrative?.accepted)?s.narrative.accepted:[]);
 const collected=new Set(Array.isArray(s?.narrative?.rewardsCollected)?s.narrative.rewardsCollected:[]);
 // Last accepted, not-yet-collected mission has priority. The next mission
 // can be accepted before its construction/state object exists.
 let mission=DEFS.toReversed().find(m=>accepted.has(m.id)&&!collected.has(m.id));
 if(!mission)mission=DEFS.toReversed().find(m=>accepted.has(m.id));
 // Legacy pre-narrative saves use real mission progress as a fallback.
 if(!mission)mission=DEFS.find(m=>m.id===inferredProgress(s));
 const completed=finished(s,mission.id,collected);
 const awaitingConfirmation=completed&&accepted.has(mission.id)&&!collected.has(mission.id);
 let summary=mission.summary;
 if(mission.id==='m5'){
  const p=s?.mission5;
  summary=p?.commissionedAt?'Patio habilitado · confirma el cierre':p?.status==='operational'?'Patio construido · activa el personal':p?.status==='building'?'Patio L1 en construcción':'Construye el Patio de Maquinarias L1';
 }else if(mission.id==='m4'&&completed)summary='Producción DTH automatizada';
 else if(mission.id==='m3'&&completed)summary='Contrato exploratorio terminado';
 else if(mission.id==='m2'&&completed)summary='Operación HSEC preparada';
 else if(mission.id==='m1'&&completed)summary='Faena preparada';
 return {
  id:mission.id,
  number:mission.number,
  eyebrow:'MISIÓN '+mission.number+(completed&&!awaitingConfirmation?' · COMPLETADA':''),
  title:mission.title,
  summary,
  completed,
  awaitingConfirmation
 };
}
