/* ``````````` ## Development By el8rbawY ## ```````````*/
const { number } = require('joi');
const mongoose = require('mongoose');

const Vip = mongoose.model('vip', new mongoose.Schema({
   license: {
      type: String,
      unique: true
   },
   taxes: {
      type: new mongoose.Schema({ // and edit in function removeVip
         seaport: Boolean,
         weapons: Boolean,
         jobs: Boolean,
         reservation: Boolean
      }),
      default: {
         seaport: false,
         weapons: false,
         jobs: false,
         reservation: false
      }
   },
   sponsors: {
      type: [new mongoose.Schema({
         type: String,
         title: String,
         refID: Number,
         method: {
            type: String,
            default: 'PayPal'
         },
         end: Date,
         prcie: Number,
         date: {
            type: Date,
            default: Date.now
         }
      })],
      default: [] 
   },
   doubleExp: {
      type: [new mongoose.Schema({
         type: {
            type: String,
            default: 'exp'
         },
         title: String,
         method: {
            type: String,
            default: 'PayPal'
         },
         timer: Number,
         prcie: Number,
         date: {
            type: Date,
            default: Date.now
         }
      })],
      default: []
   },
   other: {
      type: [new mongoose.Schema({
         type: {
            type: String,
            default: 'other'
         },
         title: String,
         prcie: Number,
         method: {
            type: String,
            default: 'PayPal'
         },
         date: {
            type: Date,
            default: Date.now
         }
      })],
      default: []
   },
   lastPurchase: Date
}));

module.exports = { Vip };