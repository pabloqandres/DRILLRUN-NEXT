import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {WORKSHOP_LEVELS,buildWorkshop,finishWorkshopConstruction,upgradeWorkshop,finishWorkshopUpgrade} from '../dist/mission3/inventory.mjs';
import {workshopConstructionReadout,workshopTimeLabel} from '../dist/chapter/workshop-progress-v102.mjs';
import {renderWorkshopDashboard} from '../dist/chapter/workshop-v102-view.mjs';
import {FaenaCenterUI} from '../dist/chapter/faena-center.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const start=Date.UTC(2026,10,13,12,0,0);
const icons=n=>'<i data-icon="'+n+'"></i>';
const cash=n=>'🪙 '+Math.round(n).toLocaleString('es-CL');
const fixture=()=>{
 const s=newGame('es','operator01',start);
 s.cash=95458;s.office.level=2;
 s.hsec??={};s.hsec.completedAt=start;
 s.mission3={phase:'workshop'};
 s.toolInventory=[];s.spentMaterials=[];
 s.mission5={status:'inactive'};
 return s;
};
const view=(s,now)=>renderWorkshopDashboard(s,{icon:icons,money:cash,m4:()=>'<span>M4 ORIGINAL</span>',now});

test('V102 real base workshop construction uses saved started/ends (90s)',()=>{
 const s=fixture(),before=s.cash;
 buildWorkshop(s,start);
 const p=workshopConstructionReadout(s,start+45000);
 assert.equal(p.kind,'construction');
 assert.equal(p.targetLevel,1);
 assert.equal(p.progress,50);
 assert.equal(p.remainingLabel,'00:45');
 assert.equal(p.remainingMs,45000);
 assert.equal(s.cash,before-2500);
 const html=view(s,start+45000);
 assert.match(html,/Construcción del Taller nivel 1/);
 assert.match(html,/data-ws102-remaining>00:45/);
 assert.match(html,/data-ws102-percent>50%/);
 assert(!html.includes('data-faena-workshop-upgrade'), 'no CTA when building L1');
 assert.equal(finishWorkshopConstruction(s,start+90000),true);
 assert.equal(workshopConstructionReadout(s,start+90000),null);
});
test('V102 N1->N2 upgrade CTA is visible, calls ORIGINAL action and quotes 8000, 05:00',()=>{
 const s=fixture();
 s.workshop={status:'built',level:1};
 const before=JSON.stringify(s);
 const html=view(s,start);
 assert(html.includes('data-faena-workshop-upgrade'));
 assert(html.includes('MEJORAR A NIVEL 2'));
 assert(html.includes('8.000'));
 assert(html.includes('05:00'));
 assert(html.includes('ws102UpgradeBtn'));
 assert.equal(JSON.stringify(s),before,'renderer must never spend or change state');
 const next=WORKSHOP_LEVELS.find(x=>x.level===2);
 assert.equal(next.upgradeCost,8000);
 assert.equal(next.constructionSeconds,300);
});
test('V102 upgrade uses existing real job: accurate countdown, boost-compatible and no second purchase',()=>{
 const s=fixture();s.workshop={status:'built',level:1};
 const before=s.cash;
 upgradeWorkshop(s,start);
 assert.equal(s.cash,before-8000);
 const p=workshopConstructionReadout(s,start+90000);
 assert.equal(p.kind,'upgrade');
 assert.equal(p.targetLevel,2);
 assert.equal(p.progress,30);
 assert.equal(p.remainingLabel,'03:30');
 assert.equal(p.remainingMs,210000);
 const html=view(s,start+90000);
 assert(html.includes('AMPLIANDO TALLER'));
 assert(html.includes('Ampliando a nivel 2'));
 assert(html.includes('data-ws102-remaining>03:30'));
 assert(html.includes('data-ws102-percent>30%'));
 assert(!html.includes('data-faena-workshop-upgrade'));
 assert.equal(workshopConstructionReadout(s,start+300000).progress,100);
 finishWorkshopUpgrade(s);
 assert.equal(workshopConstructionReadout(s,start+300001),null);
 assert(view(s,start+300001).includes('Ampliación completada'));
});
test('V102 cannot purchase upgrade if missing funds, and early construction displays no phantom remaining',()=>{
 const s=fixture();s.workshop={status:'built',level:1};s.cash=300;
 const html=view(s,start);
 assert(html.includes('SALDO INSUFICIENTE'));
 assert.match(html,/data-faena-workshop-upgrade disabled/);
 assert.equal(workshopTimeLabel(90000),'01:30');
 assert.equal(workshopTimeLabel(300000),'05:00');
 assert.equal(workshopTimeLabel(0),'00:00');
 assert.equal(workshopConstructionReadout(s,start),null);
});
test('V102 the workshop dashboard retains recovery, kits, original DTH and routes',()=>{
 const s=fixture();s.workshop={status:'built',level:1};s.mission4={phase:'setup'};
 const html=view(s,start);
 assert(html.includes('Trabajos de recuperación'));
 assert(html.includes('Kits disponibles'));
 assert(html.includes('Herramientas para recuperar'));
 assert(html.includes('Instalación y mantenimiento DTH'));
 assert(html.includes('M4 ORIGINAL'));
 assert(html.includes('data-faena-route="logistics"'));
 assert(html.includes('data-faena-route="headquarters"'));
 assert(html.includes('data-faena-recover')===false);
});
test('V102 ticker updates only DOM from actual state, cannot mutate game data',()=>{
 const s=fixture();s.workshop={status:'built',level:1};upgradeWorkshop(s,start);
 const original=JSON.stringify(s);
 const nodes=new Map();
 for(const id of ['[data-ws102-remaining]','[data-ws102-percent]','[data-ws102-fill]','[role="progressbar"]'])
  nodes.set(id,{textContent:'',style:{},setAttribute(name,val){this[name]=val;}});
 const progress={querySelector:key=>nodes.get(key)};
 const ui=Object.create(FaenaCenterUI.prototype);
 ui.host={classList:{contains:()=>false},querySelector:key=>key==='[data-ws102-progress]'?progress:null};
 ui.route='workshop';ui.view='';ui.state=()=>s;
 ui.updateWorkshopClock(start+120000);
 assert.equal(nodes.get('[data-ws102-remaining]').textContent,'03:00');
 assert.equal(nodes.get('[data-ws102-percent]').textContent,'40%');
 assert.equal(nodes.get('[data-ws102-fill]').style.width,'40%');
 assert.equal(nodes.get('[role="progressbar"]')['aria-valuenow'],'40');
 assert.equal(JSON.stringify(s),original);
});
test('V102 world tag shares same job and camera roof projection; no game-loop edits',()=>{
 const world=read('dist/chapter/construction-callout.mjs');
 const ui=read('dist/chapter/faena-center.mjs');
 const css=read('dist/chapter/workshop-dashboard-v102.css');
 const index=read('dist/index.html');
 for(const token of [
  'workshopConstructionReadout(s,now)',
  'projectConstructionTarget({x,y,z},this.world.camera',
  'this.world.sampleGround(x,z)+5.0',
  'data-ws102-world-title',
  'data-ws102-world-time',
  'data-ws102-world-percent',
  'this.updateWorkshop(s,enabled)'
 ])assert(world.includes(token),token);
 assert(ui.includes("renderWorkshopVisualV103(s,{icon,money,m4,now:Date.now()})"),
  'V103 remains driven by original persisted progress; V102 readout stays available');
 assert(ui.includes("this.workshopClock=setInterval(()=>this.updateWorkshopClock(),1000)"));
 assert(ui.includes("this.stopWorkshopClock();"));
 assert(ui.includes("this.onAppAction?.('m3','upgradeWorkshop',null)"));
 assert(index.includes('workshop-dashboard-v102.css?v=102'));
 assert(css.includes('.ws102WorldTag'));
 assert(css.includes('.ws102UpgradeBtn'));
 assert(css.includes('.ws102ProgressTrack'));
 assert(!world.includes('s.cash='));
 assert(!world.includes('save()'));
 assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length);
});
