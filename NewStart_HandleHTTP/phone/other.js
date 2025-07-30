/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Phone:addTweet-server', async (data, withImage) => {
   data = JSON.parse(data);
   const currentID = source;
   const license = licenseEncrypt(currentID);
   data.license = license;

   const response = (await axios.post(`${URL}/phone/tweets`, data)).data;
   delete response.license;

   if (withImage) {
      emitNet('NewStart_Phone:handleTweets-client', currentID, 'imageUpload', { id: response._id, URL: `${WEB_URL}/game/tweets` });
      
   } else { // normal
      response.customID = (await axios.get(`${URL}/users/${license}?filter=customID`)).data.customID;
      emitNet('NewStart_Phone:handleTweets-client', -1, 'addToAds', response);
   }
});

// ---
onNet('NewStart_Phone:handleTweets-server', async (type, info) => {
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (type === 'getTweets') {
      const tweets = (await axios.get(`${URL}/phone/tweets`)).data;
      emitNet('NewStart_Phone:handleTweets-client', -1, 'setTweets', JSON.stringify(tweets));

   } else if (type === 'remove') {
      await axios.delete(`${URL}/phone/tweets`, { data: { _id: info, license } });

   } else { // afterProcess
      info.customID = (await axios.get(`${URL}/users/${license}?filter=customID`)).data.customID;
      emitNet('NewStart_Phone:handleTweets-client', -1, 'addToAds', info);
   }
});

// ---
onNet('NewStart_Phone:vehicles-server', async info => {
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (!info) {
      const data = (await axios.get(`${URL}/vehicles/${license}`)).data;
      emitNet('NewStart_Phone:vehicles-client', currentID, JSON.stringify(data));

   } else {
      emit('NewStart:moneyDecrease', info.money, currentID);

      if (info.plate) {
         await axios.put(`${URL}/vehicles`, { license, fuel: 100, plate: info.plate });
      }
   }
});

// ---
onNet('NewStart_Phone:bank-server', async info => {
   const currentID = source;
   const license = licenseEncrypt(currentID);
   let data, type;

   if (info) {
      type = 'transfer';
      const player = (await axios.get(`${URL}/users/${license}?customID=${info.to}&filter=license,mode.level`)).data;
      let playerID;

      // if (player.mode.level < 6100) { // start level 5
      //    return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'يجب وصول المرسل إليه للمستوى 5 أولاً لإتمام التحويل!');
      // }

      for (let id of getPlayers()) {
         const licenseOther = GetPlayerIdentifier(id)?.replace('license:', '');
         if (licenseOther === player.license) { playerID = id; break; };
      }

      if (!playerID) {
         return emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'لا يمكن الوصول للمتلقي في الوقت الحالي!');
      }

      data = (await axios.post(`${URL}/money/transfer?license=${license}`, info)).data;
      
      if (typeof data === 'object') {
         emitNet('NewStart_Phone:bank-client', playerID, 'receive', data.other.log);
         
         if (info.amount >= anticheat.maxMoneyLog) {
            await axios.post( `${URL}/other/discord_log`, { 
               type: 'normal', isLog: true,
               license, channel: 'money-log', 
               message: `بتحويل مبلغ مالي\nالمبلغ: $${info.amount.toLocaleString()}\nالمستفيد: (${data.other.customID}) ${data.other.name}\n`
            });
         }

         data = data.log;
      }

   } else {
      type = 'getDate';
      data = (await axios.get(`${URL}/money/${license}`)).data;
   }

   if (typeof data === 'object') data = JSON.stringify(data);
   emitNet('NewStart_Phone:bank-client', currentID, type, data);
});

// ---
onNet('NewStart_Phone:EmergencyMessage-server', async info => {
   info = JSON.parse(info);
   const license = licenseEncrypt(source);
   const { data } = await axios.get(`${URL}/phone/emergency?license=${license}&id=${info.to}`);

   if (!data.players.length) return;
   let report = { type: info.type, id: Date.now(), unique: info.unique, details: info.text, location: info.location };

   if (info.type === 'unknown') {
      report.name = info.name;

   } else {
      report = { ...report, name: data.name, phone: info.from }
   }

   for (let id of getPlayers()) {
      const player = GetPlayerIdentifier(id).replace('license:', '');
      const find = data.players.find(obj => obj.user.license === player && obj.status === 'in');
      
      if (find) {
         emitNet('NewStart_Phone:EmergencyMessage-client', id, JSON.stringify(report));
      }
   }
});