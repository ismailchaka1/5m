/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Licenses:handleGeneral-server', async (type, info) => {
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (type === 'getRecords') {
      const { data } = await axios.get(`${URL}/police?license=${license}&type=getRecords`);
      emitNet('NewStart_Licenses:handleGeneral-client', currentID, 'setRecords', JSON.stringify(data));

   } else if (type === 'removeRecord') {
      await axios.put(`${URL}/police/${license}`, { type, ...info });

   } else if (type === 'upload') {
      info = JSON.parse(info);
      const data = { image: info.image };

      if (info.type && info.type !== 'identifier') {
         const name = `is${info.type.charAt(0).toUpperCase() + info.type.slice(1)}`;
         data[name] = true;
         emitNet('NewStart_MainMenu:handleGeneral-client', currentID, 'updateUser', { [name]: true });
      }

      await axios.put(`${URL}/police/${license}`, { type: 'set', data });

      const user = (await axios.get(`${URL}/users/${license}?filter=customID,character.identifier`)).data;
      emitNet('NewStart_Licenses:handleGeneral-client', currentID, 'giveCard', JSON.stringify({ type: info.type, user, image: info.image }));

   } else if (type === 'sendCard') {
      for (let id of info.serverIDs) {
         emitNet('NewStart_Licenses:handleGeneral-client', id, 'openCard', JSON.stringify(info.data));
      }

   } else if (type === 'startTest') {
      SetPlayerRoutingBucket(currentID, currentID);
      emitNet('NewStart_Licenses:handleGeneral-client', currentID, type);
   }
});