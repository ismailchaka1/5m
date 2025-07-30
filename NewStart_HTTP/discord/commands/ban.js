const { SlashCommandBuilder } = require('discord.js');
const { getPlayerIDfromGame, commandsChannel } = require('../../services/config');
const { User } = require('../../models/user');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
      .setName('ban')
      .setDescription('حظر اللاعب داخل الخادم')
      .addNumberOption(i => i.setName('المعرف').setDescription('معرف الشخصية داخل الخادم').setRequired(true))
      .addNumberOption(i => i.setName('المدة').setDescription('مدة الحظر بالايام وللاعطاء بالساعات يمكنك الوضع بالعلامة العشرية').setRequired(true))
      .addStringOption(i => i.setName('السبب').setDescription('يجب وضع سبب الحظر وفق القواعد والقوانين وكما هي مذكورة').setRequired(true))

	, async execute(interaction) {
      const admin = await User.findOne({ discord: interaction.user.id }).select('license adminRole');
      
      if (!['founder', 'adminplus', 'admin', 'supervisorplus'].includes(admin.adminRole)) { // permissions
         await interaction.reply('لا تملك الصلاحيات الكافية!');
         await wait(3000);
         return interaction.deleteReply();

      } else if (interaction.channel.id !== commandsChannel) { // channel
         await interaction.reply(`لا يمكن تنفيذ الأوامر إلا من خلال <#${commandsChannel}>`);
         await wait(5000);
         return interaction.deleteReply();
      }

      // start
      let info = { action: 'ban' };

      for (let item of interaction.options._hoistedOptions) {
         if (item.name === 'المعرف') info.customID = item.value;
         else if (item.name === 'السبب') info.reason = item.value;
         else if (item.name === 'المدة') {
            if (item.value) info.duration = item.value * 24 * 60 * 60 * 1000 + Date.now();
            else info.isForever = true;
         }
      }

      const user = await User.findOne({ customID: info.customID }).select('license character.identifier.name');

      if (!user) {
         await interaction.reply('لا يوجد أي لاعب بهذا المعرف!');
         await wait(3000);
         return interaction.deleteReply();
      }

      info = { ...info, name: user.character.identifier.name, serverID: getPlayerIDfromGame(user.license) };

      // send
      emit('NewStart_Admin:handlePlayer-sevrer', JSON.stringify(info), admin.license);
		return interaction.reply(`تم حظر \`(${info.customID}) ${info.name}\``);
	}
};