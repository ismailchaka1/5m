const express = require('express');
const router = express.Router();
const { User } = require('../../models/user');
const { Tweet } = require('../../models/tweet');
const { Police } = require('../../models/police');
const { webURL, imgResize } = require('../../services/config');
const { discordTweets } = require('../../discord/method');

// ---
router.get('/photo', async (req, res) => {
   try {
      let find;

      if (req.query.model === 'tweet') find = (await Tweet.findById(req.query.id).select('image'))?.image;
      else if (req.query.model === 'police') find = (await Police.findById(req.query.id).select('image'))?.image;

      if (!find) throw 'Invalid!';

      const base64Data = find.replace(/^data:image\/(jpg|png|jpeg|webp);base64,/, '');
      const image = Buffer.from(base64Data, 'base64');
      
      res.writeHead(200, {
         'Content-Type': 'image/webp',
         'Content-Length': image.length
      });

      res.end(image);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.put('/tweets', async (req, res) => {
   try {
      const processing = (await Tweet.findById(req.body.id).select('processing')).processing;
      if (!processing) res.status(400).send('Failed!');
      
      const buffer = Buffer.from(req.body.base64.replace('data:image/jpeg;base64,', ''), 'base64');
      const image = await imgResize(buffer);
      const tweet = await Tweet.findByIdAndUpdate(req.body.id, { $set: { image, processing: false }}).select('-processing');
      const discordID = (await User.findOne({ license: tweet.license }).select('discord')).discord;

      discordTweets(tweet, discordID, buffer);

      tweet.image = `${webURL}/game/photo?model=tweet&id=${tweet._id}`;
      res.send(tweet);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;