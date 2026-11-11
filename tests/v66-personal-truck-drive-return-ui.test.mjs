import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {drivePersonalTruck,PERSONAL_TRUCK_MAX_SPEED,personalTruckVisualSteer} from '../dist/mission5/personal-drilltruck.mjs';
import {returnToWorksite,LONG_ABSENCE_MS} from '../dist/mission5/personal-session-return.mjs';
import {FLEET_BAYS} from '../dist/mission5/fleet-base.mjs';
import {staffHeightRatio} from '../dist/mission5/patio-npc-world.mjs';
import {wheelRotationDelta} from '../dist/graphics/personal-truck-wheels-v66.mjs';
import {CONFIG} from '../dist/chapter/config.mjs';
const source=x=>readFileSync(new URL('../'+x,import.meta.url),'utf8');
const copy=x=>structuredClone(x);
const fixture=()=>({
 savedAt:Date.now()-10000,position:{x:-10,z:-3},inside:false,
 cash:765432,bank:125000,nextId:44,
 mission4:{drillTruck:{id:'m4-auto',position:{x:45,z:12},state:'parked'}},
 mission5:{status:'operational',personalTruck:{
  id:'drilltruck-personal-02',role:'personal',mode:'parked',
  position:{x:35,z:45},heading:0,speed:0,headlightsOn:true,deliveredAt:111
 }}
});
const driveFixture=()=>{const s=fixture();s.mission5.personalTruck.mode='driving';s.mission5.personalTruck.position={x:0,z:0};s.position={x:0,z:0};return s;};

