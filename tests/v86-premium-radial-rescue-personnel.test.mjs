import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {CONFIG} from '../dist/chapter/config.mjs';
import {officeRescueTarget} from '../dist/chapter/player-rescue-v86.mjs';
import {SEMI_RADIAL_ITEMS,semiRadialStep} from '../dist/chapter/semi-radial-dock-v83.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('V86: preserve new navigation with one continuous ribbon and slower easing',()=>{
 const html=read('dist/index.html'),game=read('dist/chapter/game.mjs');
 const module=read('dist/chapter/semi-radial-dock-v83.mjs');
 const css=read('dist/chapter/semi-radial-premium-v86.css');
 assert(html.includes('id="bottomNav"'));
 assert(game.includes('installSemiRadialDock({'));
 for(const key of ['class="drSemiRibbon"','class="drSemiSegment drSemiSegmentLeft"',
 'class="drSemiSegment drSemiSegmentActive"','class="drSemiSegment drSemiSegmentRight"',
 'class="drSemiHubIcon"','centerIndex=0','lastDragRotationAt>=310'])
  assert(module.includes(key),key);
 assert(!module.includes('drSemiExcavator'));
 assert(css.includes('transition:transform .58s'));
 assert(css.includes('.drSemiItem .drSemiWedge'));
 assert(css.includes('display:none!important'));
 assert(css.includes('filter:blur(1px)!important'));
 assert(html.indexOf('semi-radial-premium-v86.css')>html.indexOf('semi-radial-geometry-v84.css'));
 assert.equal(SEMI_RADIAL_ITEMS.length,10);
 for(let n=0;n<10;n++){
  const positions=SEMI_RADIAL_ITEMS.map((_,i)=>semiRadialStep(i,n,10));
  assert.equal(positions.filter(x=>['-1','0','1'].includes(x)).length,3);
  assert.equal(positions.filter(x=>['-2','2'].includes(x)).length,2);
 }
});
test('V86: floating camera button removed; 3D, joystick and menu controls remain',()=>{
 const html=read('dist/index.html'),game=read('dist/chapter/game.mjs');
 assert(!html.includes('id="cameraHome"'));
 assert(!game.includes("$('#cameraHome').onclick"));
 assert(!html.includes('reset-view-control-v85.css'));
 for(const id of ['joystick','handButton','bottomNav'])assert(html.includes('id="'+id+'"'),id);
 assert(game.includes("if(nav==='m3-personnel'){openFaena('personnel');return;}"));
 assert(game.includes("onFeedback:kind=>selectorFeedback.play(kind)"));
});
test('V86: office rescue avoids obstacles and leaves money and missions untouched',()=>{
 const s=newGame('es','operator01'),baseline=JSON.stringify(s);
 assert.deepEqual(officeRescueTarget(s,()=>false),
  {position:{...CONFIG.officeSlot.access},inside:false});
 assert.equal(JSON.stringify(s),baseline);
 s.office={status:'built',level:1};
 const snapshot=JSON.stringify(s);
 assert.deepEqual(officeRescueTarget(s,()=>false),{position:{x:-7.99,z:-.5},inside:true});
 assert.equal(JSON.stringify(s),snapshot);
 let calls=0;
 assert.deepEqual(officeRescueTarget(s,(x,z)=>{calls++;return z<2;}),
  {position:{...CONFIG.officeSlot.access},inside:false});
 assert.equal(calls,6);
 assert.equal(officeRescueTarget(s,()=>true),null);
 assert.equal(officeRescueTarget(null,()=>false),null);
 assert.equal(officeRescueTarget(s,null),null);
});
test('V86: Settings unstick and parked vehicle transition, never wallet or mission mutations',()=>{
 const game=read('dist/chapter/game.mjs');
 assert(game.includes('Desatascar jugador · volver a la oficina'));
 assert(game.includes("$('#unstickPlayer')?.addEventListener('click',rescueStuckPlayer)"));
 const body=game.slice(game.indexOf('function rescueStuckPlayer(){'),game.indexOf('function ensureSafe(){'));
 assert(body.startsWith('function rescueStuckPlayer(){'));
 for(const phrase of ['officeRescueTarget(s,(x,z)=>world.isBlocked(x,z,radius))','stop()',
  "truck?.mode==='driving'",'exitPersonalTruck(s,destination.position)',
  'world.worker.reset()','world.sampleGround','ensureSafe()','save()','renderHUD()'])
  assert(body.includes(phrase),phrase);
 for(const phrase of ['s.cash=','s.bank=','s.contract=','s.mission3=','s.mission4=','s.mission5='])
  assert(!body.includes(phrase),'mission mutation '+phrase);
 assert(!game.includes('id="recoverView3D"'));
 assert(!game.includes('id="resetCamera"'));
});
test('V86: Personal footer uses a guaranteed height and accessible horizontal slots',()=>{
 const css=read('dist/chapter/personnel-layout-v86.css'),html=read('dist/index.html');
 const markup=read('dist/chapter/personnel-premium-v76.mjs');
 for(const term of ['grid-template-rows:minmax(0,1fr) clamp(59px,12dvh,84px)!important',
  'grid-template-rows:minmax(0,1fr) 57px!important','min-height:0!important',
  'overflow-x:auto!important','.pvTeamSlot','height:100%!important',
  '.pvDetailBody','scrollbar-width:thin'])
  assert(css.includes(term),term);
 assert(markup.includes('Array.from({length:Math.max(capacity,team.length)}'));
 assert(html.indexOf('personnel-layout-v86.css')>html.indexOf('personnel-polish-v81.css'));
});
