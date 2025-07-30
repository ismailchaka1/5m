const { AuditLogEvent } = require('discord.js');
const { User } = require('../models/user');
const { Faction } = require('../models/faction');
const DISCORD_BOT = require('./index'); 
const DISCORD_Log = require('./logs'); 
const { getPlayerIDfromGame, adminRoles, environment } = require('../services/config');

// ---
const rolesFactions = Object.values(require('../services/static/roles.json')).flat();
const vacations = [{ id: '1121577179269054534', key: 'police' }, { id: '1121576982090625085', key: 'facilities' }, { id: '1121576992601538740', key: 'health' }];
const mechanicalRole = '1121590479339917314';

// ---
DISCORD_BOT.on('guildMemberUpdate', async (oldMember, newMember) => {
   // if (environment !== 'main') return;
   
   try {
      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;

      if (oldRoles.size !== newRoles.size) {
         const addID = newRoles.find(i => !oldRoles.has(i.id))?.toJSON().id;
         const removeID = oldRoles.find(i => !newRoles.has(i.id))?.toJSON().id;

         // add role
         if (addID) {
            const role = rolesFactions.find(i => i.id === addID);
            const vacation = vacations.find(i => i.id === addID);
            const adminInx = adminRoles.findIndex(i => i.id === addID);

            if (role) { // with main roles => jobs
               const user = await User.findOne({ discord: newMember.id, character: { $exists: true } }).select('license character.identifier.name job job2 customID');

               if (user) {
                  const filter = rolesFactions.filter(i => oldRoles.has(i.id));
   
                  if (!filter.length && !user.job?.key) { // join
                     const faction = await Faction.findOne({ key: role.key }).select('_id name');

                     emit('NewStart_Factions:join-server', faction._id.toString(), false, user.license, role.rankID);
                     await setLog(newMember.id, `بتعيين ← (${user.customID}) ${user.character.identifier.name} في ${faction.name}`);
                     newMember.roles.remove(mechanicalRole);
      
                  } else if (filter[0]?.rankID > role.rankID && role.key === user.job?.key) { // promotion
                     if (role.rankID <= 1 && filter.length) {
                        const next = filter.filter(i => i.rankID > 1);
                        if (next.length) await Faction.updateOne({ key: role.key, 'players.user': user._id }, { $set: { 'players.$.subRankID': next[0].rankID }});
                     }

                     emit('NewStart_Factions:userUpdate-server', { type: 'promotion', id: user.job.id.toString(), customID: user.customID, rankID: role.rankID }, user.license);
                     setLog(newMember.id, `بترقية ← (${user.customID}) ${user.character.identifier.name} إلي ${role.name}`);

                  } else if (role.key === user.job?.key && filter.some(i => i.rankID === 0 || i.rankID === 1) && role.rankID > 1) { // sub rank
                     const playerID = getPlayerIDfromGame(user.license);
                     const faction = await Faction.findOneAndUpdate({ key: role.key, 'players.user': user._id }, { $set: { 'players.$.subRankID': role.rankID }}).select('_id');

                     if (playerID) emit('NewStart_Factions:initial-server', faction._id.toString(), playerID, user.license);
                  }
               }
            } else if (vacation) { // with vacations roles => jobs
               const user = await User.findOne({ discord: newMember.id, character: { $exists: true } }).select('license character.identifier.name job customID');
            
               if (user && vacation.key === user.job?.key) {
                  const faction = await Faction.findOne({ _id: user.job.id }).select('name players');
                  
                  if (!faction.players.find(i => i.user.toString() === user._id.toString()).giveVacations) {
                     const playerID = getPlayerIDfromGame(user.license);

                     await Faction.updateOne({ _id: user.job.id, 'players.user': user._id }, { $set: { 'players.$.giveVacations': true }});
                     setLog(newMember.id, `بتعيين ← (${user.customID}) ${user.character.identifier.name} في قسم "الإجازات" داخل ${faction.name}`);
                     if (playerID) emit('NewStart_Factions:initial-server', faction._id.toString(), playerID, user.license);
                  }
               }
            } else if (adminInx >= 0) { // with admin roles
               const admin = adminRoles[adminInx];
               const user = await User.findOne({ discord: newMember.id, character: { $exists: true }}).select('license customID character.identifier.name adminRole');
               const currentInx = adminRoles.findIndex(i => i.name === user?.adminRole);

               if (user && (user.adminRole !== admin.name && (currentInx < 0 || currentInx > adminInx))) {
                  await User.updateOne({ license: user.license }, {...(admin.name === 'support' ? { $unset: { adminRole: '' }} : {$set: { adminRole: admin.name }})});
                  setLog(newMember.id, `بجعل ← (${user.customID}) ${user.character.identifier.name} ← ${admin.title}`, 'admin-roles-log');
               }

            } else if (addID === mechanicalRole) {
               const user = await User.findOne({ discord: newMember.id, character: { $exists: true }}).select('license customID character.identifier.name');
               setLog(newMember.id, `بضم ← (${user.customID}) ${user.character.identifier.name} إلي وظيفة الميكانيكي`, 'mechanical-log');
            }

         // remove role
         } else if (removeID) {
            const role = rolesFactions.find(i => i.id === removeID);
            const vacation = vacations.find(i => i.id === removeID);
            const admin = adminRoles.find(i => i.id === removeID);

            if (role) { // with main roles => jobs
               const user = await User.findOne({ discord: newMember.id, character: { $exists: true } }).select('license character.identifier.name job customID adminRole');

               if (user) {
                  const filter = rolesFactions.filter(i => newRoles.has(i.id));
   
                  if (filter[0]?.rankID > role.rankID && role.key === user.job?.key) { // demotion
                     const player = (await Faction.findOne({ key: role.key }).select('players')).players.find(i => i.user.toString() === user._id.toString());

                     if (player.subRankID) {
                        if (role.rankID <= 1) { 
                           const next = filter.filter(i => i.rankID > 1);
                           await Faction.updateOne({ key: role.key, 'players.user': user._id }, next.length ? { $set: { 'players.$.subRankID': next[0].rankID }} : { $unset: { 'players.$.subRankID': '' }});
                        
                        } else {
                           await Faction.updateOne({ key: role.key, 'players.user': user._id }, { $unset: { 'players.$.subRankID': '' }});
                        }
                     }

                     emit('NewStart_Factions:userUpdate-server', { type: 'promotion', id: user.job.id.toString(), customID: user.customID, rankID: filter[0].rankID }, user.license);
                     setLog(newMember.id, `بتخفيض رتبة ← (${user.customID}) ${user.character.identifier.name} إلي ${filter[0].name}`);
      
                  } else if (!filter.length && role.key === user.job?.key) { // kick
                     const faction = await Faction.findOne({ key: role.key }).select('name');
   
                     emit('NewStart_Factions:userDelete-server', { type: 'kick', id: user.job.id.toString(), customID: user.customID }, user.license);
                     setLog(newMember.id, `بطرد ← (${user.customID}) ${user.character.identifier.name} من ${faction.name}`);

                  } else if (role.key === user.job?.key) { // sub rank
                     const faction = await Faction.findOne({ key: role.key }).select('players');
                     const player = faction.players.find(i => i.user.toString() === user._id.toString());

                     if (player.subRankID === role.rankID) {
                        const playerID = getPlayerIDfromGame(user.license);
                        const next = filter.filter(i => i.rankID > 1 && i.rankID !== role.rankID);

                        await Faction.updateOne({ key: role.key, 'players.user': user._id }, next.length ? { $set: { 'players.$.subRankID': next[0].rankID }} : { $unset: { 'players.$.subRankID': '' }});
                        if (playerID) emit('NewStart_Factions:initial-server', faction._id.toString(), playerID, user.license);
                     
                     }
                  }
               }

            } else if (vacations.some(i => i.id === removeID)) { // with vacations roles => jobs
               const user = await User.findOne({ discord: newMember.id, character: { $exists: true } }).select('license character.identifier.name job customID');
            
               if (user && vacation.key === user.job?.key) {
                  const faction = await Faction.findOne({ _id: user.job.id }).select('name players');
                  
                  if (faction.players.find(i => i.user.toString() === user._id.toString()).giveVacations) {
                     const playerID = getPlayerIDfromGame(user.license);
                     
                     await Faction.updateOne({ _id: user.job.id, 'players.user': user._id }, { $set: { 'players.$.giveVacations': false }});
                     setLog(newMember.id, `بإزالة ← (${user.customID}) ${user.character.identifier.name} من قسم "الإجازات" داخل ${faction.name}`);
                     if (playerID) emit('NewStart_Factions:initial-server', faction._id.toString(), playerID, user.license);
                  }
               }
            } else if (admin) { // with admin roles
               const user = await User.findOne({ discord: newMember.id, character: { $exists: true }}).select('license customID character.identifier.name adminRole');
               const filter = adminRoles.filter(i => newRoles.has(i.id));

               if (user) {
                  if (!filter.length) {
                     const playerID = getPlayerIDfromGame(user.license);
                     
                     await User.updateOne({ license: user.license }, { $unset: { adminRole: '' }});
                     setLog(newMember.id, `بإعفاء ← (${user.customID}) ${user.character.identifier.name} من الإدارة`, 'admin-roles-log');
                     emitNet('NewStart_Admin:openUI-client', playerID); // close
   
                  } else if (user.adminRole !== filter[0].name) {
                     await User.updateOne({ license: user.license }, {...(filter[0].name === 'support' ? { $unset: { adminRole: '' }} : {$set: { adminRole: filter[0].name }})});
                     setLog(newMember.id, `بتخفيض رتبة ← (${user.customID}) ${user.character.identifier.name} ← إلى ${filter[0].title}`, 'admin-roles-log');
                  }
               }

            } else if (removeID === mechanicalRole) { // with mechanical
               const user = await User.findOne({ discord: newMember.id, character: { $exists: true }}).select('license customID character.identifier.name job');
               
               if (user.job?.type === 'mechanical') {
                  await User.updateOne({ license: user.license }, { $unset: { job: '' }});

                  const playerID = getPlayerIDfromGame(user.license);
                  if (playerID) emitNet('NewStart_Mechanical:handleGeneral-client', playerID, 'quit', true);
               }

               if (user) {
                  setLog(newMember.id, `بإزالة ← (${user.customID}) ${user.character.identifier.name} من وظيفة الميكانيكي`, 'mechanical-log');
               }
            }
         }
      }

   } catch (err) {
      console.log(err);
   }
});

// ---
async function setLog(id, text, channelID = 'jobs-official-log') {
   const guild = await DISCORD_BOT.guilds.fetch('955495908462706688');
   const member = await guild.members.fetch(id);
   const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate, limit: 1 });
   const entry = logs.entries.first();

   if (entry.target.id === member.id) {
      const admin = await guild.members.fetch(entry.executorId);
      const user = await User.findOne({ discord: admin.id }).select('license character.identifier.name job customID');

      if (user) {
         const channel = DISCORD_Log.channels.cache.find(i => i.name === channelID); // 
         channel.send(
            `\`\`\`قام ${admin.nickname} \n${text} \n\nlicenseID: ${user?.license} - discordID: ${admin.id}\`\`\``
         );
      }
   }
}