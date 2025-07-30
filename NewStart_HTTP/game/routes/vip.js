/* ``````````` ## Development By el8rbawY ## ```````````*/
const express = require('express');
const router = express.Router();
const { Vip } = require('../../models/vip');
const { User } = require('../../models/user');
const { removeVip } = require('../../discord/vip');

// -- 
router.get('/:license', async (req, res) => {   
   try {
      let data = {};

      if (req.query.filter) {
         data = await Vip.findOne({ license: req.params.license }).select(req.query.filter.split(',').join(' '));
      }
      
      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// -- 
router.put('/:license', async (req, res) => {   
   try {
      let data = null;

      if (req.body.type === 'doubleExp') {
         await Vip.updateOne(
            { license: req.params.license, 'doubleExp._id': req.body.id }, 
            req.body.isZero ? { $set: { 'doubleExp.$.timer': 0 }} : { $inc: { 'doubleExp.$.timer': -60000 }}
         );

      } else if (req.body.type === 'endVip') {
         const user = await User.findOne({ license: req.params.license }).select('discord license vip');
         const vip = await Vip.findOne({ license: req.params.license }).select({ sponsors: { $slice: -10 }});
         data = await removeVip(req.body.id, user, vip.sponsors);
      }
      
      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;