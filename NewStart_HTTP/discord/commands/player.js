const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment');
const { getPlayerIDfromGame, webURL, adminRoles, jobs } = require('../../services/config');
const { User } = require('../../models/user');
const { Police } = require('../../models/police');
const { Money } = require('../../models/money');
const { Vehicle } = require('../../models/vehicle');
const { House } = require('../../models/house');
const { Log } = require('../../models/log');
const wait = require('node:timers/promises').setTimeout;
const levelData = require('../../services/static/level.json');

module.exports = {
	data: new SlashCommandBuilder()
      .setName('player')
      .setDescription('الحصول على معلومات عن لاعب معين')
      .addStringOption(i => i.setName('المعرف').setDescription('معرف الشخصية داخل الخادم او معرف الديسكورد').setRequired(true))
      .addStringOption(i => i.setName('السبب').setDescription('يجب وضع سبب لهذا الاستعلام').setRequired(true))

	, async execute(interaction) {
      const admin = await User.findOne({ discord: interaction.user.id }).select('license adminRole');
      
      if (!['founder', 'adminplus', 'admin'].includes(admin?.adminRole)) { // permissions
         await interaction.reply('لا تملك الصلاحيات الكافية!');
         await wait(3000);
         return interaction.deleteReply();
      } 

      // start
      const info = {};

      for (let item of interaction.options._hoistedOptions) {
         if (item.name === 'المعرف') info.customID = item.value;
         else if (item.name === 'السبب') info.reason = item.value;
      }

      const user = await User.findOne({ $or: [{ customID: info.customID }, { discord: info.customID }] })
         .select('license customID discord fivem playTime lastLogin registration character.identifier.name vip job.type job.key job2.type adminRole mode.level');

      if (!user || !user.character) {
         await interaction.reply('لا يوجد أي لاعب بهذا المعرف!');
         await wait(3000);
         return interaction.deleteReply();
      }

      const police = await Police.findOne({ license: user.license }).select('-records -violations -image');
      const money = await Money.findOne({ license: user.license }).select('bank cash');
      const vehicles = await Vehicle.find({ license: user.license }).select('plate.name');
      const houses = await House.find({ license: user.license }).select('code');

      const isOnline = !!getPlayerIDfromGame(user.license);
      const playTime = `س${ Math.floor(user.playTime / 60) } د${ user.playTime % 60 }`;

      let level = levelData.findIndex(i => i > user.mode?.level);
      level = (level >= 0) ? level + 1 : (!user.mode?.level) ? 1 : levelData.length + 1;

      const jail = police.jail.filter(i => Number.parseInt(i.from));
      const jailSlice = jail.slice(0, 3);

      const log =  await Log.find({ license: user.license, type: { $in: ['ban', 'expLose'] }});
      const ban = log.filter(i => i.type === 'ban');
      const banSlice = ban.slice(0, 2);
      const expLose = log.filter(i => i.type === 'expLose');
      const expLoseSlice = expLose.slice(0, 3);

      const embed = new EmbedBuilder()
         .setThumbnail(`${webURL}/game/photo?model=police&id=${police._id}`)
         .setURL('https://newstart.one/')
         .addFields(
            { name: 'المعرف', value: `\`\`\` [${ user.customID }] \`\`\``, inline: true },
            { name: 'الاسم', value: `\`\`\` ${ user.character.identifier.name } \`\`\``, inline: true },
            { name: 'إداري', value:  `\`\`\` ${ adminRoles.find(i => i.name === user.adminRole)?.title || '-/-' } \`\`\``, inline: true },
            { name: 'الفايف ام', value: `\`\`\` ${ user.fivem } \`\`\``, inline: true },
            { name: 'العضوية', value: `\`\`\` ${ user.vip?.title || 'عادية' } \`\`\``, inline: true },
            { name: 'متصل الآن؟', value: `\`\`\` ${ isOnline ? '🟢 نعم' : '🔴 لا' } \`\`\``, inline: true },
            { name: 'المستوي', value: `\`\`\` ${level} \`\`\``, inline: true },
            { name: 'الوظيفة', value: `\`\`\` ${ jobs[user.job?.key || user.job?.type || user.job2?.type] || 'عاطل عن العمل' } \`\`\``, inline: true },
            { name: 'أموال البنك', value: `\`\`\` $${ money.bank.toLocaleString() } \`\`\``, inline: true },
            { name: 'الكاش', value: `\`\`\` $${ money.cash.toLocaleString() } \`\`\``, inline: true },
            { name: 'وقت اللعب', value: `\`\`\` ${ playTime } \`\`\``, inline: true },
            { name: 'آخر دخول', value: `\`\`\` ${ moment(user.lastLogin).fromNow() } \`\`\``, inline: true },
            { name: 'تاريخ التسجبل', value: `\`\`\` ${ moment(user.registration).locale('en').format('D/M/YYYY') } \`\`\``, inline: false },
            { name: `المركبات (${vehicles.length})`, value: vehicles.length ? vehicles.map(i => `- ${i.plate.name}`).join('\n') : '-/-', inline: true },
            { 
               name: `سجل الحظر (${ban.length})`, 
               value: ban.length ? banSlice.map(i => {
                  return `- ${i.reason.length > 21 ? i.reason.slice(0, 21) + '...' : i.reason}\n${moment(i.date).fromNow()}\n${i.discordFrom ? `<@${i.discordFrom}>` : `(${i.from})`}`;
               }).join('\n') + (ban.length - banSlice.length ? `\n*(هناك ${ban.length - banSlice.length} حظر أخرى)*` : '') : '-/-', 
               inline: true 
            },
            { 
               name: `سجل السجن الإداري (${jail.length})`, 
               value: jail.length ? jailSlice.map(i => {
                  const sec = Math.floor(i.duration / 1000);
                  return `- ${i.reason.length > 15 ? i.reason.slice(0, 15) + '...' : i.reason} - س${Math.floor(sec / 3600)} د${ Math.floor((sec % 3600) / 60) }\n<@${i.from}>`;
               }).join('\n') + (jail.length - jailSlice.length ? `\n\n*(هناك ${jail.length - jailSlice.length} سجون أخرى)*` : '') : '-/-', 
               inline: true
            },
            { name: `ㅤ\nالعقارات (${houses.length})`, value: houses.length ? houses.map(i => `- ${i.code}`).join('\n') : '-/-', inline: true },
            { 
               name: `ㅤ\nسجل خصم الخبرة (${expLose.length})`, 
               value: expLose.length ? expLoseSlice.map(i => {
                  return `- ${i.reason.length > 17 ? i.reason.slice(0, 17) + '...' : i.reason} - ${Math.abs(i.value)}\n<@${i.from}>`;
               }).join('\n') + (expLose.length - expLoseSlice.length ? `\n\n*(هناك ${expLose.length - expLoseSlice.length} خصم أخر)*` : '') : '-/-', 
               inline: true
            },
            { name: `ㅤ\nسجل الأعمال والشركات (0)`, value: '-/-', inline: true },
            { name: `ㅤ`, value: `<@${user.discord}>` },
         )
         .setFooter({ text: 'NewStart Life For Roleplay' })
         .setTimestamp();

      await interaction.reply({ embeds: [embed] });
	}
};