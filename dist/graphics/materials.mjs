export function refineAvatarMaterial(material){
 material.roughness=Math.max(.48,material.roughness??.8);material.envMapIntensity=.55;
 material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float illumination=dot(outgoingLight / max(diffuseColor.rgb,vec3(0.06)),vec3(0.2126,0.7152,0.0722));
 float band=0.56+0.27*smoothstep(0.47,0.56,illumination)+0.24*smoothstep(1.12,1.25,illumination);
 outgoingLight=mix(outgoingLight,diffuseColor.rgb*band,0.62);
 float rim=pow(1.0-abs(dot(normal,normalize(vViewPosition))),3.0);
 outgoingLight+=vec3(0.12,0.20,0.25)*rim*0.11;
 #include <opaque_fragment>`);};
 material.customProgramCacheKey=()=> 'drillrun-premium-cel-1';material.userData.celCandidate=true;material.userData.premium=true;return material;
}
