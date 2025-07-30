const { SlashCommandBuilder } = require('discord.js');
const { getPlayerIDfromGame, commandsChannel } = require('../../services/config');
const { User } = require('../../models/user');
const { Police } = require('../../models/police');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
      .setName('jail')
      .setDescription('إعطاء سجن للاعب داخل الخادم')
      .addNumberOption(i => i.setName('المعرف').setDescription('معرف الشخصية داخل الخادم').setRequired(true))
      .addNumberOption(i => i.setName('المدة').setDescription('مدة السجن بالساعات ولإعطاء بالدقائق يمكنك استخدام العلامة العشرية').setRequired(true))
      .addStringOption(i => i.setName('السبب').setDescription('يجب وضع سبب السجن وفق القواعد والقوانين وكما هي مذكورة').setRequired(true))

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
      const info = { action: 'jail' };

      for (let item of interaction.options._hoistedOptions) {
         if (item.name === 'المعرف') info.customID = item.value;
         else if (item.name === 'المدة') info.value = item.value;
         else if (item.name === 'السبب') info.reason = item.value;
      }

      const user = await User.findOne({ customID: info.customID }).select('license character.identifier.name');

      if (!user) {
         await interaction.reply('لا يوجد أي لاعب بهذا المعرف!');
         await wait(3000);
         return interaction.deleteReply();
      }

      const isJailed = (await Police.findOne({ license: user.license }).select('jailed')).jailed;
      info.name = user.character.identifier.name;

      if (isJailed) {
         await interaction.reply(`${info.name} مسجون بالفعل حاليًا!`);
         await wait(3000);
         return interaction.deleteReply();
      }

      info.license = user.license;
      info.serverID = getPlayerIDfromGame(user.license);
      
      // send
      emit('NewStart_Admin:handlePlayer-sevrer', JSON.stringify(info), admin.license);
		return interaction.reply(`تم سجن \`(${info.customID}) ${info.name}\``);
	}
};