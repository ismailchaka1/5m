/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const Joi = require('joi');

// ---
const Loan = mongoose.model('loan', new mongoose.Schema({
   license: {
      type: String,
      required: true
   },
   name: {
      type: String,
      required: true
   },
   type: {
      type: String,
      required: true
   },
   item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'type'
   },
   price: {
      type: Number,
      required: true
   },
   interest: {
      type: Number,
      required: true
   },
   end: {
      type: Date,
      required: true
   },
   status: {
      type: Number,
      default: 1
   },
   registration: {
      type: Date,
      default: Date.now
   }
}));

// ---
function validateSchema(body) {
   let schema = Joi.object({
      type: Joi.string(),
      name: Joi.string(),
      item: Joi.string(),
      price: Joi.number(),
      interest: Joi.number(),
      end: Joi.date()
   });

   return schema.validate(body);
}

module.exports = { Loan, validateSchema };