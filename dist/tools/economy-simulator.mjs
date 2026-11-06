// Economy Simulator — Validates economic viability across all missions
// Uses REAL prices and rewards from the game's source modules.
// Run: node --experimental-vm-modules dist/tools/economy-simulator.mjs
//
// This simulator does NOT modify game state. It calculates whether
// a player can complete missions 1-4 under different spending scenarios.

// ─── Import real game data ─────────────────────────────────────
// Note: These are the actual values from the game's source files.
// If a price changes in the game, it must be updated here too (or
// imported directly if running in a compatible module environment).

// === MISSION 1 COSTS (from config.mjs, module-catalog.mjs) ===
const M1_COSTS={
 officeBuild:3000,      // CONFIG.officeCost → module-catalog office-l1
 desk:350,              // product price
 chair:200,             // product price
 computer:650,          // product price
 total:4200             // sum of required purchases
};
const M1_REWARD=5000;   // useOfficeComputer reward

// === MISSION 2 COSTS (from hsec/catalog.mjs, hsec/state.mjs, module-catalog.mjs) ===
const M2_GRANT=10500;   // HSEC starting grant
const M2_COSTS={
 officeL2:1500,         // module-catalog office-l2
 shed:2600,             // HSEC catalog
 vehicleRoad:{perMeter:65,minMeters:4,typicalMeters:6},
 pedestrianRoad:{perMeter:40,minMeters:4,typicalMeters:6},
 extinguishers:{price:150,required:2},
 lightingPost:{price:230,min:2,typical:2},
 lightingTower:{price:450,min:0,typical:0},
 barriers:{perMeter:48,minMeters:2,typicalMeters:4},
 signs:{price:75,required:2},
 cones:0,               // first 6 free from kit
 hsecEmployee:350,      // hire cost
};
const M2_REWARD=35000;  // HSEC completion reward

// === MISSION 3 COSTS (from drills.mjs, personnel.mjs, geology.mjs, headquarters.mjs, contracts.mjs) ===
const M3_SAFETY_NET=25000; // minimum funds guarantee
const M3_COSTS={
 admin:800,             // personnel hire
 geoAnalysis:500,       // geology request
 drillCompact:12000,    // rig_rc_compact
 drillAdvanced:22000,   // rig_rc_advanced
 driller:600,           // personnel hire
 helper:250,            // personnel hire (optional, ×2 max)
 hammerExplora40:3500,  // cheapest compatible hammer
 hammerExplora45:4200,
 hammerExplora50:5000,
 hammerExplora51:5800,
 bitBallistic4:380,     // cheapest bit
 bitDome4:450,
 bitFlatface45:420,
 bitDome5:550,
 bitConic5:600,
 deliveryFee:200,       // per order
};
const M3_CONTRACT={
 baseReward:60000,
 speedBonus:5000,       // if completed within 900s
 budgetBonus:8000,      // if expenses < 42000 (70% of reward)
 totalMeters:180,
 boreholes:6,
 duration:900,          // seconds
};

// === MISSION 4 COSTS (from mission4/*.mjs) ===
const M4_SAFETY_NET=30000;
const M4_COSTS={
 workshopNv2:8000,      // inventory.mjs WORKSHOP_LEVELS[1]
 dthDrill:28000,        // drills-dth.mjs rig_dth_production
 pumaDth6:6500,         // cheapest DTH hammer
 pumaDth8:9000,
 dthBitButton6:800,     // cheapest DTH bit
 dthBitButton8:1100,
 dthTricon8:1400,
 tecnicoDrillco:5000,   // personnel hire
 drillTruck:12000,      // drilltruck.mjs
 deliveryFee:200,
};
const M4_PRODUCTION={
 cycleSeconds:900,      // 15 minutes
 baseIncomePerCycle:2500,
 // Actual income: base × geologyQuality × (depth/30)
};

// ─── Scenario Definitions ──────────────────────────────────────

function scenarioEfficient(){
 return {
  name:'Eficiente',
  description:'Compra solo lo obligatorio, administra inventario correctamente',
  m1Extra:0,
  m2ExtraRoads:0,m2ExtraLighting:0,m2ExtraBarriers:0,
  m3Drill:'compact',m3ExtraTools:0,m3Helpers:0,m3SpeedBonus:true,m3BudgetBonus:true,
  m4DthHammer:'cheap',m4DthBit:'cheap',m4ExtraTools:0,
 };
}

