import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SEMI_RADIAL_ITEMS,semiRadialWrap,semiRadialStep,installSemiRadialDock} from '../dist/chapter/semi-radial-dock-v83.mjs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('V83 · ten routes are unique, 3 sharp + 2 ghost slots, wrap works',()=>{
 assert.equal(SEMI_RADIAL_ITEMS.length,10);
 assert.equal(new Set(SEMI_RADIAL_ITEMS.map(x=>x.id)).size,10);
 for(let selected=0;selected<SEMI_RADIAL_ITEMS.length;selected++){
  const steps=SEMI_RADIAL_ITEMS.map((_,i)=>semiRadialStep(i,selected,SEMI_RADIAL_ITEMS.length));
  assert.equal(steps.filter(x=>['-1','0','1'].includes(x)).length,3);
  assert.equal(steps.filter(x=>['-2','2'].includes(x)).length,2);
  assert.equal(steps.filter(x=>x==='0').length,1);
 }
 assert.equal(semiRadialWrap(-1,10),9);
 assert.equal(semiRadialWrap(10,10),0);
 assert.equal(semiRadialStep(9,0,10),'-1');
 assert.equal(semiRadialStep(0,9,10),'1');
 assert.equal(semiRadialStep(7,0,10),'off');
});
test('V83 · actual gesture/display rotation and SFX connect without game mutations',()=>{
 const g=globalThis,oldDoc=g.document,oldObs=g.MutationObserver;
 const make=()=>({
  dataset:{},attrs:{},handlers:{},tabIndex:-1,
  setAttribute(name,value){this.attrs[name]=value;},
  addEventListener(name,fn){(this.handlers[name]??=[]).push(fn);},
  emit(name,values={}){let e={button:0,pointerType:'touch',clientX:100,
    preventDefault(){this.defaultPrevented=true;},target:this,...values};
   for(const fn of this.handlers[name]??[])fn(e);return e;}
 });
 const items=SEMI_RADIAL_ITEMS.map(item=>Object.assign(make(),{dataset:{semiId:item.id}})),trigger=make(),fan=make(),progress={textContent:''};
 const root=Object.assign(make(),{
  id:'',innerHTML:'',style:{setProperty(){}},
  classList:{list:new Set(),add(x){this.list.add(x);},remove(x){this.list.delete(x);},toggle(x,on){on?this.add(x):this.remove(x);},contains(x){return this.list.has(x);}},
  querySelector(q){return q==='.drSemiTrigger'?trigger:q==='.drSemiFan'?fan:q==='.drSemiProgress'?progress:null;},
  querySelectorAll(q){return q==='.drSemiItem'?items:[];},
  contains(target){return target===this||target===trigger||target===fan||items.includes(target);},
  remove(){this.removed=true;}
 });
 const anchor=make();anchor.classList={contains:()=>false};
 anchor.insertAdjacentElement=(where,element)=>{assert.equal(where,'afterend');assert.equal(element,root);};
 g.document={getElementById:()=>null,createElement:()=>root,
  activeElement:null,body:{classList:{contains:()=>false},addEventListener(){}},
  addEventListener(){},removeEventListener(){}};
 g.MutationObserver=class{observe(){}disconnect(){}};
 const sound=[],chosen=[];
 try{
  const api=installSemiRadialDock({anchor,onNavigate:id=>{chosen.push(id);return true;},onFeedback:x=>sound.push(x)});
  assert(api);
  assert.equal(api.isOpen,false);
  assert.equal(api.selected,'logistics');
  trigger.emit('click');
  assert.equal(api.isOpen,true);
  assert.equal(items.filter(x=>x.tabIndex===0).length,3);
  assert.equal(items.filter(x=>x.dataset.step==='-2'||x.dataset.step==='2').length,2);
  assert.equal(items.filter(x=>x.attrs['aria-hidden']==='false').length,3);
  api.rotate(1);
  assert.equal(api.selected,'workshop');
  // Swipe left on button opens and rotates to the next entry; synthesized click cannot close it.
  trigger.emit('pointerdown',{clientX:100});
  trigger.emit('pointermove',{clientX:40});
  trigger.emit('pointerup',{clientX:40});
  trigger.emit('click');
  assert.equal(api.isOpen,true);
  assert.equal(api.selected,'fleet');
  api.select();
  assert.equal(api.isOpen,false);
  assert.deepEqual(chosen,['fleet']);
  assert(sound.includes('select')&&sound.includes('skill')&&sound.includes('confirm'));
  // A normal click reopens without needing a long hold.
  trigger.emit('click');
  assert.equal(api.isOpen,true);
  api.rotate(-1);
  assert.equal(api.selected,'workshop');
  api.close();
  assert(sound.includes('back'));
  api.destroy();
  assert(root.removed);
 }finally{g.document=oldDoc;g.MutationObserver=oldObs;}
});
test('V83 · dock assets are scoped, shallow, sound obeys shared preferences',()=>{
 const js=read('dist/chapter/semi-radial-dock-v83.mjs');
 const css=read('dist/chapter/semi-radial-dock-v83.css');
 const game=read('dist/chapter/game.mjs');
 const html=read('dist/index.html');
 const sound=read('dist/audio/character-select-feedback-v68.mjs');
 assert(js.includes('setTimeout(()=>')&&js.includes('},290)'));
 assert(js.includes('touchX')&&js.includes('pointermove'));
 assert(js.includes("feedback(open?'select':'back')"));
 assert(js.includes("feedback('skill')"));
 assert(js.includes("feedback('confirm')"));
 assert(css.includes('data-step="-2"')&&css.includes('data-step="2"'));
 assert(css.includes('filter:blur(1.65px)'));
 assert(css.includes('height:112px!important'));
 assert(css.includes('@media(prefers-reduced-motion:reduce)'));
 assert(css.includes('#bottomNav:not(.hidden)+#semiRadialDock'));
 assert(game.includes("import {installSemiRadialDock} from './semi-radial-dock-v83.mjs'"));
 assert(game.includes('installSemiRadialDock({'));
 assert(game.includes("onFeedback:kind=>selectorFeedback.play(kind)"));
 assert(game.includes("original.click()"));
 assert(game.includes("openFaena(id)"));
 assert(html.indexOf('semi-radial-dock-v83.css')>html.indexOf('faena-hub-v82.css'));
 assert(sound.includes("if(!this.enabled())return"));
 assert(sound.includes("drillrun-ui-volume-v76"));
});
