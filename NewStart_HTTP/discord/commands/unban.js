const { SlashCommandBuilder } = require('discord.js');
const { commandsChannel } = require('../../services/config');
const { User } = require('../../models/user');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
      .setName('unban')
      .setDescription('فك حظر اللاعب داخل الخادم')
      .addNumberOption(i => i.setName('المعرف').setDescription('معرف الشخصية داخل الخادم').setRequired(true))
      .addStringOption(i => i.setName('السبب').setDescription('يجب وضع سبب الحظر').setRequired(true))

	, async execute(interaction) {
      const admin = await User.findOne({ discord: interaction.user.id }).select('license adminRole');
      
      if (!['founder', 'adminplus', 'admin'].includes(admin.adminRole)) { // permissions
         await interaction.reply('لا تملك الصلاحيات الكافية!');
         await wait(3000);
         return interaction.deleteReply();

      } else if (interaction.channel.id !== commandsChannel) { // channel
         await interaction.reply(`لا يمكن تنفيذ الأوامر إلا من خلال <#${commandsChannel}>`);
         await wait(5000);
         return interaction.deleteReply();
      }

      // start
      const info = {};

      for (let item of interaction.options._hoistedOptions) {
         if (item.name === 'المعرف') info.customID = item.value;
         else if (item.name === 'السبب') info.reason = item.value;
      }

      const user = await User.findOne({ customID: info.customID }).select('license character.identifier.name block.isActive');

      if (!user) {
         await interaction.reply('لا يوجد أي لاعب بهذا المعرف!');
         await wait(3000);
         return interaction.deleteReply();

      } else if (!user.block) {
         await interaction.reply('الاعب غير محظور!');
         await wait(3000);
         return interaction.deleteReply();
      }

      // start
      ExecuteCommand(`unban ${info.customID} ${admin.license}`);
      return interaction.reply(`تم فك حظر \`(${info.customID}) ${user.character.identifier.name}\``);
	}
};