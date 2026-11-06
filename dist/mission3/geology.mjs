// Mission 3 — Geological analysis and stratigraphy generation
// Procedural geology based on borehole position with seeded noise.

const fail=msg=>{throw new Error(msg);};

export const ROCK_TYPES=[
 {id:'regolith',nameKey:'regolith',hardness:2,abrasivity:'low',color:0xc8a87a,
  description:'Suelo superficial, fragmentos sueltos'},
 {id:'sandstone',nameKey:'sandstone',hardness:4,abrasivity:'low',color:0xd4a45a,
  description:'Arenisca, moderadamente compacta'},
 {id:'andesite',nameKey:'andesite',hardness:6,abrasivity:'medium',color:0x7a8a7a,
  description:'Andesita, roca volcánica intermedia'},
 {id:'diorite',nameKey:'diorite',hardness:7,abrasivity:'high',color:0x6a6a7a,
  description:'Diorita, intrusiva granular'},
 {id:'granodiorite',nameKey:'granodiorite',hardness:8,abrasivity:'veryHigh',color:0x606068,
  description:'Granodiorita con vetas de cuarzo'},
 {id:'granite',nameKey:'granite',hardness:9,abrasivity:'veryHigh',color:0x585860,
  description:'Granito, roca plutónica muy dura'},
 {id:'copper-porphyry',nameKey:'copperPorphyry',hardness:7,abrasivity:'high',color:0x5a7a5a,
  description:'Pórfido cuprífero, mineralización visible'}
];

export function rockDefinition(id){return ROCK_TYPES.find(r=>r.id===id);}

// Seeded hash for deterministic geology per position
function hash(x,z,seed=0){
 const n=Math.sin(x*127.1+z*311.7+seed*173.3)*43758.5453;
 return n-Math.floor(n);
}

// Generate stratigraphy for a borehole at (x,z) with target depth
export function generateStratigraphy(siteX,siteZ,depth=60,seed=0){
 const h=hash(siteX,siteZ,seed);
 const layers=[];
 // Always start with regolith surface layer (3-8m)
 const regolithDepth=3+Math.floor(h*5);
 layers.push({from:0,to:regolithDepth,rock:'regolith',hardness:2,abrasivity:'low'});
 // Middle layers vary by position
 const variants=[
  ['andesite','diorite','granodiorite'],
  ['sandstone','andesite','diorite'],
  ['andesite','granodiorite','granite'],
  ['sandstone','diorite','copper-porphyry']
 ];
 const variantIdx=Math.floor(hash(siteX*3.7,siteZ*2.3,seed+1)*variants.length);
 const rocks=variants[variantIdx];
 // Distribute remaining depth across 3 layers
 const remaining=depth-regolithDepth;
 const split1=regolithDepth+Math.floor(remaining*(.25+hash(siteX,siteZ,seed+2)*.15));
 const split2=regolithDepth+Math.floor(remaining*(.55+hash(siteX,siteZ,seed+3)*.15));
 for(let i=0;i<3;i++){
  const from=i===0?regolithDepth:i===1?split1:split2;
  const to=i===0?split1:i===1?split2:depth;
  if(to<=from)continue;
  const rock=rockDefinition(rocks[i]);
  layers.push({from,to,rock:rocks[i],hardness:rock.hardness,abrasivity:rock.abrasivity});
 }
 return {siteX,siteZ,depth,layers,seed,sector:'east-'+Math.floor(siteX/10)};
}

// Generate analysis for all borehole sites
export function generateFullAnalysis(sites,seed=42){
 return sites.map(site=>({
  boreholeId:site.id,
  ...generateStratigraphy(site.x,site.z,site.depthTarget||60,seed)
 }));
}

// Get rock type at specific depth within a stratigraphy
export function layerAtDepth(strata,depth){
 if(!strata?.length)return null;
 for(const layer of strata){
  if(depth>=layer.from&&depth<layer.to)return layer;
 }
 return strata[strata.length-1]; // default to deepest
}

// Average hardness for a stratigraphy
export function averageHardness(strata){
 if(!strata?.length)return 5;
 let total=0,meters=0;
 for(const l of strata){const m=l.to-l.from;total+=l.hardness*m;meters+=m;}
 return meters>0?total/meters:5;
}

