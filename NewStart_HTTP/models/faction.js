/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const Joi = require('joi');

// ---
const Faction = mongoose.model('faction', new mongoose.Schema({
   type: String,
   key: String,
   name: String,
   radio: Number,
   maxPlayers: Number,
   players: {
      type: [
         new mongoose.Schema({
            user: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'user'
            },
            code: String,
            time: Number,
            status: String,
            rankID: Number,
            subRankID: Number,
            giveVacations: Boolean
         })
      ],
      default: []
   },
   ranks: [
      new mongoose.Schema({
         id: Number,
         name: String,
         isAdmin: Boolean
      })
   ],
   phone: {
      type: Number,
      unique: true
   }
}));

// ---
function validateSchema(body) {
   let schema = Joi.object({});

   return schema.validate(body);
}

module.exports = { Faction, validateSchema };