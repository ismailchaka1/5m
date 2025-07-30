/* ``````````` ## Development By el8rbawY ## ```````````*/
let lastText = '', textID = 0;

// ---
function handleAttention(type, text) {
   if (lastText !== text) {
      exports.NewStart_MainMenu.method('setNoticesHistory', { type, text });

      if (!IsEntityDead(PlayerPedId())) {
         SendNUIMessage({ type: 'attention', action: type, text });
         lastText = text;
         clearTimeout(textID);
         textID = setTimeout(_=> { lastText = '' }, 15500); // and edit in ui => + 500ms
      }
   }
}

// ---
onNet('NewStart_Notifications:showAttention-client', handleAttention);
exports('showAttention', handleAttention);

// ---
exports('sendAlert', text => {
   SendNUIMessage({ type: 'alert', text });
   exports.NewStart_HudSystem.method('setStateNUI', { zoneType: '' });
});

// ---
RegisterNuiCallbackType('NUI:update');

on('__cfx_nui:NUI:update', (data, cb) => {   
   if (data.type === 'showOtherUI') {
      const zoneType = exports.NewStart_Tools.method('getInfo').zoneType;
      if (zoneType) exports.NewStart_HudSystem.method('setStateNUI', { zoneType });
   }

   cb('OK!');
});