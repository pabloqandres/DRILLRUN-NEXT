// Mission 5 · A fixed, modular and persistent industrial machinery yard.
// This module owns construction economics and completion only, no Three.js,
// no localStorage, no Firebase, no mutations of M1–M4.
export const PATIO_L1={
 id:'patio-maquinarias-l1',name:'Patio de Maquinarias · L1',
 price:45000,constructionSeconds:1200,
 width:54,depth:44,center:{x:-51,z:-17},
 gate:{x:-24,z:-14},truckBay:{x:-65,z:-4},
 coveredCapacity:6,openDrillCapacity:2,heavyCapacity:3,
 modules:['Control de acceso','Estacionamiento techado liviano','Galpón logístico',
  'Combustible protegido','Explanada de perforadoras','Patio de equipos pesados','Urbanización y HSEC']
};
export const PATIO_FUTURE=[
 {id:'patio-maquinarias-l2',level:2,name:'Ampliación de flota',locked:true},
 {id:'patio-maquinarias-l3',level:3,name:'Centro logístico mayor',locked:true}
];
export const PATIO_PHASES=[
 {id:'blueprint',label:'Blueprint y replanteo',start:0,end:0.1},
 {id:'grading',label:'Nivelación y caminos',start:0.1,end:0.3},
 {id:'mounting',label:'Montaje de módulos',start:0.3,end:0.8},
 {id:'commissioning',label:'HSEC y puesta en servicio',start:0.8,end:1}
];
export function patioState(s){
 const p=s?.mission5;
 if(p?.status==='building'||p?.status==='operational')return p.status;
 return 'locked';
}
export function patioUnlocked(s){return s?.mission4?.phase==='complete';}
export function patioCanStart(s){
 if(!patioUnlocked(s))return 'needsM4';
 if(patioState(s)==='building')return 'constructionPending';
 if(patioState(s)==='operational')return 'alreadyBuilt';
 if(!Number.isFinite(s?.cash)||s.cash<PATIO_L1.price)return 'noMoney';
 return null;
}
export function startPatio(s,now=Date.now()){
 const blocked=patioCanStart(s);
 if(blocked)throw new Error(blocked);
 // No partial deductions: a single explicit player confirmation owns the job.
 s.cash-=PATIO_L1.price;
 s.ledger??=[];
 s.ledger.push({id:s.nextId++,key:'patioL1Build',amount:-PATIO_L1.price,at:now});
 s.mission5={id:PATIO_L1.id,level:1,status:'building',startedAt:now,
  endsAt:now+PATIO_L1.constructionSeconds*1000,terrain:'fixed-northwest',
  gate:{...PATIO_L1.gate},modulePack:PATIO_L1.modules.map(id=>({id,status:'installing'})),
  safety:{gate:true,pedestrianSeparation:true,lighting:true,fuelIsolation:true,heavyTraffic:true},
  notificationSent:false};
 return s.mission5;
}
export function patioProgress(s,now=Date.now()){
 const p=s?.mission5;
 if(!p||p.status!=='building')return {progress:p?.status==='operational'?1:0,remainingSeconds:0,phase:p?.status||'locked'};
 const span=Math.max(1,p.endsAt-p.startedAt),progress=Math.max(0,Math.min(1,(now-p.startedAt)/span));
 const stage=PATIO_PHASES.find(d=>progress<d.end)||PATIO_PHASES[PATIO_PHASES.length-1];
 return {progress,remainingSeconds:Math.max(0,Math.ceil((p.endsAt-now)/1000)),phase:stage.id,label:stage.label};
}
export function finishPatio(s,now=Date.now()){
 const p=s?.mission5;
 if(!p||p.status!=='building'||!Number.isFinite(p.endsAt)||now<p.endsAt)return false;
 p.status='operational';
 p.completedAt=p.endsAt;
 for(const module of p.modulePack||[])module.status='installed';
 p.hsecApproved=true;
 p.hsecScore=100;
 return true;
}
export function patioInstalledModules(s){
 return (s?.mission5?.modulePack||[]).filter(x=>x.status==='installed');
}
export function patioCapacity(s){
 const ready=patioState(s)==='operational';
 return {covered:ready?PATIO_L1.coveredCapacity:0,drill:ready?PATIO_L1.openDrillCapacity:0,
  heavy:ready?PATIO_L1.heavyCapacity:0,gate:ready};
}
