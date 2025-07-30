const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const auth = require('../../middlewares/auth');
const { User } = require('../../models/user');
const { Vip } = require('../../models/vip');
const { Police } = require('../../models/police');
const items = require('../../services/static/store.json');
const { environment, webURL, getPlayerIDfromGame } = require('../../services/config');
const DISCORD_BOT = require('../../discord'); 
const DISCORD_Log = require('../../discord/logs'); 

// ---
const base = {
   main: {
      url: 'https://api-m.paypal.com',
      clientID: 'Ab958FGxD2rKihsEyXdKkJdywTa9zm7ePKwyF-3LWM7zcUCODpV_8PpqBA7SxVyRZBAoj-bvt0WAEZxj',
      secretID: 'EPf2SgzAUuXvzqbtP0FWprrRbSKNy2-KFvppPy-qZ4nao2dV6Q0I7pt1dZqRsAyCci9wukdx-F5TN0y4'
   },
   test: {
      url: 'https://api-m.sandbox.paypal.com',
      clientID: 'AeTYGz3Z6USjjW1ynOFUkwtsPviYEsME5yt-rZu-Qx6viYFVnWDcp2RR6brFQmC1NIItd6WLZcQniGKy',
      secretID: 'EOjA57I-owsxYflPuPmo6MRsYmUykIyZA0d-csDLnga2ME-qi1mbHuaRL4fs3lOkLlM-MCi4DossD-f7'
   }
}[environment]; 

