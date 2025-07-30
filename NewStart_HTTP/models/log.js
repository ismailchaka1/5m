/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');

// ---
const Log = mongoose.model('log', new mongoose.Schema({
   license: {
      type: String,
      required: true
   },
   type: {
      type: String,
      enum: ['ban', 'expLose'],
      required: true
   },
   isActive: Boolean,
   isForever: Boolean,
   end: Date,
   from: String,
   discordFrom: String,
   reason: String,
   value: mongoose.Schema.Types.Mixed,
   date: {
      type: Date,
      default: Date.now
   }
}));

module.exports = { Log };