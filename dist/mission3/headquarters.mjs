// Mission 3 — Casa Matriz / Dispatch system
// Handles material orders, delivery scheduling, and supply logistics.
import {hammerDefinition,bitDefinition,drillDefinition,purchaseDrill} from './drills.mjs';
import {dthHammerDefinition,dthBitDefinition,dthDrillDefinition,purchaseDthDrill} from '../mission4/drills-dth.mjs';
import {purchaseDrillTruck,DRILLTRUCK_COST} from '../mission4/drilltruck.mjs';
import {workshopFree} from './inventory.mjs';

const fail=msg=>{throw new Error(msg);};
const DELIVERY_FEE=200;
const DISPATCH_SECONDS=120; // 2 min delivery time
const MACHINERY_DISPATCH_SECONDS=180; // 3 min for machinery

export function orderCost(items){
 return items.reduce((n,i)=>n+(i.unitPrice||0)*i.qty,0)+DELIVERY_FEE;
}

export function canPlaceOrder(s,items){
 if(!items?.length)return 'emptyOrder';
 for(const item of items){
  if(item.category!=='machinery')continue;
  if(item.qty!==1)return 'invalidQty';
  const def=item.type==='drill'?drillDefinition(item.model):
            item.type==='dthDrill'?dthDrillDefinition(item.model):
            item.type==='drillTruck'&&item.model==='drilltruck'?{price:DRILLTRUCK_COST}:null;
  if(!def||item.unitPrice!==def.price)return 'invalidItem';
  if(['dthDrill','drillTruck'].includes(item.type)&&(!s.mission4||s.mission4.phase==='inactive'))return 'missionNotActive';
  if((item.type==='drill'&&s.drill)||(item.type==='dthDrill'&&s.mission4?.productionDrill)||(item.type==='drillTruck'&&s.mission4?.drillTruck))return 'alreadyOwned';
  if((s.orders||[]).some(o=>['pending','dispatched'].includes(o.status)&&o.items?.some(i=>i.category==='machinery'&&i.type===item.type)))return 'orderAlreadyPending';
 }
 // Machinery orders don't require existing drill
 const hasMachinery=items.some(i=>i.category==='machinery');
 if(!hasMachinery&&!s.drill)return 'needsDrill';
 const total=orderCost(items);
 if(s.cash<total)return 'noMoney';
 // Check workshop capacity (only for tools, not machinery)
 const toolItems=items.filter(i=>!i.category||i.category!=='machinery');
 const totalQty=toolItems.reduce((n,i)=>n+i.qty,0);
 const reservedQty=(s.orders||[]).filter(o=>['pending','dispatched'].includes(o.status)&&!o.consumed)
  .flatMap(o=>(o.items||[]).filter(i=>i.category!=='machinery'))
  .reduce((n,i)=>n+(Number(i.qty)||0),0);
 if(totalQty+reservedQty>workshopFree(s))return 'noCapacity';
 // Validate each item exists in catalog
 for(const item of items){
  if(item.category==='machinery')continue; // machinery validated by caller
  const def=item.type==='hammer'?(hammerDefinition(item.model)||dthHammerDefinition(item.model)):
            item.type==='bit'?(bitDefinition(item.model)||dthBitDefinition(item.model)):null;
  if(!def||item.unitPrice!==def.price)return 'invalidItem';
  if(!Number.isInteger(item.qty)||item.qty<1||item.qty>10)return 'invalidQty';
 }
 return null;
}

export function placeOrder(s,items,now=Date.now()){
 const blocked=canPlaceOrder(s,items);
 if(blocked)fail(blocked);
 const total=orderCost(items);
 s.cash-=total;
 const hasMachinery=items.some(i=>i.category==='machinery');
 const order={
  id:'order-'+(s.nextId++),
  items:items.map(i=>({...i})),
  totalCost:total,
  deliveryFee:DELIVERY_FEE,
  status:'pending',
  orderedAt:now,
  dispatchDuration:hasMachinery?MACHINERY_DISPATCH_SECONDS:DISPATCH_SECONDS,
  dispatchedAt:now, // starts immediately
  deliveredAt:null,
  consumed:false
 };
 s.orders.push(order);
 if(s.contract)s.contract.expenses=(s.contract.expenses||0)+total;
 s.ledger.push({id:s.nextId++,key:hasMachinery?'machineryOrder':'materialOrder',amount:-total,at:now});
 // Auto-transition to dispatched
 order.status='dispatched';
 return order;
}

// Place a machinery order (drills, trucks)
export function placeMachineryOrder(s,machineryType,machineryId,price,now=Date.now()){
 return placeOrder(s,[{type:machineryType,model:machineryId,qty:1,unitPrice:price,category:'machinery'}],now);
}

export function pendingOrders(s){
 return (s.orders||[]).filter(o=>o.status==='pending'||o.status==='dispatched');
}

export function deliveredOrders(s){
 return (s.orders||[]).filter(o=>o.status==='delivered');
}

