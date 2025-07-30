/* ``````````` ## Development By el8rbawY ## ```````````*/
const express = require('express');
const router = express.Router();
const { Loan, validateSchema } = require('../../models/loan');
const { Vehicle } = require('../../models/vehicle');
const { User } = require('../../models/user');
const { Money } = require('../../models/money');
const { House } = require('../../models/house');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');

// ---
router.get('/', licenseDecrypt, async (req, res) => {
   try {
      let warranty = null;

      if (req.query.type === 'checkTax') {
         warranty = await Loan.findOne({ license: req.query.license, status: 1 }).select('interest');
         
      } else if (req.query.byID) {
         warranty = await Loan.findById(req.query.byID).select('interest');
      }

      if (warranty) {
         warranty = { id: warranty._id, interest: warranty.interest }
      }

      res.send(warranty);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.get('/data/:license', licenseDecrypt, async (req, res) => {
   try {
      let data = { warranties: {} }, end = null;

      // check data
      const warranty = await Loan
         .findOneAndUpdate({ license: req.params.license, status: 1, end: { $lte: new Date() } }, { $set: { status: 3 } }).select('type item name');
      
      if (warranty?.type === 'vehicle') {
         await Vehicle.deleteOne({ _id: warranty.item });
         end = { type: 'vehicle', id: warranty.item, name: warranty.name };

      } else if (warranty?.type === 'house') {
         const code = (await House.findOneAndRemove({ _id: warranty.item }).select('code')).code;
         const vehicles = (await Vehicle.find({ 'garage.code': code }).select('_id')).map(v => v._id);

         await Vehicle.updateMany({ 'garage.code': code }, { $unset: { garage: '' } });
         end = { type: 'house', name: warranty.name, code, vehicles };
      }

      // get data
      data.warrantiesHistory = await Loan.find({ license: req.params.license }).sort({ status: 1, registration: -1 }).limit(15);
      data.warranties.vehicles = await Vehicle.find({ license: req.params.license, isLoan: { $ne: true } }).select('name hash');
      data.warranties.houses = await House.find({ license: req.params.license, isLoan: { $ne: true } }).select('name code');

      const user = await User.findOne({ license: req.params.license }).select('customID character.identifier.name');
      const money = (await Money.aggregate([
         { $match : { 'license': req.params.license } },
         { $sort: { 'log.date': -1 }},
         { $project: { 
            balance: '$bank',
            log: { $slice: [{ $filter: { input: '$log', as: 'item', cond: { $eq: [ '$$item.from', 'bank' ]}}}, -30] }
         }}
      ]))[0];

      money.log.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      data.name = user.character.identifier.name;
      data.customID = user.customID;
      data.balance = money.balance;
      data.history = money.log;

      res.send({ data, end });
      
   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.post('/:license', licenseDecrypt, async (req, res) => {
   try {
      const validation = validateSchema(req.body);
      if (validation.error) return res.status(401).send( validation.error.details[0].path[0]);

      const warranty = await Loan.findOne({ license: req.params.license, status: 1 }).select('_id');
      if (warranty) return res.send('unacceptable');

      if (req.body.type === 'vehicle') {
         await Vehicle.updateOne({ _id: req.body.item }, { $set: { isLoan: true } });

      } else if (req.body.type === 'house') {
         await House.updateOne({ _id: req.body.item }, { $set: { isLoan: true } });
      }

      const loan = new Loan({ license: req.params.license, ...req.body });
      await loan.save();

      res.send(loan);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.put('/:license', licenseDecrypt, async (req, res) => {
   try {
      let data = null;

      if (req.body.type === 'doneStatus') {
         const loan = await Loan.findByIdAndUpdate(req.body.id, { $set: { status: 2, interest: 0 } }).select('type item');
         data = { id: loan.item._id };
   
         if (loan.type === 'vehicle') {
            await Vehicle.updateOne({ _id: data.id }, { $set: { isLoan: false } });

         } else if (loan.type === 'house') {
            await House.updateOne({ _id: data.id }, { $set: { isLoan: false } });
         }

      } else {
         const status = req.body.interest ? 1 : 2;
         const loan = await Loan.findByIdAndUpdate(req.body.id, { $set: { interest: req.body.interest, status } }).select('type item');

         if (status === 2) {
            if (loan.type === 'vehicle') {
               await Vehicle.updateOne({ _id: loan.item }, { $set: { isLoan: false } });

            } else if (loan.type === 'house') {
               await House.updateOne({ _id: loan.item }, { $set: { isLoan: false } });
            }
         }
      }
      
      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;