/* ``````````` ## Development By el8rbawY ## ```````````*/
const state = {
   location: [-151.8329, 6298.5361, 31.4871], // Career Center
   isOpen: false, runClose: false, currentJob: null, isFirst: true, vipTax: false
};

// ---
on('onClientGameTypeStart', _=> { 
   createBlip(457, 'ﺔﻨﻳﺪﻤﻟﺍ ﺰﻛﺮﻣ', state.location, 0);
});

// ---
onNet('NewStart_Jobs:currentUpdate-client', (data, isQuit) => {   
   if (isQuit) {
      quitJob();

   } else {
      const find = jobsList.find(obj => obj.id === data.id);

      state.currentJob = { type: 'general', id: find.id, isActive: data.isActive };
      exports.NewStart_HudSystem.updateJob({ type: 'general', title: 'عامل - ' + find.name });
      startJob();
   }
});

// ---
on('playerSpawned', _=> {
   if (!state.isFirst || !state.currentJob?.isActive) return;
   exports.NewStart_Clothes.pedReset(false);

   if (state.currentJob?.id === 0) OIL_AND_GAS_OUTFIT();
   else if (state.currentJob?.id === 1) FARMING_OUTFIT(); 
   else if (state.currentJob?.id === 2) WEST_SHIPPING_OUTFIT();
   else if (state.currentJob?.id === 3) POULTRY_OUTFIT();
   else if (state.currentJob?.id === 4) METAL_OUTFIT();
   else FISHING_OUTFIT();

   state.isFirst = false;
});

// ---
function startJob() {
   if (state.currentJob?.id === 0) START_OIL_AND_GAS_JOB();
   else if (state.currentJob?.id === 1) START_FARMING_JOB();
   else if (state.currentJob?.id === 2) START_WEST_SHIPPING_JOB();
   else if (state.currentJob?.id === 3) START_POULTRY_JOB();
   else if (state.currentJob?.id === 4) START_METAL_JOB();
   else START_FISHING_JOB();
}

// ---
function quitJob(isInternal) {
   if (!state.currentJob && !isInternal) return;

   if (state.currentJob?.id === 0) QUIT_OIL_AND_GAS_JOB();
   else if (state.currentJob?.id === 1) QUIT_FARMING_JOB();
   else if (state.currentJob?.id === 2) QUIT_WEST_SHIPPING_JOB();
   else if (state.currentJob?.id === 3) QUIT_POULTRY_JOB();
   else if (state.currentJob?.id === 4) QUIT_METAL_JOB();
   else QUIT_FISHING_JOB();

   if (state.currentJob?.isActive) exports.NewStart_Clothes.pedReset();

   if (!isInternal) {
      const faction = exports.NewStart_Factions.info();

      if (faction) {
         exports.NewStart_HudSystem.updateJob({ type: 'faction', title: 'إجازة مؤقتة' + ' - ' + faction.name });

      } else {
         exports.NewStart_HudSystem.updateJob({});
      }

      emitNet('NewStart:updateUser', { job2: {} });
      state.currentJob = null;
   }
}

// ---
setTick(_=> {
   const pedID = PlayerPedId(); 
   const pedCoords = GetEntityCoords(pedID, true);
   const distance = GetDistanceBetweenCoords(pedCoords[0], pedCoords[1], pedCoords[2], state.location[0], state.location[1], state.location[2], true);

   if (distance < 25) {
      DrawMarker(
         1, state.location[0], state.location[1], state.location[2] - 1, 
         0.0, 0.0, 0.0, 
         0.0, 0, 0.0, 
         1.2, 1.2, 0.25, 
         22, 24, 29, 200, 
         false, false, 2, null, null, false
      );
   }

   const inMarker = distance < 0.7;

   if (
      inMarker && 
      !IsEntityDead(pedID) &&
      !IsPauseMenuActive()
   ) {
      if (IsControlJustPressed(0, 38)) {
         state.isOpen = true;

         TaskAchieveHeading(pedID, 42.5196, 0);
         SetNuiFocus(true, true);
         SendNUIMessage({ 
            type: 'openUI', 
            info: jobsList.sort((a, b) => a.level < b.level ? -1 : a.level > b.level ? 1 : 0).map(i => ({ ...i, fee: state.vipTax ? 0 : i.fee })), 
            isInJob: !!state.currentJob, 
            currentID: state.currentJob?.id,
         });

      } else if (!state.isOpen && !state.runClose) {
         SendNUIMessage({ type: 'entranceOpen' });
      }

      state.runClose = true;

   } else if (state.runClose) {
      closeUI(true);
   }
});

// ---
exports('method', (type, data) => {
   if (type === 'getJob') {
      const job = { ...jobsList.find(obj => obj.id === data) };
      job.name = 'عامل - ' + job.name;

      return job;

   } else if (type === 'outfit') {
      outfitJob();

   } else if (type === 'setVipTax') {
      state.vipTax = data;

   } else if (type === 'setVehID') {
      setVehID(data);

   } else if (type === 'getAllReward') {
      return [...OIL_DATA.locations, ...WEST_DATA.locations, ...FARMING_DATA.locations, ...POULTRY_DATA.locations, ...METAL_DATA.locations, ...FISHING_DATA.locations].filter(i => i.name === 'reward');
   
   } else if (type === 'finalIDs') {
      return [
         { id: FARMING_DATA.finalID, maxKG: FARMING_DATA.maxKG }, { id: POULTRY_DATA.finalID, maxKG: POULTRY_DATA.maxKG }, 
         { id: FISHING_DATA.items, maxKG: FISHING_DATA.maxKG }, { id: OIL_DATA.finalID, maxKG: OIL_DATA.maxKG }
      ];
   }
});

// ---
exports('currentJob', (simple = false) => {
   if (simple) {
      return state.currentJob;

   } else {
      const find = jobsList.find(obj => obj.id === state.currentJob?.id);
      const vehID = getVehIDs().find(id => id);
      const data = state.currentJob ? { ...state.currentJob, vehID, ...find, objectID: state.objectID } : {};
   
      return data;
   }
});

exports('closeUI', isKick => { 
   if (isKick) quitJob();
   else closeUI(true);
});

exports('isOpen', _=> { 
   return [state.isOpen, OIL_DATA.isOpen, WEST_DATA.isOpen, FARMING_DATA.isOpen, POULTRY_DATA.isOpen, METAL_DATA.isOpen, FISHING_DATA.isOpen].includes(true);
});