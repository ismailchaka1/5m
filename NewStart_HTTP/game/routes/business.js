const express = require('express');
const router = express.Router();
const { Business } = require('../../models/business');

// -- 
router.get('/commercial/:license', async (req, res) => {   
   try {
      const business = await Business.findOne({ license: req.params.license }).slice('log', -50);
      let data = null;

      if (business) {
         const labels = getRecentDates();
         data = { ...JSON.parse(JSON.stringify(business)), chart: { labels, data: [] }};
      }
      
      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// -- 
router.post('/:license', async (req, res) => {   
   try {
      const business = new Business({ license: req.params.license });
      await business.save();
     
      const data = { ...JSON.parse(JSON.stringify(business)), chart: { labels: getRecentDates(), data: [] }};
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

      if (req.body.type === 'giveLic') { // giveLic
         await Business.findOneAndUpdate({ license: req.params.license }, { $unset: { licInfo: '' }});

         data = await Business.findOneAndUpdate({ license: req.params.license }, { 
            $set: { licInfo: { ...req.body.info, items: [], employees: [], warnings: [] }},
         }, { new: true }).slice('log', -50);

      } else if (req.body.type === 'money') { // money
         const result = await Business.findOne({ license: req.params.license }).select('money');
         const log = { type: req.body.action, name: req.body.name, amount: req.body.value };
         if (req.body.reason) log.reason = req.body.reason;
         
         if (req.body.action === 'deposit') {
            data = await Business.findOneAndUpdate({ license: req.params.license }, { $inc: { money: req.body.value }, $push: { log }}, { new: true }).slice('log', -50);

         } else if (req.body.action === 'withdraw' && req.body.value && result.money >= req.body.value) {
            data = await Business.findOneAndUpdate({ license: req.params.license }, { $inc: { money: -req.body.value }, $push: { log }}, { new: true }).slice('log', -50);
         }

         if (data) data = { ...JSON.parse(JSON.stringify(data)), chart: { labels: getRecentDates(), data: [] }};

      } else if (req.body.type === 'changeInfo') { // changeInfo
         data = await Business.findOneAndUpdate({ license: req.params.license }, { $set: req.body.info }, { new: true }).slice('log', -50);
         data = { ...JSON.parse(JSON.stringify(data)), chart: { labels: getRecentDates(), data: [] }};

      } else if (req.body.type === 'items') { // items
         let items = null;
         
         if (req.body.info.action === 'updateAll') {
            items = req.body.info.items;

         } else {
            items = JSON.parse(JSON.stringify((await Business.findOne({ license: req.params.license }).select('licInfo.items')).licInfo.items));

            if (req.body.info.action === 'add') {
               const find = items.find(i => i.id === req.body.info.id);
               if (find) find.count += req.body.info.count;
               else items.push(req.body.info);
   
            } else {
               const index = items.findIndex(i => i._id === req.body.info._id);
               if (index >= 0) items.splice(index, 1);
            }
         }

         data = await Business.findOneAndUpdate({ license: req.params.license }, { $set: { 'licInfo.items': items }}, { new: true }).slice('log', -50);
         data = { ...JSON.parse(JSON.stringify(data)), chart: { labels: getRecentDates(), data: [] }};
      }

      res.send(data);

   } catch(err) {
      console.log(err);
      res.status(400).send(err);
   }
});

// ---
function getRecentDates() {
   const recentDates = Array.from({ length: 8 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return `${date.getDate()}/${date.getMonth() + 1}`;
   });
   return recentDates;
}

module.exports = router;