function scenarioNormal(){
 return {
  name:'Normal',
  description:'Compras necesarias + algunas adicionales razonables',
  m1Extra:0,
  m2ExtraRoads:2,m2ExtraLighting:1,m2ExtraBarriers:2,
  m3Drill:'compact',m3ExtraTools:1,m3Helpers:1,m3SpeedBonus:true,m3BudgetBonus:false,
  m4DthHammer:'cheap',m4DthBit:'mid',m4ExtraTools:1,
 };
}

function scenarioWithErrors(){
 return {
  name:'Con errores menores',
  description:'Compra innecesaria, repone consumible, pierde bonos',
  m1Extra:350,           // buys extra furniture
  m2ExtraRoads:4,m2ExtraLighting:2,m2ExtraBarriers:4,
  m3Drill:'compact',m3ExtraTools:2,m3Helpers:2,m3SpeedBonus:false,m3BudgetBonus:false,
  m4DthHammer:'expensive',m4DthBit:'expensive',m4ExtraTools:2,
 };
}

// ─── Simulation Engine ─────────────────────────────────────────

function simulateMission1(startingCash,scenario){
 const costs=M1_COSTS.total+scenario.m1Extra;
 const endCash=startingCash-costs+M1_REWARD;
 return {
  mission:'Misión 1 — Tus primeros pasos',
  startingCash,
  costs,
  reward:M1_REWARD,
  endCash,
  viable:endCash>=0,
  details:{
   officeBuild:M1_COSTS.officeBuild,
   furniture:M1_COSTS.desk+M1_COSTS.chair+M1_COSTS.computer,
   extra:scenario.m1Extra,
  }
 };
}

function simulateMission2(startingCash,scenario){
 const roads=M2_COSTS.vehicleRoad.perMeter*(M2_COSTS.vehicleRoad.typicalMeters+scenario.m2ExtraRoads)
  +M2_COSTS.pedestrianRoad.perMeter*(M2_COSTS.pedestrianRoad.typicalMeters+scenario.m2ExtraRoads);
 const lighting=M2_COSTS.lightingPost.price*(M2_COSTS.lightingPost.typical+scenario.m2ExtraLighting);
 const barriers=M2_COSTS.barriers.perMeter*(M2_COSTS.barriers.typicalMeters+scenario.m2ExtraBarriers);
 const costs=M2_COSTS.officeL2+M2_COSTS.shed+roads+
  M2_COSTS.extinguishers.price*M2_COSTS.extinguishers.required+
  lighting+barriers+
  M2_COSTS.signs.price*M2_COSTS.signs.required+
  M2_COSTS.hsecEmployee;
 const cashWithGrant=startingCash+M2_GRANT;
 const endCash=cashWithGrant-costs+M2_REWARD;
 return {
  mission:'Misión 2 — Prepara tu operación',
  startingCash,
  grant:M2_GRANT,
  cashAvailable:cashWithGrant,
  costs,
  reward:M2_REWARD,
  endCash,
  viable:endCash>=0&&cashWithGrant>=costs,
  canAffordDuringMission:cashWithGrant>=costs,
  details:{
   officeUpgrade:M2_COSTS.officeL2,
   shed:M2_COSTS.shed,
   roads,
   lighting,
   barriers,
   extinguishers:M2_COSTS.extinguishers.price*M2_COSTS.extinguishers.required,
   signs:M2_COSTS.signs.price*M2_COSTS.signs.required,
   employee:M2_COSTS.hsecEmployee,
  }
 };
}

