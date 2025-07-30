/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Petrol:saveDate-server', async data => { 
   data = JSON.parse(data);
   const license = licenseEncrypt(source);
   
   await axios.put(`${URL}/vehicles`, { license, fuel: data.fuel, plate: data.plate });
});