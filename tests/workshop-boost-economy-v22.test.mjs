import {test} from 'node:test';
import assert from 'node:assert/strict';
import {upgradeWorkshop,accelerateWorkshop,workshopUpgradeJob,finishWorkshopUpgrade} from '../dist/mission3/inventory.mjs';
const TIME=Date.UTC(2026,10,9,15,0,0);
function state(boosters=1){return {
 cash:20000,boosters,nextId:1,ledger:[],
 workshop:{level:1,status:'built'},toolInventory:[],mission4:{parkingBuilt:false}
};}
test('one booster removes only 60 seconds from a five minute workshop upgrade',()=>{
 const s=state(1);upgradeWorkshop(s,TIME);
 const originalEnd=workshopUpgradeJob(s).ends;
 const out=accelerateWorkshop(s,60,TIME+1000);
 assert.equal(originalEnd,TIME+300000);
 assert.equal(originalEnd-workshopUpgradeJob(s).ends,60000);
 assert.equal(out.boostersLeft,0);
 assert.equal(s.boosters,0);
 assert.equal(s.ledger.filter(e=>e.key==='workshopAcceleration').length,1);
 assert.throws(()=>accelerateWorkshop(s,60,TIME+2000),/noBoosters/);
 assert.equal(workshopUpgradeJob(s).ends,originalEnd-60000);
});
test('zero boosters cannot modify timer or ledger',()=>{
 const s=state(0);upgradeWorkshop(s,TIME);
 const before=workshopUpgradeJob(s).ends,logs=s.ledger.length;
 assert.throws(()=>accelerateWorkshop(s,60,TIME+1000),/noBoosters/);
 assert.equal(workshopUpgradeJob(s).ends,before);
 assert.equal(s.ledger.length,logs);
});
test('last minute can be finished using exactly one booster',()=>{
 const s=state(1);upgradeWorkshop(s,TIME);
 const out=accelerateWorkshop(s,60,TIME+265000);
 assert.equal(out.remainingSeconds,0);
 assert.equal(out.secondsReduced,35);
 assert.equal(s.boosters,0);
 assert.equal(finishWorkshopUpgrade(s).level,2);
 assert.equal(workshopUpgradeJob(s),null);
 assert.throws(()=>accelerateWorkshop(s,60,TIME+266000),/constructionNotActive/);
});
test('cannot accelerate completed construction even with remaining boosters',()=>{
 const s=state(10);upgradeWorkshop(s,TIME);
 const remaining=s.boosters;
 assert.throws(()=>accelerateWorkshop(s,60,TIME+300001),/constructionFinished/);
 assert.equal(s.boosters,remaining);
});
test('click handler is guarded, updates counter and disabled button',async()=>{
 const {readFileSync}=await import('node:fs');
 const game=readFileSync(new URL('../dist/chapter/game.mjs',import.meta.url),'utf8');
 assert(game.includes('boost=accelerateWorkshop(s,60)'));
 assert(game.includes('save();renderHUD();showWorkshopCard()'));
 assert(game.includes("e.message==='noBoosters'"));
 assert(game.includes('Consume 1 acelerador y reduce hasta 60 segundos'));
});
