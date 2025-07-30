/* ``````````` ## Development By el8rbawY ## ```````````*/
RegisterCommand('admin', async source => {
   const license = licenseEncrypt(source);
   const players = [];

   for (let id of getPlayers()) {
      players.push({ license: GetPlayerIdentifier(id)?.replace('license:', ''), serverID: id });
   }

   const { data } = await axios.post(`${URL}/admin/getData`, { license, players });

   if (data && data.adminRole !== 'support') {
      emitNet(
         'NewStart_Admin:openUI-client', source, 
         JSON.stringify({ ...data, general: [
            { name: 'doubleLevel', isActive: admins.doubleLevel.isActive },
            { name: 'comfort', isActive: admins.comfort.isActive }
         ] })
      );
   }
}, false);

// ---
RegisterCommand('closeServer', _=> { // test with other players
   emitNet('NewStart_Admin:methods-client', -1, 'addBigAds', 'closeServer');
}, true);

// --- Add a player to a faction
RegisterCommand('faction', async (source, arr) => {
   const license = licenseEncrypt(source);
   const admin = (await axios.get(`${URL}/users/${license}?filter=adminRole`)).data;

   if (!['founder', 'adminplus', 'admin', 'supervisorplus', 'supervisor'].includes(admin?.adminRole)) {
      return emitNet('NewStart_Admin:methods-client', source, 'console', "You don't have the permissions!");
   }

   const { data } = await axios.put(`${URL}/admin/commend`, { license, type: 'faction', id: arr[0], customID: arr[1] });

   if (data.error) {
      return emitNet('NewStart_Admin:methods-client', source, 'console', data.error);
   }

   let playerLicense = null, playerID = null;
   
   for (let id of getPlayers()) {
      const licenseOther = GetPlayerIdentifier(id)?.replace('license:', '');

      if (licenseOther === data.license) {
         playerLicense = licenseOther;
         playerID = id;
         break;
      }
   }

   if (!playerLicense) {
      return emitNet('NewStart_Admin:methods-client', source, 'console', 'Player is offline.');
   }

   emit('NewStart_Factions:join-server', arr[0], playerID);
   emitNet('NewStart_Notifications:showAttention-client', playerID, 'success', `لقد انضممت إلي ${data.factionName}.`);
   emitNet('NewStart_Admin:methods-client', source, 'console', 'Successfully Done.');

   await axios.post( `${URL}/other/discord_log`, { 
      type: 'normal', isLog: true, license, channel: admins.channelPlayer, 
      message: `"بتعيين" ← صاحب المعرف (${arr[1]}) في ${data.factionName}`
   });
}, false);

// --- Unban players
RegisterCommand('unban', async (source, arr) => {
   const license = arr[1] || licenseEncrypt(source);
   const admin = (await axios.get(`${URL}/users/${license}?filter=adminRole`)).data;

   if (!['founder', 'adminplus', 'admin'].includes(admin?.adminRole)) {
      return emitNet('NewStart_Admin:methods-client', source, 'console', "You don't have the permissions!");
   }
   
   const { data } = await axios.post(`${URL}/admin/ban`, { license, customID: arr[0] });
   let text = "The player's ban is removed if he has it.";

   if (data.error) {
      text = data.error;

   } else {
      await axios.post( `${URL}/other/discord_log`, { 
         type: 'normal', isLog: true, license, channel: admins.channelPlayer, 
         message: `"بفك حظر" ← (${data.player.customID}) ${data.player.character.identifier.name}`
      });
   }
   
   if (source) emitNet('NewStart_Admin:methods-client', source, 'console', text);
}, false);

// ---
RegisterCommand('revive', async (source, arr) => {
   const license = licenseEncrypt(source);
   const admin = (await axios.get(`${URL}/users/${license}?filter=adminRole`)).data;

   if (!['founder', 'adminplus', 'admin', 'supervisorplus', 'supervisor'].includes(admin?.adminRole)) {
      return emitNet('NewStart_Admin:methods-client', source, 'console', "You don't have the permissions!");
   }

   const { data } = await axios.put(`${URL}/admin/commend`, { license, type: 'revive', customID: arr[0] });
   let text = '';

   if (data.error) return emitNet('NewStart_Admin:methods-client', source, 'console', data.error);
   const playerID = getPlayerIdFromGame(data.player.license);

   if (playerID) {
      emit('NewStart_DeathCounter:revivePlayer-server', playerID);
      removeFromDeadList(playerID);

      text = 'The player has been revived.';

      await axios.post( `${URL}/other/discord_log`, { 
         type: 'normal', isLog: true, license, channel: admins.channelPlayer, 
         message: `"بإحياء" ← (${data.player.customID}) ${data.player.character.identifier.name}`
      });

   } else {
      text = 'Player is offline.';
   }

   emitNet('NewStart_Admin:methods-client', source, 'console', text);
}, false);

// ---
RegisterCommand('handcuff', async (source, arr) => {
   const license = licenseEncrypt(source);
   const admin = (await axios.get(`${URL}/users/${license}?filter=adminRole`)).data;

   if (!['founder', 'adminplus', 'admin', 'supervisorplus', 'supervisor'].includes(admin?.adminRole)) {
      return emitNet('NewStart_Admin:methods-client', source, 'console', "You don't have the permissions!");
   }
   
   const { data } = await axios.put(`${URL}/admin/commend`, { license, type: 'handcuff', customID: arr[0] });
   let text = '';

   if (data.error) return emitNet('NewStart_Admin:methods-client', source, 'console', data.error);
   const playerID = getPlayerIdFromGame(data.player.license);

   if (playerID) {
      emitNet('NewStart_Inspection:handcuff-client', playerID, true);
      text = "The player's handcuffs were removed if he was.";

      await axios.post( `${URL}/other/discord_log`, { 
         type: 'normal', isLog: true, license, channel: admins.channelPlayer, 
         message: `"بفك كلبشة" ← (${data.player.customID}) ${data.player.character.identifier.name}`
      });

   } else {
      text = 'Player is offline.';
   }

   emitNet('NewStart_Admin:methods-client', source, 'console', text);
}, false);

// ---
RegisterCommand('unjail', async (source, arr) => {
   const license = licenseEncrypt(source);
   const admin = (await axios.get(`${URL}/users/${license}?filter=adminRole`)).data;

   if (!['founder', 'adminplus', 'admin', 'supervisorplus', 'supervisor'].includes(admin?.adminRole)) {
      return emitNet('NewStart_Admin:methods-client', source, 'console', "You don't have the permissions!");
   }
   
   const { data } = await axios.put(`${URL}/admin/commend`, { license, type: 'unjail', customID: arr[0] });

   if (data.error) return emitNet('NewStart_Admin:methods-client', source, 'console', data.error);
   const playerID = getPlayerIdFromGame(data.player.license);

   if (playerID) {
      emitNet('NewStart_Police:handleGeneral-client', playerID, 'startJail', JSON.stringify({ isEnd: true }));

      await axios.post( `${URL}/other/discord_log`, { 
         type: 'normal', isLog: true, license, channel: admins.channelPlayer, 
         message: `"بإلغاء سجن" ← (${data.player.customID}) ${data.player.character.identifier.name}`
      });

      emitNet('NewStart_Notifications:showAttention-client', playerID, 'success', `تم إخراجك من السجن من قبل إدارة الخادم نعتذر لك.`);
   }

   emitNet('NewStart_Admin:methods-client', source, 'console', 'The player was successfully released from jail.');
}, false);