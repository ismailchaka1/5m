/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { User } = require('../../models/user');
const { Money } = require('../../models/money');
const { Faction } = require('../../models/faction');
const { Police } = require('../../models/police');
const { Log } = require('../../models/log');
const DISCORD_BOT = require('../../discord');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');

// ---
// router.get('/', licenseDecrypt, async (req, res) => {   
//    try {
//       const data = {};
//       data.admins = await User.find({ adminRole: { $exists: true }}).select('license');

//       if (req.query.onlyAdmins !== 'true') {
//          data.user = await User.findOne({ license: req.query.license }).select('customID character.identifier.name');
//          data.user = JSON.parse(JSON.stringify(data.user));
//          data.user = { customID: data.user.customID, name: data.user.character.identifier.name }
//       }

//       res.send(data);

//    } catch(err) {
//       console.log(err);
//       res.status(400).send(err);
//    }
// });

// ---
router.get('/ban', licenseDecrypt, async (req, res) => {   
   try {
      let data = (await User.findOne({ $or: [{ license: req.query.license }, { discord: req.query.discord }] }).select('block'))?.block || {};

      if (!data.isForever && data.isActive) {
         const benEnd = new Date(data.end).getTime();

         if (benEnd <= new Date().getTime()) {
            await User.updateOne({ license: req.query.license }, { $unset: { block: '' }});
            data = {};
         }
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.post('/ban', licenseDecrypt, async (req, res) => {   
   try {
      let data = {}, block = null, license = null;
      
      if (req.body.isAntiCheat) {
         block = { isActive: true, isForever: !!req.body.isForever, from: 'مكافح الغش', reason: req.body.reason, date: new Date() };
         if (req.body.end) block.end = req.body.end;

         license = req.body.license;
         data = await User.findOneAndUpdate({ license }, { $set: { block }, $unset: { adminRole: '' }}).select('adminRole customID character.identifier.name discord');
         
      } else {
         if (req.body.isGive) {
            const admin = await User.findOne({ license: req.query.license }).select('discord');
            const guild = await DISCORD_BOT.guilds.fetch('955495908462706688');
            const member = await guild.members.fetch(admin.discord);

            block = { isActive: true, isForever: !!req.body.isForever, reason: req.body.reason, from: member.nickname, discordFrom: admin.discord, date: new Date() };
            
            if (req.body.duration) block.end = req.body.duration;
            const user = await User.findOneAndUpdate({ customID: req.body.customID }, { $set: { block }, $unset: { adminRole: '' } }).select('license');
            license = user.license;

         } else {
            const player = await User.findOneAndUpdate({ customID: req.body.customID }, { $unset: { block: '' }}).select('customID character.identifier.name');

            if (!player) data.error = 'Player not found.';
            else data = { player };
         }
      }

      if (block) {
         const log = new Log({ license, type: 'ban', ...block });
         await log.save();
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.post('/getData', licenseDecrypt, async (req, res) => {   
   try {
      const user = await User.findOne({ license: req.body.license }).select('adminRole');
      if (!user.adminRole) return res.send(null);

      let data = { adminRole: user.adminRole };

      if (['founder', 'adminplus', 'admin', 'supervisorplus', 'supervisor'].includes(user.adminRole)) {
         data.admins = await User.find({ adminRole: { $exists: true }, character: { $exists: true }}).select('customID character.identifier.name adminRole');
         data.admins = JSON.parse(JSON.stringify(data.admins)).filter(i => i.character).map(({ _id, character, ...rest }) => ({ name: character.identifier.name, ...rest }));

         data.players = req.body.players;
         const licenses = data.players.map(obj => obj.license);

         let players = await User
            .find({ license: { $in: licenses }, character: { $exists: true }})
            .select('license customID character.identifier.name mode.level playTime discord adminRole job.type registration');

         const moneyData = await Money.find({ license: { $in: licenses }}).select('-_id license cash bank');
         players = JSON.parse(JSON.stringify(players));

         for (let index in data.players) {
            const reference = data.players[index];
            const find = players.find(p => p.license === reference.license);
            
            reference.money = moneyData.find(m => m.license === reference.license);
            data.players[index] = { ...reference, ...find };
         }

         data.players = data.players.filter(i => i.character).map(({ _id, license, character, mode, ...rest }) => {
            return { name: character.identifier.name, level: mode?.level || 0, ...rest };
         });
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.put('/commend', licenseDecrypt, async (req, res) => {   
   try {
      let data = {};
      const player = await User.findOne({ customID: req.body.customID }).select('license customID character.identifier.name mode.isDie job.type job2.type');
      if (!player) return res.send({ error: 'Player not found.' });

      switch (req.body.type) {
         case 'faction':
            if (!mongoose.Types.ObjectId.isValid(req.body.id)) return res.send({ error: 'Faction ID not found.' });
            const faction = await Faction.findOne({ _id: req.body.id }).select('_id name');

            if (!faction) data.error = 'Faction ID not found.';
            else if (player.job?.type || player.job2?.type) data.error = 'The player is in another job.';
            else data = { license: player.license, factionName: faction.name };
            break;

         case 'revive':
            if (!player.mode?.isDie) data.error = 'The player is not dead!';
            data = { player };
            break;

         case 'handcuff':
            data = { player };
            break;

         case 'unjail':
            await Police.updateOne({ license: player.license }, { $set: { jailed: 0 }});
            data = { player };
            break;
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;