test('V66 returns the ONE owned truck to P01 at next Continue, never M4 truck or money',()=>{
 const s=fixture(),before=copy(s.mission4),cash=s.cash,bank=s.bank,id=s.nextId;
 const r=returnToWorksite(s,{now:500000,previousSavedAt:450000});
 assert(r.truck);assert(r.atP01);
 assert.deepEqual(s.mission5.personalTruck.position,{x:FLEET_BAYS.personalTruck.x,z:FLEET_BAYS.personalTruck.z});
 assert.equal(s.mission5.personalTruck.heading,FLEET_BAYS.personalTruck.heading);
 assert.equal(s.mission5.personalTruck.mode,'parked');
 assert.equal(s.mission5.personalTruck.headlightsOn,true);
 assert.equal(s.mission5.personalTruck.deliveredAt,111);
 assert.deepEqual(s.mission4,before);
 assert.equal(s.cash,cash);assert.equal(s.bank,bank);assert.equal(s.nextId,id);
});
test('V66 after 3.5 hours operator returns to the front of office, vehicle P01',()=>{
 const s=fixture(),now=Date.now();
 s.mission5.personalTruck.mode='driving';s.position={...s.mission5.personalTruck.position};
 const r=returnToWorksite(s,{now,previousSavedAt:now-LONG_ABSENCE_MS-1000});
 assert.equal(r.longAbsence,true);assert.equal(r.operator,true);
 assert.deepEqual(s.position,CONFIG.officeSlot.access);assert.equal(s.inside,false);
 assert.deepEqual(s.mission5.personalTruck.position,{x:FLEET_BAYS.personalTruck.x,z:FLEET_BAYS.personalTruck.z});
 assert.equal(s.mission5.personalTruck.mode,'parked');assert.equal(s.mission5.personalTruck.speed,0);
});
test('V66 short logout from the wheel never strands operator in a remote pit',()=>{
 const s=fixture(),now=Date.now();s.mission5.personalTruck.mode='driving';s.position={...s.mission5.personalTruck.position};
 const r=returnToWorksite(s,{now,previousSavedAt:now-5000});
 assert.equal(r.longAbsence,false);assert.equal(r.operator,true);
 assert.deepEqual(s.position,{x:FLEET_BAYS.personalTruck.x-3.8,z:FLEET_BAYS.personalTruck.z});
});
test('V66 at P01 short return does not teleport player or duplicate units',()=>{
 const s=fixture(),now=Date.now();s.mission5.personalTruck.position={x:FLEET_BAYS.personalTruck.x,z:FLEET_BAYS.personalTruck.z};
 s.mission5.personalTruck.heading=FLEET_BAYS.personalTruck.heading;s.position={x:-7,z:8};
 const old=copy(s);const r=returnToWorksite(s,{now,previousSavedAt:now-1000});
 assert.equal(r.returned,false);assert.deepEqual(s,old);
});
test('V66 long return works even before M5 and never creates free truck',()=>{
 const s=fixture();s.mission5=null;
 const now=Date.now();const r=returnToWorksite(s,{now,previousSavedAt:now-LONG_ABSENCE_MS*2});
 assert.equal(r.truck,false);assert.deepEqual(s.position,CONFIG.officeSlot.access);assert.equal(s.mission5,null);
});
test('V66 pickup gains speed progressively and brake reduces it without instantly stopping',()=>{
 const s=driveFixture();const truck=s.mission5.personalTruck;
 drivePersonalTruck(s,{throttle:1},.08,()=>false);
 assert(truck.speed>.10 && truck.speed<.22,'first acceleration step is small');
 for(let i=0;i<100;i++)drivePersonalTruck(s,{throttle:1},.08,()=>false);
 assert(truck.speed>7&&truck.speed<=PERSONAL_TRUCK_MAX_SPEED);
 const old=truck.speed;
 drivePersonalTruck(s,{brake:true},.08,()=>false);
 assert(truck.speed>0&&truck.speed<old);
 assert(old-truck.speed<=.47);
 for(let i=0;i<40;i++)drivePersonalTruck(s,{brake:true},.08,()=>false);
 assert.equal(truck.speed,0);
});
test('V66 changing to reverse first brakes vehicle then starts moving backwards',()=>{
 const s=driveFixture(),truck=s.mission5.personalTruck;
 for(let i=0;i<80;i++)drivePersonalTruck(s,{throttle:1},.08,()=>false);
 const was=truck.speed;
 drivePersonalTruck(s,{throttle:-1},.08,()=>false);
 assert(truck.speed>0&&truck.speed<was,'first reverse command is a braking impulse');
 let reversed=false;
 for(let i=0;i<70;i++){drivePersonalTruck(s,{throttle:-1},.08,()=>false);if(truck.speed<0)reversed=true;}
 assert(reversed,'reverse eventually engages from standstill');
 assert(truck.speed>=-3.0);
});
test('V66 bicycle heading is speed based, cannot spin on spot, steering eases naturally',()=>{
 const s=driveFixture(),truck=s.mission5.personalTruck;
 const h=truck.heading;drivePersonalTruck(s,{steer:1},.08,()=>false);
 assert.equal(truck.heading,h,'no tank turning on the spot');
 assert(truck.steerAngle>0&&truck.steerAngle<.56);
 for(let i=0;i<65;i++)drivePersonalTruck(s,{throttle:1,steer:1},.08,()=>false);
 assert(truck.heading>h,'forward turning with wheelbase');
 const old=truck.steerAngle;
 drivePersonalTruck(s,{throttle:0,steer:0},.08,()=>false);
 assert(Math.abs(truck.steerAngle)<Math.abs(old),'wheel returns smoothly');
 assert.equal(personalTruckVisualSteer(1),-1);
});
test('V66 wheel angular distance and staff ratios stay bounded',()=>{
 assert(Math.abs(wheelRotationDelta(1,.5)-2)<1e-10);
 assert.equal(wheelRotationDelta(1,0),0);
 assert.equal(staffHeightRatio(1,2,'security'),2.02);
 assert.equal(staffHeightRatio(0,2,'security'),1);
 assert(staffHeightRatio(.1,3,'security')<=3.5);
});
test('V66 UI/texture audio and game hooks preserve mission and Cloud Save invariants',()=>{
 const game=source('dist/chapter/game.mjs'),audio=source('dist/audio/worksite-audio.mjs');
 const css=source('dist/chapter/drilltruck-cockpit-v66.css'),html=source('dist/index.html');
 const title=source('dist/title-preview-v65.html'),npc=source('dist/mission5/patio-npc-world.mjs');
 assert(game.includes('returnToWorksite(s,{previousSavedAt:resumeBaselineSavedAt})'));
 assert(game.includes('resumeBaselineSavedAt=Number(result.state?.savedAt)'));
 assert(game.includes("if(resuming&&!reviewBackup)"));
 assert(game.includes('new PersonalTruckWheels(m5PersonalTruckModel)'));
 assert(game.includes('m5TruckWheels?.update(result?.speed||0,result?.steerAngle||0,dt)'));
 assert(game.includes("const result=drivePersonalTruck(s,"));
 assert(game.includes("cloudTakeControl(s,cloudLock)"));
 assert(game.includes("function save(){"));
 assert(game.includes("function beginPlay(resuming=false)"));
 assert(game.includes('recoverPersonalTruckToBay(s)'));
 assert(html.includes('drilltruck-cockpit-v66.css?v=66'));
 assert(css.includes('right:calc(var(--safe-r,18px) + 100px)'));
 assert(css.includes('width:47px!important;height:47px!important'));
 assert(audio.includes('createSoftPickupMotor'));
 assert(!audio.includes("this.personalTruck=engine(65,450,450)"));
 assert(npc.includes('avatarDefinition(this.world.player.userData.character).height'));
 assert(!npc.includes('heightOf(this.world.player)'));
 assert(npc.includes('staffHeightRatio(npcVisible>0.2?npcVisible:baseline,avatarReferenceHeight,def.role)'));
 assert(title.includes('animation:titleSweep 10s'));
 assert(!title.includes('rgba(255,255,255,.20) 50%'));
 assert(!title.includes('#f5f9ff 50%'));
});
