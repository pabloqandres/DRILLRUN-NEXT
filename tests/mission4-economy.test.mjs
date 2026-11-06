import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CYCLE_DURATION,MAX_OFFLINE_PRODUCTION_CYCLES,BASE_INCOME_PER_CYCLE,zoneIncomePerCycle,tickProduction} from '../dist/mission4/production.mjs';
import {calculateOfflineProduction} from '../dist/mission4/offline-progress.mjs';

const now=Date.UTC(2026,10,6,20,0,0);
function fixture(elapsedMs){
 return {
  cash:5000,bank:0,nextId:1,ledger:[],savedAt:now-elapsedMs,
  mission4:{
   phase:'complete',
   zones:[{id:'BH-01',status:'producing',geologyQuality:1,depthReached:30,
    lastCycleAt:now-elapsedMs,cycleCount:0,totalIncome:0}],
   productionCycles:0,totalAutomatedIncome:0,firstIncomeAt:null,
   drillTruck:null
  }
 };
}

test('normal production credits one bounded 15-minute cycle',()=>{
 const s=fixture(CYCLE_DURATION*1000);
 const events=tickProduction(s,now);
 assert.deepEqual(events,['incomeGenerated']);
 assert.equal(s.cash,5000+BASE_INCOME_PER_CYCLE);
 assert.equal(s.ledger.length,1);
 assert.equal(s.ledger[0].amount,BASE_INCOME_PER_CYCLE);
 assert.deepEqual(tickProduction(s,now),[]);
 assert.equal(s.cash,5000+BASE_INCOME_PER_CYCLE);
});

test('long offline absence does not produce unlimited credits',()=>{
 const s=fixture(7*24*60*60*1000);
 const result=calculateOfflineProduction(s,now);
 const cap=MAX_OFFLINE_PRODUCTION_CYCLES*BASE_INCOME_PER_CYCLE;
 assert.equal(result.incomeCycles,MAX_OFFLINE_PRODUCTION_CYCLES);
 assert.equal(result.totalIncome,cap);
 assert.equal(s.cash,5000+cap);
 assert.equal(s.ledger.length,1);
 assert.equal(s.mission4.zones[0].lastCycleAt,now);
 assert.equal(calculateOfflineProduction(s,now),null);
});

test('income cannot explode from corrupted saved quality or depth',()=>{
 assert.equal(zoneIncomePerCycle({geologyQuality:1e9,depthReached:1e9}),BASE_INCOME_PER_CYCLE);
 assert.equal(zoneIncomePerCycle({geologyQuality:NaN,depthReached:30}),0);
 assert.equal(zoneIncomePerCycle({geologyQuality:-10,depthReached:30}),0);
 assert.equal(zoneIncomePerCycle({geologyQuality:1,depthReached:-100}),0);
});

test('offline cap does not rewrite previously earned wallet or bank balance',()=>{
 const s=fixture(2*24*60*60*1000);
 s.cash=765432;
 s.bank=5400;
 s.ledger.push({id:0,key:'historicalContract',amount:60000,at:now-100000000});
 calculateOfflineProduction(s,now);
 assert.equal(s.cash,765432+MAX_OFFLINE_PRODUCTION_CYCLES*BASE_INCOME_PER_CYCLE);
 assert.equal(s.bank,5400);
 assert.equal(s.ledger[0].amount,60000);
 assert.equal(s.ledger[0].key,'historicalContract');
});
