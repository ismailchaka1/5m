/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Inspection:handcuff-server', async playerID => {
   const currentID = source;
   emitNet('NewStart_Inspection:handcuff-client', playerID, false, currentID);
});

// ---
onNet('NewStart_Inspection:initial-server', async data => {
   const currentID = source;
   let serverID = null;

   if (data.type === 'vehicle' && data.netID) {
      const ownerLic = Object.values(vehicleSystem).flat().find(i => i.netID === data.id)?.ownerLic;
      serverID = ownerLic ? getPlayerIdFromGame(ownerLic) : null;
   }

   const player = data.id || serverID ? GetPlayerIdentifier(data.id || serverID)?.replace('license:', '') : null;

   if (!player) {
      emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'لا يمكن الوصول لهذه الحقيبة حاليًا!');
      emitNet('NewStart_Inspection:closeUI-client', currentID, true);
      return;
   }

   const license = licenseEncrypt(currentID);
   const response = (await axios.post(`${URL}/inspection`, { license, player, ...data })).data;

   if (data.type === 'player') {
      emitNet('NewStart_Notifications:showAttention-client', data.id, 'error', `يقوم (${response.customID}) بتفتيش حقيبتك الشخصية الآن!`);

   } else if (data.type === 'vehicle' && response.noInventory) {
      emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'لا يوجد حقيبة نشطة لهذه المركبة!');
      emitNet('NewStart_Inspection:closeUI-client', currentID, true);
      return;
   }

   emitNet('NewStart_Inspection:initial-client', currentID, JSON.stringify({ name: response.name, items: response.items, serverID }));
});

// ---
onNet('NewStart_Inspection:handleData-server', async (type, data) => {
   if (type === 'done') {
      emitNet('NewStart_Notifications:showAttention-client', data, 'success', 'لقد تم الانتهاء من تفتيش حقيبتك الشخصية.');
      return;
   }

   const currentID = source;
   const playerLicense = data.playerID ? GetPlayerIdentifier(data.playerID).replace('license:', '') : null;
   const license = licenseEncrypt(currentID);
   const response = (await axios.put(`${URL}/inspection`, { license, playerLicense, ...data })).data;

   if (data.type === 'player') {
      emitNet('NewStart_Inventory:update-client', data.playerID, 'currentItems', JSON.stringify(response.playerItems));
   } 

   emitNet('NewStart_Inventory:update-client', currentID, 'currentItems', JSON.stringify(response.userItems));
   emitNet('NewStart_Notifications:showAttention-client', currentID, 'success', `لقد قمت بإنهاء التفتيش وسحب العناصر.`);
   factionSendLog('inspection', { id: data.plate || data.code, key: data.key, type: data.type, license: playerLicense, items: response.logItems }, license);
});