onNet('NewStart_Business:handleGeneral-server', async (type, info) => {
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (type === 'getCommercial') {
      const data = (await axios.get(`${URL}/business/commercial/${license}`)).data;
      if (data) emitNet('NewStart_Business:handleGeneral-client', currentID, 'setCommercial', JSON.stringify(data));

   } else if (type === 'crateCommercial') {
      const data = (await axios.post(`${URL}/business/${license}`)).data;
      emitNet('NewStart_Business:handleGeneral-client', currentID, 'setCommercial', JSON.stringify(data));

   } else if (type === 'smallStoreLic') {
      const data = (await axios.put(`${URL}/business/${license}`, { type: 'giveLic', info: { type: 'materials', subType: 'small-store', price: info.price }})).data;
      if (data) emitNet('NewStart_Business:handleGeneral-client', currentID, 'setCommercial', JSON.stringify(data));
  
   } else if (type === 'money') {
      const data = (await axios.put(`${URL}/business/${license}`, { type, ...info })).data;

      if (data) {
         if (info.action === 'withdraw' && info.name === 'capital_2') emit('NewStart:giveMoney', { name: 'سحب من رأس المال التجاري', amount: info.value }, false, false, currentID, license);
         emitNet('NewStart_Business:handleGeneral-client', currentID, 'setCommercial', JSON.stringify(data));
      }

   } else if (type === 'changeInfo' || type === 'items') {
      const data = (await axios.put(`${URL}/business/${license}`, { type, info })).data;
      emitNet('NewStart_Business:handleGeneral-client', currentID, 'setCommercial', JSON.stringify(data), type === 'items');

   } else if (type === 'getStoreData') {
      let data = null;

      if (info.type === 'vehicle') {
         const vehicle = (await axios.get(`${URL}/vehicles/${license}?plate=${info.id}&filter=license`)).data.license;
         data = (await axios.get(`${URL}/business/commercial/${vehicle}`)).data;

      } else {
         // TODO
      }

      if (data) { 
         console.log({ name: data.licInfo.name, items: data.licInfo.items, end: data.licInfo.end });
      }
   }
});