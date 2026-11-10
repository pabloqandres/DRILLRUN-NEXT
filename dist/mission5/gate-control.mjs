// M5 gate sensor: symmetric on both sides of the only road entry.
// Pure read-only logic; existing Truck/Fleet movement routes remain unchanged.
import {PATIO_L1} from './patio-state.mjs';
export const GATE_PLAYER_TRIGGER_METRES=5.3;
export const GATE_PLAYER_RELEASE_METRES=6.4;
const distance=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z)?
 Math.hypot(p.x-PATIO_L1.gate.x,p.z-PATIO_L1.gate.z):Infinity;
export function playerNeedsGateOpen(position,wasOpen=false){
 return distance(position)<(wasOpen?GATE_PLAYER_RELEASE_METRES:GATE_PLAYER_TRIGGER_METRES);
}
export function gateShouldOpen({position,wasOpen=false,vehicleNear=false,routeInUse=false}={}){
 return playerNeedsGateOpen(position,wasOpen)||!!vehicleNear||!!routeInUse;
}
export function barrierBlocksPlayer(angle){
 // Boom is non-walkable until it is high enough for the avatar to pass.
 return !Number.isFinite(angle)||angle>-.95;
}
