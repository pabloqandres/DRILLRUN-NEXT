// Firestore cloud save with one active controller per Google account.
// Always reconcile progress BEFORE uploading any local save.
const COLLECTION='saves',DOC_FIELD='state',UPLOAD_INTERVAL_MS=4000;
const DEVICE_KEY='drillrun-cloud-device-v2';
const deviceId=(()=>{
 try{
  let id=localStorage.getItem(DEVICE_KEY);
  if(!id){id=crypto.randomUUID();localStorage.setItem(DEVICE_KEY,id);}
  return id;
 }catch{return 'session-'+Math.random().toString(36).slice(2);}
})();
let db=null,uid=null,authorizedUid=null,lastCloud='',timer=null,unwatch=null;
let uploadChain=Promise.resolve(),onLost=null;
let readyResolve=null;
const authReady=new Promise(resolve=>{readyResolve=resolve;});

const stage=s=>{
 if(!s)return -1;
 if(s.mission4?.phase==='complete')return 400;
 if(s.mission4?.phase&&s.mission4.phase!=='inactive')return 350;
 if(s.mission3?.phase==='complete'||s.contract?.status==='delivered')return 300;
 if(s.mission3?.phase&&s.mission3.phase!=='inactive')return 250;
 if(s.hsec?.completedAt)return 200;
 if(s.office?.level>=2)return 150;
 if(s.office?.status==='built')return 100;
 return 0;
};
export function cloudProgressStage(s){return stage(s);}
export function cloudGeneration(s){return Math.max(0,Math.floor(Number(s?.cloudGeneration)||0));}
export function cloudChoice(local,remote,ownerMatches=false){
 if(!local)return {state:remote,source:remote?'cloud':'empty'};
 if(!remote)return {state:local,source:'device'};
 if(local.cloudResetPending)return {state:{...local,cloudGeneration:Math.max(cloudGeneration(local),cloudGeneration(remote))+1,cloudResetPending:false},source:'new-game'};
 if(cloudGeneration(local)!==cloudGeneration(remote))
  return cloudGeneration(local)>cloudGeneration(remote)?{state:local,source:'device'}:{state:remote,source:'cloud'};
 // The same save generation keeps the original monotonic progression fallback.
 // Never allow historical M4 to override an explicitly new M1 generation.
 const localWins=stage(local)>stage(remote)||
  (ownerMatches&&stage(local)===stage(remote)&&Number(local.savedAt)>Number(remote.savedAt));
 return localWins?{state:local,source:'device'}:{state:remote,source:'cloud'};
}
export function cloudUserId(){return uid;}
export function cloudHasControl(){return !!uid&&authorizedUid===uid;}

function stopWatching(){
 if(unwatch){unwatch();unwatch=null;}
}
function cancelUpload(){
 authorizedUid=null;
 if(timer){clearTimeout(timer);timer=null;}
}
export function cloudDisableWrites(){cancelUpload();}

export async function initCloudSave(authResult,onAccountReady=null){
 if(!authResult?.configured){readyResolve(null);return;}
 try{
  const config=await fetch('./config/auth.json',{cache:'no-store'}).then(r=>r.json());
  if(!config.firebase?.projectId){readyResolve(null);return;}
  const [appSdk,storeSdk,authSdk]=await Promise.all([
   import('https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js'),
   import('https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js')
  ]);
  const app=appSdk.getApps()[0]||appSdk.initializeApp(config.firebase);
  db=storeSdk.getFirestore(app);
  authSdk.onAuthStateChanged(authSdk.getAuth(app),user=>{
   const incoming=user?.uid||null;
   if(incoming!==uid){cancelUpload();stopWatching();lastCloud='';}
   uid=incoming;
   readyResolve(uid);
   if(onAccountReady)Promise.resolve(onAccountReady(user)).catch(e=>console.error('[CloudSave] reconcile:',e));
  });
  setTimeout(()=>readyResolve(null),4000);
 }catch(e){console.error('[CloudSave] init:',e);readyResolve(null);}
}

