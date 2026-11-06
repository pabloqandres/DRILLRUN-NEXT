// Mission 3 — Borehole management (up to 6 sites in expanded east zone)
// Each borehole tracks position, depth progress, stratigraphy, and status.
import {BOREHOLE_SITES} from './contracts.mjs';

export const MAX_BOREHOLES=6;
export const BOREHOLE_ZONE={xMin:18,xMax:30,zMin:-10,zMax:8};

export function boreholeAt(s,id){return (s.boreholes||[]).find(b=>b.id===id);}

export function activeBoreholes(s){return (s.boreholes||[]).filter(b=>b.status==='active');}

export function completedBoreholes(s){return (s.boreholes||[]).filter(b=>b.status==='completed');}

export function pendingBoreholes(s){return (s.boreholes||[]).filter(b=>b.status==='pending');}

export function boreholeProgress(borehole){
 return borehole&&borehole.depthTarget>0?borehole.depthDrilled/borehole.depthTarget:0;
}

export function allBoreholesComplete(s){
 return (s.boreholes||[]).length>=6&&(s.boreholes||[]).every(b=>b.status==='completed');
}

export function totalMetersDrilled(s){
 return (s.boreholes||[]).reduce((n,b)=>n+b.depthDrilled,0);
}

// Get the site definitions for map placement
export function boreholeSites(){return BOREHOLE_SITES;}

// Current active borehole (the one being drilled)
export function currentBorehole(s){
 if(!s.contract)return null;
 return s.boreholes?.[s.contract.activeBoreholeIndex]||null;
}
