/* ``````````` ## Development By el8rbawY ## ```````````*/
setInterval(_=> {
   emitNet('NewStart_Factions:update-client', -1, 'salary');
}, 3600000); // 3600000

if (serverType === 'main') {
   setInterval(_=> {
      for (let key in factions) factionSendLog('online', { key });
   }, 60000);
}

// ---
const factions = {  // and edit in NewStart_HTTP
   police: {
      id: null, key: 'police', name: 'الأمن العام', refPlayers: [], ranks: [], 
      partsDiscordID: '1119507305189347379', logID: '1121556926417862678', statusID: '1106341067428737094', controlID: '1123011805866901545',
      salaryCalc: (length, rankID) => (((length - rankID) * 250) + 2000),
      levelCalc: (length, rankID) => (((length - rankID) * 10) + 310)
   },
   facilities: { 
      id: null, key: 'facilities', name: 'أمن المنشآت', refPlayers: [], ranks: [], 
      partsDiscordID: '1119506817383411784', logID: '1121563091914735667', statusID: '1121561738865803334', controlID: '1123012641451946004',
      salaryCalc: (length, rankID) => (((length - rankID) * 250) + 2000),
      levelCalc: (length, rankID) => (((length - rankID) * 10) + 310)
   },
   health: { 
      id: null, key: 'health', name: 'الدفاع المدني', refPlayers: [], ranks: [], 
      partsDiscordID: '1119507039811534929', logID: '1121577217017782412', statusID: '1084585117315506327', controlID: '1123013340801798164',
      salaryCalc: (length, rankID) => (((length - rankID) * 445) + 1200),
      levelCalc: (length, rankID) => (((length - rankID) * 10) + 440)
   },
};

// ---
const factionsParts = { // if change ids go edit in client side NewStart_Police/parts.ts
   police: [
      { id: 1, type: 'main', title: 'العمليات', refID: '', note: '' },
      { id: 2, type: 'main', title: 'المرافق',  refID: '', note: ''  },
      { id: 0, type: 'sub', title: 'القيادة', refs: [] },
      { id: 3, type: 'sub', title: 'قائمة المشرفين', refs: [] },
      { id: 4, type: 'sub', title: 'شرق بوليتو', refs: [] },
      { id: 5, type: 'sub', title: 'غرب بوليتو', refs: [] },
      { id: 6, type: 'sub', title: 'شرق ساندي شورز', refs: [] },
      { id: 7, type: 'sub', title: 'غرب ساندي شورز', refs: [] },
      { id: 8, type: 'sub', title: 'منطقة جراب سيد', refs: [] },
      { id: 9, type: 'sub', title: 'الدوريات الحرة', refs: [] },
      { id: 10, type: 'sub', title: 'المروحيات', refs: [] },
      { id: 11, type: 'sub', title: 'نقل السجون', refs: [] },
      { id: 12, type: 'sub', title: 'دوريات المرور', refs: [] },
      { id: 13, type: 'sub', title: 'القوات الخاصة', refs: [] },
      { id: 14, type: 'sub', title: 'التحقيق الجنائي', refs: [] },
      { id: 15, type: 'sub', title: 'دعم أمن المنشآت', refs: [] }
   ],
   facilities: [
      { id: 1, type: 'main', title: 'العمليات', subTitle: 'داخل الميناء', inPort: true, refID: '', note: '' },
      { id: 2, type: 'main', title: 'المرافق', subTitle: 'داخل الميناء', refID: '', inPort: true, note: ''  },
      { id: 0, type: 'sub', title: 'القيادة', inPort: true, refs: [] },
      { id: 3, type: 'sub', title: 'قائمة المشرفين', inPort: true, refs: [] },
      { id: 4, type: 'sub', title: 'بوابة الدخول 2', inPort: true, refs: [] },
      { id: 5, type: 'sub', title: 'بوابة الخروج 3', inPort: true, refs: [] },
      { id: 6, type: 'sub', title: 'دوريات التوسعة الرئيسية', inPort: true, refs: [] },
      { id: 7, type: 'sub', title: 'دوريات التوسعة الفرعية', inPort: true, refs: [] },
      { id: 8, type: 'sub', title: 'الدوريات الحرة', inPort: true, refs: [] },
      { id: 9, type: 'sub', title: 'القوات الخاصة', inPort: true, refs: [] },
      { id: 10, type: 'sub', title: 'جناح جوي', inPort: true, refs: [] },
      { id: 11, type: 'sub', title: 'خفر السواحل', inPort: true, refs: [] },
      { id: 12, type: 'sub', title: 'الانضباط العسكري', inPort: true, refs: [] },
      { id: 13, type: 'main', title: 'العمليات', subTitle: 'خارج الميناء', refID: '', note: ''  },
      { id: 14, type: 'main', title: 'المرافق', subTitle: 'خارج الميناء', refID: '', note: ''  },
      { id: -1, type: 'sub', title: 'القيادة', refs: [] },
      { id: 15, type: 'sub', title: 'قائمة المشرفين', refs: [] },
      { id: 16, type: 'sub', title: 'وحدات الدعم والإسناد', refs: [] },
      { id: 17, type: 'sub', title: 'القوات الخاصة', refs: [] },
      { id: 18, type: 'sub', title: 'خفر سواحل', refs: [] },
      { id: 19, type: 'sub', title: 'جناح جوي', refs: [] },
      { id: 20, type: 'sub', title: 'الانضباط العسكري', refs: [] }
   ],
   health: [
      { id: 1, type: 'main', title: 'العمليات', refID: '', note: '' },
      { id: 2, type: 'main', title: 'المرافق',  refID: '', note: ''  },
      { id: 0, type: 'sub', title: 'القيادة', refs: [] },
      { id: 3, type: 'sub', title: 'قائمة المشرفين', refs: [] },
      { id: 4, type: 'sub', title: 'شرق بوليتو', refs: [] },
      { id: 5, type: 'sub', title: 'غرب بوليتو', refs: [] },
      { id: 6, type: 'sub', title: 'شرق ساندي شورز', refs: [] },
      { id: 7, type: 'sub', title: 'غرب ساندي شورز', refs: [] },
      { id: 8, type: 'sub', title: 'منطقة جراب سيد', refs: [] },
      { id: 9, type: 'sub', title: 'دعم الميناء البحري', refs: [] },
      { id: 9, type: 'sub', title: 'جناح جوي', refs: [] }
   ]
};

