// V91 · Read-only reusable finance history view.
import {financeHistory,FINANCE_FILTERS} from './finance-ledger-v91.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'🪙 '+Math.round(Math.abs(Number(n)||0)).toLocaleString('es-CL');
const date=at=>new Date(at).toLocaleString('es-CL',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
const names={all:'Todos',income:'Ingresos',expense:'Gastos',transfer:'Transferencias',event:'Eventos'};
export function renderFinancialHistory(s,filter='all'){
 const h=financeHistory(s,{filter});
 const tabs=FINANCE_FILTERS.map(k=>'<button class="fhTab '+(k===h.filter?'active':'')+
  '" type="button" data-finance-filter="'+k+'" aria-pressed="'+(k===h.filter)+'">'+names[k]+'</button>').join('');
 const rows=h.records.map(r=>{
  const sign=r.type==='income'?'+ ':r.type==='expense'?'− ':'';
  const symbol=r.type==='income'?'+':r.type==='expense'?'−':r.type==='transfer'?'⇄':'•';
  return '<li class="fhRow fhRow--'+r.type+'"><span class="fhGlyph" aria-hidden="true">'+symbol+'</span>'+
   '<span class="fhCopy"><b>'+esc(r.label)+'</b><small>'+esc(date(r.at))+' · '+names[r.type]+'</small></span>'+
   '<strong class="fhAmount">'+sign+money(r.amount)+'</strong></li>';
 }).join('');
 return '<section class="fhLedger" aria-label="Historial financiero">'+
  '<div class="fhTop"><div><small>CONTROL FINANCIERO</small><h3>Historial de movimientos</h3>'+
   '<p>Consulta de las operaciones registradas en tu partida.</p></div><span>SOLO LECTURA</span></div>'+
  '<div class="fhBalances"><div><small>Saldo disponible</small><strong>'+money(h.wallet)+'</strong></div>'+
   '<div><small>Cuenta bancaria</small><strong>'+money(h.bank)+'</strong></div></div>'+
  '<div class="fhTotals"><div><small>Ingresos registrados</small><strong class="fhIncome">+ '+money(h.totals.income)+'</strong></div>'+
   '<div><small>Gastos registrados</small><strong class="fhExpense">− '+money(h.totals.expense)+'</strong></div>'+
   '<div><small>Movimientos conservados</small><strong>'+h.count+'</strong></div></div>'+
  '<nav class="fhTabs" aria-label="Filtrar historial">'+tabs+'</nav>'+
  '<ol class="fhRows">'+(rows||'<li class="fhEmpty">No hay movimientos registrados en esta categoría.</li>')+'</ol>'+
  '<p class="fhNote">Los totales se calculan solo sobre movimientos registrados. '+
   (h.mayBeIncomplete?'La partida conserva hasta 100 movimientos; pueden faltar anteriores. ':'No siempre se registraron todos los gastos antiguos. ')+
   'Las transferencias entre caja y banco no se consideran nuevos ingresos o gastos.</p></section>';
}
