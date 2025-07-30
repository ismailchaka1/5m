const { SlashCommandBuilder } = require('discord.js');
const { commandsChannel, dataStatus } = require('../../services/config');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
      .setName('status')
      .setDescription('تحديث رسالة حالة السيرفر')
      .addBooleanOption(i => i.setName('الحالة').setDescription('تحديد الخادم أونلاين أو أوفلاين الآن'))
      .addStringOption(i => i.setName('التحديث').setDescription('كتابة عن التحديث القادم'))

	, async execute(interaction) {      
      if (interaction.user.id !== '612112681922592798') { // permissions
         await interaction.reply('لا تملك الصلاحيات الكافية!');
         await wait(3000);
         return interaction.deleteReply();

      } else if (interaction.channel.id !== commandsChannel) { // channel
         await interaction.reply(`لا يمكن تنفيذ الأوامر إلا من خلال <#${commandsChannel}>`);
         await wait(5000);
         return interaction.deleteReply();
      }

      // start
      for (let item of interaction.options._hoistedOptions) {
         if (item.name === 'الحالة') dataStatus.isOnline = item.value;
         else if (item.name === 'التحديث') dataStatus.nextUpdate = item.value === 'reset' ? '' : item.value;
      }

		return interaction.reply(`سيتم تحديث رسالة https://discord.com/channels/955495908462706688/1112102165301960895/1112820407960084692 خلال الثواني القادمة`);
	}
};