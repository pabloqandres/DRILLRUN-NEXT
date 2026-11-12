import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {financeHistory,financeTitle,financeType,FINANCE_FILTERS} from '../dist/chapter/finance-ledger-v91.mjs';
import {renderFinancialHistory} from '../dist/chapter/finance-view-v91.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const at=Date.UTC(2026,10,12,10,0,0);
const sample=()=>({
 cash:95458,bank:1650,
 ledger:[
  {id:1,key:'capital',amount:5000,at:at-500},
  {id:2,key:'missionReward',amount:5000,at:at-400},
  {id:3,key:'officePurchase',amount:-1300,at:at-300},
  {id:4,key:'deposit',amount:1200,at:at-200},
  {id:5,key:'withdraw',amount:350,at:at-190},
  {id:6,key:'contractAccepted',amount:0,at:at-100},
  {id:7,key:'automatedIncome-z3',amount:1500,at},
 ]});
test('V91 financial ledger is pure and never modifies wallet, bank or stored transactions',()=>{
 const s=sample(),before=JSON.stringify(s);
 const all=financeHistory(s);
 assert.equal(JSON.stringify(s),before);
 assert.equal(all.wallet,95458);
 assert.equal(all.bank,1650);
 assert.equal(all.count,7);
 assert.equal(all.records[0].key,'automatedIncome-z3');
 assert.deepEqual(all.totals,{income:11500,expense:1300});
 assert.equal(all.records.length,7);
 assert.equal(renderFinancialHistory(s,'income').includes('🪙'),true);
 assert.equal(JSON.stringify(s),before);
});
test('V91 deposits and withdrawals are transfers, never phantom income or spending',()=>{
 const s=sample();
 assert.equal(financeType({key:'deposit',amount:1200}),'transfer');
 assert.equal(financeType({key:'withdraw',amount:350}),'transfer');
 assert.equal(financeType({key:'contractAccepted',amount:0}),'event');
 assert.equal(financeType({key:'officePurchase',amount:-1300}),'expense');
 assert.deepEqual(financeHistory(s,{filter:'transfer'}).records.map(r=>r.key),['withdraw','deposit']);
 assert.deepEqual(financeHistory(s,{filter:'income'}).records.map(r=>r.key),
 ['automatedIncome-z3','missionReward','capital']);
 assert.equal(financeHistory(s,{filter:'expense'}).records.length,1);
 assert.equal(financeHistory(s,{filter:'event'}).records.length,1);
 assert(FINANCE_FILTERS.includes('transfer'));
});
test('V91 history is safe with missing/legacy/truncated records',()=>{
 const s=sample();
 s.ledger.unshift({key:'corrupt',amount:'50000',at:at-800});
 assert.equal(financeHistory(s).count,7,'invalid entries never counted');
 s.ledger=Array.from({length:100},(_,i)=>({id:i,key:'credit'+i,amount:i%2?-1:1,at:at+i}));
 assert(financeHistory(s).mayBeIncomplete);
 assert.equal(financeHistory(s).records.length,100);
 const view=renderFinancialHistory(s);
 assert(view.includes('hasta 100 movimientos'));
 assert.equal(financeHistory(null).count,0);
 assert.equal(financeHistory({cash:NaN,bank:undefined}).wallet,0);
 assert(financeTitle({key:'contractPayment'}).includes('Contrato'));
 assert(financeTitle({label:'Ayuda & <test>',key:'whatever'}).includes('<test>'));
 assert(!renderFinancialHistory({ledger:[{key:'x',label:'<script>alert(1)</script>',at,amount:1}]}).includes('<script>'));
});
test('V91 UI includes actual balances, filtered movements, and honest limitations',()=>{
 const s=sample(),html=renderFinancialHistory(s);
 for(const token of ['Saldo disponible','Cuenta bancaria','Movimientos conservados',
  'data-finance-filter="income"','data-finance-filter="expense"',
  'data-finance-filter="transfer"','Transferencias','SOLO LECTURA','95458'.slice(0,2)])
  assert(html.includes(token),token);
 assert(html.includes('95.458'));
 assert(html.includes('No siempre se registraron todos los gastos antiguos'));
 assert(!html.includes('CR '));
});
test('V91 integrated into existing Faena and wallet, not into economy or saves',()=>{
 const faena=read('dist/chapter/faena-center.mjs'),game=read('dist/chapter/game.mjs'),html=read('dist/index.html');
 const ledger=read('dist/chapter/finance-ledger-v91.mjs');
 assert(faena.includes("case 'finances':return renderFinancialHistory(s,this.financialFilter);"));
 assert(faena.includes('data-faena-route="finances"'));
 assert(faena.includes("if(b.dataset.financeFilter){this.financialFilter=b.dataset.financeFilter"));
 assert(game.includes("$('#money').onclick=()=>openFaena('finances')"));
 assert(game.includes("initCloudSave(value,async user=>"));
 assert(game.includes("$('#play').onclick=async()=>"));
 assert(game.includes("import {installSemiRadialDock} from './semi-radial-dock-v90.mjs'"));
 assert(html.includes('finance-ledger-v91.css?v=91'));
 assert(!ledger.includes('localStorage.'));
 assert(!ledger.includes('s.cash+='));
 assert(!ledger.includes('s.ledger.push'));
 assert(!ledger.includes('cloudSave('));
});
