/* ``````````` ## Development By el8rbawY ## ```````````*/
const fs = require('fs');
const path = require('path');
const __dirname = path.resolve();
const inventory = JSON.parse(fs.readFileSync(`${__dirname}/resources/NewStart_HTTP/services/static/items.json`, 'utf8'));

// ---
onNet('NewStart_Inventory:handleGeneral-server', async (type, info) => {
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (type === 'editItem') {
      await axios.put(`${URL}/inventories/edit`, { ...info, license })
   }
});

// ---
onNet('NewStart_Inventory:getItemsOther-server', async (data, currentID) => {
   data = JSON.parse(data);
   if (!currentID) currentID = source;
   const license = GetPlayerIdentifier(currentID).replace('license:', '');
   let response;

   if (data.type === 'house') {
      response = (await axios.get(`${URL}/inventories?id=${data.id}&type=${data.type}&license=${license}`)).data;

   } else if (data.type === 'faction') {
      response = (await axios.get(`${URL}/inventories?license=${license}&type=${data.type}&jobID=${data.otherID}&hash=${data.id}`)).data;
      response.maxKG = dealership.vehicles.find(obj => obj.hash === response.hash).maxKG;

   } else if (data.type === 'vehicle') {
      response = (await axios.get(`${URL}/inventories?id=${data.id}&license=${license}&type=${data.type}`)).data;
      response.maxKG = dealership.vehicles.find(obj => obj.hash === response.hash).maxKG;

   } else { // jobVehicle
      response = (await axios.get(`${URL}/inventories?id=${data.id}&license=${license}&otherID=${data.otherID}&type=${data.type}`)).data;
   }

   if (data.type === 'house') {
      const find = realEstate.items.find(i => i.code === data.id);
      const type = find.garageType || find.coord.type;

      response.maxKG = realEstate.houses[type]?.maxKG || realEstate.garages[type].maxKG;

   } else if (data.type === 'jobVehicle') {
      const find = dealership.vehicles.find(obj => obj.hash === response.hash);
      if (find) response.maxKG = find.maxKG;
   }

   emitNet('NewStart_Inventory:update-client', currentID, 'getItemsOther', JSON.stringify(response));
});

// ---
onNet('NewStart_Inventory:addItem-server', async data => {
   data = JSON.parse(data);
   const currentID = source;
   const license = licenseEncrypt(currentID);

   const items = (await axios.post(`${URL}/inventories/${license}`, data)).data;
   emitNet('NewStart_Inventory:update-client', currentID, 'currentItems', JSON.stringify(items));

   const find = inventory.find(i => i.id === data.id);

   if (find.isLog && (data.id === 106 ? data.count >= anticheat.maxMoneyRedLog : true)) {
      await axios.post( `${URL}/other/discord_log`, { 
         type: 'normal', isLog: true,
         license, channel: 'inventory-log', 
         message: `بالحصول ← على "${find.title}" بكمية ${data.count.toLocaleString()}`
      });
   }
});

// ---
onNet('NewStart_Inventory:useItem-server', async data => {
   data = JSON.parse(data);
   const currentID = source;
   const license = licenseEncrypt(currentID);

   const items = (await axios.put(`${URL}/inventories`, { ...data, license })).data;
   emitNet('NewStart_Inventory:update-client', currentID, 'currentItems', JSON.stringify(items));
});

// ---
onNet('NewStart_Inventory:transfer-server', async data => {
   data = JSON.parse(data);
   const currentID = source;
   const license = licenseEncrypt(currentID);

   try {
      const response = (await axios.put(`${URL}/inventories/transfer`, { ...data, license })).data;
      emitNet('NewStart_Inventory:update-client', currentID, 'currentItems', JSON.stringify(response));

      if (data.other.type === 'player') {
         const itemsOther = (await axios.get(`${URL}/inventories?type=main&license=${data.other.license}`)).data.items;
         emitNet('NewStart_Inventory:update-client', data.other.serverID, 'currentItems', JSON.stringify(itemsOther));

         if (data.item.id === 1) {
            emit('NewStart:moneyDecrease', { name: 'الحقيبة', price: data.item.count, from: 'cash' }, currentID);
            emitNet('NewStart_Inventory:update-client', data.other.serverID, 'addMoney', data.item.count);

            if (data.item.count >= anticheat.maxMoneyLog) {
               await axios.post( `${URL}/other/discord_log`, { 
                  type: 'normal', isLog: true,
                  license, channel: 'money-log', 
                  message: `بإعطاء مبلغ مالي\nالمبلغ: $${data.item.count.toLocaleString()}\nالمستفيد: (${data.other.customID}) ${data.other.name}\n`
               });
            }
         }

         emitNet('NewStart_Tools:handleGeneral-client', data.other.serverID, 'inventory', { id: data.item.id, type: 'add', count: data.item.count });
         emitNet('NewStart_Notifications:showAttention-client', data.other.serverID, 'success', 'قام شخص ما بإعطائك شئ في الحقيبة!');

      } else if (data.from.name === 'main') {
         emit('NewStart_Inventory:getItemsOther-server', JSON.stringify({ type: data.other.type, id: data.other.id, otherID: data.other.otherID }), currentID);
      }

      const find = inventory.find(i => i.id === data.item.id);

      if (find.isLog && (find.id === 106 ? data.item.count >= anticheat.maxMoneyRedLog : true)) {
         const from = data.from.name === 'main' ? 'الحقيبة الخاصة' : `(${data.other.id}) ${data.other.title}`;
         const to = data.from.name === 'other' ? 'الحقيبة الخاصة' : data.other.type === 'player' ? `(${data.other.customID}) ${data.other.name}` : `(${data.other.id}) ${data.other.title}`;

         await axios.post( `${URL}/other/discord_log`, { 
            type: 'normal', isLog: true,
            license, channel: 'transfer-log',
            message: `بتحويل ← "${find.title}" بكمية ${data.item.count.toLocaleString()}\nمن: ${from}\nإلى: ${to}\n`
         });
      }

   } catch (err) {
      emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', 'إحدى العناصر غير متوفرة من الممكن انه تم سحبه من قبل شخص آخر.');
   }
});

// ---
onNet('NewStart_Inventory:removeItem-server', async data => {
   data = JSON.parse(data);
   const currentID = source;
   const license = licenseEncrypt(currentID);
   const items = (await axios.delete(`${URL}/inventories/${license}`, { data })).data;

   if (data.from === 'main' || data.from === 'removeAll') {
      emitNet('NewStart_Inventory:update-client', currentID, 'currentItems', JSON.stringify(items));
   }
});

// ---
onNet('NewStart_Inventory:getPlayers-server', async data => {
   data = JSON.parse(data);
   const currentID = source;
   
   for (let index in data) data[index].license = GetPlayerIdentifier(data[index].serverID).replace('license:', '');
   const response = (await axios.post(`${URL}/users/players`, data)).data;

   for (let index in response) {
      response[index].customID = response[index].info.user.customID;
      response[index].name = response[index].info.user.character.identifier.name;
      response[index].level = response[index].info.user?.mode?.level || 1;
      response[index].weight = response[index].info.weight;

      delete response[index].info;
   }
   emitNet('NewStart_Inventory:update-client', currentID, 'getPlayers', JSON.stringify(response));
});