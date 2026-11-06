export const CAMERA_KEY='drillrun-camera-v1';
export const CAMERA_DEFAULTS={version:1,defaultPreset:'B',zoom:1,presets:{
 A:{distance:4,pitch:12,fov:60,height:0,offsetHorizontal:0,offsetVertical:0,smoothing:9,followSpeed:8},
 B:{distance:5,pitch:18,fov:60,height:0,offsetHorizontal:0,offsetVertical:0,smoothing:9,followSpeed:8},
 C:{distance:6,pitch:25,fov:60,height:0,offsetHorizontal:0,offsetVertical:.2,smoothing:7,followSpeed:7}},
 controls:{minZoom:2.4,maxZoom:8,zoomSpeed:1.3,touchSensitivity:1},
 transition:{duration:1.3,orbitDegrees:6,revealSeconds:.95,stabilizeSeconds:.15,hudSeconds:.35,startDistance:4.2,startPitch:10,startFov:54,startHeightFactor:1.0}};
export const cloneDefaults=()=>JSON.parse(JSON.stringify(CAMERA_DEFAULTS));
const limit=(n,min,max,fallback)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
export function cameraSettings(raw){const s=cloneDefaults();if(!raw||raw.version!==1)return s;
 const bounds={distance:[2.4,10],pitch:[5,55],fov:[40,85],height:[-.4,2],offsetHorizontal:[-1.5,1.5],offsetVertical:[-.6,1],smoothing:[1,20],followSpeed:[1,20]};
 for(const id of ['A','B','C'])for(const [key,[min,max]]of Object.entries(bounds))s.presets[id][key]=limit(raw.presets?.[id]?.[key],min,max,s.presets[id][key]);
 for(const [key,min,max]of [['minZoom',1.8,4],['maxZoom',5,12],['zoomSpeed',.2,3],['touchSensitivity',.2,2.5]])s.controls[key]=limit(raw.controls?.[key],min,max,s.controls[key]);
 for(const [key,min,max]of [['duration',.5,3],['orbitDegrees',0,12],['revealSeconds',.4,2],['stabilizeSeconds',0,.5],['hudSeconds',.15,1],['startDistance',3,6],['startPitch',5,25],['startFov',40,70],['startHeightFactor',.7,1.2]])s.transition[key]=limit(raw.transition?.[key],min,max,s.transition[key]);
 s.zoom=limit(raw.zoom,.4,2.4,1);return s;}
export const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
