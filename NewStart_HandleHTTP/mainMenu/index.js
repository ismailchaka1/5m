/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_MainMenu:handleGeneral-server', async (type, info, more) => {
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (type === 'setFavorite') {
      await axios.post(`${URL}/users/favorite?license=${license}&isInc=${!!more}`, info);

   } else if (type === 'setVip') {
      const { data } = await axios.put(`${URL}/vip/${license}`, info);

      if (info.type === 'endVip') {
         if (data.vip) {
            emitNet('NewStart_MainMenu:handleGeneral-client', currentID, 'updateUser', { isVip: true, ...data.vip });
            emitNet('NewStart_Admin:methods-client', currentID, 'addBigAds', 'endPartVip');

         } else {
            emitNet('NewStart_MainMenu:handleGeneral-client', currentID, 'updateUser', { isVip: true, isRemove: true });
            emitNet('NewStart_Admin:methods-client', currentID, 'addBigAds', 'endVip');
         }
         
         emit('NewStart_Initialize:handleGeneral-server', 'updatePlayer', { serverID: currentID, refName: 'vip', value: data.vip ? { name: data.vip.name } : null });

         if (data.taxes) {
            emitNet('NewStart_MainMenu:handleGeneral-client', currentID, 'setTaxes', data.taxes);
         }
      }

   } else if (type === 'getData') {
      const statistics = (await axios.get(`${URL}/other/statistics`)).data;
      emitNet('NewStart_MainMenu:handleGeneral-client', currentID, 'setData', { statistics, playersCount: getPlayers().length + 11 });

   } else if (type === 'invite') {
      if (new RegExp(/^دعوة_\d+$/).test(info)) {
         const user = (await axios.get(`${URL}/users/${license}?filter=customID,registration,mode.noInvite`)).data;
         const customID = info.match(/\d+/)[0];

         if (user.customID === customID) {
            emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'رمز دعوة الصديق الذي تم إدخاله غير صحيح!');

         } else if (((new Date() - new Date(user.registration)) / (1000 * 60 * 60)) > 24) { 
            emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'لقد تجاوز تاريخ تسجيلك أكثر من 24 ساعة لم يعد بإمكانك القيام بذلك!');

         } else if (user.mode?.noInvite) {
            emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'لم يعد بإمكانك استخدام أي أكواد أخرى من الآخرين!');

         } else {
            const { data } = await axios.get(`${URL}/users/${license}?customID=${customID}&filter=license`);

            if (data) {
               const playerID = getPlayerIdFromGame(data.license);

               if (playerID) {
                  await axios.put(`${URL}/users/${license}`, { 'mode.noInvite': true });
                  emit('NewStart:giveMoney', { name: 'دعوة الأصدقاء', amount: 25000 }, false, false, currentID, license);
                  emit('NewStart:giveMoney', { name: 'دعوة الأصدقاء', amount: 25000 }, false, false, playerID, data.license);

               } else {
                  emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'يجب أن يكون صديقك متاح داخل الخادم أثناء استخدام الكود!');
               }
            } else {
               emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'رمز دعوة الصديق الذي تم إدخاله غير صحيح!');
            }
         }

      } else {
         emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'رمز دعوة الصديق الذي تم إدخاله غير صحيح!');
      }

   } else if (type === 'animShared') {
      emitNet('NewStart_MainMenu:handleGeneral-client', info.playerID, 'animShared', { action: info.action, serverID: currentID });
   }
});