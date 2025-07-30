/* ``````````` ## Development By el8rbawY ## ```````````*/
function handleRemove(data) {
   const pedID = PlayerPedId();
   const vehID = GetVehiclePedIsIn(pedID, false);

   if (data.count >= 1 && !IsEntityInAir(pedID) && !IsEntityInAir(vehID) && !exports.NewStart_RealEstate.method('getCurrent', 'insideCode')) {
      emitNet('NewStart_Tools:handleGeneral-server', 'dropItem', JSON.stringify(data));
   }
}

// ---
setTick(() => {
   if (vehOpenID) {
      const coords = GetEntityCoords(PlayerPedId());
      const vehCoords = GetEntityCoords(vehOpenID, true);
      const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], vehCoords[0], vehCoords[1], vehCoords[2], true);

      if (distance > 10) {
         exports.NewStart_Inventory.closeUI();
      }
   }
});