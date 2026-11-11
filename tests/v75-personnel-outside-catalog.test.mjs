import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {catalogCategories,catalogProducts} from '../dist/chapter/construction-catalog.mjs';
import {HSEC_ASSETS} from '../dist/hsec/catalog.mjs';
import {ROLES,canHire} from '../dist/mission3/personnel.mjs';
import {renderM3App} from '../dist/mission3/phone-apps.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const categories=['infrastructure','equipment','vehicles','mobility','boundaries','lighting','emergencies'];
test('V75: purchasing catalog only has seven physical product/construction categories',()=>{
 assert.deepEqual(catalogCategories('es').map(x=>x.id),categories);
 assert.equal(catalogCategories('es').at(-1).label,'Seguridad');
 const s=newGame('es','operator01');
 const products=catalogProducts(s,key=>String(key));
 assert(products.length>0);
 assert(products.every(p=>p.kind!=='personnel'&&p.category!=='management'));
 assert(products.some(p=>p.category==='emergencies'));
 for(const asset of HSEC_ASSETS.filter(a=>a.category==='emergencies'))assert(products.find(p=>p.id===asset.id));
});
test('V75: categories and product integrity survive all five mission states without side effects',()=>{
 for(let i=0;i<5;i++){
  const s=newGame('es','operator01');
  if(i>=1){s.chapterCompletedAt=1;s.office={status:'built',level:2};s.hsec={completedAt:1,assets:[]};}
  if(i>=2)s.mission3={phase:'workshop'};
  if(i>=3)s.mission4={phase:'complete'};
  if(i>=4)s.mission5={status:'operational'};
  const old=JSON.stringify(s);
  assert.deepEqual(catalogCategories('es').map(x=>x.id),categories);
  const products=catalogProducts(s,key=>String(key));
  assert(products.every(p=>categories.includes(p.category)));
  assert(!products.some(p=>p.id.startsWith('role-')));
  assert(products.some(p=>p.category==='emergencies'));
  assert.equal(JSON.stringify(s),old);
 }
});
test('V75: actual admin hiring and staff roster remain accessible from independent Personal window',()=>{
 const s=newGame('es','operator01');
 s.cash=10000;
 s.office={status:'built',level:2};
 s.hsec={assets:[{id:'shed-1',type:'shed',status:'built'}]};
 s.mission3={phase:'workshop'};
 assert(ROLES.some(r=>r.id==='admin'));
 assert.equal(canHire(s,'admin'),null);
 const html=renderM3App('m3-personnel',s,key=>key,n=>'🪙 '+n,name=>name,{});
 assert(html.includes('data-hire="admin"'));
 assert(html.includes('Contratar'));
 const faena=read('dist/chapter/faena-center.mjs'),game=read('dist/chapter/game.mjs');
 assert(faena.includes("case 'personnel':"));
 assert(faena.includes("m3('m3-personnel')"));
 assert(faena.includes("['hire','hire']"));
 assert(game.includes("if(nav==='m3-personnel'){openFaena('personnel');return;}"));
 assert(game.includes("phoneUI.onM3Action?.(type,value)"));
});
test('V75: no hidden purchase paths to Personnel in the catalog',()=>{
 const builder=read('dist/chapter/builder-ui.mjs');
 const source=read('dist/chapter/construction-catalog.mjs');
 assert(!source.includes("kind:'personnel'"));
 assert(!builder.includes("if(p.kind==='personnel')"));
 assert(builder.includes("if(p.kind==='workshop')return this.onCatalogAction?.('buildWorkshop')"));
 assert(builder.includes("this.hsec?.purchaseFixed(p.id)"));
});
