/* ``````````` ## Development By el8rbawY ## ```````````*/
const jobsList = [
   { id: 0, key: "oilAndGas", name: 'الاتحاد الوطني للنفط', fee: 4500, level: 60, maxKG: 40 },
   { id: 1, key: "farming", name: 'شركة المزارع الوطنية', fee: 500, level: 1, maxKG: 40 },
   { id: 2, key: "westShipping", name: 'شركة ويست للشحن الجوي', fee: 15000, level: 80, maxKG: 40 },
   { id: 3, key: "poultry", name: 'شركة الدواجن الوطنية', fee: 1000, level: 10, maxKG: 40 },
   { id: 4, key: "metal", name: 'الشركة الفيدرالية للمعادن', fee: 10000, level: 45, maxKG: 40 },
   { id: 5, key: "fishing", name: 'الشركة الوطنية للثروة السمكية', fee: 3000, level: 20, maxKG: 40 }
];

// ---
RegisterNuiCallbackType('NUI:update');

on('__cfx_nui:NUI:update', (data, cb) => {
   switch (data.type) {
      case 'accept':
         const find = jobsList.find(obj => obj.id === data.id);
         const faction = exports.NewStart_Factions.info();

         if (exports.NewStart_Bank.method('violations') >= 10) {
            exports.NewStart_Notifications.showAttention('error', 'يجب عليك سداد جميع المخالفات التي عليك أولا!');
            return cb('OK!');

         } else if (faction && !faction.isVacation) {
            exports.NewStart_Notifications.showAttention('error', 'يجب أن تحصل علي إجازة أولاً من وظيفتك الحالية!');
            closeUI(true); cb('OK!'); return;

         } else if (exports.NewStart_Mechanical.method('info', 'isActive')) {
            exports.NewStart_Notifications.showAttention('error', 'يجب الاستقالة من وظيفتك الحالية أولا!');
            closeUI(true); cb('OK!'); return;

         } else if (exports.NewStart_MainMenu.getLevel() < find.level) {
            exports.NewStart_Notifications.showAttention('error', 'لم تصل بعد للمستوي المطلوب للدخول للوظيفة!');
            return cb('OK!');
         }
         
         if (!state.vipTax) {
            const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
            const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
            const info = { name: 'رسوم توظيف', price: find.fee };

            if (cash >= info.price) {
               StatSetInt('MP0_WALLET_BALANCE', cash - info.price);
               exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }))
               info.from = 'cash';
         
            } else if (bank >= info.price) {
               StatSetInt('BANK_BALANCE', bank - info.price);
               info.from = 'bank';
         
            } else { // Failed
               exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك أي أموال كافية!');
               closeUI(true); cb('OK!'); return;
            }

            emitNet('NewStart:moneyDecrease', info);
         }

         if (state.currentJob) quitJob(true);
         state.currentJob = { type: 'general', id: find.id, isActive: false };
         
         emitNet('NewStart:updateUser', { job2: state.currentJob });
         exports.NewStart_HudSystem.updateJob({ type: 'general', title: 'عامل - ' + find.name });
         exports.NewStart_Notifications.showAttention('success', 'لقد تم توظيفك افتح الخريطة وابدأ العمل.');
         
         startJob(); closeUI(true);
         break;
      
      case 'outfit': /****************** Outfit *******************/
         if (!state.currentJob?.isActive) {
            closeUI(true, true);
            exports.NewStart_Taboos.method('divingSuit', { isEnd: true });
            
            TaskPlayAnim(PlayerPedId(), 'missmic4', 'michael_tux_fidget', 8.0, -8.0, -1, 51, 0, false, false, false);
            exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '5s', status: true });

            setTimeout(() => {
               exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
               ClearPedTasks(PlayerPedId());
               if (getIsRunClose()) SendNUIMessage({ type: 'entranceOpen' });

               state.currentJob.isActive = true;
               outfitJob();
               emitNet('NewStart:updateUser', { 'job2.isActive': true });
            }, 5000);
         }

         exports.NewStart_Notifications.showAttention('success', 'يمكنك بدء العمل الآن شاهد الخريطة!');
         break;
      
      case 'vehicle': /****************** Vehicle *******************/
         if (!state.currentJob.isActive) {
            exports.NewStart_Notifications.showAttention('error', 'يجب ارتداء ملابس العمل أولاً!');
            return cb('Failed!');
         }

         let hash = null, vehID = getVehIDs(true).find(id => id), vehClass = GetVehicleClass(vehID);
         console.log(vehID);
         if (vehID) emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: NetworkGetNetworkIdFromEntity(vehID) }));

         if (state.currentJob.id === 0) { //
            return cb('OK!');
            // hash = 'mtanker2';
            // vehicleBuild(hash, 27, OIL_DATA.spawnVeh);

         } else if (state.currentJob.id === 1) {
            hash = -1207771834;
            vehicleBuild(hash, 27, FARMING_DATA.spawnVeh);

         } else if (state.currentJob.id === 2)  {
            hash = -1743316013;
            vehicleBuild(hash, 2, WEST_DATA.spawnVeh.carWithOutfit);

         } else if (state.currentJob.id === 3) {
            hash = -1207771834;
            vehicleBuild(hash, 2, POULTRY_DATA.spawnVeh);

         } else if (state.currentJob.id === 4) { // 
            return cb('OK!');
            // hash = -1207771834;
            // vehicleBuild(hash, 90, METAL_DATA.spawnVeh);

         } else {
            const isBoat = vehClass === 14;

            hash = isBoat ? -1743316013 : 4012021193;
            vehicleBuild(hash, 2, isBoat ? FISHING_DATA.spawnVeh.car : FISHING_DATA.spawnVeh.boat);
         }

         const findJob = jobsList.find(obj => obj.id === state.currentJob.id);
         emitNet('NewStart_VehicleSystem:handleGlobal-server', 'newJob', JSON.stringify({ type: 'general', jobID: findJob.id, maxKG: findJob.maxKG, hash }));
         break;

      case 'relaxation': /****************** Relaxation *******************/
         if (state.currentJob?.isActive) {
            closeUI(true, true);
            exports.NewStart_Taboos.method('divingSuit', { isEnd: true });
            TaskPlayAnim(PlayerPedId(), 'missmic4', 'michael_tux_fidget', 8.0, -8.0, -1, 51, 0, false, false, false);
            exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '5s', status: true });

            setTimeout(() => {
               exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
               ClearPedTasks(PlayerPedId());
               if (getIsRunClose()) SendNUIMessage({ type: 'entranceOpen' });

               exports.NewStart_Clothes.pedReset();
               state.currentJob.isActive = false;
   
               emitNet('NewStart:updateUser', { 'job2.isActive': false });
               const vehID = getVehIDs(true).find(id => id)
               if (vehID) emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: NetworkGetNetworkIdFromEntity(vehID) }));
               removeSubBlips(); 
            }, 5000);

         } else {
            closeUI(true);
         }

         break;

      case 'resignation': quitJob(); closeUI(); break;
      default: closeUI();
   }

   cb('OK!'); 
});

