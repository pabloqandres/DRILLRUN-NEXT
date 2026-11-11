import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {PERSONNEL_GROUPS,PERSONNEL_CANDIDATES,candidatesForRole} from '../dist/chapter/personnel-candidates-v76.mjs';
import {renderPersonnelPremium} from '../dist/chapter/personnel-premium-v76.mjs';
const icon=name=>'<i data-icon="'+name+'"></i>';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const state=()=>{const s=newGame('es','operator01');s.cash=50000;s.office={status:'built',level:2};s.mission3={phase:'setup'};s.hsec={employee:{id:'hsec01',level:1,state:'idle'},assets:[{id:'shed-1',type:'shed',status:'built'}]};return s;};
test('V77: neutral placeholders remain for unillustrated roles, three skill rows on cards',()=>{
 assert.equal(PERSONNEL_CANDIDATES.length,21);
 for(const role of PERSONNEL_GROUPS.filter(r=>r.id!=='admin')){
  const s=state(),cards=candidatesForRole(role.id);
  const html=renderPersonnelPremium(s,role.id,cards[0].id,icon);
  assert.equal(cards.length,3,role.id);
  assert.equal((html.match(/class="pvCandidate /g)||[]).length,3,role.id);
  assert.equal((html.match(/class="pvCandidateSkill"/g)||[]).length,9,role.id);
  assert.equal((html.match(/class="pvPortrait"/g)||[]).length,3,role.id);
  assert(!/<img\b/i.test(html),'no unapproved candidate images shown for '+role.id);
  assert(html.includes('RETRATO PENDIENTE'));
  assert(html.includes('data-pv-hire'));
  for(const c of cards){
   assert(html.includes(c.name),c.name);
   assert(html.includes(Math.round(c.hireCost).toLocaleString('es-CL')),c.id);
  }
 }
});
test('V77: roster selects stored candidate ID without changing original hiring',()=>{
 const s=state();
 s.personnel=[{id:'adm-matias-torres',candidateId:'adm-matias-torres',name:'Matías Torres',role:'admin',level:1,state:'idle'}];
 const html=renderPersonnelPremium(s,'admin','adm-matias-torres',icon);
 assert(html.includes('data-pv-person="adm-matias-torres"'));
 assert(html.includes('pvEmptyPortrait--team'));
 assert(html.includes('pvArtPortrait--detail'));
 assert(html.includes('npc-portraits-v80/adm-matias-torres.svg'));
 const handler=read('dist/chapter/faena-center.mjs');
 assert(handler.includes('const identity=b.dataset.pvPerson'));
 assert(handler.includes('candidatesForRole(this.personnelRole).some(c=>c.id===identity)'));
});
test('V77: all placeholders are original CSS; V76 registry and skill economic lock remain',()=>{
 const ui=read('dist/chapter/personnel-premium-v76.mjs');
 const css=read('dist/chapter/personnel-premium-v76.css');
 const candidates=read('dist/chapter/personnel-candidates-v76.mjs');
 assert(ui.includes('const placeholder=(c,mode='));
 assert(ui.includes('candidateSkillRows(c)'));
 assert(css.includes('.pvEmptyPortrait--team'));
 assert(css.includes('touch-action:pan-x'));
 assert(candidates.includes('effectsEnabled:false'));
 assert.equal(new Set(PERSONNEL_CANDIDATES.map(c=>c.id)).size,21);
 assert(!/DRILLCO|PUMA|®|logo/i.test(css.slice(css.indexOf('/* V77 ·'),css.indexOf('/* V78:'))),'placeholder visuals have no branding');
});