// Apply a paid machinery delivery to the persistent state before marking its order consumed.
// This also recovers legacy saves that recorded a delivery but lost the scene callback.
export function materializeMachinery(s,item,now=Date.now()){
 if(item.type==='drill'){
  if(!drillDefinition(item.model))return false;
  if(!s.drill)purchaseDrill(s,item.model,true,now);
  return !!s.drill;
 }
 if(item.type==='dthDrill'){
  if(!s.mission4||!dthDrillDefinition(item.model))return false;
  if(!s.mission4.productionDrill)purchaseDthDrill(s,item.model,true,now);
  return !!s.mission4.productionDrill;
 }
 if(item.type==='drillTruck'){
  if(!s.mission4)return false;
  if(!s.mission4.drillTruck)purchaseDrillTruck(s,true,now);
  return !!s.mission4.drillTruck;
 }
 return false;
}

// Check and complete deliveries whose timer has expired
// Returns {delivered, machineryDelivered[]} for the game to handle spawning
export function tickDeliveries(s,now=Date.now()){
 let delivered=0;
 const machineryDelivered=[];
 for(const order of(s.orders||[])){
  if(order.status!=='dispatched'||order.consumed)continue;
  const elapsed=(now-order.dispatchedAt)/1000;
  if(elapsed>=order.dispatchDuration){
   // Pending deliveries do not bypass the warehouse's actual free capacity.
   const incoming=(order.items||[]).filter(i=>i.category!=='machinery').reduce((n,i)=>n+(i.qty||0),0);
   if(incoming>workshopFree(s))continue;
   // Complete persistent transactions before recording them as consumed.
   // A missing mission state remains recoverable on the next restore.
   const machinery=(order.items||[]).filter(item=>item.category==='machinery');
   // Never consume a paid order until its persisted equipment is actually created.
   if(machinery.some(item=>!materializeMachinery(s,item,now)))continue;
   order.status='delivered';
   order.deliveredAt=now;
   if(!order.consumed){
    order.consumed=true;
    for(const item of order.items){
     if(item.category==='machinery'){
      // Machinery: signal to game layer for purchase + spawn
      machineryDelivered.push({type:item.type,model:item.model,orderId:order.id});
      continue;
     }
     // Tools: add to inventory
     const def=item.type==='hammer'?(hammerDefinition(item.model)||dthHammerDefinition(item.model)):(bitDefinition(item.model)||dthBitDefinition(item.model));
     for(let i=0;i<item.qty;i++){
      s.toolInventory.push({
       id:'tool-'+(s.nextId++),
       type:item.type,
       model:item.model,
       name:def?.nameKey||item.model,
       status:'new',
       lifeTotal:def?.lifeTotal||100,
       lifeRemaining:def?.lifeTotal||100,
       purchasedAt:order.orderedAt,
       installedAt:null,
       spentAt:null,
       metersUsed:0,
       boreholeId:null
      });
     }
    }
    delivered++;
   }
  }
 }
 return {delivered,machineryDelivered};
}

// Repair an old delivered order that was marked consumed without creating its rig.
export function reconcileDeliveredMachinery(s,now=Date.now()){
 const repaired=[];
 for(const order of s.orders||[]){
  if(order.status!=='delivered')continue;
  for(const item of order.items||[]){
   if(item.category!=='machinery')continue;
   const existed=item.type==='drill'?!!s.drill:item.type==='dthDrill'?!!s.mission4?.productionDrill:item.type==='drillTruck'?!!s.mission4?.drillTruck:true;
   if(!existed&&materializeMachinery(s,item,now))repaired.push(item.type);
  }
 }
 return repaired;
}

// All orders (for tracking UI)
export function allOrders(s){return s.orders||[];}

// Delivery progress for a specific order (0..1)
// Shared ETA for all Casa Matriz orders (bits, hammers, RC/DTH rigs, DrillTruck).
// Source-of-truth delivery timing stays in dispatchDuration / dispatchedAt.
// Once under 60 seconds, never round back up to "1 min".
export function orderSecondsRemaining(order,now=Date.now()){
 if(!order||order.status==='delivered')return 0;
 if(order.status!=='dispatched'||!Number.isFinite(order.dispatchedAt))return null;
 const duration=Number(order.dispatchDuration);
 if(!Number.isFinite(duration)||duration<=0)return 0;
 return Math.max(0,Math.ceil(duration-(now-order.dispatchedAt)/1000));
}
export function formatOrderETA(order,now=Date.now()){
 const seconds=orderSecondsRemaining(order,now);
 if(seconds===null)return 'Pendiente de despacho';
 if(seconds<=0)return 'Llegando...';
 if(seconds<60)return seconds+' s restantes';
 const minutes=Math.ceil(seconds/60);
 return minutes+' min restantes';
}

export function deliveryProgress(order,now=Date.now()){
 if(!order||order.status==='delivered')return 1;
 if(order.status!=='dispatched')return 0;
 const elapsed=(now-order.dispatchedAt)/1000;
 return Math.min(1,elapsed/order.dispatchDuration);
}
