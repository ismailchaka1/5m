/* ``````````` ## Development By el8rbawY ## ```````````*/
const express = require('express');
const router = express.Router();
const { Faction } = require('../../models/faction');
const { User } = require('../../models/user');
const { JobVehicle } = require('../../models/jobVehicle');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');
const { discordRename } = require('../../discord/method');
const DISCORD_BOT = require('../../discord');

// ---
const codes = { police: 'P-', health: 'H-', facilities: 'S-' };

// ---
router.get('/:id', async (req, res) => {   
   try {
      const faction = await Faction
         .findOne({ _id: req.params.id })
         .populate({ path: 'players.user', select: 'customID discord license location.name character.identifier mode.level' });
      
      res.send(faction);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.post('/join', licenseDecrypt, async (req, res) => {
   try {
      const select = 'customID license location.name character.identifier mode.level';
      const faction = await Faction.findOne({ _id: req.body.factionID }).populate({ path: 'players.user', select });
      const user = await User.findOneAndUpdate({ license: req.body.license }, { $set: { job: { type: 'faction', key: faction.key, id: faction._id }}}).select(select+' adminRole discord');

      const arrCodes = Array.from(Array(50).keys()).map(x => codes[faction.key] + (x < 10 ? '0' + ++x : ++x));
      const similarity = await Faction.find({ 'players.code': { $in: arrCodes } }).select('players.code');
      const unique = (arrCodes.filter(num => !similarity.some(obj => obj.players.some(i => i.code === num))))[0];

      const rankID = req.body.rankID >= 0 ? req.body.rankID : faction.ranks[faction.ranks.length - 1].id;
      const data = { user: user._id, time: 0, rankID, status: 'out', code: unique };
      
      await Faction.updateOne({ _id: req.body.factionID }, { $push: { players: data } });
      const factionVehicles = await JobVehicle.find({ license: req.body.license, type: 'faction', jobID: faction._id.toString() }).select('hash');

      if (!user.adminRole) {
         discordRename(null, user.character.identifier.name, user.discord, unique);
      }
      
      data.user = user;
      faction.players.push(data);
      res.send({ faction, user: data, factionVehicles });

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.put('/', licenseDecrypt, async (req, res) => {
   try {
      const faction = await Faction.findOne({ _id: req.body.id }).populate({ path: 'players.user', select: 'license discord character.identifier.name adminRole' });
      const rankID = faction.players.find(obj => obj.user.license === req.body.license).rankID;

      if ((faction.type === 'official' && req.body.type === 'ranks') || !faction.ranks.find(obj => obj.id === rankID).isAdmin) {
         return res.status(403).send('Not Allowed!');
      }
      
      if (req.body.type === 'ranks') {
         const ranks = req.body.ranks;
         await Faction.updateOne({ _id: req.body.id }, { $set: { ranks } });

         if (req.body.players) {
            for (let item of req.body.players) {
               await Faction.updateOne({ _id: req.body.id, 'players.user': item.userID }, { $set: { 'players.$.rankID': item.rankID } });
            }
         }

      } else if (req.body.type === 'codes') {
         const items = JSON.parse(JSON.stringify(faction.players.sort((a, b) => a.rankID - b.rankID))).map((a, i) => ({ ...a, code: codes[faction.key] + (i < 10 ? '0' + ++i : ++i) }));
         const guild = await DISCORD_BOT.guilds.fetch('955495908462706688');
         
         for (let item of items) {
            if (item.user.adminRole) continue;

            const member = await guild.members.fetch(item.user.discord);
            member.setNickname(`[${item.code}] ${item.user.character.identifier.name}`);
         }

         await Faction.updateOne({ _id: req.body.id }, { $set: { players: items.map(i => ({ ...i, user: i.user._id })) }});
      }

      res.send('DONE!');
      
   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.put('/more', licenseDecrypt, async (req, res) => {
   try {
      let data = {};

      if (req.body.type === 'vehicle') {
         req.body.type = 'faction';

         const vehicle = new JobVehicle(req.body);
         await vehicle.save();

      } else { // status
         const user = await User.findOne({ license: req.body.license }).select('_id');
         await Faction.updateOne({ _id: req.body.id, 'players.user': user._id }, { $set: { 'players.$.status': req.body.value } });
      }

      res.send(data);
      
   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.put('/user', licenseDecrypt, async (req, res) => {
   try {
      let data = {};
      const query = req.body.type === 'time' ? { license: req.body.license } : { customID: req.body.customID }
      const user = await User.findOne(query).select('license discord character.identifier.name job.type job2.type adminRole'); // same player or another player

      // ***************
      if (req.body.type === 'time') {
         await Faction.updateOne({ _id: req.body.id, 'players.user': user._id }, { $inc: { 'players.$.time': 10 } }); // 10 min
         return res.send('DONE!');
      }

      // ***************
      if (req.body.type === 'code') {
         await Faction.updateOne({ _id: req.body.id, 'players.user': user._id }, { $set: { 'players.$.code': req.body.value } });
         if (!user.adminRole) discordRename(null, user.character.identifier.name, user.discord, req.body.value);
         return res.send('DONE!');
      }

      // ***************
      if (req.body.type === 'vacation') {
         await Faction.updateOne({ _id: req.body.id, 'players.user': user._id }, { $set: { 'players.$.status': req.body.isReset ? 'out' : 'vacation' } });
         data.license = user.license;

      } else if (req.body.type === 'promotion') {
         const faction = await Faction
            .findOneAndUpdate({ _id: req.body.id, 'players.user': user._id }, { $set: { 'players.$.rankID': req.body.rankID } })
            .populate({ path: 'players.user', select: 'license' }).select('type players ranks');
         
         const oldRankID = faction.players.find(obj => obj.user.license === user.license).rankID;

         data = {
            license: req.body.license,
            faction,
            user: {
               license: user.license,
               name: user.character.identifier.name, 
               isUp: req.body.rankID < oldRankID,
               rank: faction.ranks.find(obj => obj.id === req.body.rankID).name
            }
         }
      } else { // invite
         const faction = await Faction.findOne({ _id: req.body.id }).select('type name players._id maxPlayers');
         const error = faction.players.length >= faction.maxPlayers ? { type: faction.type, isMax: true } : !user ? { notExist: true } : null;

         if (error) return res.send(error);
         data = { license: user.license, name: faction.name, isInJob: !!user.job?.type || !!user.job2?.type }
      }
      
      res.send(data);
      
   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.delete('/user', licenseDecrypt, async (req, res) => {
   try {
      let data = {};

      if (req.body.type === 'resignation') {
         const user = await User
            .findOneAndUpdate({ license: req.body.license }, { $set: { job: {} } })
            .select('customID character.identifier.name');

         const faction = await Faction
            .findOneAndUpdate({ _id: req.body.id }, { $pull: { players: { user: user._id } } })
            .select('type name players')
            .populate({ path: 'players.user', select: 'license' });

         data = { playerName: user.character.identifier.name, customID: user.customID, faction };

      } else { // kick
         const faction = await Faction
            .findOne({ _id: req.body.id })
            .select('type name players ranks')
            .populate({ path: 'players.user', select: 'license' });

         const user = await User.findOneAndUpdate({ customID: req.body.customID }, { $set: { job: {}, 'hud.armour': 0 } }).select('license customID discord character.identifier.name adminRole');
         await Faction.updateOne({ _id: req.body.id }, { $pull: { players: { user: user._id } } });
         
         data = { 
            license: user.license, faction,
            playerName: user.character.identifier.name, 
            customID: user.customID 
         };

         if (!user.adminRole) {            
            discordRename(user.customID, user.character.identifier.name, user.discord);
         }
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;