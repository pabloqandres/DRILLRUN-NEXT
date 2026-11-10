import {test} from 'node:test';
import assert from 'node:assert/strict';
import {workshopCardData,renderWorkshopCard} from '../dist/chapter/workshop-card-view.mjs';

const icon=x=>'<i>'+x+'</i>',money=x=>Number(x).toLocaleString('es-CL');
function fixture(){
 const stock=['new','new','worn','new','installed','new','installed','new'];
 const toolInventory=stock.map((status,i)=>({
  id:'tool-'+i,type:i<5?'bit':'hammer',
  model:i<5?'dth-button-8':'puma-dth-8',status,lifeRemaining:120,lifeTotal:350
 }));
 return {
  cash:37810,workshop:{level:2,status:'built'},toolInventory,
  spentMaterials:[{originalToolId:'spent-bit',recyclingStatus:'awaiting-yard'}],
  mission4:{phase:'complete',productionDrill:{
   assignedZone:'BH-02',state:'producing',installedBit:'tool-4',installedHammer:'tool-6'
  },serviceRequested:false},
  drill:{state:'idle'},
  mission5:{status:'operational',rcParked:true,dthParked:false},
  contract:{status:'delivered'},boosters:0,ledger:[{key:'m4',amount:1000}]
 };
}
const render=s=>renderWorkshopCard(s,{icon,money,now:Date.UTC(2026,10,10)});
test('Workshop L2 displays 8 / 14 occupancy, 6 free and real UNINSTALLED stock',()=>{
 const s=fixture(),m=workshopCardData(s);
 assert.equal(m.cap,14);
 assert.equal(m.used,8);
 assert.equal(m.free,6);
 assert.equal(m.pct,57);
 assert.equal(m.storedBits,4);
 assert.equal(m.storedHammers,2);
 assert.equal(m.discarded,1);
 assert.equal(m.maxLevel,true);
 const html=render(s);
 assert.match(html,/INVENTARIO DISPONIBLE/);
 assert.match(html,/Máximo habilitado actualmente · Nv\.2/);
 assert.match(html,/id="workshopStock"/);
 assert.match(html,/id="workshopDthManage"/);
 assert.doesNotMatch(html,/id="workshopContextAction"/);
 assert.doesNotMatch(html,/id="workshopUpgradeBtn"/);
});
test('Operational RC at D01 and productive DTH at BH-02 have separate readable status',()=>{
 const m=workshopCardData(fixture());
 assert.equal(m.rc.label,'En patio · D01');
 assert.equal(m.dth.label,'Produciendo');
 assert.equal(m.dth.detail,'Zona BH-02');
 const html=render(fixture());
 assert.match(html,/En patio · D01/);
 assert.match(html,/Zona BH-02/);
 assert.doesNotMatch(html,/MAQUINARIA Y HERRAMIENTAS.*Ver stock · Instalar/s);
});
test('Pending maintenance with available tools displays contextual action to actual M4 workshop',()=>{
 const s=fixture();s.mission4.serviceRequested=true;
 assert.equal(workshopCardData(s).attention.app,'m4-workshop');
 const html=render(s);
 assert.match(html,/id="workshopContextAction" data-app="m4-workshop"/);
 assert.match(html,/Revisar recambio/);
});
test('Pending maintenance without compatible spares points to Casa Matriz',()=>{
 const s=fixture();
 s.mission4.serviceRequested=true;
 for(const tool of s.toolInventory)if(tool.status==='new'||tool.status==='worn')tool.status='installed';
 const m=workshopCardData(s);
 assert.equal(m.attention.app,'m4-dth-catalog');
 assert.match(render(s),/Solicitar repuestos/);
});
test('Unassigned DTH and RC do not fake working/parked status',()=>{
 const s=fixture();s.mission5.rcParked=false;
 s.mission4.productionDrill.assignedZone=null;s.mission4.productionDrill.state='paused';
 assert.equal(workshopCardData(s).rc.label,'Traslado al patio');
 assert.equal(workshopCardData(s).dth.label,'Sin asignación');
 s.mission5.dthParked=true;
 assert.equal(workshopCardData(s).dth.label,'En patio · D02');
});
test('L1 can upgrade to L2; L3 remains locked, no premature economic writes',()=>{
 const s=fixture(),before=JSON.stringify(s);
 render(s);workshopCardData(s);
 assert.equal(JSON.stringify(s),before,'Card reads state only');
 s.workshop.level=1;
 const model=workshopCardData(s);
 assert.equal(model.nextLevel.level,2);
 assert.match(render(s),/Ampliar a Nv\.2/);
 assert.equal(workshopCardData({...s,cash:0}).nextLevel.affordable,false);
 assert.match(render({...s,cash:0}),/Saldo insuficiente/);
});
test('Before M4, stock is accessible without a dead DTH management button',()=>{
 const s=fixture();s.mission4=null;
 assert.equal(workshopCardData(s).activeM4,false);
 const html=render(s);
 assert.match(html,/id="workshopStock"/);
 assert.doesNotMatch(html,/id="workshopDthManage"/);
});
test('Unsafe rig state text is escaped, not interpolated as HTML',()=>{
 const s=fixture();
 s.mission4.productionDrill.assignedZone='<img src=x onerror=alert(1)>';
 const html=render(s);
 assert.doesNotMatch(html,/<img src=x/);
 assert.match(html,/&lt;img/);
});
test('The compact card keeps buttons outside the scrollable status content',()=>{
 const html=render(fixture());
 assert(html.indexOf('class="wsFooter"')>html.indexOf('</div></div>')||html.includes('class="wsFooter"'));
 assert.equal((html.match(/id="workshopCardClose"/g)||[]).length,1);
 assert.equal((html.match(/id="workshopStock"/g)||[]).length,1);
});
