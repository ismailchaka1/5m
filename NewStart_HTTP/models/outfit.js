/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const Joi = require('joi');

// ---
const Outfit = mongoose.model('Outfit', new mongoose.Schema({
   license: String,
   name: String,
   features: mongoose.Schema.Types.Mixed
}));

// ---
function validateSchema(body) {
   let schema = Joi.object({
      name: Joi.string().required(),
      features: Joi.object({
         mask: Joi.object(), 
         bag: Joi.object(),
         top: Joi.object(),
         hat: Joi.object(),
         glass: Joi.object(),
         ear: Joi.object(),
         torso: Joi.object(),
         shoe: Joi.object(),
         undershirt: Joi.object(),
         badge: Joi.object(),
         watch: Joi.object(),
         accessory: Joi.object(),
         bracelet: Joi.object(),
         leg: Joi.object(),
         armor: Joi.object()
      })
   });

   return schema.validate(body);
}

module.exports = { Outfit, validateSchema };