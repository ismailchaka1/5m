/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const Joi = require('joi');

// ---
const Inventory = mongoose.model('inventory', new mongoose.Schema({
   license: {
      type: String,
      unique: true
   },
   items: {
      type: [
         new mongoose.Schema({
            id: {
               type: Number,
               required: true
            },
            count: {
               type: Number,
               required: true
            },
            features: mongoose.Schema.Types.Mixed
         })
      ],
      default: []
   }
}));

// ---
function validateSchema(body) {
   let schema = Joi.object({
      license: Joi.string(),
      id: Joi.number(),
      _id: Joi.string(),
      count: Joi.number(),
      features: Joi.any(),
      action: Joi.string(),
      from: Joi.string(),
      otherInfo: Joi.object(),
      noInc: Joi.boolean(),
      value: Joi.any(),
   });

   return schema.validate(body);
}

module.exports = { Inventory, validateSchema };