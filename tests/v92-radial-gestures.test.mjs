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
   const e={pointerId:7,pointerType:'touch',button:0,clientX:183,clientY:251,
    cancelable:true,preventDefault(){this.defaultPrevented=true;},target:this,...p};
   for(const fn of this.handlers[k]||[])fn(e);
   return e;
  }
 });
 const root=make('root'),stage=make('stage'),hub=make('hub'),choices=make('choices');
 const joystick=make('joystick'),objective=make('objective'),doc=make('document');
 const actionSymbol={dataset:{icon:'interact-focus'},innerHTML:'',name:'actionSymbol'};
 doc.querySelector=query=>query==='#handButton [data-icon]'?actionSymbol:null;
 joystick.getBoundingClientRect=()=>({left:0,top:0,width:100,height:100});
 objective.classList={set:new Set(),add(k){this.set.add(k);},remove(k){this.set.delete(k);},contains(k){return this.set.has(k);}};
 root.classList={set:new Set(),add(k){this.set.add(k);},
  remove(k){this.set.delete(k);},
  toggle(k,v){v?this.set.add(k):this.set.delete(k);},
  contains(k){return this.set.has(k);}};
 root.contains=()=>true;
 root.remove=()=>{root.removed=true;};
 stage.getBoundingClientRect=()=>({left:0,top:0,width:550,height:470});
 const names=['overview','catalog','production','logistics','personnel','safety','workshop','fleet','contracts','headquarters'];
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
 sector.classList={contains:k=>k==='dr90Sector--center'};
 const anchor=make('bottomNav');
 anchor.classList={contains:()=>false};
 anchor.insertAdjacentElement=(where,element)=>{assert.equal(where,'afterend');assert.equal(element,root);};
 const world=make('window');
 Object.assign(world,{innerWidth:1536,innerHeight:708});
 const old={window:globalThis.window,document:globalThis.document,
  ResizeObserver:globalThis.ResizeObserver,MutationObserver:globalThis.MutationObserver};
 globalThis.window=world;
 doc.getElementById=id=>id==='joystick'?joystick:id==='objective'?objective:null;
 doc.createElement=()=>root;
 doc.body={dataset:{phase:'play'},classList:{set:new Set(),contains(k){return this.set.has(k);},add(k){this.set.add(k);},remove(k){this.set.delete(k);}}};
 globalThis.document=doc;
 globalThis.ResizeObserver=class{observe(){}disconnect(){}};
 globalThis.MutationObserver=class{observe(){}disconnect(){}};
 const chosen=[],sounds=[];
 const api=installSemiRadialDock({anchor,onNavigate:id=>{chosen.push(id);return true;},
  onFeedback:id=>sounds.push(id)});
 const restore=()=>{api.destroy();Object.assign(globalThis,old);};
 return {root,stage,hub,choices,orbits,sector,world,document:doc,joystick,objective,actionSymbol,chosen,sounds,api,restore};
}

test('V94: finger drag follows actual polar angle, snaps without inertia',()=>{
 const x=gestureHarness();
 try{
  x.hub.emit('click');
  assert.equal(x.api.isOpen,true);
  assert.equal(x.orbits.filter(n=>n.querySelector('button').tabIndex===0).length,6);
  x.stage.emit('pointerdown',{target:x.sector});
  x.world.emit('pointermove',{clientX:292,clientY:145});
  assert.equal(x.api.selected,'overview');
  assert.equal(x.root.classList.contains('is-dragging'),true);
  x.world.emit('pointerup',{clientX:292,clientY:145});
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
  x.world.emit('pointerup',{clientX:292,clientY:145});
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
  x.world.emit('pointerup',{clientX:183,clientY:251});
  x.choices.emit('click',{target:x.orbits[0].querySelector('button')});
  assert.deepEqual(x.chosen,['overview']);
  x.hub.emit('click');
  x.stage.emit('pointerdown',{target:x.sector});
  x.world.emit('pointercancel',{clientX:183,clientY:251});
  assert.equal(x.api.selected,'catalog');
  assert.equal(x.api.isOpen,true);
 }finally{x.restore();}
});

test('V94: whole painted sector is tappable without dragging its label',()=>{
 const x=gestureHarness();
 try{
  x.hub.emit('click');
  x.stage.emit('pointerdown',{target:x.sector});
  x.world.emit('pointerup');
  assert.deepEqual(x.chosen,['catalog']);
  assert.equal(x.api.isOpen,false);
 }finally{x.restore();}
});


test('V95: six initial buttons match the approved order and all are direct actions',()=>{
 const x=gestureHarness();
 try{
  x.hub.emit('click');
  const visible=x.orbits.filter(n=>n.querySelector('button').tabIndex===0)
   .sort((a,b)=>Number(a.dataset.step)-Number(b.dataset.step));
  assert.deepEqual(visible.map(n=>n.querySelector('button').dataset.semiId),
   ['overview','catalog','production','logistics','personnel','safety']);
  assert.equal(visible.length,6);
  x.choices.emit('click',{target:x.orbits[4].querySelector('button')});
  assert.deepEqual(x.chosen,['personnel'],'a single click on a noncentral button navigates');
  assert.equal(x.api.isOpen,false);
 }finally{x.restore();}
});

