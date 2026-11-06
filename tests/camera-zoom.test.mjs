import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CAMERA_DEFAULTS,cameraSettings} from '../dist/camera/config.mjs';
import {installWorldGestures} from '../dist/camera/gestures.mjs';

test('camera default is closer to player, balanced preset B',()=>{
 const settings=cameraSettings();
 assert.equal(settings.version,2);
 assert.equal(settings.presets.B.distance,3.8);
 assert.equal(settings.presets.B.pitch,18);
 assert.equal(settings.presets.B.fov,57);
});

test('old untouched saved camera preset receives the improved view without losing user zoom',()=>{
 const old=JSON.parse(JSON.stringify(CAMERA_DEFAULTS));
 old.version=1;old.presets.B.distance=5;old.presets.B.fov=60;old.zoom=.8;
 const merged=cameraSettings(old);
 assert.equal(merged.presets.B.distance,3.8);
 assert.equal(merged.presets.B.fov,57);
 assert.equal(merged.zoom,.8);
});

test('custom camera distance and FOV remain intact through migration',()=>{
 const customized=JSON.parse(JSON.stringify(CAMERA_DEFAULTS));
 customized.version=1;customized.presets.B.distance=4.6;customized.presets.B.fov=54;customized.zoom=.75;
 const settings=cameraSettings(customized);
 assert.equal(settings.presets.B.distance,4.6);
 assert.equal(settings.presets.B.fov,54);
 assert.equal(settings.zoom,.75);
});

test('desktop mouse wheel zooms camera in and out, persists, and leaves other UI alone',()=>{
 let onWheel, blocked=false, zoomed=[], persisted=0;
 const canvas={style:{},clientHeight:720,addEventListener(type,fn,options){if(type==='wheel'){onWheel=fn;assert.equal(options.passive,false);}},getBoundingClientRect:()=>({left:0,width:1200}),setPointerCapture(){}};
 installWorldGestures(canvas,{canLook:()=>!blocked,onLook(){},onTap(){},onZoom:delta=>zoomed.push(delta),onEnd:()=>persisted++});
 let prevented=0;
 function send(deltaY,deltaMode=0){onWheel({deltaY,deltaMode,preventDefault(){prevented++;}});}
 send(-120);assert(zoomed[0]>0);assert.equal(persisted,1);
 send(120);assert(zoomed[1]<0);assert.equal(persisted,2);
 blocked=true;send(-120);
 assert.equal(zoomed.length,2);assert.equal(persisted,2);assert.equal(prevented,2);
});

test('touch pinch zoom remains available after adding wheel support',()=>{
 let zoomed=[],end=0;
 const canvas={style:{},addEventListener(){},getBoundingClientRect:()=>({left:0,width:800}),setPointerCapture(){}};
 installWorldGestures(canvas,{canLook:()=>true,onLook(){},onTap(){},onZoom:delta=>zoomed.push(delta),onEnd:()=>end++,dragAnywhere:()=>false});
 const e=(id,x,y)=>({pointerId:id,button:0,clientX:x,clientY:y,preventDefault(){}});
 canvas.onpointerdown(e(1,200,150));
 canvas.onpointerdown(e(2,250,150));
 canvas.onpointermove(e(2,290,150));
 canvas.onpointerup(e(2,290,150));
 canvas.onpointerup(e(1,200,150));
 assert(zoomed.length>=1);assert(zoomed[0]>0);assert.equal(end,1);
});
