const { User } = require('../models/user');
const { Vip } = require('../models/vip');
const DISCORD_BOT = require('./index'); 
const items = require('../services/static/store.json');

async function removeVip(refID, user, vip) {
   let data = {}, roleKeep = false;

   if (user.vip.refID === refID) { // swap or remove
      const now = Date.now();
      const item = vip.length ? vip.filter(i => (new Date(i.end).getTime() - 60000) > now).sort((a, b) => a.refID - b.refID)[0] : null;
      const find = item ? items.find(i => i.id === item.refID) : null;
      const query = item ? { $set: { vip: { type: find.type, title: find.name, name: find.features[0].value, end: item.end, refID: find.id }}} : { $unset: { vip: '' }}
      
      await User.updateOne({ license: user.license }, query);
      data = { vip: query.$set?.vip || null };
      roleKeep = user.vip.refID === query.$set?.vip.refID;

      if (!roleKeep) {
         const keys = { seaport: false, weapons: false, jobs: false, reservation: false };
         let update;

         if (query.$set) {
            const filter = items.find(i => i.id === query.$set.vip.refID).features.filter(i => i.type === 'tax');
            
            if (filter.length) {
               const taxes = filter.reduce((obj, item) => ({ ...obj, [item.value]: true }), {});
               update = { ...keys, ...taxes };

               await Vip.updateOne({ license: user.license }, { $set: { taxes: update }});
            }
            
         } else {
            update = keys;
            await Vip.updateOne({ license: user.license }, { $set: { taxes: keys }});
         }

         data.taxes = update;
      }
   }

   const find = items.find(i => i.id === refID);

   if (find && !roleKeep) {
      const roles = find.features.filter(i => i.type === 'discord' && !i.isAlways);

      for (let item of roles) {
         const member = await (await DISCORD_BOT.guilds.fetch('955495908462706688')).members.fetch(user.discord);
         member.roles.remove(item.value);
      }
   }

   return data;
}

module.exports = { removeVip };