function simulateMission3(startingCash,scenario){
 // Safety net
 const safetyBonus=startingCash<M3_SAFETY_NET?M3_SAFETY_NET-startingCash:0;
 const cashAfterSafety=startingCash+safetyBonus;

 const drillCost=scenario.m3Drill==='compact'?M3_COSTS.drillCompact:M3_COSTS.drillAdvanced;
 const hammerCost=M3_COSTS.hammerExplora40; // cheapest
 const bitCost=M3_COSTS.bitBallistic4;      // cheapest
 const extraTools=scenario.m3ExtraTools*(bitCost+M3_COSTS.deliveryFee);
 const helperCost=scenario.m3Helpers*M3_COSTS.helper;

 const costs=M3_COSTS.admin+M3_COSTS.geoAnalysis+drillCost+M3_COSTS.driller+
  helperCost+hammerCost+bitCost+M3_COSTS.deliveryFee*2+extraTools;

 // Contract expenses (for budget bonus check)
 const contractExpenses=drillCost+hammerCost+bitCost+M3_COSTS.deliveryFee*2+extraTools;

 let reward=M3_CONTRACT.baseReward;
 if(scenario.m3SpeedBonus)reward+=M3_CONTRACT.speedBonus;
 if(scenario.m3BudgetBonus&&contractExpenses<M3_CONTRACT.baseReward*0.7)reward+=M3_CONTRACT.budgetBonus;

 const endCash=cashAfterSafety-costs+reward;
 return {
  mission:'Misión 3 — Tu primer contrato',
  startingCash,
  safetyBonus,
  cashAvailable:cashAfterSafety,
  costs,
  contractExpenses,
  reward,
  speedBonus:scenario.m3SpeedBonus?M3_CONTRACT.speedBonus:0,
  budgetBonus:scenario.m3BudgetBonus&&contractExpenses<M3_CONTRACT.baseReward*0.7?M3_CONTRACT.budgetBonus:0,
  endCash,
  viable:endCash>=0&&cashAfterSafety>=costs,
  canAffordDuringMission:cashAfterSafety>=costs,
  details:{
   admin:M3_COSTS.admin,
   geoAnalysis:M3_COSTS.geoAnalysis,
   drill:drillCost,
   driller:M3_COSTS.driller,
   helpers:helperCost,
   hammer:hammerCost,
   bit:bitCost,
   deliveryFees:M3_COSTS.deliveryFee*2,
   extraTools,
  }
 };
}

function simulateMission4(startingCash,scenario,workshopAlreadyNv2=true){
 const safetyBonus=startingCash<M4_SAFETY_NET?M4_SAFETY_NET-startingCash:0;
 const cashAfterSafety=startingCash+safetyBonus;

 const workshopCost=workshopAlreadyNv2?0:M4_COSTS.workshopNv2;
 const hammerCost=scenario.m4DthHammer==='cheap'?M4_COSTS.pumaDth6:M4_COSTS.pumaDth8;
 const bitCost=scenario.m4DthBit==='cheap'?M4_COSTS.dthBitButton6:
  scenario.m4DthBit==='mid'?M4_COSTS.dthBitButton8:M4_COSTS.dthTricon8;
 const extraTools=scenario.m4ExtraTools*M4_COSTS.dthBitButton6;

 const costs=workshopCost+M4_COSTS.dthDrill+hammerCost+bitCost+
  M4_COSTS.tecnicoDrillco+M4_COSTS.drillTruck+
  M4_COSTS.deliveryFee*2+extraTools;

 const endCash=cashAfterSafety-costs;
 // Production income starts after completion
 const estimatedFirstCycleIncome=Math.round(M4_PRODUCTION.baseIncomePerCycle*0.6); // avg quality

 return {
  mission:'Misión 4 — Automatiza tu operación',
  startingCash,
  safetyBonus,
  cashAvailable:cashAfterSafety,
  costs,
  endCash,
  viable:endCash>=0&&cashAfterSafety>=costs,
  canAffordDuringMission:cashAfterSafety>=costs,
  productionIncomePerCycle:estimatedFirstCycleIncome,
  productionIncomePerHour:estimatedFirstCycleIncome*4,
  details:{
   workshop:workshopCost,
   dthDrill:M4_COSTS.dthDrill,
   hammer:hammerCost,
   bit:bitCost,
   tecnico:M4_COSTS.tecnicoDrillco,
   drillTruck:M4_COSTS.drillTruck,
   deliveryFees:M4_COSTS.deliveryFee*2,
   extraTools,
  }
 };
}

// ─── Full Simulation ────────────────────────────────────────────

export function runSimulation(startingCash=5000){
 const scenarios=[scenarioEfficient(),scenarioNormal(),scenarioWithErrors()];
 const results=[];

 for(const scenario of scenarios){
  const m1=simulateMission1(startingCash,scenario);
  const m2=simulateMission2(m1.endCash,scenario);
  const m3=simulateMission3(m2.endCash,scenario);
  const m4=simulateMission4(m3.endCash,scenario,true); // workshop already Nv2 from M2

  const allViable=m1.viable&&m2.viable&&m3.viable&&m4.viable;
  const blockers=[];
  if(!m1.viable)blockers.push('M1: saldo insuficiente');
  if(!m2.viable)blockers.push('M2: saldo insuficiente');
  if(!m2.canAffordDuringMission)blockers.push('M2: no puede costear gastos durante misión');
  if(!m3.viable)blockers.push('M3: saldo insuficiente');
  if(!m3.canAffordDuringMission)blockers.push('M3: no puede costear gastos durante misión');
  if(!m4.viable)blockers.push('M4: saldo insuficiente');
  if(!m4.canAffordDuringMission)blockers.push('M4: no puede costear gastos durante misión');

  results.push({
   scenario:scenario.name,
   description:scenario.description,
   missions:[m1,m2,m3,m4],
   allViable,
   blockers,
   finalCash:m4.endCash,
   totalEarned:M1_REWARD+M2_GRANT+M2_REWARD+m3.reward,
   totalSpent:m1.costs+m2.costs+m3.costs+m4.costs,
  });
 }
 return results;
}

