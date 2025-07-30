/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const Joi = require('joi');

// ---
const Phone = mongoose.model('phone', new mongoose.Schema({
   license: String,
   number: {
      type: String,
      unique: true
   },
   contacts: {
      type: [
         new mongoose.Schema({
            name: String,
            number: String
         })
      ],
      default: []
   }
}));

// ---
function validateSchema(body) {
   let schema = Joi.object({
      type: Joi.string(),
      name: Joi.string(),
      number: Joi.string().required()
   });

   return schema.validate(body);
}

module.exports = { Phone, validateSchema };