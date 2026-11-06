// No account or token is fabricated. Loading this optional adapter never blocks guest play.
export async function prepareAuth(onUser){
 try{
  const config=await fetch('./config/auth.json',{cache:'no-store'}).then(r=>r.json());
  if(config.provider!=='firebase'||!config.firebase?.apiKey||!config.firebase.authDomain||!config.firebase.projectId)return {configured:false};
  const [appSdk,authSdk]=await Promise.all([import('https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js')]);
  const auth=authSdk.getAuth(appSdk.initializeApp(config.firebase));authSdk.onAuthStateChanged(auth,onUser);
  return {configured:true,signIn:()=>authSdk.signInWithPopup(auth,new authSdk.GoogleAuthProvider())};
 }catch{return {configured:false};}
}
