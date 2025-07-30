/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_CharacterCreator:dataSave-server', async data => {
   data = JSON.parse(data);
   const currentID = source;
   const license = licenseEncrypt(currentID);

   SetPlayerRoutingBucket(currentID, 0);

   const res = await axios.put(`${URL}/users/${license}`, {
      character: data.character,
      location: { name: 'Los Santos International Airport', position: data.spawn }
   });

   const phone = (await axios.post(`${URL}/phone/newPhone/${license}`)).data;
   if (typeof phone === 'object') phone.features.name = data.character.identifier.name;
   
   emitNet('NewStart_CharacterCreator:firstAddInventory-client', currentID, JSON.stringify({ phone }));
   emitNet(
      'NewStart_MainMenu:addToAds-client', -1, 
      { type: 'login', from: 'النظام', text: `${data.character.identifier.name} (${res.data.customID}) لاعب جديد` }
   );

   joinPlayer({ serverID: currentID, customID: res.data.customID, name: data.character.identifier.name, adminRole: res.data.adminRole });
});