/* ``````````` ## Development By el8rbawY ## ```````````*/
async function officeData(license) {
   const codes = (await axios.get(`${URL}/houses/${license}?type=codes`)).data;
   const office = JSON.parse(JSON.stringify(realEstate.items));
   const sale = [];

   for (let item of office) {
      const find = codes.public.find(obj => obj.code === item.code);
      if (find) item.isOwned = true;

      if (item.type === 'garage') {
         item.vehicle = realEstate.garages[item.garageType].vehicle;

      } else {
         item.room = realEstate.houses[item.coord.type].room;

         if (item.garage) {
            item.vehicle = realEstate.garages[item.garage.type].vehicle;
         }
      }
   }

   for (let item of codes.private) {
      const find = realEstate.items.find(i => i.code === item.code);
      sale.push({
         code: item.code,
         name: find.name,
         price: find.price,
         give: find.price / 2 // and edit in saleProperty - onNet
      });
   }

   sale.sort((a, b) => b.give - a.give);
   return { type: 'initial', office, sale, properties: codes.private.map(p => p.code) };
}

// ---
on('playerJoining', async id => {
   const data = await officeData(licenseEncrypt(id));
   emitNet('NewStart_RealEstate:handleOffice-client', id, JSON.stringify(data));
});

// ---
onNet('NewStart_RealEstate:handleOffice-server', async (type, info) => {
   if (info) info = JSON.parse(info);
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (type === 'initial') {
      const data = await officeData(license);
      emitNet('NewStart_RealEstate:handleOffice-client', currentID, JSON.stringify(data));

   } else if (type === 'payment') {
      const response = (await axios.get(`${URL}/houses/${license}?type=existence&code=${info.code}`)).data;

      if (response.isExisting) {
         emitNet('NewStart_RealEstate:handleOffice-client', currentID, JSON.stringify({ type: 'existing', code: info.code }));

      } else {
         emitNet(
            'NewStart_RealEstate:handleOffice-client', currentID, 
            JSON.stringify({ 
               type: 'payment', code: info.code,
               price: realEstate.items.find(r => r.code === info.code).price 
            })
         );
      }
      
   } else if (type === 'addProperty') {
      await axios.post(`${URL}/houses/${license}`, info);

      const player = (await axios.get(`${URL}/users/${license}?filter=character.identifier.name`)).data;
      const data = await officeData(license);

      emitNet('NewStart_RealEstate:handleOffice-client', currentID, JSON.stringify({ ...data, giveKey: info.code }));
      emitNet('NewStart_RealEstate:handleOffice-client', -1, JSON.stringify({ type: 'owned', code: info.code, value: true }));
      emitNet(
			'NewStart_MainMenu:addToAds-client', -1,
			{ type: 'house', from: 'النظام', text: `قام "${player.character.identifier.name}" بشراء ${info.type === 'garage' ? 'جراج' : 'منزل'} جديد` }
		);

   } else if (type === 'saleProperty') {
      const isVehicles = (await axios.get(`${URL}/vehicles/${license}?isGarage=true&load=${info.code}&length=true`)).data.value;
      
      if (isVehicles) {
         return emitNet('NewStart_RealEstate:handleInterior-client', currentID, 'saleProperty', JSON.stringify({ prevent: true })); 
      }

      const response = (await axios.delete(`${URL}/houses/${license}`, { data: { code: info.code } })).data; 

      if (response.isLoan) {
         emitNet('NewStart_RealEstate:handleInterior-client', currentID, 'saleProperty', JSON.stringify({ prevent: true, isLoan: true })); 

      } else if (response.isDone) {
         const find = realEstate.items.find(i => i.code === info.code);
         const data = await officeData(license);

         emitNet(
            'NewStart_RealEstate:handleInterior-client', currentID, 'saleProperty', 
            JSON.stringify({ name: `بيع العقار ${info.code}`, amount: find.price / 2, from: 'bank' })
         );

         emitNet('NewStart_RealEstate:handleOffice-client', currentID, JSON.stringify(data));
         emitNet('NewStart_RealEstate:handleOffice-client', -1, JSON.stringify({ type: 'owned', code: info.code, value: false }));
      }
   }
});

