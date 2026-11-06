import {HSEC_ANCHORS as A,assetDefinition} from './catalog.mjs';
// Initial suggestions are editable construction previews, never automatically installed.
export const ROUTES={vehicle:[A.officeLog,{x:7.2,z:3.5},{x:7.2,z:-.75},A.shedLog],pedestrian:[A.officePed,{x:-7.99,z:6},{x:1.5,z:6},{x:1.5,z:-1.05},A.shedPed]};
// Multiple route suggestions for linear assets (cycled by existing count).
const LINEAR_ROUTES={barrier:[[{x:10.5,z:-10.75},{x:10.5,z:-7.25}],[{x:5.5,z:-10.75},{x:5.5,z:-7.25}],[{x:8,z:-10.75},{x:8,z:-7.25}]],railing:[[{x:3,z:5},{x:3,z:.5}],[{x:5,z:4},{x:5,z:.5}]],fence:[[{x:5.5,z:-10.75},{x:5.5,z:-7.25}],[{x:10.5,z:-10.75},{x:10.5,z:-7.25}]]};
export const SUGGESTIONS={shed:[{x:6,z:-4}],crossing:[{x:1.5,z:3.5,rotation:Math.PI/2}],tower:[{x:-10,z:2.7},{x:-1,z:4.5},{x:4.5,z:1.5},{x:10,z:-6}],post:[{x:-7,z:4.6},{x:0,z:5},{x:4,z:1}],cone:[{x:5.5,z:-10.75},{x:10.5,z:-10.75},{x:5.5,z:-7.25},{x:10.5,z:-7.25},{x:8,z:-10.75},{x:8,z:-7.25}],bollard:[{x:4.8,z:-1}],sign:[{x:2.4,z:3.5}],extinguisher:[{x:3,z:.1}],marking:[{x:1.5,z:5}]};
export function suggestedPose(s,type){const n=s.hsec?.assets.filter(a=>a.type===type).length||0,d=assetDefinition(type);
 // Linear route assets: pick from LINEAR_ROUTES by index
 if(d?.route==='linear'&&LINEAR_ROUTES[type]){const routes=LINEAR_ROUTES[type],pts=routes[n%routes.length].map(p=>({...p}));return {x:pts[0].x,z:pts[0].z,rotation:0,points:pts};}
 // Road routes
 const points=ROUTES[type]?.map(p=>({...p}));if(points)return {x:points[0].x,z:points[0].z,rotation:0,points};
 // Single-point assets
 const list=SUGGESTIONS[type]||[{x:8,z:0}],p={...list[n%list.length]};return {...p,rotation:p.rotation||0};}
