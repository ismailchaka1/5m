/* ``````````` ## Development By el8rbawY ## ```````````*/
function rentVehicle(id) {
   const find = state.items.find(obj => obj.id === id);
   const info = { name: 'استئجار المركبات', price: find.price };
   const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
   const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);

   if (cash >= info.price) {
      StatSetInt('MP0_WALLET_BALANCE', cash - info.price);
      exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }))
      info.from = 'cash';

   } else if (bank >= info.price) {
      StatSetInt('BANK_BALANCE', bank - info.price);
      info.from = 'bank';

   } else {
      return exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي!');
   }
   
   emitNet('NewStart:moneyDecrease', info);
   exports.NewStart_Notifications.showAttention('success', 'لقد قمت للتو بدفع المال لاستئجار مركبة');
   exports.NewStart_Phone.deleteRent();

   if (state.vehID) {
      DeleteVehicle(state.vehID);
      state.vehID = null;
   }

   // Vehicle spwan 
   const pedID = PlayerPedId();
   const [x, y, z, h] = [123.2439, 6608.8613, 31.3861, 277.7952];
   state.vehID = CreateVehicle(find.hash, x, y, z, h, true, true);
   SetVehicleNumberPlateText(state.vehID, exports.NewStart_Initialize.method('getPlayer', GetPlayerServerId(PlayerId())).customID);

   // SetVehicleMaxSpeed(state.vehID, find.speed / 3.6);
   SetEntityCoords(state.vehID, x, y, z, false, false, false, true);
   SetEntityHeading(state.vehID, h);
   SetPedIntoVehicle(pedID, state.vehID, -1);
   SetVehicleColours(state.vehID, 70, 70);
   state.vehID = VehToNet(state.vehID);
}