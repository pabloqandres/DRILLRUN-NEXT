import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runM4BitLab,createM4LabFixture} from '../dist/qa/m4-bit-lab.mjs';

test('controlled DTH bit exhaustion uses real 15-minute cycle and DrillTruck service route without touching live save',()=>{
 const report=runM4BitLab();
 assert.equal(report.passed,true,JSON.stringify(report.checks.filter(c=>!c.passed),null,2));
 assert.equal(report.initial.cash,25000);
 assert.equal(report.final.cash,28000);
 assert.equal(report.final.bitInstalled,'qa-bit-stock');
 assert.equal(report.final.formerBit,'spent');
 assert.equal(report.final.hammer,1540);
 assert.equal(report.final.materials.length,1);
 assert.equal(report.final.materials[0].recyclingStatus,'awaiting-yard');
 assert.equal(report.routes.out.distanceToRig>=4.5,true);
 assert.equal(report.final.zone!=='BH-01',true);
 assert.equal(report.trace.some(x=>x.label==='Recambio finalizado'),true);
});
test('with no spare: no DrillTruck dispatch, no phantom income and no fabricated tool',()=>{
 const report=runM4BitLab({spare:false});
 assert.equal(report.passed,true,JSON.stringify(report.checks.filter(c=>!c.passed),null,2));
 assert.equal(report.initial.stock,0);
 assert.equal(report.final.cash,26500);
 assert.equal(report.final.bitInstalled,'qa-bit-installed');
 assert.equal(report.final.stockAvailable,0);
});
test('fixtures are fresh copies and are never persisted',()=>{
 const a=createM4LabFixture(),b=createM4LabFixture();
 a.toolInventory[0].lifeRemaining=0;
 assert.equal(b.toolInventory[0].lifeRemaining,30);
 assert.equal(a.saveKey,null);
 assert.equal(b.saveKey,null);
});
test('partial remaining metres pay proportionally and stop for service',()=>{
 const report=runM4BitLab({spare:true,bitMeters:12});
 assert.equal(report.passed,true,JSON.stringify(report.checks.filter(c=>!c.passed),null,2));
 assert.equal(report.final.cash,27100); // 600 for 12 m, then 1500 for next cycle
 assert.equal(report.final.hammer,1558);
});
