// Authenticated Firestore save synchronization.
// Never upload a device save until the account's cloud version is reconciled.
const COLLECTION='saves',DOC_FIELD='state',UPLOAD_INTERVAL_MS=4000;
let db=null,uid=null,approvedUid=null,lastCloud='',timer=null,uploadChain=Promise.resolve();
let readyResolve=null;
const authReady=new Promise(resolve=>{readyResolve=resolve;});

export async function initCloudSave(authResult,onAccountReady=null){
 if(!authResult?.configured){console.log('[CloudSave] not configured');readyResolve(null);return;}
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
   const newUid=user?.uid||null;
   if(uid!==newUid){
    approvedUid=null;lastCloud='';
    if(timer){clearTimeout(timer);timer=null;}
   }
   uid=newUid;
   readyResolve(uid);
   console.log('[CloudSave] authenticated:',!!uid);
   if(onAccountReady)Promise.resolve(onAccountReady(user)).catch(e=>console.error('[CloudSave] account reconciliation failed:',e));
  });
  setTimeout(()=>readyResolve(null),4000);
  console.log('[CloudSave] initialized');
 }catch(e){db=null;approvedUid=null;console.error('[CloudSave] init error:',e);readyResolve(null);}
}

// Explicit read: timestamps alone must NOT resolve cross-device conflicts.
// Autosave refreshes savedAt even when there was no actual player progress.
export async function cloudSnapshot(){
 await authReady;
 if(!db||!uid)return {status:'signed-out',uid:null};
 const requestUid=uid;
 try{
  const {doc,getDoc}=await import('https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js');
  const snap=await getDoc(doc(db,COLLECTION,requestUid));
  if(requestUid!==uid)return {status:'account-changed',uid:requestUid};
  if(!snap.exists()||!snap.data()?.[DOC_FIELD])return {status:'empty',uid:requestUid};
  const raw=snap.data()[DOC_FIELD];
  const state=JSON.parse(raw);
  if(!state||typeof state!=='object')return {status:'error',uid:requestUid};
  lastCloud=raw;
  return {status:'found',uid:requestUid,state,raw};
 }catch(e){console.error('[CloudSave] cloudSnapshot failed:',e);return {status:'error',uid:requestUid};}
}

export function cloudAllowWrites(accountUid){
 if(!db||!uid||uid!==accountUid)return false;
 approvedUid=uid;return true;
}
export function cloudDisableWrites(){
 approvedUid=null;
 if(timer){clearTimeout(timer);timer=null;}
}
export function cloudUserId(){return uid;}

// Retained for older consumers; does not authorize writes or automatically win.
export async function cloudLoad(saveKey){
 const result=await cloudSnapshot();
 if(result.status!=='found')return null;
 const local=JSON.parse(localStorage.getItem(saveKey)||'null');
 return !local||Number(result.state.savedAt)>Number(local.savedAt)?result.state:null;
}

export function cloudSave(saveKey){
 if(!db||!uid||approvedUid!==uid)return;
 // Throttled upload, not a trailing debounce: saving locally every two
 // seconds must not indefinitely postpone the four-second Firestore write.
 if(timer)return;
 const authorizedUid=uid;
 timer=setTimeout(()=>{
  timer=null;
  const write=async()=>{
   if(!db||uid!==authorizedUid||approvedUid!==authorizedUid)return;
   const raw=localStorage.getItem(saveKey);
   if(!raw||raw===lastCloud)return;
   const {doc,setDoc}=await import('https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js');
   if(uid!==authorizedUid||approvedUid!==authorizedUid)return;
   await setDoc(doc(db,COLLECTION,authorizedUid),
    {[DOC_FIELD]:raw,updatedAt:Date.now()},{merge:true});
   lastCloud=raw;
   console.log('[CloudSave] uploaded authenticated save');
  };
  uploadChain=uploadChain.then(write,write).catch(e=>console.error('[CloudSave] upload failed:',e));
 },UPLOAD_INTERVAL_MS);
}
