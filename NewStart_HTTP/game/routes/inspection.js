/* ``````````` ## Development By el8rbawY ## ```````````*/
const express = require('express');
const router = express.Router();
const { User } = require('../../models/user');
const { Inventory } = require('../../models/inventory');
const { Vehicle } = require('../../models/vehicle');
const { JobVehicle } = require('../../models/jobVehicle');
const { House } = require('../../models/house');
const staticItems = require('../../services/static/items.json');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');  

// ---
router.post('/', licenseDecrypt, async (req, res) => {
   try {
      let data = {};
      const player = await User.findOne({ license: req.body.player }).select('job job2 customID character.identifier.name');

      if (req.body.type === 'player') {
         const user = await User.findOne({ license: req.body.license }).select('job customID');

         data = { customID: user.customID, name: player.character.identifier.name };
         data.items = (await Inventory.findOne({ license: req.body.player }).select('items')).items;

      } else if (req.body.type === 'house') {
         data.name = `العقار ${req.body.code}`;
         data.items = (await House.findOne({ code: req.body.code }).select('items')).items;
         
      } else if (req.body.type === 'vehicle') {
         data.name = '';

         if (req.body.plate) {
            data.items = (await Vehicle.findOne({ 'plate.name': req.body.plate }).select('items')).items;

         } else {         
            const response = await JobVehicle.findOne({ license: req.body.player, $or: [{ hash: req.body.hash }, { hash: req.body.hashOther }], $or: [{ type: player.job?.type }, { type: player.job2?.type }] }).select('items');

            if (response) data.items = response.items;
            else data = { noInventory: true };
         }
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.put('/', licenseDecrypt, async (req, res) => {   
   try {
      let data = {}, items;

      if (req.body.type === 'player') {
         items = (await Inventory.findOneAndUpdate(
            { license: req.body.playerLicense }, { $pull: { items: { _id: { $in: req.body.items }}}}
         )).items;

      } else if (req.body.type === 'house') { 
         items = (await House.findOneAndUpdate(
            { code: req.body.code }, { $pull: { items: { _id: { $in: req.body.items }}}}
         )).items;

      } else {
         let Model, search;
         
         if (req.body.plate) {
            Model = Vehicle;
            search = { 'plate.name': req.body.plate };

         } else {
            const jobType = (await User.findOne({ license: req.body.playerLicense }).select('job')).job.type;
            Model = JobVehicle;
            search = { license: req.body.playerLicense, $or: [{ hash: req.body.hash }, { hash: req.body.hashOther }], type: jobType };
         }

         items = (await Model.findOneAndUpdate(search, { $pull: { items: { _id: { $in: req.body.items }}}})).items;
      }

      // start conversion
      const parseItems = JSON.parse(JSON.stringify(items));
      data.logItems = parseItems.filter(obj => req.body.items.includes(obj._id)).map(i => ({ name: staticItems.find(s => s.id === i.id).title, count: i.count }));
      if (req.body.type === 'player') data.playerItems = parseItems.filter(obj => !req.body.items.includes(obj._id));

      // handle user
      let filter = parseItems.filter(obj => req.body.items.includes(obj._id));

      filter = filter.map(({ _id, ...rest }) => rest).filter(f => {
         const find = staticItems.find(i => i.id === f.id);
         return !(find.type === 'weapon' && (find.hash || find.effect));
      });;
      
      let built = (await Inventory.findOne({ license: req.body.license })).items;
      built = JSON.parse(JSON.stringify(built));
      
      for (let index in filter) {
         const item = filter[index];
         const find = built.find(obj => obj.id === item.id);

         if (find && !item.features) {
            await Inventory.updateOne({ license: req.body.license, 'items.id': item.id }, { $inc: { 'items.$.count': item.count } });
            filter.splice(index, 1);
         }
      }

      if (filter.length) await Inventory.updateOne({ license: req.body.license }, { $push: { items: { $each: filter }}});
      data.userItems = (await Inventory.findOne({ license: req.body.license })).items;

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;