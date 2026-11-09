import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatOrderETA,orderSecondsRemaining} from '../dist/mission3/headquarters.mjs';
import {readFileSync} from 'node:fs';

const NOW=Date.UTC(2026,10,9,14,0,0);
const order=(type,seconds)=>({
 status:'dispatched',
 dispatchedAt:NOW-(120-seconds)*1000,
 dispatchDuration:120,
 items:[{type}]
});

test('all consumable and machinery orders show real seconds under one minute',()=>{
 for(const type of ['bit','hammer','drill','dthDrill','drillTruck']){
  assert.equal(formatOrderETA(order(type,59),NOW),'59 s restantes');
  assert.equal(formatOrderETA(order(type,34),NOW),'34 s restantes');
  assert.equal(formatOrderETA(order(type,1),NOW),'1 s restantes');
  assert.equal(formatOrderETA(order(type,60),NOW),'1 min restantes');
  assert.equal(formatOrderETA(order(type,61),NOW),'2 min restantes');
  assert.equal(orderSecondsRemaining(order(type,34),NOW),34);
 }
});
test('delivered/arriving and pending orders never show a phantom one minute',()=>{
 const arriving=order('bit',0);
 assert.equal(formatOrderETA(arriving,NOW),'Llegando...');
 assert.equal(formatOrderETA({...arriving,status:'delivered'},NOW),'Llegando...');
 assert.equal(formatOrderETA({...arriving,status:'pending'},NOW),'Pendiente de despacho');
});
test('Casa Matriz and Pedidos use same time formatting, refreshed every second',()=>{
 const apps=readFileSync(new URL('../dist/mission3/phone-apps.mjs',import.meta.url),'utf8');
 const game=readFileSync(new URL('../dist/chapter/game.mjs',import.meta.url),'utf8');
 assert.equal((apps.match(/const eta=formatOrderETA\(o\);/g)||[]).length,2);
 assert.equal((apps.match(/\$\{esc\(eta\)\}/g)||[]).length,2);
 assert(game.includes("const deliveryView=phoneApp==='m3-orders'||phoneApp==='m3-catalog'"));
 assert(game.includes("geoRefreshTimer>=(deliveryView?1:2)"));
});
test('Casa Matriz cards and real RC preview are contained independent of desktop viewport',()=>{
 const apps=readFileSync(new URL('../dist/mission3/phone-apps.mjs',import.meta.url),'utf8');
 const css=readFileSync(new URL('../dist/chapter/hud-reference-v4.css',import.meta.url),'utf8');
 assert(apps.includes('m3Header m3CatalogHeader'));
 assert(apps.includes('inventoryCard m3RigCatalogCard'));
 assert(css.includes('#phone[data-app="m3-catalog"] #phoneContent .m3RigCatalogCard'));
 assert(css.includes('grid-template-columns:88px minmax(0,1fr)!important'));
 assert(css.includes('grid-column:2!important;grid-row:2!important'));
 assert(css.includes('object-fit:contain!important'));
 assert(css.includes('#phone[data-app="m3-catalog"] #phoneContent .inventoryCard:not(.m3RigCatalogCard)'));
});
