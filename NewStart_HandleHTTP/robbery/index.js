/* ``````````` ## Development By el8rbawY ## ```````````*/
const JOIN_ROBBERY = 'للانضمام للسرقة اضغط E أو ث.';

// ---
onNet('NewStart_Robbery:handleGeneral-server', async (type, info, playerID) => {
   const currentID = source || playerID;
   const find = robbery.find(obj => obj.id === info.id);
   let police = find.team.filter(t => t.isPolice);
   let criminals = find.team.filter(t => !t.isPolice);

   if (type === 'starting') {
      if (find.reward.isDone || (find.noLeaderMore && !criminals.length)) {
         return emitNet('NewStart_Robbery:handleGeneral-clinet', currentID, 'joinFailed', JSON.stringify({ by: 'block' }));
      }

      const license = licenseEncrypt(currentID);
      const { data } = await axios.get(`${URL}/users/${license}?filter=customID,character.identifier.name,job.key`);
      const isPolice = ['police', 'facilities'].includes(data.job?.key) && !info.isVacation; 
      const max = isPolice ? find.max.police : find.max.criminals;
      const length = isPolice ? police.length : criminals.length;

      if (length < max && !find.team.some(t => t.serverID === currentID) && !find.isBlock) {
         const isLeader = !isPolice && !criminals.length && !find.noLeaderMore;

         if (!isPolice && isLeader && ([...factions.police.refPlayers, ...factions.facilities.refPlayers].filter(i => i.status === 'in' || i.status === 'out').length) < find.max.available) {
            return emitNet('NewStart_Robbery:handleGeneral-clinet', currentID, 'joinFailed', JSON.stringify({ by: 'available', value: find.max.available }));
         
         } else if (!isPolice) {
            find.criminalsCount += 1;
         }

         find.team.push({ 
            isPolice, isLeader,
            serverID: currentID, 
            customID: data.customID, 
            name: data.character.identifier.name
         });

         const filter = isPolice ? find.team.filter(t => t.isPolice) : find.team.filter(t => !t.isPolice);
         
         if (isLeader) {
            emitNet('NewStart_Robbery:handleMore-clinet', -1, 'setBlips', JSON.stringify({ type: 'entrance', id: find.id, name: find.name, text: JOIN_ROBBERY }));
            emitNet('NewStart_MainMenu:addToAds-client', -1, { type: 'crime', from: 'النظام', text: `عاجل - يتم سرقة ${find.name} الآن من قبل مسلحين` });
            find.time.start = Date.now();
            find.noLeaderMore = true;

            // Globle Reset
            setTimeout(_=> {               
               emitNet('NewStart_Robbery:handleGeneral-clinet', -1, 'reset', JSON.stringify({ id: find.id, lull: find.time.lull }));

               if (!find.reward.police.isNo) {
                  const filter = find.team.filter(t => t.isPolice);

                  for (let item of filter) {
                     emitNet('NewStart_Robbery:handleGeneral-clinet', item.serverID, 'reward', JSON.stringify({ 
                        isPolice: true, money: parseInt((find.reward.police.money * find.criminalsCount) / filter.length), 
                        exp: parseInt((find.reward.police.exp * find.criminalsCount) / filter.length), 
                     }));
                  }
               }
               find.noLeaderMore = false;
               find.isBlock = false;
               find.reward.isDone = false;
               find.reward.police.isNo = false;
               find.shooting = false; 
               find.team = [];
               find.criminalsCount = 0;
            }, find.time.duration);
         }

         emitNet(
            'NewStart_Robbery:handleGeneral-clinet', currentID, 'setTeam', 
            JSON.stringify({ 
               id: find.id, isLeader, max, 
               type: isPolice ? 'police' : 'criminals', 
               time: { current: find.time.duration - (Date.now() - find.time.start), tickID: 0 }, 
               items: filter 
            })
         );

         for (let item of filter.filter(obj => obj.serverID !== currentID)) {
            emitNet('NewStart_Robbery:handleGeneral-clinet', item.serverID, 'setTeam', JSON.stringify({ items: filter }));
         }

      } else {
         emitNet('NewStart_Robbery:handleGeneral-clinet', currentID, 'joinFailed', JSON.stringify({ by: 'full' }));
      }

   } else if (type === 'openBankSafe') {
      emitNet('NewStart_Robbery:handleMore-clinet', -1, 'openBankSafe', JSON.stringify({ id: find.id }));

   } else if (type === 'isBlock') {
      find.isBlock = true;
      emitNet('NewStart_Robbery:handleMore-clinet', -1, 'isBlock', JSON.stringify({ id: find.id }));

   } else if (type === 'isDone') {
      find.reward.isDone = true;
      console.log(criminals);

      for (let item of criminals) {
         emitNet('NewStart_Robbery:handleGeneral-clinet', item.serverID, 'isDone', JSON.stringify({ id: find.id }));
      }

   } else if (type === 'startShooting') {
      if (find.shooting) return;
      const license = licenseEncrypt(currentID);
      const from = (await axios.get(`${URL}/users/${license}?filter=character.identifier.name`)).data.character.identifier.name;
      find.shooting = true;

      emitNet(
         'NewStart_MainMenu:addToAds-client', -1, 
         { type: 'police', from, text: `استنفار امنى في منطقة "${find.name}" يرجئ الابتعاد عن الموقع وعدم الاقتراب حتي زوال الخطر.`}
      );
      emitNet('NewStart_Robbery:handleMore-clinet', -1, 'setBlips', JSON.stringify({ type: 'shooting', id: find.id }));

   } else if (type === 'removeFromTeam') {
      const index = find.team.findIndex(obj => obj.serverID === currentID);
      
      if (index >= 0) {
         const isPolice = find.team[index].isPolice;

         if (info.isReward && find.reward.isDone && !isPolice) {
            find.reward.police.isNo = true;
            emitNet('NewStart_Robbery:handleGeneral-clinet', currentID, 'reward', JSON.stringify(find.reward));
            axios.post(`${URL}/users/favorite?license=${licenseEncrypt(currentID)}&isInc=true`, { crime: 5 });
         }
         
         // remove
         find.team.splice(index, 1);
         const filter = isPolice ? find.team.filter(t => t.isPolice) : find.team.filter(t => !t.isPolice);

         for (let item of filter) {
            emitNet('NewStart_Robbery:handleGeneral-clinet', item.serverID, 'setTeam', JSON.stringify({ items: filter }));
         }
      }
   }
});

