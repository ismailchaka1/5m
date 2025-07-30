/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Clothes:payment-server', data => {
   data = JSON.parse(data);

   const license = licenseEncrypt(source);
   axios.put(`${URL}/users/${license}?characterOutfit=true`, { character: { outfit: data.outfit, textures: data.textures } });

   if (data.price) {
      emit('NewStart:moneyDecrease', { price: data.price, from: data.from, name: data.name }, source);
   }
});

// ---
onNet('NewStart_Clothes:saveOutfit-server', async data => {
   data = JSON.parse(data);
   
   const license = licenseEncrypt(source);
   await axios.post(`${URL}/outfits/${license}`, data);
});