const clamp=v=>Math.max(0,Math.min(1,v));
export function transitionLook(progress){
 const p=clamp(progress),smooth=p*p*(3-2*p),envelope=Math.sin(Math.PI*p);
 // Two brief, restrained horizontal registration slips. No strobing or full-frame flashes.
 const burst=p>.17&&p<.25?Math.sin((p-.17)/.08*Math.PI):p>.49&&p<.58?-Math.sin((p-.49)/.09*Math.PI):0;
 return {opacity:1-smooth,edge:(1-smooth)*112-6,shift:burst*3,glitch:Math.abs(burst)*.65,glow:envelope*.18,saturation:1-.14*envelope};
}
