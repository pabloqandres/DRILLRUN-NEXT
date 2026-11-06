import * as T from '../vendor/three.module.js';
import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';
export function batchModel(g){
 g.updateMatrixWorld(true);const materials=new Map(),edges=[];
 g.traverse(o=>{if(!o.isMesh&&!o.isLineSegments)return;let geo=o.geometry.clone().applyMatrix4(o.matrixWorld);if(geo.index)geo=geo.toNonIndexed();if(o.isLineSegments){edges.push(geo);return;}for(const key of Object.keys(geo.attributes))if(!['position','normal'].includes(key))geo.deleteAttribute(key);const list=materials.get(o.material)||[];list.push(geo);materials.set(o.material,list);});
 g.clear();for(const [material,parts]of materials){const mesh=new T.Mesh(mergeGeometries(parts,false),material);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);for(const p of parts)p.dispose();}if(edges.length){g.add(new T.LineSegments(mergeGeometries(edges,false),new T.LineBasicMaterial({color:0x213745,transparent:true,opacity:.35})));for(const e of edges)e.dispose();}
 return g;
}
// Temporary editable catalogue meshes. Definitive user-supplied models can replace each factory.
export function furnitureModel(w,sku,variant){
 const source=w, palette=sku==='desk'&&variant==='graphite'?{[0xc49d70]:0x536068,[0x927859]:0x39444b,[0xddd3bc]:0x647078}:sku==='desk'&&variant==='ivory'?{[0xc49d70]:0xe8e4d8,[0x927859]:0xb8b5aa,[0xddd3bc]:0xdedbd3}:sku==='chair'&&variant==='graphite'?{[0x273d52]:0x353e44,[0x2b435a]:0x41494d}:sku==='chair'&&variant==='burgundy'?{[0x273d52]:0x571b2b,[0x2b435a]:0x701e30}:{};
 w=Object.create(source);w.mat=c=>source.mat(palette[c]??c);
 const g=new T.Group();g.name='catalogue-'+sku;
 const box=(a,b,c,x,y,z,color,edge=true)=>w.box(g,a,b,c,x,y,z,color,edge),beam=(a,b,r,c)=>w.beam(g,a,b,r,c);
 if(sku==='desk'){
  box(1.2,.055,.58,0,.728,0,0xc49d70);box(1.16,.025,.54,0,.695,0,0x927859);
  for(const x of[-.52,.52])for(const z of[-.22,.22])box(.035,.67,.035,x,.335,z,0x52626a,false);
  beam([-.52,.22,-.22],[.52,.22,-.22],.013,0x52626a);box(.36,.35,.44,.32,.48,-.01,0xddd3bc);box(.28,.025,.025,.32,.52,.228,0x53616c,false);
 }else if(sku==='chair'){
  const seat=box(.47,.075,.45,0,.47,0,0x273d52);const back=box(.46,.43,.065,0,.73,-.20,0x2b435a);back.rotation.x=-.10;
  w.cyl(g,.035,.36,0,.26,0,0x7b898e,.035,12);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5,x=Math.cos(a)*.245,z=Math.sin(a)*.245;beam([0,.12,0],[x,.10,z],.018,0x667783);const wheel=w.cyl(g,.033,.045,x,.06,z,0x24343d,.033,10);wheel.rotation.z=Math.PI/2;}
  for(const x of[-.25,.25]){beam([x,.49,-.1],[x,.64,-.1],.018,0x5b7079);box(.045,.035,.28,x,.66,.015,0x293d4c);}
 }else if(sku==='archive'){
  box(.54,.86,.42,0,.43,0,0x879697);for(let i=0;i<3;i++){box(.47,.235,.025,0,.17+i*.245,.222,0xa5aeaa);box(.18,.022,.027,0,.21+i*.245,.244,0x4b5c63,false);box(.09,.03,.01,.12,.12+i*.245,.238,0xe5dec5,false);}
 }else if(sku==='lamp'){
  w.cyl(g,.085,.025,0,.012,0,0x667782,.085,12);beam([0,.025,0],[0,.30,-.02],.012,0x6c7979);beam([0,.30,-.02],[.07,.40,.02],.01,0x67787b);const shade=w.cyl(g,.07,.07,.07,.39,.02,0x87978e,.035,12);shade.rotation.z=-.4;
 }else if(sku==='computer'){
  const modern=variant==='modern';box(.61,.38,modern?.035:.13,0,.29,modern?-.10:-.15,modern?0x273a48:0xa9aca0);if(!modern){box(.46,.30,.17,0,.28,-.23,0x8c928c);for(let i=0;i<5;i++)box(.02,.15,.004,-.12+i*.055,.3,-.318,0x536568,false);}const screen=box(.555,.322,.006,0,.29,-.073,0x66b9c1,false);screen.material=new T.MeshBasicMaterial({color:0x4d8b9c});
  for(let i=0;i<3;i++)box(.32-i*.06,.018,.007,-.07,.33-i*.055,-.067,0xa9d7d8,false);
  box(.045,.11,.045,0,.065,-.1,0x687c87);box(.23,.018,.15,0,.012,-.10,0x46596b);box(.40,.025,.13,-.04,.018,.14,0x364753);box(.065,.023,.10,.25,.019,.14,0x516571);
  for(let i=0;i<3;i++)for(let j=0;j<10;j++)box(.025,.003,.016,-.21+j*.034,.033,.10+i*.028,0x71838a,false);
 }
 return batchModel(g);
}
