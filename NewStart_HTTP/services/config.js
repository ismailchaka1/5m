/* ``````````` ## Development By el8rbawY ## ```````````*/
const Jimp = require("jimp");
const { User } = require("../models/user");
const DISCORD_Log = require('../discord/logs'); 

// for money => go database # inventories.items, money.log #
async function givePlayerBan(license, playerID, kick, block) {
   const user = await User.findOneAndUpdate({ license }, { $set: { block } }).select('customID discord character.identifier.name');

   const channel = DISCORD_Log.channels.cache.find(i => i.id === '1124052330589991083'); // anticheat-log
   if (channel) channel.send(
      `\`\`\`تم حظر (${user.customID}) ${user.character.identifier.name}\nالسبب: ${block.reason}\nالمدة: مدي الحياة`+
      `\n\nlicenseID: ${license} - discordID: ${user.discord}\`\`\``
   );

   DropPlayer(playerID, kick);
}

// ---
async function imgResize(buffer){
   const image = await Jimp.read(buffer);
   image.resize(250, 250);
   
   const result = await image.getBase64Async(Jimp.AUTO);
   return result;
}

// ---
const environment = GetConvar('serverType', 'changeme');
const gameURL = GetConvar('game_api', 'changeme');
const webURL = GetConvar('web_api', 'changeme');

function getPlayerIDfromGame(license) {
   let playerID = 0;

   for (let id of getPlayers()) { 
      if (license === GetPlayerIdentifier(id)?.replace('license:', '')) { playerID = parseInt(id); break; }
   }

   return playerID;
}

module.exports = {
   environment,
   dataStatus: {
      isOnline: true,
      startTime: new Date(),
      nextUpdate: ''
   },
   commandsChannel: '1126059216357052446',
   adminRoles: [
      { id: '0', name: 'founder', title: 'مسؤول خاص' },
      { id: '1125477373152870482', name: 'adminplus', title: 'مسؤول بلس' }, { id: '1125477199630311435', name: 'admin', title: 'مسؤول' }, 
      { id: '1125477412738715658', name: 'supervisorplus', title: 'مشرف بلس' }, { id: '1126122338325372948', name: 'supervisor', title: 'مشرف' },
      { id: '1125479864577818655', name: 'support', title: 'دعم فني' }
   ],
   jobs: { police: 'الأمن العام', facilities: 'أمن المنشآت', health: 'الدفاع المدني', general: 'وظيفة عامة', mechanical: 'ميكانيكي' },
   ...(environment === 'test' ? {
      gameURL, webURL,
      website: 'http://localhost:3000',
      hostname: '192.168.0.112',
      botToken: 'MTExMTI1NDk2MzM2OTI5OTk5OQ.Gin-GL.Z1iFj2bv2Ilnut0C30n9QHeTnI212NQhoZYftE',
      appDiscordID: '1111254963369299999'
   } : {
      gameURL, webURL,
      website: 'https://newstart.one',
      hostname: 'newstart1.online',
      botToken: 'OTMwNTQ5MDY3NDg0ODk3MzAw.GmeNXJ.521CXKjOmlcm_loncSmauRYKmJ21LHqmMwzQcY',
      appDiscordID: '930549067484897300'
   }),
   givePlayerBan, imgResize, getPlayerIDfromGame
};

// gamePort => http://192.168.0.146:30120