// ---
onNet('NewStart_RealEstate:handleInterior-server', async (type, info) => {
   if (info) info = JSON.parse(info);
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (type === 'toggleKey') {
      const find = realEstate.items.find(obj => obj.code === info.code);

      if (find.type !== 'garage' && info.type === 'garage') {
         find.garage.isLock = info.value;

      } else {
         find.isLock = info.value;
      }

      emitNet('NewStart_RealEstate:handleInterior-client', -1, 'toggleKey', JSON.stringify(info));

   } else if (type === 'getClothes') {
      const data = (await axios.get(`${URL}/outfits/${license}`)).data;
      emitNet('NewStart_RealEstate:handleInterior-client', currentID, 'setClothes', JSON.stringify(data));

   } else if (type === 'vehiclesGarage') {
      const vehicles = (await axios.get(`${URL}/vehicles/${license}?isGarage=true&load=${info.code}`)).data;
   
      if (vehicles.length) {
         for (let item of vehicles) {
            const index = realEstate.items.findIndex(i => i.code === item.garage.code);
            const type = realEstate.items[index].garageType || realEstate.items[index].garage.type;
            const place = realEstate.garages[type].places.find(p => p.id === item.garage.id);
      
            item.location = place;
            item.bucketID = index + 1;
         }
      
         emitNet('NewStart_VehicleSystem:spawning-client', currentID, JSON.stringify(vehicles));
      }

   } else if (type === 'vehiclesBucket') {
      for (let item of info) {
         SetEntityRoutingBucket(NetworkGetEntityFromNetworkId(item.vehID), item.bucketID);
      }
   }
});

// ---
onNet('NewStart_RealEstate:handleBucket-server', async ({ type, code, enterCoord, urOwn }) => {
   const currentID = source;
   const index = realEstate.items.findIndex(i => i.code === code);
   const bucketID = index + 1;
   const vehID = GetVehiclePedIsIn(GetPlayerPed(currentID));
   const ref = realEstate.items[index];

   if (type === 'enter') {
      SetPlayerRoutingBucket(currentID, bucketID);
      if (vehID) SetEntityRoutingBucket(vehID, bucketID);

   } else { // exit
      SetPlayerRoutingBucket(currentID, 0);
      if (vehID) SetEntityRoutingBucket(vehID, 0);

      emitNet('NewStart_RealEstate:handleInterior-client', currentID, 'safeExit', JSON.stringify({ isDone: true }));
   }

   let data = { coord: enterCoord };

   // save vehicle
   // if (urOwn && vehID && (ref.type === 'garage' || ref.garage)) {
   //    const license = licenseEncrypt(currentID);
   //    const plate = GetVehicleNumberPlateText(vehID);
   //    const vehicles = (await axios.get(`${URL}/vehicles/${license}?isGarage=true&code=${code}`)).data;
   //    const type = ref.garageType || ref.garage.type;
   //    const findVeh = vehicles.find(v => v.plate.name === parseInt(plate));

   //    if (findVeh) {
   //       data.coord = realEstate.garages[type].places.find(p => p.id === findVeh.garage.id) || enterCoord;

   //    } else {
   //       const filter = realEstate.garages[type].places.filter(p => !vehicles.some(v => v.garage.id === p.id));

   //       if (ref.type !== 'garage' && !filter.length) {
   //          emitNet('NewStart_RealEstate:handleInterior-client', currentID, 'safeExit');
   //          emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'لا يوجد مكان مناسب لهذه المركبة داخل الجراج!');

   //       } else {
   //          data.coord = filter[0] || enterCoord;
   //          if (data.coord.id) await axios.put(`${URL}/vehicles`, { license, plate, garage: { code, id: data.coord.id } });
   //       }
   //    }
   // }

   emitNet('NewStart_RealEstate:handleInterior-client', currentID, 'removeBlackScreen', JSON.stringify(data));
});