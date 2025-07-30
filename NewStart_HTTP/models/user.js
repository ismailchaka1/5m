/* ``````````` ## Development By el8rbawY ## ```````````*/
const mongoose = require('mongoose');
const Joi = require('joi');

// ---
const User = mongoose.model('user', new mongoose.Schema({
   customID: {
      type: String,
      unique: true
   },
   block: new mongoose.Schema({
      isActive: Boolean,
      isForever: Boolean,
      end: Date,
      from: String,
      reason: String,
      date: Date
   }),
   license: {
      type: String,
      unique: true
   },
   job: new mongoose.Schema({
      type: String,
      key: String,
      id: mongoose.Schema.Types.Mixed,
      isActive: Boolean,
      outfitID: Number,
      isTools: Boolean,
      accessories: mongoose.Schema.Types.Mixed,
      isIn: Boolean
   }),
   job2: new mongoose.Schema({
      type: String,
      id: mongoose.Schema.Types.Mixed,
      isActive: Boolean
   }),
   discord: String,
   fivem: String,
   skipQuestions: {
      type: Boolean,
      default: true
   },
   playTime: {
      type: Number,
      default: 0
   },
   vip: new mongoose.Schema({
      type: String,
      title: String,
      name: String,
      end: Date,
      refID: Number
   }),
   location: new mongoose.Schema({
      name: String,
      position: mongoose.Schema.Types.Mixed,
      code: String
   }),
   character: new mongoose.Schema({
      identifier: mongoose.Schema.Types.Mixed,
      face: mongoose.Schema.Types.Mixed,
      parents: mongoose.Schema.Types.Mixed,
      ped: mongoose.Schema.Types.Mixed,
      age: mongoose.Schema.Types.Mixed,
      outfit: mongoose.Schema.Types.Mixed,
      textures: mongoose.Schema.Types.Mixed,
      outfitToggle: mongoose.Schema.Types.Mixed,
      isEdit: Boolean
   }),
   mode: new mongoose.Schema({
      isDie: String,
      radio: Number,
      level: Number,
      noInvite: Boolean
   }),
   hud: {
      type: new mongoose.Schema({
         health: Number,
         armour: Number,
         food: Number,
         water: Number
      }),
      default: { health: 200, armour: 0, food: 100, water: 100 }
   },
   lastLogin: {
      type: Date,
      default: Date.now
   },
   registration: {
      type: Date,
      default: Date.now
   },
   adminRole: {
      type: String,
      enum: ['founder', 'adminplus', 'admin', 'supervisorplus', 'supervisor'],
      // default: 'founder'
   },
   settings: {
      type: new mongoose.Schema({
         adsToggle: String,
         radioVolume: Number,
         alertsVolume: Number,
         phoneVolume: Number,
         controls: Boolean
      }),
      default: { adsToggle: 'always', radioVolume: 0.8, alertsVolume: 0.6, phoneVolume: 0.6, controls: false }
   }
}));

// ---
function validateSchema(body, isPost) {
   let schema;

   if (isPost) {
      schema = Joi.object({
         license: Joi.string().required(),
         discord: Joi.string().required()
      });

   } else {
      schema = Joi.object({
         location: Joi.object({ name: Joi.string(), position: Joi.object(), code: Joi.string() }),
         character: Joi.object({ 
            identifier: Joi.object(),
            face: Joi.object(), 
            parents: Joi.object(),
            ped: Joi.object(), 
            age: Joi.object(),
            outfit: Joi.object(),
            textures: Joi.object()
         }),
         'character.identifier.name': Joi.string(),
         'character.face': Joi.any(),
         'character.parents': Joi.any(),
         'character.age': Joi.any(),
         'character.outfitToggle': Joi.object(),
         'character.outfitToggle.hat': Joi.boolean(),
         'character.outfitToggle.mask': Joi.boolean(),
         'character.outfitToggle.glass': Joi.boolean(),
         'character.outfitToggle.bag': Joi.boolean(),
         'character.outfitToggle.top': Joi.boolean(),
         'character.outfitToggle.leg': Joi.boolean(),
         'character.outfitToggle.shoe': Joi.boolean(),
         'character.outfitToggle.accessory': Joi.boolean(),
         'character.outfitToggle.armor': Joi.boolean(),
         'character.outfitToggle.ear': Joi.boolean(),
         'character.outfitToggle.watch': Joi.boolean(),
         'character.outfitToggle.bracelet': Joi.boolean(),
         'character.isEdit': Joi.boolean(),
         'mode.isDie': Joi.string().allow(''),
         'mode.radio': Joi.number().integer(),
         'mode.level': Joi.number().integer(),
         'mode.noInvite': Joi.boolean(),
         playTime: Joi.number(),
         skipQuestions: Joi.boolean(),
         hud: Joi.object({ 
            health: Joi.number(), 
            armour: Joi.number(),
            food: Joi.number(), 
            water: Joi.number()
         }),
         'settings.adsToggle': Joi.string(),
         'settings.radioVolume': Joi.number(),
         'settings.alertsVolume': Joi.number(),
         'settings.phoneVolume': Joi.number(),
         'settings.controls': Joi.boolean(),
         job: Joi.object(),
         'job.isActive': Joi.boolean(),
         'job.outfitID': Joi.number().integer(),
         'job.isTools': Joi.boolean(),
         'job.accessories': Joi.any(),
         'job.isIn': Joi.boolean(),
         job2: Joi.object(),
         'job2.isActive': Joi.boolean()
      });
   }

   return schema.validate(body);
}

module.exports = { User, validateSchema };