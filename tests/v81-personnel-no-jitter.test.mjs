import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {renderPersonnelPremium} from '../dist/chapter/personnel-premium-v76.mjs';
import {FaenaCenterUI} from '../dist/chapter/faena-center.mjs';
import {PERSONNEL_GROUPS} from '../dist/chapter/personnel-candidates-v76.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const icon=x=>'<i class="uiIcon">'+x+'</i>';
const state=()=>{const s=newGame('es','operator01');s.cash=37708;s.office={status:'built',level:2};s.mission3={phase:'setup'};s.hsec={employee:{id:'hsec01',level:1},assets:[]};return s;};
test('V81: pictograms and leading role planilla are real markup for all candidates',()=>{
 const s=state(),snapshot=JSON.stringify(s),a=renderPersonnelPremium(s,'admin','adm-camila-rojas',icon);
 assert(a.includes('class="pvRoleTitleIcon"'));
 assert(a.includes('dock-clipboard'));
 assert.equal((a.match(/class="pvCandidateSkill"/g)||[]).length,9);
 assert.equal((a.match(/class="pvSkillGlyph"/g)||[]).length,12);
 assert(a.includes('class="pvStatGlyph"'));
 assert(a.includes('class="pvDetailHeroCopy"'));
 assert(a.includes('class="pvDetailSummary"'));
 assert(a.includes('class="pvRoleBadge"'));
 assert(a.includes('data-pv-detail-tab="historial"'));
 assert(a.includes('loading="eager"'));
 assert(a.includes('width="230" height="260"'));
 assert.equal((a.match(/class="pvPortraitImage"/g)||[]).length,4);
 assert.equal(JSON.stringify(s),snapshot);
});
test('V81: all seven roles render pictograms without changing any data',()=>{
 const s=state();
 for(const role of PERSONNEL_GROUPS){
  const html=renderPersonnelPremium(s,role.id,undefined,icon);
  assert(html.includes('class="pvRoleTitleIcon"'),role.id);
  assert.equal((html.match(/class="pvCandidateSkill"/g)||[]).length,9,role.id);
  assert.equal((html.match(/class="pvSkillGlyph"/g)||[]).length,12,role.id);
 }
});
test('V81: identical Personnel render retains its DOM through periodic 2.6s calls',()=>{
 let writes=0,markup='',page='<section class="pvRoot">EQUIPO ESTABLE</section>';
 const balance={textContent:''};
 const host={
  classList:{contains:()=>false},
  get innerHTML(){return markup;},
  set innerHTML(x){markup=x;writes++;},
  querySelector(sel){
   if(sel==='.pvRoot')return writes?{}:null;
   if(sel==='.pvHeaderFunds')return balance;
   if(sel==='.faenaBody')return {scrollTop:0};
   if(sel==='.pvCandidates')return null;
   return null;
  }
 };
 const s=state(),ui=Object.create(FaenaCenterUI.prototype);
 Object.assign(ui,{host,state:()=>s,translate:()=>x=>x,format:x=>x,icon,
  route:'personnel',view:'',lastKey:'',pageHtml:()=>page,personnelView:'recruit'});
 ui.render();assert.equal(writes,1);
 for(let i=0;i<4;i++)ui.render();
 assert.equal(writes,1,'2.6s game refresh must not replace the illustrations');
 s.cash+=250;ui.render();assert.equal(writes,1,'cash-only refresh updates badge, not cards');
 assert.equal(balance.textContent,'🪙 37.958');
 page='<section class="pvRoot">CANDIDATO DISTINTO</section>';ui.render();
 assert.equal(writes,2,'explicit candidate/data changes must rerender');
 ui.route='overview';ui.render();assert.equal(writes,3,'non-Personnel pages retain normal redraw');
});
test('V81: final CSS fixes right clipping and deformation without changing gameplay',()=>{
 const css=read('dist/chapter/personnel-polish-v81.css');
 const html=read('dist/index.html'),faena=read('dist/chapter/faena-center.mjs');
 assert(html.indexOf('personnel-polish-v81.css')>html.indexOf('visual-polish-v80.css'));
 for(const required of ['grid-template-columns:minmax(0,23%)','overflow-x:hidden!important','object-fit:cover!important','transform:none!important','pvRoleTitleIcon','pvDetailHeroCopy','pvDetailTabs button','max-height:500px'])assert(css.includes(required),required);
 assert(faena.includes('this._lastPersonnelPage===pageMarkup'));
 assert(faena.includes('badge.textContent=money(s.cash)'));
 assert(!/\.pvCandidate\s*\{[^}]*translate/i.test(css));
});
