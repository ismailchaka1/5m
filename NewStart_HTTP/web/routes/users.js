const express = require('express');
const Joi = require('joi');
const router = express.Router();
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { User } = require('../../models/user');
const { House } = require('../../models/house');
const { Vehicle } = require('../../models/vehicle');
const { Outfit } = require('../../models/outfit');
const { Money } = require('../../models/money');
const { Phone } = require('../../models/phone');
const { Police } = require('../../models/police');
const auth = require('../../middlewares/auth');
const { webURL, website } = require('../../services/config');
const levelData = require('../../services/static/level.json');

// ---
router.get('/profile', auth, async (req, res) => {   
   try {
      const user = await User.findOne({ license: req.license }).select('license customID playTime vip location.name mode.level character.identifier.name job.type job2.type block lastLogin registration');
      const houses = await House.findOne({ license: req.license }).countDocuments();
      const vehicles = await Vehicle.find({ license: req.license }).countDocuments();
      const outfits = await Outfit.find({ license: req.license }).countDocuments();
      const money = await Money.findOne({ license: req.license }).select('-_id cash bank');
      const phone = (await Phone.findOne({ license: req.license }).select('-_id number')).number;
      const police = await Police.findOne({ license: req.license }).select('isWeapons jail._id');

      let level = levelData.findIndex(i => i > user.mode?.level);
      level = (level >= 0) ? level + 1 : (!user.mode?.level) ? 1 : levelData.length + 1;

      res.send({ // and edit in router.post('/auth'
         customID: user.customID,
         name: user.character.identifier.name, 
         location: user.location.name, 
         level,
         playTime: user.playTime,
         lastLogin: user.lastLogin,
         registration: user.registration,
         block: user.block,
         vip: user.vip,
         job: user.job?.type,
         job2: user.job2?.type,
         houses, vehicles, outfits, money, phone, police,
         image: `${webURL}/game/photo?model=police&id=${police._id}&date=${Date.now()}`
      });

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// --
router.post('/auth', async (req, res) => {   
   try {
      const validation = Joi.object({ code: Joi.string().required() }).validate(req.body);
      if (validation.error) return res.status(400).send(validation.error.details[0].message);

      // get info from discord
      const response = await (await fetch('https://discord.com/api/oauth2/token', {
         method: 'POST',
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         body: new URLSearchParams({
            client_id: '930549067484897300',
            client_secret: 'asy7U1eRuOb7-58Y8yIMndIqdjJQEIOC',
            grant_type: 'authorization_code',
            redirect_uri: `${website}/login`,
            code: req.body.code,
            scope: 'identify'
         })
      })).json();
     
      const discordUserInfo = (await axios.get(`http://discordapp.com/api/users/@me`, { headers: { Authorization: `Bearer ${response.access_token}` }})).data;

      // get user from database
      const user = await User.findOne({ discord: discordUserInfo.id })
         .select('license customID playTime vip location.name mode.level character.identifier.name job.type job2.type block lastLogin registration');

      if (!user) return res.status(400).send('noUser');
      else if (!user.character) return res.status(400).send('noCharacter');

      const token = jwt.sign({ license: user.license }, 'privateKey_e6jK?q7?;tqP+!U', { expiresIn: '7d' });
      const houses = await House.findOne({ license: user.license }).countDocuments();
      const vehicles = await Vehicle.find({ license: user.license }).countDocuments();
      const outfits = await Outfit.find({ license: user.license }).countDocuments();
      const money = await Money.findOne({ license: user.license }).select('-_id cash bank');
      const phone = (await Phone.findOne({ license: user.license }).select('-_id number')).number;
      const police = await Police.findOne({ license: user.license }).select('isWeapons jail._id');

      res.send({ 
         token, 
         info: {
            customID: user.customID,
            name: user.character.identifier.name, 
            location: user.location.name, 
            level: user.mode?.level,
            playTime: user.playTime,
            lastLogin: user.lastLogin,
            registration: user.registration,
            block: user.block,
            vip: user.vip,
            job: user.job?.type,
            job2: user.job2?.type,
            houses, vehicles, outfits, money, phone, police,
            image: `${webURL}/game/photo?model=police&id=${police._id}&date=${Date.now()}`
         }
      });

   } catch(err) {
      // console.log(err);
      res.status(400).send('error');
   }
});

module.exports = router;