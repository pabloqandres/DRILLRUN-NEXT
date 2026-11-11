// V76 Personnel profiles: independent, stable identities and future-facing skills.
// Skill levels are stored on the employee; no gameplay multiplier is activated
// by this module. The existing contract/HSEC/yard rules remain authoritative.
import {ROLES,canHire,hirePersonnel} from '../mission3/personnel.mjs';
import {PATIO_STAFF,canHirePatioStaff,hirePatioStaff,hiredPatioStaff} from '../mission5/patio-staff.mjs';
import {EMPLOYEES} from '../hsec/catalog.mjs';

export const SKILLS=Object.freeze({
 negotiation:{label:'Negociación',description:'Potencial para mejorar acuerdos comerciales',icon:'handshake'},
 efficiency:{label:'Eficiencia',description:'Potencial de optimización operativa',icon:'gauge'},
 planning:{label:'Planificación',description:'Organización de contratos y recursos',icon:'calendar'},
 coordination:{label:'Coordinación',description:'Comunicación con equipos de faena',icon:'users'},
 reports:{label:'Reportes',description:'Calidad de informes y seguimiento',icon:'clipboard-list'},
 drilling:{label:'Perforación',description:'Dominio técnico de la operación',icon:'drill'},
 precision:{label:'Precisión',description:'Control de calidad en sondajes',icon:'crosshair'},
 safety:{label:'Seguridad',description:'Prevención y cumplimiento HSEC',icon:'shield-check'},
 maintenance:{label:'Mantenimiento',description:'Diagnóstico y reparación',icon:'wrench'},
 diagnosis:{label:'Diagnóstico',description:'Identificación temprana de fallas',icon:'scan'},
 logistics:{label:'Logística',description:'Orden y movimiento de suministros',icon:'package'},
 response:{label:'Respuesta',description:'Atención y capacidad de reacción',icon:'clock'},
 leadership:{label:'Liderazgo',description:'Apoyo a otros trabajadores',icon:'badge-check'},
 automation:{label:'Automatización',description:'Aptitud para herramientas y procesos',icon:'settings'}
});
export const ROLE_GROUPS=Object.freeze([
 {id:'admin',label:'Administrador de Contrato',short:'Administración',minMission:3,icon:'clipboard-list',detail:'Gestión, planificación y control contractual',engine:'m3'},
 {id:'driller',label:'Operador de Perforación',short:'Operaciones',minMission:3,icon:'hard-hat',detail:'Operación de perforadoras y control de sondajes',engine:'m3'},
 {id:'helper',label:'Ayudante de Perforación',short:'Apoyo',minMission:3,icon:'wrench',detail:'Asistencia en terreno y suministro',engine:'m3'},
 {id:'hsec',label:'Especialista HSEC',short:'Seguridad HSEC',minMission:2,icon:'shield-check',detail:'Inspección y prevención de riesgos',engine:'m3'},
 {id:'tecnicoDrillco',label:'Técnico de Taller',short:'Mantenimiento',minMission:4,icon:'settings',detail:'Diagnóstico y recambio de herramientas',engine:'m3'},
 {id:'m5-gate-security',label:'Guardia de Acceso',short:'Guardia',minMission:5,icon:'shield',detail:'Control del acceso y seguridad del patio',engine:'m5'},
 {id:'m5-warehouse-tech',label:'Técnico de Patio',short:'Patio de vehículos',minMission:5,icon:'truck',detail:'Bodega, revisión y logística del patio',engine:'m5'}
]);
const person=(id,roleId,name,hireCost,skills,art)=>Object.freeze({id,roleId,name,hireCost,skills:Object.freeze(skills),art:Object.freeze(art),portrait:'./assets/people/v76/'+id+'.svg'});
export const CANDIDATES=Object.freeze([
 person('adm-camila','admin','Camila Rojas',800,{negotiation:5,efficiency:3,planning:4},{skin:0,hair:0,style:0,gender:'w'}),
 person('adm-matias','admin','Matías Torres',1050,{negotiation:3,efficiency:5,reports:4},{skin:2,hair:2,style:1,gender:'m',beard:1}),
 person('adm-sofia','admin','Sofía Ibarra',1250,{planning:5,negotiation:4,coordination:3},{skin:1,hair:4,style:2,gender:'w',glasses:true}),
 person('opr-diego','driller','Diego Araya',600,{drilling:5,precision:4,safety:3},{skin:3,hair:1,style:3,gender:'m',beard:1}),
 person('opr-fernanda','driller','Fernanda Soto',750,{precision:5,safety:4,drilling:3},{skin:4,hair:5,style:4,gender:'w'}),
 person('opr-tomas','driller','Tomás Fuentes',950,{safety:5,drilling:4,coordination:3},{skin:2,hair:3,style:5,gender:'m',beard:2}),
 person('aux-lucas','helper','Lucas Medina',250,{logistics:5,efficiency:4,response:3},{skin:1,hair:1,style:6,gender:'m'}),
 person('aux-valentina','helper','Valentina Quiroga',320,{coordination:5,logistics:4,safety:3},{skin:0,hair:4,style:7,gender:'w'}),
 person('aux-nicolas','helper','Nicolás Paredes',400,{safety:5,response:4,efficiency:3},{skin:3,hair:3,style:8,gender:'m',beard:1}),
 person('hsec01','hsec','Ana Marín',350,{safety:5,reports:4,leadership:3},{skin:4,hair:0,style:9,gender:'w'}),
 person('hsec02','hsec','Javier Ríos',450,{reports:5,planning:4,safety:3},{skin:2,hair:2,style:10,gender:'m',glasses:true}),
 person('hsec03','hsec','Teresa Vidal',550,{leadership:5,safety:4,response:3},{skin:1,hair:5,style:11,gender:'w',glasses:true}),
 person('tal-ignacio','tecnicoDrillco','Ignacio Salinas',5000,{maintenance:5,diagnosis:4,automation:3},{skin:3,hair:1,style:12,gender:'m',beard:2}),
 person('tal-elena','tecnicoDrillco','Elena Valdés',5400,{diagnosis:5,automation:4,maintenance:3},{skin:0,hair:4,style:13,gender:'w',glasses:true}),
 person('tal-marcelo','tecnicoDrillco','Marcelo Muñoz',5900,{automation:5,maintenance:4,efficiency:3},{skin:2,hair:3,style:14,gender:'m',beard:1}),
 person('grd-oscar','m5-gate-security','Óscar Fuentes',1800,{safety:5,response:4,leadership:3},{skin:3,hair:2,style:15,gender:'m',beard:2}),
 person('grd-daniela','m5-gate-security','Daniela Pizarro',2200,{response:5,safety:4,coordination:3},{skin:0,hair:5,style:16,gender:'w'}),
 person('grd-felipe','m5-gate-security','Felipe Contreras',2600,{leadership:5,safety:4,reports:3},{skin:4,hair:3,style:17,gender:'m'}),
 person('pat-rocio','m5-warehouse-tech','Rocío Leiva',2200,{logistics:5,diagnosis:4,efficiency:3},{skin:1,hair:0,style:18,gender:'w'}),
 person('pat-andres','m5-warehouse-tech','Andrés Vera',2600,{diagnosis:5,maintenance:4,logistics:3},{skin:2,hair:2,style:19,gender:'m',beard:1}),
 person('pat-paula','m5-warehouse-tech','Paula Muñoz',2900,{efficiency:5,logistics:4,coordination:3},{skin:4,hair:4,style:20,gender:'w',glasses:true})
]);
export const CANDIDATE_BY_ID=Object.freeze(Object.fromEntries(CANDIDATES.map(p=>[p.id,p])));
export const ROLE_BY_ID=Object.freeze(Object.fromEntries(ROLE_GROUPS.map(r=>[r.id,r])));
export const candidatesForRole=id=>CANDIDATES.filter(c=>c.roleId===id);
export const hiredForRole=(s,roleId)=>roleId.startsWith('m5-')
 ?(hiredPatioStaff(s,roleId)?[s.mission5.staff[roleId]]:[])
 :roleId==='hsec'&&s?.hsec?.employee
 ?[...(s?.personnel||[]).filter(p=>p.role==='hsec'),{...s.hsec.employee,role:'hsec',candidateId:s.hsec.employee.id}].slice(0,1)
 :(s?.personnel||[]).filter(p=>p.role===roleId);
