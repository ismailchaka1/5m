const express = require('express');
const router = express.Router();
const { Police } = require('../../models/police');
const { User } = require('../../models/user');
const { Vehicle } = require('../../models/vehicle');
const licenseDecrypt = require('../../middlewares/licenseDecrypt');
const { webURL } = require('../../services/config');

// --- 
router.get('/', licenseDecrypt, async (req, res) => {   
   try {
      let data = {};

      if (req.query.type === 'home') {
         // if edit time => change in Handle_HTTP/police/config.js
         await Vehicle.updateMany({'wanted.lastEdit': { $lte: Date.now() - 1800000, $exists: true }}, { $set: { wanted: { title: '' }}}); // 0.5h
         await Police.updateMany({'status.lastEdit': { $lte: Date.now() - 1800000, $exists: true }}, { $set: { status: { title: '', note: '' }}}); // 0.5h

         data.players = await Police.find({ 'status.title': { $ne: '' } }).select('license');
         for (let item of data.players) item.image = `${webURL}/game/photo?model=police&id=${item._id}&date=${Date.now()}`;

         data.wanted = await User.find({ license: { $in: data.players.map(p => p.license) }}).select('-_id license customID character.identifier.name');
         data.vehicles = await Vehicle.find({ 'wanted.title': { $ne: '', $exists: true } }).select('-_id plate.name name');

      } else if (req.query.type === 'player') {
         data = await Police.findOne({ license: req.query.license })
            .select({ jail: { $slice: -15 }, records: { $slice: -25 }, violations: { $slice: -15 } }).select('-status._id');

         data.image = `${webURL}/game/photo?model=police&id=${data._id}&date=${Date.now()}`;
         data.jail = data.jail.filter(i => i.type).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
         data.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
         data.violations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      } else if (req.query.type === 'violations') {
         const arr1 = (await Police.findOne({ license: req.query.license }).select('violations')).violations;
         const arr2 = []; // لو عايز تضيف مخالفات تانية

         data = arr1.concat(arr2).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      } else if (req.query.type === 'getRecords') {
         data = await Police.findOne({ license: req.query.license })
            .select({ jail: { $slice: -30 }, records: { $slice: -30 }}).select('-_id -status -license -jailed -violations -image');
         
         data.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
         data.jail = data.jail.filter(i => i.type).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      } else if (req.query.filter) {
         data = await Police.findOne({ license: req.query.license }).select(req.query.filter.split(',').join(' '));
      }
      
      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// --- 
router.put('/:license', licenseDecrypt, async (req, res) => {   
   try {
      if (['records', 'violations'].includes(req.body.type)) {
         await Police.updateOne({ license: req.params.license }, { $push: { [req.body.type]: req.body.item }});

      } else if (req.body.type === 'jail') {
         await Police.updateOne(
            { license: req.params.license }, 
            { $push: { jail: req.body.item }, $set: { jailed: req.body.item.duration, status: { title: '', note: '' }}}
         );

      } else if (req.body.type === 'status') {
         await Police.updateOne({ license: req.params.license }, { $set: { status: { ...req.body.item, lastEdit: new Date() } }});

      } else if (req.body.type === 'removeViolation') {
         if (req.body.model === 'police') {
            await Police.updateOne({ license: req.params.license }, { $pull: { violations: { _id: req.body.id }}});
         } 

      } else if (req.body.type === 'jailed') {
         await Police.updateOne({ license: req.params.license }, req.body.value ? { $inc: { jailed: -req.body.value }} : { $set: { jailed: 0 }});

      } else if (req.body.type === 'removeRecord') {
         await Police.updateOne({ license: req.params.license }, { $pull: { [req.body.property]: { _id: req.body.id }}});

      } else if (req.body.type === 'set') {
         await Police.updateOne({ license: req.params.license }, { $set: req.body.data });
      }
      
      res.send('DONE!');

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

module.exports = router;