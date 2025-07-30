/* ``````````` ## Development By el8rbawY ## ```````````*/
const mechanical = { role: '1121590479339917314', channel: '1138610030829129809' };

// ---
onNet('NewStart_Mechanical:handleGeneral-server', async (type, info) => {
   if (info) info = JSON.parse(info);
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (type === 'apply') {
      const { data } = await axios.get(`${URL}/users/${license}?discordRole=${mechanical.role}`); // ميكانيكي رول
      
      if (data.isHasRole) emitNet('NewStart_Mechanical:handleGeneral-client', currentID, 'apply');
      else emitNet('NewStart_Notifications:showAttention-client', currentID, 'error', `يجب أولاً التقديم عبر النموذج المخصص والحصول على الموافقة!`);

   } else if (type === 'sendAds') {
      const { data } = await axios.get(`${URL}/users/${license}?filter=character.identifier.name`);

      emitNet(
			'NewStart_MainMenu:addToAds-client', -1,
			{ type: 'public', from: 'النظام', text: `قام "${data.character.identifier.name}" بالحصول علي رخصة الميكانيكي` }
		);

   } else if (type === 'getInfo') {
      let ownerID = null;
      const vehicle = (await axios.get(`${URL}/vehicles/${license}?plate=${info.plate}&filter=license`)).data;

      for (let id of getPlayers()) {
         if (vehicle.license === GetPlayerIdentifier(id)?.replace('license:', '')) { ownerID = id; break; }
      }

      if (ownerID) {
         const to = (await axios.get(`${URL}/users/${licenseEncrypt(ownerID)}?filter=customID,character.identifier.name`)).data;
         const from = (await axios.get(`${URL}/users/${license}?filter=customID,character.identifier.name`)).data;

         emitNet('NewStart_Mechanical:handleGeneral-client', currentID, 'setInfo', JSON.stringify({ 
            from : { customID: from.customID, name: from.character.identifier.name },
            to: { ownerID, customID: to.customID, name: to.character.identifier.name }
         }));
      }

   } else if (type === 'sendInvoice') {
      const to = (await axios.get(`${URL}/users/${licenseEncrypt(info.ownerID)}?filter=customID,character.identifier.name`)).data;
      const from = (await axios.get(`${URL}/users/${license}?filter=customID,character.identifier.name`)).data;

      emitNet('NewStart_Mechanical:handleGeneral-client', info.ownerID, 'receiveInvoice', JSON.stringify({
         ...info, ownerID: currentID,
         from : { customID: from.customID, name: from.character.identifier.name },
         to: { customID: to.customID, name: to.character.identifier.name }
      }));

   } else if (type === 'acceptInvoice') {
      emitNet('NewStart_Mechanical:handleGeneral-client', info.playerID, 'saveChanges', JSON.stringify({ ref: info.ref, price: info.price }));
      
   } else if (type === 'cancelInvoice') {
      emitNet(
         'NewStart_Mechanical:handleGeneral-client', info.playerID, 'cancelInvoice', 
         JSON.stringify({ ref: info.ref, fromMechanical: info.fromMechanical })
      );

   } else if (type === 'waiver') {
      await axios.delete(`${URL}/users/${license}`, { data: { discordRole: mechanical.role }});

   } else if (type === 'sendLog') {
      const vehicle = (await axios.get(`${URL}/vehicles/${license}?plate=${info.plate}&filter=license,hash,name`)).data;
      const user = (await axios.get(`${URL}/users/${vehicle.license}?filter=customID,character.identifier.name`)).data;
      const owner = vehicle.license !== license ? `المالك: (${user.customID}) ${user.character.identifier.name}\n` : '';
      const type = { car: 'سيارة', truck: 'شاحنة', boat: 'قارب', motorcycle: 'دراجة' }[dealership.vehicles.find(i => i.hash === vehicle.hash).vehType];

      await axios.post(`${URL}/other/discord_log`, { 
         type: 'normal', license, channel: mechanical.channel, noShowLicense: true,
         message: `"بإجراء تعديلات" ← على مركبة${vehicle.license === license ? ' خاصة به' : ' لعميل'}\n\n${owner}\nالمركبة:${vehicle.name}\nاللوحة: ${info.plate}\nالنوع: ${type}\nالفاتورة: ${info.price ? '$'+info.price.toLocaleString() : 'لا يوجد'}\n\n${info.changes.join('\n')}\n`
      });
   }
});