// ---
function createBlip (id, name, location, color) {
   const blip = AddBlipForCoord(location[0], location[1], location[2]);
   
   SetBlipSprite(blip, id);
   SetBlipAsShortRange(blip, true);
   BeginTextCommandSetBlipName("STRING");
   AddTextComponentString(`<font face="A9eelsh">${name}</font>`);
   EndTextCommandSetBlipName(blip);

   if (color) SetBlipColour(blip, color);
   return blip;
}

// ---
function getVehIDs(isDelete) {
   const data = [OIL_DATA.vehID, WEST_DATA.vehID, FARMING_DATA.vehID, POULTRY_DATA.vehID, METAL_DATA.vehID, FISHING_DATA.vehID];

   if (isDelete) {
      OIL_DATA.vehID = null;
      WEST_DATA.vehID = null;
      FARMING_DATA.vehID = null;
      POULTRY_DATA.vehID = null;
      METAL_DATA.vehID = null;
      FISHING_DATA.vehID = null;
   }

   return data.map(id => id ? NetworkDoesNetworkIdExist(id) ? NetworkGetEntityFromNetworkId(id) : null : id);
}

// ---
function setVehID(id) {
   if (state.currentJob) {
      if (state.currentJob.id === 0) OIL_DATA.vehID = id;
      else if (state.currentJob.id === 1) FARMING_DATA.vehID = id;
      else if (state.currentJob.id === 2) WEST_DATA.vehID = id;
      else if (state.currentJob.id === 3) POULTRY_DATA.vehID = id;
      else if (state.currentJob.id === 4) METAL_DATA.vehID = id;
      else if (state.currentJob.id === 5) FISHING_DATA.vehID = id;
   }
}

// ---
function outfitJob() {
   exports.NewStart_Clothes.pedReset(false);
     
   if (state.currentJob.id === 0) OIL_AND_GAS_OUTFIT(true);
   else if (state.currentJob.id === 1) FARMING_OUTFIT(true);
   else if (state.currentJob.id === 2) WEST_SHIPPING_OUTFIT(true);
   else if (state.currentJob.id === 3) POULTRY_OUTFIT(true);
   else if (state.currentJob.id === 4) METAL_OUTFIT(true);
   else FISHING_OUTFIT(true);
}

// ---
function getIsRunClose() {
   return OIL_DATA.runClose || WEST_DATA.runClose || FARMING_DATA.runClose || POULTRY_DATA.runClose || METAL_DATA.runClose || FISHING_DATA.runClose
}

// ---
function closeUI(withNUI) { // and edit in => exports 'isOpen'
   state.runClose = false;
   state.isOpen = false;
   
   OIL_DATA.runClose = false;
   OIL_DATA.isOpen = false;

   WEST_DATA.runClose = false;
   WEST_DATA.isOpen = false;

   FARMING_DATA.isOpen = false;
   FARMING_DATA.runClose = false;

   POULTRY_DATA.runClose = false;
   POULTRY_DATA.isOpen = false;

   METAL_DATA.runClose = false;
   METAL_DATA.isOpen = false;
   
   FISHING_DATA.runClose = false;
   FISHING_DATA.isOpen = false;
   
   ClearPedTasks(PlayerPedId());
   SetNuiFocus(false, false);
   if (withNUI) SendNUIMessage({ type: 'closeUI' });
}