// V86: safe office respawn planner, side-effect free.
// Existing world collision rules determine which location is usable.
// Nothing else in the saved state is changed by this function.
import {CONFIG} from './config.mjs';

export function officeRescueTarget(s,isBlocked=()=>false){
 if(!s||typeof isBlocked!=='function')return null;
 const officeReady=s.office?.status==='built'&&!s.office?.upgrade;
 // Keep every interior candidate within the existing office footprint.
 // (-7.99,-0.5) is exactly the established "enterOffice" spawn.
 const candidates=[
  ...(officeReady?[
   {x:-7.99,z:-.5,inside:true},
   {x:-7.75,z:0,inside:true},
   {x:-7.3,z:.25,inside:true},
   {x:-6.85,z:-.3,inside:true},
   {x:-6.5,z:.4,inside:true},
  ]:[]),
  {...CONFIG.officeSlot.access,inside:false},
  {x:-8.3,z:3.45,inside:false},
  {x:-6.8,z:3.4,inside:false},
  {...CONFIG.spawn,inside:false},
  {x:-5.2,z:5.8,inside:false}
 ];
 for(const p of candidates){
  if(!Number.isFinite(p.x)||!Number.isFinite(p.z))continue;
  try{
   if(!isBlocked(p.x,p.z))return {position:{x:p.x,z:p.z},inside:p.inside};
  }catch{}
 }
 return null;
}
