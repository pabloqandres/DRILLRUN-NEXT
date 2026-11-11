import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {PERSONNEL_CANDIDATES,PERSONNEL_GROUPS,PERSONNEL_PAYROLL_POLICY,candidatesForRole} from '../dist/chapter/personnel-candidates-v76.mjs';
import {renderPersonnelPremium,renderPersonnelManagement} from '../dist/chapter/personnel-premium-v76.mjs';
const icon=n=>'<span>'+n+'</span>';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const state=()=>{const s=newGame('es','operator01');s.cash=50000;s.office={status:'built',level:2};s.mission3={phase:'setup'};s.hsec={employee:{id:'hsec01',level:1},assets:[]};return s;};
test('V79: all 21 candidates start with low skills and reserved wages',()=>{
 assert.equal(PERSONNEL_CANDIDATES.length,21);
 for(const r of PERSONNEL_GROUPS){
  const a=candidatesForRole(r.id);
  assert.equal(a.length,3);
  assert(a.every(c=>c.payrollStatus==='planned'&&c.salaryPerShift>=60&&c.salaryPerShift<=310));
  assert(a.every(c=>Object.values(c.skills).every(v=>Number.isInteger(v)&&v>=1&&v<=3)));
  assert(a[1].salaryPerShift>a[0].salaryPerShift&&a[2].salaryPerShift<a[0].salaryPerShift);
 }
 assert.equal(PERSONNEL_PAYROLL_POLICY.cycleCountPerTurn,4);
 assert.equal(PERSONNEL_PAYROLL_POLICY.automaticDebitsEnabled,false);
 assert.equal(PERSONNEL_PAYROLL_POLICY.offlineDebitsEnabled,false);
 assert.equal(PERSONNEL_PAYROLL_POLICY.trainingEffectsEnabled,false);
});
test('V79: mission banner and employee proposals do not mutate gameplay',()=>{
 const s=state(),before=JSON.stringify(s);
 const html=renderPersonnelPremium(s,'admin','adm-camila-rojas',icon);
 assert(html.includes('data-pv-mission="m3"'));
 assert(html.includes('pvArtPortrait--camila'));
 assert(html.includes('data-pv-team-open'));
 assert(html.includes('Salario por turno · propuesto'));
 assert(html.includes('Sin cobro activo'));
 assert.equal(JSON.stringify(s),before);
 for(const id of ['m1','m2','m3','m4','m5','free']){
  const svg=read('dist/assets/personnel-missions-v79/'+id+'.svg');
  assert(svg.startsWith('<svg'),id);
  assert(!/<text\b|<image\b|DRILLCO|PUMA|logo|®/i.test(svg),id);
 }
});
test('V79: management shows stored employee skills, salary and no payroll transactions',()=>{
 const s=state();
 s.personnel=[{id:'adm-matias-torres',candidateId:'adm-matias-torres',name:'Matías Torres',role:'admin',skillProfile:{skills:{efficiency:5,coordination:4,reporting:3},skillLevel:1,skillPoints:0,effectsEnabled:false}}];
 const before=JSON.stringify(s),html=renderPersonnelManagement(s,'adm-matias-torres',icon);
 assert(html.includes('Gestión de equipo'));
 assert(html.includes('Matías Torres'));
 assert(html.includes('🪙 165'));
 assert(html.includes('5/5'));
 assert(html.includes('data-pv-team-person="adm-matias-torres"'));
 assert(html.includes('Sin cobros activos'));
 assert.equal(JSON.stringify(s),before);
 const src=read('dist/chapter/faena-center.mjs');
 for(const attr of ['data-pv-team-open','data-pv-team-back','data-pv-team-person'])assert(src.includes(attr));
});
