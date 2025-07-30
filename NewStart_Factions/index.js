/* ``````````` ## Development By el8rbawY ## ```````````*/
let informations = null, isFirst = true, inviteID = null;
const blips = [
   // { id: 60, name: '<font face="A9eelsh">ﺔﻃﺮﺸﻟﺍ ﺰﻛﺮﻣ</font>', x: 434.1494, y: -981.9824, z: 0 },
   { id: 60, name: '<font face="A9eelsh">ﺔﻃﺮﺸﻟﺍ ﺰﻛﺮﻣ</font>', x: -437.9208, y: 6013.6484, z: 32.27917 },
   { id: 60, name: '<font face="A9eelsh">ﺔﻃﺮﺸﻟﺍ ﺰﻛﺮﻣ</font>', x: 1854.9230, y: 3683.9077, z: 34.2506 },
   { id: 60, name: '<font face="A9eelsh">ﺕﺂﺸﻨﻤﻟﺍ ﻦﻣﺃ</font>', x: -3006.8176, y: 2685.9296, z: 9.4813 },
   // { id: 359, name: '<font face="A9eelsh">ﻮﺘﻴﻟﺎﺑ ﺭﺎﻄﻣ</font>', x: -199.8197, y: 6554.1625, z: 11.0820 },
   { id: 359, name: '<font face="A9eelsh">ﺯﺭﻮﺷ ﻱﺪﻧﺎﺳ ﺭﺎﻄﻣ</font>', x: 1706.2285, y: 3251.1164, z: 41.0747 },
   { id: 359, name: '<font face="A9eelsh">ﺪﻴﺴﺑﺍﺮﺟ ﺭﺎﻄﻣ</font>', x: 2160.3295, y: 4810.2197, z: 41.1589 },
   { id: 61, name: '<font face="A9eelsh">ﻲﻔﺸﺘﺴﻤﻟﺍ</font>', x: -252.0923, y: 6320.3208, z: 32.4139 },
   // { id: 61, name: '<font face="A9eelsh">ﻲﻔﺸﺘﺴﻤﻟﺍ</font>', x: 299.5252, y: -584.7296, z: 0 },
   { id: 61, name: '<font face="A9eelsh">ﻲﻔﺸﺘﺴﻤﻟﺍ</font>', x: 1838.6373, y: 3674.0439, z: 34.2674 },
   { id: 487, name: '<font face="A9eelsh">ﻱﺮﺤﺒﻟﺍ ﺀﺎﻨﻴﻤﻟﺍ</font>', x: -3076.9055, y: 2672.5847, z: 9.1611 },
   // { id: 304, name: '<font face="A9eelsh">ﺔﺤﻠﺴﻤﻟﺍ ﺕﺍﻮﻘﻟﺍ ﺮﻘﻣ</font>', x: -2303.4855, y: 3387.9956, z: 0 },
   { id: 58, name: '<font face="A9eelsh">ﻱﺰﻛﺮﻤﻟﺍ ﻦﺠﺴﻟﺍ</font>', x: 1850.9538, y: 2606.8088, z: 45.6072 }
];

// ---
on('playerSpawned', _=> {
   if (!isFirst) return;
   isFirst = false;

   for (let item of blips) {
      const blip = AddBlipForCoord(item.x, item.y, item.z);

      if (item.id === 487) SetBlipScale(blip, 1.3);
      SetBlipSprite(blip, item.id);
      SetBlipAsShortRange(blip, true);
      BeginTextCommandSetBlipName("STRING");
      AddTextComponentString(item.name);
      EndTextCommandSetBlipName(blip);
   }
});

// ---
// RegisterCommand('gift', () => {
//    if (!informations) return;
//    const hash = informations.key === 'health' ? 'emsnspeedo' : informations.rankID < 17 ? 'tr16fpiubb' : 'w11cvpipbb'; 

//    if (exports.NewStart_Employee.method('getVehInfo', hash, true).count) {
//       exports.NewStart_Employee.method('zeroPriceVeh', hash);
//       emitNet('NewStart_Factions:general-server', JSON.stringify({ type: 'vehicle', jobID: informations.id, hash }));
//       exports.NewStart_Notifications.showAttention('success', 'لقد حصلت على مكافأة الافتتاح لمنتسبي الوظائف المعتمدة!');
//       emitNet('NewStart_PoliceTools:handleGeneral-server', 'gift');
      
//    } else {
//       exports.NewStart_Notifications.showAttention('error', 'لقد حصلت على المكافأة الخاصة بك بالفعل!');
//    }
// }, false);

// ---
RegisterCommand('+factions', _=> {
   if (informations && !IsPauseMenuActive() && !exports.NewStart_PoliceTools.method('info').isPolmav) {
      emitNet('NewStart_Factions:initial-server', informations.id);
      toggleScreen(true);
      SetNuiFocus(true, true);
      SendNUIMessage(JSON.stringify({ type: 'openUI' }));
   }
}, false);

RegisterKeyMapping('+factions', 'Factions', 'keyboard', 'f3');

// ---
RegisterNuiCallbackType('NUI:update');

on('__cfx_nui:NUI:update', (data, cb) => {
   switch (data.type) {
      case 'handleFaction':
         if (data.action === 'rankUpdate') {
            emitNet(
               'NewStart_Factions:general-server', 
               JSON.stringify({ type: 'ranks', id: informations.id, ranks: data.items, players: data.players }
            ));
         }
         break;

      case 'handleUser': // vacation, rankID, send invite, code
         const info = { type: data.action, id: informations.id, customID: data.customID, name: data.name, key: informations.key };

         if (info.type === 'promotion') info.rankID = data.rankID; 
         else if (info.type === 'vacation') info.isReset = data.isReset;
         else if (info.type === 'code') info.value = data.value;

         emitNet('NewStart_Factions:userUpdate-server', info);
         break;

      case 'inviteAccept':      
         emitNet('NewStart_Factions:join-server', inviteID);
         SetNuiFocus(false, false);
         inviteID = null;
         break;
         
      case 'resignation':
         emitNet('NewStart_Factions:userDelete-server', { type: 'resignation', id: informations.id });
         quitFaction();
         break;

      case 'kick':
         if (data.isCurrent) {
            toggleScreen(false);
            SetNuiFocus(false, false);
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
         }

         emitNet('NewStart_Factions:userDelete-server', { type: 'kick', id: informations.id, customID: data.customID });
         break;

      case 'codes': emitNet('NewStart_Factions:general-server', JSON.stringify({ type: 'codes', id: informations.id })); break;
      case 'notification': exports.NewStart_Notifications.showAttention('error', data.text); break;
      case 'toggleScreen': toggleScreen(data.value); break;

      default: 
         SetNuiFocus(false, false); // closeUI
         toggleScreen(false);
   }

   cb('OK!');
});

// ---
exports('info', isPlayers => isPlayers ? [] : informations);

// --- 
exports('method', (type, data) => {
   if (type === 'isSecurityKey') {
      return ['police', 'facilities'].includes(informations?.key);
   }
});

// --- 
exports('closeUI', _=> {
   toggleScreen(false);
   SetNuiFocus(false, false);
   SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
});