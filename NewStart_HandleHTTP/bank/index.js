/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Bank:initial-server', async (id = source) => { // first load with /phone
   const license = licenseEncrypt(id);
   const { data, end } = (await axios.get(`${URL}/loans/data/${license}`)).data;
   data.violations = (await axios.get(`${URL}/police?license=${license}&type=violations`)).data;

   if (end) {
      if (end.type === 'vehicle') {
         emitNet('NewStart_VehicleSystem:removePrivate-client', id, JSON.stringify([end.id]), true);

      } else { // house
         const data = await officeData(license);

         emitNet('NewStart_RealEstate:handleOffice-client', id, JSON.stringify(data));
         emitNet('NewStart_RealEstate:handleOffice-client', -1, JSON.stringify({ type: 'owned', code: end.code, value: false }));
         if (end.vehicles.length) emitNet('NewStart_VehicleSystem:removePrivate-client', id, JSON.stringify(end.vehicles), true);
      }

      emitNet(
         'NewStart_Phone:receiveMessage-client', id,
         JSON.stringify({ number: '-1', text: `يؤسفنا إبلاغك بأنه تم سحب "${end.name}" لعدم سداد كامل قيمة القرض.` })
      );
   }

   data.violations = data.violations.map(v => ({ ...v, model: 'police', from: v.from.includes('P') ? 'الأمن العام' : 'أمن المنشآت' }));

   data.warranties = [
      ...data.warranties.vehicles.map(obj => {
         const price = dealership.vehicles.find(v => v.hash === obj.hash).price / bankData.priceDivision;
         const interest = ((bankData.loanRatio / 100) * price) + price;
   
         return { _id: obj._id, type: 'vehicle', name: obj.name, reference: obj.hash, price, interest, end: getLoanEnd(price) }; 
      }),
      ...data.warranties.houses.map(obj => {
         const find = realEstate.items.find(v => v.code === obj.code);
         const price = find.price / bankData.priceDivision;
         const interest = ((bankData.loanRatio / 100) * price) + price;
   
         return { _id: obj._id, type: 'house', name: find.name, price, reference: obj.code, interest, end: getLoanEnd(price) }; 
      })
   ].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

   // send data
   emitNet('NewStart_Bank:initial-client', id, JSON.stringify(data));
});

// ---
onNet('NewStart_Bank:handleLoan-server', async info => {
   info = JSON.parse(info);
   const currentID = source;
   const license = licenseEncrypt(currentID);

   if (info.action === 'request') {
      let data = { item: info.id, type: info.itemType, name: info.name };
      
      if (info.itemType === 'vehicle') {
         data.price = dealership.vehicles.find(v => v.hash === info.reference).price / bankData.priceDivision;

      } else { // house
         data.price = realEstate.items.find(v => v.code === info.reference).price / bankData.priceDivision;
      }

      data.interest = ((bankData.loanRatio / 100) * data.price) + data.price;
      data.end = getLoanEnd(data.price);

      const loan = (await axios.post(`${URL}/loans/${license}`, data)).data;
      emitNet('NewStart_Bank:handleLoan-client', currentID, 'addToHistory', JSON.stringify(loan));

   } else if (info.action === 'payment') {
      const loan = (await axios.get(`${URL}/loans?license=${license}&byID=${info.ref.id}`)).data;
      emitNet('NewStart_Bank:handleLoan-client', currentID, 'payment', JSON.stringify({ id: loan.id, interest: loan.interest }));

   } else { // doneStatus
      await axios.put(`${URL}/loans/${license}`, { type: 'doneStatus', id: info.id });
      emitNet('NewStart_Bank:handleLoan-client', currentID, 'doneStatus', JSON.stringify({ id: info.id }));
   }
});