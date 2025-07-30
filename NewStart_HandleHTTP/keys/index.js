/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Keys:handleGeneral-server', async (type, info) => {
   info = JSON.parse(info);
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (type === 'changeLocks') {
      const { data } = await axios.put(`${URL}/other/changeLocks`, { license, ...info });
      
      for (let playerID of getPlayers()) {
         const playerLic = GetPlayerIdentifier(playerID)?.replace('license:', '');

         if (data.includes(playerLic)) {
            const { items } = (await axios.get(`${URL}/inventories?type=main&license=${playerLic}`)).data; 
            emitNet('NewStart_Inventory:update-client', playerID, 'currentItems', JSON.stringify(items));
         }
      }
   }
});