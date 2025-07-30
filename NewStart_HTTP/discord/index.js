/* ``````````` ## Development By el8rbawY ## ```````````*/
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const moment = require('moment');
require('moment/locale/ar');
const { User } = require('../models/user');
const { Faction } = require('../models/faction');
const { botToken, appDiscordID, environment } = require('../services/config');
const { dataStatus, hostname } = require('../services/config');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const commands = [];
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
   const filePath = path.join(commandsPath, file);
   const command = require(filePath);

   if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
   }
}

const rest = new REST().setToken(botToken);
rest.put(Routes.applicationGuildCommands(appDiscordID, '955495908462706688'), { body: commands });

// When the client is ready
client.once('ready', async _=> {
   client.user.setActivity('newstart.one', { type: 'WATCHING' });
   // cache
   (await client.guilds.fetch('955495908462706688')).members.fetch();

   // ---
   if (environment === 'main') {
      serverStatus();
      setInterval(serverStatus, 60000);
   }
});

// ---
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
   
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	await command.execute(interaction);
});

// ---
client.on('guildMemberAdd', async member => {
	member.roles.add('1118631429321015306'); // اعضاء نيوستارت
});

// ---
client.on('guildMemberRemove', async member => {
   const user = await User.findOne({ discord: member.id }).select('customID license job character.identifier.name');

   if (user && user.job?.type === 'faction') {
      const faction = await Faction.findOne({ _id: user.job.id }).select('players');
      const find = faction.players.find(i => i.user.toString() === user._id.toString());

      if (find) {
         const channelID = { police: '1176677675012718602', facilities: '1176677279561154640', health: '1176677958753202216' }[user.job.key];

         if (channelID) {
            const channel = client.channels.cache.find(i => i.id === channelID);
            await channel.send(`<@${member.id}>`+`\`\`\`([${find.code}] ${user.character.identifier.name}) قام بالخروج من الديسكورد\`\`\``);
            emit('NewStart_Factions:userDelete-server', { type: 'kick', id: user.job.id.toString(), customID: user.customID }, user.license);
         }
      }
   }
});

// ---
async function serverStatus() {
   try {
      // server data
      const players = (await axios.get(`http://${hostname}:30120/players.json`)).data;
      const server = (await axios.get(`http://${hostname}:30120/info.json`)).data;

      // fivem status
      const response = (await axios.get('https://status.cfx.re/api/v2/status.json')).data;
      const isIssue = response?.status.indicator !== 'none';

      // from discord
      const messageID = '1112820407960084692';
      const channel = client.channels.cache.get('1112102165301960895');

      // max count
      const projectPath = path.resolve(__dirname);
      const parentPath = path.dirname(projectPath);
      const finalPath = `${parentPath}/services/static/data.json`;
      const staticData = JSON.parse(await fs.promises.readFile(finalPath, 'utf8'));
      let contMAX = staticData.onlineTop;

      if (players.length > contMAX) {
         contMAX = players.length;
         staticData.onlineTop = players.length;

         await fs.promises.writeFile(finalPath, JSON.stringify(staticData));
      }
      
      // build
      const embed = new EmbedBuilder()
         .setTitle('نيوستارت رول بلاي')
         .setURL('https://newstart.one/')
         .setDescription(`
            **نيوستارت هو السيرفر الأول من نوعه في المنطقة العربية داخل FiveM. حيث تمت صناعته بواسطة (framework) خاص تم بناؤه من الصفر. وبفضل ذلك، يتم تحقيق مرونة وقابلية للتوسع للسيرفر، مما يمكنه من تقديم محتوى فريد ومبتكر للاعبين العرب في الرول بلاي ويعد السيرفر وجهة ممتازة للعب واستكشاف عالم لعبة GTA V بطريقة مميزة ومتفردة للمجتمع العربي، ويقدم تجربة مميزة جداً عن باقي السيرفرات العربية.**
         \n`)
         .addFields(
            { name: '__**وبالإضافة أننا أقرب لخوادم ESX العربية، لمعرفة المزيد:**__ https://discord.com/channels/955495908462706688/955495908462706695', value: 'ㅤ' },
            { name: '> حالة الخادم', value: `\`\`\`قادم قريباً\`\`\`` /* ${dataStatus.isOnline ? '🟢 أونلاين' : '🔴 سيعود قريباً'} */, inline: true },
            { name: '> عدد اللاعبين', value: `\`\`\`${dataStatus.isOnline ? players.length : 0}/${server.vars.sv_maxClients}\`\`\``, inline: true },
            { name: '> أعلى متصلين', value: `\`\`\`${contMAX} لاعب\`\`\``, inline: true },
            { name: '> حالة الفايف ام', value: `\`\`\`${isIssue ? '🔴 غير مستقر' : '🟢 مستقر' }\`\`\``, inline: true },
            { name: '> مدة التشغيل', value: `\`\`\`-/-\`\`\``/*  ${moment(dataStatus.startTime).fromNow()} */, inline: true },
            { name: '> التحديث القادم', value: `\`\`\`${dataStatus.nextUpdate || 'الإصدار الأول من الخادم'}\`\`\`` }, // 'غير مخطط حاليًا'
            { name: 'الموقع الرسمي', value: 'https://newstart.one \n https://newstart.one/store/', inline: true },
            { name: 'الدخول المباشر', value: 'http://play.newstart.one \n `connect g58g4x`', inline: true },  
         )
         .setImage('https://cdn.discordapp.com/attachments/1112870174266241075/1112870226447581225/newstart2.gif')
         .setFooter({ text: 'NewStart Life For Roleplay' })
         .setTimestamp();

      if (channel) {
         const webhook = (await channel.fetchWebhooks()).find(i => i.token);

         if (webhook) {
            await webhook.editMessage(messageID, { embeds: [embed] });
            // await webhook.send({ embeds: [embed] });
         }
      }

   } catch (err) {
      console.log(err);
   }
}

// Login to Discord with your client's token
client.login(botToken).then(() => {
   console.log('Discord bot has been successfully connected!');
});

module.exports = client;