/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Phone:initial-server', async number => {
   const currentID = source;
   const license = licenseEncrypt(currentID);
   const data = { contacts: [] };

   data.contacts = (await axios.get(`${URL}/phone?number=${number}&isInitial=true`)).data.contacts;
   data.tweets = (await axios.get(`${URL}/phone/tweets`)).data;
   data.bank = (await axios.get(`${URL}/money/${license}`)).data;
   emitNet('NewStart_Phone:initial-client', currentID, JSON.stringify(data));
   emit('NewStart_Bank:initial-server', currentID);
});

// ---
onNet('NewStart_Phone:handleGeneral-server', async (type, info) => {
   const currentID = source;

   if (type === 'contact') {
      axios.put(`${URL}/phone?number=${info.number}`, info.save);

   } else if (type === 'mechanical') {
      const { data } = await axios.get(`${URL}/phone?isMechanical=true`);
      emitNet('NewStart_Phone:handleGeneral-client', currentID, 'mechanical', JSON.stringify(data));
   }
});

// ---
onNet('NewStart_Phone:sendData-server', async (type, data) => {
   data = JSON.parse(data);
   let currentID = source, playerID = null;
   const response = (await axios.get(`${URL}/phone?number=${data.to}`)).data?.license;

   if (!response) return;

   for (let id of getPlayers()) {
      const license = GetPlayerIdentifier(id).replace('license:', '');
      if (response === license) { playerID = id; break; }
   }

   if (!playerID) return;
   data.number = data.from;

   if (type === 'requestCall') {
      data.to = playerID;
      data.from = currentID;
      emitNet(`NewStart_Phone:requestCall-client`, currentID, JSON.stringify(data), true);

   } else { // receiveMessage
      const license = licenseEncrypt(currentID);
      const to = (await axios.get(`${URL}/users/${response}?filter=customID,character.identifier.name`)).data;

      delete data.to;
      delete data.from;

      axios.post( `${URL}/other/discord_log`, {
         type: 'normal', isLog: true,
         license, channel: 'phone-log', 
         message: `بإرسال رسالة ← إلى (${to.customID}) ${to.character.identifier.name}\nنص الرسالة: ${data.text}\n`
      });
   }

   emitNet(`NewStart_Phone:${type}-client`, playerID, JSON.stringify(data));
});

// ---
onNet('NewStart_Phone:acceptCall-server', data => {
   const channel = source;

   exports['pma-voice'].setPlayerCall(source, channel);
   exports['pma-voice'].setPlayerCall(data.from, channel);
   emitNet('NewStart_Phone:acceptCall-client', data.from, data);
});

// ---
onNet('NewStart_Phone:hangUp-server', data => {
   if (data) {
      const id = source === data.to ? data.from : data.to;
      emitNet('NewStart_Phone:hangUp-client', id);
   }
});