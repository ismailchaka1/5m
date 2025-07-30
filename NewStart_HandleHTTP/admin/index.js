/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Admin:handleGeneral-sevrer', async info => {
   const currentID = source;
   const license = licenseEncrypt(currentID);
   const admin = (await axios.get(`${URL}/users/${license}?filter=adminRole`)).data;
   if (!admin?.adminRole) return;
   let message = info.message, adsText = '';

   if (info.action === 'sendAds') {
      emitNet('NewStart_MainMenu:addToAds-client', -1, { type: 'admin', text: info.value, from: 'إدارة الخادم' });
      message = `← بإرسال إعلان عام\nالمحتوي: ${info.value}`;

   } else if (info.action === 'clearAds') {
      emitNet('NewStart_MainMenu:addToAds-client', -1, null);
      message = `← بحذف كل الإعلانات العامة\nالسبب: ${info.value}`;
      adsText = 'قمنا بحذف جميع الإعلانات العامة'

   } else if (info.action === 'comfort') {
      admins.comfort.isActive = !admins.comfort.isActive;

      if (admins.comfort.isActive) {
         adsText = 'تفعيل وقت الراحة جميع الأعمال الإجرامية متوقفة';
         message = `← بتشغيل وقت الراحة\nالسبب: ${info.value}`;

      } else {
         adsText = 'إنتهاء من وقت الراحة وجميع الأعمال الإجرامية متاحة';
         message = '← بإيقاف وقت الراحة';
      }

      emitNet('NewStart_Admin:methods-client', -1, 'addBigAds', { type: info.action, value: admins.comfort.isActive, extra: !admins.comfort.isActive ? 'endComfort' : '' });

   } else if (info.action === 'doubleLevel') { // doubleLevel
      const ref = admins.doubleLevel;

      ref.isActive = !ref.isActive;
      clearTimeout(ref.timeoutID);

      if (ref.isActive) {
         ref.timeoutID = setTimeout(_=> {
            ref.isActive = false;
            stopDoubleLevel();
         }, 10800000); // 3h

         emitNet('NewStart_MainMenu:handleGeneral-client', -1, 'setDoubleLevel', true);
         emitNet('NewStart_Admin:methods-client', -1, 'addBigAds', 'level');
         message = `← بتشغيل ضعف الخبرة\nالسبب: ${info.value}`;

      } else {
         stopDoubleLevel();
         message = '← بإيقاف ضعف الخبرة';
      }

   } else if (info.action === 'doubleTaboo') { // doubleTaboo
      admins.doubleTaboo.isActive = !admins.doubleTaboo.isActive;
      clearTimeout(admins.doubleTaboo.timeoutID);

      if (admins.doubleTaboo.isActive) {
         admins.doubleTaboo.timeoutID = setTimeout(_=> {
            admins.doubleTaboo.isActive = false;
            stopDoubleTaboo();
         }, 10800000); // 3h

         emitNet('NewStart_Admin:methods-client', -1, 'addBigAds', { type: info.action, value: admins.doubleTaboo.isActive });
         message = `← بتشغيل ضعف الأجر ممنوعات\nالسبب: ${info.value}`;

      } else {
         stopDoubleTaboo();
         message = '← بإيقاف ضعف الأجر ممنوعات';
      }

   } else if (info.action === 'removeVeh') { // removeVeh
      const vehID = NetworkGetEntityFromNetworkId(info.vehID);
      const plate = GetVehicleNumberPlateText(vehID)?.trim();

      if (GetPedInVehicleSeat(vehID, -1) || GetPedInVehicleSeat(vehID, 0)) {
         return emitNet('NewStart_Admin:methods-client', currentID, 'console', 'You cannot delete this vehicle!');
      }

      if (new RegExp(/^[A-Z]{3} \d{4}$/).test(plate)) {
         const ownerLic = Object.values(vehicleSystem).flat().find(i => i.netID === info.vehID)?.ownerLic;
         const ownerID = ownerLic ? getPlayerIdFromGame(ownerLic) : NetworkGetFirstEntityOwner(vehID);

         if (ownerID >= 1) {
            emitNet('NewStart_VehicleSystem:removePrivate-client', ownerID, JSON.stringify([plate]));
            emitNet('NewStart_Notifications:showAttention-client', ownerID, 'error', `تم إرجاع المركبة "${plate}" للتواجد في مكان مخالف!`);
         }

      } else {
         const ownerID = NetworkGetFirstEntityOwner(vehID);

         if (ownerID >= 1) {
            emitNet('NewStart_Employee:handleGeneral-client', ownerID, 'removeVeh', info.vehID);
            emitNet('NewStart_Notifications:showAttention-client', ownerID, 'error', 'تم إزالة مركبة خاصة بك للتواجد في مكان مخالف!');
         }
      }

      emit('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: info.vehID }));
      message = '← بحذف مركبة';
      emitNet('NewStart_Admin:methods-client', currentID, 'console', 'The vehicle has been deleted.');
   }

   if (adsText) {
      emitNet('NewStart_MainMenu:addToAds-client', -1, { type: 'admin', text: adsText, from: 'الإدارة' });
   }

   await axios.post( `${URL}/other/discord_log`, { type: 'normal', isLog: true, license, channel: admins.channelMain, message: message +'\n' });
});

