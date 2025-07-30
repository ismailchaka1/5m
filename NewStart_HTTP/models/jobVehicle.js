/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const Joi = require('joi');

// ---
const JobVehicle = mongoose.model('jobVehicle', new mongoose.Schema({
   license: String,
   type: String,
   jobID: mongoose.Schema.Types.Mixed,
   maxKG: Number,
   hash: String,
   items: {
      type: [
         new mongoose.Schema({
            id: Number,
            count: Number,
            features: mongoose.Schema.Types.Mixed
         })
      ],
      default: []
   }
}));

// ---
function jobVehValidateSchema(body) {
   let schema = Joi.object({
      license: Joi.string(),
      type: Joi.string(),
      jobID: Joi.number().integer(),
      maxKG: Joi.number().integer(),
      hash: Joi.any()
   });

   return schema.validate(body);
}

module.exports = { JobVehicle, jobVehValidateSchema };