/* ``````````` ## Development By el8rbawY ## ```````````*/
let lastVehSysID = 0, lastRemoveVehID = 0;;

// ---
onNet('NewStart_VehicleSystem:handleGlobal-server', async (type, info) => {
   info = JSON.parse(info);
   const currentID = source;
   const license = licenseEncrypt(currentID);   

   if (type === 'newJob') {
      await axios.post(`${URL}/vehicles/job`, { license, ...info });

   } else if (type === 'createVehicle') {
      if (!vehicleSystem[info.family]) return;
       
      const vehID = CreateVehicleServerSetter(info.model, info.type, info.coords[0], info.coords[1], info.coords[2], info.coords[3]);
      const netID = NetworkGetNetworkIdFromEntity(vehID);
      const item = { netID, ownerLic: license, hash: info.model, date: Date.now() };

      if (!vehID) return;
      while (NetworkGetEntityOwner(vehID) === -1) await Delay(0);

      item.uniqueID = ++lastVehSysID;
      Entity(vehID).state.uniqueID = item.uniqueID;

      if (info.family === 'private') {
         item._id = info.data._id;
         vehicleSystem[info.family].push(item);
         emitNet('NewStart_VehicleSystem:handleGeneral-client', currentID, 'createPrivateVehicle', { ...info.data, netID });

      } else if (info.family === 'employee') {
         vehicleSystem[info.family].push(item);
         emitNet('NewStart_Employee:handleGeneral-client', currentID, 'createEmployeeVehicle', { ...info.data, netID });

      } else if (info.family === 'job') {
         vehicleSystem[info.family].push(item);
         emitNet('NewStart_Jobs:handleGeneral-client', currentID, 'createJobVehicle', { ...info.data, netID });
      }

      if (lastRemoveVehID === netID) lastRemoveVehID = 0;

   } else if (type === 'removeVeh') {
      if (lastRemoveVehID === info.id) return;
      const uniqueID = Entity(NetworkGetEntityFromNetworkId(info.id)).state.uniqueID;

      if (uniqueID) {
         for (let key in vehicleSystem) {
            const index = vehicleSystem[key].findIndex(i => i.uniqueID === uniqueID);
            
            if (index >= 0) {
               const item = vehicleSystem[key][index];
               const vehID = NetworkGetEntityFromNetworkId(info.id);

               if (vehID && item.netID === info.id) {
                  if (item.ownerLic) {
                     const ownerID = getPlayerIdFromGame(item.ownerLic);
                     if (ownerID && GetVehiclePedIsIn(GetPlayerPed(ownerID), false) === vehID) break;
                  }
                  
                  vehicleSystem[key].splice(index, 1);
                  lastRemoveVehID = info.id;
                  DeleteEntity(NetworkGetEntityFromNetworkId(info.id));
               }
               break;
            }
         }

      } else {
         const vehID = NetworkGetEntityFromNetworkId(info.id);

         if (vehID) {
            lastRemoveVehID = info.id;
            DeleteEntity(vehID);
         }
      }

      console.log(info.id, uniqueID);

   } else if (type === 'syncFuel') {
      emitNet('NewStart_VehicleSystem:handleGeneral-client', -1, type, info);

   } else if (type === 'asMission') {
      emitNet('NewStart_VehicleSystem:handleGeneral-client', -1, type, info);

   } else if (type === 'syncLock') {
      emitNet('NewStart_VehicleSystem:handleGeneral-client', -1, type, info);

   } else if (type === 'enquiry') {
      const vehID = NetworkGetEntityFromNetworkId(info.netID);

      if (DoesEntityExist(vehID) && GetVehicleNumberPlateText(vehID).trim() === info.plate) {
         let coords = GetEntityCoords(vehID);
         const bucket = GetEntityRoutingBucket(vehID);
         
         if (bucket) {
            const find = realEstate.items[bucket - 1];
            if (find && find.garageOut) coords = [find.garageOut.x, find.garageOut.y, find.garageOut.z];
         }

         emitNet('NewStart_PoliceTools:handleGeneral-client', currentID, 'enquiry', coords);

      } else {
         emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'يعتذر الوصول للمركبة لذلك لن يتم سحب المبلغ!');
      }
   }
});

// ---
on('playerJoining', id => { 
   const license = licenseEncrypt(id);
   const private = vehicleSystem.private.filter(i => i.ownerLic === license && NetworkGetEntityFromNetworkId(i.netID)).map(i => { 
      const find = dealership.vehicles.find(v => v.hash === v.hash);
      return { 
         id: i._id, vehID: i.netID, vehType: find.vehType, hash: i.hash, name: `${find.name} ${find.release}`, 
         plate: GetVehicleNumberPlateText(NetworkGetEntityFromNetworkId(i.netID)) 
      };
   });
   const employee = vehicleSystem.employee.filter(i => i.ownerLic === license && NetworkGetEntityFromNetworkId(i.netID)).map(i => ({ 
      id: i.netID, hash: i.hash
   }));

   emit('NewStart_Parking:handleGloble-server', { type: 'initial', isAll: true, source: id });
   if (private.length) emitNet('NewStart_VehicleSystem:handleGeneral-client', id, 'setPrivateVehicle', private);
   if (employee.length) emitNet('NewStart_Employee:handleGeneral-client', id, 'setVehInfo', employee);
});

// ---
onNet('NewStart_VehicleSystem:saveData-server', async (data, unset = null) => {
   data = JSON.parse(data);
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (data.features) {
      const vehicle = (await axios.get(`${URL}/vehicles/${license}?plate=${data.plate}&filter=hash`)).data;
      const speed = dealership.vehicles.find(obj => obj.hash === vehicle.hash).speed;
      
      emitNet(
         'NewStart_Mechanical:handleGeneral-client', currentID, 
         'setMaxSpeed', JSON.stringify({ value: (speed + (10 * (data.features.engine + 1))) / 3.6 })
      );
   }

   await axios.put(`${URL}/vehicles?unset=${unset}`, { license, ...data });
});

// ---
onNet('NewStart_Parking:handleGloble-server', async data => { // انتبه للاسم
   const currentID = source || data.source;
   const license = licenseEncrypt(currentID);

   if (data.type === 'initial') {
      const vehicles = (await axios.get(`${URL}/vehicles/${license}?isGarage=false&isAll=${data.isAll}`)).data;

      for (let item of vehicles) {
         const find = dealership.vehicles.find(v => v.hash === item.hash);
         item.vehType = find.vehType;
      }

      emitNet('NewStart_Parking:handleGloble-client', currentID, 'initial', JSON.stringify(vehicles));
      emitNet('NewStart_Police:handleGeneral-client', currentID, 'setReservation', JSON.stringify(vehicles.filter(v => v.isReservation)));

   } else if (data.type === 'checkRestore') {
      const vehID = NetworkGetEntityFromNetworkId(data.netID);
      data.isExist = DoesEntityExist(vehID) && GetVehicleNumberPlateText(vehID).trim() === data.plate;

      emitNet('NewStart_Parking:handleGloble-client', currentID, data.type, JSON.stringify(data));
   }
});

// ---
onNet('baseevents:enteredVehicle', (vehID, currentSeat) => {
   if (currentSeat === -1) emitNet('NewStart_VehicleSystem:handleGeneral-client', source, 'checkPolice', vehID);
});

// ---
onNet('baseevents:leftVehicle', () => {
   emitNet('NewStart_VehicleSystem:handleGeneral-client', source, 'leftVehicle');
});