/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Police:handleReports-server', async (type, info) => {
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (type === 'getHome') {
      const { data } = await axios.get(`${URL}/police?license=${license}&type=home`);
      
      for (let index in data.wanted) data.wanted[index].image = data.players.find(i => i.license === data.wanted[index].license)?.image;
      delete data.players;

      data.wanted = data.wanted.map(w => ({ customID: w.customID, name: w.character.identifier.name, image: w.image }));
      data.vehicles = data.vehicles.map(v => ({ ...v, plate: v.plate.name }));

      emitNet('NewStart_Police:handleGeneral-client', currentID, 'setHome', JSON.stringify(data));

   } else if (type === 'removeViolation') { // for bank
      await axios.put(`${URL}/police/${license}`, { type, ...info });

   } else if (type === 'jailed') {
      await axios.put(`${URL}/police/${license}`, { type, value: info });

   } else if (type === 'circulate') {
      for (let item of factions[info.key].refPlayers.filter(p => p.serverID)) {
         emitNet('NewStart_Police:handleGeneral-client', item.serverID, type, JSON.stringify(info));
      }

   } else if (type === 'distress') {
      let respone = {};
      const player = factions[info.key].refPlayers.find(i => i.serverID === currentID);

      if (info.action === 'add') {
            respone = { 
            ...info, id: Date.now(), 
            code: player.code, 
            name: player.user.character.identifier.name, 
            ownerID: currentID,
            rankName: `${factions[info.key].ranks.find(r => r.id === player.rankID).name} - ${factions[info.key].name}`
         };

         policeData.distress.push(respone);

      } else {
         const index = policeData.distress.findIndex(i => i.id === info.id);

         respone = info;
         if (index >= 0) policeData.distress.splice(index, 1);
      }

      emitNet('NewStart_Police:handleGeneral-client', -1, type, JSON.stringify(respone));
      emitNet('NewStart_MainMenu:addToAds-client', -1, { 
         type: 'police', 
         text: `قام "${player.user.character.identifier.name}" ${info.action === 'add' ? 'برفع' : 'بإزالة'} ${info.type === 'normal' ? 'نداء استغاثة' : 'استنفار أمني'}`, 
         from: factions[info.key].name, name: info.code
      });

   } else if (type === 'update') { // update police
      await axios.put(`${URL}/police/${info.license}`, { type: 'set', data: info.data });
      const licensesData = { isWeapons: info.data.hasOwnProperty('isWeapons'), isCar: info.data.hasOwnProperty('isCar'), isMotor: info.data.hasOwnProperty('isMotor'), isTruck: info.data.hasOwnProperty('isTruck') };

      if (info.serverID && Object.values(licensesData).some(i => i)) {
         const licenseKey = Object.keys(licensesData).find(key => licensesData[key]);

         emitNet('NewStart_Phone:receiveMessage-client', info.serverID, JSON.stringify({ 
            number: info.phone, 
            text: `تم سحب رخصة ${licensesData.isWeapons ? 'حمل الأسلحة' : licensesData.isCar ? 'قيادة السيارات' : licensesData.isMotor ? 'قيادة الدراجات' : 'قيادة الشاحنات'} منك للمخالفة`
         }));

         emitNet('NewStart_MainMenu:handleGeneral-client', currentID, 'updateUser', { [licenseKey]: false });
         factionSendLog('license', { key: info.key, title: licenseKey, license: info.license }, license);
      }
   }
});

