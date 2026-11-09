// Mission 2 display-only requirements. Mirrors the current tickHsec close gate.
import {evaluation,routeLength} from './state.mjs';
import {HSEC_BALANCE} from './catalog.mjs';
export function mission2Readout(s){
 const h=s.hsec||{assets:[]},e=evaluation(s),office=s.office?.level||1;
 const shed=(h.assets||[]).filter(a=>a.type==='shed'&&a.status==='built').length,unsafe=e.conflicts.unsafe.length;
 const items=[
 {id:'office',name:'Oficina nivel 2',done:office>=2,value:'Nivel '+office+'/2',hint:'Mejora la oficina hasta nivel 2.'},
 {id:'shed',name:'Galpón terminado',done:shed>0,value:shed+' construido(s)',hint:'Finaliza el montaje del galpón.'},
 {id:'vehicle',name:'Ruta vehicular conectada',done:!!e.vehicle,value:routeLength(h,['vehicle']).toFixed(1)+' m · '+(e.vehicle?'Conectada':'Sin conexión'),hint:'Conecta la red vehicular con ambos accesos.'},
 {id:'pedestrian',name:'Ruta peatonal conectada',done:!!e.pedestrian,value:routeLength(h,['pedestrian']).toFixed(1)+' m · '+(e.pedestrian?'Conectada':'Sin conexión'),hint:'Conecta senderos seguros con ambos edificios.'},
 {id:'crossings',name:'Cruces protegidos',done:unsafe===0,value:unsafe+' cruce(s) inseguro(s)',hint:'Ubica pasos autorizados en intersecciones de rutas.'},
 {id:'light',name:'Iluminación mínima',done:e.light>=.8,value:Math.round(e.light*100)+' % / 80 %',hint:'Agrega postes o torres para cubrir las zonas requeridas.'},
 {id:'score',name:'Puntaje HSEC',done:e.total>=HSEC_BALANCE.threshold,value:e.total+' / '+HSEC_BALANCE.threshold,hint:'Suma puntos con extintores, señalética y protecciones.'}
 ];
 const done=items.filter(x=>x.done).length;
 return {items,done,total:items.length,pending:items.find(x=>!x.done)||null,complete:done===items.length,confirmed:!!h.completedAt};
}
