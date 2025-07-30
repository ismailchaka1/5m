/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_TransferOwnership:handleGeneral-server', async (type, info) => {
   info = JSON.parse(info);
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (type === 'sendRequest') {
      let ownerID = null, response = null;
      const name = info.type === 'house' ? 'عقار' : 'مركبة';

      if (info.type === 'house') {
         response = (await axios.get(`${URL}/houses/${license}?code=${info.id}&filter=license,isLoan`)).data;

      } else if (info.type === 'vehicle') {
         response = (await axios.get(`${URL}/vehicles/${license}?plate=${info.id}&filter=license,isLoan,hash,isReservation`)).data;

      } else { // jobVehicle
         response = (await axios.get(`${URL}/other/jobVehicle?license=${license}&customID=${info.id}&hash=${info.extra}&filter=license,hash`)).data;
      }

      if (response.hash) {
         const state = (await axios.get(`${URL}/police?license=${license}&filter=isCar,isTruck,isMotor`)).data;
         const vehType = dealership.vehicles.find(i => i.hash === response.hash).vehType;
         
         if ((vehType === 'car' && !state.isCar) || (vehType === 'truck' && !state.isTruck) || (vehType === 'motorcycle' && !state.isMotor)) {
            return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'يجب ان تحصل على رخصة القيادة أولاً الخاصة بهذا النوع!');

         } else if (response.isReservation) {
            return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'هذه المركبة محجوزة لدي المرور لا يمكن تقديم طلب لها!');

         } else {
            const find = dealership.vehicles.find(i => i.hash === response.hash);

            if (find) {
               if (find.type === 'store') {
                  return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'لا يمكن نقل ملكية هذا النوع من المركبات!');

               } else if (info.type === 'vehicle') {
                  const min = find.price - (find.price * (25 / 100));
                  const max = find.price + (find.price * (50 / 100));
                  
                  if (info.price < min) {
                     return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', `لا يمكن بيع هذه المركبة بمبلغ أقل من ${min.toLocaleString()}$`);
      
                  } else if (info.price > max) {
                     return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', `لا يمكن بيع هذه المركبة بمبلغ أكبر من ${max.toLocaleString()}$`);
                  }
               }

               const player = (await axios.get(`${URL}/users/${license}?filter=mode.level`)).data;

               if (exports.NewStart_HTTP.method('getLevel', player.mode?.level) < (find.level || 0)) {
                  return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', `تتطلب هذه المركبة الوصول لمستوي ${find.level} لامتلاكها!`);
               }
            }
         }
      }

      if (response?.license === GetPlayerIdentifier(currentID).replace('license:', '')) {
         return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'لا يمكن تقديم طلب نقل لنفسك!');

      } else if (response?.isLoan) {
         return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'لا يمكن تقديم طلب نقل ملكية لضمان مرهون للبنك من أجل قرض!');

      } else if (!response?.license) {
         return emitNet(
            'NewStart_Notifications:showAttention-client', currentID, 'error', 
            `لم نتمكن من الوصول لل${name} ${info.type === 'house' ? 'الموجود' : 'الموجودة'} في الطلب.`
         );
      }

      // find player
      for (let id of getPlayers()) {
         if (response?.license === GetPlayerIdentifier(id)?.replace('license:', '')) { ownerID = id; break; }
      }

      if (!ownerID) {
         return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'المالك غير متواجد في الوقت الحالي!');
      }

      const { data } = await axios.get(`${URL}/users/${license}?filter=customID,character.identifier.name`);

      emitNet('NewStart_TransferOwnership:handleGeneral-client', currentID, 'setWaiting', JSON.stringify(info));
      emitNet(
         'NewStart_TransferOwnership:handleGeneral-client', ownerID, 'setRequest', 
         JSON.stringify({ ...info, customID: data.customID, name: data.character.identifier.name })
      );

   } else if (type === 'acceptRequest') {
      let playerID = null, isOwned = true;

      // check owned
      if (info.type === 'house') {
         isOwned = !!(await axios.get(`${URL}/houses/${license}?code=${info.id}&filter=license`)).data?.license;

      } else if (info.type === 'vehicle') {
         isOwned = !!(await axios.get(`${URL}/vehicles/${license}?plate=${info.id}&filter=license`)).data?.license;

      } else if (info.type === 'jobVehicle') {
         isOwned = !!(await axios.get(`${URL}/other/jobVehicle?license=${license}&customID=${info.id}&hash=${info.extra}&filter=license`)).data?.license;
      }

      if (!isOwned) {
         emitNet('NewStart_TransferOwnership:handleGeneral-client', currentID, 'resetRequests');
         emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'لم يعد بإمكانك قبول أي طلبات لهذه الملكية!');
         return;
      }

      // find player
      const playerLic = (await axios.get(`${URL}/users/${license}?customID=${info.customID}&filter=license`)).data.license;
      
      for (let id of getPlayers()) {
         if (playerLic === GetPlayerIdentifier(id)?.replace('license:', '')) { playerID = id;  break; }
      }

      if (!playerID) {
         emitNet('NewStart_TransferOwnership:handleGeneral-client', currentID, 'resetRequests');
         emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'مرسل الطلب غير متواجد في الوقت الحالي!');
         return;
      }

      // check player
      const money = (await axios.get(`${URL}/money/${licenseEncrypt(playerID)}?balance=true`)).data;

      if (money.bank < info.price) {
         emitNet('NewStart_TransferOwnership:handleGeneral-client', currentID, 'resetRequests');
         emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'لم يعد لدي مرسل الطلب المال الكافي للسداد!');
      }

      emitNet('NewStart_TransferOwnership:handleGeneral-client', playerID, 'startConvert', JSON.stringify({ ref: info.ref, serverID: currentID }));

   } else if (type === 'convert') {
      let houseName;
      await axios.put(`${URL}/other/ownership`, { license, ...info });

      if (info.type === 'house') {
         const data = await officeData(license);
         emitNet('NewStart_RealEstate:handleOffice-client', currentID, JSON.stringify(data));

         houseName = realEstate.items.find(i => i.code === info.id).type;
         houseName = houseName === 'garage' ? 'جراج' : 'منزل';
      }

      emitNet('NewStart_TransferOwnership:handleGeneral-client', info.serverID, 'doneConvert', JSON.stringify(info));
      
      const from = (await axios.get(`${URL}/users/${licenseEncrypt(info.serverID)}?filter=customID,character.identifier.name`)).data;
      const to = (await axios.get(`${URL}/users/${license}?filter=customID,character.identifier.name`)).data;

      const titles = { house: houseName, jobVehicle: `مركبة الوظيفة`, vehicle: `المركبة التي تحمل لوحة "${info.id}"` };
      const nameFrom = `${from.character.identifier.name} (${from.customID})`;

      info.price = Intl.NumberFormat('ar', { notation: 'compact' }).format(info.price);

      emitNet(
			'NewStart_MainMenu:addToAds-client', -1,
			{ 
            type: 'transfer',
            name: nameFrom,
            from: from.character.identifier.name, 
            text: `نقل ملكية ${titles[info.type]} إلي ${to.character.identifier.name} بمبلغ ${info.price}` 
         }
		);

      await axios.post( `${URL}/other/discord_log`, { 
         type: 'normal', isLog: true,
         license, channel: 'ownership-log', 
         message: `بنقل ملكية ${titles[info.type]}\nالمبلغ: $${info.price.toLocaleString()}\nالمستفيد: (${from.customID}) ${from.character.identifier.name}\n`
      });
   }
});