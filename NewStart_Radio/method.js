/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('pma-voice:setTalkingOnRadio', handleTalking);

// ---
function setFrequency(number) {
   const frequency = number || options.frequency;

   const findRadio = exports.NewStart_Inventory.info('currentItems').some(obj => obj.id === 32);
   const isFreqOfficial = config.official.includes(frequency);
   const isOfficial =  exports.NewStart_Factions.info()?.type === 'official' && !exports.NewStart_Factions.info().isVacation;

   if (findRadio && ((isOfficial && isFreqOfficial) || !isFreqOfficial)) {
      options.frequency = frequency;
      options.isActive = true;
      exports.NewStart_HudSystem.radio({ isActive: true });
      exports["pma-voice"].setRadioChannel(frequency);
      return true;
   } else return false;
}

// ---
function handleTalking(serverID, isActive) {
   const faction = exports.NewStart_Factions.info();
   const isOfficial = config.official.includes(options.frequency) && faction?.type === 'official' && !faction.isVacation;
   
   if (isOfficial) {
      const player = exports.NewStart_PoliceTools.method('getPlayersFactions').find(p => p.serverID === serverID);
      
      if (player) {
         exports.NewStart_HudSystem.method('setStateNUI', { 
            radioTalk: isActive ? { type: faction.key, name: `[${player.code}] ${player.user.character.identifier.name}` } : null 
         });

      } else if (!isActive) {
         exports.NewStart_HudSystem.method('setStateNUI', { radioTalk: null });
      }
   }
}

// ---
function handleKick(isTemporary, checkPrivate) {
   if (!options.frequency || (checkPrivate && !config.official.includes(options.frequency))) return;

   exports['pma-voice'].removePlayerFromRadio();
   exports.NewStart_HudSystem.radio({ isHide: true });
   exports.NewStart_HudSystem.method('setStateNUI', { radioTalk: null });
   options.isActive = false;
   options.forceNoActive = false;

   if (!isTemporary) {
      emitNet('NewStart:updateUser', { 'mode.radio': 0 });
      options.frequency = null;
   }
}

// ---
function closeUI() {
   const pedID = PlayerPedId();

   SetNuiFocus(false, false);
   TaskPlayAnim(pedID, 'cellphone@', 'cellphone_text_out', 4.0, -1, -1, 50, 0, false, false, false);
   options.isOpen = false;

   setTimeout(_=> { 
      DeleteEntity(options.radioObj);
      StopAnimTask(pedID, 'cellphone@', 'cellphone_text_out', 1.0);
   }, 100);
}