// Request geological analysis (starts the process)
export function requestAnalysis(s,now=Date.now()){
 if(s.geoAnalysis?.completed)fail('alreadyCompleted');
 if(s.geoAnalysis?.requested)fail('alreadyRequested');
 const cost=500;
 const geologyCostBonus=s.bonuses?.geologyCost||0;
 const adjustedCost=Math.round(cost*(1+geologyCostBonus));
 if(s.cash<adjustedCost)fail('noMoney');
 s.cash-=adjustedCost;
 s.geoAnalysis={
  requested:true,
  requestedAt:now,
  technicianArrived:false,
  samplingDone:false,
  analysisStartedAt:null,
  analysisDuration:75, // seconds
  completed:false,
  reportAvailable:false,
  accelerated:false,
  cost:adjustedCost
 };
 s.ledger.push({id:s.nextId++,key:'geoAnalysisRequest',amount:-adjustedCost,at:now});
 return s.geoAnalysis;
}

// Technician arrives at site (called after walk animation)
export function technicianArrives(s){
 if(!s.geoAnalysis?.requested)fail('noRequest');
 s.geoAnalysis.technicianArrived=true;
}

// Sampling complete, start analysis timer
export function startAnalysisTimer(s,now=Date.now()){
 if(!s.geoAnalysis?.technicianArrived)fail('techNotArrived');
 if(s.geoAnalysis.analysisStartedAt)fail('alreadyStarted');
 s.geoAnalysis.samplingDone=true;
 s.geoAnalysis.analysisStartedAt=now;
}

// Use knowledge accelerator to halve remaining time
export function accelerateAnalysis(s){
 if(!s.geoAnalysis?.analysisStartedAt)fail('analysisNotStarted');
 if(s.geoAnalysis.completed)fail('alreadyCompleted');
 if(s.knowledgeAccelerators<1)fail('noAccelerator');
 s.knowledgeAccelerators--;
 s.geoAnalysis.analysisDuration=Math.max(5,Math.ceil(s.geoAnalysis.analysisDuration/2));
 s.geoAnalysis.accelerated=true;
}

// Check and complete analysis if timer expired
export function tickAnalysis(s,now=Date.now()){
 if(!s.geoAnalysis?.analysisStartedAt||s.geoAnalysis.completed)return false;
 const elapsed=(now-s.geoAnalysis.analysisStartedAt)/1000;
 if(elapsed>=s.geoAnalysis.analysisDuration){
  s.geoAnalysis.completed=true;
  s.geoAnalysis.reportAvailable=true;
  // Generate and attach geology to each borehole definition
  const sites=(s.boreholes||[]).length>0?s.boreholes:
   [{id:'BH-01',x:20,z:4,depthTarget:30},{id:'BH-02',x:23,z:1,depthTarget:30},
    {id:'BH-03',x:26,z:-2,depthTarget:30},{id:'BH-04',x:23,z:-5,depthTarget:30},
    {id:'BH-05',x:20,z:-8,depthTarget:30},{id:'BH-06',x:26,z:-8,depthTarget:30}];
  const analyses=generateFullAnalysis(sites.map(b=>({id:b.id,x:b.position?.x||b.x,z:b.position?.z||b.z,depthTarget:b.depthTarget||60})));
  // Attach geology to boreholes if they exist
  for(const a of analyses){
   const bh=(s.boreholes||[]).find(b=>b.id===a.boreholeId);
   if(bh)bh.geology={strata:a.layers};
  }
  s.geoAnalysis.analyses=analyses;
  return true;
 }
 return false;
}

// Analysis progress (0..1)
export function analysisProgress(s,now=Date.now()){
 if(!s.geoAnalysis?.analysisStartedAt)return 0;
 if(s.geoAnalysis.completed)return 1;
 const elapsed=(now-s.geoAnalysis.analysisStartedAt)/1000;
 return Math.min(1,elapsed/s.geoAnalysis.analysisDuration);
}

// Get the geological report
export function analysisReport(s){
 if(!s.geoAnalysis?.reportAvailable)return null;
 return {
  completed:true,
  analyses:s.geoAnalysis.analyses||[],
  sector:'Sector Este — Zona de exploración',
  generalDescription:'Formación volcánica-intrusiva con cobertura aluvial superficial. Dureza progresiva en profundidad. Se detecta presencia de cuarzo en niveles inferiores.',
  recommendation:'Se recomienda bit tipo domo para los estratos superiores y evaluación de bit cónico para niveles de granodiorita.'
 };
}
