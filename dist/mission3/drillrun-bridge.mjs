// Mission 3 — Bridge between main game and Drill Run minigame
// Translates geology/drill config into minigame parameters and reads results back.

export function prepareMinigameConfig(s,boreholeId){
 // Will convert stratigraphy + drill + bit into minigame layer config
 throw new Error('notImplemented');
}
export function importMinigameResult(s,boreholeId,result,now=Date.now()){
 // Reads score/depth from completed minigame session, advances borehole
 throw new Error('notImplemented');
}
export function minigameHistory(s){return s.drillRunSessions||[];}