// ─── Report Generator ───────────────────────────────────────────

export function generateReport(startingCash=5000){
 const results=runSimulation(startingCash);
 const lines=[];
 lines.push('═══════════════════════════════════════════════════════════');
 lines.push('  DRILL RUN NEXT GENERATION — Simulación Económica');
 lines.push('  Saldo inicial: '+startingCash.toLocaleString('es-CL'));
 lines.push('═══════════════════════════════════════════════════════════');

 for(const r of results){
  lines.push('');
  lines.push('───────────────────────────────────────────────────────────');
  lines.push(`  ESCENARIO: ${r.scenario}`);
  lines.push(`  ${r.description}`);
  lines.push('───────────────────────────────────────────────────────────');

  for(const m of r.missions){
   lines.push('');
   lines.push(`  ${m.mission}`);
   lines.push(`    Saldo inicial:    ${m.startingCash.toLocaleString('es-CL')}`);
   if(m.grant)lines.push(`    Subsidio:         +${m.grant.toLocaleString('es-CL')}`);
   if(m.safetyBonus)lines.push(`    Safety net:       +${m.safetyBonus.toLocaleString('es-CL')}`);
   lines.push(`    Gastos:           -${m.costs.toLocaleString('es-CL')}`);

   // Detail breakdown
   for(const[k,v]of Object.entries(m.details)){
    if(v>0)lines.push(`      ${k}: -${v.toLocaleString('es-CL')}`);
   }

   lines.push(`    Recompensa:       +${(m.reward||0).toLocaleString('es-CL')}`);
   if(m.speedBonus)lines.push(`      (bonus velocidad: +${m.speedBonus.toLocaleString('es-CL')})`);
   if(m.budgetBonus)lines.push(`      (bonus presupuesto: +${m.budgetBonus.toLocaleString('es-CL')})`);
   lines.push(`    Saldo final:      ${m.endCash.toLocaleString('es-CL')}`);
   lines.push(`    ${m.viable?'✓ VIABLE':'✗ BLOQUEADO'}`);
   if(!m.canAffordDuringMission)lines.push(`    ⚠ No puede costear durante la misión`);
  }

  lines.push('');
  lines.push(`  RESULTADO: ${r.allViable?'✓ PROGRESIÓN VIABLE':'✗ BLOQUEADO'}`);
  if(r.blockers.length)lines.push(`  Problemas: ${r.blockers.join(', ')}`);
  lines.push(`  Saldo final M4: ${r.finalCash.toLocaleString('es-CL')}`);
  lines.push(`  Total ganado: ${r.totalEarned.toLocaleString('es-CL')}`);
  lines.push(`  Total gastado: ${r.totalSpent.toLocaleString('es-CL')}`);
 }

 lines.push('');
 lines.push('═══════════════════════════════════════════════════════════');
 lines.push('  RESUMEN DE VIABILIDAD');
 lines.push('═══════════════════════════════════════════════════════════');
 for(const r of results){
  lines.push(`  ${r.scenario}: ${r.allViable?'✓':'✗'} Final: ${r.finalCash.toLocaleString('es-CL')}`);
 }

 // Margin analysis
 const normal=results.find(r=>r.scenario==='Normal');
 if(normal){
  lines.push('');
  lines.push('  Margen económico (escenario Normal):');
  for(let i=0;i<normal.missions.length;i++){
   const m=normal.missions[i];
   const margin=m.endCash;
   const nextCost=i<normal.missions.length-1?normal.missions[i+1].costs:0;
   const pct=nextCost>0?Math.round(margin/nextCost*100):999;
   lines.push(`    ${m.mission}: ${margin.toLocaleString('es-CL')} (${pct}% de siguiente misión)`);
  }
 }

 lines.push('');
 return lines.join('\n');
}

// ─── CLI Entry Point ────────────────────────────────────────────
// Run directly: node dist/tools/economy-simulator.mjs
if(typeof process!=='undefined'&&process.argv){
 console.log(generateReport(5000));
}
