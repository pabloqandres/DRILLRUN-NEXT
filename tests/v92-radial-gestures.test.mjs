import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {installSemiRadialDock,RADIAL_GEOMETRY,radialPoint} from '../dist/chapter/semi-radial-dock-v90.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

function gestureHarness(){
 const listeners=new Map();
 const make=(name='node')=>({
  name,attrs:{},dataset:{},style:{setProperty(){}},handlers:{},tabIndex:-1,
  addEventListener(event,handler){(this.handlers[event]??=[]).push(handler);},
  removeEventListener(event,handler){this.handlers[event]=(this.handlers[event]||[]).filter(f=>f!==handler);},
  setAttribute(k,v){this.attrs[k]=v;},
  emit(type,p={}){
   const e={pointerId:7,pointerType:'touch',button:0,clientX:100,
    cancelable:true,preventDefault(){this.defaultPrevented=true;},
    target:this,...p};
   for(const cb of this.handlers[type]||[])cb(e);
   return e;
  }
 });
 const root=make('root');
 root.style={setProperty(k,v){this[k]=v;}};
 root.getBoundingClientRect=()=>({width:365,height:165});
 root.remove=()=>{root.removed=true;};
 root.classList={state:new Set(),toggle(k,v){v?this.state.add(k):this.state.delete(k);},contains(k){return this.state.has(k);}};
 root.contains=()=>true;
 const stage=make('stage'),hub=make('hub'),prev=make('prev'),next=make('next'),choices=make('choices');
 const orbits=Array.from({length:10},(_,i)=>{
  const node=make('orbit-'+i),button=make('option-'+i);
  button.dataset.semiId=['catalog','production','logistics','workshop','fleet','contracts','personnel','safety','headquarters','overview'][i];
  node.querySelector=()=>button;
  button.closest=q=>q.split(',').some(part=>part.trim()==='.dr90Orbit')?node:q.split(',').some(part=>part.trim()==='.dr90Option')?button:null;
  return node;
 });
 const options=orbits.map(n=>n.querySelector('button'));
 root.querySelector=q=>({
  '.dr90Stage':stage,'.dr90Hub':hub,'.dr90Prev':prev,'.dr90Next':next,'.dr90Choices':choices
 })[q]||null;
 root.querySelectorAll=q=>q==='.dr90Orbit'?orbits:[];
 const sector=make('radial-sector');
 sector.closest=q=>q.includes('.dr90Sector')?sector:null;
 const world=make('window');
 const anchor=make('bottomNav');
 anchor.classList={contains:()=>false};
 anchor.insertAdjacentElement=(direction,item)=>{
  assert.equal(direction,'afterend');assert.equal(item,root);
 };
 const old={
  document:globalThis.document,window:globalThis.window,
  ResizeObserver:globalThis.ResizeObserver,MutationObserver:globalThis.MutationObserver
 };
 globalThis.window=world;
 globalThis.document={
  getElementById:()=>null,
  createElement:()=>root,
  body:{classList:{contains:()=>false}},
  addEventListener(event,callback){(listeners.get(event)||listeners.set(event,[]).get(event)).push(callback);},
  removeEventListener(){},
  activeElement:null
 };
 globalThis.ResizeObserver=class{observe(){}disconnect(){}};
 globalThis.MutationObserver=class{observe(){}disconnect(){}};
 const sound=[],chosen=[];
 const api=installSemiRadialDock({anchor,onNavigate:id=>{chosen.push(id);return true;},onFeedback:name=>sound.push(name)});
 const restore=()=>{api.destroy();Object.assign(globalThis,old);};
 return {api,root,stage,hub,prev,next,choices,options,sector,world,sound,chosen,restore};
}