export const activeTeam=s=>[
 ...(s?.personnel||[]).filter(p=>p.role!=='techVisit'),
 ...(s?.hsec?.employee&&!(s?.personnel||[]).some(p=>p.role==='hsec')
  ?[{...s.hsec.employee,role:'hsec',candidateId:s.hsec.employee.id}]:[]),
 ...PATIO_STAFF.filter(def=>hiredPatioStaff(s,def.id)).map(def=>s.mission5.staff[def.id])
];
export function missionIndex(s){
 if(s?.mission5?.status&&s.mission5.status!=='locked'||s?.narrative?.accepted?.includes('m5'))return 5;
 if(s?.mission4?.phase&&s.mission4.phase!=='inactive')return 4;
 if(s?.mission3?.phase&&s.mission3.phase!=='inactive')return 3;
 return s?.hsec?2:1;
}
export function teamCapacity(s){
 const n=missionIndex(s),base=n>=5?8:n>=4?6:n>=3?4:n>=2?1:0;
 return Math.max(base,activeTeam(s).length);
}
export function priorityRole(s){
 const n=missionIndex(s);
 const ordered=n>=5?['m5-gate-security','m5-warehouse-tech','tecnicoDrillco']
  :n>=4?['tecnicoDrillco','admin','driller']
  :n>=3?['admin','driller','helper']
  :['hsec'];
 return ROLE_BY_ID[ordered.find(id=>!hiredForRole(s,id).length)]||ROLE_BY_ID[ordered[0]];
}
export function candidateBlockReason(s,candidate){
 const c=typeof candidate==='string'?CANDIDATE_BY_ID[candidate]:candidate;
 if(!c)return 'invalidCandidate';
 const role=ROLE_BY_ID[c.roleId];
 if(!role)return 'invalidRole';
 if(missionIndex(s)<role.minMission)return 'lockedMission';
 if(role.id==='hsec'&&s?.hsec?.employee)return 'roleFull';
 const reason=role.engine==='m5'?canHirePatioStaff(s,c.roleId):canHire(s,c.roleId);
 if(reason)return reason;
 return Number(s?.cash||0)<c.hireCost?'noMoney':null;
}
export function hireCandidate(s,candidateId,now=Date.now()){
 const c=CANDIDATE_BY_ID[candidateId],blocked=candidateBlockReason(s,c);
 if(blocked)throw new Error(blocked);
 const role=ROLE_BY_ID[c.roleId];
 const base=role.engine==='m5'
  ?PATIO_STAFF.find(p=>p.id===c.roleId).cost
  :ROLES.find(p=>p.id===c.roleId).hireCost;
 if(c.hireCost<base)throw new Error('invalidCandidateCost');
 const hired=role.engine==='m5'
  ?hirePatioStaff(s,role.id,now)
  :hirePersonnel(s,role.id,c.id,now);
 const extra=c.hireCost-base;
 if(extra>0){
  s.cash-=extra;
  s.ledger.push({id:s.nextId++,key:'candidatePremium',candidateId:c.id,role:role.id,amount:-extra,at:now});
 }
 hired.candidateId=c.id;hired.displayName=c.name;
 if(role.engine==='m3')hired.gender=c.art.gender==='w'?'woman':'man';
 hired.profileSkills={...c.skills};hired.profileSkillsVersion=1;
 hired.skillsGameplayActive=false; // explicitly future-facing
 hired.hireCost=c.hireCost;
 return hired;
}
export function employeeCandidate(employee){
 return CANDIDATE_BY_ID[employee?.candidateId||employee?.id]||null;
}
export function skillRows(c){
 return Object.entries(c?.skills||{}).map(([id,level])=>({id,level,label:SKILLS[id]?.label||id,description:SKILLS[id]?.description||''}));
}
