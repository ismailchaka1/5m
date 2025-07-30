/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const Joi = require('joi');

// ---
const House = mongoose.model('house', new mongoose.Schema({
   license: String,
   type: String,
   code: {
      type: String,
      unique: true
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
   isLoan: Boolean,
   registration: {
      type: Date,
      default: Date.now
   }
}));

// ---
function validateSchema(body) {
   let schema = Joi.object({
      type: Joi.string(),
      code: Joi.string()
   });

   return schema.validate(body);
}

module.exports = { House, validateSchema };