// ---
router.get('/', async (_, res) => {
   try {
      const products = items.map(({ features, description, ...other }) => ({ ...other }));
      let supporters = await Vip.find({ lastPurchase: { $lte: new Date() }}).sort({ lastPurchase: -1 }).limit(4).select('-_id license lastPurchase');
      
      if (supporters.length) {
         const query = { license: { $in: supporters.map(i => i.license) }};
         const images = JSON.parse(JSON.stringify(await Police.find(query).select('_id license'))).map(i => ({ ...i, image: `${webURL}/game/photo?model=police&id=${i._id}&date=${Date.now()}` }));
         const users = JSON.parse(JSON.stringify(await User.find(query).select('-_id license customID character.identifier.name')));

         supporters = users.map(({ license, character, ...other }) => ({ 
            ...other, 
            name: character.identifier.name, 
            image: images.find(m => m.license === license).image,
            lastPurchase: new Date(supporters.find(s => s.license === license).lastPurchase).getTime()
         })).sort((a, b) => b.lastPurchase - a.lastPurchase);
      }

      res.send({ products, supporters });

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.get('/order', auth, async (req, res) => {
   try {
      const accessToken = await generateAccessToken();
      const response = await fetch(`${base.url}/v2/checkout/orders/${req.query.id}/capture`, {
         method: 'POST',  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      });
      
      const data = await response.json();
      let name = '';

      console.log(data);

      if (data.status === 'COMPLETED') {
         const find = items.find(i => i.id == req.query.itemID);

         if (find) {
            if (find.price === parseInt(data.purchase_units[0].payments.captures[0].amount.value)) {
               let gift = req.query.customID ? await User.findOne({ license: req.license }).select('customID discord character.identifier.name') : null;
               const user = await User.findOne({ $or: [{ customID: req.query.customID }, { license: req.license }] }).select('customID license discord character.identifier.name vip.refID');

               if (gift) gift = req.query.customID !== user.customID ? null : gift;

               if (user) {
                  const playerID = getPlayerIDfromGame(user.license);

                  if (gift) name = user.character.identifier.name;
                  givePurchases(user, find);

                  if (!['sponsor', 'level'].includes(find.type)) {
                     await Vip.updateOne({ license: user.license }, { $push: { other: { title: find.translate }}, $set: { lastPurchase: new Date() }});
                     
                     if (playerID) {
                        const item = (await Vip.findOne({ license: user.license }).select({ other: { $slice: -1 }})).other[0];
                        emitNet('NewStart_MainMenu:handleGeneral-client', playerID, 'pushToStore', JSON.parse(JSON.stringify(item)));
                     }

                  } else {
                     await Vip.updateOne({ license: user.license }, { $set: { lastPurchase: new Date() }});
                  }

                  if (playerID) emitNet('NewStart_MainMenu:handleGeneral-client', playerID, 'purchaseFromStore', { name: find.translate, gift: gift ? gift.character.identifier.name : null, features: find.featuresText });

                  const channel = DISCORD_Log.channels.cache.find(i => i.id === '1128951626762297434'); // store-log
                  const capture = data.purchase_units[0].payments.captures[0];
                  const seller = capture.seller_receivable_breakdown;
channel.send(`\`\`\`
${find.translate}
السعر: ${find.price}$ - المدفوع: ${capture.amount.value}$ - الضريبة: ${seller?.paypal_fee.value}$ - المبلغ النهائي: ${seller?.net_amount.value}\n
الاسم: ${data.payer.name.given_name} ${data.payer.name.surname}\nالبريد: ${data.payer.email_address}\n${gift ? `\nهدية لـ: (${user.customID}) ${user.character.identifier.name}\n` : ''}
customID: ${gift ? gift.customID : user.customID} - discordID: ${gift ? gift.discord : user.discord}
licenseID: ${req.license}
\`\`\``);
               }
            }
         }
      }

      res.send({ status: data.status, name });

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.post('/order', auth, async (req, res) => {
   try {      
      const find = items.find(i => i.id === req.body.id);
      if (!find) throw 'not allowed!';

      const accessToken = await generateAccessToken();
      const response = await fetch(`${base.url}/v2/checkout/orders`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'PayPal-Request-Id': req.license + '_' + Date.now(), Authorization: `Bearer ${accessToken}` },
         body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{ 
               items: [{ name: find.name, quantity: 1, description: find.description, category: 'DIGITAL_GOODS', unit_amount: { currency_code: 'USD', value: find.price }}],
               amount: { currency_code: 'USD', value: find.price, breakdown: { item_total: { currency_code: 'USD', value: find.price }}}
            }],
            payment_source: {
               paypal: {
                  experience_context: {
                     payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                     brand_name: 'NewStart Games',
                     landing_page: 'NO_PREFERENCE',
                     user_action: 'PAY_NOW'
                  }
               }
            }
         }),
      });
      
      const data = await response.json();
      res.send({ id: data.id });

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
async function generateAccessToken() {
   const auth = Buffer.from(base.clientID + ':' + base.secretID).toString('base64');
   const response = await fetch(`${base.url}/v1/oauth2/token`, {
      method: 'POST', body: 'grant_type=client_credentials', headers: { Authorization: `Basic ${auth}` }
   });

   const data = await response.json();
   return data.access_token;
}

// ---
async function givePurchases(user, reference) {
   let playerID = getPlayerIDfromGame(user.license);

   for (let item of reference.features) {
      if (item.type === 'vip') { // => vip
         const current = items.find(i => i.id === user.vip?.refID)?.sort;
         const giveVip = current > reference.sort || !user.vip?.refID;
         console.log(giveVip);
         let end = new Date();
         end.setDate(end.getDate() + (reference.days || 30));

         const saveMain = { type: 'sponsor', title: reference.translate, name: item.value, end: end.toISOString(), refID: reference.id };

         await Vip.updateOne({ license: user.license }, { $push: { sponsors: { ...saveMain, type: 'vip' }}});
         if (giveVip) await User.updateOne({ license: user.license }, { $set: { vip: saveMain }});

         if (playerID) {
            const item = (await Vip.findOne({ license: user.license }).select({ sponsors: { $slice: -1 }})).sponsors[0];

            emitNet('NewStart_MainMenu:handleGeneral-client', playerID, 'pushToStore', JSON.parse(JSON.stringify(item)));

            if (giveVip) {
               emitNet('NewStart_MainMenu:handleGeneral-client', playerID, 'updateUser', { isVip: true, ...saveMain });
               emit('NewStart_Initialize:handleGeneral-server', 'updatePlayer', { serverID: playerID, refName: 'vip', value: { name: saveMain.name }});
            }
         }

      } else if (item.type === 'money') { // => money
         emit('NewStart:giveMoney', { name: 'متجر نيوستارت', amount: item.value }, false, false, playerID, user.license);

      } else if (item.type === 'discord') { // => discord
         const member = await (await DISCORD_BOT.guilds.fetch('955495908462706688')).members.fetch(user.discord);
         member.roles.add(item.value);
   
      } else if (item.type === 'doubleExp') { // => doubleExp
         await Vip.updateOne({ license: user.license }, { $push: { doubleExp: { title: item.title, timer: item.value * 60 * 60 * 1000 }}});

         if (playerID) {
            const item = (await Vip.findOne({ license: user.license }).select({ doubleExp: { $slice: -1 }})).doubleExp[0];
            emitNet('NewStart_MainMenu:handleGeneral-client', playerID, 'pushToStore', JSON.parse(JSON.stringify(item))); 
         }
   
      } else if (item.type === 'giveExp') { // => giveExp
         if (playerID) emitNet('NewStart_MainMenu:handleGeneral-client', playerID, 'levelUp', item.value);
         else await User.updateOne({ license: user.license }, { $inc: { 'mode.level': item.value }});
   
      } else if (item.type === 'vehicle') { // => vehicle
         emit('NewStart_VehicleDealership:payment-server', JSON.stringify({ vehicle: { hash: item.value }, playerID, license: user.license }));
      }
   }
   // taxes
   const filterTaxes = reference.features.filter(i => i.type === 'tax');

   if (filterTaxes.length) {
      const old = JSON.parse(JSON.stringify(await Vip.findOne({ license: user.license }).select('-_id taxes')));
      const taxes = filterTaxes.reduce((obj, item) => ({ ...obj, [item.value]: true }), {});

      delete old.taxes._id;
      await Vip.updateOne({ license: user.license }, { $set: { taxes: { ...old.taxes, ...taxes }}});
      if (playerID) emitNet('NewStart_MainMenu:handleGeneral-client', playerID, 'setTaxes', { ...old.taxes, ...taxes });
   }
}

module.exports = router;