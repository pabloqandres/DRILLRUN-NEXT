import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {FaenaCenterUI} from '../dist/chapter/faena-center.mjs';
const source=path=>readFileSync(new URL('../'+path,import.meta.url));
const ascii=path=>source(path).toString('utf8');
const ico=name=>'<svg data-symbol="'+name+'"></svg>';
const setup=()=>{
 const s=newGame('es','operator01');
 s.cash=37708;s.energy=20;
 s.mission3={phase:'setup'};
 s.orders=[{id:'incoming',status:'dispatched'}];
 s.workshop={status:'built',level:1};
 s.personnel=[{id:'adm-camila-rojas',candidateId:'adm-camila-rojas',role:'admin',name:'Camila Rojas'}];
 return s;
};
test('V82: overview presents 4 unique operations and 4 management routes without a duplicate dock',()=>{
 const s=setup(),before=JSON.stringify(s);
 const view=Object.create(FaenaCenterUI.prototype);
 view.route='overview';view.view='';
 const html=view.pageHtml(s,k=>k,n=>String(n),ico);
 assert(html.includes('class="fcHub"'));
 assert(html.includes('Tu primer contrato'));
 assert(html.includes('RESUMEN OPERATIVO'));
 for(const id of ['production','logistics','workshop','fleet','contracts','personnel','safety','headquarters']){
  assert(html.includes('data-faena-route="'+id+'"'),id);
  assert(html.includes('data-fc-art="'+id+'"'),id);
  assert(html.includes('icons/'+id+'.svg'),id);
 }
 assert.equal((html.match(/class="fcTile /g)||[]).length,8);
 assert.equal((html.match(/class="fcTile fcTile--operation/g)||[]).length,4);
 assert.equal((html.match(/class="fcTile fcTile--management/g)||[]).length,4);
 assert(!html.includes('data-faena-route="patio"')||html.includes('data-fc-stage="5"'));
 assert(!html.includes('faenaFooter'));
 assert(!html.includes('Operación estable'));
 assert.equal(JSON.stringify(s),before);
});
test('V82: eight photo assets are real separate WebP and category SVG icons are original',()=>{
 const names=['production','logistics','workshop','fleet','safety','contracts','personnel','headquarters'];
 const css=ascii('dist/chapter/faena-hub-v82.css');
 for(const name of names){
  const binary=source('dist/assets/faena-v82/'+name+'.webp');
  assert.equal(binary.subarray(0,4).toString('ascii'),'RIFF',name);
  assert.equal(binary.subarray(8,12).toString('ascii'),'WEBP',name);
  assert(binary.length>5000&&binary.length<45000,name);
  const svg=ascii('dist/assets/faena-v82/icons/'+name+'.svg');
  assert(svg.includes('<svg')&&svg.includes('viewBox="0 0 64 64"'),name);
  assert(!/<text\b|DRILLCO|PUMA|®|<image\b/i.test(svg),name);
  assert(css.includes(name+'.webp'),name);
 }
 const more=['hub','mission','orders','energy','team','cash'];
 for(const name of more)assert(ascii('dist/assets/faena-v82/icons/'+name+'.svg').includes('stroke='),name);
 const index=ascii('dist/index.html');
 assert(index.includes('faena-hub-v82.css'));
 assert(index.indexOf('faena-hub-v82.css')>index.indexOf('personnel-polish-v81.css'));
});
test('V82: operational module buttons route to the original controllers',()=>{
 const src=ascii('dist/chapter/faena-center.mjs');
 for(const category of ['production','logistics','workshop','fleet','safety','contracts','personnel','headquarters']){
  assert(src.includes("case '"+category+"'"),category);
 }
 assert(src.includes("if(b.dataset.faenaRoute){this.open(b.dataset.faenaRoute);return;}"));
 assert(src.includes("if(b.dataset.m5Action)"));
 assert(src.includes("if(b.dataset.faenaRecover)"));
 assert(src.includes("if(b.dataset.faenaKit)"));
 assert(src.includes("renderPersonnelPremium(s,this.personnelRole"));
 assert(!/window\.location|fetch\(|XMLHttpRequest/.test(src));
});
test('V82: periodic unchanged overview does not recreate eight image cards',()=>{
 let writes=0,markup='';
 const balance={textContent:''},energy={textContent:''};
 const fake={
  classList:{contains:()=>false},
  get innerHTML(){return markup;},set innerHTML(v){markup=v;writes++;},
  querySelector(sel){
   if(sel==='.fcHub')return writes?{}:null;
   if(sel==='.fcHeaderCash strong')return balance;
   if(sel==='.fcHeaderEnergy strong')return energy;
   if(sel==='.faenaBody')return {scrollTop:0};
   return null;
  }
 };
 const s=setup(),view=Object.create(FaenaCenterUI.prototype);
 Object.assign(view,{host:fake,state:()=>s,translate:()=>x=>x,format:n=>String(n),icon:ico,
  route:'overview',view:'',lastKey:'',pageHtml:()=>'<section class="fcHub">SCENE</section>'});
 view.render();assert.equal(writes,1);
 view.render();view.render();assert.equal(writes,1);
 s.cash+=500;s.energy=17;view.render();
 assert.equal(writes,1,'balance/energy changes do not reload images');
 assert.equal(balance.textContent,'🪙 38.208');
 assert.equal(energy.textContent,'17/20');
 view.pageHtml=()=>'<section class="fcHub">NEW MODULE</section>';view.render();assert.equal(writes,2);
});
