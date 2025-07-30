/* ``````````` ## Development By el8rbawY ## ```````````*/
const express = require('express');
const router = express.Router();
const { Money, validateSchema } = require('../../models/money');
const { User } = require('../../models/user');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');
const { givePlayerBan } = require('../../services/config');

// -- 
router.get('/:license', licenseDecrypt, async (req, res) => {   
   try {
      let data = null;

      if (req.query.balance) {
         data = await Money.findOne({ license: req.params.license }).select('cash bank');

      } else {
         const customID = (await User.findOne({ license: req.params.license }).select('customID')).customID;
         data = (await Money.aggregate([
            { $match : { 'license': req.params.license } },
            { $sort: { 'log.date': -1 }},
            { $project: { 
               customID, balance: '$bank',
               log: { 
                  $slice: [{
                     $filter: {
                        input: '$log',
                        as: 'item', 
                        cond: { $eq: [ '$$item.from', 'bank' ] } 
                     }
                  }, -req.query.limit || -10] 
               }
            }}
         ]))[0];

         data.log.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// -- 
router.post('/transfer', licenseDecrypt, async (req, res) => {   
   try {
      const validation = validateSchema(req.body);
      if (validation.error) return res.status(401).send( validation.error.details[0].path[0]);

      req.body.amount = parseInt(req.body.amount);

      const balance = (await Money.findOne({ license: req.query.license }).select('bank')).bank;
      if (balance < req.body.amount || req.body.amount < 1000) return res.send('Balance');
      
      let findUser = await User.findOne({ customID: req.body.to }).select('license customID character.identifier.name');
      if (!findUser) return res.send('User');

      const mianUser = await User.findOne({ license: req.query.license }).select('customID character.identifier.name');
      const logReceive = {
         from: 'bank',
         type: 'receive',
         amount: req.body.amount
      }

      logReceive.name = `(${mianUser.customID}) ${mianUser.character.identifier.name}`;
      await Money.updateOne({ license: findUser.license }, { $inc: { bank: req.body.amount }, $push: { log: logReceive } });

      const logTransfer = {
         name: `(${req.body.to}) ${findUser.character.identifier.name}`,
         from: 'bank',
         type: 'transfer',
         amount: req.body.amount
      }

      logTransfer.type = 'transfer';
      await Money.updateOne({ license: req.query.license }, { $inc: { bank: -req.body.amount }, $push: { log: logTransfer } });

      res.send({ log: logTransfer, other: { log: logReceive, customID: findUser.customID, name: findUser.character.identifier.name } });

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.post('/give', licenseDecrypt, async (req, res) => {   
   try {
      const validation = validateSchema(req.body);      
      if (validation.error) return res.status(401).send(validation.error.details[0].path[0]);

      req.body.amount = parseInt(req.body.amount);

      const queryUpdate = req.body.from === 'cash' ? { cash: req.body.amount } : { bank: req.body.amount };
      const license = req.body.license;
      delete req.body.license;

      await Money.updateOne(
         { license }, 
         { 
            $inc: queryUpdate, 
            $push: { log: { ...req.body, from: req.body.from || 'bank', type: 'receive' } } 
         }
      );

      res.send('DONE!');

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});


// -- 
router.put('/:license', licenseDecrypt, async (req, res) => {   
   try {
      const validation = validateSchema(req.body);
      if (validation.error) return res.status(401).send( validation.error.details[0].path[0]);

      req.body.price = parseInt(req.body.price);

      const queryUpdate = req.body.from === 'cash' ? { cash: -req.body.price } : { bank: -req.body.price };

      const log = { 
         from: req.body.from, 
         name: req.body.name, 
         type: 'transfer',
         amount: req.body.price
      } 
      const data = await Money.findOneAndUpdate(
         { license: req.params.license }, 
         {
            $inc: queryUpdate, 
            $push: { log }
         }
      ).select('-log');

      if (req.body.price > data[req.body.from]) { // for hack
         await givePlayerBan(
            req.params.license,
            req.body.playerID,
            'لقد تم حظرك لاستخدام ثغرات او برامج الغش للحصول علي المال.',
            { isForever: true, reason: 'استخدام ثغرات او برامج الغش للحصول علي المال', from: 'النظام' }
         );
      }

      res.send({ _id: Date.now(), ...log });

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;