/* ``````````` ## Development By el8rbawY ## ```````````*/
let handcuffed = false, tickID = null, timeoutID = null, objID = null;

// ---
RequestAnimDict('mp_arresting');
RequestModel(GetHashKey('p_cs_cuffs_02_s'));
RequestAnimDict('mp_arrest_paired')

// ---
onNet('NewStart_Inspection:handcuff-client', (isRemove, targetID) => {
   if (exports.NewStart_Police.method('info').isJailed) return;
   const pedID = PlayerPedId();

   if (handcuffed || isRemove) { // stop
      stopHandcuff();

   } else { // start
      exports.NewStart_Tools.method('crouchReset');
      exports.NewStart_DeathCounter.closeAll(true);
      handcuffed = true;

      ClearPedTasks(pedID);
      AttachEntityToEntity(pedID, GetPlayerPed(GetPlayerFromServerId(targetID)), 11816, -0.1, 0.45, 0.0, 0.0, 0.0, 20.0, false, false, false, false, 20, false);
      TaskPlayAnim(pedID, 'mp_arrest_paired', 'crook_p2_back_left', 2.0, 2.0, 3500, 33, 0, false, false, false);

      disableKeybinds(pedID);
      SetNuiFocus(true, false);
      SetCurrentPedWeapon(pedID, GetHashKey('WEAPON_UNARMED'), true);
      SetEnableHandcuffs(pedID, true);
      exports.NewStart_Radio.method('kick');

      timeoutID = setTimeout(() => {      
         const coords = GetEntityCoords(pedID, false);
         objID = CreateObject(GetHashKey("p_cs_cuffs_02_s"), coords[0], coords[1], coords[2], true, false, false);
         AttachEntityToEntity(objID, pedID, GetPedBoneIndex(pedID, 60309), -0.055, 0.06, 0.04, 265.0, 155.0, 80.0, true, false, false, false, 0, true);
         DetachEntity(pedID, true, false);
      }, 3600);
   }
});

// ---
exports('handcuff', (type) => {
   if (!['facilities', 'police'].includes(exports.NewStart_Factions.info()?.key)) return;
   const pedID = PlayerPedId();
   
   if (IsPedInAnyVehicle(pedID, false)) {
      exports.NewStart_Notifications.showAttention('error', 'قم بالخروج من المركبة أولاً لتنفيذ هذا الأمر!');

   } else if (type === 'toggle') { /********* toggle **********/
      policeToggleHandcuff(pedID);

   } else if (type === 'follow') { /********* follow **********/
      const target = exports.NewStart_Initialize.method('getClosestPlayer', { maxDistance: 2, noFactions: true, noDead: true, noVehicle: true, isCuffs: true });

      if (target) {
         emitNet('NewStart_Police:handleOther-server', 'follow', target.serverID);

      } else {
         exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي شخص مكلبش قريب منك كفاية!');
      }

   } else if (type === 'vehicle') { /********* vehicle **********/
      const target = exports.NewStart_Initialize.method('getClosestPlayer', { maxDistance: 3.5, noFactions: true, noDead: true, isCuffs: true });

      if (target) {
         let seatFree = false;
         const vehID = exports.NewStart_VehicleSystem.method('getClosestVeh') || GetVehiclePedIsIn(target.pedID, false);

         if (!vehID) return exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي مركبة قريبة منك كفاية أو يجب أن تكون خارج المركبة!');
         else if (GetVehicleDoorLockStatus(vehID) === 4) return exports.NewStart_Notifications.showAttention('error', 'المركبة مغلقة يجب عليك فتحها أولا!');

         for (let i = (GetVehicleModelNumberOfSeats(GetEntityModel(vehID))-2); i >= 0 ; i--) {
            if (IsVehicleSeatFree(vehID, i)) { seatFree = true; break; }
         }

         if (seatFree) emitNet('NewStart_Police:handleOther-server', 'setSeat', { id: target.serverID });
         else exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي مقعد فارغ في المركبة للإدخال!');
         
      } else {
         exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي شخص مكلبش قريب منك كفاية!');
      }
   }
});

// ---
function stopHandcuff() {
   const pedID = PlayerPedId();

   ClearPedTasks(pedID);
   clearTick(tickID);
   clearTimeout(timeoutID);
   SetEnableHandcuffs(pedID, false);
   DeleteEntity(objID);
   SetNuiFocus(false, false);
   DetachEntity(pedID, true, true);

   handcuffed = false;
}

// ---
function disableKeybinds(pedID) {
   tickID = setTick(_=> {
      DisableControlAction(pedID, 16, true);
      DisableControlAction(pedID, 17, true);
      DisableControlAction(pedID, 24, true);
      DisableControlAction(pedID, 19, true);

      if (objID && !IsEntityPlayingAnim(pedID, 'mp_arresting', 'idle', 1)) {
         TaskPlayAnim(pedID, 'mp_arresting', 'idle', 8, -8, -1, 17, 0, false, false, false);
      }
   });
}

// -- 
function policeToggleHandcuff(pedID) {
   if (!pedID) pedID = PlayerPedId();
   const target = exports.NewStart_Initialize.method('getClosestPlayer', { maxDistance: 2, noFactions: true, noDead: true });
   
   if (target && !IsPedInAnyVehicle(target.pedID, false) && HasEntityClearLosToEntity(pedID, target.pedID, 17) && IsEntityVisible(target.pedID)) {
      emitNet('NewStart_Inspection:handcuff-server', target.serverID);

      if (!IsEntityPlayingAnim(target.pedID, 'mp_arresting', 'idle', 1)) {
         TaskPlayAnim(pedID, 'mp_arrest_paired', 'cop_p2_back_left', 2.0, 2.0, 3500, 33, 0, false, false, false);

      } else {
         ClearPedTasks(pedID);
      }
      
   } else {
      exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي مواطن قريب منك كفاية!');
   }
}