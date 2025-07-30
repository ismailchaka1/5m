/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const Joi = require('joi');

// ---
const Tweet = mongoose.model('tweet', new mongoose.Schema({
   license: String,
   name: String,
   number: String,
   text: String,
   image: String,
   location: mongoose.Schema.Types.Mixed,
   hashtagID: Number,
   processing: Boolean,
   date: {
      type: Date,
      default: Date.now
   },
})); // , { expireAfterSeconds: 30 }

// ---
function validateTweet(body) {
   let schema = Joi.object({
      license: Joi.string().required(),
      name: Joi.string().required(),
      number: Joi.string().required(),
      text: Joi.string().required().min(30).max(200),
      image: Joi.string(),
      location: Joi.object(),
      hashtagID: Joi.number().integer().required(),
      processing: Joi.boolean().required()
   });

   return schema.validate(body);
}

module.exports = { Tweet, validateTweet };