// ---
onNet('NewStart_Admin:handlePlayer-sevrer', async (info, lic) => {
   info = JSON.parse(info);
   const currentID = source;
   const license = lic || licenseEncrypt(currentID);
   const admin = (await axios.get(`${URL}/users/${license}?filter=adminRole,discord`)).data;
   if (!admin?.adminRole) return;

   const targetPed = info.serverID ? GetPlayerPed(info.serverID) : 0;
   const targetCoords = info.serverID ? GetEntityCoords(targetPed) : null;
   let reason = null, extra = '', adsText = '';

   switch (info.action) {
      case 'pullPlayer':
         if ((await axios.get(`${URL}/police?license=${info.license}&filter=jailed`)).data.jailed) {
            return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', `${info.name} مسجون حاليًا لا يمكن تنفيذ السحب!`);
         }

         const pedID = GetPlayerPed(currentID);
         const coords = GetEntityCoords(pedID);
         const bucketID = GetPlayerRoutingBucket(info.serverID);

         if (bucketID) {
            const code = realEstate.items[bucketID - 1].code;

            emitNet('NewStart_RealEstate:handleInterior-client', info.serverID, 'safeEnter', JSON.stringify({ code }));
            SetPlayerRoutingBucket(info.serverID, bucketID);

         } else {
            emitNet('NewStart_RealEstate:handleInterior-client', info.serverID, 'safeExit', JSON.stringify({ isDone: true }));
            SetPlayerRoutingBucket(info.serverID, 0);
         }

         // SetPlayerRoutingBucket(info.serverID, GetPlayerRoutingBucket(currentID));
         emitNet('NewStart_Admin:methods-client', info.serverID, 'goToPlace', coords);
         reason = 'بسحب'; extra = `\nالسبب: ${info.reason}`;
         break;

      case 'teleport':
         const playerBucketID = GetPlayerRoutingBucket(info.serverID);

         if (playerBucketID) {
            const code = realEstate.items[playerBucketID - 1].code;

            emitNet('NewStart_RealEstate:handleInterior-client', currentID, 'safeEnter', JSON.stringify({ code }));
            SetPlayerRoutingBucket(currentID, playerBucketID);

         } else {
            emitNet('NewStart_RealEstate:handleInterior-client', currentID, 'safeExit', JSON.stringify({ isDone: true }));
            SetPlayerRoutingBucket(currentID, 0);
         }

         emitNet('NewStart_Admin:methods-client', currentID, 'goToPlace', targetCoords);
         reason = 'بالإنتقال'; extra = `\nالسبب: ${info.reason}`;
         break;

      case 'spectate':
         SetPlayerRoutingBucket(currentID, GetPlayerRoutingBucket(info.serverID));
         emitNet('NewStart_Admin:methods-client', currentID, 'startSpectate', { coords: targetCoords, serverID: info.serverID });
         reason = 'بمراقبة'; extra = `\nالسبب: ${info.reason}`;
         break;

      case 'kick':
         DropPlayer(info.serverID, info.reason);
         reason = 'بطرد'; extra = `\nالسبب: ${info.reason}`;
         break;
         
      case 'ban':
         adsText = `حظر "${info.name}" ${info.reason}`;
         if (info.serverID) DropPlayer(info.serverID, `.تم حظرك بسبب: ${info.reason}`);
         await axios.post(`${URL}/admin/ban?license=${license}`, { license: info.license, ...info, isGive: true });
         reason = 'بحظر';
         extra = `\nالسبب: ${info.reason}\nالمدة: ${info.isForever ? 'مدي الحياة' : moment(info.duration).format('D/M/YYYY hh:mm:ss')}`;
         break;

      case 'expLose':
         adsText = `خصم خبرة من "${info.name}" ${info.reason} (${info.value} خبرة)`;
         emitNet('NewStart_MainMenu:handleGeneral-client', info.serverID, 'expLose', info.value);
         emitNet('NewStart_Admin:methods-client', info.serverID, 'addBigAds', 'expLose');

         await axios.post(`${URL}/other/log`, { license: info.license, type: info.action, from: admin.discord, value: info.value, reason: info.reason });
         reason = 'بخصم خبرة'; extra = `\nالسبب: ${info.reason}\nالخبرة: ${info.value}`;
         break;

      case 'giveExp':
         adsText = `منح خبرة لـ "${info.name}" ${info.reason} (${info.value} خبرة)`;
         emitNet('NewStart_MainMenu:handleGeneral-client', info.serverID, 'levelUp', info.value);
         emitNet('NewStart_Admin:methods-client', info.serverID, 'addBigAds', 'giveExp');
         reason = 'بمنح خبرة'; extra = `\nالسبب: ${info.reason}\nالخبرة: ${info.value}`;
         break;

      case 'jail':
         if (!lic && currentID) {
            const isJailed = (await axios.get(`${URL}/police?license=${info.license}&filter=jailed`)).data.jailed;
            if (isJailed) return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', `${info.name} مسجون حاليا بالفعل!`);
         }

         const duration = info.value * 60 * 60 * 1000;
         const hours = Math.floor(info.value);
         const minutes = (info.value - hours) * 60;

         reason = 'بسجن'; extra = `\nالسبب: ${info.reason}\nالمدة: ${hours ? `${hours} ساعة` : ''}${minutes ? `${hours ? ' و' : ''}${minutes} دقيقة` : ''}`;
         adsText = `تحويل "${info.name}" للسجن بسبب ${info.reason}`;

         if (info.serverID) emitNet(
            'NewStart_Police:handleGeneral-client', info.serverID, 'startJail', 
            JSON.stringify({ count: duration, reason: info.reason, code: admin.discord })
         );

         await axios.put(`${URL}/police/${info.license}`, { type: 'jail', item: { duration, reason: info.reason, from: admin.discord }});
         break;

      case 'questions':
         adsText = `تحويل "${info.name}" لإعادة الاختبار بسبب ${info.reason}`;
         emitNet('NewStart_Questions:handleGeneral-client', info.serverID, 'again', { name: info.name });
         removeFromDeadList(info.serverID);
         reason = 'بإعادة اختبار'; extra = `\nالسبب: ${info.reason}`;
         break;

      case 'screen':
         emitNet('NewStart_Tools:handleGeneral-client', info.serverID, 'startAdminScreen', info.reason);
         reason = 'بتحذير'; extra = `\nالسبب: ${info.reason}`;
         break;

      default: // removeTweets
         await axios.delete(`${URL}/phone/tweets`, { data: { customID: info.customID, isAll: true, license: info.license } });
         emitNet('NewStart_Notifications:showAttention-client', currentID, 'success', `تم حذف كل تغريدات اللاعب (${info.customID}).`);
         emitNet('NewStart_MainMenu:addToAds-client', -1, null, { type: 'twitter', name: info.customID });
         reason = 'بحذف تغريدات'; extra = `\nالسبب: ${info.reason}`;
   }

   if (adsText) {
      emitNet('NewStart_MainMenu:addToAds-client', -1, { type: 'admin', text: adsText, from: 'الإدارة' });
   }

   await axios.post( `${URL}/other/discord_log`, { 
      type: 'normal', isLog: true,
      license, channel: admins.channelPlayer, 
      message: `"${reason}" ← (${info.customID}) ${info.name}`.concat(extra+'\n')
   });
});