test('V94: responsive safe margins, absence of arrows, event handler cleanup',()=>{
 const x=gestureHarness();
 try{
  assert(x.root.style['--dr94-dock-width']);
  assert(x.root.style['--dr94-dock-height']);
  assert.equal(x.orbits.filter(n=>n.dataset.step==='2').length,1);
  assert.equal(x.orbits.filter(n=>n.dataset.step==='3').length,1);
  assert.equal(x.orbits.filter(n=>n.dataset.step==='4').length,1);
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

test('V98: joystick travel retracts the mission and closes the radial without blocking input',()=>{
 const x=gestureHarness();
 try{
  x.hub.emit('click');
  assert.equal(x.api.isOpen,true);
  x.joystick.emit('pointerdown',{clientX:50,clientY:50});
  assert.equal(x.api.isOpen,true,'touch at neutral joystick center is not travel');
  assert.equal(x.objective.classList.contains('collapsed'),false);
  x.joystick.emit('pointermove',{clientX:72,clientY:50});
  assert.equal(x.api.isOpen,false,'first actual travel closes radial');
  assert.equal(x.objective.classList.contains('collapsed'),true,'mission accordion auto-collapses');
  x.joystick.emit('pointerup',{clientX:72,clientY:50});
  // Stopping must not make either panel reopen automatically.
  assert.equal(x.api.isOpen,false);
  assert.equal(x.objective.classList.contains('collapsed'),true);
 }finally{x.restore();}
});

test('V98: keyboard travel cleans UI, but typing and foreground panels do not',()=>{
 const x=gestureHarness();
 try{
  x.hub.emit('click');
  x.document.emit('keydown',{key:'w',target:{closest:()=>true}});
  assert.equal(x.api.isOpen,true,'typing is not a gameplay movement');
  assert.equal(x.objective.classList.contains('collapsed'),false);
  x.document.emit('keydown',{key:'ArrowUp',target:x.document});
  assert.equal(x.api.isOpen,false);
  assert.equal(x.objective.classList.contains('collapsed'),true);
  x.objective.classList.remove('collapsed');
  x.hub.emit('click');
  x.document.body.classList.add('phoneOpen');
  x.document.emit('keydown',{key:'w'});
  assert.equal(x.objective.classList.contains('collapsed'),false,'no reaction inside phone');
 }finally{x.restore();}
});

test('V98: movement listeners are cleaned up when radial is destroyed',()=>{
 const x=gestureHarness();
 x.restore();
 for(const name of ['pointerdown','pointermove','pointerup','pointercancel','lostpointercapture'])
  assert.equal((x.joystick.handlers[name]||[]).length,0,name);
 assert.equal((x.document.handlers.keydown||[]).length,0);
});

test('V99: mission accordion opens and closes independently while radial stays open',()=>{
 const x=gestureHarness();
 try{
  const toggle={name:'objToggle'};
  x.objective.contains=target=>target===x.objective||target===toggle;
  x.root.contains=target=>target===x.root||target===x.hub;
  x.hub.emit('click');
  assert.equal(x.api.isOpen,true);
  x.objective.classList.add('collapsed');
  x.document.emit('pointerdown',{target:toggle});
  x.objective.classList.remove('collapsed');
  assert.equal(x.api.isOpen,true,'mission opening must not dismiss radial');
  x.document.emit('pointerdown',{target:x.objective});
  x.objective.classList.add('collapsed');
  assert.equal(x.api.isOpen,true,'mission collapsing must not dismiss radial');
  // The existing outside-dismiss rule still applies elsewhere.
  x.document.emit('pointerdown',{target:{name:'otherHUD'}});
  assert.equal(x.api.isOpen,false,'unrelated outside click still dismisses radial');
 }finally{x.restore();}
});

test('V99: after manual accordion open, joystick movement still closes both',()=>{
 const x=gestureHarness();
 try{
  const toggle={name:'objToggle'};
  x.objective.contains=target=>target===x.objective||target===toggle;
  x.root.contains=target=>target===x.root||target===x.hub;
  x.hub.emit('click');
  x.objective.classList.remove('collapsed');
  x.document.emit('pointerdown',{target:toggle});
  assert.equal(x.api.isOpen,true);
  x.joystick.emit('pointerdown',{clientX:50,clientY:50});
  assert.equal(x.api.isOpen,true,'neutral touch does not hide panels');
  x.joystick.emit('pointermove',{clientX:77,clientY:52});
  assert.equal(x.api.isOpen,false,'movement still closes the wheel');
  assert.equal(x.objective.classList.contains('collapsed'),true,'movement still retracts mission');
 }finally{x.restore();}
});

test('V99: action glyph swaps crosshair for simple hand, but keeps original host button',()=>{
 const x=gestureHarness();
 try{
  assert.equal(x.actionSymbol.dataset.icon,'hand');
  assert.match(x.actionSymbol.innerHTML,/<svg/);
  assert.match(x.actionSymbol.innerHTML,/<path/);
  const css=read('dist/chapter/semi-radial-command-v90.css');
  assert(css.includes('V99 · PUMA burgundy 3D contextual action'));
  assert(css.includes('#hud #handButton.available:not(:disabled)'));
  assert(css.includes('#hud #handButton:disabled'));
  assert(css.includes('opacity:1!important'));
  assert(css.includes('#b72948'));
  assert(css.includes('#501e32'));
 }finally{x.restore();}
});
