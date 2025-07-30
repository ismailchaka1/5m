/* ``````````` ## Development By el8rbawY ## ```````````*/
// const crypto = require('crypto');
const axios = require('axios').default;
const URL = GetConvar('game_api', 'changeme');
const WEB_URL = GetConvar('web_api', 'changeme');
const serverType = GetConvar('serverType', 'changeme');
const Delay = (ms) => new Promise(res => setTimeout(res, ms));

// ---
function licenseEncrypt(source) {
   // const license = GetPlayerIdentifier(source).replace('license:', '');
   // const key = Buffer.from('64152c67551417887518f1ea1c09986c857f2d13ca0989b07de0c6068fc20fc5', 'hex');
   // const iv = Buffer.from('e131389bad329a652651465c9fd8c0bf', 'hex');;
   // const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

   // let encrypted = cipher.update(license, 'utf-8', 'hex');
   // encrypted += cipher.final('hex');

   return GetPlayerIdentifier(source)?.replace('license:', '');
}

// ---
onNet('NewStart:general-server', (type, data) => {
   if (type === 'setBucket') {
      SetPlayerRoutingBucket(source, Number.isInteger(data) ? data : data?.customID || source);

   } else if (type === 'disconnect') {
      DropPlayer(source, data);
   }
});

// ---
onNet('NewStart:moneyDecrease', async (data, playerID = source) => {
   const license = licenseEncrypt(playerID);
   await axios.put(`${URL}/money/${license}`, { ...data, price: parseInt(data.price), playerID });

   emitNet('NewStart_HudSystem:handleGeneral-client', playerID, 'setMoney');
});

// ---
onNet('NewStart:giveMoney', async (data, noPhone, noTax, playerID, lic) => {
	const currentID = source || playerID;
   const license = lic || licenseEncrypt(currentID);
   let loan = null;

   if (!noTax && data.from !== 'cash' && false) {
      loan = (await axios.get(`${URL}/loans?license=${license}&type=checkTax`)).data;
   }

   data.amount = parseInt(data.amount);
   await axios.post(`${URL}/money/give`, { license, ...data, amount: data.amount });
   
	if (!noPhone && currentID) {
      emitNet('NewStart_Phone:bank-client', currentID, 'receive', { ...data, from: 'bank', type: 'receive' });
   }

   if (loan && !noTax) {
      const rival = (bankData.tax / 100) * data.amount;
      let interest = loan.interest - rival, price = 0;
      data.amount -= rival;

      if (interest < 0) {
         const difference = rival - loan.interest;

         data.amount += difference;
         interest = 0;
         price = loan.interest;

      } else {
         price = rival;
      }

      const log = (await axios.put(`${URL}/money/${license}`, { name: 'البنك الوطني', price, from: 'bank', playerID: currentID })).data;
      await axios.put(`${URL}/loans/${license}`, { id: loan.id, interest });

      if (currentID) emitNet('NewStart_Bank:handleBalance-client', currentID, 'decrease', JSON.stringify({ loan: { id: loan.id, interest }, log }));
      if (!interest && currentID) emitNet('NewStart_Bank:handleLoan-client', currentID, 'doneStatus', JSON.stringify({ id: loan.id }));
   }

   if (currentID) emitNet('NewStart_HudSystem:handleGeneral-client', currentID, 'setMoney');

   if (data.amount >= anticheat.maxMoneyLog) {
      await axios.post( `${URL}/other/discord_log`, { 
         type: 'normal', isLog: true,
         license, channel: 'money-log', 
         message: `بالحصول على مبلغ مالي\nالمبلغ: $${data.amount.toLocaleString()}\nالجهة: ${data.name}\n`
      });
   }
});

// ---
onNet('NewStart:updateUser', async (data, isInc) => {
   const license = licenseEncrypt(source);
	await axios.put(`${URL}/users/${license}?isInc=${!!isInc}`, data);

   if (data['mode.level'] > anticheat.maxExpLog) {
      await axios.post( `${URL}/other/discord_log`, { 
         type: 'normal', isLog: true,
         license, channel: 'level-log', 
         message: `بالحصول ← على ${data['mode.level'].toLocaleString()} خبرة`
      });
   }
});