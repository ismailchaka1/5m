const express = require('express');
const router = express.Router();
const AsyncLock = require('async-lock');
const lock = new AsyncLock();
const { User } = require('../../models/user');
const { Phone, validateSchema } = require('../../models/phone');
const { Tweet, validateTweet } = require('../../models/tweet');
const { Faction } = require('../../models/faction');
const { Police } = require('../../models/police');
const { discordTweets, discordRename, giveDiscordRole } = require('../../discord/method');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');
const { webURL } = require('../../services/config');

// ---
router.get('/', async (req, res) => {
   try {
      let data = null;
      
      if (req.query.isInitial === 'true') {
         data = await Phone.findOne({ number: req.query.number });

      } else if (req.query.isMechanical === 'true') {
         const licenses = getPlayers().map(i => GetPlayerIdentifier(i)?.replace('license:', ''));
         data = await User.find({ license: { $in: licenses }, 'job.type': 'mechanical' }).select('license character.identifier.name job').limit(20);
         const search = { license: { $in: data.map(i => i.license) }};

         const phone = await Phone.find(search).select('-_id license number');
         const police = await Police.find(search).select('_id license');

         data = JSON.parse(JSON.stringify(data)).map(i => ({ 
            _id: i._id, 
            name: i.character.identifier.name,
            number: phone.find(p => p.license === i.license).number,
            image: `${webURL}/game/photo?model=police&id=${police.find(p => p.license === i.license)._id}`,
            isActive: !!i.job.isIn
         }));
         
      } else {
         data = await Phone.findOne({ number: req.query.number }).select('license');
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.get('/tweets', async (req, res) => {
   try {
      await Tweet.deleteMany({ date: { $lte: Date.now() - 86400000 } }); // 24h
      const tweets = await Tweet.find({ processing: false }).select('-license -processing').sort({ date: -1 }).limit(25);

      for (let index in tweets) {
         const item = tweets[index];

         if (item.image) {
            item.image = `${webURL}/game/photo?model=tweet&id=${item._id}`;
         }
      }

      res.send(tweets);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.get('/emergency', licenseDecrypt, async (req, res) => {
   try {
      const data = {};
      const query = parseInt(req.query.id) ? { phone: req.query.id } : { key: req.query.id };

      data.players = (await Faction.findOne(query).select('players.user players.status').populate({ path: 'players.user', select: 'license' })).players;
      data.name = (await User.findOne({ license: req.query.license }).select('character.identifier.name')).character.identifier.name;
      
      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.post('/newPhone/:license', licenseDecrypt, async (req, res) => {   
   try {
      const user = await User.findOne({ license: req.params.license }).select('customID discord adminRole');

      if (!user.adminRole) {
         discordRename(user.customID, null, user.discord);
         giveDiscordRole('1121499014878208000', user.discord, '1118631429321015306'); // لاعب نيوستارت
      }

      const min = 10000000, max = 99999999;
      const numbers = [];

      for (let i = 1; i <= 250; i++) {
         const generate = Math.floor(Math.random() * (max - min)) + min;
         const convert = generate.toString().replace(new RegExp('^(.{4})(.)'), '$1-$2');

         numbers.push(convert);
      }

      lock.acquire('apiCallLock', async () => { // منع التداخل
         const similarity = await Phone.find({ number: { $in: numbers } }).select('number');
         let unique = numbers.filter(num => !similarity.some(obj => obj.number === num))[0];

         // save
         if (unique) {
            const phone = new Phone({ license: req.params.license, number: unique });
            await phone.save();
      
            res.send({ id: 30, count: 1, features: { number: unique } });

         } else {
            res.send('Not Found!');
         }
      });

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.post('/tweets', licenseDecrypt, async (req, res) => {   
   try {
      const validation = validateTweet(req.body);
      if (validation.error) return res.status(401).send(validation.error.details[0].path[0]);

      const tweet = new Tweet(req.body);
      await tweet.save();

      if (!tweet.processing) {
         const discordID = (await User.findOne({ license: tweet.license }).select('discord')).discord;
         discordTweets(tweet, discordID);
      }

      res.send(tweet);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.put('/', async (req, res) => {
   try {
      const validation = validateSchema(req.body);
      if (validation.error) return res.status(401).send( validation.error.details[0].path[0]);

      const type = req.body.type;
      delete req.body.type;

      if (type === 'add') {
         await Phone.updateOne({ number: req.query.number }, { $push: { contacts: req.body } });

      } else { // delete
         await Phone.updateOne({ number: req.query.number }, { $pull: { contacts: { number: req.body.number } } });
      }

      res.send('DONE!');

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.delete('/tweets', licenseDecrypt, async (req, res) => {
   try {
      if (req.body.isAll) {
         const license = (await User.findOne({ customID: req.body.customID }).select('license')).license; 
         await Tweet.deleteMany({ license });

      } else {
         await Tweet.deleteOne(req.body);
      }
      
      res.send('DONE!');

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;