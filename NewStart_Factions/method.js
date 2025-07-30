/* ``````````` ## Development By el8rbawY ## ```````````*/
let timeInterval = null;

onNet('NewStart_Factions:initial-client', data => {
   data = JSON.parse(data);

   const reorganize = item => ({
      userID: item.user._id,
      customID: item.user.customID,
      name: item.user.character.identifier.name,
      rankID: item.rankID,
      subRankID: item.subRankID,
      time: item.time,
      level: exports.NewStart_MainMenu.getLevel(item.mode?.level || 0),
      status: item.status,
      location: item.user.location.name,
      age: item.user.character.identifier.age,
      isCurrent: !!item.isCurrent,
      code: item.code,
      serverID: item.serverID,
      clientID: GetPlayerFromServerId(item.serverID),
      giveVacations: item.giveVacations
   });

   if (data.type === 'main') {
      data.faction.players = data.faction.players.map(item => reorganize(item));

      const find = data.faction.players.find(p => p.isCurrent);
      const rankName = data.faction.ranks.find(item => item.id === find.rankID).name;
      const players = data.faction.players;
      delete data.faction.players;

      informations = {
         type: data.faction.type,
         customID: find.customID,
         name: data.faction.name,
         id: data.faction._id,
         key: data.faction.key,
         isVacation: find.status === 'vacation',
         playerName: find.name,
         code: find.code,
         rankID: find.rankID, rankName, subRankID: find.subRankID,
         ranks: data.faction.type === 'official' ? data.faction.ranks : []
      };

      if (!exports.NewStart_Jobs.currentJob(true)) {
         exports.NewStart_HudSystem.updateJob({ 
            type: 'faction', 
            title: (informations.isVacation ? 'إجازة مؤقتة' : rankName) + ' - ' + data.faction.name 
         });
      }
      
      SendNUIMessage(JSON.stringify({ type: 'initial', info: data.faction, players }));

      if (!timeInterval && informations.type === 'official') { // start job
         timeInterval = setInterval(_=> { // 10 min => edit in HTTP
            if (exports.NewStart_Employee.data().isActive) {
               emitNet('NewStart_Factions:userUpdate-server', { type: 'time', id: informations.id });
            }
         }, 600000);

         emit('NewStart_Employee:starting-client', JSON.stringify({ 
            key: informations.key, 
            id: data.other?.outfitID, 
            vehicles: data.other?.vehicles,
            isTools: !!data.other?.isTools,
            accessories: data.other?.accessories,
            isVacation: informations.isVacation
         }));
      } 

   } else if (data.type === 'kick') {
      SendNUIMessage(JSON.stringify({ type: 'playerKick', customID: data.customID }));
   }
});

// ---
onNet('NewStart_Factions:update-client', (action, info = {}) => {
   if (action === 'quitFaction') {
      toggleScreen(false);
      SendNUIMessage(JSON.stringify({ type: 'closeUI', isKick: true }));
      quitFaction();

   } else if (action === 'salary') {
      if (informations?.isVacation || !exports.NewStart_Employee.data().isActive) return;

      if (info.isReceive) {
         emitNet('NewStart:giveMoney', { name: info.name, amount: info.amount });
         exports.NewStart_MainMenu.levelUp(info.level);

      } else if (informations) {
         emitNet('NewStart_Factions:general-server', JSON.stringify({ type: 'salary', key: informations.key, rankID: informations.rankID }));
      }

   } else if (action === 'refresh') {
      if (exports.NewStart_Employee.data().isActive) emitNet('NewStart_Factions:initial-server', informations.id);

   } else { // vacation, promotion, invite receive
      SendNUIMessage(JSON.stringify({ type: 'handleUser', action, info }));
      
      if (action === 'inviteReceive') {
         inviteID = info.id;
         SetNuiFocus(true, true);

      } else if (action === 'vacation') {
         informations.isVacation = !info.isReset;
         exports.NewStart_Employee.method('relaxation', informations.isVacation);

         if (informations.isVacation) {
            exports.NewStart_Radio.method('kick', true);
            exports.NewStart_HudSystem.updateJob({ type: 'faction', title: 'إجازة مؤقتة' + ' - ' + informations.name });
            
         } else if (exports.NewStart_Jobs.currentJob(true) || !informations.isVacation) { // kick from NewStart_Jobs
            exports.NewStart_Jobs.closeUI(true);
            exports.NewStart_HudSystem.updateJob({ type: 'faction', title: informations.rankName + ' - ' + informations.name });
         }

      } else if (action === 'promotion' && informations) {
         if (informations.customID == info.customID) {
            informations.rankID = info.rankID;
            exports.NewStart_HudSystem.updateJob({ type: 'faction', title: informations.ranks.find(r => r.id === info.rankID).name + ' - ' + informations.name });
         }
      } 
   }
});

// ---
function toggleScreen(value) {
   if (value) {
      exports.NewStart_HudSystem.closeUI();
      exports.NewStart_Phone.noticesToggle(true);
      exports.NewStart_MainMenu.toggleAds(false);
      DisplayRadar(false);

   } else {
      exports.NewStart_Phone.noticesToggle(false);

      if (!exports.NewStart_MainMenu.isOpen()) {
         DisplayRadar(true);
         exports.NewStart_HudSystem.openHud();
         exports.NewStart_MainMenu.toggleAds(true);
      }
   }
}

// ---
function quitFaction() {
   if (['police', 'facilities'].includes(informations.key) && exports.NewStart_Employee.data().isActive) {
      exports.NewStart_Robbery.method('reset', true);
   }

   if (!exports.NewStart_Jobs.currentJob().type) {
      exports.NewStart_HudSystem.updateJob({});
   }

   informations = null;   
   exports.NewStart_Employee.quit();
   exports.NewStart_Phone.RESET_READ_REPORTS();
   exports.NewStart_Radio.method('kick', true);
   exports.NewStart_Police.method('closeUI');

   SetNuiFocus(false, false);
   timeInterval = null;
   clearInterval(timeInterval);
}