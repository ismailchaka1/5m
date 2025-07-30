/* ``````````` ## Development By el8rbawY ## ```````````*/
const express = require('express');
const router = express.Router();
const { User } = require('../../models/user');
const { Inventory } = require('../../models/inventory');
const { House } = require('../../models/house');
const { Vehicle } = require('../../models/vehicle');
const { JobVehicle } = require('../../models/jobVehicle');
const { Log } = require('../../models/log');
const { Faction } = require('../../models/faction');
const { Favorite } = require('../../models/favorite');
const { Money } = require('../../models/money');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');
const DISCORD_BOT = require('../../discord');
const DISCORD_Log = require('../../discord/logs'); 

// ---
router.get('/jobVehicle', licenseDecrypt, async (req, res) => { 
   try {
      let data = null;

      const user = await User.findOne({ customID: req.query.customID }).select('license');
      if (user) data = await JobVehicle.findOne({ license: user.license, hash: req.query.hash }).select(req.query.filter.split(',').join(' '));

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// -- 
router.get('/statistics', async (req, res) => {
   try {
      const data = {};
      const adminsLength = await User.find({ adminRole: { $exists: true }}).countDocuments();

      // playTime
      // data.playTime = (await User.find({ character: { $exists: true }, adminRole: { $exists: false }}).sort({ playTime: -1 }).limit(3).select('customID character.identifier.name playTime')).map(i => ({
      //    customID: i.customID, name: i.character.identifier.name, value: `س${ Math.floor(i.playTime / 60) } د${ i.playTime % 60 }`
      // }));
      
      // money
      const money = await Money.find({}).sort({ bank: -1 }).limit(adminsLength+3).select('license cash bank');

      data.money = await User.find({ license: { $in: money.map(i => i.license) }, adminRole: { $exists: false }}).select('license customID character.identifier.name');
      data.money = data.money.map(i => {
         const find = money.find(c => c.license === i.license);
         return { customID: i.customID, name: i.character.identifier.name, value: find.bank + find.cash }
      }).sort((a, b) => a.value - b.value).reverse().slice(0, 3);

      // level
      data.level = (await User.find({ character: { $exists: true }, adminRole: { $exists: false }}).sort({ 'mode.level': -1 }).limit(3).select('customID character.identifier.name mode.level')).map(i => ({
         customID: i.customID, name: i.character.identifier.name, value: i.mode.level
      }));
      
      // employees
      const employees = (await Faction.aggregate([
         { $unwind: '$players' },
         { $sort: { 'players.time': -1 }},
         { $group: { _id: '$_id', top3Players: { $push: '$players' }}},
         { $project: { _id: 1, top3Players: { $slice: ['$top3Players', 3] }}},
         { 
            $group: { _id: null, players: { $push: '$top3Players' }} 
         }
      ]))[0].players.flat().sort((a, b) => a.time - b.time).reverse().slice(0, 3);

      data.employees = (await User.find({ _id: { $in: employees.map(i => i.user) }}).select('character.identifier.name')).map(i => {
         const find = employees.find(e => e.user.toString() === i._id.toString());
         return { code: find.code, name: i.character.identifier.name, value: `س${ Math.floor(find.time / 60) } د${ find.time % 60 }` }
      });

      // criminals
      const criminals = await Favorite.find({}).sort({ crime: -1 }).limit(adminsLength+3).select('license crime');
      
      data.criminals = await User.find({ license: { $in: criminals.map(i => i.license) }, adminRole: { $exists: false }}).select('license customID character.identifier.name');
      data.criminals = data.criminals.map(i => ({ 
         customID: i.customID, name: i.character.identifier.name, value: criminals.find(c => c.license === i.license).crime 
      })).sort((a, b) => a.value - b.value).reverse().slice(0, 3);

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.post('/log', licenseDecrypt, async (req, res) => { 
   try {
      const log = new Log(req.body);
      await log.save();
      res.send('DONE!');

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.post('/discord_log', licenseDecrypt, async (req, res) => { 
   try {
      const channel = (req.body.isLog ? DISCORD_Log : DISCORD_BOT).channels.cache.find(item => item.name === req.body.channel || item.id === req.body.channel);
      if (!channel) return res.send('Not Found!');

      let message = null;

      if (req.body.type === 'normal') {
         const user = await User.findOne({ license: req.body.license }).select('customID discord character.identifier.name');
         const info = !req.body.noShowLicense ? `\nlicenseID: ${req.body.license} - discordID: ${user.discord}` : '';
         message = `\`\`\`قام (${user.customID}) ${user.character.identifier.name} ${req.body.message}${info}\`\`\``;
         await channel.send(message);

      } else if (req.body.type === 'embed') {
         const webhook = (await channel.fetchWebhooks()).find(i => i.token);
         const messageID = (await channel.messages.fetch()).first().id;

         if (req.body.isEdit) {
            await webhook.editMessage(messageID, req.body.message);

         } else {
            await webhook.send(req.body.message);
         }
         
      } else {
         message = (req.body.isHere ? '@here' : '') +`\`\`\`${req.body.message}\`\`\``;
         await channel.send(message);
      }

      res.send('DONE!');

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

router.put('/ownership', licenseDecrypt, async (req, res) => { 
   try {
      if (req.body.type === 'house') {
         await House.updateOne({ code: req.body.id }, { $set: { license: req.body.license }});

      } else if (req.body.type === 'vehicle') {
         await Vehicle.updateOne({ 'plate.name': req.body.id }, { $set: { license: req.body.license }, $unset: { garage: '' }});

      } else if (req.body.type === 'jobVehicle') {
         const user = await User.findOne({ customID: req.body.id }).select('license');
         await JobVehicle.updateOne({ license: user.license, hash: req.body.extra }, { $set: { license: req.body.license }});
      }

      res.send('DONE!');

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

router.put('/changeLocks', licenseDecrypt, async (req, res) => { 
   try {
      const query = req.body.type === 'house' ? { id: req.body.id } : { plate: req.body.id };
      const key = req.body.type === 'house' ? 'id' : 'plate';
      const search = { license: { $ne: req.body.license }, [`items.features.${key}`]: req.body.id };
      let data = [];

      // find
      data.push(...(await Inventory.find(search).select('license')).map(item => item.license));
      data.push(...(await House.find(search).select('license')).map(item => item.license));
      data.push(...(await Vehicle.find(search).select('license')).map(item => item.license));
      data = [...new Set(data)];

      // update
      await Inventory.updateMany(search, { $pull: { items: { features: query }}});
      await House.updateMany(search, { $pull: { items: { features: query }}});
      await Vehicle.updateMany(search, { $pull: { items: { features: query }}});

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;