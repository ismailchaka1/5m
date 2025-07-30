/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');

const Police = mongoose.model('police', new mongoose.Schema({
   license: {
      type: String,
      unique: true
   },
   status: {
      type: { title: String, note: String, lastEdit: Date },
      default: { title: '', note: '' }
   },
   image: String,
   isWeapons: {
      type: Boolean,
      default: false
   },
   isCar: {
      type: Boolean,
      default: false
   },
   isTruck: {
      type: Boolean,
      default: false
   },
   isMotor: {
      type: Boolean,
      default: false
   },
   jailed: {
      type: Number,
      default: 0
   },
   jail: {
      type: [new mongoose.Schema({
         type: String,
         from: String, 
         reason: String, 
         duration: Number,
         date: {
            type: Date,
            default: Date.now
         }
      })],
      default: []
   },
   records: {
      type: [new mongoose.Schema({
         from: String, 
         title: String, 
         date: {
            type: Date,
            default: Date.now
         }
      })],
      default: []
   },
   violations: {
      type: [new mongoose.Schema({
         from: String, 
         title: String,
         price: Number,
         date: {
            type: Date,
            default: Date.now
         }
      })],
      default: []
   },
}));

module.exports = { Police };