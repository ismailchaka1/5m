/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');

const Favorite = mongoose.model('favorite', new mongoose.Schema({
   license: {
      type: String,
      unique: true
   },
   animations: {
      type: [Number],
      default: []
   },
   tattoos: {
      type: [
         new mongoose.Schema({
            name: String, 
            collection: String, 
            overlay: String, 
            value: Number
         })
      ],
      default: []
   },
   crime: {
      type: Number,
      default: 0
   },
   rewardDate: Date
}));

module.exports = { Favorite };