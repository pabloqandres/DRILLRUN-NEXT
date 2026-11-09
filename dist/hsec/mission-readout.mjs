// Mission 2 read-only requirement view. Mirrors tickHsec() completion guards;
// never mutates mission state, HSEC score, economy, assets or save data.
import {HSEC_BALANCE as B} from './catalog.mjs';
import {built,routeLength} from './state.mjs';

export function missionRequirements(s,e,lang='es'){
 const h=s.hsec||{assets:[]};
 const en=lang==='en';
 const vLen=routeLength(h,['vehicle']),pLen=routeLength(h,['pedestrian']);
 const unsafe=e.conflicts.unsafe.length,office=s.office?.level||1;
 const shed=built(h,'shed').length,lighting=Math.round(e.light*100);
 const rows=[
  {id:'office',done:office>=2,
   name:en?'Office upgraded':'Oficina nivel 2',value:en?`Level ${office} / 2`:`Nivel ${office} / 2`,
   help:en?'Upgrade the office to level 2.':'Mejora la oficina y termina su construcción.'},
  {id:'shed',done:shed>0,
   name:en?'Maintenance shed':'Galpón de mantenimiento',value:en?`${shed} built / 1`:`${shed} construido / 1`,
   help:en?'Finish the shed construction.':'Construye el galpón y espera el fin del montaje.'},
  {id:'vehicle',done:!!e.vehicle,
   name:en?'Vehicle access':'Accesos vehiculares',
   value:en?`${vLen.toFixed(1)} m · ${e.vehicle?'Both zones':'Missing zone'}`:`${vLen.toFixed(1)} m · ${e.vehicle?'Ambas zonas reconocidas':'Falta una zona'}`,
   help:en?'Connect vehicle access zones at both buildings.':'Traza camino vehicular hasta las zonas de acceso de ambos edificios.'},
  {id:'pedestrian',done:!!e.pedestrian,
   name:en?'Pedestrian access':'Accesos peatonales',
   value:en?`${pLen.toFixed(1)} m · ${e.pedestrian?'Both zones':'Missing zone'}`:`${pLen.toFixed(1)} m · ${e.pedestrian?'Ambas zonas reconocidas':'Falta una zona'}`,
   help:en?'Connect the pedestrian access zones.':'Traza senderos peatonales hasta los accesos de oficina y galpón.'},
  {id:'crossings',done:unsafe===0,
   name:en?'Protected crossings':'Cruces peatonales protegidos',
   value:en?`${unsafe} unsafe crossings`:`${unsafe} cruce(s) inseguro(s)`,
   help:en?'Place crossings at vehicle/footpath intersections.':'Ubica cruces peatonales sobre las intersecciones entre rutas.'},
  {id:'lighting',done:e.light>=.8,
   name:en?'Lighting coverage':'Cobertura de iluminación',value:`${lighting}% / 80%`,
   help:en?'Use working towers/posts to cover access and route points.':'Distribuye postes o torres operativas cerca de accesos y caminos.'},
  {id:'score',done:e.total>=B.threshold,
   name:en?'HSEC score':'Puntaje HSEC',value:`${e.total} / ${B.threshold}`,
   help:en?'Increase scores with signs, extinguishers, paths and protection.':'Aumenta el puntaje con extintores, señalética, caminos y protecciones.'}
 ];
 return {rows,done:rows.filter(r=>r.done).length,complete:rows.every(r=>r.done),confirmed:!!h.completedAt};
}