// ---
async function partsBuildDiscordMessage(key, license, items) {
   const playerRef = factions[key].refPlayers.find(p => p.user.license === license);

   await axios.post( `${URL}/other/discord_log`, { 
      type: 'embed', license, channel: factions[key].partsDiscordID, 
      message: {
         embeds: [{
            title: '`نيوستارت رول بلاي | NewStart Roleyplay`',
            description: 'ㅤ',
            url: 'https://newstart.one/',
            fields: [
               { 'name': 'مرسل التوزيع', 'value': `\`\`\` [${playerRef.code}] ${playerRef.user.character.identifier.name} \`\`\``, 'inline': true },
               { 'name': 'الرتبة الحالية',  'value': `\`\`\` ${factions[key].ranks.find(r => r.id === playerRef.rankID).name} \`\`\``, 'inline': true },
               { 'name': 'التوقيت الداخلي', 'value': `\`\`\` ${getTimeTools()} \`\`\``, 'inline': true },
               { 'name': 'عدد العناصر المتصلة', 'value': `\`\`\` ${factions[key].refPlayers.filter(i => i.status === 'in' || i.status === 'out').length} موظف \`\`\``, 'inline': true},
               { 'name': 'عدد العناصر الموزعة', 'value': `\`\`\` ${items.reduce((total, part) => total + (part.refID ? 1 : 0) + (part.refs?.length || 0), 0)} موظف \`\`\``, 'inline': true },
               {
                  'name': 'ㅤ',
                  'value': items
                     .filter(i => i.refID || i.refs?.length)
                     .map(i => { 
                        const refs = i.refs?.map((r, inx) => `(${r.note || 'لا يوجد ملاحظة'}) <@${factions[key].refPlayers.find(p => p.code === r.id).user.discord}> \`:${i.title}\`${inx !== i.refs.length - 1 ? '\n' : ''}`).join('');
                        return i.refID ? `(${i.note || 'لا يوجد ملاحظة'}) <@${factions[key].refPlayers.find(p => p.code === i.refID).user.discord}> \`:${i.title} ${i.subTitle ? `(${i.subTitle})` : '' }\`\n` : `\n${refs}\n`;
                     }).join('') + 'ㅤ'
               }
            ],
            footer: { text: `NewStart Life For Roleplay [${playerRef.user.customID}]` },
            timestamp: new Date()
         }]
      }
   });
}

