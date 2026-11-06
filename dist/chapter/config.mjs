import {AVATARS} from './avatars.mjs';
export const CONFIG={version:6,requiredProducts:['desk','chair','computer'],saveKey:'drillrun-chapter-01-v5',bank:0,cash:5000,maxEnergy:20,regenSeconds:30,clearCost:1,clearSeconds:1.2,officeCost:3000,buildSeconds:600,boosters:0,grid:.1,
 cover:'./assets/cover-season-01.png',mentor:{nameKey:'mentor',messages:[{id:'welcome',bodyKey:'mentorWelcome'},{id:'office-store',bodyKey:'mentorStore',requires:'office'}]},
 protagonists:AVATARS,
 officeSlot:{id:'office01',x:-6,z:0,w:6,d:2.5,access:{x:-7.99,z:2.9}},spawn:{x:-5.5,z:5.2}
};
// Stable IDs preserve existing saves. Hand placed across the parcel, never a grid.
export const CLEARABLES=[
 {id:'clear-0',kind:'rock',variant:0,x:-8.2,z:-.65,r:.49,size:.95,angle:.4},
 {id:'clear-1',kind:'bush',variant:0,x:-10.7,z:2.25,r:.43,size:.85,angle:.7},
 {id:'clear-2',kind:'bush',variant:1,x:-5.7,z:.55,r:.42,size:1.05,angle:1.2},
 {id:'clear-3',kind:'rock',variant:1,x:-2.15,z:3.5,r:.51,size:1.12,angle:1.8},
 {id:'clear-4',kind:'crate',variant:0,x:-4.15,z:-.55,r:.49,size:.85,angle:.25},
 {id:'clear-5',kind:'metal',variant:0,x:-.25,z:.55,r:.61,size:1,angle:2.3},
 {id:'clear-6',kind:'rock',variant:2,x:-10.7,z:-2.3,r:.50,size:1.15,angle:2.8},
 {id:'clear-7',kind:'bush',variant:2,x:-6.6,z:3.15,r:.36,size:.72,angle:2},
 {id:'clear-8',kind:'crate',variant:1,x:-8.8,z:5.0,r:.44,size:.78,angle:-.4},
 {id:'clear-9',kind:'metal',variant:1,x:-1.1,z:-3.05,r:.62,size:1.1,angle:.65},
 {id:'clear-10',kind:'bush',variant:0,x:-5.8,z:-3.6,r:.53,size:1.15,angle:2.5},
 {id:'clear-11',kind:'rock',variant:0,x:-3.4,z:6.1,r:.39,size:.73,angle:1.5},
 {id:'clear-12',kind:'crate',variant:2,x:.7,z:5.4,r:.54,size:.96,angle:.8},
 {id:'clear-13',kind:'bush',variant:1,x:-11.5,z:5.9,r:.41,size:.88,angle:.1},
 {id:'clear-14',kind:'metal',variant:2,x:-8.1,z:-4.15,r:.59,size:1.0,angle:-.5},
 {id:'clear-15',kind:'bush',variant:2,x:-3.1,z:-2.85,r:.43,size:.92,angle:3}
];
export const CATEGORIES=['desks','chairs','computers','lighting','storage','decoration','finishes'];
// Replace this director with the definitive cinematic without changing the chapter's spawn contract.
export const INTRO_SHOTS=[
 {id:'desert',seconds:1.1,text:'intro1',target:[-6,1,0],offset:[12,7,17]},
 {id:'arrival',seconds:1.1,text:'intro1',walk:true,target:[-5.5,1,5.2],offset:[5,3.4,8]},
 {id:'approach',seconds:1.1,text:'intro2',walk:true,target:[-6,1,1],offset:[8,5,12]},
 {id:'contemplate',seconds:.9,text:'intro2',target:[-6,1,0],offset:[7,4,10]},
 {id:'blueprint',seconds:2,text:'intro3',blueprint:true,target:[-6,1,0],offset:[7,5,10]},
 {id:'fade-projection',seconds:.8,text:'intro3',target:[-6,1,0],offset:[8,5.5,11]},
 {id:'behind-player',seconds:.9,text:'intro4',handoff:true,offset:[9,6.7,13]},
 {id:'handoff',seconds:.9,text:'intro4',handoff:true,offset:[9,6.7,13]}
];
export const SHARED_INTRO_VIDEO='./cinematics/avatar01-seedance.mp4';
// Approved temporary film for all four slots. Replace each null with its own film when supplied.
export const AVATAR_INTRO_VIDEOS={operator01:SHARED_INTRO_VIDEO,operator02:null,operator03:null,operator04:null};
export const INTRO_VARIANTS=Object.fromEntries(AVATARS.map(a=>[a.id,{id:'intro-'+a.id,avatar:a.id,video:AVATAR_INTRO_VIDEOS[a.id]||SHARED_INTRO_VIDEO,sharedIntro:!AVATAR_INTRO_VIDEOS[a.id],shots:INTRO_SHOTS}]));
export const PRODUCTS=[
 {id:'desk',nameKey:'desk',category:'desks',price:350,w:1.2,d:.58,h:.75,layer:'floor',descriptionKey:'deskDescription',variants:[{id:'oak',nameKey:'lightWood',swatch:'#c49d70'},{id:'graphite',nameKey:'graphite',swatch:'#536068'},{id:'ivory',nameKey:'industrialWhite',swatch:'#e8e4d8'}]},
 {id:'chair',nameKey:'chair',category:'chairs',price:200,w:.55,d:.55,h:.95,layer:'floor',descriptionKey:'chairDescription',variants:[{id:'blue',nameKey:'blueUpholstery',swatch:'#2b435a'},{id:'graphite',nameKey:'graphite',swatch:'#41494d'},{id:'burgundy',nameKey:'burgundy',swatch:'#701e30'}]},
 {id:'computer',nameKey:'computer',category:'computers',price:650,w:.64,d:.35,h:.50,layer:'surface',descriptionKey:'computerDescription',variants:[{id:'basic',nameKey:'basic',swatch:'#b2b5a9'},{id:'modern',nameKey:'modern',swatch:'#394b58'}]},
 {id:'archive',nameKey:'archive',category:'storage',price:0,w:.54,d:.42,h:.86,layer:'floor',variants:[{id:'basic',nameKey:'basic',swatch:'#8f9a9b'}]},
 {id:'lamp',nameKey:'lamp',category:'lighting',price:0,w:.18,d:.18,h:.44,layer:'surface',variants:[{id:'basic',nameKey:'basic',swatch:'#64737c'}]}
];
