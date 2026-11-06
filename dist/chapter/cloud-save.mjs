// Cloud save adapter — syncs localStorage game state to Firestore when authenticated.
// Falls back to localStorage-only for guests. Never blocks gameplay.
const COLLECTION='saves',DOC_FIELD='state',DEBOUNCE_MS=4000;
let db=null,uid=null,pending=null,timer=null,lastCloud='',uidResolve=null;
const uidReady=new Promise(r=>{uidResolve=r;});

export async function initCloudSave(authResult){
 if(!authResult?.configured){console.log('[CloudSave] not configured');uidResolve(null);return;}
 try{
  const config=await fetch('./config/auth.json',{cache:'no-store'}).then(r=>r.json());
  if(!config.firebase?.projectId){console.log('[CloudSave] no projectId');uidResolve(null);return;}
  const [appSdk,storeSdk,authSdk]=await Promise.all([
   import('https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js'),
   import('https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js')
  ]);
  const app=appSdk.getApps()[0]||appSdk.initializeApp(config.firebase);
  db=storeSdk.getFirestore(app);
  authSdk.onAuthStateChanged(authSdk.getAuth(app),user=>{
   uid=user?.uid||null;
   console.log('[CloudSave] uid:',uid);
   uidResolve(uid);
  });
  // Timeout: if auth doesn't resolve in 4s, proceed without cloud
  setTimeout(()=>uidResolve(null),4000);
  console.log('[CloudSave] initialized, db:',!!db);
 }catch(e){db=null;console.error('[CloudSave] init error:',e);uidResolve(null);}
}

export async function cloudLoad(saveKey){
 // Wait for auth to resolve (up to 4s timeout)
 await uidReady;
 if(!db||!uid){console.log('[CloudSave] cloudLoad skipped — db:',!!db,'uid:',uid);return null;}
 try{
  const {doc,getDoc}=await import('https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js');
  const snap=await getDoc(doc(db,COLLECTION,uid));
  if(!snap.exists()){console.log('[CloudSave] no cloud save found for uid:',uid);return null;}
  const remote=snap.data();
  if(!remote?.[DOC_FIELD]){console.log('[CloudSave] cloud doc exists but no state field');return null;}
  const cloud=JSON.parse(remote[DOC_FIELD]);
  const local=JSON.parse(localStorage.getItem(saveKey)||'null');
  console.log('[CloudSave] cloud savedAt:',cloud.savedAt,'local savedAt:',local?.savedAt);
  if(local&&local.savedAt>cloud.savedAt){console.log('[CloudSave] local is newer, keeping local');return null;}
  lastCloud=remote[DOC_FIELD];
  console.log('[CloudSave] using cloud save (newer)');
  return cloud;
 }catch(e){console.error('[CloudSave] cloudLoad error:',e);return null;}
}

export function cloudSave(saveKey){
 if(!db||!uid){return;}
 const raw=localStorage.getItem(saveKey);
 if(!raw||raw===lastCloud)return;
 if(timer)clearTimeout(timer);
 timer=setTimeout(()=>{
  console.log('[CloudSave] flushing to cloud...');
  flush(raw).then(()=>console.log('[CloudSave] flush OK')).catch(e=>console.error('[CloudSave] flush error:',e));
 },DEBOUNCE_MS);
}

async function flush(raw){
 if(!db||!uid||pending)return;
 pending=true;
 try{
  const {doc,setDoc}=await import('https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js');
  await setDoc(doc(db,COLLECTION,uid),{[DOC_FIELD]:raw,updatedAt:Date.now()},{merge:true});
  lastCloud=raw;
 }finally{pending=false;}
}