// ---
async function factionSendLog(type, info, license) {
   const employee = license ? factions[info.key].refPlayers.find(p => p.user.license === license) : null;
   
   if (type === 'editPlayer') {
      const player = (await axios.get(`${URL}/users/${info.license}?filter=customID,character.identifier.name`)).data;
      let data = null;

      if (info.type === 'violations') data = { title: '📝 المخالفات والرسوم', value: `قام <@${employee.user.discord}> ← **بإعطاء "${info.item.title}" وقيمتها ${info.item.price.toLocaleString()}$**` };
      else if (info.type === 'records') data = { title: '📜 السجل الجنائي', value: `قام <@${employee.user.discord}> برتبة ${info.rankName} ← **بإعطاء سجل "${info.item.title}"**` };
      else if (info.type === 'status') data = { title: '🚨 الحالة الجنائية', value: `قام <@${employee.user.discord}> ← **${info.item.title ? `بإعطاء مطلوب "${info.item.title}"` : 'بإزالة المهتم من الطلب للعدالة'}**` };
      else if (info.type === 'jail') data = { title: '⚖️ السجون الفيدرالية', value: `قام <@${employee.user.discord}> ← **بإعطاء "${info.item.reason}" ← "${(info.item.duration / 60000).toFixed()}د"**` };

      await axios.post( `${URL}/other/discord_log`, { 
         type: 'embed', license, channel: factions[info.key].logID, 
         message: {
            embeds: [{
               fields: [
                  { name: 'نوع الإجراء', value: `\`\`\` ${data.title} \`\`\``, inline: true },
                  { name: 'هوية المتهم', value: `\`\`\` [${player.customID}] ${player.character.identifier.name} \`\`\``, inline: true },
                  { name: 'ㅤ', value: data.value }
               ]
            }]
         }
      });

   } else if (type === 'addVehWanted') {
      await axios.post( `${URL}/other/discord_log`, { 
         type: 'embed', license, channel: factions[info.key].logID, 
         message: {
            embeds: [{
               fields: [
                  { name: 'نوع الإجراء', value: '``` 🚨 الحالة الجنائية ```', inline: true },
                  { name: 'رقم اللوحة', value: `\`\`\` ${info.plate} \`\`\``, inline: true },
                  { name: 'ㅤ', value: `قام <@${employee.user.discord}> ← ${info.isRemove ? '**بجعل المركبة غير مطلوبة**' : '**بجعل المركبة مطلوبة للعدالة**'}` }
               ]
            }]
         }
      });

   } else if (type === 'inspection') {
      let data = null;

      if (info.type === 'player') {
         const player = (await axios.get(`${URL}/users/${info.license}?filter=customID,character.identifier.name`)).data;
         data = { title: 'هوية المتهم', value: `[${player.customID}] ${player.character.identifier.name}` };

      } else if (info.type === 'vehicle') {
         data = { title: 'لوحة المركبة', value: info.id };

      } else if (info.type === 'house') {
         data = { title: 'كود العقار', value: info.id };
      }

      await axios.post( `${URL}/other/discord_log`, { 
         type: 'embed', license, channel: factions[info.key].logID, 
         message: {
            embeds: [{
               fields: [
                  { name: 'نوع الإجراء', value: '``` 🚫 مصادرة الممنوعات ```', inline: true },
                  { name: data.title, value: `\`\`\` ${data.value} \`\`\``, inline: true },
                  { name: 'ㅤ', value: `:قام <@${employee.user.discord}> بمصادرة\n${info.items.map(i => `**${i.count} →** \`${i.name}\`\n`).join('')}` }
               ]
            }]
         }
      });
   } else if (type === 'taboosLog') {
      await axios.post( `${URL}/other/discord_log`, { 
         type: 'embed', license, channel: factions[info.key].logID, 
         message: {
            embeds: [{
               fields: [
                  { name: 'نوع الإجراء', value: '``` 📦 تسليم الممنوعات ```', inline: true },
                  { name: 'ㅤ', value: `:قام <@${employee.user.discord}> بتسليم\n${info.items.map(i => `**${i.count.toLocaleString()} →** \`${i.title}\`\n`).join('')}` }
               ]
            }]
         }
      });

   } else if (type === 'inventoryLog') { 
      await axios.post( `${URL}/other/discord_log`, { 
         type: 'embed', license, channel: factions[info.key].logID, 
         message: {
            embeds: [{
               fields: [
                  { name: 'نوع الإجراء', value: '``` 🚔 مركبات الوظيفة ```', inline: true },
                  { name: 'اسم المركبة', value: `\`\`\` ${info.vehName} \`\`\``, inline: true },
                  { name: 'ㅤ', value: `قام <@${employee.user.discord}> ← ${info.action === 'main' ? `بايداع ${info.title} ← (${info.count})` : `بسحب ${info.title} ← (${info.count})`}` }
               ]
            }]
         }
      });

   } else if (type === 'license') {
      const player = (await axios.get(`${URL}/users/${info.license}?filter=customID,character.identifier.name`)).data;
      const title = info.title === 'isWeapons' ? 'الأسلحة' : info.title === 'isCar' ? 'السيارات' : info.title === 'isMotor' ? 'الدراجات' : 'الشاحنات';

      await axios.post( `${URL}/other/discord_log`, { 
         type: 'embed', license, channel: factions[info.key].logID, 
         message: {
            embeds: [{
               fields: [
                  { name: 'نوع الإجراء', value: '``` 🪪 سحب رخصة ```', inline: true },
                  { name: 'هوية المتهم', value: `\`\`\` [${player.customID}] ${player.character.identifier.name} \`\`\``, inline: true },
                  { name: 'ㅤ', value: `قام <@${employee.user.discord}> بسحب رخصة ${title}` }
               ]
            }]
         }
      });

   } else if (type === 'online') {
      const refPlayers = factions[info.key].refPlayers.filter(i => i.serverID && GetPlayerName(i.serverID));
      const playersIn = refPlayers.filter(i => i.status === 'in').length;
      const playersOut = refPlayers.filter(i => i.status === 'out').length;
      
      await axios.post( `${URL}/other/discord_log`, { 
         type: 'embed', license, channel: factions[info.key].statusID, isEdit: true,
         message: {
            embeds: [{
               title: '`نيوستارت رول بلاي | NewStart Roleyplay`',
               description: 'ㅤ',
               url: 'https://newstart.one/',
               color: 2975143,
               fields: [
                  { name: 'المتصلين الآن', value: `\`\`\`🟩 [${playersIn + playersOut}] موظف     \`\`\``, inline: true },
                  { name: 'في الخدمة', value: `\`\`\`⬜️ [${playersIn}] موظف     \`\`\``, inline: true },
                  { name: 'خارج الخدمة', value: `\`\`\`🟥 [${playersOut}] موظف     \`\`\``, inline: true },
                  { name: 'تم التوزيع', value: `\`\`\`🟦 [${factionsParts[info.key].reduce((total, part) => total + (part.refID ? 1 : 0) + (part.refs?.length || 0), 0)}] موظف     \`\`\``, inline: true },
                  { name: 'إجمالي الأفراد المنتسبين', value: `\`\`\`${factions[info.key].refPlayers.length ? `[${factions[info.key].refPlayers.length}] موظف` : '-'}     \`\`\``, inline: true },
                  { 
                     name: 'ㅤ', 
                     value: refPlayers.length ? refPlayers.filter(i => i.status === 'in' || i.status === 'out')
                        .map(i => {
                           const status = i.status === 'out' ? '🟥' : factionsParts[info.key].some(p => p.refID === i.code || p.refs?.some(r => r.id === i.code)) ? '🟦' : '⬜️';
                           let time = Date.now() - i.login;
                           time = `${Math.floor(time / 3600000)}س ${Math.floor((time % 3600000) / 60000)}د`
                           
                           return `${time} → \`${factions[info.key].ranks.find(r => r.id === i.rankID).name}\` → <@${i.user.discord}> (${i.user.customID}) ${status}\n`
                        }).join('') + 'ㅤ' : `(لا يوجد أي موظف متاح الآن في ${factions[info.key].name})`
                  }
               ],
               footer: { text: 'NewStart Life For Roleplay' },
               timestamp: new Date()
            }]
         }
      }); 
   }
}