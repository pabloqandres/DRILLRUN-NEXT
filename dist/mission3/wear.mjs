// Mission 3 — Tool wear system
// Bits and hammers degrade with use; must be replaced from inventory.
import {bitDefinition,hammerDefinition} from './drills.mjs';
import {layerAtDepth} from './geology.mjs';
import {retireTool,availableTools} from './inventory.mjs';

const fail=msg=>{throw new Error(msg);};

// Wear multipliers by rock hardness
const HARDNESS_WEAR={
 1:0.6, 2:0.7, 3:0.8, 4:0.9, 5:1.0,
 6:1.1, 7:1.3, 8:1.5, 9:1.8, 10:2.0
};

// Abrasivity multipliers
const ABRASIVITY_WEAR={
 low:0.8, medium:1.0, high:1.3, veryHigh:1.6
};

// Compatibility multiplier (suboptimal tool for rock type)
function compatibilityFactor(tool,layer){
 if(!tool||!layer)return 1.0;
 const def=tool.type==='bit'?bitDefinition(tool.model):hammerDefinition(tool.model);
 if(!def)return 1.0;
 // Optimal match → 1.0, suboptimal → 1.5 (wears faster)
 if(tool.type==='bit'){
  if(layer.hardness>=8&&def.type==='dome')return 1.0; // dome good for hard
  if(layer.hardness>=8&&def.type==='conic')return 1.0; // conic good for hard
  if(layer.hardness<=5&&def.type==='ballistic')return 1.0; // ballistic for medium
  if(layer.abrasivity==='veryHigh'&&def.type==='dome')return 1.1;
  return 1.3; // suboptimal
 }
 return 1.0; // hammers have simpler compatibility
}

// Apply wear to the currently installed tools for a given number of meters
export function applyWear(s,metersAdvanced,borehole){
 if(!s.drill||metersAdvanced<=0)return {bitOk:true,hammerOk:true};
 const depth=borehole?.depthDrilled||0;
 const strata=borehole?.geology?.strata;
 const layer=strata?layerAtDepth(strata,depth):null;
 const hardnessMul=HARDNESS_WEAR[layer?.hardness||5]||1.0;
 const abrasivityMul=ABRASIVITY_WEAR[layer?.abrasivity||'medium']||1.0;
 let bitOk=true,hammerOk=true;
 // Wear bit
 if(s.drill.installedBit){
  const bit=(s.toolInventory||[]).find(t=>t.id===s.drill.installedBit);
  if(bit){
   const factor=hardnessMul*abrasivityMul*compatibilityFactor(bit,layer);
   const wear=metersAdvanced*factor;
   bit.lifeRemaining=Math.max(0,bit.lifeRemaining-wear);
   bit.metersUsed+=metersAdvanced;
   if(bit.lifeRemaining<=0){
    bit.status='spent';
    retireTool(s,bit.id);
    // Auto-replace from inventory
    const replacement=availableTools(s,'bit')[0];
    if(replacement){
     replacement.status='installed';
     replacement.installedAt=Date.now();
     s.drill.installedBit=replacement.id;
    }else{
     s.drill.installedBit=null;
     bitOk=false;
    }
   }
  }
 }else bitOk=false;
 // Wear hammer (much slower — ~1/8 of bit wear)
 if(s.drill.installedHammer){
  const hammer=(s.toolInventory||[]).find(t=>t.id===s.drill.installedHammer);
  if(hammer){
   const factor=hardnessMul*0.15; // hammers last much longer
   const wear=metersAdvanced*factor;
   hammer.lifeRemaining=Math.max(0,hammer.lifeRemaining-wear);
   hammer.metersUsed+=metersAdvanced;
   if(hammer.lifeRemaining<=0){
    hammer.status='spent';
    retireTool(s,hammer.id);
    const replacement=availableTools(s,'hammer')[0];
    if(replacement){
     replacement.status='installed';
     replacement.installedAt=Date.now();
     s.drill.installedHammer=replacement.id;
    }else{
     s.drill.installedHammer=null;
     hammerOk=false;
    }
   }
  }
 }else hammerOk=false;
 return {bitOk,hammerOk};
}

export function toolCondition(tool){
 return tool&&tool.lifeTotal>0?Math.max(0,Math.min(100,(tool.lifeRemaining/tool.lifeTotal)*100)):0;
}

export function needsReplacement(tool,threshold=15){
 return toolCondition(tool)<threshold;
}
