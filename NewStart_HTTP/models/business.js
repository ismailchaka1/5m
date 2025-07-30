/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');

const Business = mongoose.model('business', new mongoose.Schema({
   license: {
      type: String,
      unique: true,
      required: true
   },
   licInfo: {
      name: String,
      placeID: {
         type: String,
         unique: true
      },
      type: {
         type: String,
         enum: ['materials']
      },
      subType: {
         type: String,
         enum: ['small-store', 'store', 'pharmacy', 'bar', 'weapons']
      },
      price: Number,
      end: Date,
      isPremium: Boolean,
      items: {
         type: [
            new mongoose.Schema({
               id: Number,
               count: Number,
               price: Number
            })
         ],
         default: []
      },
      employees: {
         type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
         default: []
      },
      warnings: {
         type: [String],
         default: []
      }
   },
   money: {
      type: Number,
      default: 0
   },
   log: {
      type: [new mongoose.Schema({
         type: {
            type: String,
            enum: ['withdraw', 'deposit'],
            required: true
         }, 
         name: {
            type: String,
            enum: ['capital_1', 'capital_2', 'buying', 'selling', 'reward', 'other'],
            required: true
         }, 
         reason: String,
         amount: {
            type: Number,
            required: true
         },
         date: {
            type: Date,
            default: Date.now
         }
      })],
      default: []
   }
}));

module.exports = { Business };