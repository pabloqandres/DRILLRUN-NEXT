// Google/Firebase sign-in, including mobile popup fallback.
// The user's Google session is independent of the active game-device lease.
export async function prepareAuth(onUser){
 try{
  const config=await fetch('./config/auth.json',{cache:'no-store'}).then(r=>r.json());
  if(config.provider!=='firebase'||!config.firebase?.apiKey||!config.firebase.authDomain||!config.firebase.projectId)return {configured:false};
  const [appSdk,authSdk]=await Promise.all([
   import('https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js')
  ]);
  const app=appSdk.getApps()[0]||appSdk.initializeApp(config.firebase);
  const auth=authSdk.getAuth(app);
  authSdk.onAuthStateChanged(auth,onUser);
  // Complete signInWithRedirect if the browser had to leave the page.
  authSdk.getRedirectResult(auth).catch(e=>console.warn('[GoogleAuth] redirect failed:',e.code||e.message));
  return {configured:true,signIn:async()=>{
   const provider=new authSdk.GoogleAuthProvider();
   try{return await authSdk.signInWithPopup(auth,provider);}
   catch(e){
    const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'');
    if(mobile&&['auth/popup-blocked','auth/operation-not-supported-in-this-environment','auth/cancelled-popup-request'].includes(e.code)){
     return authSdk.signInWithRedirect(auth,provider);
    }
    throw e;
   }
  }};
 }catch(e){console.error('[GoogleAuth] initialization:',e);return {configured:false};}
}
