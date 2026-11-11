import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {catalogCategories,catalogProducts} from '../dist/chapter/construction-catalog.mjs';
import {HSEC_CATEGORIES,HSEC_ASSETS} from '../dist/hsec/catalog.mjs';
const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const expected=['infrastructure','equipment','vehicles','mobility','boundaries','lighting','emergencies','management'];
test('V74: all 8 existing catalog tabs are defined, including Seguridad and Personal',()=>{
 const cats=catalogCategories('es');
 assert.deepEqual(cats.map(x=>x.id),expected);
 assert.deepEqual(cats.slice(-2).map(x=>x.label),['Seguridad','Personal']);
 assert.deepEqual(HSEC_CATEGORIES.map(x=>x.id),expected);
 for(const c of cats){assert(c.icon,'Missing icon for '+c.id);}
});
test('V74: 8 categories stay in the same order in M1, M2, M3, M4 and M5',()=>{
 const chapterStates=Array.from({length:5},(_,i)=>{
  const s=newGame('es','operator01');
  if(i>=1){s.chapterCompletedAt=1;s.office={status:'built',level:2};s.hsec={completedAt:1};}
  if(i>=2)s.mission3={phase:'workshop'};
  if(i>=3)s.mission4={phase:'complete'};
  if(i>=4)s.mission5={phase:'operational'};
  return s;
 });
 for(let i=0;i<chapterStates.length;i++){
  const before=JSON.stringify(chapterStates[i]);
  const cats=catalogCategories(chapterStates[i].lang);
  assert.deepEqual(cats.map(x=>x.id),expected,`M${i+1}: category tabs disappeared`);
  const products=catalogProducts(chapterStates[i],key=>String(key));
  assert(products.length>0);
  for(const p of products){
   assert(expected.includes(p.category),`unknown category in M${i+1}: ${p.id}/${p.category}`);
  }
  assert(products.some(p=>p.category==='emergencies'),`M${i+1} security products missing`);
  assert(products.some(p=>p.category==='management'),`M${i+1} personnel products missing`);
  assert.equal(JSON.stringify(chapterStates[i]),before,`M${i+1} browsing unexpectedly changes state`);
 }
});
test('V74: management and safety use original roles/HSEC definitions, not fabricated items',()=>{
 const safety=HSEC_ASSETS.filter(a=>a.category==='emergencies');
 assert(safety.length>=1);
 const catalog=catalogProducts(newGame('es','operator01'),key=>String(key));
 for(const p of catalog.filter(p=>p.category==='emergencies'))assert(p.kind==='hsec');
 for(const p of catalog.filter(p=>p.category==='management'))assert(p.kind==='personnel'||p.kind==='hsec');
 assert(catalog.find(x=>x.id==='office'));
 assert(catalog.find(x=>x.id==='shed'));
});
test('V74: mobile can swipe, desktop can wheel, arrows are visible, keyboard tabs work',()=>{
 const view=source('dist/chapter/catalog-view.mjs');
 const css=source('dist/chapter/catalog-navigation-v74.css');
 const html=source('dist/index.html');
 assert(view.includes('id="catalogCategoryPrevious"'));
 assert(view.includes('id="catalogCategoryNext"'));
 assert(view.includes('aria-label="Categorías del catálogo"'));
 assert(view.includes("categoryNav.addEventListener('wheel'"));
 assert(view.includes("categoryNav.addEventListener('keydown'"));
 assert(view.includes("touch-action:pan-x")||css.includes("touch-action:pan-x"));
 assert(view.includes("activeCategory=categoryNav.querySelector('[aria-selected=\"true\"]')"));
 assert(view.includes('categoryNav.scrollLeft=this.categoryScrollLeft'));
 assert(view.includes("this.categoryScrollLeft=categoryNav.scrollLeft"));
 assert(css.includes('.catalogCategoryStep'));
 assert(css.includes('overflow')||css.includes('scroll-behavior'));
 assert(html.includes('catalog-navigation-v74.css?v=74'));
});
test('V74: no catalog product state, price or purchasing handlers were changed',()=>{
 const builder=source('dist/chapter/builder-ui.mjs');
 const view=source('dist/chapter/catalog-view.mjs');
 assert(builder.includes("onPurchase:p=>"));
 assert(builder.includes("if(p.kind==='workshop')return this.onCatalogAction?.('buildWorkshop')"));
 assert(builder.includes("if(p.kind==='personnel')return this.onCatalogAction?.('hire',p.model.id)"));
 assert(view.includes("this.host.querySelector('#catalogPurchase')?.addEventListener('click',purchaseHandler)"));
});
