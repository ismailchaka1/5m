/* ``````````` ## Development By el8rbawY ## ```````````*/
exports('openUI', type => {   
   const isAllow = ['facilities', 'police'].includes(exports.NewStart_Factions.info()?.key) && exports.NewStart_Employee.data().isActive;
   const pedID = PlayerPedId();
   let data = {};
   
   if (!isAllow) return; 
   
   if (IsPedInAnyVehicle(pedID, false)) {
      return exports.NewStart_Notifications.showAttention('error', 'يجب عليك ترك المركبة أولاً لبدء التفتيش!');
   }

   const coords = GetEntityCoords(pedID, true);

   if (type === 'player') {
      const myID = PlayerId();

      for (let id of GetActivePlayers()) {
         const targetPed = GetPlayerPed(id);
         const [x, y, z] = GetEntityCoords(targetPed, true);
         const distance = GetDistanceBetweenCoords(x, y, z, coords[0], coords[1], coords[2], true);

         if (distance < 2 && !IsPedInAnyVehicle(targetPed, false) && id !== myID) {
            data.id = GetPlayerServerId(id);
            state.info = { type, distanceID: id, serverID: data.id };
            break;
         }
      }
      
   } else if (type === 'house') {
      const code = exports.NewStart_RealEstate.method('getCurrent', 'insideCode');

      if (code && !exports.NewStart_RealEstate.method('getProperties').some(r => r.code === code)) { 
         data.code = code; 
         state.info = { type, code }; 
      }

   } else { // vehicle
      const vehID = exports.NewStart_VehicleSystem.method('getClosestVeh');
      const vehicles = [
         ...exports.NewStart_Employee.data().spawnIDs.map(i => i.id), 
         ...exports.NewStart_VehicleSystem.method('GetMyVehicles').map(obj => obj.vehID)
      ];
      let canStart = false;

      // if edit distance or bones => go change in NewStart_Inventory
      if (vehID && !vehicles.includes(vehID)) {
         const type = GetVehicleClass(vehID);

         for (let name of exports.NewStart_VehicleSystem.method('bones')) {
            const index = GetEntityBoneIndexByName(vehID, name);
            const boneCoords = GetWorldPositionOfEntityBone(vehID, index);
            const distanceBone = GetDistanceBetweenCoords(boneCoords[0], boneCoords[1], boneCoords[2], coords[0], coords[1], coords[2], true);

            if (distanceBone <= 1.6 || ([16, 17, 20].includes(type) && distanceBone <= 2.5)) {
               canStart = true; break; 
            }
         }
      }

      if (canStart && GetVehicleEngineHealth(vehID) > 0) {
         if (GetVehicleDoorLockStatus(vehID) !== 4) {
            const private = exports.NewStart_VehicleSystem.method('vehiclePrivate', vehID);
            const clientID = NetworkGetEntityOwner(vehID);
            
            data.id = GetPlayerServerId(clientID);
            data.netID = NetworkGetNetworkIdFromEntity(vehID);
            state.info = { type, distanceID: vehID, serverID: data.id, clientID };
      
            if (private) {
               data.plate = private;

            } else {
               data.hash = GetEntityModel(vehID);
               data.hashOther = GetEntityArchetypeName(vehID);
            }

         } else {
            exports.NewStart_Notifications.showAttention('error', 'المركبة مغلقة لا يمكن تفتيشها!');
            return;
         }
      }
   }

   if (Object.keys(data).length) {
      data.type = type;
      emitNet('NewStart_Inspection:initial-server', data);

      if (type === 'vehicle') {
         SetVehicleDoorOpen(state.info.distanceID, 5, false, false);
      }

      SendNuiMessage(JSON.stringify({ type: 'openUI' }));
      SetNuiFocus(true, true);
      state.isOpen = true;

   } else {
      const content = { 
         player: 'لا يوجد أي مواطن قريب منك أو الشخص المستهدف داخل مركبة.', 
         vehicle: 'لا يوجد مركبة شخص آخر قريبة منك!',
         house: 'يجب أن تكون داخل عقار مملوك لشخص آخر لتفتيشه.'
      };

      exports.NewStart_Notifications.showAttention('error', content[type]);
   }
});