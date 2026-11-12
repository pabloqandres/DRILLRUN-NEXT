// V91 · Immutable financial read model. No balance, mission or ledger writes.
export const FINANCE_FILTERS=Object.freeze(['all','income','expense','transfer','event']);
const titleMap=Object.freeze({
 capital:'Capital inicial',missionReward:'Misión 1 · Recompensa',
 hsecReward:'Misión 2 · Recompensa HSEC',contractPayment:'Contrato · Pago de perforación',
 contractAccepted:'Contrato aceptado',officePurchase:'Construcción de oficina',
 officeUpgrade:'Ampliación de oficina',workshopBuild:'Construcción del taller',
 workshopUpgrade:'Ampliación del taller',workshopAcceleration:'Aceleración de taller',
 workshopDemolish:'Demolición del taller',patioL1Build:'Construcción del patio',
 m5Personnel:'Contratación · personal de patio',
 offlineAutomatedIncome:'Producción DTH · Ingreso fuera de sesión',
 deposit:'Transferencia al banco',withdraw:'Transferencia desde el banco'
});
const sanitize=v=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,140);
export function financeTitle(e){
 const label=sanitize(e?.label);if(label)return label;
 const key=sanitize(e?.key);
 if(titleMap[key])return titleMap[key];
 if(key.startsWith('automatedIncome-'))return 'Producción DTH · Zona '+sanitize(key.slice(16));
 if(key.startsWith('HSEC · ')||key.startsWith('Subsidio operacional')||key.startsWith('Capital · '))return key;
 return key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[_-]/g,' ')||'Movimiento';
}
export function financeType(e){
 if(e?.key==='deposit'||e?.key==='withdraw')return 'transfer';
 if(!Number.isFinite(e?.amount)||e.amount===0)return 'event';
 return e.amount>0?'income':'expense';
}
export function financeHistory(s,{filter='all',limit=100}={}){
 const source=Array.isArray(s?.ledger)?s.ledger:[];
 const entries=source.map((e,index)=>({e,index}))
  .filter(({e})=>Number.isFinite(e?.amount)&&Number.isFinite(e?.at))
  .map(({e,index})=>({
   id:e.id??index,index,at:e.at,key:sanitize(e.key),label:financeTitle(e),
   amount:e.amount,type:financeType(e)
  }))
  .sort((a,b)=>b.at-a.at||b.index-a.index);
 const totals=entries.reduce((a,e)=>{
  if(e.type==='income')a.income+=e.amount;
  if(e.type==='expense')a.expense+=Math.abs(e.amount);
  return a;
 },{income:0,expense:0});
 const kind=FINANCE_FILTERS.includes(filter)?filter:'all';
 const records=kind==='all'?entries:entries.filter(e=>e.type===kind);
 return {
  wallet:Number.isFinite(s?.cash)?s.cash:0,
  bank:Number.isFinite(s?.bank)?s.bank:0,
  totals,count:entries.length,limit:100,mayBeIncomplete:source.length>=100,
  filter:kind,records:records.slice(0,Math.min(100,Math.max(0,Math.floor(Number(limit)||100))))
 };
}
