/* ``````````` ## Development By el8rbawY ## ```````````*/
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// Login to Discord with your client's token
client.login('MTEyNDA4MDk4OTk1MDQ2MDAwNg.GrusW3.CpRH1PAZiLHDZFQJksQM0wAAa9w5CUcUwtEChA').then(() => {
   console.log('Discord log has been successfully connected!');
});

module.exports = client;