import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {renderPersonnelPremium} from '../dist/chapter/personnel-premium-v76.mjs';
import {candidatesForRole} from '../dist/chapter/personnel-candidates-v76.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ico=n=>'<span>'+n+'</span>';
const setup=()=>{const s=newGame('es','operator01');s.cash=32000;s.office={status:'built',level:2};s.mission3={phase:'setup'};s.hsec={employee:{id:'hsec01',level:1},assets:[]};return s;};
test('V80: real per-person portrait frames keep intrinsic aspect-ratio',()=>{
 for(const id of ['adm-camila-rojas','adm-matias-torres','adm-sofia-ibarra']){
  const svg=read('dist/assets/npc-portraits-v80/'+id+'.svg');
  assert(svg.includes('viewBox="0 0 230 260"'),id);
  assert(svg.includes('data:image/webp;base64,'),id);
  assert(!/<text\b|DRILLCO|PUMA|®|logo/i.test(svg),id);
 }
 const html=renderPersonnelPremium(setup(),'admin','adm-camila-rojas',ico);
 assert.equal((html.match(/class="pvPortraitImage"/g)||[]).length,5);
 assert(html.includes('src="./assets/npc-portraits-v80/adm-camila-rojas.svg"'));
 assert(html.includes('src="./assets/npc-portraits-v80/adm-matias-torres.svg"'));
 assert(html.includes('src="./assets/npc-portraits-v80/adm-sofia-ibarra.svg"'));
 assert(html.includes('data-pv-detail-tab="ficha"'));
 assert(html.includes('data-pv-detail-tab="salario"'));
});
test('V80: all four profile tabs render actual differing content without changing state',()=>{
 const s=setup(),snapshot=JSON.stringify(s);
 for(const [tab,expected] of [['ficha','NIVEL INICIAL'],['desarrollo','Desarrollo de habilidades'],['salario','Condiciones económicas'],['historial','Historial del personaje']]){
  const html=renderPersonnelPremium(s,'admin',candidatesForRole('admin')[0].id,ico,'recruit',tab);
  assert(html.includes(expected),tab);
  assert(html.includes('data-pv-hire'),tab);
  assert.equal(JSON.stringify(s),snapshot);
 }
});
test('V80: sound control only in settings; cinematic CSS applied after V76',()=>{
 const game=read('dist/chapter/game.mjs'),faena=read('dist/chapter/faena-center.mjs'),
  css=read('dist/chapter/visual-polish-v80.css'),index=read('dist/index.html');
 assert(game.includes('id="uiVolumeSetting"'));
 assert(game.includes("$('#uiVolumeSetting').oninput="));
 assert(game.includes("localStorage.setItem('drillrun-ui-volume-v76'"));
 assert(!faena.includes('data-pv-volume'));
 assert(!faena.includes('volumeControl'));
 assert(faena.includes('pvScreenIdentity'));
 assert(faena.includes('b.dataset.pvDetailTab'));
 assert(css.includes('#startScreen .startBrand'));
 assert(css.includes('#loading .loadCard .wordmark'));
 assert(css.includes('object-fit:cover'));
 assert(css.includes('.pvCandidate.selected'));
 assert(css.includes('max-height:500px'));
 assert(index.indexOf('visual-polish-v80.css')>index.indexOf('personnel-premium-v76.css'));
});
