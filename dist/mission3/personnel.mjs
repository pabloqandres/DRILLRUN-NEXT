// Mission 3 — Personnel management
// Roles: hsec (from M2), admin, driller, techVisit (temporary)
import {EMPLOYEES} from '../hsec/catalog.mjs';
import {workshopLevel} from './inventory.mjs';
import {candidateById,candidateHirePrice,skillSnapshot} from '../chapter/personnel-candidates-v76.mjs';

export const ROLES=[
 {id:'hsec',nameKey:'hsecRole',salary:0,limit:1,hireCost:350,requires:'officeL2',
  skills:['inspection','maintenance'],glb:null},
 {id:'admin',nameKey:'adminRole',salary:0,limit:1,hireCost:800,requires:'workshopReady',
  skills:['logistics','planning'],glb:null},
 {id:'driller',nameKey:'drillerRole',salary:0,limit:1,hireCost:600,requires:'drillPurchased',
  skills:['drilling','rigging'],glb:null},
 {id:'helper',nameKey:'helperRole',salary:0,limit:2,hireCost:250,requires:'drillPurchased',
  skills:['support'],glb:null},
 {id:'techVisit',nameKey:'techVisitRole',salary:0,limit:1,hireCost:0,requires:'geoRequested',
  skills:['geology','sampling'],glb:null,temporary:true},
 {id:'tecnicoDrillco',nameKey:'tecnicoDrillcoRole',salary:0,limit:1,hireCost:5000,requires:'workshopNv2',
  skills:['maintenance','automation'],glb:null}
];

const fail=msg=>{throw new Error(msg);};
const roleDef=id=>ROLES.find(r=>r.id===id);

export function personnelRoster(s){return s.personnel||[];}

export function personnelByRole(s,roleId){return (s.personnel||[]).filter(p=>p.role===roleId);}

export function canHire(s,roleId,candidateId=null){
 const role=roleDef(roleId);
 if(!role)return 'invalidRole';
 const candidate=candidateById(candidateId);
 // Old calls such as "admin-01" remain valid, but known candidates
 // must always belong to the selected role.
 if(candidate&&candidate.role!==roleId)return 'invalidCandidate';
 if(roleId==='hsec'&&s.hsec?.employee)return 'roleFull';
 const current=personnelByRole(s,roleId);
 if(current.length>=role.limit)return 'roleFull';
 if(role.requires==='officeL2'&&(!s.office||s.office.level<2))return 'needsOfficeL2';
 if(role.requires==='workshopReady'&&(!s.hsec?.assets?.some(a=>a.type==='shed'&&a.status==='built')))return 'needsWorkshop';
 if(role.requires==='drillPurchased'&&!s.drill)return 'needsDrill';
 if(role.requires==='geoRequested'&&!s.geoAnalysis?.requested)return 'needsGeoRequest';
 if(role.requires==='workshopNv2'&&workshopLevel(s)<2)return 'needsWorkshopNv2';
 if(s.cash<candidateHirePrice(roleId,candidateId,role.hireCost))return 'noMoney';
 return null;
}

export function hirePersonnel(s,roleId,candidateId,now=Date.now()){
 const blocked=canHire(s,roleId,candidateId);
 if(blocked)fail(blocked);
 const role=roleDef(roleId);
 const candidate=candidateById(candidateId);
 const price=candidateHirePrice(roleId,candidateId,role.hireCost);
 // For HSEC, validate candidate from HSEC catalog
 if(roleId==='hsec'){
  const emp=EMPLOYEES.find(e=>e.id===candidateId);
  if(!emp)fail('invalidCandidate');
 }
 const person={
  id:candidateId||roleId+'-'+(s.nextId++),
  role:roleId,
  gender:candidate?.gender||(roleId==='hsec'?(EMPLOYEES.find(e=>e.id===candidateId)?.gender||'man'):'man'),
  candidateId:candidate?.id||null,
  name:candidate?.name||null,
  skillProfile:skillSnapshot(candidate?.id),
  level:1,
  skills:[...role.skills],
  state:'idle',
  assignment:null,
  hireCost:price,
  hiredAt:now,
  source:'hired'
 };
 s.cash-=price;
 s.personnel.push(person);
 s.ledger.push({id:s.nextId++,key:'hire-'+roleId,amount:-price,at:now});
 return person;
}

export function firePersonnel(s,personnelId,now=Date.now()){
 const idx=(s.personnel||[]).findIndex(p=>p.id===personnelId);
 if(idx===-1)fail('notFound');
 const person=s.personnel[idx];
 if(person.state==='operating'||person.state==='field')fail('personBusy');
 s.personnel.splice(idx,1);
 return person;
}

export function assignPersonnel(s,personnelId,assignment){
 const person=(s.personnel||[]).find(p=>p.id===personnelId);
 if(!person)fail('notFound');
 person.assignment=assignment;
 person.state=assignment?'working':'idle';
 return person;
}

export function personnelCost(s){
 return (s.personnel||[]).reduce((n,p)=>{
  const role=roleDef(p.role);
  return n+(role?.salary||0);
 },0);
}

export function hasRole(s,roleId){
 return (s.personnel||[]).some(p=>p.role===roleId);
}
