// Unique NPC IDs; M5 models are approved but will not spawn until purchased.
// Binary GLBs must exist at the filenames below before M5 SMS unlocks.
export const NPC_LIBRARY_RESERVATIONS=Object.freeze([
 Object.freeze({id:'m5-gate-security',role:'guardia-acceso',asset:'npc-m5-gate-security.glb',mission:'m5'}),
 Object.freeze({id:'m5-warehouse-tech',role:'tecnico-bodega',asset:'npc-m5-warehouse-tech.glb',mission:'m5'}),
 Object.freeze({id:'future-heavy-operator',role:'operador-maquinaria',asset:null,mission:'future'}),
 Object.freeze({id:'future-maintenance-mechanic',role:'mecanico',asset:null,mission:'future'}),
 Object.freeze({id:'future-fuel-operator',role:'operador-combustible',asset:null,mission:'future'}),
 Object.freeze({id:'future-operations-supervisor',role:'supervisor',asset:null,mission:'future'})
]);
export function verifyUniqueNpcIds(entries=NPC_LIBRARY_RESERVATIONS){
 const ids=new Set();
 for(const entry of entries){
  if(!entry?.id||ids.has(entry.id))return false;
  ids.add(entry.id);
 }
 return true;
}
