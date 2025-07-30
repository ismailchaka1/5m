/* ``````````` ## Development By el8rbawY ## ```````````*/
on('playerJoining', id => {  
   emitNet(
      'NewStart_VehicleDealership:handleGeneral-client', id, 'initial', 
      JSON.stringify({ vehicles: dealership.vehicles })
   );
});

// ---
onNet('NewStart_VehicleDealership:payment-server', async data => {
   data = JSON.parse(data);
   const currentID = source || data.playerID;
   const license = data.license || licenseEncrypt(currentID);

   if (data.license) { // from website store
      const find = dealership.vehicles.find(i => i.hash === data.vehicle.hash);
      data.vehicle.type = find.type;
      data.vehicle.name = `${find.name} ${find.release}`;
   } 

   const vehicle = (await axios.post(`${URL}/vehicles?skipLength=${!!data.license}`, { license, ...data.vehicle })).data;
   if (currentID) emitNet('NewStart_VehicleDealership:payment-client', currentID, typeof vehicle === 'string' ? { price: data.money.price } : vehicle);

   if (!data.license && data.money) {
      emit('NewStart:moneyDecrease', data.money, currentID);

      if (typeof vehicle === 'string') {
         emit('NewStart:giveMoney', { name: data.money.name, amount: data.money.price }, true, true, currentID, license);
      }
   }
   emit('NewStart_Parking:handleGloble-server', { type: 'initial', source: currentID });
});