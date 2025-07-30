/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const Joi = require('joi');

// ---
const Vehicle = mongoose.model('vehicle', new mongoose.Schema({
   license: String,
   type: String,
   name: String,
   hash: mongoose.Schema.Types.Mixed,
   plate: new mongoose.Schema({
      name: {
         type: String,
         unique: true
      },
      color: Number
   }),
   garage: mongoose.Schema.Types.Mixed,
   fuel: {
      type: Number,
      default: 65
   },
   dirt: {
      type: Number,
      default: 0
   },
   damage: {
      type: Number,
      default: 1000
   },
   items: {
      type: [
         new mongoose.Schema({
            id: Number,
            count: Number,
            features: mongoose.Schema.Types.Mixed
         })
      ],
      default: []
   },
   wanted: {
      type: { title: String, lastEdit: Date },
      default: { title: '' }
   },
   features: mongoose.Schema.Types.Mixed,
   isReservation: Boolean,
   violations: {
      type: [
         new mongoose.Schema({
            from: String,
            title: String,
            price: Number,
            date: {
               type: Date,
               default: Date.now
            }
         })
      ],
      default: []
   },
   isLoan: Boolean,
   registration: {
      type: Date,
      default: Date.now
   }
}));

// ---
function validateSchema(body) {
   let schema = Joi.object({
      license: Joi.string(),
      type: Joi.string(),
      hash: Joi.any(),
      name: Joi.string(),
      garage: Joi.object({ code: Joi.string(), id: Joi.number() }),
      wanted: Joi.object(),
      plate: Joi.string(),
      fuel: Joi.number().integer(),
      damage: Joi.number(),
      dirt: Joi.number(),
      features: Joi.object(),
      isReservation: Joi.boolean()
   });

   return schema.validate(body);
}

module.exports = { Vehicle, validateSchema };