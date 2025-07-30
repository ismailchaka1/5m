/* ``````````` ## Development By el8rbawY ## ```````````*/
const state = {
   coords: [116.4527, 6608.3735, 31.9],
   // coords: [-1037.6702, -2737.5693, 20.1640],
   photo: { handle: 0 },
   items: [
      { id: 1, name: 'Shitzu PCJ', speed: 85, price: 5000, hash: -909201658, image: 'images/motor.png' },
      { id: 2, name: 'Faggio Sport', speed: 70, price: 500, hash: -1842748181, image: 'images/faggio.png' },
      { id: 3, name: 'Endurex Bike', speed: 50, price: 250, hash: 3894672200, image: 'images/bike.png' }
   ]
};

// ---
on('onClientGameTypeStart', _=> {
   for (let obj of state.items) RequestModel(obj.hash);
   const blip = AddBlipForCoord(state.coords[0], state.coords[1], state.coords[2]);

   SetBlipSprite(blip, 164);
   BeginTextCommandSetBlipName("STRING");
   AddTextComponentString('<font face="A9eelsh">ﺔﻳﺍﺪﺒﻟﺍ ﺔﻄﻘﻧ</font>');
   EndTextCommandSetBlipName(blip);
   SetBlipAsShortRange(blip, true);
   SetBlipScale(blip, 1.4);
});

// ---
setTick(_=> {
   const pedID = PlayerPedId(); 
   const current = GetEntityCoords(pedID, true);
   const [x, y, z] = state.coords;
   const distance = GetDistanceBetweenCoords(current[0], current[1], current[2], x, y, z, true);

   if (distance < 50 && !state.isOpen) {
      DrawMarker(38, x, y, z, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.2, 1.2, 1, 45, 101, 167, 100, false, true, 2, null, null, false);
      DrawMarker(27, x, y, z - 0.98, 0, 0, 0, 0, 0, 0, 1.5, 1.5, 0, 45, 101, 167, 100, false, false, 2, null, null, false);
   }

   if (
      distance < 0.8 &&
      !IsEntityDead(pedID) && 
      !IsPauseMenuActive() &&
      !IsPedInAnyVehicle(pedID)
   ) {
      if (IsControlJustPressed(0, 38)) {
         state.isOpen = true;

         SetNuiFocus(true, true);
         SendNUIMessage(JSON.stringify({ type: 'openUI', items: state.items }));

      } else if (!state.isOpen && !state.runClose) {
         SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
      }

      state.runClose = true;

   } else if (state.runClose) {
      closeUI(true);
   }
});

// ---
function closeUI(withNUI) {
   if (withNUI) SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
   SetNuiFocus(false, false);
   state.isOpen = false;
   state.runClose = false;
}

// ---
RegisterNuiCallbackType('NUI:update');

on('__cfx_nui:NUI:update', (data, cb) => {
   if (data.type === 'rentVehicle') {
      rentVehicle(data.id);

   } else if (data.type === 'resultPhoto') {
      emitNet('NewStart_Licenses:handleGeneral-server', 'upload', JSON.stringify({ image: data.result }));
      UnregisterPedheadshot(state.photo.handle);

   } else {
      // if (!state.runClose && data.theStart) {
      //    const find = exports.NewStart_VehicleDealership.getData('vehicles').find(obj => obj.hash === 'contender');
      //    exports.NewStart_Notifications.showAttention('info', 'مبروك، لقد حصلت على مكافآة دخول الافتتاح!');

      //    emitNet('NewStart_VehicleDealership:payment-server', JSON.stringify({
      //       vehicle: { type: find.type, name: `${find.name} ${find.release}`, hash: find.hash },
      //    }));

      //    exports.NewStart_Bank.method('giveCash', { name: 'مكافأة الافتتاح', amount: 10000 });
      // }

      closeUI();
   }
   cb('OK!');
});

// ---
exports('method', (type, data) => {
   if (type === 'showMessage') {
      SetNuiFocus(true, true);
      SendNUIMessage(JSON.stringify({ type: 'showTheStart', playerName: data }));
      state.isOpen = true;
      takePhoto();

   } else if (type === 'getRentItems') {
      return state.items;

   } else if (type === 'rentVehicle') {
      rentVehicle(data);

   } else if (type === 'deleteVeh') {
      if (state.vehID) {
         emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: state.vehID }));
         state.vehID = null;
      }

   } else if (type === 'vehRent') {
      return NetworkDoesNetworkIdExist(state.vehID) ? NetToVeh(state.vehID) : 0;

   } else {
      closeUI(true);
   }
});