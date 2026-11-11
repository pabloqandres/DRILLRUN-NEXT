// DRILL RUN NEXT GENERATION · V59
// Frame-rate independent barrier: 1.6 s full travel with a short safe hold
// after the sensor releases. The HSEC gate policy/colliders remain external.
export const GATE_TRAVEL_MS=1600;
export const GATE_HOLD_OPEN_MS=1700;
const OPEN=-Math.PI/2;
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>x*x*(3-2*x);
export function createPatioGateMotion(){
 return {angle:0,from:0,target:0,startedAt:0,durationMs:GATE_TRAVEL_MS,lastRequestedAt:-Infinity};
}
export function advancePatioGateMotion(motion,requested,now){
 if(!Number.isFinite(now))return motion.angle;
 if(requested)motion.lastRequestedAt=now;
 const shouldOpen=!!requested||now-motion.lastRequestedAt<GATE_HOLD_OPEN_MS;
 const target=shouldOpen?OPEN:0;
 // Advance the previous segment before reacting to a reversed request.
 const priorProgress=clamp((now-motion.startedAt)/motion.durationMs);
 motion.angle=motion.from+(motion.target-motion.from)*smooth(priorProgress);
 if(target!==motion.target){
  motion.from=motion.angle;
  motion.target=target;
  motion.startedAt=now;
  // A reversal travels only the remaining angle, at the same believable rate.
  motion.durationMs=Math.max(180,GATE_TRAVEL_MS*Math.abs(target-motion.from)/(Math.PI/2));
 }
 const progress=clamp((now-motion.startedAt)/motion.durationMs);
 motion.angle=motion.from+(motion.target-motion.from)*smooth(progress);
 return motion.angle;
}
