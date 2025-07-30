const { AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const DISCORD_BOT = require('./index');
const { User } = require('../models/user');
const { adminRoles, botToken } = require('../services/config');
const tags = { 1: '1101193129299824802', 2: '1110195317497933864', 3: '1101193156072063137', 4: '1110195367858941982' };

// ---
function discordTweets(tweet, discordID, buffer) {
   const channel = DISCORD_BOT.channels.cache.get('1028860916562927656');
   const data = { 
      name: `تغريدة من (${tweet.name})`, 
      message: { content: `<@${discordID}> \n ${tweet.text} \n \n\`للتواصل عبر الهاتف\`\n\`${tweet.number}\`` },
      appliedTags: [tags[tweet.hashtagID]]
   };

   if (buffer) {
      const imageAttachment = new AttachmentBuilder(buffer, { name: 'image.jpeg' });
      data.message.files = [imageAttachment];
   }
   
   channel.threads.create(data);
}

// ---
async function discordRename(customID, name, discordID, code) {   
   const guild = await DISCORD_BOT.guilds.fetch('955495908462706688');
   const member = await guild.members.fetch(discordID);

   if (code) {
      member.setNickname(`[${code}] ${name}`);

   } else {
      const response = await axios.get(
         `https://discord.com/api/v10/guilds/955495908462706688/members/${discordID}`,
         { headers: { 'Authorization': `Bot ${botToken}` } }
      );

      let name = response.data.user.global_name || response.data.user.username;
      const filter = name.match(/\[[^\]]*\]\s*(.*)|(.+)/);
      name = filter ? (filter[1] || filter[2] || name) : name;

      member.setNickname(`[${customID}] ${name}`);
   }
}

async function giveDiscordRole(id, userID, removeID) {
   const guild = await DISCORD_BOT.guilds.fetch('955495908462706688');
   const member = await guild.members.fetch(userID);

   if (removeID) member.roles.remove(removeID);
   member.roles.add(id);
}

// ---
async function checkAdmin(id, adminName) {
   const guild = await DISCORD_BOT.guilds.fetch('955495908462706688');
   const member = await guild.members.fetch(id);
   const find = adminRoles.find(i => i.name === adminName);
  
   if (adminName !== 'founder' && (!find || !member.roles.cache.has(find.id))) {
      await User.updateOne({ discord: id }, { $unset: { adminRole: '' }});
   }
}

module.exports = { checkAdmin, discordTweets, discordRename, giveDiscordRole };