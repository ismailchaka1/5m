/* ``````````` ## Development By el8rbawY ## ```````````*/
const state = { adminRole: null, spectate: {}, goPlaceTimeID: 0, isComfort: false, isDoubleTaboo: false };
const blips = [
   // { id: 127, name: '<font face="A9eelsh">ﺕﺎﺟﺍﺭﺪﻟﺍ ﻕﺎﺒﺳ</font>', x: -598.6153, y: 5719.6352, z: 36.5252 },
   // { id: 379, name: '<font face="A9eelsh">ﺔﻤﻛﻼﻣ ﺔﺒﻠﺣ</font>', x: -510.9494, y: -1721.7626, z: 19.3216 }
];

// ---
on('onClientGameTypeStart', _=> { 
   SendNUIMessage(JSON.stringify({ type: 'initial', general: config.general }));

   for (let item of blips) {
      const blip = AddBlipForCoord(item.x, item.y, item.z);

      SetBlipSprite(blip, item.id);
      BeginTextCommandSetBlipName("STRING");
      AddTextComponentString(item.name);
      EndTextCommandSetBlipName(blip);
      SetBlipAsShortRange(blip, true);
      // SetBlipColour(blip, 0);
   }
});

// ---
RegisterCommand('+admin', () => { ExecuteCommand('admin') }, false);
RegisterKeyMapping('+admin', 'Admin Panel', 'keyboard', 'f12');

// ---
onNet('NewStart_Admin:openUI-client', (info, isUpdate) => {
   if (Object.keys(state.spectate).length) return;
   if (info) info = JSON.parse(info);

   if (!info?.adminRole) {
      state.isOpen = false;
      SetNuiFocus(false, false);
      SendNUIMessage(JSON.stringify({ type: 'closeUI', noRole: true }));
      return;

   } else if (!isUpdate) {
      SetNuiFocus(true, true);
      
      for (let item of info.players) {
         item.level = exports.NewStart_MainMenu.getLevel(item.level);
      }
   } 
   
   if (info.adminRole) state.adminRole = info.adminRole;
   state.isOpen = true;
   SendNUIMessage(JSON.stringify({ type: 'openUI', info, isUpdate }));
});

// ---
RegisterNuiCallbackType('NUI:update');

on('__cfx_nui:NUI:update', (data, cb) => {
   switch(data.type) {
      case 'general':
         const isAdmin = config.general.find(obj => obj.name === data.action).allow.includes(state.adminRole);
         if (!isAdmin && state.adminRole !== 'founder') return cb('OK!');

         if (data.action === 'waypoint') {
            goToWaypoint(data.value);

         } else if (data.action === 'godMode') {
            const pedID = PlayerPedId();

            if (data.value) {
               SetEntityHealth(pedID, 200);
               state.godMode = setTick(_=> { SetEntityInvincible(pedID, true); });
               emitNet('NewStart_Admin:handleGeneral-sevrer', { message: `← باستعمال الوضع الخارق\nالسبب: ${data.value}` });

            } else {
               clearTick(state.godMode);
               SetEntityInvincible(pedID, false);
            }

         } else if (data.action === 'invisibility') {
            invisibility(!!data.value);
            if (data.value) emitNet('NewStart_Admin:handleGeneral-sevrer', { message: `← باستعمال الاختفاء\nالسبب: ${data.value}` });

         } else {
            emitNet('NewStart_Admin:handleGeneral-sevrer', data);
         }
         break;

      case 'players':
         if (data.action === 'spectate') {
            if (data.isEnd) {
               SetNuiFocus(true, true);
               endSpectate();

            } else {
               state.spectate.complement = true;
               emitNet('NewStart_Admin:handlePlayer-sevrer', JSON.stringify(data));
            }
            
         } else {
            emitNet('NewStart_Admin:handlePlayer-sevrer', JSON.stringify(data));
         }
         break;

      case 'hideCursor': 
         if (!Object.keys(state.spectate).length) SetNuiFocus(false, false); 
         break;
      case 'notifications':
         exports.NewStart_Notifications.showAttention(data.action, data.text);
         break;

      default: // closeUI
         SetNuiFocus(false, false);
         state.isOpen = false;
         if (state.spectate.isActive || state.spectate.complement) endSpectate();
   }

   cb('OK!');
});

// ---
exports('method', type => {
   if (type === 'info') {
      return { isGoPlace: !!state.goPlaceTimeID, isComfort: state.isComfort, isDoubleTaboo: state.isDoubleTaboo };

   } else if (type === 'isOpen') {
      return state.isOpen;

   } else if (type === 'showCursor') {
      SetNuiFocus(true, true);

   } else { // closeUI
      state.isOpen = false;
      SetNuiFocus(false, false);
      SendNUIMessage(JSON.stringify({ type: 'closeUI' }));

      if (state.spectate.isActive || state.spectate.complement) endSpectate();
   }
});

// ---
exports('adminRole', () => state.adminRole);