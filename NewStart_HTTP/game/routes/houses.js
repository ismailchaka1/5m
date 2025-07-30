const express = require('express');
const router = express.Router();
const { House, validateSchema } = require('../../models/house');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');

// -- 
router.get('/:license', licenseDecrypt, async (req, res) => {   
   try {
      let data = null;

      if (req.query.type === 'normal') {
         data = await House.find({ license: req.params.license }).select('-items');

      } else if (req.query.type === 'existence') {
         const find = await House.findOne({ code: req.query.code }).select('_id');
         if (find) data = { isExisting: true };

      } else if (req.query.type === 'codes') {
         data = {};
         data.public = await House.find().select('-_id code');
         data.private = await House.find({ license: req.params.license }).select('-_id code');

      } else if (req.query.filter) {
         data = await House.findOne({ code: req.query.code }).select(req.query.filter.split(',').join(' '));
      }
      
      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// -- 
router.post('/:license', licenseDecrypt, async (req, res) => {   
   try {
      const validation = validateSchema(req.body);
      if (validation.error) return res.status(401).send( validation.error.details[0].path[0]);

      const count = await House.find({ license: req.params.license }).countDocuments();
      if (count >= 2) return res.send('house count'); // and edit in client side

      const house = new House({ license: req.params.license, ...req.body });
      await house.save();

      res.send({});

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.delete('/:license', licenseDecrypt, async (req, res) => {   
   try { 
      const house = await House.findOne({ license: req.params.license, code: req.body.code }).select('isLoan');
      if (house.isLoan) return res.send({ isLoan: true });

      await House.deleteOne({ license: req.params.license, code: req.body.code });
      res.send({ isDone: !!house });

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;