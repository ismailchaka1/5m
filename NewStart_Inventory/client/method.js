/* ``````````` ## Development By el8rbawY ## ```````````*/
let vehTrunkID = null, vehOpenID = null;

// ---
RegisterCommand('+inventory', _=> {
   if (
      IsPauseMenuActive() ||
      state.smoking ||
      exports.NewStart_Inspection.data().handcuffed ||
      exports.NewStart_Jobs.currentJob().objectID ||
      exports.NewStart_Medicine.method('info').stretcher ||
      exports.NewStart_Phone.isOpen() ||
      exports.NewStart_Police.method('info').isJailed ||
      exports.NewStart_PoliceTools.method('info').isPolmav ||
      exports.NewStart_Medicine.limited('get') ||
      exports.NewStart_MainMenu.method('data').isAnimShared
   ) return;

   let vehID = 0;
   const pedID = PlayerPedId();
   const [x, y, z] = GetEntityCoords(pedID);
   const employeeVeh = exports.NewStart_Employee.data().spawnIDs;
   const jobVeh = [exports.NewStart_Jobs.currentJob().vehID, ...employeeVeh.map(i => i.id)];
   const myVehs = exports.NewStart_VehicleSystem.method('GetMyVehicles');
   const vehicles = [...jobVeh, ...myVehs.map(obj => obj.vehID)];

   // if edit distance or bones (vehicles) => go change in NewStart_Inspection
   // get closest vehicle
   for (let id of vehicles.filter(v => v)) {      
      const vehCoords = GetEntityCoords(id);
      const distance = GetDistanceBetweenCoords(x, y, z, vehCoords[0], vehCoords[1], vehCoords[2], true);
      const vehType = GetVehicleClass(id);

      if (distance <= 10) {
         for (let name of exports.NewStart_VehicleSystem.method('bones')) {
            const index = GetEntityBoneIndexByName(id, name);
            const coords = GetWorldPositionOfEntityBone(id, index);
            const distanceBone = GetDistanceBetweenCoords(x, y, z, coords[0], coords[1], coords[2], true);

            if (distanceBone <= 1.6 || ([16, 17, 20].includes(vehType) && distanceBone <= 2.5)) {
               if (!IsPedInAnyVehicle(pedID, true) && GetEntityArchetypeName(id) !== 'taco') vehTrunkID = id;
               vehOpenID = id;
               vehID = id; break; 
            }
         }
      }
   }

   const isDestroyed = GetVehicleEngineHealth(vehID) <= 0;
   let plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', vehID);
   const house = exports.NewStart_RealEstate.method('getCurrent').inventory;
   // let level = exports.NewStart_MainMenu.method('validLevel', 'inventory');
   // level = level.isCan ? 0 : level.need;
   let level = 0;

   state.isOpen = true;
   SetNuiFocus(true, true);

   if (vehID && plate && !isDestroyed) {
      const findKey = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 27 && obj.features?.plate === plate);

      if (findKey) {
         SendNUIMessage(JSON.stringify({ 
            type: 'openExchange', extraKG: state.extraKG,
            info: { type: 'vehicle', id: plate, title: 'حقيبة المركبة' }
         }));

         if (vehTrunkID) SetVehicleDoorOpen(vehID, 5, false, false);
         // and edit in => // jobs limit
         emitNet('NewStart_Inventory:getItemsOther-server', JSON.stringify({ id: plate, type: 'vehicle' }));

      } else {
         SendNUIMessage(JSON.stringify({ type: 'open', extraKG: state.extraKG, level }));
         exports.NewStart_Notifications.showAttention('error', 'لا تملك مفاتيح المركبة لفتح الحقيبة!');
      }

   } else if (jobVeh.includes(vehID) && !isDestroyed) {
      const type = exports.NewStart_Jobs.currentJob().isActive ? 'jobVehicle' : 'faction';
      const hash = GetEntityArchetypeName(vehID);
      const id = type === 'faction' ? hash : exports.NewStart_Jobs.currentJob().id;
      const factionID = exports.NewStart_Factions.info()?.id;
      const otherID = type === 'faction' && factionID ? factionID : hash;

      if (vehTrunkID) SetVehicleDoorOpen(vehID, 5, false, false);

      SendNUIMessage(JSON.stringify({ type: 'openExchange', info: { type, id, otherID, title: 'حقيبة المركبة (الوظيفة)' }, extraKG: state.extraKG }));
      // and edit in => // jobs limit
      emitNet('NewStart_Inventory:getItemsOther-server', JSON.stringify({ type, id, otherID }));
      
   } else if (house.canOpen) {
      state.isOpenExchange = true;
      
      SendNUIMessage(JSON.stringify({ type: 'openExchange', info: { type: 'house', id: house.code, title: house.name }, extraKG: state.extraKG }));
      emitNet('NewStart_Inventory:getItemsOther-server', JSON.stringify({ type: 'house', id: house.code }));

   } else {
      SendNUIMessage(JSON.stringify({ type: 'open', extraKG: state.extraKG, level }));
   }
}, false);