// ---
// onNet('NewStart_Robbery:handleGeneral-Other', (type, data) => {
//    if (type === 'reward') {
//       const item = robbery.find(r => r.team.some(t => t.serverID === source));

//       if (item) {
//          const player = item.team.find(t => t.serverID === source);
//          const killerIsPolice = item.team.some(t => t.serverID === data && t.isPolice);
   
//          if (!player.isPolice && killerIsPolice) {
//             emitNet('NewStart_Robbery:handleGeneral-clinet', data, 'reward', JSON.stringify({ isPolice: true, ...item.reward.police }));
//          }
   
//          emit('NewStart_Robbery:handleGeneral-server', 'removeFromTeam', { id: item.id }, source);
//       }
//    }
// });

// ---
on('playerJoining', id => {
   const filterLull = [];
   const filterRun = [];

   for (let item of robbery) {
      const num = item.time.start + item.time.duration + item.time.lull;

      if (!item.noLeaderMore && !item.team.length && item.time.start && num > Date.now()) {
         const lull = num - Date.now();
         if (lull >= 10000) filterLull.push({ id: item.id, lull});

      } else if (item.noLeaderMore) {
         filterRun.push({ id: item.id, shooting: item.shooting, text: JOIN_ROBBERY, isBlock: item.isBlock });
      }
   }

   if (filterLull.length) emitNet('NewStart_Robbery:handleMore-clinet', id, 'setTime', JSON.stringify(filterLull));
   else if (filterRun.length) emitNet('NewStart_Robbery:handleMore-clinet', id, 'setBlips', JSON.stringify(filterRun));
});

// ---
on('playerDropped', () => {
   for (let item of robbery) {
      const index = item.team.findIndex(t => t.serverID === source);

      if (index >= 0) {
         const isPolice = item.team[index].isPolice;
         item.team.splice(index, 1);

         const filter = isPolice ? item.team.filter(t => t.isPolice) : item.team.filter(t => !t.isPolice);
         for (let i of filter) emitNet('NewStart_Robbery:handleGeneral-clinet', i.serverID, 'setTeam', JSON.stringify({ items: filter }));
         break;
      }
   }
});