// DRILL RUN NEXT GENERATION — M5 staff. Permanent, player-funded jobs.
// NO clone of HSEC prevencionistas and NO automatic personnel on build.
// HSEC safety scoring, M4 production and Fleet still own their state.
export const PATIO_STAFF=Object.freeze([
 Object.freeze({id:'m5-gate-security',label:'Guardia de acceso',role:'security',
  cost:1800,site:{x:-29,z:-7.5},asset:'npc-m5-gate-security.glb'}),
 Object.freeze({id:'m5-warehouse-tech',label:'Técnica de bodega',role:'logistics',
  cost:2200,site:{x:-69.5,z:-20},asset:'npc-m5-warehouse-tech.glb'})
]);
export const STAFF_BY_ID=Object.freeze(Object.fromEntries(PATIO_STAFF.map(p=>[p.id,p])));
export const STAFF_IDS=Object.freeze(PATIO_STAFF.map(e=>e.id));
export const hiredPatioStaff=(s,id)=>Boolean(s?.mission5?.staff?.[id]?.hiredAt);
export const canHirePatioStaff=(s,id)=>{
 const def=STAFF_BY_ID[id];
 if(!def)return 'unknownStaff';
 if(s?.mission5?.status!=='operational')return 'buildPatioFirst';
 if(s?.narrative&&!s.narrative.accepted?.includes('m5'))return 'acceptM5First';
 if(hiredPatioStaff(s,id))return 'alreadyHired';
 if(id==='m5-warehouse-tech'&&!hiredPatioStaff(s,'m5-gate-security'))return 'hireGuardFirst';
 if(!Number.isFinite(s?.cash)||s.cash<def.cost)return 'noMoney';
 return null;
};
export function hirePatioStaff(s,id,now=Date.now()){
 const reason=canHirePatioStaff(s,id);
 if(reason)throw new Error(reason);
 const def=STAFF_BY_ID[id];
 s.cash-=def.cost;
 s.mission5.staff??={};
 // One roster entry per role, persisted in Cloud Save.
 s.mission5.staff[id]={id,role:def.role,hiredAt:now,position:{...def.site}};
 s.ledger??=[];s.nextId??=1;
 s.ledger.push({id:s.nextId++,key:'m5Personnel',role:id,amount:-def.cost,at:now});
 return s.mission5.staff[id];
}
export const gateChecked=s=>Boolean(s?.mission5?.gateCheckedAt);
export const warehouseChecked=s=>Boolean(s?.mission5?.warehouseCheckedAt);
export function inspectPatioGate(s,now=Date.now()){
 if(!hiredPatioStaff(s,'m5-gate-security'))throw new Error('hireGuardFirst');
 if(!hiredPatioStaff(s,'m5-warehouse-tech'))throw new Error('hireTechnicianFirst');
 if(s?.mission5?.status!=='operational'||!s.mission5?.hsecApproved)throw new Error('needsHsec');
 s.mission5.gateCheckedAt??=now;
 s.mission5.gateCheckCount=(s.mission5.gateCheckCount||0)+1;
 commissionPatio(s,now);
 return s.mission5.gateCheckedAt;
}
export function inspectPatioWarehouse(s,now=Date.now()){
 if(!hiredPatioStaff(s,'m5-warehouse-tech'))throw new Error('hireTechFirst');
 if(!gateChecked(s))throw new Error('verifyGateFirst');
 if(s?.mission5?.status!=='operational')throw new Error('buildPatioFirst');
 const inventory=(s.toolInventory||[]).filter(e=>e.status==='new'||e.status==='stored'||e.status==='available');
 const bits=inventory.filter(e=>e.type==='bit').length;
 const hammers=inventory.filter(e=>e.type==='hammer').length;
 // Check is a snapshot of player-owned stock, not free consumables.
 s.mission5.lastWarehouseAudit={at:now,bits,hammers,total:inventory.length};
 s.mission5.warehouseCheckedAt??=now;
 commissionPatio(s,now);
 return s.mission5.lastWarehouseAudit;
}
export const mission5Objectives=s=>{
 const p=s?.mission5;
 return [
  {id:'build',label:'Construir Patio L1 · 20 min',done:p?.status==='operational'},
  {id:'guard',label:'Contratar guardia de acceso',done:hiredPatioStaff(s,'m5-gate-security')},
  {id:'technician',label:'Contratar técnica de bodega',done:hiredPatioStaff(s,'m5-warehouse-tech')},
  {id:'gate',label:'Verificar acceso y barrera HSEC',done:gateChecked(s)},
  {id:'inventory',label:'Realizar control inicial de bodega',done:warehouseChecked(s)}
 ];
};
export function commissionPatio(s,now=Date.now()){
 const p=s?.mission5;
 if(!p||p.status!=='operational'||p.commissionedAt)return false;
 if(!mission5Objectives(s).every(x=>x.done))return false;
 p.commissionedAt=now;
 return true;
}
