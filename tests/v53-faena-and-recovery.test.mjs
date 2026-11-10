import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {placeOrder,tickDeliveries,canPlaceOrder} from '../dist/mission3/headquarters.mjs';
import {REPAIR_KITS,canStartRecovery,startRecovery,finishRecoveries,workshopRecoverySummary} from '../dist/mission5/workshop-recovery.mjs';
import {FaenaCenterUI} from '../dist/chapter/faena-center.mjs';
const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

function fixture(){
 const s=newGame('es','operator01');
 s.cash=5000;s.nextId=100;s.orders=[];s.ledger=[];s.drill=null;
 s.workshop={status:'built',level:1};
 s.mission5={status:'operational'};
 s.toolInventory=[{id:'tool-1',type:'bit',model:'dth-bit-a',status:'spent',lifeTotal:100,lifeRemaining:0,recoveryCount:0},
 {id:'tool-2',type:'hammer',model:'puma-dth-hammer',status:'spent',lifeTotal:200,lifeRemaining:0,recoveryCount:0}];
 s.spentMaterials=[{id:'used-1',originalToolId:'tool-1',model:'dth-bit-a',type:'bit'}];
 return s;
}
test('Paid kit arrives by real Casa Matriz dispatch and does not bypass stock',()=>{
 const s=fixture(),item={type:'repairKit',category:'maintenance',model:'bit-sharpen-kit',qty:1,unitPrice:REPAIR_KITS['bit-sharpen-kit'].price};
 assert.equal(canPlaceOrder(s,[item]),null);
 assert.equal(canStartRecovery(s,'tool-1'),'needsRepairKit');
 const paid=placeOrder(s,[item],1000);
 assert.equal(s.cash,4200);
 assert.equal(s.mission5.recovery,undefined);
 assert.equal(paid.status,'dispatched');
 assert.equal(tickDeliveries(s,120999).delivered,0);
 assert.equal(tickDeliveries(s,121001).delivered,1);
 assert.equal(s.mission5.recovery.kits['bit-sharpen-kit'],1);
 assert.equal(tickDeliveries(s,121002).delivered,0);
 assert.equal(s.mission5.recovery.kits['bit-sharpen-kit'],1);
});
test('Recovery consumes one kit, waits timer and returns finite worn tool',()=>{
 const s=fixture(),now=10_000;
 s.mission5.recovery={kits:{'bit-sharpen-kit':1},jobs:[],history:[]};
 const job=startRecovery(s,'tool-1',now);
 assert.equal(s.toolInventory[0].status,'repairing');
 assert.equal(s.mission5.recovery.kits['bit-sharpen-kit'],0);
 assert.equal(canStartRecovery(s,'tool-1'),'toolNotRecoverable');
 assert.deepEqual(finishRecoveries(s,job.endsAt-1),[]);
 const result=finishRecoveries(s,job.endsAt);
 assert.equal(result.length,1);
 assert.equal(s.toolInventory[0].status,'worn');
 assert.ok(s.toolInventory[0].lifeRemaining<70&&s.toolInventory[0].lifeRemaining>0);
 assert.equal(finishRecoveries(s,job.endsAt+1).length,0);
 assert.equal(s.mission5.recovery.history.length,1);
 assert.ok(workshopRecoverySummary(s).completed===1);
 assert.equal(canStartRecovery(s,'tool-1'),'toolNotWornEnough');
 s.toolInventory[0].lifeRemaining=20;
 assert.equal(canStartRecovery(s,'tool-1'),'needsRepairKit');
});
test('No free or inappropriate repair: requires qualifying workshop and limits',()=>{
 const s=fixture();
 assert.equal(canStartRecovery(s,'tool-2'),'needsRepairKit');
 s.mission5.status='building';
 assert.equal(canStartRecovery(s,'tool-2'),'patioNotReady');
 s.mission5.status='operational';s.toolInventory[1].recoveryCount=1;
 assert.equal(canStartRecovery(s,'tool-2'),'recoveryLimit');
});
test('Unified center reuses action handlers and preserves five bottom nav slots',()=>{
 const index=source('dist/index.html');
 const game=source('dist/chapter/game.mjs');
 assert.match(index,/id="faenaCenter"/);
 assert.match(index,/faena-center\.css/);
 assert.match(game,/faenaCenter=new FaenaCenterUI/);
 assert.match(game,/phoneUI\.onM3Action\?\./);
 assert.match(game,/phoneUI\.onM4Action\?\./);
 assert.match(game,/phoneUI\.onM5Action\?\./);
 assert.match(game,/openFaena\('overview'\)/);
 assert.match(game,/openFaena\('logistics'\)/);
 assert.match(game,/finishRecoveries\(s,wall\)/);
 assert.match(source('dist/chapter/phone-ui.mjs'),/patioAvailable/);
 assert.match(source('dist/mission5/npc-locomotion.mjs'),/this\.sideAxis==='z'\?'z':'x'/);
 assert.match(source('dist/graphics/personal-drilltruck-headlights.mjs'),/SpotLight/);
});
test('Center renders overview and logistics without mutating wallet',()=>{
 const s=fixture(),cash=s.cash;
 const view=Object.create(FaenaCenterUI.prototype);
 view.route='overview';view.view='';
 const translate=key=>key,format=n=>String(n),icon=k=>'<svg data-test="'+k+'"></svg>';
 const home=view.pageHtml(s,translate,format,icon);
 assert.match(home,/Centro de Faena|Producción y zonas/);
 view.route='logistics';
 const logistics=view.pageHtml(s,translate,format,icon);
 assert.match(logistics,/Galpón|inventario/i);
 assert.equal(s.cash,cash);
});

test('Worksite routes open sensible content at each progression stage',()=>{
 const s=fixture(),cash=s.cash;
 const view=Object.create(FaenaCenterUI.prototype);
 view.route='workshop';view.view='';
 const t=k=>k,fmt=n=>String(n),icon=k=>'<svg data-test="'+k+'"></svg>';
 const workshop=view.pageHtml(s,t,fmt,icon);
 assert.match(workshop,/Taller/);
 assert.match(workshop,/Herramientas para recuperar/);
 assert.match(workshop,/data-faena-recover="tool-1"/);
 view.route='fleet';
 assert.match(view.pageHtml(s,t,fmt,icon),/DrillTruck/);
 view.route='safety';
 assert.match(view.pageHtml(s,t,fmt,icon),/control de acceso/);
 view.route='production';
 assert.match(view.pageHtml(s,t,fmt,icon),/se desbloquea en Misión 3/);
 view.route='contracts';
 assert.match(view.pageHtml(s,t,fmt,icon),/se habilitan en Misión 3/);
 view.route='headquarters';
 assert.match(view.pageHtml(s,t,fmt,icon),/Casa Matriz se habilita/);
 assert.equal(s.cash,cash);
});
test('Physical building and catalog open the same controller, never new balances',()=>{
 const game=source('dist/chapter/game.mjs');
 assert.match(game,/onWorkshopManage:\(\)=>\{openFaena\('workshop'\);\}/);
 assert.match(game,/onPhoneNav:app=>\{closeBuilder\(\);openFaena\(app\);\}/);
 assert.match(game,/Math\.hypot\(p\.x\+69\.5,p\.z\+20\)<4\.2/);
 assert.match(game,/onPatioAction:\(\)=>s\?\.mission5\?\.status==='operational'/);
 const phone=source('dist/chapter/phone-ui.mjs');
 assert.match(phone,/const consolidated=/);
 assert.match(phone,/data-app="faena-center"/);
});
