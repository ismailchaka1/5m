/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_PoliceTools:handleGeneral-server', async (type, info) => {
   if (type === 'ktackle') {
      emitNet('NewStart_PoliceTools:handleGeneral-client', info, type, source);

   } else if (type === 'taboosLog' || type === 'inventoryLog') {
      factionSendLog(type, JSON.parse(info), licenseEncrypt(source));

   } else if (type === 'gift') {
      await axios.post( `${URL}/other/discord_log`, { 
         type: 'normal', isLog: true, license: licenseEncrypt(source), channel: 'gift-log', 
         message: '← بالحصول على مكافأة الوظائف المعتمدة'
      });
   }
});

// ---
on('playerJoining', id => {
   emitNet('NewStart_Police:handleOther-client', id, 'addVehWanted', JSON.stringify(policeData.vehWanted));
});

// ---
on('playerDropped', async () => { 
   const currentID = source;
   const license = licenseEncrypt(currentID);
   const data = (await axios.get(`${URL}/users/${license}?filter=job.key`)).data;

   if (data.job?.key) {
      const playerRef = factions[data.job.key].refPlayers.find(p => p.user.license === license);

      if (playerRef) {
         const arr = [...factionsParts[data.job.key]];

         for (let item of arr) {
            const index = item.refs?.findIndex(i => i.id === playerRef.code);

            if (index >= 0) { item.refs.splice(index, 1); break; } 
            else if (item.refID === playerRef.code) { item.refID = ''; break; }
         }
         emit('NewStart_Factions:general-server', JSON.stringify({ type: 'parts', key: data.job.key, items: arr }), currentID, license);
      }
   }
});

// ---
setInterval(() => {
   for (const key in factions) {
      if (factions[key].id) emit('NewStart_Factions:initial-server', factions[key].id); 
   }

   emitNet('NewStart_PoliceTools:handleGeneral-client', -1, 'setFactionsData', JSON.stringify(factions));
}, 10000);