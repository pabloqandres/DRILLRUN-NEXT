// V70 · Fullscreen capability shim for Android browsers / installed PWA.
// Never claims success when the browser refuses the request. Must be invoked
// synchronously from a trusted user gesture (before any async loading).
export const isImmersive=doc=>!!(doc?.fullscreenElement||doc?.webkitFullscreenElement);
export const canRequestImmersive=(doc,root=doc?.documentElement)=>
 typeof (root?.requestFullscreen||root?.webkitRequestFullscreen)==='function';
export function tryImmersive(doc,root=doc?.documentElement){
 if(isImmersive(doc))return Promise.resolve(true);
 const request=root?.requestFullscreen||root?.webkitRequestFullscreen;
 if(typeof request!=='function')return Promise.resolve(false);
 try{
  const outcome=request.call(root,{navigationUI:'hide'});
  return Promise.resolve(outcome).then(()=>isImmersive(doc)).catch(()=>false);
 }catch{return Promise.resolve(false);}
}
