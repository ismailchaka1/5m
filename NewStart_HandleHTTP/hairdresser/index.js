/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Hairdresser:payment-server', data => {
   data = JSON.parse(data);
   const license = licenseEncrypt(source);

   axios.put(`${URL}/users/${license}?characterPed=true`, { character: { ped: data.ped } });
   emit('NewStart:moneyDecrease', { name: data.name, price: data.price, from: data.from }, source);
});