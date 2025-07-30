/* ``````````` ## Development By el8rbawY ## ```````````*/
const express = require('express');
const router = express.Router();
const AsyncLock = require('async-lock');
const lock = new AsyncLock();
const { User, validateSchema } = require('../../models/user');
const { Money } = require('../../models/money');
const { Inventory } = require('../../models/inventory');
const { Faction } = require('../../models/faction');
const { JobVehicle } = require('../../models/jobVehicle');
const { Police } = require('../../models/police');
const { Favorite } = require('../../models/favorite');
const { Vip } = require('../../models/vip');
const { Business } = require('../../models/business');
const { discordRename, checkAdmin, giveDiscordRole } = require('../../discord/method');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');
const itemsData = require('../../services/static/items.json');
const { removeVip } = require('../../discord/vip');
const DISCORD_BOT = require('../../discord/index');

// -- 
router.get('/:license', licenseDecrypt, async (req, res) => {   
   try {
      let data = {};

      if (req.query.isInitialize === 'true') {
         const now = Date.now();
         data.user = await User.findOneAndUpdate({ license: req.params.license }, { $set: { lastLogin: now }}).select('license customID location job job2 character mode vip skipQuestions adminRole settings hud discord');
         data.user = JSON.parse(JSON.stringify(data.user));
         data.money = await Money.findOne({ license: req.params.license }).select('cash bank');
         data.prison = await Police.findOne({ license: req.params.license }).select('-_id jailed jail isCar isTruck isMotor isWeapons').slice('jail', -1);
         data.favorite = await Favorite.findOne({ license: req.params.license }).select('-_id animations tattoos rewardDate');
         data.vip = await Vip.findOne({ license: req.params.license }).select({ doubleExp: { $slice: -10 }, sponsors: { $slice: -10 }, other: { $slice: -10 }}).select('-_id taxes');
         data.business = await Business.findOne({ license: req.params.license }).slice('log', -15);

         if (data.user?.vip && (new Date(data.user.vip.end).getTime() < now)) {
            const execution = await removeVip(data.user.vip.refID, data.user, data.vip.sponsors);
            
            if (execution.vip) data.user.vip = execution.vip;
            else delete data.user.vip;

            if (execution.taxes) {
               data.vip.taxes = execution.taxes;
            }
         }

         if (data.user?.job?.type === 'faction') {
            data.faction = await Faction
               .findOne({ _id: data.user.job.id })
               .populate({ path: 'players.user', select: 'customID discord license location.name character.identifier mode.level' })

            data.factionVehicles = await JobVehicle.find({ license: req.params.license, type: 'faction', jobID: data.faction._id.toString() }).select('hash');
         }

         data.inventory = {};
         data.inventory.itemsData = itemsData;
         data.inventory.current = (await Inventory.findOne({ license: req.params.license }).select('items'))?.items; 
         
         if (data.user?.character?.identifier) {
            if (data.inventory.current && data.inventory.current.some(i => i.count > 1 && itemsData.find(s => s.id === i.id).unique)) {
               for (let item of data.inventory.current) {
                  if (item.count > 1 && itemsData.find(s => s.id === item.id).unique) {
                     item.count = 1;
                  }
               }
            }

            if (!data.user?.adminRole) {  
               discordRename(
                  data.user.customID, 
                  data.user.character.identifier.name, 
                  data.user.discord,
                  data.faction?.players.find(i => i.user._id.toString() === data.user._id)?.code,
               );
               
            } /* else {
               checkAdmin(data.user.discord, data.user?.adminRole);
            } */

            if (data.user.job?.type === 'mechanical') giveDiscordRole('1121590479339917314', data.user.discord); // ميكانيكي
         }

      } else if (req.query.customID) {
         data = await User.findOne({ customID: req.query.customID }).select(req.query.filter.split(',').join(' '));
         
      } else if (req.query.name) {
         data = await User.findOne({ 'character.identifier.name': req.query.name }).select(req.query.filter.split(',').join(' '));
         
      } else if (req.query.discord) {
         data = await User.findOne({ discord: req.query.discord }).select(req.query.filter.split(',').join(' '));

      } else if (req.query.filter) {
         data = await User.findOne({ license: req.params.license }).select(req.query.filter.split(',').join(' '));

      } else if (req.query.discordRole) {
         const user = await User.findOne({ license: req.params.license }).select('discord');
         const guild = await DISCORD_BOT.guilds.fetch('955495908462706688');
         const member = await guild.members.fetch(user.discord);

         data.isHasRole = member.roles.cache.has(req.query.discordRole);
      }
      
      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// --
router.post('/', licenseDecrypt, async (req, res) => {   
   try {
      // const validation = validateSchema(req.body, true);
      // if (validation.error) return res.status(401).send( validation.error.details[0].path[0]); // if enable add fivem property as string

      lock.acquire('apiCallLock', async () => { // منع التداخل
         let customID = 10000;
         const lastUser = (await User.find().sort({ registration: -1 }).limit(1).select('customID'))[0];

         if (lastUser) customID = parseInt(lastUser.customID) + 1;

         const user = new User({ ...req.body, customID });
         await user.save();
      });

      const money = new Money({ license: req.body.license });
      const police = new Police({ license: req.body.license });
      const favorite = new Favorite({ license: req.body.license });
      const inventory = new Inventory({ license: req.body.license, items: [] });
      const vip = new Vip({ license: req.body.license });

      await money.save();
      await police.save();
      await inventory.save();
      await favorite.save();
      await vip.save();
      
      res.send('Done!');

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// -- 
router.post('/IDs', async (req, res) => {
   try {
      const data = await User.find({ character: { $exists: true }, license: { $in: req.body.map(i => i.license) } }).select('-_id license customID vip.name adminRole');
      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// --
router.post('/players', async (req, res) => {   
   try {
      const data = [...req.body];
      const licenseIDs = [];

      for (let obj of data) licenseIDs.push(obj.license);

      const inventories = await Inventory.find({ license: { $in: licenseIDs } });
      const users = await User
         .find({ license: { $in: licenseIDs } })
         .select('license customID character.identifier.name mode.level')
         .sort({ customID: -1 });

      for (let index in data) {
         const user = users.find(obj => obj.license === data[index].license);
         const inventory = inventories.find(obj => obj.license === data[index].license);
         let weight = 0;

         for (let item of inventory.items) {
            const find = itemsData.find(obj => obj.id === item.id);
            weight += item.count * find.space;
         }

         data[index].info = { user, weight };
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// -- 
router.post('/favorite', async (req, res) => {
   try {
      await Favorite.updateOne({ license: req.query.license }, req.query.isInc === 'true' ? { $inc: req.body } : { $set: req.body });
      res.send('Done!');

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// --
router.put('/:license', licenseDecrypt, async (req, res) => {   
   try {
      let queryUpdate;
      const validation = validateSchema(req.body);

      if (validation.error) return res.status(401).send(validation.error.details[0].path[0]);

      if (req.query.characterPed === 'true') queryUpdate = { $set: { 'character.ped': req.body.character.ped } };
      else if (req.query.characterOutfit === 'true') queryUpdate = { $set: { 'character.outfit': req.body.character.outfit, 'character.textures': req.body.character.textures  } };
      else if (req.query.isInc === 'true') queryUpdate = { $inc: req.body };
      else queryUpdate = { $set: req.body };

      const user = await User.findOneAndUpdate({ license: req.params.license }, queryUpdate).select('customID adminRole');
      res.send({ customID: user?.customID, adminRole: user?.adminRole });

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// --
router.delete('/:license', licenseDecrypt, async (req, res) => {   
   try {
      let data = {};

      if (req.body.discordRole) {
         const user = await User.findOne({ license: req.params.license }).select('discord');
         const guild = await DISCORD_BOT.guilds.fetch('955495908462706688');
         const member = await guild.members.fetch(user.discord);

         member.roles.remove(req.body.discordRole);
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;