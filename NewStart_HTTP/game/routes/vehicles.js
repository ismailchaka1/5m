const express = require('express');
const router = express.Router();
const AsyncLock = require('async-lock');
const lock = new AsyncLock();
const { Vehicle, validateSchema } = require('../../models/vehicle');
const { JobVehicle, jobVehValidateSchema } = require('../../models/jobVehicle');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');

// -- 
router.get('/:license', licenseDecrypt, async (req, res) => {   
   try {
      let data = {};

      if (req.query.isGarage) {
         if (req.query.code) {
            data = await Vehicle.find({ license: req.params.license, 'garage.code': req.query.code }).select('plate.name garage');

         } else {
            const garage = req.query.load ? { 'garage.code': req.query.load } : 
               req.query.isAll === 'true' ? {} : { garage: { $exists: req.query.isGarage === 'true' }};

            if (req.query.length) {
               data.value = !!(await Vehicle.find({ license: req.params.license, ...garage }).countDocuments());

            } else {
               data = await Vehicle.find({ license: req.params.license, ...garage }).select('name garage hash plate.name fuel damage isReservation features dirt');
            }
         }

      } else if (req.query.plate) {
         const select = req.query.filter ? req.query.filter.split(',').join(' ') : '-license -items -features -violations -wanted';

         if (select.includes('violations') && !select.includes('-violations')) 
            data = await Vehicle.findOne({ 'plate.name': req.query.plate }).select(select).slice('violations', -15);
         else 
            data = await Vehicle.findOne({ 'plate.name': req.query.plate }).select(select);

      } else if (req.query.byID) {
         data = await Vehicle.findById(req.query.byID).select(req.query.filter.split(',').join(' '));

      } else if (req.query.filter) {
         data = await Vehicle.find({ license: req.params.license }).select(req.query.filter.split(',').join(' '));

      } else {
         data = await Vehicle.find({ license: req.params.license }).select('-license -items -features -violations');
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.post('/', licenseDecrypt, async (req, res) => {   
   try {
      const validation = validateSchema(req.body);
      if (validation.error) return res.status(401).send( validation.error.details[0].path[0]);

      if (req.query.skipLength === 'false') {
         const count = await Vehicle.find({ license: req.body.license }).countDocuments();

         if (count >= 15) {
            return res.status(400).send('Failed!');
         }
      }

      const numbers = [];
      for (let i = 1; i <= 250; i++) numbers.push(generatPlate());

      lock.acquire('apiCallLock', async () => {
         const similarity = await Vehicle.find({ 'plate.name': { $in: numbers } }).select('plate.name');
         let unique = numbers.filter(id => !similarity.some(i => i.plate.name === id))[0];
   
         if (unique) {
            const vehicle = new Vehicle({ plate: { name: generatPlate(), color: 0 }, ...req.body });
            await vehicle.save();
            res.send({ id: vehicle._id, hash: vehicle.hash, plate: vehicle.plate.name });
   
         } else {
            res.send('NotFound');
         }
      });

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
router.post('/job', licenseDecrypt, async (req, res) => {
   const validation = jobVehValidateSchema(req.body);
   if (validation.error) return res.status(401).send( validation.error.details[0].path[0]);

   const find = await JobVehicle.findOne({ license: req.body.license, type: req.body.type, jobID: req.body.jobID }).select('type jobID');
   if (find) return res.send('DONE!');

   const vehicle = new JobVehicle(req.body);
   await vehicle.save();
   
   res.send('DONE!');
});

// -- 
router.put('/', licenseDecrypt, async (req, res) => {   
   try {
      if (!req.body.pushType) {
         const validation = validateSchema(req.body);
         if (validation.error) return res.status(401).send(validation.error.details[0].path[0]);
      }

      const plate = req.body.plate;
      // const license = req.body.license;

      delete req.body.plate;
      delete req.body.license;

      if (req.query.unset && req.query.unset !== 'null') {
         await Vehicle.updateOne({ 'plate.name': plate }, { $unset: { [req.query.unset]: '' } });

      } else if (req.body.pushType) {
         await Vehicle.updateOne({ 'plate.name': plate }, { $push: { [req.body.pushType]: req.body }});

      } else {
         await Vehicle.updateOne({ 'plate.name': plate }, { $set: req.body });
      }

      res.send('DONE!');

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

function generatPlate() {
   const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   const numbers = '0123456789';
 
   let id = '';
   
   for (let i = 0; i < 3; i++) id += letters.charAt(Math.floor(Math.random() * letters.length));
   id += ' '; // space
   for (let i = 0; i < 4; i++) id += numbers.charAt(Math.floor(Math.random() * numbers.length));
   return id;
}

module.exports = router;