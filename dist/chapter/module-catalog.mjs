// Only chapter-one modules are operational. Future categories carry data, not simulated systems.
export const BUILD_CATEGORIES=[
 {id:'administration',nameKey:'administration',icon:'hsec:infrastructure',types:['office','office-extension','meeting-room','control-centre']},
 {id:'camp',nameKey:'camp',icon:'camp',types:['dormitory','bathroom','dining','common-area','rest']},
 {id:'industrial',nameKey:'industrial',icon:'hsec:management',types:['shed','workshop','maintenance','production']},
 {id:'storage',nameKey:'storage',icon:'storage',types:['warehouse','new-material-yard','used-material-yard','stockpile','logistics']},
 {id:'machinery',nameKey:'machinery',icon:'machine',types:['drill-rig','auxiliary','operations']},
 {id:'infrastructure',nameKey:'infrastructure',icon:'hsec:mobility',types:['road','barrier','fence','sign','environment','safety']}
];
export const MODULES=[
 {id:'office-l1',type:'office',category:'administration',level:1,nameKey:'basicOffice',descriptionKey:'basicOfficeDescription',price:3000,seconds:600,width:6,depth:2.5,height:2.9,capacity:1,capacityKey:'workstations',benefitKey:'adminUnlocked',attributes:['officeClimate','officePower'],requirements:['clearPlot'],next:'office-l2',components:['desk','chair','computer','archive','lamp','airConditioning']},
 {id:'office-l2',type:'office',category:'administration',level:2,nameKey:'improvedOffice',descriptionKey:'improvedOfficeDescription',price:1500,seconds:300,width:6,depth:2.5,height:2.9,capacity:2,capacityKey:'workstations',benefitKey:'secondWorkstation',attributes:['officeClimate','officePower'],requirements:['officeLevel1'],next:'office-l3',components:['twoWorkstations','archive','lamp','airConditioning']},
 {id:'office-l3',type:'office',category:'administration',level:3,nameKey:'expandedOffice',descriptionKey:'futureModule',price:null,seconds:null,width:null,depth:null,capacity:null,locked:true,requirements:['futureChapter']}
];
export const BUILD_ZONES=[{id:'office01',nameKey:'adminZone',x:-6,z:0,width:6.4,depth:3.0,angle:0,types:['office'],maxLevel:2,expandable:true}];
export const initialModules=()=>MODULES.filter(m=>m.level===1);
export const moduleDefinition=id=>MODULES.find(m=>m.id===id);
export const pendingConstruction=s=>s.office.status==='building'?s.office:s.office.upgrade||null;
export function moduleAvailability(s,m){if(m.locked)return 'futureChapter';if(s.office.status==='building'||s.office.upgrade)return 'constructionPending';if(m.level===1&&s.office.status!=='unbuilt')return 'alreadyBuilding';if(m.level===2&&(s.office.status!=='built'||s.office.level!==1))return 'officeLevel1';return null;}
export const moduleFixtures=level=>[
 {id:'station-a-desk',product:'desk',variant:level===1?'oak':'graphite',x:level===1?.50:-.35,z:-.65,rotation:0},
 {id:'station-a-chair',product:'chair',variant:level===1?'blue':'graphite',x:level===1?.50:-.35,z:.18,rotation:Math.PI},
 {id:'station-a-computer',product:'computer',variant:level===1?'basic':'modern',x:level===1?.50:-.35,z:-.65,rotation:0,host:'station-a-desk'},
 ...(level===2?[
  {id:'station-b-desk',product:'desk',variant:'ivory',x:1.48,z:-.65,rotation:0},
  {id:'station-b-chair',product:'chair',variant:'burgundy',x:1.48,z:.18,rotation:Math.PI},
  {id:'station-b-computer',product:'computer',variant:'modern',x:1.48,z:-.65,rotation:0,host:'station-b-desk'}]:[]),
 {id:'archive',product:'archive',variant:'basic',x:2.32,z:level===1?-.68:.68,rotation:level===1?0:Math.PI},
 {id:'lamp',product:'lamp',variant:'basic',x:level===1?.98:.13,z:-.67,rotation:0,host:'station-a-desk'}
];
