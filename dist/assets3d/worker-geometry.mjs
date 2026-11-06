import * as T from '../vendor/three.module.js';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
export const BODY={height:1.94,headHeight:.26,hip:1.015,knee:.55,ankle:.075,shoulder:1.465,stride:1.28};
export const B={root:0,pelvis:1,spine:2,chest:3,neck:4,head:5,shoulderL:6,elbowL:7,wristL:8,shoulderR:9,elbowR:10,wristR:11,hipL:12,kneeL:13,ankleL:14,hipR:15,kneeR:16,ankleR:17};
const bone=(i)=>[[i,1]];
function blend(i,j,t){t=clamp(t);return [[i,1-t],[j,t]];}
function trunk(y){if(y<1.15)return blend(B.pelvis,B.spine,(y-1.02)/.13);return blend(B.spine,B.chest,(y-1.15)/.22);}
function limb(side,y,arm=false){if(arm){const a=side<0?B.shoulderL:B.shoulderR,b=side<0?B.elbowL:B.elbowR,c=side<0?B.wristL:B.wristR;if(y>1.39)return blend(B.chest,a,(1.51-y)/.1);if(y>1.22)return bone(a);if(y>1.12)return blend(a,b,(1.22-y)/.1);if(y>.96)return bone(b);return blend(b,c,(.96-y)/.07);}const a=side<0?B.hipL:B.hipR,b=side<0?B.kneeL:B.kneeR,c=side<0?B.ankleL:B.ankleR;if(y>.65)return bone(a);if(y>.45)return blend(a,b,(.65-y)/.2);if(y>.21)return bone(b);return blend(b,c,(.21-y)/.09);}
class Builder{
 constructor(){this.layers=new Map();this.colorCache=new Map();}
 layer(key){if(!this.layers.has(key))this.layers.set(key,{p:[],c:[],s:[],w:[],i:[]});return this.layers.get(key);}
 vertex(layer,p,color,weights){const g=this.layer(layer),i=g.p.length/3;g.p.push(...p);let col=this.colorCache.get(color);if(!col){const c=new T.Color(color);col=[c.r,c.g,c.b];this.colorCache.set(color,col);}g.c.push(...col);const ids=[0,0,0,0],ww=[0,0,0,0];weights.slice(0,4).forEach(([id,w],j)=>{ids[j]=id;ww[j]=w;});g.s.push(...ids);g.w.push(...ww);return i;}
 tri(layer,a,b,c){this.layer(layer).i.push(a,b,c);}
 quad(layer,a,b,c,d){this.tri(layer,a,b,c);this.tri(layer,a,c,d);}
 loft(layer,rings,color,weights=bone(B.root),opts={}){const n=opts.segments||24,start=opts.start??0,end=opts.end??Math.PI*2,closed=end-start>Math.PI*1.99,rows=[];for(let k=0;k<rings.length;k++){const r=rings[k],row=[];for(let j=0;j<=n;j++){const a=mix(start,end,j/n),warp=opts.warp?.(r.y,a,k)||0,xx=(r.x||0)+Math.cos(a)*(r.rx+warp),zz=(r.z||0)+Math.sin(a)*(r.rz+warp);let p=[xx,r.y,zz];if(opts.transform)p=opts.transform(p);row.push(this.vertex(layer,p,color,typeof weights==='function'?weights(r.y,p):weights));}rows.push(row);}for(let k=0;k<rows.length-1;k++)for(let j=0;j<n;j++)this.quad(layer,rows[k][j],rows[k+1][j],rows[k+1][j+1],rows[k][j+1]);if(opts.cap!==false&&closed){for(const endIndex of[0,rings.length-1]){const r=rings[endIndex],p=opts.transform?opts.transform([r.x||0,r.y,r.z||0]):[r.x||0,r.y,r.z||0],idx=this.vertex(layer,p,color,typeof weights==='function'?weights(r.y,p):weights);for(let j=0;j<n;j++)endIndex===0?this.tri(layer,idx,rows[endIndex][j],rows[endIndex][j+1]):this.tri(layer,idx,rows[endIndex][j+1],rows[endIndex][j]);}}}
 ellipsoid(layer,center,radii,color,weights,segments=18,levels=10){const rings=[];for(let i=0;i<=levels;i++){const a=-Math.PI/2+i*Math.PI/levels;const radial=Math.max(.0001,Math.cos(a));rings.push({x:center[0],y:center[1]+Math.sin(a)*radii[1],z:center[2],rx:radii[0]*radial,rz:radii[2]*radial});}this.loft(layer,rings,color,weights,{segments,cap:false});}
 tube(layer,points,r,color,weights,segments=6){const rows=[];for(let i=0;i<points.length;i++){const p=new T.Vector3(...points[i]),tangent=new T.Vector3(...points[Math.min(i+1,points.length-1)]).sub(new T.Vector3(...points[Math.max(0,i-1)])).normalize();const axis=Math.abs(tangent.y)<.9?new T.Vector3(0,1,0):new T.Vector3(1,0,0);const u=new T.Vector3().crossVectors(tangent,axis).normalize(),v=new T.Vector3().crossVectors(tangent,u).normalize(),row=[];for(let j=0;j<=segments;j++){const a=j/segments*Math.PI*2,q=p.clone().addScaledVector(u,Math.cos(a)*r).addScaledVector(v,Math.sin(a)*r);row.push(this.vertex(layer,q.toArray(),color,typeof weights==='function'?weights(p.y):weights));}rows.push(row);}for(let i=0;i<rows.length-1;i++)for(let j=0;j<segments;j++)this.quad(layer,rows[i][j],rows[i+1][j],rows[i+1][j+1],rows[i][j+1]);}
 patch(layer,fn,nx,ny,color,weights,reverse=false){const rows=[];for(let y=0;y<=ny;y++){const row=[];for(let x=0;x<=nx;x++){const p=fn(x/nx,y/ny);row.push(this.vertex(layer,p,color,typeof weights==='function'?weights(p[1],p):weights));}rows.push(row);}for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const a=rows[y][x],b=rows[y][x+1],c=rows[y+1][x+1],d=rows[y+1][x];reverse?this.quad(layer,a,d,c,b):this.quad(layer,a,b,c,d);}}
 finish(){const result=new Map();for(const[key,g]of this.layers){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(g.p,3));geo.setAttribute('color',new T.Float32BufferAttribute(g.c,3));geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(g.s,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(g.w,4));geo.setIndex(g.i);geo.computeVertexNormals();geo.computeBoundingSphere();result.set(key,geo);}return result;}
}
const C={navy:0x1c3049,crease:0x18293e,orange:0xed7c2e,orangeEdge:0xa75027,reflect:0xd0d3c7,skin:0xc39475,skinShadow:0xa57258,hair:0x3e322c,white:0xe9eae2,trim:0x435363,rubber:0x26313a,leather:0x795b42,sole:0x28323a};
export function makeWorkerGeometry(){const b=new Builder();
 const torso=[{y:1.015,rx:.152,rz:.102},{y:1.06,rx:.163,rz:.108},{y:1.14,rx:.158,rz:.112},{y:1.24,rx:.183,rz:.128},{y:1.34,rx:.213,rz:.132},{y:1.43,rx:.235,rz:.12},{y:1.475,rx:.231,rz:.108},{y:1.5,rx:.188,rz:.096},{y:1.535,rx:.084,rz:.071}];
 b.loft('cloth',torso,C.navy,trunk,{segments:28});
 b.loft('skin',[{y:1.51,rx:.056,rz:.053},{y:1.56,rx:.058,rz:.05},{y:1.61,rx:.059,rz:.048}],C.skin,y=>blend(B.neck,B.head,(y-1.56)/.05),{segments:20});
 b.loft('cloth',[{y:1.485,rx:.087,rz:.077},{y:1.518,rx:.072,rz:.064},{y:1.533,rx:.063,rz:.058}],C.crease,bone(B.neck),{segments:24,cap:false});
 // Vest panels follow the torso and taper towards the waist, with a V-neck and open armholes.
 const width=y=>y<1.14?.164:y<1.34?mix(.164,.219,(y-1.14)/.2):.23;
 const depth=y=>y<1.14?.116:y<1.34?mix(.116,.14,(y-1.14)/.2):.128;
 const surface=(x,y,back=false,extra=.009)=>[x,y,(back?-1:1)*(depth(y)*Math.sqrt(Math.max(.1,1-(x/(width(y)+.012))**2))+extra)];
 for(const side of[-1,1]){b.patch('vest',(u,v)=>{const yTop=1.395+Math.sin(u*Math.PI)*.101,y=mix(1.057,yTop,v),x=side*mix(.023,width(y),u);return surface(x,y);},12,13,C.orange,trunk,side<0);
  b.patch('vest',(u,v)=>{const y=mix(1.06,1.465,v),x=side*mix(0,width(y),u);return surface(x,y,true);},12,13,C.orange,trunk,side>0);
  // Band wraps around the waist and separate shoulder reflectors stay on the garment.
  for(const back of[false,true]){b.patch('reflect',(u,v)=>{const y=1.115+v*.034,x=side*mix(back?0:.024,width(y),u);return surface(x,y,back,.014);},12,2,C.reflect,trunk,back?side>0:side<0);
   b.patch('reflect',(u,v)=>{const y=mix(1.18,1.457,v),x=side*(.122+u*.027);return surface(x,y,back,.015);},3,10,C.reflect,trunk,back);
  }
  const edge=[];for(let j=0;j<=12;j++){const y=mix(1.07,1.41,j/12);edge.push(surface(side*.026,y,false,.014));}b.tube('vest',edge,.0022,C.orangeEdge,trunk,5);
  b.patch('vest',(u,v)=>surface(side*(.056+u*.067),1.215+v*.054,false,.017),5,3,0xe1803c,trunk,side<0);
  const stitch=[];for(let j=0;j<=5;j++)stitch.push(surface(side*(.056+j*.0134),1.222,false,.02));b.tube('vest',stitch,.0014,0xffb16c,trunk,5);
 }
 // Belt and seam at the waist.
 b.loft('cloth',[{y:1.01,rx:.163,rz:.112},{y:1.043,rx:.166,rz:.115}],0x263341,bone(B.pelvis),{segments:28});
 b.patch('metal',(u,v)=>[mix(-.024,.024,u),1.017+v*.027,.117],2,2,0x8b958f,bone(B.pelvis));
 for(const side of[-1,1]){
  const sx=side*.107;const pants=[{y:.17,rx:.061,rz:.062},{y:.195,rx:.069,rz:.065},{y:.225,rx:.067,rz:.066},{y:.31,rx:.067,rz:.071},{y:.43,rx:.079,rz:.077},{y:.49,rx:.077,rz:.083},{y:.535,rx:.084,rz:.081},{y:.58,rx:.081,rz:.086},{y:.64,rx:.083,rz:.088},{y:.76,rx:.096,rz:.098},{y:.88,rx:.102,rz:.101},{y:1.005,rx:.097,rz:.105}].map(r=>({...r,x:sx,z:r.y>.6?0:.012}));
  b.loft('cloth',pants,C.navy,y=>limb(side,y),{segments:22,warp:(y,a,k)=>Math.sin(a*3+k*.8)*.0025});
  const seam=[];for(const r of pants)seam.push([r.x+side*r.rx*.96,r.y,r.z-.012]);b.tube('cloth',seam,.002,0x30445b,y=>limb(side,y),5);
  // Angular fabric folds are part of the same skinned cloth surface.
  for(const yy of[.22,.49,.59,.78])b.patch('cloth',(u,v)=>{const x=sx+mix(-.055,.055,u),y=yy+v*.012+Math.sin(u*Math.PI)*.014;return [x,y,.012+(yy>.65?.095:.078)+Math.sin(u*Math.PI)*.003];},8,1,0x35475c,y=>limb(side,y));
  // Rolled sleeves and the anatomically tapered forearms.
  const arm=[{y:1.105,x:side*.291,rx:.064,rz:.071},{y:1.13,x:side*.29,rx:.072,rz:.075},{y:1.17,x:side*.286,rx:.071,rz:.073},{y:1.24,x:side*.281,rx:.077,rz:.082},{y:1.35,x:side*.265,rx:.087,rz:.089},{y:1.44,x:side*.244,rx:.096,rz:.091},{y:1.49,x:side*.225,rx:.075,rz:.078}].map(r=>({...r,z:.006}));
  b.loft('cloth',arm,C.navy,y=>limb(side,y,true),{segments:22});
  b.loft('cloth',[{y:1.105,x:side*.291,z:.006,rx:.069,rz:.075},{y:1.128,x:side*.29,z:.006,rx:.075,rz:.079},{y:1.15,x:side*.288,z:.006,rx:.07,rz:.076}],0x34475c,y=>limb(side,y,true),{segments:22});
  b.loft('skin',[{y:.915,x:side*.309,z:.018,rx:.044,rz:.041},{y:.95,x:side*.306,z:.016,rx:.049,rz:.046},{y:1.04,x:side*.3,z:.012,rx:.059,rz:.056},{y:1.12,x:side*.291,z:.006,rx:.063,rz:.062},{y:1.16,x:side*.287,z:.006,rx:.062,rz:.064}],C.skin,y=>limb(side,y,true),{segments:24});
  const wrist=side<0?B.wristL:B.wristR;
  b.loft('rubber',[{y:.835,x:side*.314,z:.026,rx:.039,rz:.031},{y:.87,x:side*.313,z:.024,rx:.047,rz:.033},{y:.916,x:side*.309,z:.018,rx:.046,rz:.038},{y:.94,x:side*.307,z:.017,rx:.048,rz:.041}],C.rubber,bone(wrist),{segments:20});
  b.loft('rubber',[{y:.922,x:side*.308,z:.018,rx:.048,rz:.041},{y:.941,x:side*.307,z:.017,rx:.049,rz:.042}],0x41505b,bone(wrist),{segments:20});
  for(let finger=0;finger<4;finger++){const offset=(finger-1.5)*.019,len=[.054,.069,.071,.059][finger],x=side*.314+offset;
   b.loft('rubber',[{y:.844-len,x,z:.047,rx:.0065,rz:.008},{y:.849-len*.75,x,z:.045,rx:.0088,rz:.01},{y:.839-len*.35,x,z:.034,rx:.0095,rz:.012},{y:.852,x,z:.024,rx:.0105,rz:.014}],C.rubber,bone(wrist),{segments:10});
  }
  b.loft('rubber',[{y:.822,x:side*.275,z:.067,rx:.008,rz:.01},{y:.842,x:side*.266,z:.056,rx:.013,rz:.014},{y:.872,x:side*.272,z:.036,rx:.016,rz:.019}],C.rubber,bone(wrist),{segments:12});
  b.patch('rubber',(u,v)=>[side*.313+mix(-.027,.027,u),.862+v*.024,.059-Math.abs(u-.5)*.02],4,3,0x4b5961,bone(wrist));
  // Shaped leather boots: full foot length 0.30 m; no oversized box soles.
  const ankle=side<0?B.ankleL:B.ankleR;
  const soleRings=[{y:-.092,rx:.038,rz:.012,z:-.027},{y:-.075,rx:.05,rz:.014,z:-.026},{y:.0,rx:.056,rz:.014,z:-.026},{y:.13,rx:.059,rz:.014,z:-.026},{y:.19,rx:.05,rz:.013,z:-.027},{y:.208,rx:.022,rz:.009,z:-.027}].map(r=>({...r,x:sx}));
  const rot=p=>[p[0],-p[2],p[1]];
  b.loft('rubber',soleRings,C.sole,bone(ankle),{segments:20,transform:rot});
  b.loft('leather',[{y:-.086,rx:.035,rz:.041,z:-.079},{y:-.06,rx:.047,rz:.055,z:-.089},{y:0,rx:.053,rz:.063,z:-.098},{y:.075,rx:.056,rz:.043,z:-.082},{y:.155,rx:.05,rz:.031,z:-.072},{y:.193,rx:.037,rz:.023,z:-.068},{y:.202,rx:.015,rz:.014,z:-.066}].map(r=>({...r,x:sx})),C.leather,bone(ankle),{segments:24,transform:rot});
  b.loft('leather',[{y:.08,x:sx,z:-.025,rx:.049,rz:.055},{y:.14,x:sx,z:-.026,rx:.052,rz:.054},{y:.185,x:sx,z:-.027,rx:.047,rz:.048},{y:.197,x:sx,z:-.027,rx:.045,rz:.046}],0x76573e,bone(ankle),{segments:20});
  for(let j=0;j<4;j++){const z=-.01+j*.025,y=.153-j*.012;const points=[[sx-.029,y,z],[sx,y+.003,z+.007],[sx+.029,y,z]];b.tube('rubber',points,.0026,0x302d2a,bone(ankle),6);for(const dx of[-.034,.034])b.ellipsoid('metal',[sx+dx,y-.001,z],[.004,.003,.004],0xa69376,bone(ankle),8,4);}
  for(const dx of[-1,1])for(let j=0;j<5;j++)b.patch('rubber',(u,v)=>[sx+dx*(.052+v*.003),.014+u*.013,.012+j*.032+v*.009],1,1,0x111e29,bone(ankle),dx>0);
 }
 // Sculpted human head: chin, jaw, cheekbone and forehead are individual profile transitions.
 b.loft('skin',[{y:1.575,rx:.036,rz:.042,z:.018},{y:1.591,rx:.058,rz:.055,z:.014},{y:1.62,rx:.083,rz:.068,z:.007},{y:1.657,rx:.096,rz:.078,z:0},{y:1.708,rx:.103,rz:.086,z:-.004},{y:1.749,rx:.1,rz:.084,z:-.004},{y:1.79,rx:.093,rz:.078,z:-.007},{y:1.825,rx:.067,rz:.055,z:-.008},{y:1.837,rx:.016,rz:.015,z:-.008}],C.skin,bone(B.head),{segments:32});
 // Nose bridge and alar contours; continuous shaded surface rather than a protruding cube.
 b.patch('skin',(u,v)=>{const y=mix(1.687,1.749,v),w=mix(.019,.011,v),x=(u-.5)*2*w,z=.087+Math.sin(v*Math.PI)*.022+Math.sin(u*Math.PI)*.018*(1-v*.5);return [x,y,z];},10,8,C.skin,bone(B.head));
 for(const side of[-1,1]){
  b.ellipsoid('skin',[side*.105,1.704,-.005],[.016,.031,.02],C.skin,bone(B.head),14,10);
  b.ellipsoid('skin',[side*.115,1.704,.003],[.006,.018,.01],C.skinShadow,bone(B.head),12,8);
  b.ellipsoid('skin',[side*.043,1.728,.076],[.027,.012,.014],0xe3dfd0,bone(B.head),16,8);
  b.ellipsoid('skin',[side*.043,1.727,.089],[.0075,.008,.003],0x514536,bone(B.head),12,8);
  b.ellipsoid('skin',[side*.043,1.727,.092],[.0037,.0048,.0015],0x1e2932,bone(B.head),10,6);
  const brow=[];for(let i=0;i<6;i++)brow.push([side*(.022+i*.008),1.75+Math.sin(i/5*Math.PI)*.004,.083-i*.001]);b.tube('hair',brow,.0033,C.hair,bone(B.head),6);
  // Fitted industrial glasses: fine frames and transparent wrap-around lenses.
  const center=side*.044,outline=[];for(let i=0;i<=20;i++){const a=i/20*Math.PI*2;outline.push([center+Math.cos(a)*.039,1.725+Math.sin(a)*.019,.104-Math.abs(Math.cos(a))*.01]);}
  b.tube('metal',outline,.0019,0x4b5962,bone(B.head),6);
  b.patch('lens',(u,v)=>[center+mix(-.036,.036,u),1.725+mix(-.016,.016,v),.104-Math.abs(u-.5)*.018],8,4,0xe1f1f1,bone(B.head));
  b.tube('metal',[[side*.082,1.732,.089],[side*.109,1.731,.042],[side*.117,1.714,-.018]],.0022,0x596870,bone(B.head),6);
 }
 b.tube('metal',[[-.009,1.727,.108],[0,1.735,.113],[.009,1.727,.108]],.002,0x6b787b,bone(B.head),6);
 b.tube('skin',[[-.028,1.658,.083],[0,1.654,.09],[.028,1.658,.083]],.0019,0x865e50,bone(B.head),6);
 b.ellipsoid('skin',[0,1.609,.07],[.034,.017,.014],0xc49a7c,bone(B.head),18,8);
 // Hair cap under the hard hat with small swept edge clumps at the temples and nape.
 b.loft('hair',[{y:1.708,rx:.084,rz:.074,z:-.018},{y:1.735,rx:.101,rz:.085,z:-.013},{y:1.777,rx:.101,rz:.086,z:-.012},{y:1.82,rx:.075,rz:.063,z:-.013}],C.hair,bone(B.head),{segments:28,start:Math.PI*.93,end:Math.PI*2.08,cap:false,warp:(y,a)=>Math.sin(a*9+y*15)*.002});
 // Hard hat with visor, double rolled brim, crown ribs and suspension clips.
 b.loft('helmet',[{y:1.794,rx:.126,rz:.112,z:-.004},{y:1.812,rx:.131,rz:.116,z:-.004},{y:1.848,rx:.123,rz:.108,z:-.005},{y:1.886,rx:.099,rz:.086,z:-.006},{y:1.916,rx:.062,rz:.054,z:-.006},{y:1.93,rx:.012,rz:.011,z:-.006}],C.white,bone(B.head),{segments:36});
 const brim=(y,radial)=>({y,rx:.143*radial,rz:.139*radial,z:.016});b.loft('helmet',[brim(1.797,.96),brim(1.803,1),brim(1.812,.99),brim(1.817,.94)],0xe1e5df,bone(B.head),{segments:40,warp:(y,a)=>Math.max(0,Math.sin(a))*.012});
 for(const side of[-1,1]){const rib=[];for(let i=0;i<13;i++){const z=mix(-.09,.095,i/12);const y=1.93-Math.pow(z/.13,2)*.09;rib.push([side*.043,y,z]);}b.tube('helmet',rib,.004,0xf0f0e6,bone(B.head),6);b.ellipsoid('metal',[side*.129,1.808,-.02],[.006,.009,.015],0x68767a,bone(B.head),10,6);}
 const geometry=b.finish();let vertices=0,triangles=0;for(const g of geometry.values()){vertices+=g.attributes.position.count;triangles+=g.index.count/3;}
 return {geometry,stats:{vertices,triangles,materials:geometry.size,bones:18,height:BODY.height,headRatio:(BODY.height-.105)/BODY.headHeight}};
}
export function makeSkeleton(){const specs=[['root',-1,0,0,0],['pelvis',0,0,BODY.hip,0],['spine',1,0,1.15,0],['chest',2,0,1.4,0],['neck',3,0,1.555,0],['head',4,0,1.68,0],['upperArm.L',3,-.245,1.465,0],['elbow.L',6,-.29,1.17,.006],['wrist.L',7,-.309,.922,.018],['upperArm.R',3,.245,1.465,0],['elbow.R',9,.29,1.17,.006],['wrist.R',10,.309,.922,.018],['hip.L',1,-.107,BODY.hip,0],['knee.L',12,-.107,BODY.knee,.012],['ankle.L',13,-.107,BODY.ankle,0],['hip.R',1,.107,BODY.hip,0],['knee.R',15,.107,BODY.knee,.012],['ankle.R',16,.107,BODY.ankle,0]];
 const bones=specs.map(s=>{const b=new T.Bone();b.name=s[0];return b;});specs.forEach((s,i)=>{if(s[1]<0)bones[i].position.set(s[2],s[3],s[4]);else{const p=specs[s[1]];bones[i].position.set(s[2]-p[2],s[3]-p[3],s[4]-p[4]);bones[s[1]].add(bones[i]);}});return {bones,root:bones[0]};}
