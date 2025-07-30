/* ``````````` ## Development By el8rbawY ## ```````````*/
const stateRent = { vehID: 0, blipID: 0, tickID: 0 };

// ---
RegisterNuiCallbackType('NUI:rentVehicle');

on('__cfx_nui:NUI:rentVehicle', (data, cb) => {
   if (exports.NewStart_Robbery.method('isRobbery')) {
      exports.NewStart_Notifications.showAttention('error', 'لا يمكنك طلب أي مركبة في الوقت الحالي!');
      return cb('OK!'); 
   }

   const find = exports.NewStart_TheStart.method('getRentItems').find(obj => obj.id === data.id);
   const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);

   if (bank < find.price) {
      exports.NewStart_Notifications.showAttention('error', 'لا يوجد أموال كافية في حسابك البنكي!');
      return cb('OK!');
   }

   // create
   const pedID = PlayerPedId();
   const [x, y, z] = GetEntityCoords(pedID);
   const [, closest, heading] = GetNthClosestVehicleNodeWithHeading(x, y, z, 100, 0, 0, 0);
   const [, side] = GetRoadBoundaryUsingHeading(closest[0], closest[1], closest[2], heading);  

   exports.NewStart_TheStart.method('deleteVeh');
   deleteRent();

   stateRent.vehID = CreateVehicle(find.hash, side[0], side[1], side[2], heading, true, true);

   if (!stateRent.vehID) {
      return exports.NewStart_Notifications.showAttention('error', 'طلبات الاستئجار مرتفعة الآن يرجي المحاولة في وقت لاحق!');

   } else {
      StatSetInt('BANK_BALANCE', bank - find.price);
      emitNet('NewStart:moneyDecrease', { name: 'استئجار المركبات', from: 'bank', price: find.price });
      exports.NewStart_Notifications.showAttention('success', 'تم إيصال الدراجة وهي قريبة منك الآن يمكنك مشاهدة الخريطة!');
   }

   SetVehicleNumberPlateText(stateRent.vehID, exports.NewStart_Initialize.method('getPlayer', GetPlayerServerId(PlayerId())).customID);
   SetVehicleDoorsLocked(stateRent.vehID, 4);
   SetEntityCoords(stateRent.vehID, side[0], side[1], side[2], false, false, false, true);
   SetEntityHeading(stateRent.vehID, heading);

   stateRent.blipID = AddBlipForCoord(side[0], side[1], side[2]);
   SetBlipSprite(stateRent.blipID, 811);
   BeginTextCommandSetBlipName("STRING");
   AddTextComponentString(find.name);
   EndTextCommandSetBlipName(stateRent.blipID);
   SetBlipColour(stateRent.blipID, 3);

   stateRent.vehID = VehToNet(stateRent.vehID);
   
   stateRent.tickID = setTick(_=> {
      if (GetVehiclePedIsIn(pedID, false) === NetToVeh(stateRent.vehID)) {
         clearTick(stateRent.tickID);
         RemoveBlip(stateRent.blipID);
      }
   });
   cb('OK!');
});

// ---
function deleteRent(isPart = false) {
   if (stateRent.vehID && !isPart) {
      clearTick(stateRent.tickID);
      emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: stateRent.vehID }));
      RemoveBlip(stateRent.blipID);
      stateRent.vehID = null;
   }
}

// ---
exports('deleteRent', deleteRent);