// ---
onNet('NewStart_Police:handleGeneral-server', async (type, info) => {
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (type === 'getPlayer') {
      if (info.isFast) info.value = (await axios.get(`${URL}/users/${licenseEncrypt(info.value)}?filter=customID`)).data.customID;

      const key = parseInt(info.value) ? 'customID' : 'name';
      const value = key === 'name' ? encodeURIComponent(info.value) : info.value
      let data = (await axios.get(`${URL}/users/${license}?${key}=${value}&filter=-_id,license,customID,job.key,job.type,job2.id,character.identifier`)).data;

      if (data.job?.type === 'mechanical') {
         data.job = 'عمل حر - ميكانيكي المركبات';

      } else if (data.job?.key) {
         const faction = factions[data.job.key];
         const player = faction.refPlayers.find(p => p.user.license === data.license);

         if (player.status !== 'vacation') {
            data.job = `${faction.ranks.find(r => r.id === player.rankID)?.name || ''} - ${faction.name}`; 
            data.isProtected = true;
         }
      }

      if (data) {
         const vipSeaportTax = (await axios.get(`${URL}/vip/${data.license}?filter=-_id,taxes.seaport`)).data.taxes.seaport;
         const police = (await axios.get(`${URL}/police?license=${data.license}&type=player`)).data;
         let houses = (await axios.get(`${URL}/houses/${data.license}?type=normal`)).data;
         let vehicles = (await axios.get(`${URL}/vehicles/${data.license}`)).data;

         for (let id of getPlayers()) {
            const licenseOther = GetPlayerIdentifier(id)?.replace('license:', '');
            if (data.license === licenseOther) { data.serverID = id; break; }
         }

         houses = houses.map(obj => {
            const name = realEstate.items.find(i => i.code === obj.code)?.name;
            return { type: obj.type, code: obj.code, name, registration: obj.registration };
         });

         vehicles = vehicles.map(obj => {
            const type = dealership.vehicles.find(v => v.hash === obj.hash).vehType;
            return { type, name: obj.name, plate: obj.plate.name, registration: obj.registration, isCurrent: false, wanted: obj.wanted.title };
         });

         data = { ...data, ...police, houses, vehicles, vipSeaportTax };
      }

      emitNet('NewStart_Police:handleGeneral-client', currentID, 'setPlayer', data ? JSON.stringify(data) : null);

   } else if (type === 'getData') {
      const vehicle = (await axios.get(`${URL}/vehicles/${license}?plate=${info}&filter=license,name,plate.name,registration,wanted,violations,hash`)).data;

      if (vehicle) {
         let owner = (await axios.get(`${URL}/users/${vehicle.license}?filter=-_id,customID,character.identifier.name`)).data;

         vehicle.wanted = vehicle.wanted.title;
         vehicle.owner = { id: owner.customID, name: owner.character.identifier.name };
         vehicle.type = dealership.vehicles.find(v => v.hash === vehicle.hash).vehType;
         vehicle.plate = vehicle.plate.name;
         vehicle.violations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      emitNet('NewStart_Police:handleGeneral-client', currentID, 'setOther', vehicle ? JSON.stringify(vehicle) : null);

   } else if (type === 'editPlayer') {
      if (info.type === 'status' && info.item.title && info.serverID) {
         emitNet(
            'NewStart_Phone:receiveMessage-client', info.serverID,
            JSON.stringify({ number: '911', text: `أنت مطلوب للعدالة بسبب "${info.item.title}" ننصحك بتسليم نفسك لتخفيض العقوبة.`})
         );

      } else if (info.type === 'violations') {
         emitNet('NewStart_Police:handleOther-client', currentID, 'reward', { price: /* (25 / 100) * */ info.item.price }); // 25%
         emitNet('NewStart_Bank:handleGeneral-client', info.serverID, 'violations');
         emitNet(
            'NewStart_Phone:receiveMessage-client', info.serverID,
            JSON.stringify({ 
               number: info.phone, 
               text: `لقد حصلت علي مخالفة بسبب "${info.item.name}" يرجي التوجه لأقرب صراف آلي أو فرع بنك لسداد قيمة المخالفة ${info.item.price.toLocaleString()}$` 
            })
         );

         info.item = { from: info.item.from, title: info.item.name, price: info.item.price };

      } else if (info.type === 'jail') {
         const user = (await axios.get(`${URL}/users/${info.license}?filter=character.identifier.name`)).data;

         emitNet(
            'NewStart_Police:handleGeneral-client', info.serverID, 'startJail', 
            JSON.stringify({ count: info.item.duration, reason: info.item.reason, code: info.item.from })
         );

         emitNet('NewStart_MainMenu:addToAds-client', -1, { 
            type: 'police', text: `سجن "${user.character.identifier.name}" بسبب ${info.item.reason} لمدة ${(info.item.duration / 60000).toFixed()} شهر`, 
            from: factions[info.key].name, name: info.item.from 
         });
      }

      await axios.put(`${URL}/police/${info.license}`, info);
      factionSendLog('editPlayer', info, license);

   } else if (type === 'editVehicle') {
      if (info.pushType === 'violations') {
         await axios.put(`${URL}/vehicles`, { license, ...info });
         await axios.put(`${URL}/vehicles?unset=garage`, { license, plate: info.plate });
         await axios.put(`${URL}/vehicles`, { license, plate: info.plate, isReservation: true });
         const ownerLic = vehicleSystem.private.find(i => i.netID === info.attachID)?.ownerLic;
         
         if (ownerLic) {
            const serverID = getPlayerIdFromGame(ownerLic);

            if (serverID) {
               emit('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: info.attachID }));
               emitNet('NewStart_VehicleSystem:removePrivate-client', serverID, JSON.stringify([info.id]));
               emit('NewStart_Parking:handleGloble-server', { type: 'initial', source: serverID });
   
               emitNet(
                  'NewStart_Phone:receiveMessage-client', serverID,
                  JSON.stringify({ number: '911', text: `تم حجز مركبتك لدي شرطة المرور بسبب "${info.title}" اذهب لمقر حجز المركبات ودفع الغرامة.` })
               );
            }
         }
      }
   }
});

// ---
onNet('NewStart_Police:handleOther-server', async (type, info) => {
   if (type === 'playerDrag') {
      emitNet('NewStart_Police:handleOther-client', info.id, 'playerDrag', { id: source, value: info.value });

   } else if (type === 'follow') {
      emitNet('NewStart_Police:handleOther-client', info, 'follow', source);

   } else if (type === 'setSeat') {
      emitNet('NewStart_Police:handleOther-client', info.id, 'setSeat', { policeID: source, ...info });

   } else if (type === 'drugTest') {
      emitNet('NewStart_Police:handleOther-client', info, 'drugTest', source);

   } else if (type === 'drugResult') {
      emitNet('NewStart_Police:handleOther-client', info.id, 'drugResult', info.result);

   } else if (type === 'addVehWanted') {
      factionSendLog('addVehWanted', { key: info.key, plate: info.plate, isRemove: info.isRemove }, licenseEncrypt(source));
      delete info.key;

      policeData.vehWanted = policeData.vehWanted.filter(i => i.plate !== info.plate);

      if (!info.isRemove) {
         delete info.isRemove;
         policeData.vehWanted.push(info);
      }

      emitNet('NewStart_Police:handleOther-client', -1, 'addVehWanted', JSON.stringify(policeData.vehWanted));

   } else if (type === 'getWanted') {
      const currentID = source;
      const license = licenseEncrypt(info);
      const { data } = await axios.get(`${URL}/users/${license}?filter=customID,character.identifier.name`);
      const isWanted = !!(await axios.get(`${URL}/police?license=${license}&filter=status.title`)).data.status.title;

      emitNet('NewStart_PoliceTools:handleGeneral-client', currentID, 'setPolmavData', { type: 'player', id: data.customID, name: data.character.identifier.name, isWanted });
   }
});