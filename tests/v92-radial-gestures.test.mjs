import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {installSemiRadialDock} from '../dist/chapter/semi-radial-dock-v90.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

function gestureHarness(){
 const make=(name='node')=>({
  name,attrs:{},dataset:{},style:{setProperty(k,v){this[k]=v;}},handlers:{},tabIndex:-1,
  addEventListener(k,fn){(this.handlers[k]??=[]).push(fn);},
  removeEventListener(k,fn){this.handlers[k]=(this.handlers[k]||[]).filter(f=>f!==fn);},
  setAttribute(k,v){this.attrs[k]=v;},
  emit(k,p={}){
   const e={pointerId:7,pointerType:'touch',button:0,clientX:253,clientY:152,
    cancelable:true,preventDefault(){this.defaultPrevented=true;},target:this,...p};
   for(const fn of this.handlers[k]||[])fn(e);
   return e;
  }
 });
 const root=make('root'),stage=make('stage'),hub=make('hub'),choices=make('choices');
 root.classList={set:new Set(),add(k){this.set.add(k);},
  remove(k){this.set.delete(k);},
  toggle(k,v){v?this.set.add(k):this.set.delete(k);},
  contains(k){return this.set.has(k);}};
 root.contains=()=>true;
 root.remove=()=>{root.removed=true;};
 stage.getBoundingClientRect=()=>({left:0,top:0,width:440,height:285});
 const names=['catalog','production','logistics','workshop','fleet','contracts','personnel','safety','headquarters','overview'];
 const orbits=names.map((id,i)=>{
  const n=make('orbit'+i),button=make('option'+i);
  button.dataset.semiId=id;
  n.querySelector=()=>button;
  button.closest=q=>q.includes('.dr90Orbit')?n:q.includes('.dr90Option')?button:null;
  return n;
 });
 root.querySelector=q=>({'.dr90Stage':stage,'.dr90Hub':hub,'.dr90Choices':choices})[q]||null;
 root.querySelectorAll=q=>q==='.dr90Orbit'?orbits:[];
 const sector=make('sector');
 sector.closest=q=>q.includes('.dr90Sector')?sector:null;
 const anchor=make('bottomNav');
 anchor.classList={contains:()=>false};
 anchor.insertAdjacentElement=(where,element)=>{assert.equal(where,'afterend');assert.equal(element,root);};
 const world=make('window');
 Object.assign(world,{innerWidth:1536,innerHeight:708});
 const old={window:globalThis.window,document:globalThis.document,
  ResizeObserver:globalThis.ResizeObserver,MutationObserver:globalThis.MutationObserver};
 globalThis.window=world;
 globalThis.document={
  getElementById:()=>null,createElement:()=>root,
  body:{classList:{contains:()=>false}},
  addEventListener(){},removeEventListener(){}
 };
 globalThis.ResizeObserver=class{observe(){}disconnect(){}};
 globalThis.MutationObserver=class{observe(){}disconnect(){}};
 const chosen=[],sounds=[];
 const api=installSemiRadialDock({anchor,onNavigate:id=>{chosen.push(id);return true;},
  onFeedback:id=>sounds.push(id)});
 const restore=()=>{api.destroy();Object.assign(globalThis,old);};
 return {root,stage,hub,choices,orbits,sector,world,chosen,sounds,api,restore};
}

test('V94: finger drag follows actual polar angle, snaps without inertia',()=>{
 const x=gestureHarness();
 try{
  x.hub.emit('click');
  assert.equal(x.api.isOpen,true);
  assert.equal(x.orbits.filter(n=>n.querySelector('button').tabIndex===0).length,4);
  x.stage.emit('pointerdown',{target:x.sector});
  x.world.emit('pointermove',{clientX:282,clientY:118});
  assert.equal(x.api.selected,'overview');
  assert.equal(x.root.classList.contains('is-dragging'),true);
  x.world.emit('pointerup',{clientX:282,clientY:118});
  assert.equal(x.root.classList.contains('is-dragging'),false);
  assert.equal(x.api.selected,'overview');
  assert.equal(x.api.isOpen,true);
  assert.deepEqual(x.chosen,[]);
  assert(x.sounds.includes('skill'));
 }finally{x.restore();}
});

test('V94: quick swipe, tap, and full revolution preserve ten original routes',()=>{
 const x=gestureHarness();
 try{
  x.hub.emit('click');
  x.stage.emit('pointerdown',{target:x.sector});
  x.world.emit('pointerup',{clientX:282,clientY:118});
  assert.equal(x.api.selected,'overview');
  x.api.rotate(1);
  assert.equal(x.api.selected,'catalog');
  for(let i=0;i<10;i++)x.api.rotate(1);
  assert.equal(x.api.selected,'catalog','ten categories loop indefinitely');
  x.api.select();
  assert.deepEqual(x.chosen,['catalog']);
  assert.equal(x.api.isOpen,false);
 }finally{x.restore();}
});

test('V94: direct tap stays selectable; cancelled gesture does not move category',()=>{
 const x=gestureHarness();
 try{
  x.hub.emit('click');
  x.stage.emit('pointerdown',{target:x.orbits[0].querySelector('button')});
  x.world.emit('pointerup',{clientX:253,clientY:152});
  x.choices.emit('click',{target:x.orbits[0].querySelector('button')});
  assert.deepEqual(x.chosen,['catalog']);
  x.hub.emit('click');
  x.stage.emit('pointerdown',{target:x.sector});
  x.world.emit('pointercancel',{clientX:253,clientY:152});
  assert.equal(x.api.selected,'catalog');
  assert.equal(x.api.isOpen,true);
 }finally{x.restore();}
});

test('V94: responsive safe margins, absence of arrows, event handler cleanup',()=>{
 const x=gestureHarness();
 try{
  assert(x.root.style['--dr94-dock-width']);
  assert(x.root.style['--dr94-dock-height']);
  assert.equal(x.orbits.filter(n=>n.dataset.step==='2').length,1);
  assert.equal(x.orbits.filter(n=>n.dataset.step==='-1').length,1);
  assert.equal(x.orbits.filter(n=>n.dataset.step==='0').length,1);
  const src=read('dist/chapter/semi-radial-dock-v90.mjs');
  const css=read('dist/chapter/semi-radial-command-v90.css');
  assert(src.includes("window.addEventListener('pointermove',moveDrag"));
  assert(src.includes("window.removeEventListener('pointermove',moveDrag"));
  assert(!src.includes('dr90Prev')&&!src.includes('dr90Next'));
  assert(css.includes('--dr94-safe-bottom'));
  assert(css.includes('#hud #semiRadialDock .dr90Arrows{display:none!important}'));
 }finally{x.restore();}
 assert(x.root.removed);
 assert.equal(x.world.handlers.pointermove.length,0);
 assert.equal(x.world.handlers.pointerup.length,0);
});