test('V92 · drag on painted sector rotates even when pointer leaves icon/arc',()=>{
 const x=gestureHarness();
 try{
  x.hub.emit('click');
  assert.equal(x.api.isOpen,true);
  x.stage.emit('pointerdown',{target:x.sector,pointerId:7,clientX:130});
  x.world.emit('pointermove',{pointerId:7,clientX:82});
  assert.equal(x.api.selected,'production');
  x.world.emit('pointerup',{pointerId:7,clientX:82});
  assert.equal(x.api.isOpen,true);
  assert(x.sound.includes('skill'));
 }finally{x.restore();}
});

test('V92 · quick release without pointermove rotates one detent and never selects by accident',()=>{
 const x=gestureHarness();
 try{
  x.hub.emit('click');
  x.stage.emit('pointerdown',{target:x.sector,pointerId:7,clientX:180});
  x.world.emit('pointerup',{pointerId:7,clientX:143});
  assert.equal(x.api.selected,'production');
  assert.deepEqual(x.chosen,[]);
  assert.equal(x.api.isOpen,true);
 }finally{x.restore();}
});

test('V92 · swiping on icon and on sector, and arrows, share the same ten destinations',()=>{
 const x=gestureHarness();
 try{
  x.hub.emit('click');
  x.stage.emit('pointerdown',{target:x.options[0],pointerId:7,clientX:125});
  x.world.emit('pointermove',{pointerId:7,clientX:79});
  x.world.emit('pointerup',{pointerId:7,clientX:79});
  assert.equal(x.api.selected,'production');
  x.next.emit('click');
  assert.equal(x.api.selected,'logistics');
  x.prev.emit('click');
  assert.equal(x.api.selected,'production');
  assert.equal(x.api.isOpen,true);
  x.api.select();
  assert.deepEqual(x.chosen,['production']);
  assert.equal(x.api.isOpen,false);
  assert(x.sound.includes('confirm'));
 }finally{x.restore();}
});

test('V92 · touch-only tap still opens the correct selection; cancelled gestures never rotate',()=>{
 const x=gestureHarness();
 try{
  x.hub.emit('click');
  x.stage.emit('pointerdown',{target:x.options[0],pointerId:7,clientX:120});
  x.world.emit('pointerup',{pointerId:7,clientX:120});
  x.choices.emit('click',{target:x.options[0]});
  assert.deepEqual(x.chosen,['catalog']);
  x.hub.emit('click');
  x.stage.emit('pointerdown',{target:x.sector,pointerId:8,clientX:120});
  x.world.emit('pointercancel',{pointerId:8,clientX:35});
  assert.equal(x.api.selected,'catalog');
 }finally{x.restore();}
});

test('V92 · single authoritative stylesheet lifts the control, with subtle rings and touch hit areas',()=>{
 const css=read('dist/chapter/semi-radial-command-v90.css');
 const src=read('dist/chapter/semi-radial-dock-v90.mjs');
 const html=read('dist/index.html');
 assert(css.includes('bottom:clamp(46px,7dvh,66px)!important'));
 assert(css.includes('bottom:max(38px,env(safe-area-inset-bottom,0px))'));
 assert(css.includes('.dr92Glass'));
 assert(css.includes('.dr92OuterRim'));
 assert(css.includes('.dr92InnerRim'));
 assert(css.includes('.dr90Hub::after'));
 assert(css.includes('pointer-events:visiblePainted!important'));
 assert(css.includes('touch-action:none!important'));
 assert(src.includes("stage.addEventListener('pointerdown'"));
 assert(src.includes("window.addEventListener('pointermove',moveDrag"));
 assert(src.includes("window.addEventListener('pointerup',finishDrag"));
 assert(src.includes('const SWIPE_PX=30, SWIPE_DETENT_MS=165'));
 assert(src.includes("window.removeEventListener('pointermove',moveDrag"));
 assert(!src.includes("choices.addEventListener('pointermove'"));
 assert(!src.includes('drSemiCount'));
 assert.equal((html.match(/semi-radial-command-v90\.css/g)||[]).length,1);
 const p=radialPoint(45,RADIAL_GEOMETRY.outerRadius);
 assert(Math.abs(Math.hypot(p.x-200,p.y-164)-154)<1e-6);
});
