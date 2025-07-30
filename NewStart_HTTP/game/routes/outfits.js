const express = require('express');
const router = express.Router();
const { Outfit, validateSchema } = require('../../models/outfit');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');

// -- 
router.get('/:license', licenseDecrypt, async (req, res) => {   
   try {
      const data = await Outfit.find({ license: req.params.license }).select('-license').sort({ _id: -1 });

      if (data.length > 10) {
         let ids = data.slice(10);
         ids = ids.map(obj => obj._id);

         await Outfit.deleteMany({ _id: { $in: ids }});
         data.splice(10);
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

      const outfit = new Outfit({ license: req.params.license, ...req.body });
      await outfit.save();

      res.send('DONE!');

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;