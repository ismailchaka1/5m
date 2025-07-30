const express = require('express');
const router = express.Router();
const { Inventory, validateSchema } = require('../../models/inventory');
const { Money } = require('../../models/money');
const { Vehicle } = require('../../models/vehicle');
const { JobVehicle } = require('../../models/jobVehicle');
const { House } = require('../../models/house');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');
const staticItems = require('../../services/static/items.json');
const continuousItems = [1, ...staticItems.filter(obj => !obj.isTaboo).map(item => item.id)]; // and edit in inventory => NewStart_Tools

// --
router.get('/', async (req, res) => {   
   try {
      let data = {};
      
      if (req.query.type === 'main') {
         data = await Inventory.findOne({ license: req.query.license }).select('items');

      } else if (req.query.type === 'vehicle') {
         data = await Vehicle.findOne({ license: req.query.license, 'plate.name': req.query.id }).select('items hash');

      } else if (req.query.type === 'jobVehicle') {
         data = await JobVehicle.findOne({ license: req.query.license, type: 'general', jobID: parseInt(req.query.id) }).select('items maxKG');

      } else if (req.query.type === 'faction') {
         data = await JobVehicle.findOne(req.query).select('items hash');

      } else if (req.query.type === 'house') {
         data = await House.findOne({ license: req.query.license, code: req.query.id }).select('items');
      }

      if (data.items.some(i => i.count > 1 && staticItems.find(s => s.id === i.id).unique)) {
         for (let item of data.items) {
            if (item.count > 1 && staticItems.find(s => s.id === item.id).unique) {
               item.count = 1;
            }
         }
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// -- add item
router.post('/:license', licenseDecrypt, async (req, res) => {   
   try {
      const validation = validateSchema(req.body);
      if (validation.error) return res.status(401).send( validation.error.details[0].path[0]);

      const findStatic = staticItems.find(i => i.id === req.body.id);
      const findItem = await Inventory.findOne({ license: req.params.license, 'items.id': req.body.id }).select('items');

      if (findItem && !findStatic.unique && !findItem.items.find(obj => obj.id === req.body.id && req.body.features)) {
         await Inventory.updateOne(
            { license: req.params.license, 'items.id': req.body.id },
            !req.body.noInc ? { $inc: { 'items.$.count': req.body.count }} : { $set: { 'items.$.count': req.body.count }}
         );

      } else {
         if (findStatic.unique && req.body.count > 1) {
            const items = [];
            for (let i = 0; i < req.body.count; i++) items.push({ ...req.body, count: 1 });

            await Inventory.updateOne({ license: req.params.license }, { $push: { items: { $each: items }}});

         } else {
            await Inventory.updateOne({ license: req.params.license }, { $push: { items: req.body } });
         }
      }

      const items = (await Inventory.findOne({ license: req.params.license }).select('items')).items;
      res.send(items);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// -- use item
router.put('/', licenseDecrypt, async (req, res) => {   
   try {
      const validation = validateSchema(req.body);
      if (validation.error) return res.status(401).send( validation.error.details[0].path[0]);

      if (req.body.action === 'decrease') {
         await Inventory.updateOne({ license: req.body.license, 'items.id': req.body.id }, { $inc: { 'items.$.count': -1 } });

      } else {
         await Inventory.updateOne({ license: req.body.license }, { $pull: { items: { id: req.body.id } } });
      }

      const items = (await Inventory.findOne({ license: req.body.license }).select('items')).items;
      res.send(items);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});
// -- edit item
router.put('/edit', async (req, res) => {   
   try {
      const validation = validateSchema(req.body);
      if (validation.error) return res.status(401).send( validation.error.details[0].path[0]);

      await Inventory.updateOne({ license: req.body.license, 'items._id': req.body._id }, { $set: { 'items.$.features': req.body.value } });
      res.send('DONE!');

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.put('/transfer', licenseDecrypt, async (req, res) => {   
   try {
      let reception, items = null;

      const handleDecrease = async (Model, search) => {
         const find = staticItems.find(i => i.id === req.body.item.id);

         if (req.body.from.action === 'decrease' && !find.unique) {
            const result = await Model.updateOne(
               { ...search, 'items.id': req.body.item.id }, 
               { $inc: { 'items.$.count': -req.body.item.count } }
            );

            if (!result.matchedCount) throw 'item';

         } else {
            const arr = (await Model.findOne(search).select('items')).items;
            const index = arr.findIndex(obj => (
               obj.id === req.body.item.id && 
               obj.count === req.body.item.count &&
               Object.entries(obj.features || {}).sort().toString() === 
               Object.entries(req.body.item.features || {}).sort().toString()
            ));
            
            if (index < 0) throw 'item';
            arr.splice(index, 1);
            if (req.body.from.name === 'main') items = arr;

            await Model.updateOne(search, { $set: { items: arr } });
         }
      }

      const handleAddItem = async (Model, search) => {
         const findItem = await Model.findOne({ ...search, 'items.id': req.body.item.id }).select('items');
         const staticItem = staticItems.find(i => i.id === req.body.item.id);

         if (!staticItem.unique && findItem && !findItem.items.find(obj => obj.id ===  req.body.item.id && req.body.item.features)) {
            await Model.updateOne({ ...search, 'items.id': req.body.item.id }, { $inc: { 'items.$.count': req.body.item.count } });
   
         } else {
            await Model.updateOne(search, { $push: { items: req.body.item } });
         }
      }

      // remove or decrease
      if (req.body.from.name === 'main') { // with inventory
         reception = 'other';
         await handleDecrease(Inventory, { license: req.body.license });

      } else { // with other
         reception = 'main';

         if (req.body.other.type === 'vehicle') {
            await handleDecrease(Vehicle, { license: req.body.license, 'plate.name': req.body.other.id });

         } else if (req.body.other.type === 'player') {
            await handleDecrease(Inventory, { license: req.body.other.license });

         } else if (req.body.other.type === 'jobVehicle') {
            await handleDecrease(JobVehicle, { license: req.body.license, type: 'general', jobID: req.body.other.id });

         } else if (req.body.other.type === 'faction') {
            await handleDecrease(JobVehicle, { license: req.body.license, type: 'faction', hash: req.body.other.id, jobID: req.body.other.otherID });

         } else if (req.body.other.type === 'house') {
            await handleDecrease(House, { license: req.body.license, code: req.body.other.id });
         }
      }

      // add
      if (reception === 'main') {
         await handleAddItem(Inventory, { license: req.body.license });

      } else {
         if (req.body.other.type === 'vehicle') {
            await handleAddItem(Vehicle, { license: req.body.license, 'plate.name': req.body.other.id });

         } else if (req.body.other.type === 'player') {
            await handleAddItem(Inventory, { license: req.body.other.license });
            if (req.body.item.id === 1) await Money.updateOne({ license: req.body.other.license }, { $inc: { cash: req.body.item.count } });

         } else if (req.body.other.type === 'jobVehicle') {
            await handleAddItem(JobVehicle, { license: req.body.license, type: 'general', jobID: req.body.other.id });

         } else if (req.body.other.type === 'faction') {
            await handleAddItem(JobVehicle, { license: req.body.license, type: 'faction', hash: req.body.other.id, jobID: req.body.other.otherID });

         } else if (req.body.other.type === 'house') {
            await handleAddItem(House, { license: req.body.license, code: req.body.other.id });
         }
      }

      // Done
      if (!items) items = (await Inventory.findOne({ license: req.body.license }).select('items')).items;
      res.send(items);

   } catch(err) {
      if (err !== 'item') console.log(err);
      res.status(400).send(err);
   }
});

// -- 
router.delete('/:license', licenseDecrypt, async (req, res) => {
   try {      
      let items = null;

      const handleRemove = (Model, search) => {
         if (req.body.isClear || !req.body.count) {
            return Model.updateOne(search, { $pull: { items: { _id: req.body._id } } });
            
         } else {
            return Model.updateOne({ ...search, 'items._id': req.body._id }, { $inc: { 'items.$.count': -req.body.count } });
         }
      }

      if (req.body.from === 'removeAll') {
         await Inventory.updateOne({ license: req.params.license }, { $pull: { items: { id: { $nin: continuousItems }}}});

      } else if (req.body.from === 'main') { // Inventory
         await handleRemove(Inventory, { license: req.params.license });

      } else if (req.body.from === 'other') {
         if (req.body.otherInfo.type === 'vehicle') {
            await handleRemove(Vehicle, { license: req.params.license, 'plate.name': req.body.otherInfo.id });

         } else if (req.body.otherInfo.type === 'jobVehicle') {
            await handleRemove(JobVehicle, { license: req.params.license, type: 'general', jobID: req.body.otherInfo.id });

         } else if (req.body.otherInfo.type === 'faction') {
            await handleRemove(JobVehicle, { license: req.params.license, type: 'faction', hash: req.body.otherInfo.id, jobID: req.body.otherInfo.otherID });

         } else if (req.body.otherInfo.type === 'house') {
            await handleRemove(House, { license: req.params.license, code: req.body.otherInfo.id });
         }

         return res.send('DONE!');
      }
      
      if (['removeAll', 'main'].includes(req.body.from)) {
         items = (await Inventory.findOne({ license: req.params.license }).select('items')).items;
      }

      res.send(items);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;