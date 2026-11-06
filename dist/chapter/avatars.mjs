export const AVATARS=[
 {id:'operator01',perkIcon:'wallet',labelKey:'avatar01',roleKey:'negotiator',perkKey:'negotiatorPerk',bioKey:'negotiatorBio',summaryKey:'negotiatorSummary',asset:'operator-candidate.glb',height:1.85,radius:.33,available:true,bonuses:{contractIncome:.04}},
 {id:'operator02',perkIcon:'wrench',labelKey:'avatar02',roleKey:'mechanic',perkKey:'mechanicPerk',bioKey:'mechanicBio',summaryKey:'mechanicSummary',asset:'operator-02.glb',height:1.83,radius:.36,available:true,bonuses:{maintenanceCost:-.04,maintenanceTime:-.04}},
 {id:'operator03',perkIcon:'geology',labelKey:'avatar03',roleKey:'analyst',perkKey:'analystPerk',bioKey:'analystBio',summaryKey:'analystSummary',asset:'operator-03.glb',height:1.88,radius:.31,available:true,bonuses:{geologyCost:-.05}},
 {id:'operator04',perkIcon:'build',labelKey:'avatar04',roleKey:'constructor',perkKey:'constructorPerk',bioKey:'constructorBio',summaryKey:'constructorSummary',asset:'operator-04.glb',height:1.66,radius:.30,available:true,bonuses:{constructionTime:-.05}}
];
export const avatarDefinition=id=>AVATARS.find(a=>a.id===id)||AVATARS[0];
