/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const Joi = require('joi');

// ---
const Money = mongoose.model('money', new mongoose.Schema({
   license: {
      type: String,
      unique: true
   },
   cash: {
      type: Number,
      default: 5000
   },
   bank: {
      type: Number,
      default: 20000
   },
   log: {
      type: [
         new mongoose.Schema({
            name: String,
            from: String,
            type: String,
            amount: Number,
            date: {
               type: Date,
               default: Date.now
            }
         })
      ],
      default: []
   }
}));

// ---
function validateSchema(body) {
   let schema = Joi.object({
      license: Joi.string(),
      from: Joi.string(),
      price: Joi.number(),
      name: Joi.string(),
      to: Joi.string(),
      amount: Joi.number(),
      playerID: Joi.number().integer()
   });

   return schema.validate(body);
}

module.exports = { Money, validateSchema };