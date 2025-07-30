/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Plain:handleGeneral-sevrer', async (type, info, playerID) => {
   const currentID = playerID || source;
   const license = licenseEncrypt(currentID);
   let message = '', isHere = false;

   if (type === 'love') { // ban
      const admin = (await axios.get(`${URL}/users/${license}?filter=adminRole`)).data?.adminRole;
      if (admin && ['5', '6', '7', '8', '9', '10', '11'].includes(info)) return;

      const action = { ...anticheat.bans[info] };
      if (action.end) action.end += Date.now(); 

      DropPlayer(currentID, `تم حظرك بسبب: ${action.reason}.`);
      const { data } = await axios.post(`${URL}/admin/ban`, { license, ...action, isAntiCheat: true });

      const end = action.isForever ? 'مدى الحياة' : moment(action.end).format('D/M/YYYY hh:mm:ss');
      message = `تم حظر (${data.customID}) ${data.character.identifier.name}\nالسبب: ${action.reason}\nالمدة: ${end}`+
         `\n\nlicenseID: ${license} - discordID: ${data.discord}`;

   } else if (type === 'gift') { // alert
      const user = (await axios.get(`${URL}/users/${license}?filter=customID,character.identifier.name,discord`)).data;
      isHere = true;

      if (info === 'openGift') {
         message = `تنبيه هناك شك في هذا اللاعب (${(user.customID)}) ${user.character.identifier.name}\nيرجى مراقبته جيدًا`+
         `\n\nlicenseID: ${license} - discordID: ${user.discord}`;
      }

   } else if (type === 'party') { // kill
      const killerLic = licenseEncrypt(info.senderID);
      const player = (await axios.get(`${URL}/users/${license}?filter=customID,character.identifier.name,discord`)).data;

      await axios.post(`${URL}/other/discord_log`, { 
         type: 'normal', isLog: true, license: killerLic, channel: '1124050708765872279', // kills-log
         message: `"بقتل" ← (${player.customID}) ${player.character.identifier.name}\nالسلاح المستخدم: ${anticheat.weapons.find(i => i.id === info.hash)?.name || info.hash}\n`
      });
   }

   if (type !== 'party') await axios.post(`${URL}/other/discord_log`, { type: 'custom', isLog: true, license, channel: anticheat.channel, message, isHere });
});

// ---
setInterval(() => {
   for (let id of getPlayers()) {
      const pedID = GetPlayerPed(id);
      const weapon = GetSelectedPedWeapon(pedID);
      const vehID = GetVehiclePedIsIn(pedID, false);

      if (weapon && !anticheat.weapons.find(i => i.id === weapon)?.isAllow) {
         emitNet('NewStart_Plain:handleGeneral-client', id, 'weapons');

      } else if (vehID && (GetEntitySpeed(vehID) * 3.6) > 500) {
         emit('NewStart_Plain:handleGeneral-sevrer', 'love', '10', id);

      } /* else if (IsPlayerUsingSuperJump(id)) {
         emit('NewStart_Plain:handleGeneral-sevrer', 'love', '6', id);
      }  */
   }
}, 4000);

// ---
on('entityCreated', (id) => {
   const type = GetEntityType(id);

   if (type === 1 && !anticheat.peds.some(i => GetHashKey(i) === GetEntityModel(id))) { // ped
      DeleteEntity(id);

   } /* else if (type === 2) { // vehicle
      DeleteEntity(id);
   } */
});

// ---
on('explosionEvent', (playerID, data) => {
   const license = licenseEncrypt(playerID);
   const find = anticheat.explosions.find(i => i.id === data.explosionType);
   const isBlock = find.id === 0 && robbery.filter(i => i.id.includes('bank')).some(i => i.team.some(t => t.serverID == playerID))

   if (!find.noCancel) {
      CancelEvent();
   }

   if (!isBlock) {
      if (find.isBan) {
         emit('NewStart_Plain:handleGeneral-sevrer', 'love', '3', playerID);
      }
   
      axios.post(`${URL}/other/discord_log`, {
         type: 'normal', isLog: true, license, channel: 'explosions-log',
         message: `"بالتفجير" ← داخل الخادم\nنوع التفجير: ${find.name} (${find.id})\n`
      });
   }
});

// ---
on('playerDropped', async (reason) => {   
   if (reason.includes('Server shutting down') || reason.includes('FIVEGUARD') || new RegExp(/[\u0621-\u064A]/).test(reason)) return;
   const currentID = source;
   const license = licenseEncrypt(currentID);
   const coords = GetEntityCoords(GetPlayerPed(currentID), true);

   if (!coords[0] && !coords[1]) return;

   const isBucket = GetPlayerRoutingBucket(currentID);
   const user = (await axios.get(`${URL}/users/${license}?filter=customID`)).data;

   emitNet('NewStart_Tools:handleGeneral-client', -1, 'disconnect', { type: 'push', info: { customID: user.customID, reason, coords }});
   if (!isBucket) await axios.put(`${URL}/users/${license}`, { location: { name: 'NewStart World', position: { x: coords[0], y: coords[1], z: coords[2] }}});

   await axios.post(`${URL}/other/discord_log`, {
      type: 'normal', isLog: true, license, channel: 'disconnect-log',
      message: `"بالخروج" ← من الخادم\nالسبب: ${reason}\nالوقت الداخلي: ${getTimeTools()}\n`
   });
});