RegisterKeyMapping('+inventory', 'Inventory', 'keyboard', 'i');

// ---
function weaponsLoad(isReload, isInventory) {
   const items = staticData.filter(obj => {
      const ref = currentItems.some(item => item.id === obj.id);
      return ref && obj.type === 'weapon' && obj.continuous && obj.hash;
   }).map(i => {
      const find = currentItems.find(c => c.id === i.id);
      return { _id: find._id, hash: i.hash, unique: !!i.unique, ammo: find.features?.value || 0 };
   });

   // console.log(items);
   const pedID = PlayerPedId();

   if (!isReload) {
      if (state.currentWeapons.length) {
         for (let item of state.currentWeapons.filter(w => !items.some(i => i.hash === w.hash))) {
            SetPedAmmo(pedID, item.hash, 0);
            RemoveWeaponFromPed(pedID, item.hash);
         }
      }
      
      for (let item of items) {
         GiveWeaponToPed(pedID, item.hash, 0, false, false);

         if (item.ammo && !(item.hash === GetSelectedPedWeapon(pedID) && isInventory)) {
            SetPedAmmo(pedID, item.hash, 0);
            AddAmmoToPed(pedID, item.hash, item.ammo);
         }
      }
   }

   state.currentWeapons = items.map(i => ({ hash: i.hash, ammo: i.ammo }));
   const currentHash = GetSelectedPedWeapon(pedID);

   if (currentHash) {
      const find = items.find(i => i.hash === currentHash);

      if (find?.unique) {
         const item = currentItems.find(i => i._id === find._id);
         const ammo = GetAmmoInPedWeapon(pedID, find.hash);

         if (item) {
            item.features = { value: ammo };
            emitNet('NewStart_Inventory:handleGeneral-server', 'editItem', { _id: find._id, value: { value: ammo }});
            SendNUIMessage(JSON.stringify({ type: 'setData', action: 'main', items: currentItems }));
         }
      }
   }
}

// ---
function weaponAmmo(pedID, ammoID, effect) {
   const hash = GetSelectedPedWeapon(pedID);
   const group = GetWeapontypeGroup(hash);
   const notAllow = [2685387236, 1548507267, 4257178988, -1609580060, -728555052].includes(group);

   if (hash && !notAllow && hash !== 911657153) {
      const weapons = [
         { type: 'light', group: 416676503, ammo: 58 }, // Handgun
         { type: 'light', group: -957766203, ammo: 100 }, // Submachine
         { type: 'light', group: 860033945, ammo: 32 }, // Shotgun
         { type: 'heavy', group: 970310034, ammo: 50 }, // Assault Rifle
      ];

      if (
         (weapons.some(i => i.type === 'light' && i.group === group) && ammoID === 26) ||
         (weapons.some(i => i.type === 'heavy' && i.group === group) && ammoID === 25)
      ) {
         const ammo = weapons.find(i => i.group === group).ammo;

         if (GetAmmoInPedWeapon(pedID, hash) < ammo) {
            exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '5s', status: true });
            TaskPlayAnim(pedID, 'amb@prop_human_parking_meter@female@base', 'base_female', 1.0, -1.0, 5000, 1, 0, false, false, false);
   
            setTimeout(_=> {   
               exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
               SetPedAmmo(pedID, hash, 0);
               AddAmmoToPed(pedID, hash, hash === 1198879012 ? 5 : ammo); // edit with flare
            }, 5000);

         } else {
            restoreItem(ammoID, 'لا يمكنك التعبئة أكثر من العدد الحالي!');
            return false;
         }

      } else {
         restoreItem(ammoID, 'نوع الرصاص غير مناسب لهذا السلاح!');
         return false;
      }
      
   } else {
      restoreItem(ammoID, 'ضع السلاح المناسب لنوع الرصاص في يدك أولاً للتعبئة!');
      return false;
   }

   return true;
}

// ---
function handleHealth(pedID) {
   exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '1.2s', status: true });
   TaskPlayAnim(pedID, 'nmt_3_rcm-10', 'cs_nigel_dual-10', 3.0, 3.0, 1200, 1, 0, false, false, false);

   setTimeout(_=> {
      exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
      SetEntityHealth(pedID, 200);
      ClearPedBloodDamage(pedID);
      exports.NewStart_HudSystem.update({ health: 200 });
   }, 1200);   
}

// ---
function handleArmour(pedID, effect) {
   exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '5s', status: true });
   TaskPlayAnim(pedID, 'clothingtie', 'try_tie_negative_a', 1.0, -1.0, 5000, 1, 0, false, false, false);

   setTimeout(_=> {
      exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
      SetPedArmour(pedID, effect);
      exports.NewStart_HudSystem.update({ armour: effect });
   }, 5000);
}