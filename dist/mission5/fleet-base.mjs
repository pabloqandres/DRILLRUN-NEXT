// M5: the yard becomes the sole fleet home AFTER commissioning.
// Data and policy only: no new vehicles, timers, inventory or M4 changes.
import {PATIO_L1} from './patio-state.mjs';

export const FLEET_BAYS=Object.freeze({
 drillTruck:Object.freeze({x:-65,z:-4,area:'covered',id:'C03'}),
 pickup1:Object.freeze({x:-72,z:-3,area:'covered',id:'C01'}),
 pickup2:Object.freeze({x:-68.5,z:-3,area:'covered',id:'C02'}),
 rc:Object.freeze({x:-41.6,z:-1.75,area:'open-drill',id:'D01'}),
 dth:Object.freeze({x:-33.8,z:-1.75,area:'open-drill',id:'D02'}),
 caex1:Object.freeze({x:-58,z:-30,area:'open-heavy',id:'H01'}),
 caex2:Object.freeze({x:-46,z:-30,area:'open-heavy',id:'H02'}),
 earthmover:Object.freeze({x:-34,z:-30,area:'open-heavy',id:'H03'})
});
export const FLEET_GATE=Object.freeze({...PATIO_L1.gate});
export const FLEET_ROAD=Object.freeze({
 // Public worksite approach -> single eastern gate -> internal road spine.
 oldParking:Object.freeze({x:-13.5,z:-9.3}),
 approach:Object.freeze({x:-13.5,z:-14}),
 gate:Object.freeze({...FLEET_GATE}),
 inner:Object.freeze({x:-29,z:-14}),
 spine:Object.freeze({x:-41,z:-14})
});
export function patioFleetActive(s){return s?.mission5?.status==='operational';}
export function fleetHome(s,vehicle){
 if(!patioFleetActive(s))return null;
 return FLEET_BAYS[vehicle]||null;
}
export function rcAvailableToPark(s){
 return patioFleetActive(s)&&!!s.drill&&s.contract?.status==='delivered'&&
  s.drill?.state!=='drilling';
}
export function dthAvailableToPark(s){
 const d=s.mission4?.productionDrill;
 // Assigned rigs remain at their actual worksite, even when waiting for
 // bit maintenance: otherwise equipment is duplicated/teleported.
 return patioFleetActive(s)&&!!d&&!d.assignedZone;
}
export function drillTruckAvailableToPark(s){
 const truck=s.mission4?.drillTruck;
 return patioFleetActive(s)&&!!truck&&truck.state==='parked'&&!truck.maintenancePhase;
}
export function fleetOccupancy(s){
 const ready=patioFleetActive(s),m=s?.mission5||{};
 if(!ready)return {operational:false,covered:[],openDrill:[],openHeavy:[]};
 const covered=[],openDrill=[],openHeavy=[];
 if(s.mission4?.drillTruck){
  covered.push({id:'drillTruck',name:'DrillTruck®',slot:'C03',
   state:m.truckRelocated?'parked':s.mission4.drillTruck.maintenancePhase?'working':'in-transit'});
 }
 if(s.drill){
  openDrill.push({id:'rc',name:'Perforadora RC',slot:'D01',
   state:rcAvailableToPark(s)?m.rcParked?'parked':'in-transit':'working'});
 }
 if(s.mission4?.productionDrill){
  openDrill.push({id:'dth',name:'Perforadora DTH',slot:'D02',
   state:dthAvailableToPark(s)?m.dthParked?'parked':'in-transit':'working'});
 }
 return {operational:true,covered,openDrill,openHeavy};
}
