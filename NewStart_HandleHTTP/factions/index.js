/* ``````````` ## Development By el8rbawY ## ```````````*/
const translate = { official: 'الوظيفة' };

// ---
onNet('NewStart_Factions:initial-server', async (id, sourceID, lic) => { // and edit in initialize
   const currentID = source || sourceID;
   const license = lic || (currentID ? GetPlayerIdentifier(currentID)?.replace('license:', '') : null);
   const { data } = await axios.get(`${URL}/factions/${id}?license=${license}`);
   const currentPlayers = getPlayers().map(p => ({ id: p, license: GetPlayerIdentifier(p)?.replace('license:', '') }));
   const find = data.players.find(item => item.user.license === license);

   if (find) find.isCurrent = true;

   data.players = data.players.map(item => {
      const ref = currentPlayers.find(p => p.license === item.user.license);
      const serverID = ref?.id ? parseInt(ref.id) : null;

      return { 
         ...item, serverID,
         status: !ref && item.status !== 'vacation' ? 'offline' : item.status,
         coords: serverID ? GetEntityCoords(GetPlayerPed(serverID)) : null,
         login: factions[data.key].refPlayers.find(i => i.user.license === item.user.license)?.login
      };
   });

   factions[data.key].id = data._id;
   factions[data.key].refPlayers = data.players.map(p => ({ ...p, key: data.key }));
   if (find) data.salary = factions[data.key].salaryCalc(data.ranks.length - 1, find.rankID);

   if (find && currentID) {
      emitNet('NewStart_Factions:initial-client', currentID, JSON.stringify({ type: 'main', faction: data }));
   }
});

// ---
onNet('NewStart_Factions:general-server', async (info, playerID, lic) => {
   info = JSON.parse(info);
   const currentID = playerID || source;
   const license = lic || licenseEncrypt(currentID);
   
   if (info.type === 'ranks') { // ranks
      await axios.put(`${URL}/factions`, { license, ...info });

   } else if (info.type === 'salary') { // salary
      emitNet('NewStart_Factions:update-client', currentID, 'salary', { 
         name: 'راتب الوظيفة', isReceive: true,
         amount: factions[info.key].salaryCalc(factions[info.key].ranks.length - 1, info.rankID),
         level: factions[info.key].levelCalc(factions[info.key].ranks.length - 1, info.rankID),
      });
      emitNet(
         'NewStart_MainMenu:addToAds-client', currentID,
         { type: 'faction', from: 'الوظيفة', text: 'لقد بدأ توزيع الرواتب على جميع الموظفين' }
      );

   } else if (info.type === 'parts') { // parts
      if (!info.items?.length) return;
      factionsParts[info.key] = info.items;

      for (let item of factions[info.key].refPlayers.filter(p => p.serverID)) {
         emitNet('NewStart_Police:handleParts-client', item.serverID, 'setData', JSON.stringify(factionsParts[info.key]), currentID);
      }

      if (info.items.some(i => i.refID || i.refs?.length)) {
         partsBuildDiscordMessage(info.key, license, factionsParts[info.key]);
      }
      
   } else if (info.type === 'codes') { // codes
      const user = (await axios.get(`${URL}/users/${license}?filter=customID,character.identifier.name,job.key`)).data;

      await axios.put(`${URL}/factions`, { license, ...info });
      emit('NewStart_Factions:initial-server', info.id, null, license);

      await axios.post( `${URL}/other/discord_log`, { 
         type: 'custom', 
         license, channel: factions[user.job.key].controlID, 
         message: `قام (${user.customID}) ${user.character.identifier.name} باستخدام زر ترتيب أكواد الموظفين`
      });

   } else { // vehicle - status
      await axios.put(`${URL}/factions/more`, { license, ...info });

      if (info.type === 'status') {
         for (let item of factions[info.key].refPlayers.filter(p => p.serverID)) {
            emitNet('NewStart_Factions:update-client', item.serverID, 'refresh');
         }
      }
   }
});

// ---
onNet('NewStart_Factions:join-server', async (factionID, isAdmin, lic, rankID) => {
   let currentID = source || isAdmin;

   const license = lic || licenseEncrypt(currentID);
   const info = { license, factionID };

   if (isAdmin) info.rankID = 0;
   else if (Number.isInteger(rankID)) info.rankID = rankID;

   const { data } = await axios.post(`${URL}/factions/join`, info);

   for (let id of getPlayers()) {
      const licenseOther = GetPlayerIdentifier(id)?.replace('license:', '');
      const item = data.faction.players.find(p => p.user.license === licenseOther);

      if (item) {
         if (license !== item.user.license) {
            emitNet('NewStart_Factions:update-client', id, 'refresh');

         } else if (licenseOther === license) {
            emitNet('NewStart_Mechanical:handleGeneral-client', id, 'quit');
            emitNet('NewStart_Jobs:currentUpdate-client', id, null, true);

            if (!currentID) currentID = id;
            item.isCurrent = true;
         }

         if (!isAdmin) {
            emitNet('NewStart_MainMenu:addToAds-client', id, { 
               type: 'faction', 
               from: translate[data.faction.type], 
               text: `لقد انضم "${data.user.user.character.identifier.name}" إلي ${ data.faction.name }` 
            });
         }
      }
   }

   if (currentID) {
      emitNet('NewStart_Factions:initial-client', currentID, JSON.stringify({ type: 'main', faction: data.faction, other: { vehicles: data.factionVehicles }}));
      emit('NewStart_Factions:initial-server', data.faction._id, currentID);
      emitNet('NewStart_Police:handleParts-client', currentID, 'setData', JSON.stringify(factionsParts[data.faction.key]));

   } else {
      await axios.put(`${URL}/users/${license}`, { job2: {}});
   }

	factions[data.faction.key].ranks = data.faction.ranks;
});