// Ownership is claimed atomically. The PC's completed M4 will win over
// a stale M3 cloud save even when M3 was autosaved more recently.
export async function cloudTakeControl(localState,onSessionLost){
 await authReady;
 if(!db||!uid)return {status:'unavailable'};
 const requestUid=uid;
 cancelUpload();
 stopWatching();
 const {doc,runTransaction,onSnapshot}=await import('https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js');
 const ref=doc(db,COLLECTION,requestUid);
 try{
  const choice=await runTransaction(db,async tx=>{
   const snap=await tx.get(ref);
   const data=snap.exists()?snap.data():{};
   let remote=null;
   try{remote=data?.[DOC_FIELD]?JSON.parse(data[DOC_FIELD]):null;}catch{}
   const canRestore=x=>x&&typeof x==='object'&&(x.version===5||x.version===6);
   if(!canRestore(remote))remote=null;
   const validLocal=canRestore(localState)?localState:null;
   const choice=cloudChoice(validLocal,remote,data.ownerDeviceId===deviceId);
   const chosen=choice.state;
   const raw=chosen?JSON.stringify(chosen):null;
   const payload={ownerDeviceId:deviceId,ownerSince:Date.now(),sessionVersion:2};
   if(choice.source==='device'||choice.source==='new-game'){payload[DOC_FIELD]=raw;payload.updatedAt=Date.now();}
   tx.set(ref,payload,{merge:true});
   return {state:chosen,source:choice.source,raw};
  });
  if(requestUid!==uid)return {status:'account-changed'};
  authorizedUid=requestUid;onLost=onSessionLost;
  lastCloud=choice.raw||'';
  unwatch=onSnapshot(ref,snapshot=>{
   if(uid!==requestUid)return;
   const owner=snapshot.data()?.ownerDeviceId;
   if(owner&&owner!==deviceId&&authorizedUid===requestUid){
    cancelUpload();stopWatching();
    if(onLost)onLost();
   }
  },err=>console.error('[CloudSave] session watch:',err));
  return {status:'ready',...choice};
 }catch(e){
  console.error('[CloudSave] takeover:',e);
  cancelUpload();
  return {status:'error'};
 }
}

// Explicit New Game is the only action allowed to supersede a higher mission.
// A monotonically increasing generation lets every other device choose it.
export async function cloudStartNewGame(state){
 await authReady;
 if(!db||!uid)return {status:'offline'};
 if(authorizedUid!==uid)return {status:'not-controller'};
 const requestedUid=uid;
 if(timer){clearTimeout(timer);timer=null;}
 await uploadChain;
 const {doc,runTransaction}=await import('https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js');
 const ref=doc(db,COLLECTION,requestedUid);
 try{
  const outcome=await runTransaction(db,async tx=>{
   const snap=await tx.get(ref);
   const data=snap.exists()?snap.data():{};
   if(data.ownerDeviceId&&data.ownerDeviceId!==deviceId)return null;
   let previous=null;
   try{previous=data?.[DOC_FIELD]?JSON.parse(data[DOC_FIELD]):null;}catch{}
   const next={...state,cloudGeneration:Math.max(cloudGeneration(previous),cloudGeneration(state))+1,cloudResetPending:false};
   const raw=JSON.stringify(next);
   tx.set(ref,{[DOC_FIELD]:raw,updatedAt:Date.now(),ownerDeviceId:deviceId},{merge:true});
   return {state:next,raw};
  });
  if(!outcome||uid!==requestedUid||authorizedUid!==requestedUid)return {status:'not-controller'};
  lastCloud=outcome.raw;
  return {status:'ready',...outcome};
 }catch(e){console.error('[CloudSave] new game sync:',e);return {status:'error'};}
}

async function upload(saveKey){
 if(!db||!uid||uid!==authorizedUid)return false;
 const requestUid=uid;
 const raw=localStorage.getItem(saveKey);
 if(!raw||raw===lastCloud)return true;
 const {doc,runTransaction}=await import('https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js');
 const ref=doc(db,COLLECTION,requestUid);
 const wrote=await runTransaction(db,async tx=>{
  const snap=await tx.get(ref);
  if(snap.exists()&&snap.data()?.ownerDeviceId!==deviceId)return false;
  if(uid!==requestUid||authorizedUid!==requestUid)return false;
  tx.set(ref,{[DOC_FIELD]:raw,updatedAt:Date.now(),ownerDeviceId:deviceId},{merge:true});
  return true;
 });
 if(wrote&&uid===requestUid&&authorizedUid===requestUid)lastCloud=raw;
 if(!wrote&&uid===requestUid&&authorizedUid===requestUid){
  cancelUpload();stopWatching();
  if(onLost)onLost();
 }
 return wrote;
}
export function cloudFlushNow(saveKey){
 if(timer){clearTimeout(timer);timer=null;}
 uploadChain=uploadChain.then(()=>upload(saveKey)).catch(e=>{
  console.error('[CloudSave] upload:',e);return false;
 });
 return uploadChain;
}
export function cloudSave(saveKey){
 if(!db||!uid||authorizedUid!==uid||timer)return;
 timer=setTimeout(()=>{timer=null;void cloudFlushNow(saveKey);},UPLOAD_INTERVAL_MS);
}
