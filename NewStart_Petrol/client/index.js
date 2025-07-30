/* ``````````` ## Development By el8rbawY ## ```````````*/
const options = {
   isOpen: false, 
   intervalID: null, 
   runClose: false,
   fillID: null
}
const items = [
   { id: 1, price: 100, value: 25 },
   { id: 2, price: 150, value: 50 },
   { id: 3, price: 200, value: 75 },
   { id: 4, price: 250, value: 100 }
];

// ---
on('onClientGameTypeStart', _=> {
   const data = coordinates.filter(obj => obj.gps).map(obj => obj.gps);
   
   for (let coord of data) {
      const blip = AddBlipForCoord(coord.x, coord.y, coord.z);

      SetBlipSprite(blip, 361);
      SetBlipAsShortRange(blip, true);
      BeginTextCommandSetBlipName("STRING");
      AddTextComponentString('<font face="A9eelsh">ﺩﻮﻗﻮﻟﺍ ﺔﻄﺤﻣ</font>');
      EndTextCommandSetBlipName(blip);
   }
});

// ---
setTick(_=> {
   const pedID  = GetPlayerPed(-1); 
   const player = GetEntityCoords(pedID, true);
   const vehID = GetVehiclePedIsIn(pedID, false);
   const engineRunning = GetIsVehicleEngineRunning(vehID);
   let isCurrent = false;

   for (let obj of coordinates) {
      for (let coord of obj.markers) {
         const distance = GetDistanceBetweenCoords(player[0], player[1], player[2], coord.x, coord.y, coord.z, true);
      
         if (distance < 50 && vehID && !options.isOpen) {
            DrawMarker(1, coord.x, coord.y, coord.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1, 1, 0.25, 22, 24, 29, 235, false, false, 2, null, null, false);
         }

         if (distance < 4) { isCurrent = true; }
      }
   }
   
   if (
      isCurrent && vehID &&
      !IsEntityDead(pedID) &&
      !IsPauseMenuActive()
   ) {
      if (IsControlJustPressed(0, 246)) {
         if (!engineRunning) {
            SetNuiFocus(true, true);
            SendNUIMessage({ type: 'openUI', info: items });
            options.isOpen = true;

         } else {
            exports.NewStart_Notifications.showAttention('error', 'من فضلك قم بإطفاء محرك المركبة أولاً!');
         }

      } else if (!options.isOpen && !options.runClose) {
         SendNUIMessage({ type: 'entranceOpen' });
      }

      options.runClose = true;

   } else if (options.runClose) {
      closeUI(true);
   }

   // Gasoline
   if (engineRunning && !options.intervalID) {
      options.intervalID = setInterval(_=> {
         const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', vehID);
         let fuelLevel = GetVehicleFuelLevel(vehID) - 5;
         fuelLevel = fuelLevel < 0 ? 0 : fuelLevel;

         SetVehicleFuelLevel(vehID, fuelLevel);

         if (plate) {
            emitNet('NewStart_Petrol:saveDate-server', JSON.stringify({ fuel: fuelLevel, isUnique: true, plate }));
         }
      }, 120000); // 2 min

   } else if (!engineRunning && options.intervalID) {
      clearInterval(options.intervalID);
      options.intervalID = null;
   }
});

// ---
RegisterNuiCallbackType('NUI:update');

on('__cfx_nui:NUI:update', (data, cb) => {
   if (data.type === 'payment') {
      const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
      const find = items.find(obj => obj.id === data.id);
      const info = { name: 'محطة الوقود', price: find.price };

      if (cash >= info.price) {
         StatSetInt('MP0_WALLET_BALANCE', cash - info.price);
         exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
         info.from = 'cash';

      } else {
         exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي في الحقيبة!');
         cb('OK!'); return;
      }

      const vehID = GetVehiclePedIsIn(GetPlayerPed(-1), false);
      const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', vehID);

      exports.NewStart_Tools.sendToNUI({ type: 'progress', level: 'low', status: true });
      emitNet('NewStart:moneyDecrease', info);
      
      options.fillID = setTimeout(() => {
         exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });

         let fuelLevel = GetVehicleFuelLevel(vehID) + find.value;
         fuelLevel = fuelLevel > 100 ? 100.0 : fuelLevel;
         
         if (plate) emitNet('NewStart_Petrol:saveDate-server', JSON.stringify({ fuel: fuelLevel, plate }));

         emitNet('NewStart_VehicleSystem:handleGlobal-server', 'syncFuel', JSON.stringify({ id: VehToNet(vehID), level: fuelLevel }));
         exports.NewStart_Notifications.showAttention('success', 'تم تعبئة البنزين للمركبة قم بتشغيل المحرك الآن.');
         if (options.isOpen) SendNUIMessage({ type: 'entranceOpen' });
         options.isOpen = false;
         options.fillID = null;
         SetNuiFocus(false, false);
      }, 10000);

      SendNUIMessage({ type: 'close' });
      closeUI(false, false);

   } else { // closeUI
      if (!options.fillID) closeUI(false);
   }
   
   cb('OK!'); 
});

// ---
exports('closeUI', _=> { closeUI(true); });