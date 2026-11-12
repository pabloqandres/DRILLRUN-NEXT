import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {PERSONNEL_GROUPS,candidatesForRole,personnelCapacity} from '../dist/chapter/personnel-candidates-v76.mjs';
import {renderPersonnelPremium} from '../dist/chapter/personnel-premium-v76.mjs';
import {staffPageSize,staffPageTotal,staffCurrentPage} from '../dist/chapter/personnel-v100-interactions.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const ico=name=>'<span class="uiIcon">'+name+'</span>';
const setup=()=>{
 const s=newGame('es','operator01');
 s.cash=95458;s.office={status:'built',level:2};
 s.mission3={phase:'complete'};s.mission4={phase:'setup'};
 s.hsec={employee:null,assets:[]};
 return s;
};
test('V100 role disclosure: four priorities visible, all original roles retained',()=>{
 const s=setup(),before=JSON.stringify(s);
 const html=renderPersonnelPremium(s,'admin','adm-camila-rojas',ico);
 assert(html.includes('class="pvRolesMore"'));
 assert(html.includes('ROLES PRINCIPALES'));
 assert(html.includes('Ver todos los roles'));
 assert.equal((html.match(/data-pv-role="/g)||[]).length,PERSONNEL_GROUPS.length);
 const primary=html.match(/<nav class="pvRoles"[^>]*>([\s\S]*?)<\/nav>/)?.[1]||'';
 assert.equal((primary.match(/data-pv-role="/g)||[]).length,4);
 assert(primary.includes('data-pv-role="admin"'));
 assert(primary.includes('data-pv-role="tecnicoDrillco"'));
 assert.equal(JSON.stringify(s),before);
});

test('V100 profiles: original illustrations, three candidate cards, icon-only skills and one hire action',()=>{
 const html=renderPersonnelPremium(setup(),'admin','adm-camila-rojas',ico);
 assert.equal((html.match(/class="pvCandidate /g)||[]).length,3);
 assert.equal((html.match(/class="pvPortraitImage"/g)||[]).length,5);
 for(const id of ['adm-camila-rojas','adm-matias-torres','adm-sofia-ibarra']){
  assert(html.includes('src="./assets/npc-portraits-v80/'+id+'.svg"'),id);
 }
 assert.equal((html.match(/class="pvCandidateSkill"/g)||[]).length,9);
 assert.equal((html.match(/class="pvQuickSkill"/g)||[]).length,3);
 assert(html.includes('class="pvMoreDetails"'));
 assert(html.includes('data-pv-detail-tab="desarrollo"'));
 assert(html.includes('data-pv-detail-tab="salario"'));
 assert(html.includes('data-pv-detail-tab="historial"'));
 assert.equal((html.match(/data-pv-hire /g)||[]).length,1);
 assert(html.includes('Salario por turno · propuesto'));
 assert(html.includes('data-pv-team-open'));
});

test('V100 roster: three visible cells, native scroll, capacity is still mission-authored',()=>{
 const s=setup(),original=JSON.stringify(s);
 const html=renderPersonnelPremium(s,'admin','adm-camila-rojas',ico);
 assert.equal(staffPageSize,3);
 assert(html.includes('class="pvTeamViewport"'));
 assert(html.includes('class="pvTeamList"'));
 assert(html.includes('data-pv-team-scroll="-1"'));
 assert(html.includes('data-pv-team-scroll="1"'));
 assert(html.includes('class="pvTeamPage"'));
 assert.equal((html.match(/class="pvTeamSlot vacant"/g)||[]).length,personnelCapacity(s));
 assert(html.includes('1 / '+staffPageTotal(personnelCapacity(s))));
 assert.equal(staffPageTotal(1),1);
 assert.equal(staffPageTotal(3),1);
 assert.equal(staffPageTotal(4),2);
 assert.equal(staffPageTotal(6),2);
 assert.equal(staffCurrentPage(0,480,6),1);
 assert.equal(staffCurrentPage(480,480,6),2);
 assert.equal(JSON.stringify(s),original);
});

test('V100 pictures: never distort or apply nearest-neighbour to character faces',()=>{
 const css=read('dist/chapter/personnel-compact-v100.css');
 const html=read('dist/index.html');
 const src=read('dist/chapter/personnel-premium-v76.mjs');
 for(const key of [
  'object-fit:contain!important','image-rendering:auto!important',
  'object-position:center center!important','transform:none!important',
  'background-image:none!important','pvQuickSkills',
  '.pvTeamViewport .pvTeamSlot','scroll-snap-type:x mandatory!important'
 ])assert(css.includes(key),key);
 assert(!/image-rendering:\s*(pixelated|crisp-edges)/i.test(css));
 assert(src.includes("const width=art?230:300,height=art?260:370"));
 assert(html.includes('personnel-compact-v100.css?v=100'));
 const a=html.indexOf('personnel-surface-v88.css');
 const b=html.indexOf('personnel-compact-v100.css');
 assert(a>=0&&b>a,'V100 must load last');
 for(const id of ['adm-camila-rojas','adm-matias-torres','adm-sofia-ibarra']){
  const asset=read('dist/assets/npc-portraits-v80/'+id+'.svg');
  assert(asset.includes('viewBox="0 0 230 260"'));
 }
});

test('V100 long-term vacancy bonuses are not invented or added to saves',()=>{
 const src=read('dist/chapter/personnel-premium-v76.mjs');
 const pager=read('dist/chapter/personnel-v100-interactions.mjs');
 assert(src.includes('Math.max(count,personnelCapacity(s))'));
 assert(!pager.includes('localStorage'));
 assert(!pager.includes('save('));
 assert(!pager.includes('cash='));
 assert(!pager.includes('missions='));
});