// ---
onNet('NewStart_Factions:userUpdate-server', async (info, lic) => {
   const currentID = source;
   const license = lic || licenseEncrypt(currentID);

   const { data } = await axios.put(`${URL}/factions/user`, { license, ...info });
   if (info.type === 'code') emit('NewStart_Factions:initial-server', info.id, null, license);
   if (info.type === 'time' || info.type === 'code') return;

   for (let id of getPlayers()) {
      if (id < 1) return;
      const licenseOther = GetPlayerIdentifier(id)?.replace('license:', '');

      if (info.type === 'vacation') {
         if (data.license === licenseOther) {
            emitNet('NewStart_Factions:update-client', id, 'vacation', { isReset: !!info.isReset });
            
         } else if (factions[info.key].refPlayers.some(p => p.user.license === licenseOther)) {
            emitNet('NewStart_Factions:update-client', id, 'refresh');
         }

      } else if (info.type === 'promotion') {         
         if (data.user.license === licenseOther) {
            emitNet('NewStart_Factions:update-client', id, 'promotion', { customID: info.customID, rankID: info.rankID });
            emit('NewStart_Factions:initial-server', data.faction._id, null, license);
         }
         
         if (data.faction.players.some(p => p.user.license === licenseOther)) {
            emitNet(
               'NewStart_MainMenu:addToAds-client', id,
               { 
                  type: 'faction', 
                  from: translate[data.faction.type], 
                  text: data.user.isUp ? 
                     `تم ترقية "${data.user.name}" إلي ${data.user.rank}` : 
                     `تم خفض رتبة "${data.user.name}" إلي ${data.user.rank}`
               }
            );
         }

      } else { // invite
         if (data.notExist) {
            emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'اللاعب غير متواجد تأكد من المعرف.');
            break;
            
         } else if (licenseOther === data.license) {
            if (data.isInJob) {
               emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', `اللاعب (${info.customID}) في وظيفة أخرى لا يمكن دعوته.`);
               break;
            }
            
            emitNet('NewStart_Notifications:showAttention-client', currentID, 'success', 'لقد تم إرسال الدعوة بنجاح.');
            emitNet('NewStart_Factions:update-client', id, 'inviteReceive', { id: info.id, name: data.name });
            break;
         }
      }
   }

   if (info.type === 'vacation') {
      const user = (await axios.get(`${URL}/users/${license}?filter=customID,character.identifier.name`)).data;

      await axios.post( `${URL}/other/discord_log`, { 
         type: 'custom', 
         license, channel: factions[info.key].controlID, 
         message: `قام (${user.customID}) ${user.character.identifier.name} "${info.isReset ? 'بإنهاء' : 'بإعطاء'} إجازة" ← (${info.customID}) ${info.name}`
      });
   }
});

// ---
onNet('NewStart_Factions:userDelete-server', async (info, lic) => {
   let currentID = source;
   const license = lic || licenseEncrypt(currentID);
   const data = (await axios.delete(`${URL}/factions/user`, { data: { license, ...info } })).data;
   let isRefresh = false;

   for (let id of getPlayers()) {
      const licenseOther = GetPlayerIdentifier(id)?.replace('license:', '');
      
      if (data.license === licenseOther) {
         if (!currentID) currentID = id;
         emitNet('NewStart_Factions:update-client', id, 'quitFaction');
      }

      if (data.faction.players.some(p => p.user.license === licenseOther)) {
         isRefresh = true;
         emitNet('NewStart_Factions:initial-client', currentID, JSON.stringify({ type: 'kick', customID: data.customID }));
         emitNet('NewStart_Factions:update-client', id, 'refresh');
         emitNet(
            'NewStart_MainMenu:addToAds-client', id,
            { type: 'faction', from: translate[data.faction.type], text: `لقد تم إعفاء "${data.playerName}" من جميع المهام` }
         );
      }
   }
});

// ---
on('playerJoining', async id => {
   const license = licenseEncrypt(id);
   const data = (await axios.get(`${URL}/users/${license}?filter=job.key`)).data;

   if (data.job?.key) {      
      for (let item of factions[data.job.key].refPlayers.filter(p => p.serverID)) {
         emitNet('NewStart_Factions:update-client', item.serverID, 'refresh');
      }

      emitNet('NewStart_Police:handleParts-client', id, 'setData', JSON.stringify(factionsParts[data.job.key]));
   }
});