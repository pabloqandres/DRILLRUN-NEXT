import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {workshopCardData,renderWorkshopCard} from '../dist/chapter/workshop-card-view.mjs';

const now=Date.UTC(2026,10,10,11,0);
const tool=(id,type,status,model)=>({
 id,type,status,model,lifeTotal:350,lifeRemaining:210
});
function fixture(){
 return {
  workshop:{status:'built',level:2},
  cash:37810,ledger:[{amount:1000}],boosters:0,
  toolInventory:[
   tool('bit-in','bit','installed','dth-button-8'),
   tool('hammer-in','hammer','installed','puma-dth-8'),
   ...Array.from({length:4},(_,i)=>tool('bit-'+i,'bit','new','dth-button-8')),
   ...Array.from({length:2},(_,i)=>tool('hammer-'+i,'hammer','new','puma-dth-8'))
  ],
  spentMaterials:[{id:'discarded1',recyclingStatus:'awaiting-yard'}],
  mission3:{phase:'complete'},contract:{status:'delivered'},
  drill:{id:'RC-01',state:'idle'},
  mission4:{
   phase:'complete',serviceRequested:false,
   productionDrill:{
    id:'DTH-01',assignedZone:'BH-02',state:'producing',
    installedBit:'bit-in',installedHammer:'hammer-in'
   }
  }
 };
}
const html=(s)=>renderWorkshopCard(s,{icon:name=>'<i data-icon="'+name+'"></i>',
 money:n=>new Intl.NumberFormat('es-CL').format(n),now});
test('Taller L2 shows true 8/14 occupation, actual available stock and discarded M8 count',()=>{
 const s=fixture(),v=workshopCardData(s,now);
 assert.deepEqual([v.used,v.cap,v.free,v.pct],[8,14,6,57]);
 assert.deepEqual([v.storedBits,v.storedHammers,v.discarded],[4,2,1]);
 assert.equal(v.lvl,2);assert.equal(v.nextLevel,null);
 assert.equal(v.rc.label,'En resguardo');
 assert.equal(v.dth.label,'Produciendo');
 assert.equal(v.dth.detail,'Zona BH-02');
 const out=html(s);
 assert(out.includes('TALLER'));
 assert(out.includes('INVENTARIO DISPONIBLE'));
 assert(out.includes('MAQUINARIA · ESTADO ACTUAL'));
 assert(out.includes('Ver stock'));
 assert(out.includes('Gestionar herramientas'));
 assert(!out.includes('id="workshopContextAction"'),
  'Never show an install/replace action for a healthy producing DTH');
 assert(out.includes('Máximo habilitado actualmente · Nv.2'));
});
test('The DTH tool action appears only if a bit/hammer is missing or maintenance is requested',()=>{
 const s=fixture();
 s.mission4.productionDrill.installedBit=null;
 let v=workshopCardData(s,now);
 assert.equal(v.attention.title,'Instalación pendiente');
 assert.equal(v.attention.app,'m4-workshop');
 assert.match(v.attention.detail,/un bit compatible/);
 assert(html(s).includes('workshopContextAction'));
 s.mission4.serviceRequested=true;
 v=workshopCardData(s,now);
 assert.equal(v.attention.title,'Servicio DTH solicitado');
 assert.equal(v.attention.app,'m4-workshop');
 s.toolInventory=s.toolInventory.filter(t=>t.status==='installed');
 v=workshopCardData(s,now);
 assert.equal(v.attention.app,'m4-dth-catalog');
});
test('M3-only workshop shows stock controls but not DTH management',()=>{
 const s=fixture();s.mission4={phase:'inactive'};s.drill=null;
 const out=html(s);
 assert(out.includes('id="workshopStock"'));
 assert(!out.includes('id="workshopDthManage"'));
 assert(!out.includes('ESTADO DE MAQUINARIA'));
});
test('Rendering the card does not change player balance, items, mission or save',()=>{
 const s=fixture(),before=JSON.stringify(s);
 for(let i=0;i<4;i++){workshopCardData(s,now+i*500);html(s);}
 assert.equal(JSON.stringify(s),before);
});
test('Card has fixed header, scrollable content, fixed action footer and responsive 2-column layout',()=>{
 const sheet=readFileSync(new URL('../dist/chapter/workshop-card-v37.css',import.meta.url),'utf8');
 const entry=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.match(sheet,/\.wsContent\{[\s\S]*?overflow-y:auto/);
 assert.match(sheet,/\.wsFooter\{/);
 assert.match(sheet,/grid-template-areas:/);
 assert.match(entry,/workshop-card-v37\.css\?v=38/);
 assert.match(entry,/game\.mjs\?v=20261110-workshop-ui-v38/);
});
