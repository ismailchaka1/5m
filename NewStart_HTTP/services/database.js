/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const { Faction } = require('../models/faction');
const roles = require('../services/static/roles.json');

// ---
mongoose.set('strictQuery', false);
mongoose.connect(
   'mongodb+srv://el8rbawy:U17RccvFmxtXp6E6@newstart-fivem.oa56o.mongodb.net/official?retryWrites=true&w=majority',
{
   useNewUrlParser: true, 
   useUnifiedTopology: true

}).then(_=> {
   console.log('Database has been connected!');
   INITIAL_FACTIONS();

}).catch(err => {
   console.error(err)
});

// ---
async function INITIAL_FACTIONS() {
   const count = await Faction.find().countDocuments();
 
   if (!count) {
      const items = [ // and edit in NewStart_HandleHTTP
         new Faction({ 
            type: 'official', 
            name: 'قطاع الأمن العام', 
            radio: 1, 
            maxPlayers: 100, 
            key: 'police', 
            phone: 911,
            ranks: roles.police.map(({ id, rankID, ...other }) => ({ id: rankID, ...other }))
         }),
         new Faction({ 
            type: 'official', 
            name: 'قطاع أمن المنشآت', 
            radio: 7, 
            maxPlayers: 100, 
            key: 'facilities', 
            phone: 997,
            ranks: roles.facilities.map(({ id, rankID, ...other }) => ({ id: rankID, ...other }))
         }),
         new Faction({ 
            type: 'official', 
            name:'قطاع الدفاع المدني', 
            radio: 13, 
            maxPlayers: 100, 
            key: 'health', 
            phone: 999,
            ranks: roles.health.map(({ id, rankID, ...other }) => ({ id: rankID, ...other }))
         })
      ];

      await Faction.insertMany(items);
   }
}